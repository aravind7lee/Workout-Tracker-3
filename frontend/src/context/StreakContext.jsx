// Real-Time Streak Context - MongoDB Integration
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';

const StreakContext = createContext();

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    return { currentStreak: 0, longestStreak: 0, totalCheckIns: 0 }; // Fallback
  }
  return context;
};

export const StreakProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalCheckIns: 0,
    lastCheckInDate: null,
    streakStartDate: null,
    canCheckIn: true,
    isRealTime: false,
    lastSync: null
  });
  const [loading, setLoading] = useState(false);

  // Real-time streak fetching from MongoDB
  const fetchStreakData = useCallback(async () => {
    if (!isAuthenticated() || !user) return;

    try {
      setLoading(true);
      console.log('🔥 Fetching real-time streak data from MongoDB...');
      
      // Get streak data from multiple endpoints
      const [heroStats, userStats, streakStatus] = await Promise.allSettled([
        api.get('/analytics/hero-stats'),
        api.get('/users/stats'),
        api.get('/users/streak-status')
      ]);

      let realTimeStreakData = {
        currentStreak: 0,
        longestStreak: 0,
        totalCheckIns: 0,
        lastCheckInDate: null,
        streakStartDate: null,
        canCheckIn: true,
        isRealTime: true,
        lastSync: new Date().toISOString()
      };

      // Process hero stats for streak
      if (heroStats.status === 'fulfilled' && heroStats.value?.data?.data) {
        const data = heroStats.value.data.data;
        realTimeStreakData.currentStreak = data.streak || data.currentStreak || 0;
      }

      // Process user stats for comprehensive streak data
      if (userStats.status === 'fulfilled' && userStats.value?.data) {
        const data = userStats.value.data;
        realTimeStreakData = {
          ...realTimeStreakData,
          currentStreak: data.currentStreak || realTimeStreakData.currentStreak,
          longestStreak: data.longestStreak || 0,
          totalCheckIns: data.totalCheckIns || 0
        };
      }

      // Process streak status for detailed info
      if (streakStatus.status === 'fulfilled' && streakStatus.value?.data) {
        const data = streakStatus.value.data;
        realTimeStreakData = {
          ...realTimeStreakData,
          currentStreak: data.currentStreak || realTimeStreakData.currentStreak,
          longestStreak: data.longestStreak || realTimeStreakData.longestStreak,
          totalCheckIns: data.totalCheckIns || realTimeStreakData.totalCheckIns,
          canCheckIn: data.canCheckIn !== undefined ? data.canCheckIn : true
        };
      }

      console.log('✅ Real-time streak data loaded from MongoDB:', realTimeStreakData);
      setStreakData(realTimeStreakData);
      
      // Update localStorage as backup
      if (user) {
        const streakKey = `gymtracker_streak_${user.id}`;
        localStorage.setItem(streakKey, JSON.stringify(realTimeStreakData));
      }
      
    } catch (error) {
      console.error('❌ MongoDB streak fetch failed:', error.message);
      
      // Set error state
      setStreakData(prev => ({
        ...prev,
        isRealTime: false,
        lastSync: new Date().toISOString(),
        error: error.message
      }));
      
      // Fallback to localStorage
      loadFromLocalStorage();
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Fallback to localStorage
  const loadFromLocalStorage = useCallback(() => {
    if (!user) return;
    
    const streakKey = `gymtracker_streak_${user.id}`;
    const saved = localStorage.getItem(streakKey);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const today = new Date().toISOString().split('T')[0];
        
        // Validate streak freshness
        let currentStreak = data.currentStreak || 0;
        if (data.lastCheckInDate) {
          const daysDiff = Math.floor((new Date() - new Date(data.lastCheckInDate)) / (1000 * 60 * 60 * 24));
          if (daysDiff > 1) {
            currentStreak = 0;
          }
        }

        setStreakData({
          currentStreak,
          longestStreak: data.longestStreak || 0,
          totalCheckIns: data.totalCheckIns || 0,
          lastCheckInDate: data.lastCheckInDate,
          streakStartDate: data.streakStartDate,
          canCheckIn: data.lastCheckInDate !== today
        });
      } catch (error) {
        console.error('Failed to parse streak data:', error);
      }
    }
  }, [user]);

  // Update streak after check-in
  const updateStreak = useCallback(async (newStreakData) => {
    const updatedData = {
      ...newStreakData,
      isRealTime: true,
      lastSync: new Date().toISOString()
    };
    
    setStreakData(updatedData);
    
    // Broadcast update to all components
    window.dispatchEvent(new CustomEvent('streakUpdated', { 
      detail: updatedData 
    }));
    
    // Update localStorage
    if (user) {
      const streakKey = `gymtracker_streak_${user.id}`;
      localStorage.setItem(streakKey, JSON.stringify(updatedData));
    }
    
    // Sync to MongoDB database
    try {
      await api.put('/users/profile', {
        currentStreak: updatedData.currentStreak,
        longestStreak: updatedData.longestStreak,
        totalCheckIns: updatedData.totalCheckIns,
        lastStreakCheckIn: new Date().toISOString(),
        streakStartDate: updatedData.streakStartDate ? new Date(updatedData.streakStartDate).toISOString() : null
      });
      console.log('✅ Streak synced to MongoDB database');
    } catch (error) {
      console.warn('❌ MongoDB sync failed:', error.message);
    }
  }, [user]);

  // Initialize on mount
  useEffect(() => {
    if (isAuthenticated() && user) {
      fetchStreakData();
    }
  }, [fetchStreakData, isAuthenticated, user]);

  // Listen for streak updates from other components
  useEffect(() => {
    const handleStreakUpdate = (event) => {
      setStreakData(event.detail);
    };

    window.addEventListener('streakUpdated', handleStreakUpdate);
    return () => window.removeEventListener('streakUpdated', handleStreakUpdate);
  }, []);

  // Periodic refresh every 2 minutes for real-time updates
  useEffect(() => {
    if (!isAuthenticated()) return;
    
    const interval = setInterval(fetchStreakData, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [fetchStreakData, isAuthenticated]);

  // Listen for workout completions to update streak
  useEffect(() => {
    const handleWorkoutCompleted = () => {
      console.log('🏋️ Workout completed - refreshing streak data');
      setTimeout(fetchStreakData, 1000);
    };

    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    return () => window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
  }, [fetchStreakData]);

  const value = {
    ...streakData,
    loading,
    fetchStreakData,
    updateStreak,
    refreshStreak: fetchStreakData
  };

  return (
    <StreakContext.Provider value={value}>
      {children}
    </StreakContext.Provider>
  );
};