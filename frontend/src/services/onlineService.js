// Online Service for Backend Integration
import api from '../utils/api';

class OnlineService {
  constructor() {
    this.isOnline = false;
    this.checkingStatus = false;
    this.analyticsCache = null;
    this.cacheExpiry = null;
  }

  async checkBackendStatus() {
    if (this.checkingStatus) return this.isOnline;
    
    this.checkingStatus = true;
    try {
      const response = await api.get('/health', { timeout: 10000 });
      this.isOnline = response.status === 200;
      console.log('Backend status:', this.isOnline ? 'Online' : 'Offline');
      return this.isOnline;
    } catch (error) {
      console.log('Backend offline:', error.message);
      this.isOnline = false;
      return false;
    } finally {
      this.checkingStatus = false;
    }
  }

  async syncUserData(userData) {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return false;
      
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Failed to sync user data:', error);
      return false;
    }
  }

  async getWorkoutPlans() {
    try {
      if (!this.isOnline) return [];
      
      const response = await api.get('/plans');
      return response.data.plans || [];
    } catch (error) {
      console.error('Failed to fetch workout plans:', error);
      return [];
    }
  }

  async saveWorkoutPlan(planData) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.post('/plans', planData);
      return response.data.plan;
    } catch (error) {
      console.error('Failed to save workout plan:', error);
      return null;
    }
  }

  async getWorkoutHistory() {
    try {
      if (!this.isOnline) return [];
      
      const response = await api.get('/workouts');
      return response.data.workouts || [];
    } catch (error) {
      console.error('Failed to fetch workout history:', error);
      return [];
    }
  }

  async saveWorkout(workoutData) {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return null;
      
      const response = await api.post('/workouts', workoutData);
      return response.data.workout;
    } catch (error) {
      console.error('Failed to save workout:', error);
      return null;
    }
  }

  async getNutritionData() {
    try {
      if (!this.isOnline) return [];
      
      const response = await api.get('/nutrition');
      return response.data.meals || [];
    } catch (error) {
      console.error('Failed to fetch nutrition data:', error);
      return [];
    }
  }

  async saveMeal(mealData) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.post('/nutrition', mealData);
      return response.data.meal;
    } catch (error) {
      console.error('Failed to save meal:', error);
      return null;
    }
  }

  async getAnalytics() {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return null;
      
      // Get hero stats which contains the main analytics data
      const response = await api.get('/analytics/hero-stats');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return null;
    }
  }

  async getDetailedAnalytics() {
    try {
      if (!this.isOnline) return null;
      
      const [stats, calories, frequency, muscles, achievements] = await Promise.all([
        api.get('/analytics/stats'),
        api.get('/analytics/calories'),
        api.get('/analytics/frequency'),
        api.get('/analytics/muscles'),
        api.get('/analytics/achievements')
      ]);
      
      return {
        stats: stats.data?.data,
        calories: calories.data?.data,
        frequency: frequency.data?.data,
        muscles: muscles.data?.data,
        achievements: achievements.data?.data
      };
    } catch (error) {
      console.error('Failed to fetch detailed analytics:', error);
      return null;
    }
  }
}

export const onlineService = new OnlineService();
export default onlineService;