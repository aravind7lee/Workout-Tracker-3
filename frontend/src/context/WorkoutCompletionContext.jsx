import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
// Simple fallback service
const workoutCompletionService = {
  async completeWorkout(workoutData) {
    const workout = {
      id: Date.now(),
      ...workoutData,
      completedAt: new Date().toISOString(),
      savedOffline: true,
    };

    try {
      const existingWorkouts = JSON.parse(
        localStorage.getItem("completedWorkouts") || "[]",
      );
      const updatedWorkouts = [workout, ...existingWorkouts];
      localStorage.setItem(
        "completedWorkouts",
        JSON.stringify(updatedWorkouts),
      );

      window.dispatchEvent(
        new CustomEvent("workoutCompleted", { detail: workout }),
      );
      window.dispatchEvent(
        new CustomEvent("realTimeStatsUpdate", {
          detail: {
            todayWorkouts: updatedWorkouts.filter(
              (w) =>
                new Date(w.completedAt).toDateString() ===
                new Date().toDateString(),
            ).length,
            totalWorkouts: updatedWorkouts.length,
          },
        }),
      );

      return workout;
    } catch (error) {
      console.error("Error saving workout:", error);
      throw error;
    }
  },

  async getCompletedWorkouts(userId) {
    try {
      const workouts = JSON.parse(
        localStorage.getItem("completedWorkouts") || "[]",
      );
      return workouts.filter((w) => w.userId === userId);
    } catch (error) {
      return [];
    }
  },

  getWorkoutStats(userId) {
    try {
      const workouts = JSON.parse(
        localStorage.getItem("completedWorkouts") || "[]",
      ).filter((w) => w.userId === userId);

      const today = new Date().toDateString();
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      return {
        todayWorkouts: workouts.filter(
          (w) => new Date(w.completedAt).toDateString() === today,
        ).length,
        totalWorkouts: workouts.length,
        weeklyWorkouts: workouts.filter(
          (w) => new Date(w.completedAt) >= thisWeek,
        ).length,
        totalCalories: workouts.reduce(
          (sum, w) => sum + (w.caloriesBurned || 0),
          0,
        ),
        totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      };
    } catch (error) {
      return {
        todayWorkouts: 0,
        totalWorkouts: 0,
        weeklyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
      };
    }
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
