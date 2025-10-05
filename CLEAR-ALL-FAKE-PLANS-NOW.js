// IMMEDIATE FIX: Clear all fake plans and show only user-specific plans
// Run this in browser console RIGHT NOW

console.log('🚨 CLEARING ALL FAKE PLANS IMMEDIATELY...');

try {
  // Get current user
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!currentUser) {
    console.log('🔒 No user - clearing ALL plans');
    localStorage.setItem('workoutPlans', JSON.stringify([]));
    alert('No user logged in. All plans cleared.');
    location.reload();
    return;
  }
  
  console.log(`👤 User: ${currentUser.id} (${currentUser.name})`);
  
  // Get all plans
  const allPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
  console.log(`📊 Found ${allPlans.length} plans in storage`);
  
  // Log each plan for debugging
  allPlans.forEach((plan, index) => {
    console.log(`Plan ${index + 1}: "${plan.name}" - userId: ${plan.userId} - synced: ${plan.synced}`);
  });
  
  // STRICT FILTERING: Only keep plans that explicitly belong to current user
  const userPlans = allPlans.filter(plan => {
    // ONLY plans with matching userId
    const belongsToUser = plan.userId === currentUser.id || plan.userId === currentUser._id;
    
    if (!belongsToUser) {
      console.log(`🗑️ REMOVING: "${plan.name}" (userId: ${plan.userId}, not matching ${currentUser.id})`);
    }
    
    return belongsToUser;
  });
  
  console.log(`✅ After filtering: ${userPlans.length} plans for user ${currentUser.id}`);
  
  // Save ONLY user's plans (should be 0 for new users)
  localStorage.setItem('workoutPlans', JSON.stringify(userPlans));
  
  // Clear plan service cache completely
  if (window.realTimePlanService) {
    window.realTimePlanService.planCache.clear();
    window.realTimePlanService.syncQueue = [];
    console.log('🔄 Plan service cache cleared');
  }
  
  // Force refresh all components
  window.dispatchEvent(new CustomEvent('userLoggedOut'));
  window.dispatchEvent(new CustomEvent('userDataInitialized', {
    detail: { user: currentUser }
  }));
  
  console.log('🎉 SUCCESS: Fake plans removed!');
  
  alert(`✅ FIXED!\n\nUser: ${currentUser.name}\nYour actual plans: ${userPlans.length}\nFake plans removed: ${allPlans.length - userPlans.length}\n\nPage will refresh to show only YOUR plans.`);
  
  // Force page refresh
  location.reload();
  
} catch (error) {
  console.error('❌ Error:', error);
  alert('Error occurred. Check console.');
}