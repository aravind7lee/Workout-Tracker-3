// Run this in browser console to clear all fake plan data
// This will help fix the fake plan stats issue immediately

console.log('🧹 Clearing all fake plan data...');

try {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  if (!currentUser) {
    console.log('🔒 No authenticated user found');
    alert('❌ Please login first to clean your plan data');
    return;
  }
  
  console.log(`👤 Cleaning plans for user: ${currentUser.id || currentUser._id}`);
  
  // Get current plans
  const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
  console.log(`📊 Found ${plans.length} total plans`);
  
  // Filter out fake plans and keep only current user's real plans
  const realUserPlans = plans.filter(plan => {
    const isReal = plan.name && 
                   plan.name !== 'Test Plan' &&
                   plan.name !== 'Demo Plan' &&
                   plan.exercises &&
                   Array.isArray(plan.exercises) &&
                   plan.exercises.length > 0 &&
                   !plan.id?.includes('test_') &&
                   !plan.id?.includes('fake_') &&
                   !plan.id?.includes('demo_') &&
                   !plan.id?.includes('sample_');
    
    const belongsToUser = plan.userId === currentUser.id || 
                         plan.userId === currentUser._id ||
                         (!plan.userId && plan.synced === false);
    
    if (!isReal) {
      console.log('🗑️ Removing fake plan:', plan.name || plan.id);
    } else if (!belongsToUser) {
      console.log('👤 Keeping other user\'s plan:', plan.name);
    }
    
    return isReal && belongsToUser;
  });
  
  // Keep other users' plans
  const otherUsersPlans = plans.filter(plan => 
    plan.userId && plan.userId !== currentUser.id && plan.userId !== currentUser._id
  );
  
  // Ensure user ID is set on user's plans
  const cleanUserPlans = realUserPlans.map(plan => ({
    ...plan,
    userId: plan.userId || currentUser.id || currentUser._id
  }));
  
  // Combine all plans
  const finalPlans = [...otherUsersPlans, ...cleanUserPlans];
  
  // Save cleaned plans
  localStorage.setItem('workoutPlans', JSON.stringify(finalPlans));
  
  console.log(`✅ Plan cleanup complete: ${plans.length} → ${cleanUserPlans.length} user plans`);
  console.log(`🗑️ Removed ${plans.length - finalPlans.length} fake/invalid plans`);
  console.log(`👥 Kept ${otherUsersPlans.length} plans from other users`);
  
  // Clear plan service cache
  if (window.realTimePlanService) {
    window.realTimePlanService.planCache.clear();
    window.realTimePlanService.getPlans(true);
    console.log('🔄 Plan service cache refreshed');
  }
  
  // Dispatch events to refresh UI
  const events = [
    'dashboardUpdate',
    'planDataRefresh',
    'realTimeStatsUpdate'
  ];
  
  events.forEach(eventName => {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { 
        type: 'planDataCleaned',
        userPlans: cleanUserPlans.length,
        timestamp: new Date().toISOString() 
      }
    }));
  });
  
  console.log('🎉 All fake plan data cleared! Refresh the page to see clean stats.');
  
  // Show alert
  alert(`✅ Fake plan data cleared!\n\nYour plans: ${cleanUserPlans.length}\nRemoved fake plans: ${plans.length - finalPlans.length}\nOther users' plans preserved: ${otherUsersPlans.length}\n\nRefresh the page to see clean stats.`);
  
} catch (error) {
  console.error('❌ Error clearing fake plan data:', error);
  alert('❌ Error clearing fake plan data. Check console for details.');
}