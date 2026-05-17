// Hook for Real-Time Workout Stats
// Provides instant updates across all components

import { useState, useEffect } from "react";
import { realTimeWorkoutSync } from "../services/realTimeWorkoutSync";

export const useRealTimeWorkouts = () => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    todayWorkouts: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    lastUpdate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial stats
    const initialStats = realTimeWorkoutSync.getStats();
    setStats(initialStats);
    setLoading(false);

    // Subscribe to real-time updates
    const unsubscribe = realTimeWorkoutSync.subscribe((newStats) => {
      setStats(newStats);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Helper functions
  const addWorkout = (workoutData) => {
    return realTimeWorkoutSync.addCompletedWorkout(workoutData);
  };

  const refreshStats = () => {
    return realTimeWorkoutSync.refreshStats();
  };

  const forceRefresh = async () => {
    setLoading(true);
    const result = await realTimeWorkoutSync.forceRefresh();
    setLoading(false);
    return result;
  };

  const getWorkoutHistory = (days = 30) => {
    return realTimeWorkoutSync.getWorkoutHistory(days);
  };

  const deleteWorkout = async (workoutId) => {
    return await realTimeWorkoutSync.deleteWorkout(workoutId);
  };

  return {
    stats,
    loading,
    addWorkout,
    refreshStats,
    forceRefresh,
    getWorkoutHistory,
    deleteWorkout,
  };
};

export default useRealTimeWorkouts;
