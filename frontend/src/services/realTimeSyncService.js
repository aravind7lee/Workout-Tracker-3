// Real-time Sync Service for Professional Gym App Experience
import { onlineService } from './onlineService';
import { offlineStorageService } from './offlineStorageService';

class RealTimeSyncService {
  constructor() {
    this.syncInterval = null;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.lastSyncTime = null;
    this.syncCallbacks = [];
    
    // Listen for online/offline events
    this.setupNetworkListeners();
  }

  setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('🌐 Network back online - initiating sync...');
        this.isOnline = true;
        this.performFullSync();
      });

      window.addEventListener('offline', () => {
        console.log('📱 Network offline - switching to offline mode...');
        this.isOnline = false;
        this.stopAutoSync();
      });
    }
  }

  // Start real-time synchronization
  startRealTimeSync(intervalMinutes = 1) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (this.isOnline && !this.syncInProgress) {
        await this.performIncrementalSync();
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`🔄 Real-time sync started (every ${intervalMinutes} minute${intervalMinutes > 1 ? 's' : ''})`);
  }

  // Stop auto sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Real-time sync stopped');
    }
  }

  // Perform full synchronization
  async performFullSync() {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;
    console.log('🔄 Starting full sync...');

    try {
      // Check if backend is online
      const backendOnline = await onlineService.checkBackendStatus();
      if (!backendOnline) {
        console.log('⚠️ Backend offline, skipping sync');
        return;
      }

      // Sync offline data first
      await this.syncOfflineData();

      // Fetch fresh data from backend
      const [userProgress, workoutHistory, exerciseStats] = await Promise.all([
        onlineService.getAnalytics(),
        onlineService.getWorkoutHistory(),
        onlineService.getUserExerciseStats()
      ]);

      // Cache the fresh data
      if (userProgress) {
        offlineStorageService.cacheUserProgress(userProgress);
      }

      if (workoutHistory) {
        offlineStorageService.cacheWorkoutHistory(workoutHistory);
      }

      if (exerciseStats) {
        offlineStorageService.cacheExerciseStats(exerciseStats);
      }

      this.lastSyncTime = new Date();
      console.log('✅ Full sync completed successfully');

      // Notify callbacks
      this.notifyCallbacks('full_sync_complete', {
        userProgress,
        workoutHistory,
        exerciseStats,
        timestamp: this.lastSyncTime
      });

    } catch (error) {
      console.error('❌ Full sync failed:', error);
      this.notifyCallbacks('sync_error', { error, type: 'full_sync' });
    } finally {
      this.syncInProgress = false;
    }
  }

  // Perform incremental synchronization
  async performIncrementalSync() {
    if (this.syncInProgress) return;
    
    this.syncInProgress = true;

    try {
      // Check if backend is online
      const backendOnline = await onlineService.checkBackendStatus();
      if (!backendOnline) {
        return;
      }

      // Sync any pending offline data
      await this.syncOfflineData();

      // Get updated analytics (lightweight)
      const userProgress = await onlineService.getAnalytics();
      if (userProgress) {
        offlineStorageService.cacheUserProgress(userProgress);
        
        this.notifyCallbacks('incremental_sync_complete', {
          userProgress,
          timestamp: new Date()
        });
      }

      this.lastSyncTime = new Date();

    } catch (error) {
      console.error('❌ Incremental sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Sync offline data to backend
  async syncOfflineData() {
    const offlineData = offlineStorageService.getOfflineData();
    
    if (offlineData.workouts.length === 0 && 
        offlineData.meals.length === 0 && 
        offlineData.exercises.length === 0) {
      return; // Nothing to sync
    }

    try {
      const synced = await onlineService.syncOfflineData(offlineData);
      if (synced) {
        // Clear synced offline data
        offlineStorageService.saveOfflineData({
          workouts: [],
          meals: [],
          exercises: [],
          lastSync: new Date().toISOString()
        });
        
        console.log(`✅ Synced ${offlineData.workouts.length + offlineData.meals.length + offlineData.exercises.length} offline items`);
      }
    } catch (error) {
      console.error('❌ Failed to sync offline data:', error);
    }
  }

  // Track workout in real-time
  async trackWorkout(workoutData) {
    try {
      if (this.isOnline) {
        // Save to backend immediately
        const savedWorkout = await onlineService.saveWorkout(workoutData);
        if (savedWorkout) {
          // Update cached data
          const cachedHistory = offlineStorageService.getCachedWorkoutHistory();
          cachedHistory.unshift(savedWorkout);
          offlineStorageService.cacheWorkoutHistory(cachedHistory.slice(0, 50)); // Keep last 50
          
          // Update user progress
          await this.updateUserProgress();
          
          console.log('✅ Workout saved to backend');
          return savedWorkout;
        }
      }
      
      // Fallback to offline storage
      offlineStorageService.storeWorkoutOffline(workoutData);
      console.log('📱 Workout saved offline');
      return { ...workoutData, isOffline: true };
      
    } catch (error) {
      console.error('❌ Failed to track workout:', error);
      // Always save offline as fallback
      offlineStorageService.storeWorkoutOffline(workoutData);
      return { ...workoutData, isOffline: true };
    }
  }

  // Track meal in real-time
  async trackMeal(mealData) {
    try {
      if (this.isOnline) {
        const savedMeal = await onlineService.saveMeal(mealData);
        if (savedMeal) {
          await this.updateUserProgress();
          console.log('✅ Meal saved to backend');
          return savedMeal;
        }
      }
      
      offlineStorageService.storeMealOffline(mealData);
      console.log('📱 Meal saved offline');
      return { ...mealData, isOffline: true };
      
    } catch (error) {
      console.error('❌ Failed to track meal:', error);
      offlineStorageService.storeMealOffline(mealData);
      return { ...mealData, isOffline: true };
    }
  }

  // Track exercise interaction
  async trackExerciseInteraction(exerciseId, action = 'view') {
    try {
      if (this.isOnline) {
        await onlineService.trackExerciseInteraction(exerciseId, action);
        console.log(`✅ Exercise ${action} tracked for ${exerciseId}`);
      } else {
        offlineStorageService.storeExerciseInteractionOffline(exerciseId, action);
        console.log(`📱 Exercise ${action} saved offline for ${exerciseId}`);
      }
    } catch (error) {
      console.error('❌ Failed to track exercise interaction:', error);
      offlineStorageService.storeExerciseInteractionOffline(exerciseId, action);
    }
  }

  // Update user progress
  async updateUserProgress() {
    try {
      const progress = await onlineService.getAnalytics();
      if (progress) {
        offlineStorageService.cacheUserProgress(progress);
        this.notifyCallbacks('progress_updated', progress);
      }
    } catch (error) {
      console.error('❌ Failed to update user progress:', error);
    }
  }

  // Get real-time data (online or cached)
  async getRealTimeData() {
    try {
      const backendOnline = await onlineService.checkBackendStatus();
      this.isOnline = backendOnline;
      
      if (backendOnline) {
        try {
          return await this.getFreshData();
        } catch (freshDataError) {
          console.error('❌ Failed to get fresh data, using cached:', freshDataError);
          return this.getCachedData();
        }
      }
      
      // Return cached data
      return this.getCachedData();
    } catch (error) {
      console.error('❌ Failed to get real-time data:', error);
      return this.getCachedData();
    }
  }

  // Get fresh data from backend
  async getFreshData() {
    try {
      const results = await Promise.allSettled([
        onlineService.getAnalytics(),
        onlineService.getWorkoutHistory(),
        onlineService.getUserExerciseStats()
      ]);
      
      const userProgress = results[0].status === 'fulfilled' ? results[0].value : null;
      const workoutHistory = results[1].status === 'fulfilled' ? results[1].value : [];
      const exerciseStats = results[2].status === 'fulfilled' ? results[2].value : {};

      // Cache the fresh data
      if (userProgress) offlineStorageService.cacheUserProgress(userProgress);
      if (workoutHistory && Array.isArray(workoutHistory)) offlineStorageService.cacheWorkoutHistory(workoutHistory);
      if (exerciseStats && typeof exerciseStats === 'object') offlineStorageService.cacheExerciseStats(exerciseStats);

      return { userProgress, workoutHistory, exerciseStats, isLive: true };
    } catch (error) {
      console.error('❌ Error getting fresh data:', error);
      throw error;
    }
  }

  // Get cached data
  getCachedData() {
    try {
      const userProgress = offlineStorageService.getCachedUserProgress();
      const workoutHistory = offlineStorageService.getCachedWorkoutHistory();
      const exerciseStats = offlineStorageService.getCachedExerciseStats();

      return { 
        userProgress: userProgress || null, 
        workoutHistory: (workoutHistory && workoutHistory.workouts) ? workoutHistory.workouts : [], 
        exerciseStats: exerciseStats || {}, 
        isLive: false 
      };
    } catch (error) {
      console.error('❌ Error getting cached data:', error);
      return {
        userProgress: null,
        workoutHistory: [],
        exerciseStats: {},
        isLive: false
      };
    }
  }

  // Add sync callback
  onSync(callback) {
    this.syncCallbacks.push(callback);
  }

  // Remove sync callback
  offSync(callback) {
    this.syncCallbacks = this.syncCallbacks.filter(cb => cb !== callback);
  }

  // Notify all callbacks
  notifyCallbacks(event, data) {
    this.syncCallbacks.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('❌ Sync callback error:', error);
      }
    });
  }

  // Get sync status
  getSyncStatus() {
    try {
      const storageInfo = offlineStorageService.getStorageInfo();
      
      return {
        isOnline: this.isOnline,
        syncInProgress: this.syncInProgress,
        lastSyncTime: this.lastSyncTime,
        pendingOfflineItems: (storageInfo?.offlineWorkouts || 0) + 
                            (storageInfo?.offlineMeals || 0) + 
                            (storageInfo?.offlineExercises || 0),
        storageInfo
      };
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return {
        isOnline: this.isOnline,
        syncInProgress: this.syncInProgress,
        lastSyncTime: this.lastSyncTime,
        pendingOfflineItems: 0,
        storageInfo: null
      };
    }
  }

  // Force sync now
  async forceSyncNow() {
    if (this.isOnline) {
      await this.performFullSync();
    } else {
      console.log('⚠️ Cannot sync while offline');
    }
  }

  // Clean up
  destroy() {
    this.stopAutoSync();
    this.syncCallbacks = [];
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

export const realTimeSyncService = new RealTimeSyncService();
export default realTimeSyncService;