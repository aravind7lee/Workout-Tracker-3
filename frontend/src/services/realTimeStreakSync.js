// Real-Time Streak Synchronization Service - USER SPECIFIC
// Ensures all pages (Dashboard, Home, Analytics) display consistent USER-SPECIFIC streak data

import streakCalculator from '../utils/streakCalculator.js';

class RealTimeStreakSync {
  constructor() {
    this.listeners = new Set();
    this.currentStreakData = null;
    this.isInitialized = false;
    this.syncInterval = null;
    
    // Initialize immediately
    this.initialize();
  }

  // Get current authenticated user
  getCurrentUser() {
    try {
      const authUser = localStorage.getItem('user');
      if (authUser) {
        return JSON.parse(authUser);
      }
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return { id: payload.userId || payload.id, _id: payload.userId || payload.id };
        } catch (e) {
          console.warn('⚠️ Invalid token format');
        }
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ Error getting current user:', error);
      return null;
    }
  }

  // Initialize the sync service
  initialize() {
    if (this.isInitialized) return;
    
    console.log('🔥 REAL-TIME STREAK SYNC: Initializing...');
    
    // Load initial data
    this.loadStreakData();
    
    // Broadcast initial data immediately
    setTimeout(() => {
      this.broadcastToAllPages();
      console.log('📡 SYNC: Initial broadcast completed');
    }, 1000);
    
    // Set up periodic sync (every 30 seconds)
    this.syncInterval = setInterval(() => {
      this.syncStreakData();
    }, 30000);
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.includes('gymtracker_streak_data')) {
        console.log('🔥 SYNC: Storage change detected, syncing...');
        this.loadStreakData();
        this.broadcastToAllPages();
      }
    });
    
    // Listen for user login/logout events
    window.addEventListener('userLoggedIn', () => {
      console.log('🔥 SYNC: User logged in, refreshing streak data');
      setTimeout(() => {
        this.loadStreakData();
        this.broadcastToAllPages();
      }, 500);
    });
    
    window.addEventListener('userLoggedOut', () => {
      console.log('🔥 SYNC: User logged out, clearing streak data');
      this.currentStreakData = {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        lastCheckInDate: null,
        streakStartDate: null,
        canCheckIn: true,
        lastSyncTime: new Date().toISOString()
      };
      this.broadcastToAllPages();
    });
    
    this.isInitialized = true;
    console.log('✅ REAL-TIME STREAK SYNC: Initialized successfully');
  }

  // Load USER-SPECIFIC streak data
  loadStreakData() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('🔒 No authenticated user - returning zero streak data');
        this.currentStreakData = {
          currentStreak: 0,
          longestStreak: 0,
          totalCheckIns: 0,
          lastCheckInDate: null,
          streakStartDate: null,
          canCheckIn: true,
          lastSyncTime: new Date().toISOString()
        };
        return this.currentStreakData;
      }
      
      // Use user-specific streak calculator
      const calculatorData = streakCalculator.getStreakStats(currentUser.id || currentUser._id);
      
      this.currentStreakData = {
        ...calculatorData,
        userId: currentUser.id || currentUser._id,
        lastSyncTime: new Date().toISOString()
      };
      
      console.log(`📱 SYNC: User ${currentUser.id} streak data loaded:`, this.currentStreakData);
      return this.currentStreakData;
    } catch (error) {
      console.error('❌ SYNC: Failed to load streak data:', error);
      
      // Fallback to zero data for safety
      this.currentStreakData = {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        lastCheckInDate: null,
        streakStartDate: null,
        canCheckIn: true,
        lastSyncTime: new Date().toISOString()
      };
      
      return this.currentStreakData;
    }
  }

  // Get current streak data
  getCurrentStreakData() {
    if (!this.currentStreakData) {
      this.loadStreakData();
    }
    return this.currentStreakData;
  }

  // Subscribe to streak updates
  subscribe(callback) {
    this.listeners.add(callback);
    
    // Immediately send current data to new subscriber
    if (this.currentStreakData) {
      try {
        callback(this.currentStreakData);
      } catch (error) {
        console.error('❌ SYNC: Subscriber callback error:', error);
      }
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Update USER-SPECIFIC streak data and broadcast
  updateStreakData(newData) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      console.log('🔒 No authenticated user - cannot update streak data');
      return;
    }
    
    console.log(`🔥 SYNC: Updating streak data for user ${currentUser.id}:`, newData);
    
    this.currentStreakData = {
      ...this.currentStreakData,
      ...newData,
      userId: currentUser.id || currentUser._id,
      lastSyncTime: new Date().toISOString()
    };
    
    // Save using user-specific calculator
    try {
      streakCalculator.saveStreakData(this.currentStreakData, currentUser.id || currentUser._id);
      console.log('💾 SYNC: Streak data saved to localStorage');
    } catch (error) {
      console.error('❌ SYNC: Failed to save streak data:', error);
    }
    
    // Broadcast to all subscribers immediately
    this.broadcastToSubscribers();
    
    // Broadcast to all pages via events immediately
    this.broadcastToAllPages();
    
    // Force additional broadcast after short delay to ensure all components receive it
    setTimeout(() => {
      this.broadcastToAllPages();
      console.log('📡 SYNC: Secondary broadcast completed');
    }, 100);
  }

  // Broadcast to all subscribers
  broadcastToSubscribers() {
    this.listeners.forEach(callback => {
      try {
        callback(this.currentStreakData);
      } catch (error) {
        console.error('❌ SYNC: Subscriber callback error:', error);
      }
    });
  }

  // Broadcast to all pages via custom events
  broadcastToAllPages() {
    const eventData = {
      ...this.currentStreakData,
      type: 'STREAK_SYNC_UPDATE',
      source: 'realTimeStreakSync',
      timestamp: new Date().toISOString()
    };
    
    // Dispatch to all page-specific events
    const events = [
      'streakUpdated',
      'dashboardStreakUpdate', 
      'homeStreakUpdate',
      'analyticsStreakUpdate',
      'realTimeStatsUpdate' // Also trigger general stats update
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: eventData 
      }));
    });
    
    console.log('📡 SYNC: Broadcasted streak to all pages:', eventData);
    
    // Force refresh real-time stats if available
    if (window.realTimeWorkoutSync) {
      try {
        window.realTimeWorkoutSync.broadcastUpdate();
        console.log('🔄 SYNC: Triggered workout stats refresh');
      } catch (error) {
        console.warn('⚠️ SYNC: Failed to trigger workout stats refresh:', error);
      }
    }
  }

  // Sync USER-SPECIFIC streak data
  syncStreakData() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('🔒 No authenticated user - skipping streak sync');
        return;
      }
      
      // Use user-specific calculator to validate
      const validatedData = streakCalculator.validateStreak(currentUser.id || currentUser._id);
      console.log(`🔥 SYNC: Validated streak data for user ${currentUser.id}:`, validatedData);
      
      // Update with validated data
      this.updateStreakData(validatedData);
      
      // Log the validation result
      if (validatedData.status === 'streak_broken') {
        console.log('💔 SYNC: Streak was broken and reset');
      } else if (validatedData.status === 'can_continue') {
        console.log('✅ SYNC: Can continue streak today');
      } else if (validatedData.status === 'checked_in_today') {
        console.log('✅ SYNC: Already checked in today');
      }
    } catch (error) {
      console.error('❌ SYNC: Streak validation failed:', error);
    }
  }

  // Force sync from server (if available)
  async forceSyncFromServer() {
    try {
      console.log('🚀 SYNC: Force syncing from server...');
      
      // Try to fetch from API
      const response = await fetch('/api/users/streak/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const serverData = await response.json();
        
        // Update with server data if it's more recent
        if (serverData && serverData.currentStreak !== undefined) {
          this.updateStreakData({
            currentStreak: serverData.currentStreak,
            longestStreak: serverData.longestStreak,
            totalCheckIns: serverData.totalCheckIns,
            lastCheckInDate: serverData.lastCheckInDate,
            streakStartDate: serverData.streakStartDate,
            canCheckIn: serverData.canCheckIn,
            synced: true
          });
          
          console.log('✅ SYNC: Server sync successful');
          return true;
        }
      }
    } catch (error) {
      console.warn('⚠️ SYNC: Server sync failed:', error.message);
    }
    
    return false;
  }

  // Get USER-SPECIFIC streak statistics
  getStreakStats() {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        console.log('🔒 No authenticated user - returning zero streak stats');
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalCheckIns: 0,
          canCheckIn: true,
          lastCheckInDate: null,
          streakStartDate: null,
          isOnline: navigator.onLine,
          lastSyncTime: new Date().toISOString(),
          motivation: "Ready to start your journey? 💪",
          nextDay: 1,
          buttonText: '🔥 START DAY 1 STREAK'
        };
      }
      
      const calculatorStats = streakCalculator.getStreakStats(currentUser.id || currentUser._id);
      const currentData = this.getCurrentStreakData();
      
      return {
        ...calculatorStats,
        userId: currentUser.id || currentUser._id,
        isOnline: navigator.onLine,
        lastSyncTime: currentData.lastSyncTime,
        nextDay: (calculatorStats.currentStreak || 0) + 1,
        buttonText: streakCalculator.getCheckInButtonText(calculatorStats)
      };
    } catch (error) {
      console.error('❌ SYNC: Failed to get streak stats:', error);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        canCheckIn: true,
        lastCheckInDate: null,
        streakStartDate: null,
        isOnline: navigator.onLine,
        lastSyncTime: new Date().toISOString(),
        motivation: "Ready to start your journey? 💪",
        nextDay: 1,
        buttonText: '🔥 START DAY 1 STREAK'
      };
    }
  }

  // Get motivation message using the calculator
  getMotivationMessage(streak) {
    return streakCalculator.getMotivationMessage(streak);
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.listeners.clear();
    this.isInitialized = false;
    
    console.log('🔥 SYNC: Service destroyed');
  }
}

// Export singleton instance
export const realTimeStreakSync = new RealTimeStreakSync();
export default realTimeStreakSync;