// Real-Time Streak Service - Handles streak synchronization across components
class RealTimeStreakService {
  constructor() {
    this.listeners = new Set();
    this.currentStreak = 0;
    this.isOnline = false;
  }

  // Subscribe to streak updates
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Broadcast streak update to all subscribers
  broadcast(streakData) {
    this.currentStreak = streakData.currentStreak;
    
    // Notify all subscribers
    this.listeners.forEach(callback => {
      try {
        callback(streakData);
      } catch (error) {
        console.error('Streak listener error:', error);
      }
    });

    // Dispatch global event for components not using the service
    window.dispatchEvent(new CustomEvent('streakUpdated', { 
      detail: streakData 
    }));

    // Update localStorage for persistence
    if (streakData.userId) {
      const streakKey = `gymtracker_streak_${streakData.userId}`;
      localStorage.setItem(streakKey, JSON.stringify({
        currentStreak: streakData.currentStreak,
        longestStreak: streakData.longestStreak,
        totalCheckIns: streakData.totalCheckIns,
        lastCheckInDate: streakData.lastCheckInDate,
        streakStartDate: streakData.streakStartDate,
        updatedAt: new Date().toISOString()
      }));
    }

    console.log('🔥 Streak update broadcasted:', streakData);
  }

  // Sync streak to database
  async syncToDatabase(streakData, token) {
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentStreak: streakData.currentStreak,
          longestStreak: streakData.longestStreak,
          totalCheckIns: streakData.totalCheckIns,
          lastStreakCheckIn: new Date().toISOString(),
          streakStartDate: streakData.streakStartDate ? new Date(streakData.streakStartDate).toISOString() : null,
          xpPoints: (streakData.totalCheckIns * 10) + 100 // Award XP for streaks
        })
      });

      if (response.ok) {
        console.log('✅ Streak synced to database');
        this.isOnline = true;
        return true;
      } else {
        console.warn('❌ Database sync failed');
        this.isOnline = false;
        return false;
      }
    } catch (error) {
      console.warn('Database sync error:', error);
      this.isOnline = false;
      return false;
    }
  }

  // Get current streak from localStorage
  getLocalStreak(userId) {
    try {
      const streakKey = `gymtracker_streak_${userId}`;
      const saved = localStorage.getItem(streakKey);
      
      if (saved) {
        const data = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        
        // Validate streak freshness
        let currentStreak = data.currentStreak || 0;
        if (data.lastCheckInDate) {
          const daysDiff = Math.floor((new Date() - new Date(data.lastCheckInDate)) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1) {
            currentStreak = 0; // Streak broken
          }
        }

        return {
          currentStreak,
          longestStreak: data.longestStreak || 0,
          totalCheckIns: data.totalCheckIns || 0,
          lastCheckInDate: data.lastCheckInDate,
          streakStartDate: data.streakStartDate,
          canCheckIn: data.lastCheckInDate !== today
        };
      }
    } catch (error) {
      console.error('Failed to get local streak:', error);
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

  // Initialize real-time streak tracking
  async initialize(userId, token) {
    try {
      // Try to fetch from database first
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        let currentStreak = userData.currentStreak || 0;
        const lastCheckIn = userData.lastStreakCheckIn ? new Date(userData.lastStreakCheckIn).toISOString().split('T')[0] : null;
        
        // Check if streak is broken
        if (lastCheckIn) {
          const daysDiff = Math.floor((new Date() - new Date(lastCheckIn)) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1) {
            currentStreak = 0;
          }
        }

        const streakData = {
          currentStreak,
          longestStreak: userData.longestStreak || 0,
          totalCheckIns: userData.totalCheckIns || 0,
          lastCheckInDate: lastCheckIn,
          streakStartDate: userData.streakStartDate ? new Date(userData.streakStartDate).toISOString().split('T')[0] : null,
          canCheckIn: lastCheckIn !== today,
          userId
        };

        this.broadcast(streakData);
        this.isOnline = true;
        return streakData;
      }
    } catch (error) {
      console.warn('Database initialization failed:', error);
    }

    // Fallback to localStorage
    const localStreak = this.getLocalStreak(userId);
    this.broadcast({ ...localStreak, userId });
    this.isOnline = false;
    return { ...localStreak, userId };
  }

  // Check if user can check in today
  canCheckInToday(userId) {
    const streak = this.getLocalStreak(userId);
    const today = new Date().toISOString().split('T')[0];
    return streak.lastCheckInDate !== today;
  }

  // Get streak status for display
  getStreakStatus(userId) {
    const streak = this.getLocalStreak(userId);
    return {
      ...streak,
      isOnline: this.isOnline,
      motivation: this.getMotivationMessage(streak.currentStreak)
    };
  }

  // Get motivation message based on streak
  getMotivationMessage(streak) {
    if (streak === 0) return "Ready to start your journey? 💪";
    if (streak < 7) return `${streak} days strong! Building momentum! 🔥`;
    if (streak < 30) return `${streak} days! You're on fire! 🚀`;
    if (streak < 100) return `${streak} days! Absolutely crushing it! ⚡`;
    return `${streak} days! You're a legend! 👑`;
  }
}

// Export singleton instance
export const realTimeStreakService = new RealTimeStreakService();
export default realTimeStreakService;