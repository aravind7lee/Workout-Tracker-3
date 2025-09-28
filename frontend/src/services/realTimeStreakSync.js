// Real-Time Streak Synchronization Service
// Ensures all pages (Dashboard, Home, Analytics) display consistent streak data

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

  // Load streak data from localStorage
  loadStreakData() {
    try {
      const saved = localStorage.getItem('gymtracker_streak_data');
      if (saved) {
        const data = JSON.parse(saved);
        this.currentStreakData = {
          ...data,
          lastSyncTime: new Date().toISOString()
        };
        console.log('📱 SYNC: Streak data loaded:', this.currentStreakData);
        return this.currentStreakData;
      }
    } catch (error) {
      console.error('❌ SYNC: Failed to load streak data:', error);
    }
    
    // Return default data if nothing found
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
    
    // Save to localStorage
    try {
      localStorage.setItem('gymtracker_streak_data', JSON.stringify(this.currentStreakData));
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

  // Sync streak data (validate and update if needed)
  syncStreakData() {
    const current = this.loadStreakData();
    const today = new Date().toISOString().split('T')[0];
    
    // Check if streak needs validation
    if (current.lastCheckInDate) {
      const daysDiff = Math.floor((new Date() - new Date(current.lastCheckInDate)) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 1 && current.currentStreak > 0) {
        // Streak broken - reset
        console.log('💔 SYNC: Streak broken, resetting...');
        this.updateStreakData({
          currentStreak: 0,
          streakStartDate: null,
          canCheckIn: true
        });
      } else if (current.lastCheckInDate !== today) {
        // Can check in today
        this.updateStreakData({
          canCheckIn: true
        });
      }
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

  // Get streak statistics for display
  getStreakStats() {
    const data = this.getCurrentStreakData();
    
    return {
      currentStreak: data.currentStreak || 0,
      longestStreak: data.longestStreak || 0,
      totalCheckIns: data.totalCheckIns || 0,
      canCheckIn: data.canCheckIn !== false,
      lastCheckInDate: data.lastCheckInDate,
      streakStartDate: data.streakStartDate,
      isOnline: navigator.onLine,
      lastSyncTime: data.lastSyncTime,
      motivation: this.getMotivationMessage(data.currentStreak || 0)
    };
  }

  // Get motivation message based on streak
  getMotivationMessage(streak) {
    if (streak === 0) return "Ready to start your journey? 💪";
    if (streak < 7) return `${streak} days strong! Building momentum! 🔥`;
    if (streak < 30) return `${streak} days! You're on fire! 🚀`;
    if (streak < 100) return `${streak} days! Absolutely crushing it! ⚡`;
    return `${streak} days! You're a legend! 👑`;
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