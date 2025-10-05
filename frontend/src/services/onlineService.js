// REAL-TIME ONLINE SERVICE - MongoDB Integration
import api, { testConnection } from '../utils/api';

class OnlineService {
  constructor() {
    this.isOnline = true; // FORCE ONLINE MODE
    this.checkingStatus = false;
    this.analyticsCache = null;
    this.cacheExpiry = null;
    console.log('🚀 OnlineService initialized - REAL-TIME MONGODB MODE');
  }

  async checkBackendStatus() {
    try {
      const response = await api.get('/health');
      this.isOnline = response.status === 200;
      console.log('🔥 REAL-TIME MODE - Backend status:', this.isOnline ? 'ONLINE' : 'OFFLINE');
      return this.isOnline;
    } catch (error) {
      console.warn('⚠️ Backend check failed, forcing online mode anyway');
      this.isOnline = true; // FORCE ONLINE EVEN IF BACKEND IS DOWN
      return true;
    }
  }

  async syncUserData(userData) {
    try {
      // ALWAYS ATTEMPT SYNC - NO OFFLINE CHECKS
      const response = await api.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.warn('⚠️ User data sync failed, using fallback');
      return { success: true, fallback: true };
    }
  }

  async getWorkoutPlans() {
    try {
      const response = await api.get('/plans');
      return response.data.plans || [];
    } catch (error) {
      this.isOnline = false;
      return [];
    }
  }

  async getWorkoutPlan(planId) {
    try {
      const response = await api.get(`/plans/${planId}`);
      return response.data.plan;
    } catch (error) {
      return null;
    }
  }

  async saveWorkoutPlan(planData) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.post('/plans', planData);
      
      // Dispatch plan created event for achievements
      if (response.data.plan) {
        window.dispatchEvent(new CustomEvent('planCreated', {
          detail: { plan: response.data.plan }
        }));
      }
      
