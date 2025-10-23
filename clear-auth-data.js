// Clear Authentication Data Script
// Run this in browser console to clear corrupted auth data

console.log('🧹 Clearing authentication data...');

// Clear all auth-related localStorage items
const authKeys = ['token', 'user', 'mongodb_workouts_cache'];
authKeys.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    console.log(`✅ Cleared ${key}`);
  }
});

// Clear any cached plan data
if (window.realTimePlanService) {
  window.realTimePlanService.planCache.clear();
  console.log('✅ Cleared plan cache');
}

// Dispatch logout event
window.dispatchEvent(new CustomEvent('userLoggedOut'));
console.log('✅ Dispatched logout event');

console.log('🔄 Please refresh the page and log in again');

// Auto refresh after 2 seconds
setTimeout(() => {
  window.location.reload();
}, 2000);