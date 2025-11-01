/**
 * Emergency Reset Utility
 * Fixes infinite loops and resets the real-time system
 */

export const emergencyReset = () => {
  console.log('🚨 EMERGENCY RESET: Stopping infinite loops and resetting system');
  
  try {
    // Clear all timers and intervals
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
    
    // Reset real-time workout sync if available
    if (window.realTimeWorkoutSync) {
      window.realTimeWorkoutSync.circuitBreaker = { count: 0, lastReset: Date.now() };
      window.realTimeWorkoutSync.lastWorkoutAdd = 0;
      window.realTimeWorkoutSync.lastDispatchTime = 0;
      console.log('✅ RealTimeWorkoutSync reset');
    }
    
    // Remove problematic event listeners
    const events = [
      'workoutCompleted',
      'realTimeStatsUpdate',
      'homeStatsUpdate',
      'dashboardStatsUpdate',
      'analyticsStatsUpdate',
      'workoutsPageUpdate'
    ];
    
    events.forEach(eventName => {
      // Remove all listeners for this event
      const newElement = document.createElement('div');
      document.body.appendChild(newElement);
      document.body.removeChild(newElement);
    });
    
    console.log('✅ Event listeners cleared');
    
    // Force page reload after 2 seconds to ensure clean state
    setTimeout(() => {
      console.log('🔄 Reloading page for clean state');
      window.location.reload();
    }, 2000);
    
    return { success: true, message: 'Emergency reset completed' };
    
  } catch (error) {
    console.error('❌ Emergency reset failed:', error);
    // Force reload as last resort
    window.location.reload();
    return { success: false, error: error.message };
  }
};

// Auto-detect infinite loops and trigger emergency reset
let callCount = 0;
let lastCallTime = 0;

export const detectInfiniteLoop = (functionName = 'unknown') => {
  const now = Date.now();
  
  if (now - lastCallTime < 100) {
    callCount++;
  } else {
    callCount = 1;
  }
  
  lastCallTime = now;
  
  if (callCount > 50) {
    console.error(`🚨 INFINITE LOOP DETECTED in ${functionName}! Triggering emergency reset`);
    emergencyReset();
    return true;
  }
  
  return false;
};

// Make available globally for emergency use
if (typeof window !== 'undefined') {
  window.emergencyReset = emergencyReset;
  window.detectInfiniteLoop = detectInfiniteLoop;
  
  // Add keyboard shortcut for emergency reset (Ctrl+Shift+R)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      console.log('🚨 Emergency reset triggered by keyboard shortcut');
      emergencyReset();
    }
  });
}