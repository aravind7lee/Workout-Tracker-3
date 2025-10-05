// Force refresh all stats across the application
export const forceStatsRefresh = () => {
  console.log('🔄 Force refreshing all stats...');
  
  try {
    // Clear any cached data
    localStorage.removeItem('mongodb_workouts_cache');
    
    // Refresh realTimeWorkoutSync
    if (window.realTimeWorkoutSync) {
      window.realTimeWorkoutSync.refreshStats();
    }
    
    // Dispatch events to refresh all components
    const events = [
      'realTimeStatsUpdate',
      'realTimeStatsSync',
      'refreshCompletedWorkouts',
      'homeStatsUpdate',
      'dashboardStatsUpdate',
      'analyticsStatsUpdate'
    ];
    
    events.forEach(eventName => {
      window.dispatchEvent(new CustomEvent(eventName, {
        detail: {
          forced: true,
          timestamp: new Date().toISOString()
        }
      }));
    });
    
    console.log('✅ Stats refresh completed');
    return { success: true };
  } catch (error) {
    console.error('❌ Error refreshing stats:', error);
    return { success: false, error: error.message };
  }
};

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.forceStatsRefresh = forceStatsRefresh;
}

export default forceStatsRefresh;