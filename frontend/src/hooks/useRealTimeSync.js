// frontend/src/hooks/useRealTimeSync.js
import { useEffect, useCallback } from "react";
import heroStatsService from "../services/heroStatsService";

export const useRealTimeSync = (onStatsUpdate) => {
  // Sync workout completion
  const syncWorkout = useCallback(async () => {
    try {
      await heroStatsService.trackWorkoutCompletion();
      if (onStatsUpdate) {
        const updatedStats = await heroStatsService.getHeroStats();
        onStatsUpdate(updatedStats.data || updatedStats);
      }
    } catch (error) {
      console.error("Failed to sync workout:", error);
    }
  }, [onStatsUpdate]);

  // Sync meal logging
  const syncMeal = useCallback(async () => {
    try {
      await heroStatsService.trackMealLogging();
      if (onStatsUpdate) {
        const updatedStats = await heroStatsService.getHeroStats();
        onStatsUpdate(updatedStats.data || updatedStats);
      }
    } catch (error) {
      console.error("Failed to sync meal:", error);
    }
  }, [onStatsUpdate]);

  // Listen for custom events to trigger syncing
  useEffect(() => {
    const handleWorkoutComplete = () => syncWorkout();
    const handleMealLogged = () => syncMeal();

    window.addEventListener("workoutCompleted", handleWorkoutComplete);
    window.addEventListener("mealLogged", handleMealLogged);

    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutComplete);
      window.removeEventListener("mealLogged", handleMealLogged);
    };
  }, [syncWorkout, syncMeal]);

  return { syncWorkout, syncMeal };
};

export default useRealTimeSync;
