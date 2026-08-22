import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import api from "../utils/api";

// API-backed service
const workoutCompletionService = {
  async completeWorkout(workoutData) {
    try {
      // Map frontend flat structure to backend nested schema
      const backendPayload = {
        title: workoutData.exercise || workoutData.name || workoutData.title || "Quick Workout",
        durationMinutes: Math.ceil((workoutData.duration || 0) / 60) || 1, // Convert seconds to minutes, minimum 1
        calories: workoutData.caloriesBurned || workoutData.calories || 0,
        status: "completed",
        startedAt: new Date(Date.now() - (workoutData.duration || 60) * 1000).toISOString(),
        exercises: [
          {
            exerciseName: workoutData.exercise || workoutData.name || "Unknown Exercise",
            sets: Array.from({ length: workoutData.sets || 1 }).map(() => ({
              reps: workoutData.reps || 10,
              weight: workoutData.weight || 0,
              rest: 60
            })),
            notes: workoutData.notes || ""
          }
        ]
      };

      const response = await api.post("/workouts", backendPayload);
      const workout = response.data?.workout || response.data;
      
      if (!workout || !workout._id) {
          throw new Error("Invalid response from server when saving workout.");
      }

      const completedWorkout = {
          ...workout,
          id: workout._id,
      };

      // Dispatch event to update UI and other contexts
      window.dispatchEvent(
        new CustomEvent("workoutCompleted", { detail: completedWorkout }),
      );

      return completedWorkout;
    } catch (error) {
      console.error("Error saving workout to API:", error);
      
      // Fallback: Dispatch custom event for realTimeWorkoutSync to handle as offline
      const offlineWorkout = {
          id: Date.now().toString(),
          ...workoutData,
          completedAt: new Date().toISOString(),
          savedOffline: true,
      };
      window.dispatchEvent(
        new CustomEvent("workoutCompleted", { detail: offlineWorkout }),
      );
      return offlineWorkout;
    }
  },

  async getCompletedWorkouts(userId) {
    try {
      const response = await api.get("/workouts");
      let workouts = response.data?.workouts || response.data || [];
      if (!Array.isArray(workouts)) workouts = [];
      
      // Filter by user and completed status
      return workouts.filter((w) => {
         const matchesUser = w.user === userId || w.userId === userId || w.user?._id === userId;
         return matchesUser && (w.completed === true || w.completedAt);
      });
    } catch (error) {
      console.error("Error fetching completed workouts from API:", error);
      return [];
    }
  },

  async deleteWorkout(workoutId, userId) {
      try {
          await api.delete(`/workouts/${workoutId}`);
          return true;
      } catch (error) {
          console.error("Error deleting workout via API:", error);
          return false;
      }
  },

  getWorkoutStats(userId) {
      // Defer to RealTimeContext which has accurate MongoDB stats
      return {
        todayWorkouts: 0,
        totalWorkouts: 0,
        weeklyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
      };
  },
};

const WorkoutCompletionContext = createContext();

export const useWorkoutCompletion = () => {
  const context = useContext(WorkoutCompletionContext);
  if (!context) {
    throw new Error(
      "useWorkoutCompletion must be used within a WorkoutCompletionProvider",
    );
  }
  return context;
};

export const WorkoutCompletionProvider = ({ children }) => {
  const { user } = useAuth();
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [workoutStats, setWorkoutStats] = useState({
    todayWorkouts: 0,
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    averageDuration: 0,
    favoriteExercise: null,
    lastWorkout: null,
  });
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load completed workouts when user changes
  useEffect(() => {
    if (user?.id) {
      loadCompletedWorkouts();
    }
  }, [user]);

  // Listen for real-time workout completions
  useEffect(() => {
    const handleWorkoutCompleted = (event) => {
      if (event.detail) {
        setCompletedWorkouts((prev) => [event.detail, ...prev]);
        updateStats();
      }
    };

    const handleWorkoutsSynced = () => {
      loadCompletedWorkouts();
    };

    const handleStatsUpdate = (event) => {
      if (event.detail) {
        setWorkoutStats((prev) => ({ ...prev, ...event.detail }));
      }
    };

    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    window.addEventListener("workoutsSynced", handleWorkoutsSynced);
    window.addEventListener("realTimeStatsUpdate", handleStatsUpdate);

    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
      window.removeEventListener("workoutsSynced", handleWorkoutsSynced);
      window.removeEventListener("realTimeStatsUpdate", handleStatsUpdate);
    };
  }, []);

  const loadCompletedWorkouts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const workouts = await workoutCompletionService.getCompletedWorkouts(
        user.id,
      );
      setCompletedWorkouts(workouts);
      updateStats();
    } catch (error) {
      console.error("Error loading completed workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeWorkout = async (workoutData) => {
    try {
      const completedWorkout = await workoutCompletionService.completeWorkout({
        ...workoutData,
        userId: user?.id,
      });

      // Update local state
      setCompletedWorkouts((prev) => [completedWorkout, ...prev]);
      updateStats();

      return completedWorkout;
    } catch (error) {
      console.error("Error completing workout:", error);
      throw error;
    }
  };

  const deleteWorkout = async (workoutId) => {
    try {
      const success = await workoutCompletionService.deleteWorkout(
        workoutId,
        user?.id,
      );
      if (success) {
        setCompletedWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
        updateStats();
      }
      return success;
    } catch (error) {
      console.error("Error deleting workout:", error);
      return false;
    }
  };

  const updateStats = () => {
    if (user?.id) {
      const stats = workoutCompletionService.getWorkoutStats(user.id);
      setWorkoutStats(stats);
    }
  };

  const getFilteredWorkouts = (filter = "all") => {
    const now = new Date();

    return completedWorkouts.filter((workout) => {
      const workoutDate = new Date(workout.completedAt);

      switch (filter) {
        case "today":
          return workoutDate.toDateString() === now.toDateString();
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return workoutDate >= weekAgo;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return workoutDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const value = {
    completedWorkouts,
    workoutStats,
    loading,
    isOnline,
    completeWorkout,
    deleteWorkout,
    loadCompletedWorkouts,
    getFilteredWorkouts,
    updateStats,
  };

  return (
    <WorkoutCompletionContext.Provider value={value}>
      {children}
    </WorkoutCompletionContext.Provider>
  );
};
