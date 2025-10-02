// Professional Streak Calculator - Ensures consistent streak logic across the entire app
// This utility handles all streak calculations with proper day-to-day persistence

export class StreakCalculator {
  constructor() {
    this.STORAGE_KEY = 'gymtracker_streak_data';
  }

  // Get today's date in YYYY-MM-DD format
  getTodayString() {
    return new Date().toISOString().split('T')[0];
  }

  // Get yesterday's date in YYYY-MM-DD format
  getYesterdayString() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // Calculate days difference between two dates
  getDaysDifference(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
  }

  // Load current streak data from storage
  loadStreakData() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        console.log('📱 CALCULATOR: Loaded streak data:', data);
        return {
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          totalCheckIns: data.totalCheckIns || 0,
          lastCheckInDate: data.lastCheckInDate || null,
          streakStartDate: data.streakStartDate || null,
          canCheckIn: data.canCheckIn !== false,
          ...data
        };
      }
    } catch (error) {
      console.error('❌ CALCULATOR: Failed to load streak data:', error);
    }
    
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      lastCheckInDate: null,
      streakStartDate: null,
      canCheckIn: true
    };
  }

  // Save streak data to storage
  saveStreakData(data) {
    try {
      const dataToSave = {
        ...data,
        lastUpdated: new Date().toISOString(),
        version: '2.0'
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('✅ CALCULATOR: Saved streak data:', dataToSave);
      return true;
    } catch (error) {
      console.error('❌ CALCULATOR: Failed to save streak data:', error);
      return false;
    }
  }

  // Validate current streak status
  validateStreak() {
    const current = this.loadStreakData();
    const today = this.getTodayString();
    
    console.log('🔥 CALCULATOR: Validating streak for', today, 'Current data:', current);
    
    if (!current.lastCheckInDate) {
      // No previous check-in - can start streak
      return {
        ...current,
        canCheckIn: true,
        currentStreak: 0,
        isValid: true,
        status: 'ready_to_start'
      };
    }

    const daysDiff = this.getDaysDifference(current.lastCheckInDate, today);
    console.log('🔥 CALCULATOR: Days difference:', daysDiff);

    if (daysDiff === 0) {
      // Same day - already checked in
      return {
        ...current,
        canCheckIn: false,
        isValid: true,
        status: 'checked_in_today'
      };
    } else if (daysDiff === 1) {
      // Next day - can continue streak
      return {
        ...current,
        canCheckIn: true,
        isValid: true,
        status: 'can_continue'
      };
    } else if (daysDiff > 1) {
      // Gap detected - streak broken
      return {
        ...current,
        currentStreak: 0,
        streakStartDate: null,
        canCheckIn: true,
        isValid: false,
        status: 'streak_broken'
      };
    }

    return current;
  }

  // Calculate new streak after check-in
  calculateNewStreak(currentData) {
    const today = this.getTodayString();
    const yesterday = this.getYesterdayString();
    
    console.log('🔥 CALCULATOR: Calculating new streak - Today:', today, 'Yesterday:', yesterday, 'Current:', currentData);
    
    // Check if already checked in today
    if (currentData.lastCheckInDate === today) {
      throw new Error('Already checked in today');
    }

    let newStreak = 1;
    let streakStartDate = today;
    
    // Determine if continuing existing streak
    if (currentData.lastCheckInDate === yesterday && currentData.currentStreak > 0) {
      // Continue streak
      newStreak = currentData.currentStreak + 1;
      streakStartDate = currentData.streakStartDate || today;
      console.log('✅ CALCULATOR: Continuing streak - Day', newStreak);
    } else {
      // Start new streak
      newStreak = 1;
      streakStartDate = today;
      console.log('🆕 CALCULATOR: Starting new streak - Day 1');
    }

    const newData = {
      currentStreak: newStreak,
      longestStreak: Math.max(currentData.longestStreak || 0, newStreak),
      totalCheckIns: (currentData.totalCheckIns || 0) + 1,
      lastCheckInDate: today,
      streakStartDate,
      canCheckIn: false,
      timestamp: new Date().toISOString(),
      nextDay: newStreak + 1
    };

    console.log('🎯 CALCULATOR: New streak calculated:', newData);
    return newData;
  }

  // Get streak statistics
  getStreakStats() {
    const data = this.loadStreakData();
    const validated = this.validateStreak();
    
    return {
      ...validated,
      nextDay: (validated.currentStreak || 0) + 1,
      streakAge: validated.streakStartDate ? 
        this.getDaysDifference(validated.streakStartDate, this.getTodayString()) + 1 : 0,
      motivation: this.getMotivationMessage(validated.currentStreak || 0),
      tier: this.getStreakTier(validated.currentStreak || 0),
      progress: this.getStreakProgress(validated.currentStreak || 0)
    };
  }

  // Get motivation message based on streak
  getMotivationMessage(streak) {
    if (streak === 0) return "Ready to start your journey? 💪";
    if (streak === 1) return "Great start! Day 1 complete! 🎆";
    if (streak < 7) return `${streak} days strong! Building momentum! 🔥`;
    if (streak < 14) return `${streak} days! You're on fire! 🚀`;
    if (streak < 30) return `${streak} days! Absolutely crushing it! ⚡`;
    if (streak < 100) return `${streak} days! You're unstoppable! 💪`;
    if (streak < 365) return `${streak} days! You're a legend! 👑`;
    return `${streak} days! You're a fitness god! 🌌`;
  }

  // Get streak tier
  getStreakTier(streak) {
    if (streak === 0) return 'Starter';
    if (streak < 7) return 'Beginner';
    if (streak < 30) return 'Intermediate';
    if (streak < 100) return 'Advanced';
    if (streak < 365) return 'Expert';
    return 'Legendary';
  }

  // Get streak progress to next milestone
  getStreakProgress(streak) {
    const milestones = [1, 3, 7, 14, 21, 30, 60, 100, 365, 500, 1000];
    const nextMilestone = milestones.find(m => m > streak) || streak + 100;
    
    return {
      current: streak,
      nextMilestone,
      remaining: nextMilestone - streak,
      progress: streak > 0 ? (streak / nextMilestone) * 100 : 0
    };
  }

  // Perform check-in
  async performCheckIn() {
    const currentData = this.loadStreakData();
    const validated = this.validateStreak();
    
    if (!validated.canCheckIn) {
      throw new Error('Cannot check in today - already completed or streak broken');
    }

    const newStreakData = this.calculateNewStreak(currentData);
    
    // Save immediately to localStorage
    this.saveStreakData(newStreakData);
    
    // Return the new data
    return {
      ...newStreakData,
      message: newStreakData.currentStreak === 1 ? 
        '🔥 Day 1 - Streak Started!' : 
        `🔥 Day ${newStreakData.currentStreak} - Keep Going!`,
      success: true
    };
  }

  // Reset streak (for testing or manual reset)
  resetStreak() {
    const resetData = {
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      lastCheckInDate: null,
      streakStartDate: null,
      canCheckIn: true,
      resetAt: new Date().toISOString()
    };
    
    this.saveStreakData(resetData);
    console.log('🔄 CALCULATOR: Streak reset');
    return resetData;
  }

  // Get button text for UI
  getCheckInButtonText(streakData) {
    if (!streakData.canCheckIn) {
      return '✅ Checked In Today - Come Back Tomorrow!';
    }
    
    const nextDay = (streakData.currentStreak || 0) + 1;
    return `🔥 START DAY ${nextDay} STREAK`;
  }

  // Debug information
  getDebugInfo() {
    const data = this.loadStreakData();
    const validated = this.validateStreak();
    const today = this.getTodayString();
    
    return {
      today,
      yesterday: this.getYesterdayString(),
      rawData: data,
      validatedData: validated,
      canCheckIn: validated.canCheckIn,
      nextDay: (validated.currentStreak || 0) + 1,
      buttonText: this.getCheckInButtonText(validated),
      daysDifference: data.lastCheckInDate ? 
        this.getDaysDifference(data.lastCheckInDate, today) : null
    };
  }
}

// Export singleton instance
const streakCalculator = new StreakCalculator();
export { streakCalculator };
export default streakCalculator;