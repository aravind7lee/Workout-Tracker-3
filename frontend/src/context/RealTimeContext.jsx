// Real-Time MongoDB Context Provider
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { onlineService } from '../services/onlineService';
import { workoutSync } from '../services/workoutSync';
import { realTimeWorkoutSync } from '../services/realTimeWorkoutSync';
import { detectInfiniteLoop } from '../utils/emergencyReset';
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
    totalWorkouts: 0,
    totalMeals: 0,
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

  // Load workout stats using real-time workout sync service - USER SPECIFIC
  const loadWorkoutStats = useCallback(() => {
    try {
      // Only load stats if user is authenticated
      if (!isAuthenticated() || !user) {
        console.log('🔒 No authenticated user - returning zero stats');
        return {
          workouts: 0,
          totalWorkouts: 0,
          todayWorkouts: 0,
          weeklyWorkouts: 0,
          monthlyWorkouts: 0,
          totalCalories: 0,
          totalDuration: 0,
          totalPlans: 0,
          isRealTime: false,
          lastSync: new Date().toISOString(),
          dataSource: 'No User'
        };
      }
      
      const realtimeStats = realTimeWorkoutSync.getStats();
      
      // Get plans count from localStorage - filter by current user only
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const userPlans = plans.filter(plan => {
        // Only include plans that belong to current user
        return plan.userId === user.id || plan.userId === user._id ||
               (!plan.userId && plan.synced === false); // Backward compatibility for local plans
      });
      const totalPlans = userPlans.length;
      
      console.log(`📊 User ${user.id} stats: ${realtimeStats.totalWorkouts} workouts, ${totalPlans} user-specific plans`);
      
      return {
        workouts: realtimeStats.todayWorkouts,
        totalWorkouts: realtimeStats.totalWorkouts,
        todayWorkouts: realtimeStats.todayWorkouts,
        weeklyWorkouts: realtimeStats.weeklyWorkouts,
        monthlyWorkouts: realtimeStats.monthlyWorkouts,
        totalCalories: realtimeStats.totalCalories,
        totalDuration: realtimeStats.totalDuration,
        totalPlans: totalPlans,
        isRealTime: true,
        lastSync: realtimeStats.lastUpdate || new Date().toISOString(),
        dataSource: `User-${user.id}-RealTimeSync`
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
        totalPlans: 0,
        isRealTime: false,
        lastSync: new Date().toISOString(),
        dataSource: 'Error'
      };
    }
  }, [user, isAuthenticated]);

  // Fetch real-time stats from MongoDB with instant sync
  const fetchRealTimeStats = useCallback(async () => {
    if (!isAuthenticated() || !user) {
      console.log('🔒 User not authenticated, setting zero stats');
      setStats({
        workouts: 0,
        meals: 0,
        totalWorkouts: 0,
        totalMeals: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        weeklyGoal: { completed: 0, target: 4, percentage: 0 },
        isRealTime: false,
        lastSync: new Date().toISOString(),
        dataSource: 'No User'
      });
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
        totalMeals: 0,
        totalPlans: localStats.totalPlans,
        weeklyGoal: { completed: localStats.weeklyWorkouts, target: 4, percentage: (localStats.weeklyWorkouts / 4) * 100 },
        isRealTime: true,
        dataSource: 'MongoDB + localStorage'
      };

      // Process MongoDB workout data if available - USER SPECIFIC
      if (workoutsData.status === 'fulfilled' && workoutsData.value?.data) {
        const mongoWorkouts = workoutsData.value.data;
        if (Array.isArray(mongoWorkouts) && mongoWorkouts.length > 0) {
          // Filter MongoDB workouts by current user
          const userMongoWorkouts = mongoWorkouts.filter(w => {
            return w.user === user.id || w.user === user._id || 
                   w.userId === user.id || w.userId === user._id;
          });
          
          console.log(`📊 MongoDB: ${userMongoWorkouts.length} workouts for user ${user.id}`);
          
          if (userMongoWorkouts.length > 0) {
            const today = new Date().toDateString();
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            
            const mongoTodayWorkouts = userMongoWorkouts.filter(w => 
              new Date(w.completedAt || w.createdAt).toDateString() === today
            ).length;
            
            const mongoWeeklyWorkouts = userMongoWorkouts.filter(w => 
              new Date(w.completedAt || w.createdAt) >= weekAgo
            ).length;
            
            const mongoTotalCalories = userMongoWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
            
            // Use MongoDB data if it has more recent data
            realTimeData = {
              ...realTimeData,
              totalWorkouts: Math.max(userMongoWorkouts.length, localStats.totalWorkouts),
              todayWorkouts: Math.max(mongoTodayWorkouts, localStats.todayWorkouts),
              weeklyWorkouts: Math.max(mongoWeeklyWorkouts, localStats.weeklyWorkouts),
              totalCalories: Math.max(mongoTotalCalories, localStats.totalCalories),
              dataSource: `User-${user.id}-MongoDB-Sync`
            };
          }
        }
      }

      // Process other MongoDB data
      if (heroStats.status === 'fulfilled' && heroStats.value?.data?.data) {
        const data = heroStats.value.data.data;
        realTimeData = {
          ...realTimeData,
          meals: data.meals || 0,
          totalMeals: data.meals || 0,
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

  // Initialize and load stats immediately - USER SPECIFIC
  useEffect(() => {
    // Always set loading to false first
    setLoading(false);
    
    // Only proceed if user is authenticated
    if (!isAuthenticated() || !user) {
      console.log('🔒 No authenticated user - setting zero stats');
      setStats({
        workouts: 0,
        meals: 0,
        totalWorkouts: 0,
        totalMeals: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        weeklyGoal: { completed: 0, target: 4, percentage: 0 },
        isRealTime: false,
        lastSync: new Date().toISOString(),
        dataSource: 'No User'
      });
      return;
    }
    
    console.log(`🚀 Initializing stats for user: ${user.id}`);
    
    // Clean fake workouts first for current user
    realTimeWorkoutSync.cleanFakeWorkouts();
    
    // Load local stats immediately
    const localStats = loadWorkoutStats();
    setStats(prev => ({ ...prev, ...localStats }));
    
    // Subscribe to real-time updates
    const unsubscribe = realTimeWorkoutSync.subscribe((newStats) => {
      if (!user) {
        console.log('🔒 No user - ignoring stats update');
        return;
      }
      console.log(`📊 Real-time stats update for user ${user.id}:`, newStats);
      setStats(prev => ({
        ...prev,
        workouts: newStats.todayWorkouts,
        totalWorkouts: newStats.totalWorkouts,
        todayWorkouts: newStats.todayWorkouts,
        weeklyWorkouts: newStats.weeklyWorkouts,
        monthlyWorkouts: newStats.monthlyWorkouts,
        totalCalories: newStats.totalCalories,
        totalDuration: newStats.totalDuration,
        isRealTime: true,
        lastSync: newStats.lastUpdate || new Date().toISOString(),
        dataSource: `User-${user.id}-RealTimeSync`
      }));
    });
    
    // Then try to fetch from MongoDB
    fetchRealTimeStats();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, isAuthenticated, fetchRealTimeStats, loadWorkoutStats]);

  // Listen for real-time events
  useEffect(() => {
    let isProcessingWorkout = false;
    
    const handleWorkoutCompleted = (event) => {
      // Detect infinite loop
      if (detectInfiniteLoop('handleWorkoutCompleted')) {
        return;
      }
      
      // Prevent infinite loop
      if (isProcessingWorkout) {
        console.log('⚠️ Workout completion already in progress, skipping');
        return;
      }
      
      isProcessingWorkout = true;
      console.log('🏋️ Workout completed - refreshing stats only');
      
      try {
        // Only refresh stats, don't add workout again to prevent loop
        realTimeWorkoutSync.refreshStats();
        console.log('✅ Workout completion processed');
      } finally {
        // Reset flag after processing
        setTimeout(() => {
          isProcessingWorkout = false;
        }, 1000);
      }
    };

    const handleMealAdded = () => {
      console.log('🍽️ Meal added - refreshing stats');
      setTimeout(fetchRealTimeStats, 1000);
    };

    const handleMealDeleted = () => {
      console.log('🗑️ Meal deleted - refreshing stats');
      setTimeout(fetchRealTimeStats, 1000);
    };

    const handlePlanCreated = () => {
      console.log('📋 Plan created - refreshing stats');
      // Update plans count immediately
      const freshStats = loadWorkoutStats();
      setStats(prev => ({
        ...prev,
        totalPlans: freshStats.totalPlans,
        lastSync: new Date().toISOString(),
        dataSource: 'Plan Created Update'
      }));
      setTimeout(fetchRealTimeStats, 1000);
    };

    // WORKOUT COMPLETION STATS UPDATE
    const handleWorkoutStatsUpdate = (event) => {
      console.log('💪 Real-time workout stats update received:', event.detail);
      
      // Reload stats from workout sync service immediately
      const freshStats = loadWorkoutStats();
      setStats(prev => ({
        ...prev,
        ...freshStats,
        lastSync: new Date().toISOString(),
        dataSource: 'Real-time Update',
        isRealTime: true
      }));
      
      console.log('✅ INSTANT: Workout stats refreshed from WorkoutSync:', freshStats);
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

    // Listen for user logout to clear stats
    const handleUserLogout = () => {
      console.log('👤 User logged out - clearing all stats');
      setStats({
        workouts: 0,
        meals: 0,
        totalWorkouts: 0,
        totalMeals: 0,
        todayWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        weeklyGoal: { completed: 0, target: 4, percentage: 0 },
        isRealTime: false,
        lastSync: new Date().toISOString(),
        dataSource: 'User Logged Out'
      });
    };
    
    // Listen for custom events
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('realTimeStatsUpdate', handleWorkoutStatsUpdate);
    window.addEventListener('realTimeStatsSync', handleRealTimeSync);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('mealDeleted', handleMealDeleted);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('userLoggedOut', handleUserLogout);
    
    // Also listen for plan updates to refresh totalPlans immediately
    const handlePlanUpdate = () => {
      console.log('📋 Plan updated - refreshing plans count');
      const freshStats = loadWorkoutStats();
      setStats(prev => ({
        ...prev,
        totalPlans: freshStats.totalPlans,
        lastSync: new Date().toISOString(),
        dataSource: 'Plan Update'
      }));
    };
    
    window.addEventListener('planUpdated', handlePlanUpdate);
    window.addEventListener('planDeleted', handlePlanUpdate);

    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('realTimeStatsUpdate', handleWorkoutStatsUpdate);
      window.removeEventListener('realTimeStatsSync', handleRealTimeSync);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('mealDeleted', handleMealDeleted);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('planUpdated', handlePlanUpdate);
      window.removeEventListener('planDeleted', handlePlanUpdate);
      window.removeEventListener('userLoggedOut', handleUserLogout);
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

  // Add completed workout (for real-time updates)
  const addCompletedWorkout = useCallback((workoutData) => {
    const newWorkout = realTimeWorkoutSync.addCompletedWorkout(workoutData);
    
    // Stats will be updated automatically via subscription
    console.log('✅ REAL-TIME: Workout added via RealTimeWorkoutSync:', newWorkout);
    return newWorkout;
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
    updateWorkoutStats,
    addCompletedWorkout,
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