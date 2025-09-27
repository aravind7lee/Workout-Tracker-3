// Real-Time MongoDB Context Provider
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { onlineService } from '../services/onlineService';
import api from '../utils/api';

const RealTimeContext = createContext();

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};

export const RealTimeProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    workouts: 0,
    meals: 0,
    xpPoints: 0,
    streak: 0,
    totalWorkouts: 0,
    totalMeals: 0,
    currentStreak: 0,
    weeklyGoal: { completed: 0, target: 4, percentage: 0 },
    isRealTime: false,
    lastSync: null,
    dataSource: 'Loading'
  });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch real-time stats from MongoDB
  const fetchRealTimeStats = useCallback(async () => {
    if (!isAuthenticated() || !user) {
      console.log('🔒 User not authenticated, skipping stats fetch');
      return;
    }

    setLoading(true);
    try {
      console.log('🚀 Fetching real-time MongoDB stats...');
      
      // Use multiple endpoints to get comprehensive data
      const [heroStats, analyticsData, userStats] = await Promise.allSettled([
        api.get('/analytics/hero-stats'),
        api.get('/analytics'),
        api.get('/users/stats')
      ]);

      let realTimeData = {
        workouts: 0,
        meals: 0,
        xpPoints: 0,
        streak: 0,
        totalWorkouts: 0,
        totalMeals: 0,
        currentStreak: 0,
        weeklyGoal: { completed: 0, target: 4, percentage: 0 },
        isRealTime: true,
        lastSync: new Date().toISOString(),
        dataSource: 'MongoDB'
      };

      // Process hero stats
      if (heroStats.status === 'fulfilled' && heroStats.value?.data?.data) {
        const data = heroStats.value.data.data;
        realTimeData = {
          ...realTimeData,
          workouts: data.workouts || 0,
          meals: data.meals || 0,
          xpPoints: data.xpPoints || 0,
          streak: data.streak || 0,
          totalWorkouts: data.workouts || 0,
          totalMeals: data.meals || 0,
          currentStreak: data.streak || 0,
          weeklyGoal: data.weeklyGoal || { completed: 0, target: 4, percentage: 0 }
        };
      }

      // Process analytics data
      if (analyticsData.status === 'fulfilled' && analyticsData.value?.data?.data) {
        const data = analyticsData.value.data.data;
        realTimeData = {
          ...realTimeData,
          workouts: data.workouts || realTimeData.workouts,
          meals: data.meals || realTimeData.meals,
          xpPoints: data.xpPoints || realTimeData.xpPoints,
          streak: data.currentStreak || realTimeData.streak,
          totalWorkouts: data.totalWorkouts || realTimeData.totalWorkouts,
          totalMeals: data.totalMeals || realTimeData.totalMeals,
          currentStreak: data.currentStreak || realTimeData.currentStreak
        };
      }

      // Process user stats
      if (userStats.status === 'fulfilled' && userStats.value?.data) {
        const data = userStats.value.data;
        realTimeData = {
          ...realTimeData,
          workouts: data.totalWorkouts || realTimeData.workouts,
          meals: data.totalMeals || realTimeData.meals,
          xpPoints: data.xpPoints || realTimeData.xpPoints,
          streak: data.currentStreak || realTimeData.streak,
          totalWorkouts: data.totalWorkouts || realTimeData.totalWorkouts,
          totalMeals: data.totalMeals || realTimeData.totalMeals,
          currentStreak: data.currentStreak || realTimeData.currentStreak
        };
      }

      console.log('✅ Real-time MongoDB data loaded:', realTimeData);
      setStats(realTimeData);
      setIsOnline(true);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('❌ Failed to fetch real-time stats:', error.message);
      
      // Set error state but keep trying
      setStats(prev => ({
        ...prev,
        isRealTime: false,
        dataSource: 'Error',
        lastSync: new Date().toISOString(),
        error: error.message
      }));
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated]);

  // Initialize ONLY - NO POLLING
  useEffect(() => {
    if (isAuthenticated() && user) {
      fetchRealTimeStats();
    }
  }, [user, isAuthenticated, fetchRealTimeStats]);

  // Listen for real-time events
  useEffect(() => {
    const handleWorkoutCompleted = () => {
      console.log('🏋️ Workout completed - refreshing stats');
      setTimeout(fetchRealTimeStats, 1000);
    };

    const handleMealAdded = () => {
      console.log('🍽️ Meal added - refreshing stats');
      setTimeout(fetchRealTimeStats, 1000);
    };

    const handlePlanCreated = () => {
      console.log('📋 Plan created - refreshing stats');
      setTimeout(fetchRealTimeStats, 1000);
    };

    const handleStreakUpdated = () => {
      console.log('🔥 Streak updated - refreshing stats');
      setTimeout(fetchRealTimeStats, 1000);
    };

    // Listen for custom events
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('streakUpdated', handleStreakUpdated);

    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('streakUpdated', handleStreakUpdated);
    };
  }, [fetchRealTimeStats]);

  // Manual refresh function
  const refreshStats = useCallback(async () => {
    console.log('🔄 Manual stats refresh requested');
    await fetchRealTimeStats();
  }, [fetchRealTimeStats]);

  // Update single stat (for optimistic updates)
  const updateStat = useCallback((statName, value) => {
    setStats(prev => ({
      ...prev,
      [statName]: value,
      lastSync: new Date().toISOString()
    }));
  }, []);

  // Increment stat (for real-time updates)
  const incrementStat = useCallback((statName, increment = 1) => {
    setStats(prev => ({
      ...prev,
      [statName]: (prev[statName] || 0) + increment,
      lastSync: new Date().toISOString()
    }));
  }, []);

  const value = {
    stats,
    isOnline,
    loading,
    lastUpdate,
    refreshStats,
    updateStat,
    incrementStat,
    fetchRealTimeStats
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

export default RealTimeProvider;