// frontend/src/services/heroStatsService.js
import api from "../utils/api";
import { isUserAuthenticated } from "../utils/authCheck";

class HeroStatsService {
  // Get real-time user stats for Hero section
  async getHeroStats() {
    // Return default stats if not authenticated
    if (!isUserAuthenticated()) {
      return {
        workouts: 0,
        meals: 0,
        xpPoints: 0,
        streak: 0,
        weeklyGoal: {
          completed: 0,
          target: 4,
          percentage: 0,
        },
      };
    }

    try {
      const response = await api.get("/analytics/hero-stats");
      return response.data;
    } catch (error) {
      // Return default stats if API fails
      return {
        workouts: 0,
        meals: 0,
        xpPoints: 0,
        streak: 0,
        weeklyGoal: {
          completed: 0,
          target: 4,
          percentage: 0,
        },
      };
    }
  }

  // Track workout completion for real-time updates
  async trackWorkoutCompletion() {
    if (!isUserAuthenticated()) {
      return;
    }

    try {
      await api.post("/analytics/track-workout-completion");
    } catch (error) {
      // Silently fail if not authenticated
      if (!error.message?.includes("authentication")) {
        console.error("Failed to track workout:", error);
      }
    }
  }

  // Track meal logging for real-time updates
  async trackMealLogging() {
    if (!isUserAuthenticated()) {
      return;
    }

    try {
      await api.post("/analytics/track-meal-logging");
    } catch (error) {
      // Silently fail if not authenticated
      if (!error.message?.includes("authentication")) {
        console.error("Failed to track meal:", error);
      }
    }
  }
}

export const heroStatsService = new HeroStatsService();
export default heroStatsService;
