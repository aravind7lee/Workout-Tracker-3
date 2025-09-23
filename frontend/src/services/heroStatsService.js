// frontend/src/services/heroStatsService.js
import api from '../utils/api';

class HeroStatsService {
  // Get real-time user stats for Hero section
  async getHeroStats() {
    try {
      const response = await api.get('/analytics/hero-stats');
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
          percentage: 0
        }
      };
    }
  }

  // Track workout completion for real-time updates
  async trackWorkoutCompletion() {
    try {
      await api.post('/analytics/track-workout-completion');
    } catch (error) {
      console.error('Failed to track workout:', error);
    }
  }

  // Track meal logging for real-time updates
  async trackMealLogging() {
    try {
      await api.post('/analytics/track-meal-logging');
    } catch (error) {
      console.error('Failed to track meal:', error);
    }
  }
}

export const heroStatsService = new HeroStatsService();
export default heroStatsService;