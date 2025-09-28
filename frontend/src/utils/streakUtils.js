// Streak Utility Functions - Consistent streak data across all pages

// Get current streak from localStorage (same logic as StreakContext)
export const getCurrentStreakFromStorage = () => {
  try {
    const saved = localStorage.getItem('gymtracker_streak_data');
    if (saved) {
      const data = JSON.parse(saved);
      return data.currentStreak || 0;
    }
  } catch (error) {
    console.error('Failed to get streak from storage:', error);
  }
  return 0;
};

// Get real-time streak data (prioritizes context, then storage)
export const getRealTimeStreak = (contextStreak, statsStreak) => {
  const storageStreak = getCurrentStreakFromStorage();
  
  // Use the highest value from available sources
  const streak = Math.max(
    contextStreak || 0,
    statsStreak || 0,
    storageStreak || 0
  );
  
  console.log('🔥 STREAK UTILS: Calculating real-time streak:', {
    contextStreak,
    statsStreak,
    storageStreak,
    finalStreak: streak
  });
  
  return streak;
};

// Validate streak freshness (check if streak is still valid)
export const validateStreakFreshness = () => {
  try {
    const saved = localStorage.getItem('gymtracker_streak_data');
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toISOString().split('T')[0];
      
      if (data.lastCheckInDate) {
        const daysDiff = Math.floor((new Date() - new Date(data.lastCheckInDate)) / (1000 * 60 * 60 * 24));
        
        // If more than 1 day has passed, streak might be broken
        if (daysDiff > 1) {
          return { valid: false, daysMissed: daysDiff };
        }
      }
      
      return { valid: true, daysMissed: 0 };
    }
  } catch (error) {
    console.error('Failed to validate streak:', error);
  }
  
  return { valid: false, daysMissed: 0 };
};

// Get streak motivation message
export const getStreakMotivation = (streak) => {
  if (streak === 0) return "Ready to start your journey? 💪";
  if (streak < 7) return `${streak} days strong! Building momentum! 🔥`;
  if (streak < 30) return `${streak} days! You're on fire! 🚀`;
  if (streak < 100) return `${streak} days! Absolutely crushing it! ⚡`;
  return `${streak} days! You're a legend! 👑`;
};