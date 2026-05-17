// Real-Time Workout Synchronization Service
// Handles instant updates across Home, Dashboard, Analytics, and Workouts pages

class RealTimeWorkoutSync {
  constructor() {
    this.listeners = new Set();
    this.lastWorkoutAdd = 0;
    this.lastDispatchTime = 0;
    this.circuitBreaker = { count: 0, lastReset: Date.now() };
    this.stats = {
      totalWorkouts: 0,
      todayWorkouts: 0,
      weeklyWorkouts: 0,
      monthlyWorkouts: 0,
      totalCalories: 0,
      totalDuration: 0,
      lastUpdate: null,
    };

    // Initialize stats on startup - but only if user is authenticated
    setTimeout(() => {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        console.log(`🚀 Initializing stats for user: ${currentUser.id}`);
        this.refreshStats();
      } else {
        console.log("🔒 No user authenticated - keeping zero stats");
      }
    }, 100);

    // Listen for storage changes from other tabs
    window.addEventListener("storage", (e) => {
      if (e.key === "workoutSync_workouts") {
        this.refreshStats();
        this.broadcastUpdate();
      }
    });

    // Listen for user login/logout events
    window.addEventListener("userDataInitialized", () => {
      console.log("👤 User data initialized - refreshing stats");
      this.refreshStats();
      this.broadcastUpdate();
    });

