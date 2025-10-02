// Real-Time Streak Synchronization Service
// Ensures all pages (Dashboard, Home, Analytics) display consistent streak data

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

  // Initialize the sync service
  initialize() {
    if (this.isInitialized) return;
    
    console.log('🔥 REAL-TIME STREAK SYNC: Initializing...');
    
    // Load initial data
    this.loadStreakData();
    
    // Set up periodic sync (every 30 seconds)
    this.syncInterval = setInterval(() => {
      this.syncStreakData();
    }, 30000);
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', (event) => {
      if (event.key === 'gymtracker_streak_data') {
        console.log('🔥 SYNC: Storage change detected, syncing...');
        this.loadStreakData();
        this.broadcastToAllPages();
      }
    });
    
    this.isInitialized = true;
    console.log('✅ REAL-TIME STREAK SYNC: Initialized successfully');
  }

  // Load streak data using the calculator
  loadStreakData() {
    try {
      // Use the streak calculator for consistent data loading
      const calculatorData = streakCalculator.getStreakStats();
      
      this.currentStreakData = {
        ...calculatorData,
        lastSyncTime: new Date().toISOString()
      };
      
      console.log('📱 SYNC: Streak data loaded via calculator:', this.currentStreakData);
      return this.currentStreakData;
    } catch (error) {
      console.error('❌ SYNC: Failed to load streak data:', error);
      
      // Fallback to default data
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

  // Update streak data and broadcast to all subscribers
  updateStreakData(newData) {
    console.log('🔥 SYNC: Updating streak data:', newData);
    
    this.currentStreakData = {
      ...this.currentStreakData,
      ...newData,
      lastSyncTime: new Date().toISOString()
    };
    
    // Save using the calculator for consistency
    try {
      streakCalculator.saveStreakData(this.currentStreakData);
    } catch (error) {
      console.error('❌ SYNC: Failed to save streak data:', error);
    }
    
    // Broadcast to all subscribers
    this.broadcastToSubscribers();
    
    // Broadcast to all pages via events
    this.broadcastToAllPages();
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
      'analyticsStreakUpdate'
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: eventData 
      }));
    });
    
    console.log('📡 SYNC: Broadcasted to all pages:', eventData);
  }

  // Sync streak data using the calculator
  syncStreakData() {
    try {
      // Use the calculator to validate and get current streak status
      const validatedData = streakCalculator.validateStreak();
      console.log('🔥 SYNC: Validated streak data:', validatedData);
      
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

  // Get streak statistics using the calculator
  getStreakStats() {
    try {
      const calculatorStats = streakCalculator.getStreakStats();
      const currentData = this.getCurrentStreakData();
      
      return {
        ...calculatorStats,
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