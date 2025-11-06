// frontend/src/services/analyticsService.js - BACKEND ANALYTICS SERVICE
import api from '../utils/api';
import { isUserAuthenticated } from '../utils/authCheck';

class AnalyticsService {
  // Fetch analytics stats from backend
  async getStats() {
    if (!isUserAuthenticated()) {
      return { workouts: 0, meals: 0, plans: 0, streak: 0 };
    }
    
    try {
      const response = await api.get('/analytics/stats');
      return response.data;
    } catch (error) {
      if (error.message?.includes('authentication')) {
        return { workouts: 0, meals: 0, plans: 0, streak: 0 };
      }
      throw error;
    }
  }

  // Fetch workout analytics from backend
  async getWorkoutAnalytics() {
    if (!isUserAuthenticated()) {
      return { totalWorkouts: 0, weeklyWorkouts: 0, monthlyWorkouts: 0 };
    }
    
    try {
      const response = await api.get('/analytics/workouts');
      return response.data;
    } catch (error) {
      if (error.message?.includes('authentication')) {
        return { totalWorkouts: 0, weeklyWorkouts: 0, monthlyWorkouts: 0 };
      }
      throw error;
    }
  }

  // Fetch nutrition analytics from backend
  async getNutritionAnalytics() {
    if (!isUserAuthenticated()) {
      return { totalMeals: 0, calories: 0, protein: 0 };
    }
    
    try {
      const response = await api.get('/analytics/nutrition');
      return response.data;
    } catch (error) {
      if (error.message?.includes('authentication')) {
        return { totalMeals: 0, calories: 0, protein: 0 };
      }
      throw error;
    }
  }

  // Fetch achievements from backend
  async getAchievements() {
    try {
      const response = await api.get('/analytics/achievements');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Sync workout plans to backend
  async syncWorkoutPlans(plans) {
    try {
      const response = await api.post('/analytics/sync-plans', { plans });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Sync workout history to backend
  async syncWorkoutHistory(workouts) {
    try {
      const response = await api.post('/analytics/sync-workouts', { workouts });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Sync nutrition data to backend
  async syncNutritionData(meals) {
    try {
      const response = await api.post('/analytics/sync-nutrition', { meals });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Track workout completion
  async trackWorkout(workoutData) {
    try {
      const response = await api.post('/analytics/track-workout', workoutData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Track meal logging
  async trackMeal(mealData) {
    try {
      const response = await api.post('/analytics/track-meal', mealData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Track plan creation
  async trackPlanCreation(planData) {
    try {
      const response = await api.post('/analytics/track-plan', planData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Get comprehensive analytics dashboard data
  async getDashboardData() {
    try {
      const [stats, workouts, nutrition, achievements] = await Promise.all([
        this.getStats(),
        this.getWorkoutAnalytics(),
        this.getNutritionAnalytics(),
        this.getAchievements()
      ]);

      return {
        stats: stats.data || stats,
        workouts: workouts.data || workouts,
        nutrition: nutrition.data || nutrition,
        achievements: achievements.data || achievements
      };
    } catch (error) {
      throw error;
    }
  }

  // Sync all local data to backend
  async syncAllData() {
    try {
      const results = {};

      // Sync workout plans
      try {
        const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        if (plans.length > 0) {
          results.plans = await this.syncWorkoutPlans(plans);
        }
      } catch (error) {
        results.plansError = error.message;
      }

      // Sync workout history
      try {
        const workouts = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
        if (workouts.length > 0) {
          results.workouts = await this.syncWorkoutHistory(workouts);
        }
      } catch (error) {
        results.workoutsError = error.message;
      }

      // Sync nutrition data
      try {
        const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
        if (meals.length > 0) {
          results.nutrition = await this.syncNutritionData(meals);
        }
      } catch (error) {
        results.nutritionError = error.message;
      }

      return results;
    } catch (error) {
      throw error;
    }
  }

  // Real-time event tracking
  async trackEvent(eventType, eventData) {
    try {
      const response = await api.post('/analytics/track-event', {
        eventType,
        eventData,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      // Silently fail for tracking events to not disrupt user experience
      return null;
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;