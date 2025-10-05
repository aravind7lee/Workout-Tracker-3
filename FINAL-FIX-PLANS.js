// FINAL FIX: Completely remove fake plans and force user-specific only
// Copy and paste this ENTIRE script in browser console

console.log('🔥 FINAL FIX: Removing fake plans completely...');

// Step 1: Get current user
const user = JSON.parse(localStorage.getItem('user') || 'null');
if (!user) {
  localStorage.clear();
  alert('No user found. Cleared all data. Please login.');
  location.reload();
  return;
}

console.log(`👤 User: ${user.id} (${user.name || user.email})`);

// Step 2: NUCLEAR CLEAR - Remove ALL plan data
console.log('💥 NUCLEAR CLEAR: Removing all plan data...');
localStorage.removeItem('workoutPlans');
localStorage.removeItem('plans');
localStorage.removeItem('savedPlans');
localStorage.removeItem('myPlans');

// Step 3: Clear service caches
if (window.realTimePlanService) {
  window.realTimePlanService.planCache.clear();
  window.realTimePlanService.syncQueue = [];
}

// Step 4: Set EMPTY array (new users should have 0 plans)
localStorage.setItem('workoutPlans', JSON.stringify([]));

// Step 5: Force refresh all components
window.dispatchEvent(new CustomEvent('userLoggedOut'));
window.dispatchEvent(new CustomEvent('userDataInitialized', { detail: { user } }));

console.log('✅ COMPLETE: All fake plans removed. User now has 0 plans.');

alert(`✅ FIXED!\n\nUser: ${user.name || user.email}\nPlans: 0 (as it should be for new users)\n\nRefreshing page...`);

location.reload();