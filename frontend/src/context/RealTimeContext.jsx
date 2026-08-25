// Real-Time MongoDB Context Provider
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { onlineService } from "../services/onlineService";
import { workoutSync } from "../services/workoutSync";
import { realTimeWorkoutSync } from "../services/realTimeWorkoutSync";
import { detectInfiniteLoop } from "../utils/emergencyReset";
import api from "../utils/api";

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error("useRealTime must be used within a RealTimeProvider");
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    workouts: 0,
    meals: 0,
    totalWorkouts: 0,
    totalMeals: 0,
    todayWorkouts: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    weeklyGoal: { completed: 0, target: 4, percentage: 0 },
    isRealTime: false,
    lastSync: null,
    dataSource: "Loading",
  });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load workout stats from local cache (only for instant UI while API loads)
  const loadWorkoutStats = useCallback(() => {
    try {
      if (!isAuthenticated() || !user) {
        return {
          workouts: 0,
          totalWorkouts: 0,
          todayWorkouts: 0,
          weeklyWorkouts: 0,
          monthlyWorkouts: 0,
          totalCalories: 0,
          totalDuration: 0,
          totalPlans: 0,
          isRealTime: false,
          lastSync: new Date().toISOString(),
          dataSource: "No User",
        };
      }

      // We read from local cache just to prevent empty UI while fetching.
      // But we will NO LONGER use this as the source of truth if API is available.
      const realtimeStats = realTimeWorkoutSync.getStats();

      const plans = JSON.parse(localStorage.getItem("workoutPlans") || "[]");
      const userPlans = plans.filter((plan) => {
        return (
          plan.userId === user.id ||
          plan.userId === user._id ||
          (!plan.userId && plan.synced === false)
        );
      });

      return {
        workouts: realtimeStats.todayWorkouts || 0,
        totalWorkouts: realtimeStats.totalWorkouts || 0,
        todayWorkouts: realtimeStats.todayWorkouts || 0,
        weeklyWorkouts: realtimeStats.weeklyWorkouts || 0,
        monthlyWorkouts: realtimeStats.monthlyWorkouts || 0,
        totalCalories: realtimeStats.totalCalories || 0,
        totalDuration: realtimeStats.totalDuration || 0,
        totalPlans: userPlans.length,
        isRealTime: false, // Mark as false since it's local
        lastSync: realtimeStats.lastUpdate || new Date().toISOString(),
        dataSource: `User-${user.id}-LocalCache`,
      };
    } catch (error) {
      return {
        workouts: 0,
        totalWorkouts: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        totalPlans: 0,
        isRealTime: false,
        lastSync: new Date().toISOString(),
        dataSource: "Error",
      };
    }
  }, [user, isAuthenticated]);

  // Fetch real-time stats from MongoDB with instant sync
  const fetchRealTimeStats = useCallback(async () => {
    if (!isAuthenticated() || !user) {
      console.log("🔒 User not authenticated, setting zero stats");
      setStats({
        workouts: 0,
        meals: 0,
        totalWorkouts: 0,
        totalMeals: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        weeklyGoal: { completed: 0, target: 4, percentage: 0 },
        isRealTime: false,
        lastSync: new Date().toISOString(),
        dataSource: "No User",
      });
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Fetching real-time MongoDB stats...");
      const localStats = loadWorkoutStats();

      // Show local immediately if we don't have stats yet, but don't override existing fresh stats with local
      setStats((prev) => prev.isRealTime ? prev : { ...prev, ...localStats });

      // Fetch from MongoDB
      const [heroStatsRes, workoutsRes] = await Promise.allSettled([
        api.get("/analytics/hero-stats"),
        api.get("/workouts")
      ]);

      let realTimeData = {
        ...localStats,
        isRealTime: true,
        dataSource: "MongoDB API",
      };

      // Apply hero stats (which has total workouts, meals, streaks)
      if (heroStatsRes.status === "fulfilled" && heroStatsRes.value?.data?.data) {
        const hData = heroStatsRes.value.data.data;
        realTimeData = {
          ...realTimeData,
          totalWorkouts: hData.totalWorkouts || 0,
          workouts: hData.totalWorkouts || 0,
          meals: hData.meals || 0,
          totalMeals: hData.totalMeals || 0,
          weeklyGoal: hData.weeklyGoal || realTimeData.weeklyGoal,
        };
      }

      // Process MongoDB workout data for accurate today/weekly counts and calories
      if (workoutsRes.status === "fulfilled" && workoutsRes.value?.data) {
        let mongoWorkouts = workoutsRes.value.data;
        if (mongoWorkouts.workouts) {
          mongoWorkouts = mongoWorkouts.workouts;
        }
        if (Array.isArray(mongoWorkouts)) {
          const currentUserId = (user?.id || user?._id || '')?.toString();
          const userMongoWorkouts = mongoWorkouts.filter(w => {
            if (!w) return false;
            const isCompleted = w.completed === true || w.status === 'completed';
            if (!isCompleted) return false;
            
            const wUserId = (w.user?._id || w.user?.id || w.user || w.userId || '')?.toString();
            return !currentUserId || !wUserId || wUserId === currentUserId;
          });

          const today = new Date().toDateString();
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

          const mongoTodayWorkouts = userMongoWorkouts.filter((w) => {
            const wDate = new Date(w.completedAt || w.createdAt || w.date);
            return !isNaN(wDate.getTime()) && wDate.toDateString() === today;
          }).length;

          const mongoWeeklyWorkouts = userMongoWorkouts.filter((w) => {
            const wDate = new Date(w.completedAt || w.createdAt || w.date);
            return !isNaN(wDate.getTime()) && wDate >= weekAgo;
          }).length;

          const mongoTotalCalories = userMongoWorkouts.reduce(
            (sum, w) => sum + (w.calories || w.caloriesBurned || 0),
            0
          );
          
          const mongoTotalDuration = userMongoWorkouts.reduce(
            (sum, w) => sum + (w.durationMinutes || w.duration || 0),
            0
          );

          realTimeData = {
            ...realTimeData,
            totalWorkouts: userMongoWorkouts.length,
            workouts: userMongoWorkouts.length,
            todayWorkouts: mongoTodayWorkouts,
            weeklyWorkouts: mongoWeeklyWorkouts,
            totalCalories: mongoTotalCalories,
            totalDuration: mongoTotalDuration,
          };
        }
      }

      console.log("✅ Real-time MongoDB sync complete:", realTimeData);
      setStats(realTimeData);
      setIsOnline(true);
      setLastUpdate(new Date());

      // Broadcast update to all pages
      window.dispatchEvent(
        new CustomEvent("realTimeStatsSync", {
          detail: realTimeData,
        }),
      );
    } catch (error) {
      console.error("❌ MongoDB sync failed, using local data:", error.message);
      const localStats = loadWorkoutStats();
      setStats((prev) => ({
        ...prev,
        ...localStats,
        isRealTime: false,
        dataSource: "localStorage (MongoDB failed)",
        error: error.message,
      }));
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, loadWorkoutStats]);

  // Initialize and load stats immediately - USER SPECIFIC
  useEffect(() => {
    // Always set loading to false first
    setLoading(false);

    // Only proceed if user is authenticated
    if (!isAuthenticated() || !user) {
      console.log("🔒 No authenticated user - setting zero stats");
      setStats({
        workouts: 0,
        meals: 0,
        totalWorkouts: 0,
        totalMeals: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        weeklyGoal: { completed: 0, target: 4, percentage: 0 },
        isRealTime: false,
        lastSync: new Date().toISOString(),
        dataSource: "No User",
      });
      return;
    }

    console.log(`🚀 Initializing stats for user: ${user.id}`);

    // Clear all localStorage workout caches to prevent fake/stale data from appearing.
    // MongoDB is the single source of truth — stats will be fetched from there.
    try {
      localStorage.removeItem("workoutSync_workouts");
      localStorage.removeItem("workoutSync_stats");
      localStorage.removeItem("realtime_workouts");
      localStorage.removeItem("completed_workouts");
      localStorage.removeItem("workout_stats");
      console.log("🧹 Cleared local workout caches");
    } catch (e) {
      // Ignore localStorage errors
    }

    // Automatically trigger backend cleanup of any existing duplicate workouts
    if (navigator.onLine) {
      api.post('/workouts/cleanup-duplicates')
        .then(res => {
          if (res.data?.success && res.data?.details?.length > 0) {
            console.log("🧹 Auto-cleaned duplicates from MongoDB:", res.data);
            // Fetch fresh stats after cleaning up
            fetchRealTimeStats();
          }
        })
        .catch(err => console.warn("Failed to clean duplicates:", err));
    }

    // Subscribe to real-time updates (from local interactions)
    const unsubscribe = realTimeWorkoutSync.subscribe((newStats) => {
      if (!user) return;
      // We'll just fetch real time stats instead of relying on the local sync service directly,
      // but debounce it to prevent spamming the backend
      setTimeout(() => {
          fetchRealTimeStats();
      }, 500);
    });

    // Initialize Server-Sent Events (SSE) for True Instant Cross-Device Sync
    let sse;
    const token = localStorage.getItem("token");
    if (user && token && navigator.onLine) {
      const baseUrl = api.defaults.baseURL;
      sse = new EventSource(`${baseUrl}/sse/stream?token=${token}`);

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "workout_updated") {
            console.log("⚡ SSE Push Received: Workout updated on another device! Refreshing stats...");
            fetchRealTimeStats();
            
            // Also notify other components (like CompletedWorkouts list) to refresh
            window.dispatchEvent(new CustomEvent("refreshCompletedWorkouts"));
          } else if (data.type === "connected") {
            console.log("🔗 SSE Connection established with backend");
          }
        } catch (error) {
          console.error("Error parsing SSE data:", error);
        }
      };

      sse.onerror = (error) => {
        console.warn("SSE connection error, it will auto-reconnect", error);
      };
    }

    // Then fetch from MongoDB
    fetchRealTimeStats();

    return () => {
      if (unsubscribe) unsubscribe();
      if (sse) sse.close();
    };
  }, [user, isAuthenticated, fetchRealTimeStats]); // loadWorkoutStats removed from deps since it's inside fetch

  // Listen for real-time events
  useEffect(() => {
    let isProcessingWorkout = false;

    const handleWorkoutCompleted = (event) => {
      // Detect infinite loop
      if (detectInfiniteLoop("handleWorkoutCompleted")) {
        return;
      }

      // Prevent infinite loop
      if (isProcessingWorkout) {
        console.log("⚠️ Workout completion already in progress, skipping");
        return;
      }

      isProcessingWorkout = true;
      console.log("🏋️ Workout completed - refreshing stats only");

      try {
        // Only refresh stats, don't add workout again to prevent loop
        realTimeWorkoutSync.refreshStats();
        console.log("✅ Workout completion processed");
      } finally {
        // Reset flag after processing
        setTimeout(() => {
          isProcessingWorkout = false;
        }, 1000);
      }
    };

    const handleMealAdded = () => {
      console.log("🍽️ Meal added - refreshing stats");
      setTimeout(fetchRealTimeStats, 1000);
    };

    const handleMealDeleted = () => {
      console.log("🗑️ Meal deleted - refreshing stats");
      setTimeout(fetchRealTimeStats, 1000);
    };

    const handlePlanCreated = () => {
      console.log("📋 Plan created - refreshing stats");
      // Update plans count immediately
      const freshStats = loadWorkoutStats();
      setStats((prev) => ({
        ...prev,
        totalPlans: freshStats.totalPlans,
        lastSync: new Date().toISOString(),
        dataSource: "Plan Created Update",
      }));
      setTimeout(fetchRealTimeStats, 1000);
    };

    // WORKOUT COMPLETION STATS UPDATE
    const handleWorkoutStatsUpdate = (event) => {
      console.log("💪 Real-time workout stats update received, refetching from MongoDB");
      // Fetch fresh stats from API since a workout completed
      setTimeout(fetchRealTimeStats, 500);
    };

    // Real-time MongoDB sync handler
    const handleRealTimeSync = (event) => {
      console.log("🔄 Real-time sync event received:", event.detail);
      if (event.detail) {
        setStats((prev) => ({
          ...prev,
          ...event.detail,
          lastSync: new Date().toISOString(),
          isRealTime: true,
        }));
      }
    };

    // Listen for user logout to clear stats
    const handleUserLogout = () => {
      console.log("👤 User logged out - clearing all stats");
      setStats({
        workouts: 0,
        meals: 0,
        totalWorkouts: 0,
        totalMeals: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        weeklyGoal: { completed: 0, target: 4, percentage: 0 },
        isRealTime: false,
        lastSync: new Date().toISOString(),
        dataSource: "User Logged Out",
      });
    };

    // Listen for custom events
    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    window.addEventListener("realTimeStatsUpdate", handleWorkoutStatsUpdate);
    window.addEventListener("realTimeStatsSync", handleRealTimeSync);
    window.addEventListener("mealAdded", handleMealAdded);
    window.addEventListener("mealDeleted", handleMealDeleted);
    window.addEventListener("planCreated", handlePlanCreated);
    window.addEventListener("userLoggedOut", handleUserLogout);

    // Also listen for plan updates to refresh totalPlans immediately
    const handlePlanUpdate = () => {
      console.log("📋 Plan updated - refreshing plans count");
      setTimeout(fetchRealTimeStats, 500);
    };

    // Add visibility and online listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
         console.log("👁️ Tab visible again, refetching stats");
         fetchRealTimeStats();
      }
    };
    const handleOnline = () => {
      console.log("🌐 Network online, refetching stats");
      fetchRealTimeStats();
    };

    window.addEventListener("planUpdated", handlePlanUpdate);
    window.addEventListener("planDeleted", handlePlanUpdate);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
      window.removeEventListener(
        "realTimeStatsUpdate",
        handleWorkoutStatsUpdate,
      );
      window.removeEventListener("realTimeStatsSync", handleRealTimeSync);
      window.removeEventListener("mealAdded", handleMealAdded);
      window.removeEventListener("mealDeleted", handleMealDeleted);
      window.removeEventListener("planCreated", handlePlanCreated);
      window.removeEventListener("planUpdated", handlePlanUpdate);
      window.removeEventListener("planDeleted", handlePlanUpdate);
      window.removeEventListener("userLoggedOut", handleUserLogout);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [fetchRealTimeStats, loadWorkoutStats]);

  // Manual refresh function
  const refreshStats = useCallback(async () => {
    console.log("🔄 Manual stats refresh requested");
    await fetchRealTimeStats();
  }, [fetchRealTimeStats]);

  // Update single stat (for optimistic updates)
  const updateStat = useCallback((statName, value) => {
    setStats((prev) => ({
      ...prev,
      [statName]: value,
      lastSync: new Date().toISOString(),
    }));
  }, []);

  // Update workout stats (for real-time workout completion)
  const updateWorkoutStats = useCallback(() => {
    // Rely on fetchRealTimeStats instead of loadWorkoutStats
    fetchRealTimeStats();
  }, [fetchRealTimeStats]);

  // Add completed workout (for real-time updates)
  const addCompletedWorkout = useCallback((workoutData) => {
    const newWorkout = realTimeWorkoutSync.addCompletedWorkout(workoutData);

    // Stats will be updated automatically via subscription
    console.log(
      "✅ REAL-TIME: Workout added via RealTimeWorkoutSync:",
      newWorkout,
    );
    return newWorkout;
  }, []);

  // Increment stat (for real-time updates)
  const incrementStat = useCallback((statName, increment = 1) => {
    setStats((prev) => ({
      ...prev,
      [statName]: (prev[statName] || 0) + increment,
      lastSync: new Date().toISOString(),
    }));
  }, []);

  const value = {
    stats,
    isOnline,
    loading,
    lastUpdate,
    refreshStats,
    triggerUpdate: refreshStats,
    updateStat,
    incrementStat,
    updateWorkoutStats,
    addCompletedWorkout,
    loadWorkoutStats,
    fetchRealTimeStats,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

export default RealTimeProvider;
