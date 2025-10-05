// Force Streak Stats Refresh - Ensure streak stats update across all pages
// This utility forces streak stats to refresh on Home, Dashboard, and Analytics pages

console.log('🔄 Force Streak Stats Refresh utility loaded');

// Get current authenticated user
function getCurrentUser() {
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

// Get user-specific streak data
function getUserStreakData() {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('🔒 No authenticated user - returning zero streak data');
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        lastCheckInDate: null,
        streakStartDate: null,
        canCheckIn: true
      };
    }
    
    const userId = currentUser.id || currentUser._id;
    const userStreakKey = `gymtracker_streak_data_${userId}`;
    const streakData = localStorage.getItem(userStreakKey);
    
    if (streakData) {
      const parsed = JSON.parse(streakData);
      console.log(`📊 User ${userId} streak data:`, parsed);
      return parsed;
    } else {
      console.log(`📊 No streak data for user ${userId} - returning zeros`);
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        lastCheckInDate: null,
        streakStartDate: null,
        canCheckIn: true,
        userId: userId
      };
    }
  } catch (error) {
    console.error('❌ Error getting user streak data:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      lastCheckInDate: null,
      streakStartDate: null,
      canCheckIn: true
    };
  }
}

// Force refresh streak stats across all pages
function forceStreakStatsRefresh() {
  try {
    console.log('🚀 Force refreshing streak stats across all pages...');
    
    const currentUser = getCurrentUser();
    const streakData = getUserStreakData();
    
    console.log('📊 Current streak data:', streakData);
    
    // Create comprehensive event data
    const eventData = {
      ...streakData,
      type: 'STREAK_FORCE_REFRESH',
      source: 'forceStreakStatsRefresh',
      userId: currentUser?.id || currentUser?._id || null,
      timestamp: new Date().toISOString(),
      isAuthenticated: !!currentUser
    };
    
    // Dispatch to all page-specific events
    const events = [
      'streakUpdated',
      'homeStreakUpdate',
      'dashboardStreakUpdate', 
      'analyticsStreakUpdate',
      'realTimeStatsUpdate',
      'realTimeStatsSync'
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: eventData 
      }));
      console.log(`📡 Dispatched ${eventName} with streak data`);
    });
    
    // Also trigger real-time streak sync if available
    if (window.realTimeStreakSync) {
      try {
        window.realTimeStreakSync.loadStreakData();
        window.realTimeStreakSync.broadcastToAllPages();
        console.log('✅ Triggered real-time streak sync');
      } catch (error) {
        console.warn('⚠️ Failed to trigger real-time streak sync:', error);
      }
    }
    
    // Trigger workout stats refresh as well
    if (window.realTimeWorkoutSync) {
      try {
        window.realTimeWorkoutSync.broadcastUpdate();
        console.log('✅ Triggered workout stats refresh');
      } catch (error) {
        console.warn('⚠️ Failed to trigger workout stats refresh:', error);
      }
    }
    
    console.log('✅ Force streak stats refresh completed');
    return true;
    
  } catch (error) {
    console.error('❌ Force streak stats refresh failed:', error);
    return false;
  }
}

// Auto-refresh streak stats when user data changes
function setupStreakStatsAutoRefresh() {
  try {
    console.log('🔧 Setting up streak stats auto-refresh...');
    
    // Listen for user login/logout events
    window.addEventListener('userDataInitialized', () => {
      console.log('👤 User data initialized - refreshing streak stats');
      setTimeout(() => forceStreakStatsRefresh(), 500);
    });
    
    window.addEventListener('userLoggedOut', () => {
      console.log('👤 User logged out - clearing streak stats');
      setTimeout(() => forceStreakStatsRefresh(), 500);
    });
    
    // Listen for storage changes (cross-tab sync)
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.includes('gymtracker_streak_data')) {
        console.log('💾 Streak data changed in storage - refreshing stats');
        setTimeout(() => forceStreakStatsRefresh(), 200);
      }
    });
    
    console.log('✅ Streak stats auto-refresh setup completed');
    
  } catch (error) {
    console.error('❌ Failed to setup streak stats auto-refresh:', error);
  }
}

// Initialize when script loads
if (typeof window !== 'undefined') {
  // Setup auto-refresh
  setupStreakStatsAutoRefresh();
  
  // Make functions available globally
  window.forceStreakStatsRefresh = forceStreakStatsRefresh;
  window.getUserStreakData = getUserStreakData;
  
  // Initial refresh after a short delay
  setTimeout(() => {
    forceStreakStatsRefresh();
  }, 1000);
}

export { forceStreakStatsRefresh, getUserStreakData, setupStreakStatsAutoRefresh };