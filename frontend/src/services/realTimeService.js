// Real-Time Service for Progress & Analytics
import api from '../utils/api';

class RealTimeService {
  constructor() {
    this.isActive = false;
    this.updateInterval = null;
    this.eventListeners = new Map();
  }

  // Start real-time tracking
  startRealTimeTracking() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔴 Real-time tracking started');
    
    // Set up event listeners for instant updates
    this.setupEventListeners();
    
    // Periodic sync every 10 seconds
    this.updateInterval = setInterval(() => {
      this.syncAnalytics();
    }, 10000);
  }

  // Stop real-time tracking
  stopRealTimeTracking() {
    if (!this.isActive) return;
    
    this.isActive = false;
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.removeEventListeners();
    console.log('⏹️ Real-time tracking stopped');
  }

  // Setup event listeners for instant updates
  setupEventListeners() {
    // Listen for workout completion
    const workoutHandler = (event) => {
      this.trackEvent('workout_completed', event.detail);
    };
    
    // Listen for meal logging
    const mealHandler = (event) => {
      this.trackEvent('meal_logged', event.detail);
    };
    
    // Listen for plan creation
    const planHandler = (event) => {
      this.trackEvent('plan_created', event.detail);
    };
    
    window.addEventListener('workoutCompleted', workoutHandler);
    window.addEventListener('mealLogged', mealHandler);
    window.addEventListener('planCreated', planHandler);
    
    // Store handlers for cleanup
    this.eventListeners.set('workoutCompleted', workoutHandler);
    this.eventListeners.set('mealLogged', mealHandler);
    this.eventListeners.set('planCreated', planHandler);
  }

  // Remove event listeners
  removeEventListeners() {
    this.eventListeners.forEach((handler, eventType) => {
      window.removeEventListener(eventType, handler);
    });
    this.eventListeners.clear();
  }

  // Track real-time events
  async trackEvent(eventType, eventData = {}) {
    try {
      const response = await api.post('/analytics/track-event', {
        eventType,
        eventData,
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        // Dispatch custom event with updated analytics
        window.dispatchEvent(new CustomEvent('analyticsUpdated', {
          detail: {
            analytics: response.data.analytics,
            eventType,
            timestamp: response.data.timestamp
          }
        }));
        
        console.log(`✅ Real-time event tracked: ${eventType}`);
        return response.data.analytics;
      }
    } catch (error) {
      console.error(`❌ Failed to track event ${eventType}:`, error);
      
      // Fallback to local storage update
      this.updateLocalStats(eventType);
      return null;
    }
  }

  // Sync analytics data
  async syncAnalytics() {
    try {
      const response = await api.get('/analytics');
      
      if (response.data.success) {
        // Update local storage
        localStorage.setItem('realTimeStats', JSON.stringify(response.data.data));
        
        // Dispatch update event
        window.dispatchEvent(new CustomEvent('analyticsUpdated', {
          detail: {
            analytics: response.data.data,
            eventType: 'sync',
            timestamp: new Date().toISOString()
          }
        }));
        
        return response.data.data;
      }
    } catch (error) {
      console.error('❌ Analytics sync failed:', error);
      return null;
    }
  }

  // Update local stats when offline
  updateLocalStats(eventType) {
    try {
      const currentStats = JSON.parse(localStorage.getItem('realTimeStats') || '{}');
      
      switch (eventType) {
        case 'workout_completed':
          currentStats.totalWorkouts = (currentStats.totalWorkouts || 0) + 1;
          currentStats.xpPoints = (currentStats.xpPoints || 0) + 100;
          break;
          
        case 'meal_logged':
          currentStats.totalMeals = (currentStats.totalMeals || 0) + 1;
          currentStats.xpPoints = (currentStats.xpPoints || 0) + 50;
          break;
          
        case 'plan_created':
          currentStats.totalPlans = (currentStats.totalPlans || 0) + 1;
          currentStats.xpPoints = (currentStats.xpPoints || 0) + 150;
          break;
      }
      
      currentStats.lastUpdated = new Date().toISOString();
      localStorage.setItem('realTimeStats', JSON.stringify(currentStats));
      
      // Dispatch local update event
      window.dispatchEvent(new CustomEvent('analyticsUpdated', {
        detail: {
          analytics: currentStats,
          eventType: eventType + '_offline',
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log(`📱 Local stats updated: ${eventType}`);
    } catch (error) {
      console.error('❌ Failed to update local stats:', error);
    }
  }

  // Trigger workout completion
  async completeWorkout(workoutData = {}) {
    try {
      // Save workout to backend
      const response = await api.post('/analytics/track-workout-completion', {
        workoutData
      });
      
      if (response.data.success) {
        // Trigger real-time event
        window.dispatchEvent(new CustomEvent('workoutCompleted', {
          detail: {
            workout: workoutData,
            stats: response.data.stats,
            timestamp: new Date().toISOString()
          }
        }));
        
        console.log('💪 Workout completed and tracked in real-time');
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to complete workout:', error);
      
      // Fallback to local tracking
      this.updateLocalStats('workout_completed');
      
      window.dispatchEvent(new CustomEvent('workoutCompleted', {
        detail: {
          workout: workoutData,
          offline: true,
          timestamp: new Date().toISOString()
        }
      }));
      
      return null;
    }
  }

  // Trigger meal logging
  async logMeal(mealData = {}) {
    try {
      const response = await api.post('/analytics/track-meal-logging', {
        mealData
      });
      
      if (response.data.success) {
        window.dispatchEvent(new CustomEvent('mealLogged', {
          detail: {
            meal: mealData,
            timestamp: new Date().toISOString()
          }
        }));
        
        console.log('🍎 Meal logged and tracked in real-time');
        return response.data;
      }
    } catch (error) {
      console.error('❌ Failed to log meal:', error);
      
      this.updateLocalStats('meal_logged');
      
      window.dispatchEvent(new CustomEvent('mealLogged', {
        detail: {
          meal: mealData,
          offline: true,
          timestamp: new Date().toISOString()
        }
      }));
      
      return null;
    }
  }

  // Trigger plan creation
  async createPlan(planData = {}) {
    try {
      window.dispatchEvent(new CustomEvent('planCreated', {
        detail: {
          plan: planData,
          timestamp: new Date().toISOString()
        }
      }));
      
      console.log('📋 Plan created and tracked in real-time');
      
      // Update stats
      this.trackEvent('plan_created', planData);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to track plan creation:', error);
      return false;
    }
  }

  // Get current analytics
  async getCurrentAnalytics() {
    try {
      const response = await api.get('/analytics');
      return response.data.success ? response.data.data : null;
    } catch (error) {
      console.error('❌ Failed to get current analytics:', error);
      
      // Fallback to local storage
      const localStats = localStorage.getItem('realTimeStats');
      return localStats ? JSON.parse(localStats) : null;
    }
  }

  // Force refresh analytics
  async forceRefresh() {
    console.log('🔄 Force refreshing analytics...');
    return await this.syncAnalytics();
  }
}

// Create singleton instance
export const realTimeService = new RealTimeService();

// Auto-start when online
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    realTimeService.startRealTimeTracking();
  });
  
  // Handle online/offline events
  window.addEventListener('online', () => {
    console.log('🌐 Back online - resuming real-time tracking');
    realTimeService.startRealTimeTracking();
    realTimeService.syncAnalytics();
  });
  
  window.addEventListener('offline', () => {
    console.log('📱 Gone offline - switching to local tracking');
  });
}

export default realTimeService;