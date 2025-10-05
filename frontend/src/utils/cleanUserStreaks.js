// Clean User Streaks - Remove fake/global streak data and ensure user-specific tracking
// This utility ensures only authenticated users see their own streak data

console.log('🧹 Cleaning fake streak data and implementing user-specific tracking...');

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

// Clean fake streak data
function cleanFakeStreakData() {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      console.log('🔒 No authenticated user - clearing all streak data');
      
      // Remove all streak-related keys
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('streak')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed fake streak key: ${key}`);
      });
      
      return;
    }
    
    const userId = currentUser.id || currentUser._id;
    console.log(`🧹 Cleaning streak data for user: ${userId}`);
    
    // Remove old global streak data
    const oldKeys = [
      'gymtracker_streak_data',
      'streak_data',
      'currentStreak',
      'longestStreak',
      'totalCheckIns'
    ];
    
    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed old global streak key: ${key}`);
      }
    });
    
    // Ensure user-specific streak key exists with zero data for new users
    const userStreakKey = `gymtracker_streak_data_${userId}`;
    const existingData = localStorage.getItem(userStreakKey);
    
    if (!existingData) {
      const freshUserStreak = {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        lastCheckInDate: null,
        streakStartDate: null,
        canCheckIn: true,
        userId: userId,
        createdAt: new Date().toISOString(),
        version: '3.0'
      };
      
      localStorage.setItem(userStreakKey, JSON.stringify(freshUserStreak));
      console.log(`✅ Created fresh streak data for user ${userId}:`, freshUserStreak);
    } else {
      const userData = JSON.parse(existingData);
      console.log(`📊 Existing streak data for user ${userId}:`, userData);
      
      // Validate user data
      if (!userData.userId || userData.userId !== userId) {
        console.log('🔄 Updating userId in existing streak data');
        userData.userId = userId;
        userData.version = '3.0';
        userData.updatedAt = new Date().toISOString();
        localStorage.setItem(userStreakKey, JSON.stringify(userData));
      }
    }
    
    console.log('✅ Streak data cleanup completed successfully');
    
  } catch (error) {
    console.error('❌ Error cleaning streak data:', error);
  }
}

// Validate user-specific streak data
function validateUserStreakData() {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      console.log('🔒 No authenticated user - no validation needed');
      return { valid: true, streakData: null };
    }
    
    const userId = currentUser.id || currentUser._id;
    const userStreakKey = `gymtracker_streak_data_${userId}`;
    const streakData = localStorage.getItem(userStreakKey);
    
    if (!streakData) {
      console.log(`⚠️ No streak data found for user ${userId}`);
      return { valid: false, streakData: null };
    }
    
    const parsed = JSON.parse(streakData);
    
    // Validate data structure
    const isValid = (
      typeof parsed.currentStreak === 'number' &&
      typeof parsed.longestStreak === 'number' &&
      typeof parsed.totalCheckIns === 'number' &&
      parsed.userId === userId
    );
    
    if (isValid) {
      console.log(`✅ Valid streak data for user ${userId}:`, parsed);
      return { valid: true, streakData: parsed };
    } else {
      console.log(`❌ Invalid streak data for user ${userId}:`, parsed);
      return { valid: false, streakData: parsed };
    }
    
  } catch (error) {
    console.error('❌ Error validating streak data:', error);
    return { valid: false, streakData: null };
  }
}

// Force refresh streak stats across all pages
function forceStreakStatsRefresh() {
  try {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      console.log('🔒 No authenticated user - dispatching zero streak stats');
      
      // Dispatch zero stats for unauthenticated users
      const zeroStats = {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        canCheckIn: true,
        lastCheckInDate: null,
        streakStartDate: null
      };
      
      window.dispatchEvent(new CustomEvent('streakUpdated', { 
        detail: { 
          ...zeroStats,
          type: 'STREAK_CLEANED',
          source: 'cleanup'
        }
      }));
      
      return;
    }
    
    const userId = currentUser.id || currentUser._id;
    const validation = validateUserStreakData();
    
    if (validation.valid && validation.streakData) {
      console.log(`📡 Broadcasting user ${userId} streak stats:`, validation.streakData);
      
      // Dispatch user-specific stats
      window.dispatchEvent(new CustomEvent('streakUpdated', { 
        detail: { 
          ...validation.streakData,
          type: 'STREAK_REFRESHED',
          source: 'cleanup',
          userId: userId
        }
      }));
      
      // Also dispatch to specific page events
      const events = [
        'dashboardStreakUpdate',
        'homeStreakUpdate', 
        'analyticsStreakUpdate'
      ];
      
      events.forEach(eventName => {
        window.dispatchEvent(new CustomEvent(eventName, { 
          detail: validation.streakData 
        }));
      });
      
    } else {
      console.log(`⚠️ Invalid streak data for user ${userId}, creating fresh data`);
      cleanFakeStreakData();
      forceStreakStatsRefresh(); // Retry after cleanup
    }
    
  } catch (error) {
    console.error('❌ Error refreshing streak stats:', error);
  }
}

// Main cleanup function
function runStreakCleanup() {
  console.log('🚀 Running comprehensive streak cleanup...');
  
  try {
    // Step 1: Clean fake data
    cleanFakeStreakData();
    
    // Step 2: Validate user data
    const validation = validateUserStreakData();
    console.log('📊 Validation result:', validation);
    
    // Step 3: Force refresh stats
    forceStreakStatsRefresh();
    
    // Step 4: Show success message
    const currentUser = getCurrentUser();
    const message = currentUser 
      ? `✅ Streak cleanup completed for user ${currentUser.id || currentUser._id}`
      : '✅ Streak cleanup completed - showing zero data for unauthenticated user';
    
    console.log(message);
    
    // Notification removed as requested
    
    return true;
    
  } catch (error) {
    console.error('❌ Streak cleanup failed:', error);
    return false;
  }
}

// Auto-run cleanup when script loads
if (typeof window !== 'undefined') {
  // Run cleanup after a short delay to ensure other services are loaded
  setTimeout(() => {
    runStreakCleanup();
  }, 500);
  
  // Listen for user login/logout events
  window.addEventListener('userDataInitialized', () => {
    console.log('👤 User data initialized - running streak cleanup');
    runStreakCleanup();
  });
  
  window.addEventListener('userLoggedOut', () => {
    console.log('👤 User logged out - clearing streak data');
    cleanFakeStreakData();
    forceStreakStatsRefresh();
  });
  
  // Make functions available globally for manual testing
  window.cleanUserStreaks = runStreakCleanup;
  window.validateUserStreakData = validateUserStreakData;
  window.forceStreakStatsRefresh = forceStreakStatsRefresh;
}

export { 
  cleanFakeStreakData, 
  validateUserStreakData, 
  forceStreakStatsRefresh, 
  runStreakCleanup 
};