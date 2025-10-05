// Professional Streak Calculator - Ensures consistent streak logic across the entire app
// This utility handles all streak calculations with proper day-to-day persistence

export class StreakCalculator {
  constructor() {
    this.STORAGE_KEY_PREFIX = 'gymtracker_streak_data';
  }

  // Get user-specific storage key
  getUserStorageKey(userId) {
    if (!userId) {
      console.warn('⚠️ No userId provided, using default key');
      return this.STORAGE_KEY_PREFIX;
    }
    return `${this.STORAGE_KEY_PREFIX}_${userId}`;
  }

  // Get current authenticated user
  getCurrentUser() {
    try {
      const authUser = localStorage.getItem('user');
      if (authUser) {
        return JSON.parse(authUser);
      }
      
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          return { id: payload.userId || payload.id, _id: payload.userId || payload.id };
        } catch (e) {
          console.warn('⚠️ Invalid token format');
        }
      }
      
      return null;
    } catch (error) {
      console.warn('⚠️ Error getting current user:', error);
      return null;
    }
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

  // Load USER-SPECIFIC streak data from storage
  loadStreakData(userId = null) {
    try {
      const currentUser = userId ? { id: userId } : this.getCurrentUser();
      if (!currentUser) {
        console.log('🔒 No authenticated user - returning zero streak data');
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalCheckIns: 0,
          lastCheckInDate: null,
          streakStartDate: null,
          canCheckIn: true
        };
      }
      
      const storageKey = this.getUserStorageKey(currentUser.id || currentUser._id);
      const saved = localStorage.getItem(storageKey);
      
      if (saved) {
        const data = JSON.parse(saved);
        console.log(`📱 CALCULATOR: Loaded streak data for user ${currentUser.id}:`, data);
        return {
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
          totalCheckIns: data.totalCheckIns || 0,
          lastCheckInDate: data.lastCheckInDate || null,
          streakStartDate: data.streakStartDate || null,
          canCheckIn: data.canCheckIn !== false,
          userId: currentUser.id || currentUser._id,
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

  // Save USER-SPECIFIC streak data to storage
  saveStreakData(data, userId = null) {
    try {
      const currentUser = userId ? { id: userId } : this.getCurrentUser();
      if (!currentUser) {
        console.log('🔒 No authenticated user - cannot save streak data');
        return false;
      }
      
      const storageKey = this.getUserStorageKey(currentUser.id || currentUser._id);
      const dataToSave = {
        ...data,
        userId: currentUser.id || currentUser._id,
        lastUpdated: new Date().toISOString(),
        version: '3.0'
      };
      
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      console.log(`✅ CALCULATOR: Saved streak data for user ${currentUser.id}:`, dataToSave);
      return true;
    } catch (error) {
      console.error('❌ CALCULATOR: Failed to save streak data:', error);
      return false;
    }
  }

  // Validate current USER-SPECIFIC streak status
  validateStreak(userId = null) {
    const current = this.loadStreakData(userId);
    const today = this.getTodayString();
    
    console.log(`🔥 CALCULATOR: Validating streak for ${userId || 'current user'} on ${today}:`, current);
    
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

  // Get USER-SPECIFIC streak statistics
  getStreakStats(userId = null) {
    const data = this.loadStreakData(userId);
    const validated = this.validateStreak(userId);
    
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

  // Perform USER-SPECIFIC check-in
  async performCheckIn(userId = null) {
    const currentData = this.loadStreakData(userId);
    const validated = this.validateStreak(userId);
    
    if (!validated.canCheckIn) {
      throw new Error('Cannot check in today - already completed or streak broken');
    }

    const newStreakData = this.calculateNewStreak(currentData);
    
    // Save immediately to user-specific localStorage
    this.saveStreakData(newStreakData, userId);
    
    // Return the new data
    return {
      ...newStreakData,
      message: newStreakData.currentStreak === 1 ? 
        '🔥 Day 1 - Streak Started!' : 
        `🔥 Day ${newStreakData.currentStreak} - Keep Going!`,
      success: true
    };
  }

  // Reset USER-SPECIFIC streak
  resetStreak(userId = null) {
    const currentUser = userId ? { id: userId } : this.getCurrentUser();
    if (!currentUser) {
      console.log('🔒 No authenticated user - cannot reset streak');
      return null;
    }
    
    const resetData = {
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      lastCheckInDate: null,
      streakStartDate: null,
      canCheckIn: true,
      userId: currentUser.id || currentUser._id,
      resetAt: new Date().toISOString()
    };
    
    this.saveStreakData(resetData, userId);
    console.log(`🔄 CALCULATOR: Streak reset for user ${currentUser.id}`);
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

  // Debug information for USER-SPECIFIC streak
  getDebugInfo(userId = null) {
    const data = this.loadStreakData(userId);
    const validated = this.validateStreak(userId);
    const today = this.getTodayString();
    const currentUser = userId ? { id: userId } : this.getCurrentUser();
    
    return {
      userId: currentUser?.id || currentUser?._id || 'none',
      today,
      yesterday: this.getYesterdayString(),
      rawData: data,
      validatedData: validated,
      canCheckIn: validated.canCheckIn,
      nextDay: (validated.currentStreak || 0) + 1,
      buttonText: this.getCheckInButtonText(validated),
      daysDifference: data.lastCheckInDate ? 
        this.getDaysDifference(data.lastCheckInDate, today) : null,
      storageKey: currentUser ? this.getUserStorageKey(currentUser.id || currentUser._id) : 'none'
    };
  }
}

// Export singleton instance
const streakCalculator = new StreakCalculator();
export { streakCalculator };
export default streakCalculator;