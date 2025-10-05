// Initialize Streak Synchronization Across All Pages
// Ensures streak stats are properly loaded and synchronized

import { realTimeStreakSync } from '../services/realTimeStreakSync.js';

// Initialize streak sync for current user
export const initializeStreakSync = () => {
  try {
    console.log('🔥 Initializing streak sync across all pages...');
    
    // Get current user
    const getCurrentUser = () => {
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
    };
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('🔒 No authenticated user - skipping streak sync initialization');
      return;
    }
    
    const userId = currentUser.id || currentUser._id;
    console.log(`🔥 Initializing streak sync for user: ${userId}`);
    
    // Force load current streak data
    const streakStats = realTimeStreakSync.getStreakStats();
    console.log(`📊 Current streak stats for user ${userId}:`, streakStats);
    
    // Dispatch initial streak data to all pages
    const initialEventData = {
      ...streakStats,
      type: 'STREAK_INIT',
      userId: userId,
      source: 'initializeStreakSync',
      timestamp: new Date().toISOString()
    };
    
    // Dispatch to all page-specific events
    const events = [
      'streakUpdated',
      'homeStreakUpdate', 
      'dashboardStreakUpdate',
      'analyticsStreakUpdate',
      'realTimeStatsUpdate'
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: initialEventData
      }));
    });
    
    console.log('📡 Dispatched initial streak data to all pages:', initialEventData);
    
    // Set up periodic sync every 30 seconds
    const syncInterval = setInterval(() => {
      try {
        const currentUser = getCurrentUser();
        if (!currentUser) {
          console.log('🔒 No user - stopping periodic sync');
          clearInterval(syncInterval);
          return;
        }
        
        // Sync streak data
        realTimeStreakSync.syncStreakData();
        console.log('🔄 Periodic streak sync completed');
      } catch (error) {
        console.error('❌ Periodic sync error:', error);
      }
    }, 30000);
    
    // Store interval reference for cleanup
    window.streakSyncInterval = syncInterval;
    
    console.log('✅ Streak sync initialization completed');
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize streak sync:', error);
    return false;
  }
};

// Cleanup streak sync
export const cleanupStreakSync = () => {
  try {
    if (window.streakSyncInterval) {
      clearInterval(window.streakSyncInterval);
      window.streakSyncInterval = null;
      console.log('🧹 Streak sync interval cleared');
    }
  } catch (error) {
    console.error('❌ Error cleaning up streak sync:', error);
  }
};

// Force refresh streak stats across all pages
export const forceStreakRefresh = () => {
  try {
    console.log('🔄 Force refreshing streak stats...');
    
    const getCurrentUser = () => {
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
            return null;
          }
        }
        
        return null;
      } catch (error) {
        return null;
      }
    };
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('🔒 No authenticated user - cannot refresh streak');
      return;
    }
    
    const userId = currentUser.id || currentUser._id;
    
    // Get fresh streak data
    const streakStats = realTimeStreakSync.getStreakStats();
    console.log(`📊 Fresh streak stats for user ${userId}:`, streakStats);
    
    // Dispatch refresh events
    const refreshEventData = {
      ...streakStats,
      type: 'STREAK_REFRESH',
      userId: userId,
      source: 'forceStreakRefresh',
      timestamp: new Date().toISOString()
    };
    
    const events = [
      'streakUpdated',
      'homeStreakUpdate', 
      'dashboardStreakUpdate',
      'analyticsStreakUpdate',
      'realTimeStatsUpdate'
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: refreshEventData
      }));
    });
    
    console.log('📡 Force refreshed streak data across all pages:', refreshEventData);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to force refresh streak:', error);
    return false;
  }
};

// Auto-initialize when script loads
if (typeof window !== 'undefined') {
  // Wait for services to be available
  setTimeout(() => {
    initializeStreakSync();
  }, 1000);
  
  // Make functions available globally
  window.initializeStreakSync = initializeStreakSync;
  window.cleanupStreakSync = cleanupStreakSync;
  window.forceStreakRefresh = forceStreakRefresh;
}

export default {
  initializeStreakSync,
  cleanupStreakSync,
  forceStreakRefresh
};