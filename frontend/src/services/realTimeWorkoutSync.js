// Real-Time Workout Synchronization Service
// Handles instant updates across Home, Dashboard, Analytics, and Workouts pages

class RealTimeWorkoutSync {
  constructor() {
    this.listeners = new Set();
    this.stats = {
      totalWorkouts: 0,
      todayWorkouts: 0,
      weeklyWorkouts: 0,
      monthlyWorkouts: 0,
      totalCalories: 0,
      totalDuration: 0,
      lastUpdate: null
    };
    
    // Initialize stats on startup
    this.refreshStats();
    
    // Listen for storage changes from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === 'workoutSync_workouts') {
        this.refreshStats();
        this.broadcastUpdate();
      }
    });
  }

  // Get current stats
  getStats() {
    return { ...this.stats };
  }

  // Refresh stats from all data sources
  refreshStats() {
    try {
      // Clean fake workouts first
      this.cleanFakeWorkouts();
      
      // Get workouts from workoutSync service
      const workoutSyncData = this.getWorkoutSyncData();
      
      // Get workouts from MongoDB/API (if available)
      const mongoData = this.getMongoWorkouts();
      
      // Combine and calculate stats
      const allWorkouts = [...workoutSyncData, ...mongoData];
      const uniqueWorkouts = this.deduplicateWorkouts(allWorkouts);
      
      this.stats = this.calculateStats(uniqueWorkouts);
      this.stats.lastUpdate = new Date().toISOString();
      
      console.log('📊 RealTimeWorkoutSync: Stats refreshed:', this.stats);
      
      return this.stats;
    } catch (error) {
      console.error('❌ Error refreshing workout stats:', error);
      return this.stats;
    }
  }

  // Get workouts from workoutSync service
  getWorkoutSyncData() {
    try {
      const workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
      return workouts.filter(w => w.completed && w.completedAt);
    } catch (error) {
      console.warn('⚠️ Error loading workoutSync data:', error);
      return [];
    }
  }

  // Get workouts from MongoDB/API cache
  getMongoWorkouts() {
    try {
      // Check for cached MongoDB data
      const cached = localStorage.getItem('mongodb_workouts_cache');
      if (cached) {
        const data = JSON.parse(cached);
        const cacheAge = Date.now() - new Date(data.timestamp).getTime();
        
        // Use cache if less than 5 minutes old
        if (cacheAge < 5 * 60 * 1000) {
          return data.workouts.filter(w => w.completed || w.completedAt);
        }
      }
      return [];
    } catch (error) {
      console.warn('⚠️ Error loading MongoDB cache:', error);
      return [];
    }
  }

  // Remove duplicate workouts
  deduplicateWorkouts(workouts) {
    const seen = new Set();
    return workouts.filter(workout => {
      const key = `${workout.id || workout._id || workout.exercise}_${workout.completedAt}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Calculate stats from workouts
  calculateStats(workouts) {
    const now = new Date();
    const today = now.toDateString();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const todayWorkouts = workouts.filter(w => 
      new Date(w.completedAt).toDateString() === today
    ).length;

    const weeklyWorkouts = workouts.filter(w => 
      new Date(w.completedAt) >= weekAgo
    ).length;

    const monthlyWorkouts = workouts.filter(w => 
      new Date(w.completedAt) >= monthAgo
    ).length;

    const totalCalories = workouts.reduce((sum, w) => 
      sum + (w.caloriesBurned || w.calories || 0), 0
    );

    const totalDuration = workouts.reduce((sum, w) => 
      sum + (w.duration || 0), 0
    );

    return {
      totalWorkouts: workouts.length,
      todayWorkouts,
      weeklyWorkouts,
      monthlyWorkouts,
      totalCalories,
      totalDuration
    };
  }

  // Add a completed workout and update stats
  addCompletedWorkout(workoutData) {
    try {
      // Validate workout data - reject fake/empty workouts
      if (!workoutData.exercise || 
          workoutData.exercise === 'Workout' || 
          (!workoutData.duration && !workoutData.caloriesBurned) ||
          (workoutData.duration === 0 && workoutData.caloriesBurned === 0)) {
        console.log('⚠️ RealTimeWorkoutSync: Invalid workout data rejected:', workoutData);
        return null;
      }

      // Ensure workout has required fields
      const workout = {
        id: workoutData.id || `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        exercise: workoutData.exercise,
        completed: true,
        completedAt: workoutData.completedAt || new Date().toISOString(),
        duration: workoutData.duration || 0,
        caloriesBurned: workoutData.caloriesBurned || workoutData.calories || 0,
        sets: workoutData.sets || 0,
        reps: workoutData.reps || 0,
        category: workoutData.category || 'General',
        difficulty: workoutData.difficulty || 'Intermediate',
        notes: workoutData.notes || '',
        savedOffline: workoutData.savedOffline || false,
        synced: workoutData.synced !== false,
        ...workoutData
      };

      // Add to workoutSync storage
      const existingWorkouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
      
      // Enhanced duplicate check
      const exists = existingWorkouts.some(w => 
        w.id === workout.id || 
        (w.exercise === workout.exercise && 
         Math.abs(new Date(w.completedAt) - new Date(workout.completedAt)) < 5000) // 5 second window
      );

      if (!exists) {
        existingWorkouts.unshift(workout);
        localStorage.setItem('workoutSync_workouts', JSON.stringify(existingWorkouts));
        
        // Refresh stats immediately
        this.refreshStats();
        
        // Broadcast to all listeners
        this.broadcastUpdate();
        
        // Dispatch custom events for different pages
        this.dispatchWorkoutCompleted(workout);
        
        console.log('✅ RealTimeWorkoutSync: Workout added and synced:', workout);
        return workout;
      } else {
        console.log('⚠️ RealTimeWorkoutSync: Duplicate workout skipped:', workout);
        return null;
      }
    } catch (error) {
      console.error('❌ Error adding completed workout:', error);
      return null;
    }
  }

  // Dispatch workout completion events to all pages
  dispatchWorkoutCompleted(workout) {
    const events = [
      'workoutCompleted',
      'realTimeStatsUpdate',
      'homeStatsUpdate',
      'dashboardStatsUpdate',
      'analyticsStatsUpdate',
      'workoutsPageUpdate'
    ];

    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: {
          workout,
          stats: this.stats,
          timestamp: new Date().toISOString()
        }
      }));
    });

    console.log('📡 RealTimeWorkoutSync: Events dispatched for workout completion');
  }

  // Broadcast stats update to all listeners
  broadcastUpdate() {
    this.listeners.forEach(callback => {
      try {
        callback(this.stats);
      } catch (error) {
        console.error('❌ Error in stats listener:', error);
      }
    });

    // Dispatch general stats update event
    window.dispatchEvent(new CustomEvent('realTimeStatsSync', {
      detail: this.stats
    }));
  }

  // Subscribe to stats updates
  subscribe(callback) {
    this.listeners.add(callback);
    
    // Immediately call with current stats
    callback(this.stats);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Force refresh from all sources
  async forceRefresh() {
    try {
      console.log('🔄 RealTimeWorkoutSync: Force refresh initiated');
      
      // Try to fetch fresh data from API if available
      if (window.api) {
        try {
          const response = await window.api.get('/workouts');
          if (response.data && Array.isArray(response.data)) {
            // Cache MongoDB data
            localStorage.setItem('mongodb_workouts_cache', JSON.stringify({
              workouts: response.data,
              timestamp: new Date().toISOString()
            }));
          }
        } catch (apiError) {
          console.warn('⚠️ API refresh failed:', apiError.message);
        }
      }
      
      // Refresh stats
      this.refreshStats();
      this.broadcastUpdate();
      
      console.log('✅ RealTimeWorkoutSync: Force refresh completed');
      return { success: true, stats: this.stats };
    } catch (error) {
      console.error('❌ Force refresh failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get workout history for specific time period
  getWorkoutHistory(days = 30) {
    try {
      const workouts = this.getWorkoutSyncData();
      const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      return workouts
        .filter(w => new Date(w.completedAt) >= cutoff)
        .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    } catch (error) {
      console.error('❌ Error getting workout history:', error);
      return [];
    }
  }

  // Clean fake workouts
  cleanFakeWorkouts() {
    try {
      const workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
      const realWorkouts = workouts.filter(workout => {
        return workout.exercise && 
               workout.exercise !== 'Workout' && 
               (workout.duration > 0 || workout.caloriesBurned > 0) &&
               workout.completedAt &&
               !workout.id.includes('test_') &&
               !workout.id.includes('fake_');
      });
      
      // Remove duplicates based on exercise name and completion time
      const uniqueWorkouts = [];
      const seen = new Set();
      
      for (const workout of realWorkouts) {
        const key = `${workout.exercise}_${new Date(workout.completedAt).toDateString()}`;
        if (!seen.has(key)) {
          seen.add(key);
          uniqueWorkouts.push(workout);
        }
      }
      
      if (uniqueWorkouts.length !== workouts.length) {
        localStorage.setItem('workoutSync_workouts', JSON.stringify(uniqueWorkouts));
        console.log(`🧹 Cleaned workouts: ${workouts.length} → ${uniqueWorkouts.length}`);
      }
    } catch (error) {
      console.warn('⚠️ Error cleaning fake workouts:', error);
    }
  }

  // Delete specific workout
  async deleteWorkout(workoutId) {
    try {
      // Delete from localStorage
      const workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
      const updated = workouts.filter(w => w.id !== workoutId);
      localStorage.setItem('workoutSync_workouts', JSON.stringify(updated));
      
      // Refresh stats and broadcast
      this.refreshStats();
      this.broadcastUpdate();
      
      console.log('✅ RealTimeWorkoutSync: Workout deleted:', workoutId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting workout:', error);
      return { success: false, error: error.message };
    }
  }

  // Clear all workout data (for testing)
  clearAllData() {
    localStorage.removeItem('workoutSync_workouts');
    localStorage.removeItem('mongodb_workouts_cache');
    this.refreshStats();
    this.broadcastUpdate();
    console.log('🧹 RealTimeWorkoutSync: All data cleared');
  }
}

// Create singleton instance
export const realTimeWorkoutSync = new RealTimeWorkoutSync();

// Make available globally
if (typeof window !== 'undefined') {
  window.realTimeWorkoutSync = realTimeWorkoutSync;
}

// Export for use in components
export default realTimeWorkoutSync;