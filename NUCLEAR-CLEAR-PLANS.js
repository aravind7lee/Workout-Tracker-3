// NUCLEAR OPTION: Completely clear all plan data and force user-specific only
// Run this in browser console to COMPLETELY fix the fake plans issue

console.log('💥 NUCLEAR CLEAR: Removing ALL plan data...');

try {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!currentUser) {
    console.log('🔒 No user - clearing everything');
    localStorage.removeItem('workoutPlans');
    alert('No user logged in. All plan data cleared.');
    location.reload();
    return;
  }
  
  console.log(`👤 Current user: ${currentUser.id} (${currentUser.name})`);
  
  // STEP 1: COMPLETELY CLEAR ALL PLAN DATA
  console.log('🗑️ Step 1: Clearing ALL plan data...');
  localStorage.removeItem('workoutPlans');
  localStorage.removeItem('plans');
  localStorage.removeItem('savedPlans');
  localStorage.removeItem('myPlans');
  
  // STEP 2: Clear all possible cache locations
  console.log('🧹 Step 2: Clearing all caches...');
  if (window.realTimePlanService) {
    window.realTimePlanService.planCache.clear();
    window.realTimePlanService.syncQueue = [];
    console.log('✅ Plan service cache cleared');
  }
  
  // STEP 3: Set empty array for current user
  console.log('📝 Step 3: Setting empty plan array...');
  localStorage.setItem('workoutPlans', JSON.stringify([]));
  
  // STEP 4: Force all components to refresh
  console.log('🔄 Step 4: Force refreshing all components...');
  
  // Dispatch multiple events to ensure everything refreshes
  const events = [
    'userLoggedOut',
    'userDataInitialized',
    'planDataRefresh',
    'dashboardUpdate',
    'realTimeStatsUpdate',
    'myPlansRefresh'
  ];
  
  events.forEach(eventName => {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { 
        type: 'nuclearClear',
        userId: currentUser.id,
        timestamp: new Date().toISOString() 
      }
    }));
  });
  
  console.log('💥 NUCLEAR CLEAR COMPLETE!');
  
  alert(`💥 NUCLEAR CLEAR COMPLETE!\n\nUser: ${currentUser.name}\nAll plan data cleared.\nYou now have 0 plans.\n\nPage will refresh to show clean state.`);
  
  // Force immediate page refresh
  setTimeout(() => {
    location.reload();
  }, 1000);
  
} catch (error) {
  console.error('❌ Nuclear clear failed:', error);
  
  // Fallback: Clear everything manually
  console.log('🔧 Fallback: Manual clear...');
  localStorage.clear();
  alert('Fallback executed. All localStorage cleared. Please refresh and login again.');
  location.reload();
}