// EMERGENCY FIX: Force user-specific plans only
// Run this in browser console to immediately fix fake plan display

console.log('🚨 EMERGENCY: Forcing user-specific plans only...');

try {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!currentUser) {
    console.log('🔒 No authenticated user - clearing all plans');
    localStorage.setItem('workoutPlans', JSON.stringify([]));
    alert('❌ No user logged in. All plans cleared. Please login to see your plans.');
    location.reload();
    return;
  }
  
  console.log(`👤 Current user: ${currentUser.id || currentUser._id} (${currentUser.name || 'Unknown'})`);
  
  // Get all plans
  const allPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
  console.log(`📊 Total plans in storage: ${allPlans.length}`);
  
  // STRICT user filtering - only current user's plans
  const userPlans = allPlans.filter(plan => {
    const belongsToCurrentUser = plan.userId === currentUser.id || 
                                plan.userId === currentUser._id ||
                                (!plan.userId && plan.synced === false);
    
    if (!belongsToCurrentUser) {
      console.log(`🗑️ Removing plan not belonging to user: "${plan.name}" (userId: ${plan.userId})`);
    }
    
    return belongsToCurrentUser;
  });
  
  // Ensure all user plans have proper userId
  const cleanUserPlans = userPlans.map(plan => ({
    ...plan,
    userId: plan.userId || currentUser.id || currentUser._id
  }));
  
  console.log(`✅ User-specific plans: ${cleanUserPlans.length}`);
  console.log(`🗑️ Removed: ${allPlans.length - cleanUserPlans.length} plans`);
  
  // Save only user's plans
  localStorage.setItem('workoutPlans', JSON.stringify(cleanUserPlans));
  
  // Clear plan service cache and force refresh
  if (window.realTimePlanService) {
    window.realTimePlanService.planCache.clear();
    console.log('🔄 Plan service cache cleared');
    
    // Force reload user plans
    setTimeout(() => {
      window.realTimePlanService.getPlans(true);
    }, 100);
  }
  
  // Dispatch events to refresh all components
  const events = [
    'dashboardUpdate',
    'realTimeStatsUpdate',
    'userPlanDataInitialized'
  ];
  
  events.forEach(eventName => {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { 
        type: 'userPlansOnly',
        userId: currentUser.id,
        planCount: cleanUserPlans.length,
        timestamp: new Date().toISOString() 
      }
    }));
  });
  
  console.log('🎉 SUCCESS: Only user-specific plans remain!');
  
  // Show result
  alert(`✅ SUCCESS!\n\nUser: ${currentUser.name || currentUser.id}\nYour plans: ${cleanUserPlans.length}\nRemoved other plans: ${allPlans.length - cleanUserPlans.length}\n\nRefresh the page to see only YOUR plans.`);
  
  // Auto-refresh page
  setTimeout(() => {
    location.reload();
  }, 2000);
  
} catch (error) {
  console.error('❌ Error forcing user-specific plans:', error);
  alert('❌ Error occurred. Check console for details.');
}