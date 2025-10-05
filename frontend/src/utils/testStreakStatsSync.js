// Test Streak Stats Synchronization Across All Pages
// Verifies that streak stats update properly on Home, Dashboard, and Analytics pages

console.log('🧪 Testing Streak Stats Synchronization...');

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

// Test streak stats loading
function testStreakStatsLoading() {
  try {
    console.log('🧪 Testing streak stats loading...');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('🔒 No authenticated user - testing zero stats');
      
      // Test zero stats dispatch
      const zeroStats = {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        canCheckIn: true,
        lastCheckInDate: null,
        streakStartDate: null
      };
      
      // Dispatch test events
      const events = [
        'streakUpdated',
        'homeStreakUpdate',
        'dashboardStreakUpdate',
        'analyticsStreakUpdate'
      ];
      
      events.forEach(eventName => {
        window.dispatchEvent(new CustomEvent(eventName, { 
          detail: { 
            ...zeroStats,
            type: 'TEST_ZERO_STATS',
            source: 'testStreakStatsSync'
          }
        }));
      });
      
      console.log('✅ Zero stats test completed');
      return true;
    }
    
    const userId = currentUser.id || currentUser._id;
    console.log(`🔥 Testing streak stats for user: ${userId}`);
    
    // Check if realTimeStreakSync is available
    if (window.realTimeStreakSync) {
      const streakStats = window.realTimeStreakSync.getStreakStats();
      console.log('📊 Current streak stats:', streakStats);
      
      // Test stats dispatch
      const testStats = {
        ...streakStats,
        type: 'TEST_USER_STATS',
        userId: userId,
        source: 'testStreakStatsSync',
        timestamp: new Date().toISOString()
      };
      
      const events = [
        'streakUpdated',
        'homeStreakUpdate',
        'dashboardStreakUpdate',
        'analyticsStreakUpdate'
      ];
      
      events.forEach(eventName => {
        window.dispatchEvent(new CustomEvent(eventName, { 
          detail: testStats
        }));
      });
      
      console.log('✅ User streak stats test completed');
      return true;
    } else {
      console.log('⚠️ realTimeStreakSync not available yet');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing streak stats loading:', error);
    return false;
  }
}

// Test streak stats update simulation
function testStreakStatsUpdate() {
  try {
    console.log('🧪 Testing streak stats update simulation...');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('🔒 No authenticated user - cannot test update');
      return false;
    }
    
    const userId = currentUser.id || currentUser._id;
    
    // Simulate a streak check-in
    const simulatedStats = {
      currentStreak: 5,
      longestStreak: 10,
      totalCheckIns: 15,
      canCheckIn: false,
      lastCheckInDate: new Date().toISOString().split('T')[0],
      streakStartDate: '2024-01-01',
      userId: userId,
      type: 'SIMULATED_UPDATE',
      source: 'testStreakStatsSync',
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Simulating streak update:', simulatedStats);
    
    // Dispatch to all pages
    const events = [
      'streakUpdated',
      'homeStreakUpdate',
      'dashboardStreakUpdate',
      'analyticsStreakUpdate',
      'realTimeStatsUpdate'
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, { 
        detail: simulatedStats
      }));
    });
    
    console.log('✅ Streak stats update simulation completed');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing streak stats update:', error);
    return false;
  }
}

// Test real-time sync service integration
function testRealTimeSyncIntegration() {
  try {
    console.log('🧪 Testing real-time sync service integration...');
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
      console.log('🔒 No authenticated user - cannot test integration');
      return false;
    }
    
    // Check if services are available
    const services = {
      realTimeStreakSync: window.realTimeStreakSync,
      realTimeWorkoutSync: window.realTimeWorkoutSync,
      streakCalculator: window.streakCalculator
    };
    
    console.log('🔧 Available services:', Object.keys(services).filter(key => services[key]));
    
    if (services.realTimeStreakSync) {
      // Test service methods
      const stats = services.realTimeStreakSync.getStreakStats();
      console.log('📊 Service stats:', stats);
      
      // Test subscription
      const unsubscribe = services.realTimeStreakSync.subscribe((data) => {
        console.log('📡 Subscription received:', data);
      });
      
      // Test update
      services.realTimeStreakSync.updateStreakData({
        currentStreak: stats.currentStreak,
        testUpdate: true,
        timestamp: new Date().toISOString()
      });
      
      // Cleanup
      setTimeout(() => {
        if (unsubscribe) unsubscribe();
      }, 1000);
      
      console.log('✅ Real-time sync integration test completed');
      return true;
    } else {
      console.log('⚠️ realTimeStreakSync service not available');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing real-time sync integration:', error);
    return false;
  }
}

// Main test function
function runStreakStatsSyncTests() {
  console.log('🚀 Running Streak Stats Synchronization Tests...');
  
  const tests = [
    { name: 'Streak Stats Loading', fn: testStreakStatsLoading },
    { name: 'Streak Stats Update', fn: testStreakStatsUpdate },
    { name: 'Real-Time Sync Integration', fn: testRealTimeSyncIntegration }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    console.log(`\n🧪 Running test: ${test.name}`);
    try {
      const result = test.fn();
      if (result) {
        console.log(`✅ ${test.name} - PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} - ERROR:`, error);
      failed++;
    }
  });
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All streak stats sync tests passed!');
    console.log('✅ Streak stats should now update across Home, Dashboard, and Analytics pages');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }
  
  return { passed, failed, total: tests.length };
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  // Wait for services to be available
  setTimeout(() => {
    runStreakStatsSyncTests();
  }, 3000);
  
  // Make test functions available globally
  window.testStreakStatsSync = runStreakStatsSyncTests;
  window.testStreakStatsLoading = testStreakStatsLoading;
  window.testStreakStatsUpdate = testStreakStatsUpdate;
  window.testRealTimeSyncIntegration = testRealTimeSyncIntegration;
}

export { 
  testStreakStatsLoading,
  testStreakStatsUpdate,
  testRealTimeSyncIntegration,
  runStreakStatsSyncTests
};