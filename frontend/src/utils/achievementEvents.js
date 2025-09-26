// Real-time Achievement Event System
// Ensures achievements update instantly across all pages

export const AchievementEvents = {
  // Dispatch workout completion event
  workoutCompleted: (workoutData) => {
    console.log('🏋️ Dispatching workout completion event');
    window.dispatchEvent(new CustomEvent('workoutCompleted', {
      detail: workoutData
    }));
    
    // Also trigger achievement check
    window.dispatchEvent(new CustomEvent('achievementCheck', {
      detail: { type: 'workout', data: workoutData }
    }));
  },

  // Dispatch meal logging event
  mealAdded: (mealData) => {
    console.log('🍽️ Dispatching meal added event');
    window.dispatchEvent(new CustomEvent('mealAdded', {
      detail: mealData
    }));
    
    // Also trigger achievement check
    window.dispatchEvent(new CustomEvent('achievementCheck', {
      detail: { type: 'meal', data: mealData }
    }));
  },

  // Dispatch plan creation event
  planCreated: (planData) => {
    console.log('📋 Dispatching plan created event');
    window.dispatchEvent(new CustomEvent('planCreated', {
      detail: planData
    }));
    
    // Also trigger achievement check
    window.dispatchEvent(new CustomEvent('achievementCheck', {
      detail: { type: 'plan', data: planData }
    }));
  },

  // Dispatch streak update event
  streakUpdated: (streakData) => {
    console.log('🔥 Dispatching streak updated event');
    window.dispatchEvent(new CustomEvent('streakUpdated', {
      detail: streakData
    }));
    
    // Also trigger achievement check
    window.dispatchEvent(new CustomEvent('achievementCheck', {
      detail: { type: 'streak', data: streakData }
    }));
  },

  // Dispatch XP gained event
  xpGained: (xpData) => {
    console.log('⭐ Dispatching XP gained event');
    window.dispatchEvent(new CustomEvent('xpGained', {
      detail: xpData
    }));
    
    // Also trigger achievement check
    window.dispatchEvent(new CustomEvent('achievementCheck', {
      detail: { type: 'xp', data: xpData }
    }));
  },

  // Force achievement refresh across all components
  forceRefresh: () => {
    console.log('🔄 Forcing achievement refresh across all pages');
    window.dispatchEvent(new CustomEvent('achievementForceRefresh'));
  }
};

export default AchievementEvents;