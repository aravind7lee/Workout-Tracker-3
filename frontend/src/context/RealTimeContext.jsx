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
    todayWorkouts: 0,
    weeklyWorkouts: 0,
    monthlyWorkouts: 0,
    totalCalories: 0,
    totalDuration: 0,
    weeklyGoal: { completed: 0, target: 4, percentage: 0 },
    isRealTime: false,
    lastSync: null,
    dataSource: 'Loading'
  });
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Load workout stats from localStorage
  const loadWorkoutStats = useCallback(() => {
    try {
      const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      const today = new Date().toDateString();
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const todayWorkouts = completedWorkouts.filter(w => 
        new Date(w.completedAt).toDateString() === today
      ).length;
      
      const weeklyWorkouts = completedWorkouts.filter(w => 
        new Date(w.completedAt) >= weekAgo
      ).length;
      
      const monthlyWorkouts = completedWorkouts.filter(w => 
        new Date(w.completedAt) >= monthAgo
      ).length;
      
      const totalCalories = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
      const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      
      return {
        workouts: todayWorkouts,
        totalWorkouts: completedWorkouts.length,
        todayWorkouts,
        weeklyWorkouts,
        monthlyWorkouts,
        totalCalories,
        totalDuration,
        isRealTime: true,
        lastSync: new Date().toISOString(),
        dataSource: 'localStorage'
      };
    } catch (error) {
      console.error('Error loading workout stats:', error);
      return {
        workouts: 0,
        totalWorkouts: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        isRealTime: false,
        lastSync: new Date().toISOString(),
        dataSource: 'Error'
      };
    }
  }, []);

  // Fetch real-time stats from MongoDB with instant sync
  const fetchRealTimeStats = useCallback(async () => {
    if (!isAuthenticated() || !user) {
      console.log('🔒 User not authenticated, loading local stats only');
      const localStats = loadWorkoutStats();
      setStats(prev => ({ ...prev, ...localStats }));
      setLoading(false);
      return;
    }

    try {
      console.log('🚀 Fetching real-time MongoDB stats...');
      
      // Load local stats first for instant display
      const localStats = loadWorkoutStats();
      setStats(prev => ({ ...prev, ...localStats }));
      
      // Sync with MongoDB - try multiple endpoints for comprehensive data
      const mongoPromises = [
        api.get('/analytics/hero-stats').catch(() => null),
        api.get('/analytics').catch(() => null),
        api.get('/users/stats').catch(() => null),
        api.get('/workouts').catch(() => null)
      ];

      const [heroStats, analyticsData, userStats, workoutsData] = await Promise.allSettled(mongoPromises);

      let realTimeData = {
        ...localStats,
        meals: 0,
        xpPoints: 0,
        streak: 0,
        totalMeals: 0,
        currentStreak: 0,
        weeklyGoal: { completed: localStats.weeklyWorkouts, target: 4, percentage: (localStats.weeklyWorkouts / 4) * 100 },
        isRealTime: true,
        dataSource: 'MongoDB + localStorage'
      };

      // Process MongoDB workout data if available
      if (workoutsData.status === 'fulfilled' && workoutsData.value?.data) {
        const mongoWorkouts = workoutsData.value.data;
        if (Array.isArray(mongoWorkouts) && mongoWorkouts.length > 0) {
          const today = new Date().toDateString();
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          
          const mongoTodayWorkouts = mongoWorkouts.filter(w => 
            new Date(w.completedAt || w.createdAt).toDateString() === today
          ).length;
          
          const mongoWeeklyWorkouts = mongoWorkouts.filter(w => 
            new Date(w.completedAt || w.createdAt) >= weekAgo
          ).length;
          
          const mongoTotalCalories = mongoWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
          
          // Use MongoDB data if it has more recent data
          realTimeData = {
            ...realTimeData,
            totalWorkouts: Math.max(mongoWorkouts.length, localStats.totalWorkouts),
            todayWorkouts: Math.max(mongoTodayWorkouts, localStats.todayWorkouts),
            weeklyWorkouts: Math.max(mongoWeeklyWorkouts, localStats.weeklyWorkouts),
            totalCalories: Math.max(mongoTotalCalories, localStats.totalCalories),
            dataSource: 'MongoDB Real-time Sync'
          };
        }
      }

      // Process other MongoDB data
      if (heroStats.status === 'fulfilled' && heroStats.value?.data?.data) {
        const data = heroStats.value.data.data;
        realTimeData = {
          ...realTimeData,
          meals: data.meals || 0,
          xpPoints: data.xpPoints || 0,
          streak: data.streak || 0,
          totalMeals: data.meals || 0,
          currentStreak: data.streak || 0,
          weeklyGoal: data.weeklyGoal || realTimeData.weeklyGoal
        };
      }

      console.log('✅ Real-time MongoDB sync complete:', realTimeData);
      setStats(realTimeData);
      setIsOnline(true);
      setLastUpdate(new Date());
      
      // Broadcast update to all pages
      window.dispatchEvent(new CustomEvent('realTimeStatsSync', {
        detail: realTimeData
      }));

    } catch (error) {
      console.error('❌ MongoDB sync failed, using local data:', error.message);
      const localStats = loadWorkoutStats();
      setStats(prev => ({
        ...prev,
        ...localStats,
        isRealTime: false,
        dataSource: 'localStorage (MongoDB failed)',
        error: error.message
      }));
      setIsOnline(false);
    } finally {
      setLoading(false);
    }
  }, [user, isAuthenticated, loadWorkoutStats]);

  // Initialize and load stats immediately
  useEffect(() => {
    // Load local stats immediately
    const localStats = loadWorkoutStats();
    setStats(prev => ({ ...prev, ...localStats }));
    
    // Then try to fetch from MongoDB
    if (isAuthenticated() && user) {
      fetchRealTimeStats();
    } else {
      setLoading(false);
    }
  }, [user, isAuthenticated, fetchRealTimeStats, loadWorkoutStats]);

  // Listen for real-time events + INSTANT STREAK UPDATES
  useEffect(() => {
    const handleWorkoutCompleted = () => {
      console.log('🏋️ Workout completed - refreshing all stats');
      
      // Immediate stats refresh
      const freshStats = loadWorkoutStats();
      setStats(prev => ({
        ...prev,
        ...freshStats,
        lastSync: new Date().toISOString(),
        dataSource: 'Workout Completion',
        isRealTime: true
      }));
      
      console.log('✅ Stats updated after workout completion:', freshStats);
    };

    const handleMealAdded = () => {
      console.log('🍽️ Meal added - refreshing stats');
      setTimeout(fetchRealTimeStats, 1000);
    };

    const handlePlanCreated = () => {
      console.log('📋 Plan created - refreshing stats');
      setTimeout(fetchRealTimeStats, 1000);
    };

    // REAL-TIME STREAK UPDATE HANDLER - INSTANT UPDATES
    const handleStreakUpdated = (event) => {
      console.log('🔥 REAL-TIME: Streak updated - instant sync');
      
      if (event.detail) {
        const streakData = event.detail;
        
        // INSTANT UPDATE - No API call needed, update immediately
        setStats(prev => ({
          ...prev,
          currentStreak: streakData.currentStreak || 0,
          streak: streakData.currentStreak || 0,
          totalCheckIns: streakData.totalCheckIns || 0,
          longestStreak: streakData.longestStreak || 0,
          lastSync: new Date().toISOString(),
          dataSource: 'Real-time Streak Update',
          isRealTime: true
        }));
        
        console.log('✅ INSTANT: Stats updated with streak data:', {
          currentStreak: streakData.currentStreak,
          totalCheckIns: streakData.totalCheckIns,
          longestStreak: streakData.longestStreak
        });
      }
      
      // Also refresh full stats in background (non-blocking)
      setTimeout(fetchRealTimeStats, 500);
    };

    // WORKOUT COMPLETION STATS UPDATE
    const handleWorkoutStatsUpdate = (event) => {
      console.log('💪 Real-time workout stats update received:', event.detail);
      
      // Reload stats from localStorage immediately
      const freshStats = loadWorkoutStats();
      setStats(prev => ({
        ...prev,
        ...freshStats,
        lastSync: new Date().toISOString(),
        dataSource: 'Real-time Update',
        isRealTime: true
      }));
      
      console.log('✅ INSTANT: Workout stats refreshed from localStorage:', freshStats);
    };

    // Real-time MongoDB sync handler
    const handleRealTimeSync = (event) => {
      console.log('🔄 Real-time sync event received:', event.detail);
      if (event.detail) {
        setStats(prev => ({
          ...prev,
          ...event.detail,
          lastSync: new Date().toISOString(),
          isRealTime: true
        }));
      }
    };

    // Listen for custom events
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('realTimeStatsUpdate', handleWorkoutStatsUpdate);
    window.addEventListener('realTimeStatsSync', handleRealTimeSync);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('streakUpdated', handleStreakUpdated);
    
    // Listen for specific streak events for even faster updates
    window.addEventListener('dashboardStreakUpdate', handleStreakUpdated);
    window.addEventListener('homeStreakUpdate', handleStreakUpdated);
    window.addEventListener('analyticsStreakUpdate', handleStreakUpdated);

    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('realTimeStatsUpdate', handleWorkoutStatsUpdate);
      window.removeEventListener('realTimeStatsSync', handleRealTimeSync);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('streakUpdated', handleStreakUpdated);
      window.removeEventListener('dashboardStreakUpdate', handleStreakUpdated);
      window.removeEventListener('homeStreakUpdate', handleStreakUpdated);
      window.removeEventListener('analyticsStreakUpdate', handleStreakUpdated);
    };
  }, [fetchRealTimeStats, loadWorkoutStats]);

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

  // Update workout stats (for real-time workout completion)
  const updateWorkoutStats = useCallback(() => {
    const freshStats = loadWorkoutStats();
    setStats(prev => ({
      ...prev,
      ...freshStats,
      lastSync: new Date().toISOString(),
      dataSource: 'Real-time Workout Update',
      isRealTime: true
    }));
    console.log('💪 REAL-TIME: Workout stats updated:', freshStats);
  }, [loadWorkoutStats]);

  // Increment stat (for real-time updates)
  const incrementStat = useCallback((statName, increment = 1) => {
    setStats(prev => ({
      ...prev,
      [statName]: (prev[statName] || 0) + increment,
      lastSync: new Date().toISOString()
    }));
  }, []);

  // REAL-TIME STREAK SYNC - Update streak data instantly
  const updateStreakStats = useCallback((streakData) => {
    setStats(prev => ({
      ...prev,
      currentStreak: streakData.currentStreak || 0,
      streak: streakData.currentStreak || 0,
      totalCheckIns: streakData.totalCheckIns || 0,
      longestStreak: streakData.longestStreak || 0,
      lastSync: new Date().toISOString(),
      dataSource: 'Real-time Streak',
      isRealTime: true
    }));
    
    console.log('🔥 REAL-TIME: Streak stats updated instantly:', streakData);
  }, []);

  const value = {
    stats,
    isOnline,
    loading,
    lastUpdate,
    refreshStats,
    updateStat,
    incrementStat,
    updateStreakStats,
    updateWorkoutStats,
    loadWorkoutStats,
    fetchRealTimeStats
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};

export default RealTimeProvider;