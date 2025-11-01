// One-time cleanup on app startup to remove all fake dummy meal data
export const performStartupCleanup = () => {
  try {
    console.log('🚀 Performing app startup cleanup...');
    
    // Clear all meal-related localStorage keys
    const keys = Object.keys(localStorage);
    let clearedCount = 0;
    
    keys.forEach(key => {
      if (key === 'recentMeals' || key.startsWith('recentMeals_')) {
        localStorage.removeItem(key);
        clearedCount++;
        console.log('🗑️ Startup cleanup removed:', key);
      }
    });
    
    console.log(`✅ Startup cleanup: Cleared ${clearedCount} meal storage keys`);
    
    // Set cleanup flag to prevent running again
    localStorage.setItem('mealDataCleanupDone', 'true');
    
    return true;
  } catch (error) {
    console.error('❌ Error during startup cleanup:', error);
    return false;
  }
};

export const shouldPerformCleanup = () => {
  return !localStorage.getItem('mealDataCleanupDone');
};