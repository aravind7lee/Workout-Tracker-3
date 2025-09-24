// Online Service for Backend Integration
import api, { testConnection } from '../utils/api';

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
      const result = await testConnection();
      
      if (result.success) {
        this.isOnline = true;
        return true;
      } else {
        this.isOnline = false;
        return false;
      }
    } catch (error) {
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
      const response = await api.get('/plans');
      return response.data.plans || [];
    } catch (error) {
      console.error('Failed to fetch workout plans:', error);
      this.isOnline = false;
      return [];
    }
  }

  async getWorkoutPlan(planId) {
    try {
      const response = await api.get(`/plans/${planId}`);
      return response.data.plan;
    } catch (error) {
      console.error('Failed to fetch workout plan:', error);
      return null;
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

  async updateWorkoutPlan(planId, planData) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.put(`/plans/${planId}`, planData);
      return response.data.plan;
    } catch (error) {
      console.error('Failed to update workout plan:', error);
      return null;
    }
  }

  async deletePlan(planId) {
    try {
      if (!this.isOnline) return false;
      
      const response = await api.delete(`/plans/${planId}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to delete workout plan:', error);
      return false;
    }
  }

  async duplicatePlan(planId) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.post(`/plans/${planId}/duplicate`);
      return response.data.plan;
    } catch (error) {
      console.error('Failed to duplicate workout plan:', error);
      return null;
    }
  }

  async updatePlanStats(planId, stats) {
    try {
      if (!this.isOnline) return null;
      
      const response = await api.post(`/plans/${planId}/stats`, stats);
      return response.data.plan;
    } catch (error) {
      console.error('Failed to update plan stats:', error);
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
      console.error('Failed to fetch plan analytics:', error);
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
      console.error('Failed to fetch workout history:', error);
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
      // Get hero stats which contains the main analytics data
      const response = await api.get('/analytics/hero-stats');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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
      console.error('Failed to fetch detailed analytics:', error);
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
      console.error('Failed to fetch exercises:', error);
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
      console.error('Failed to track exercise interaction:', error);
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
      console.error('Failed to fetch exercise stats:', error);
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
      console.error('Failed to sync offline data:', error);
      return false;
    }
  }

  async syncPlanData() {
    try {
      const online = await this.checkBackendStatus();
      if (!online) return { success: false, error: 'Offline' };
      
      // Get local plans and pending operations
      const localPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const pendingDeletes = JSON.parse(localStorage.getItem('pendingPlanDeletes') || '[]');
      
      // Process pending deletions
      for (const deletion of pendingDeletes) {
        try {
          await this.deletePlan(deletion.planId);
        } catch (error) {
          console.error('Failed to sync plan deletion:', error);
        }
      }
      
      // Sync local plans to backend
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
            console.error('Failed to sync plan:', error);
            syncResults.push({
              localId: plan.id,
              success: false,
              error: error.message
            });
          }
        }
      }
      
      // Clear pending operations if successful
      if (syncResults.every(r => r.success)) {
        localStorage.removeItem('pendingPlanDeletes');
      }
      
      return { success: true, syncResults };
    } catch (error) {
      console.error('Failed to sync plan data:', error);
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
      console.error('Failed to get sync status:', error);
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
      console.error('Failed to refresh data:', error);
      return null;
    }
  }
}

export const onlineService = new OnlineService();
export default onlineService;

// Real-time plan sync service
export class PlanSyncService {
  constructor() {
    this.syncInterval = null;
    this.isActive = false;
  }

  startRealTimeSync(intervalMs = 30000) {
    if (this.isActive) return;
    
    this.isActive = true;
    this.syncInterval = setInterval(async () => {
      if (navigator.onLine) {
        try {
          await onlineService.syncPlanData();
        } catch (error) {
          console.error('Real-time sync failed:', error);
        }
      }
    }, intervalMs);
    
    console.log('🔄 Real-time plan sync started');
  }

  stopRealTimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      this.isActive = false;
      console.log('⏹️ Real-time plan sync stopped');
    }
  }

  async forceSync() {
    try {
      const result = await onlineService.syncPlanData();
      console.log('🔄 Force sync completed:', result);
      return result;
    } catch (error) {
      console.error('Force sync failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const planSyncService = new PlanSyncService();

// Auto-sync offline data when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('🌐 Back online - syncing data...');
    
    // Check if we have offline data to sync
    const offlineData = JSON.parse(localStorage.getItem('gymTracker_offlineData') || '{}');
    const pendingDeletes = JSON.parse(localStorage.getItem('pendingPlanDeletes') || '[]');
    const localPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
    const unsyncedPlans = localPlans.filter(p => !p.synced && !p.backendId);
    
    const hasOfflineData = (offlineData.workouts?.length > 0) || 
                          (offlineData.meals?.length > 0) || 
                          (offlineData.exercises?.length > 0) ||
                          (pendingDeletes.length > 0) ||
                          (unsyncedPlans.length > 0);
    
    if (hasOfflineData) {
      try {
        // Sync general offline data
        const synced = await onlineService.syncOfflineData({
          ...offlineData,
          plans: unsyncedPlans,
          planDeletes: pendingDeletes
        });
        
        // Sync plan-specific data
        const planSyncResult = await onlineService.syncPlanData();
        
        if (synced && planSyncResult.success) {
          localStorage.removeItem('gymTracker_offlineData');
          console.log('✅ All offline data synced successfully');
          
          // Trigger a custom event to notify components
          window.dispatchEvent(new CustomEvent('offlineDataSynced', {
            detail: { 
              syncedData: offlineData,
              planSyncResults: planSyncResult.syncResults
            }
          }));
        }
      } catch (error) {
        console.error('❌ Failed to sync offline data:', error);
      }
    }
  });
  
  window.addEventListener('offline', () => {
    console.log('📱 Going offline - enabling offline mode...');
    window.dispatchEvent(new CustomEvent('networkStatusChanged', {
      detail: { isOnline: false }
    }));
  });
}