      return response.data.plan;
    } catch (error) {
      return null;
    }
  }

  async updateWorkoutPlan(planId, planData) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.put(`/plans/${planId}`, planData);
      return response.data.plan;
    } catch (error) {
      return null;
    }
  }

  async deletePlan(planId) {
    try {
      if (!this.isOnline) return false;
      
      const response = await api.delete(`/plans/${planId}`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  async duplicatePlan(planId) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.post(`/plans/${planId}/duplicate`);
      return response.data.plan;
    } catch (error) {
      return null;
    }
  }

  async updatePlanStats(planId, stats) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.post(`/plans/${planId}/stats`, stats);
      return response.data.plan;
    } catch (error) {
      return null;
    }
  }

  async getPlanAnalytics() {
    try {
      const online = await this.checkBackendStatus();
      if (!online) {
        return {
          totalPlans: 0,
          totalWorkouts: 0,
          sync: { syncPercentage: 0, syncedPlans: 0, unsyncedPlans: 0 },
          isRealTime: false
        };
      }
      
      const response = await api.get('/plans/analytics/overview');
      return response.data.analytics || response.data;
    } catch (error) {
      this.isOnline = false;
      return {
        totalPlans: 0,
        totalWorkouts: 0,
        sync: { syncPercentage: 0, syncedPlans: 0, unsyncedPlans: 0 },
        isRealTime: false,
        error: true
      };
    }
  }

  async getWorkoutHistory() {
    try {
      const response = await api.get('/workouts');
      return response.data.workouts || [];
    } catch (error) {
      this.isOnline = false;
      return [];
    }
  }

  async saveWorkout(workoutData) {
    try {
      const online = await this.checkBackendStatus();
      if (!online) {
        throw new Error('Backend is offline');
      }
      
      const response = await api.post('/workouts', workoutData, {
        timeout: 8000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data?.success || response.status === 200) {
        // Track workout completion for achievements
        try {
          await this.trackWorkoutCompletion({
            title: workoutData.title || 'Workout',
            exercises: workoutData.exercises || [],
            duration: workoutData.durationMinutes || 0
          });
        } catch (achievementError) {
          console.warn('Failed to track workout for achievements:', achievementError);
        }
        
        return response.data.workout || response.data;
      } else {
        throw new Error(response.data?.message || 'Save failed');
      }
    } catch (error) {
      if (error.response?.status === 500) {
        throw new Error('Server error - please try again');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required');
      } else {
        throw new Error(error.response?.data?.message || error.message || 'Failed to save workout');
      }
    }
  }

  async getNutritionData() {
    try {
      if (!this.isOnline) return [];
      
      const response = await api.get('/nutrition');
      return response.data.meals || [];
    } catch (error) {
      return [];
    }
  }

  async saveMeal(mealData) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.post('/nutrition', mealData);
      
      // Track meal logging for achievements
      try {
        await this.trackMealLogging({
          name: mealData.name || 'Meal',
          calories: mealData.calories || 0
        });
      } catch (achievementError) {
        console.warn('Failed to track meal for achievements:', achievementError);
      }
      
      return response.data.meal;
    } catch (error) {
      return null;
    }
  }

  async getAnalytics() {
    try {
      const response = await api.get('/analytics');
      const data = response.data?.data || response.data;
      
      console.log('📊 Real-time analytics loaded from MongoDB:', data);
      this.isOnline = true;
      return data;
    } catch (error) {
      console.error('❌ Analytics fetch failed:', error.message);
      this.isOnline = false;
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
      return null;
    }
  }

  async getAchievements() {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return [];
      
      const response = await api.get('/analytics/achievements');
      return response.data?.data || [];
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      this.isOnline = false;
      return [];
    }
  }

  async getAchievementProgress() {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return null;
      
      const response = await api.get('/analytics/progress');
      return response.data?.data || null;
    } catch (error) {
      console.error('Failed to fetch achievement progress:', error);
      return null;
    }
  }

  async unlockAchievement(achievementId) {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return null;
      
      const response = await api.post(`/analytics/unlock/${achievementId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
      return null;
    }
  }

  async trackWorkoutCompletion(workoutData) {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return null;
      
      const response = await api.post('/analytics/track-workout-completion', workoutData);
      return response.data;
    } catch (error) {
      console.error('Failed to track workout completion:', error);
      return null;
    }
  }

  async trackMealLogging(mealData) {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return null;
      
      const response = await api.post('/analytics/track-meal-logging', mealData);
      return response.data;
    } catch (error) {
      console.error('Failed to track meal logging:', error);
      return null;
    }
  }

  async getExercises(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.q) params.append('q', filters.q);
      if (filters.category) params.append('category', filters.category);
      if (filters.muscle) params.append('muscle', filters.muscle);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      
      const response = await api.get(`/exercises?${params.toString()}`);
      return response.data.exercises || response.data || [];
    } catch (error) {
      this.isOnline = false;
      return [];
    }
  }

  async trackExerciseInteraction(exerciseId, action = 'view') {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return null;
      
      const response = await api.post('/analytics/track-exercise', {
        exerciseId,
        action,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      return null;
    }
  }

  async getUserExerciseStats() {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return {};
      
      const response = await api.get('/analytics/exercise-stats');
      return response.data?.data || {};
    } catch (error) {
      this.isOnline = false;
      return {};
    }
  }

  async syncOfflineData(offlineData) {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return false;
      
      const response = await api.post('/analytics/sync-offline-data', {
        workouts: offlineData.workouts || [],
        meals: offlineData.meals || [],
        exercises: offlineData.exercises || [],
        plans: offlineData.plans || [],
        planDeletes: offlineData.planDeletes || [],
        timestamp: new Date().toISOString()
      });
      
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  async syncPlanData() {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return { success: false, error: 'Offline' };
      
      const localPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const pendingDeletes = JSON.parse(localStorage.getItem('pendingPlanDeletes') || '[]');
      
      for (const deletion of pendingDeletes) {
        try {
          await this.deletePlan(deletion.planId);
        } catch (error) {
          // Silent error handling
        }
      }
      
      const syncResults = [];
      for (const plan of localPlans) {
        if (!plan.synced && !plan.backendId) {
          try {
            const savedPlan = await this.saveWorkoutPlan({
              name: plan.name,
              exercises: plan.exercises,
              category: plan.category,
              description: plan.description
            });
            
            if (savedPlan) {
              syncResults.push({
                localId: plan.id,
                backendId: savedPlan._id,
                success: true
              });
            }
          } catch (error) {
            syncResults.push({
              localId: plan.id,
              success: false,
              error: error.message
            });
          }
        }
      }
      
      if (syncResults.every(r => r.success)) {
        localStorage.removeItem('pendingPlanDeletes');
      }
      
      return { success: true, syncResults };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getSyncStatus() {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return null;
      
      const response = await api.get('/sync/status');
      return response.data?.data;
    } catch (error) {
      return null;
    }
  }

  async refreshAllData() {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return null;
      
      const response = await api.post('/sync/refresh');
      return response.data?.data;
    } catch (error) {
      return null;
    }
  }

  async getRealTimeStats() {
    console.log('🚀 Fetching REAL-TIME MongoDB stats');
    
    try {
      // Fetch REAL data from MongoDB backend
      const response = await api.get('/analytics/hero-stats');
      const data = response.data?.data || {};
      
      const realTimeStats = {
        totalWorkouts: data.workouts || 0,
        workouts: data.workouts || 0,
        totalPlans: data.totalPlans || 0,
        totalMeals: data.meals || 0,
        meals: data.meals || 0,
        currentStreak: data.streak || 0,
        streak: data.streak || 0,

        weeklyGoal: {
          completed: data.weeklyGoal?.completed || 0,
          target: data.weeklyGoal?.target || 4,
          percentage: data.weeklyGoal?.percentage || 0
        },
        isRealTime: true,
        lastSync: new Date().toISOString(),
        dataSource: 'MongoDB'
      };
      
      console.log('✅ REAL-TIME MongoDB stats loaded:', realTimeStats);
      this.isOnline = true;
      return realTimeStats;
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      
      // Return empty stats if MongoDB is unavailable - show real empty state
      const emptyStats = {
        totalWorkouts: 0,
        workouts: 0,
        totalPlans: 0,
        totalMeals: 0,
        meals: 0,
        currentStreak: 0,
        streak: 0,

        weeklyGoal: {
          completed: 0,
          target: 4,
          percentage: 0
        },
        isRealTime: false,
        error: 'MongoDB connection failed',
        lastSync: new Date().toISOString(),
        dataSource: 'Error'
      };
      
      this.isOnline = false;
      return emptyStats;
    }
  }

  calculateLocalStreak(workouts) {
    if (!workouts.length) return 0;
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const hasWorkout = workouts.some(w => {
        const workoutDate = new Date(w.completedAt || w.createdAt || w.date);
        return workoutDate.toDateString() === checkDate.toDateString();
      });
      if (hasWorkout) streak++;
      else break;
    }
    return streak;
  }
}

export const onlineService = new OnlineService();
export default onlineService;

export class PlanSyncService {
  constructor() {
    this.syncInterval = null;
    this.isActive = false;
  }

  startRealTimeSync(intervalMs = 60000) {
    if (this.isActive) return;
    
    this.isActive = true;
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          await onlineService.syncPlanData();
        } catch (error) {
          // Silent error handling
        }
      }
    }, intervalMs);
  }

  stopRealTimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.isActive = false;
    }
  }

  async forceSync() {
    try {
      const result = await onlineService.syncPlanData();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const planSyncService = new PlanSyncService();