    window.addEventListener("userLoggedOut", () => {
      console.log("👤 User logged out - clearing ALL workout data");
      // CRITICAL: Clear ALL workout data on logout
      localStorage.removeItem("workoutSync_workouts");
      localStorage.removeItem("mongodb_workouts_cache");
      this.stats = {
        totalWorkouts: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        lastUpdate: new Date().toISOString(),
      };
      this.broadcastUpdate();
    });
  }

  // Get current stats - ensure user-specific
  getStats() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      console.log("🔒 No authenticated user - returning zero stats");
      return {
        totalWorkouts: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        lastUpdate: new Date().toISOString(),
      };
    }
    return { ...this.stats };
  }

  // Refresh stats from all data sources
  refreshStats() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log("🔒 No authenticated user - setting zero stats");
        this.stats = {
          totalWorkouts: 0,
          todayWorkouts: 0,
          weeklyWorkouts: 0,
          monthlyWorkouts: 0,
          totalCalories: 0,
          totalDuration: 0,
          lastUpdate: new Date().toISOString(),
        };
        return this.stats;
      }

      // Clean fake workouts first
      this.cleanFakeWorkouts();

      // Get workouts from workoutSync service
      const workoutSyncData = this.getWorkoutSyncData();

      // Get workouts from MongoDB/API (if available)
      const mongoData = this.getMongoWorkouts();

      // Combine and calculate stats
      const allWorkouts = [...workoutSyncData, ...mongoData];
      const uniqueWorkouts = this.deduplicateWorkouts(allWorkouts);

      this.stats = this.calculateStats(uniqueWorkouts);
      this.stats.lastUpdate = new Date().toISOString();

      console.log(
        `📊 RealTimeWorkoutSync: Stats refreshed for user ${currentUser.id}:`,
        this.stats,
      );

      return this.stats;
    } catch (error) {
      console.error("❌ Error refreshing workout stats:", error);
      return this.stats;
    }
  }

  // Get workouts from workoutSync service - USER SPECIFIC ONLY
  getWorkoutSyncData() {
    try {
      // Get current user from auth context
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log("🔒 No authenticated user - returning empty workouts");
        return [];
      }

      const workouts = JSON.parse(
        localStorage.getItem("workoutSync_workouts") || "[]",
      );

      // Filter by current user ID and only completed workouts
      const userWorkouts = workouts.filter((w) => {
        const isCompleted = w.completed && w.completedAt;
        const isUserWorkout =
          w.userId === currentUser.id || w.userId === currentUser._id;

        // If no userId is set, assume it's from current user (backward compatibility)
        const belongsToCurrentUser =
          isUserWorkout || (!w.userId && isCompleted);

        return isCompleted && belongsToCurrentUser;
      });

      console.log(
        `📊 User ${currentUser.id} has ${userWorkouts.length} completed workouts`,
      );
      return userWorkouts;
    } catch (error) {
      console.warn("⚠️ Error loading workoutSync data:", error);
      return [];
    }
  }

  // Get workouts from MongoDB/API cache - USER SPECIFIC
  getMongoWorkouts() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log("🔒 No authenticated user - no MongoDB workouts");
        return [];
      }

      // Check for cached MongoDB data
      const cached = localStorage.getItem("mongodb_workouts_cache");
      if (cached) {
        const data = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(data.timestamp).getTime();

        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          // Filter by current user
          const userWorkouts = data.workouts.filter((w) => {
            const isCompleted = w.completed || w.completedAt;
            const belongsToUser =
              w.user === currentUser.id ||
              w.user === currentUser._id ||
              w.userId === currentUser.id ||
              w.userId === currentUser._id;
            return isCompleted && belongsToUser;
          });

          console.log(
            `📊 MongoDB cache: ${userWorkouts.length} workouts for user ${currentUser.id}`,
          );
          return userWorkouts;
        }
      }
      return [];
    } catch (error) {
      console.warn("⚠️ Error loading MongoDB cache:", error);
      return [];
    }
  }

  // Remove duplicate workouts
  deduplicateWorkouts(workouts) {
    const seen = new Set();
    return workouts.filter((workout) => {
      const key = `${workout.id || workout._id || workout.exercise}_${workout.completedAt}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Calculate stats from workouts
  calculateStats(workouts) {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayWorkouts = workouts.filter(
      (w) => new Date(w.completedAt).toDateString() === today,
    ).length;

    const weeklyWorkouts = workouts.filter(
      (w) => new Date(w.completedAt) >= weekAgo,
    ).length;

    const monthlyWorkouts = workouts.filter(
      (w) => new Date(w.completedAt) >= monthAgo,
    ).length;

    const totalCalories = workouts.reduce(
      (sum, w) => sum + (w.caloriesBurned || w.calories || 0),
      0,
    );

    const totalDuration = workouts.reduce(
      (sum, w) => sum + (w.duration || 0),
      0,
    );

    return {
      totalWorkouts: workouts.length,
      todayWorkouts,
      weeklyWorkouts,
      monthlyWorkouts,
      totalCalories,
      totalDuration,
    };
  }

  // Add a completed workout and update stats - USER SPECIFIC WITH RATE LIMITING
  addCompletedWorkout(workoutData) {
    try {
      // Rate limiting - prevent rapid successive calls
      const now = Date.now();
      if (this.lastWorkoutAdd && now - this.lastWorkoutAdd < 3000) {
        console.log("⚠️ Rate limited: Workout add too frequent, skipping");
        return null;
      }
      this.lastWorkoutAdd = now;

      // Get current user
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log("🔒 No authenticated user - cannot save workout");
        return null;
      }

      // Validate workout data - reject fake/empty workouts
      if (
        !workoutData.exercise ||
        workoutData.exercise === "Workout" ||
        (!workoutData.duration && !workoutData.caloriesBurned) ||
        (workoutData.duration === 0 && workoutData.caloriesBurned === 0)
      ) {
        console.log(
          "⚠️ RealTimeWorkoutSync: Invalid workout data rejected:",
          workoutData,
        );
        return null;
      }

      // Ensure workout has required fields + USER ID
      const workout = {
        id:
          workoutData.id ||
          `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: currentUser.id || currentUser._id, // CRITICAL: Associate with current user
        exercise: workoutData.exercise,
        completed: true,
        completedAt: workoutData.completedAt || new Date().toISOString(),
        duration: workoutData.duration || 0,
        caloriesBurned: workoutData.caloriesBurned || workoutData.calories || 0,
        sets: workoutData.sets || 0,
        reps: workoutData.reps || 0,
        category: workoutData.category || "General",
        difficulty: workoutData.difficulty || "Intermediate",
        notes: workoutData.notes || "",
        savedOffline: workoutData.savedOffline || false,
        synced: workoutData.synced !== false,
        ...workoutData,
      };

      // Add to workoutSync storage
      const existingWorkouts = JSON.parse(
        localStorage.getItem("workoutSync_workouts") || "[]",
      );

      // Enhanced duplicate check
      const exists = existingWorkouts.some(
        (w) =>
          w.id === workout.id ||
          (w.exercise === workout.exercise &&
            Math.abs(new Date(w.completedAt) - new Date(workout.completedAt)) <
              5000), // 5 second window
      );

      if (!exists) {
        existingWorkouts.unshift(workout);
        localStorage.setItem(
          "workoutSync_workouts",
          JSON.stringify(existingWorkouts),
        );

        // Refresh stats immediately
        this.refreshStats();

        // Broadcast to all listeners
        this.broadcastUpdate();

        // Dispatch custom events for different pages
        this.dispatchWorkoutCompleted(workout);

        console.log(
          "✅ RealTimeWorkoutSync: Workout added and synced:",
          workout,
        );
        return workout;
      } else {
        console.log(
          "⚠️ RealTimeWorkoutSync: Duplicate workout skipped:",
          workout,
        );
        return null;
      }
    } catch (error) {
      console.error("❌ Error adding completed workout:", error);
      return null;
    }
  }

  // Dispatch workout completion events to all pages - WITH CIRCUIT BREAKER
  dispatchWorkoutCompleted(workout) {
    // Circuit breaker - prevent infinite loops
    const now = Date.now();
    if (now - this.circuitBreaker.lastReset > 10000) {
      this.circuitBreaker.count = 0;
      this.circuitBreaker.lastReset = now;
    }

    this.circuitBreaker.count++;
    if (this.circuitBreaker.count > 5) {
      console.error(
        "⚠️ CIRCUIT BREAKER: Too many dispatch calls, stopping to prevent infinite loop",
      );
      return;
    }

    // Prevent rapid-fire dispatching
    if (this.lastDispatchTime && now - this.lastDispatchTime < 2000) {
      console.log("⚠️ Dispatch throttled to prevent spam");
      return;
    }

    this.lastDispatchTime = now;

    const events = [
      "realTimeStatsUpdate",
      "homeStatsUpdate",
      "dashboardStatsUpdate",
      "analyticsStatsUpdate",
      "workoutsPageUpdate",
      // Removed 'workoutCompleted' to prevent infinite loop
    ];

    events.forEach((eventName) => {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: {
            workout,
            stats: this.stats,
            timestamp: new Date().toISOString(),
          },
        }),
      );
    });

    console.log("📡 RealTimeWorkoutSync: Events dispatched (throttled)");
  }

  // Broadcast stats update to all listeners
  broadcastUpdate() {
    this.listeners.forEach((callback) => {
      try {
        callback(this.stats);
      } catch (error) {
        console.error("❌ Error in stats listener:", error);
      }
    });

    // Dispatch general stats update event
    window.dispatchEvent(
      new CustomEvent("realTimeStatsSync", {
        detail: this.stats,
      }),
    );
  }

  // Subscribe to stats updates
  subscribe(callback) {
    this.listeners.add(callback);

    // Immediately call with current stats
    callback(this.stats);

    return () => {
      this.listeners.delete(callback);
    };
  }

  // Force refresh from all sources
  async forceRefresh() {
    try {
      console.log("🔄 RealTimeWorkoutSync: Force refresh initiated");

      // Try to fetch fresh data from API if available
      if (window.api) {
        try {
          const response = await window.api.get("/workouts");
          if (response.data && Array.isArray(response.data)) {
            // Cache MongoDB data
            localStorage.setItem(
              "mongodb_workouts_cache",
              JSON.stringify({
                workouts: response.data,
                timestamp: new Date().toISOString(),
              }),
            );
          }
        } catch (apiError) {
          console.warn("⚠️ API refresh failed:", apiError.message);
        }
      }

      // Refresh stats
      this.refreshStats();
      this.broadcastUpdate();

      console.log("✅ RealTimeWorkoutSync: Force refresh completed");
      return { success: true, stats: this.stats };
    } catch (error) {
      console.error("❌ Force refresh failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Get workout history for specific time period
  getWorkoutHistory(days = 30) {
    try {
      const workouts = this.getWorkoutSyncData();
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      return workouts
        .filter((w) => new Date(w.completedAt) >= cutoff)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    } catch (error) {
      console.error("❌ Error getting workout history:", error);
      return [];
    }
  }

  // Clean fake workouts and ensure user-specific data
  cleanFakeWorkouts() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log("🔒 No authenticated user - clearing all workout data");
        localStorage.removeItem("workoutSync_workouts");
        return;
      }

      const workouts = JSON.parse(
        localStorage.getItem("workoutSync_workouts") || "[]",
      );

      // Filter for real workouts belonging to current user
      const realUserWorkouts = workouts.filter((workout) => {
        const isRealWorkout =
          workout.exercise &&
          workout.exercise !== "Workout" &&
          (workout.duration > 0 || workout.caloriesBurned > 0) &&
          workout.completedAt &&
          !workout.id?.includes("test_") &&
          !workout.id?.includes("fake_") &&
          !workout.id?.includes("demo_");

        // Check if workout belongs to current user
        const belongsToUser =
          workout.userId === currentUser.id ||
          workout.userId === currentUser._id ||
          (!workout.userId && isRealWorkout); // Backward compatibility

        return isRealWorkout && belongsToUser;
      });

      // Remove duplicates based on exercise name and completion time for current user
      const uniqueWorkouts = [];
      const seen = new Set();

      for (const workout of realUserWorkouts) {
        const key = `${currentUser.id}_${workout.exercise}_${new Date(workout.completedAt).toDateString()}`;
        if (!seen.has(key)) {
          seen.add(key);
          // Ensure userId is set
          workout.userId = workout.userId || currentUser.id || currentUser._id;
          uniqueWorkouts.push(workout);
        }
      }

      if (uniqueWorkouts.length !== workouts.length) {
        localStorage.setItem(
          "workoutSync_workouts",
          JSON.stringify(uniqueWorkouts),
        );
        console.log(
          `🧹 Cleaned workouts for user ${currentUser.id}: ${workouts.length} → ${uniqueWorkouts.length}`,
        );
      }
    } catch (error) {
      console.warn("⚠️ Error cleaning fake workouts:", error);
    }
  }

  // Delete specific workout
  async deleteWorkout(workoutId) {
    try {
      // Delete from localStorage
      const workouts = JSON.parse(
        localStorage.getItem("workoutSync_workouts") || "[]",
      );
      const updated = workouts.filter((w) => w.id !== workoutId);
      localStorage.setItem("workoutSync_workouts", JSON.stringify(updated));

      // Refresh stats and broadcast
      this.refreshStats();
      this.broadcastUpdate();

      console.log("✅ RealTimeWorkoutSync: Workout deleted:", workoutId);
      return { success: true };
    } catch (error) {
      console.error("❌ Error deleting workout:", error);
      return { success: false, error: error.message };
    }
  }

  // Get current authenticated user
  getCurrentUser() {
    try {
      // Try to get user from various sources
      const authUser = localStorage.getItem("user");
      if (authUser) {
        return JSON.parse(authUser);
      }

      // Try auth token
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          return {
            id: payload.userId || payload.id,
            _id: payload.userId || payload.id,
          };
        } catch (e) {
          console.warn("⚠️ Invalid token format");
        }
      }

      return null;
    } catch (error) {
      console.warn("⚠️ Error getting current user:", error);
      return null;
    }
  }

  // Clear all workout data (for testing) - USER SPECIFIC
  clearAllData() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      console.log("🔒 No authenticated user - clearing all data");
      localStorage.removeItem("workoutSync_workouts");
      localStorage.removeItem("mongodb_workouts_cache");
    } else {
      // Only clear current user's data
      const allWorkouts = JSON.parse(
        localStorage.getItem("workoutSync_workouts") || "[]",
      );
      const otherUsersWorkouts = allWorkouts.filter(
        (w) =>
          w.userId &&
          w.userId !== currentUser.id &&
          w.userId !== currentUser._id,
      );
      localStorage.setItem(
        "workoutSync_workouts",
        JSON.stringify(otherUsersWorkouts),
      );
      console.log(
        `🧹 Cleared data for user ${currentUser.id}, kept ${otherUsersWorkouts.length} workouts from other users`,
      );
    }

    this.refreshStats();
    this.broadcastUpdate();
    console.log("🧹 RealTimeWorkoutSync: User-specific data cleared");
  }
}

// Create singleton instance
export const realTimeWorkoutSync = new RealTimeWorkoutSync();

// Make available globally
if (typeof window !== "undefined") {
  window.realTimeWorkoutSync = realTimeWorkoutSync;
}

// Export for use in components
export default realTimeWorkoutSync;
