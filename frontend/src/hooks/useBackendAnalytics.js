// frontend/src/hooks/useBackendAnalytics.js - BACKEND INTEGRATED ANALYTICS
import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { exerciseLibrary } from '../data/exerciseLibrary';

export function useBackendAnalytics() {
  const [stats, setStats] = useState(null);
  const [caloriesData, setCaloriesData] = useState(null);
  const [frequencyData, setFrequencyData] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data from backend using service
  const fetchAnalyticsFromBackend = async () => {
    try {
      return await analyticsService.getDashboardData();
    } catch (error) {
      throw error;
    }
  };

  // Fallback to localStorage data
  const getLocalData = () => {
    try {
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');

      // Calculate streak from local data
      const sortedHistory = history.sort((a, b) => 
        new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date)
      );
      
      let currentStreak = 0;
      let lastDate = null;
      
      for (const workout of sortedHistory) {
        const workoutDate = new Date(workout.completedAt || workout.date).toDateString();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (!lastDate) {
          if (workoutDate === today || workoutDate === yesterday) {
            currentStreak = 1;
            lastDate = workoutDate;
          } else {
            break;
          }
        } else {
          const expectedDate = new Date(new Date(lastDate).getTime() - 86400000).toDateString();
          if (workoutDate === expectedDate) {
            currentStreak++;
            lastDate = workoutDate;
          } else {
            break;
          }
        }
      }

      return {
        stats: {
          totalWorkouts: history.length,
          totalPlans: plans.length,
          totalMeals: meals.length,
          currentStreak,
          xpPoints: history.length * 100 + (currentStreak > 3 ? currentStreak * 50 : 0),
          joinDate: plans.length > 0 ? plans[0].createdAt : new Date().toISOString(),
          lastActive: history.length > 0 ? history[0].completedAt || history[0].date : new Date().toISOString()
        },
        workouts: history,
        nutrition: meals,
        achievements: []
      };
    } catch (error) {
      return {
        stats: { totalWorkouts: 0, totalPlans: 0, totalMeals: 0, currentStreak: 0, xpPoints: 0 },
        workouts: [],
        nutrition: [],
        achievements: []
      };
    }
  };

  // Generate chart data from backend or local data
  const generateChartData = (data) => {
    const { workouts, nutrition } = data;

    // Weekly workout frequency
    const last7Days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toDateString(),
        day: dayNames[date.getDay()],
        workouts: 0,
        calories: 0
      });
    }

    // Count workouts per day
    workouts.forEach(workout => {
      const workoutDate = new Date(workout.completedAt || workout.date || workout.createdAt).toDateString();
      const dayData = last7Days.find(d => d.date === workoutDate);
      if (dayData) {
        dayData.workouts++;
      }
    });

    // Sum calories per day
    nutrition.forEach(meal => {
      const mealDate = new Date(meal.consumedAt || meal.date || meal.createdAt).toDateString();
      const dayData = last7Days.find(d => d.date === mealDate);
      if (dayData) {
        dayData.calories += meal.calories || 0;
      }
    });

    const frequencyData = {
      labels: last7Days.map(d => d.day),
      datasets: [{
        label: 'Workouts per Day',
        data: last7Days.map(d => d.workouts),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10b981',
        borderWidth: 2
      }]
    };

    const caloriesData = {
      labels: last7Days.map(d => d.day),
      datasets: [{
        label: 'Calories Consumed',
        data: last7Days.map(d => Math.round(d.calories)),
        tension: 0.3,
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6'
      }]
    };

    return { frequencyData, caloriesData };
  };

  // Generate muscle distribution data
  const generateMuscleData = (workouts) => {
    const muscleCount = {};
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    
    // Count exercises by muscle group from workouts
    workouts.forEach(workout => {
      if (workout.exercises) {
        workout.exercises.forEach(exercise => {
          Object.entries(exerciseLibrary).forEach(([key, group]) => {
            const found = group.exercises.find(ex => ex.name === exercise.name);
            if (found) {
              muscleCount[group.name] = (muscleCount[group.name] || 0) + 1;
            }
          });
        });
      }
    });

    const muscles = Object.entries(muscleCount);
    const total = muscles.reduce((sum, [, count]) => sum + count, 0);
    
    if (total === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#64748b'],
          borderWidth: 2,
          borderColor: '#1e293b'
        }]
      };
    }

    return {
      labels: muscles.map(([muscle]) => muscle),
      datasets: [{
        data: muscles.map(([, count]) => Math.round((count / total) * 100)),
        backgroundColor: muscles.map((_, i) => colors[i % colors.length]),
        borderWidth: 2,
        borderColor: '#1e293b'
      }]
    };
  };

  // Generate achievements from backend or local data
  const generateAchievements = (data) => {
    const { stats } = data;
    
    const achievements = [
      {
        id: 'first-workout',
        title: 'First Steps',
        description: 'Complete your first workout',
        icon: '🎯',
        unlocked: stats.totalWorkouts >= 1,
        unlockedAt: stats.totalWorkouts >= 1 ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null
      },
      {
        id: 'plan-creator',
        title: 'Plan Creator',
        description: 'Create your first workout plan',
        icon: '📋',
        unlocked: stats.totalPlans >= 1,
        unlockedAt: stats.totalPlans >= 1 ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : null
      },
      {
        id: 'streak-3',
        title: '3 Day Streak',
        description: 'Workout for 3 consecutive days',
        icon: '🔥',
        unlocked: stats.currentStreak >= 3,
        unlockedAt: stats.currentStreak >= 3 ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : null
      },
      {
        id: 'workout-10',
        title: 'Consistency Builder',
        description: 'Complete 10 workouts',
        icon: '💪',
        unlocked: stats.totalWorkouts >= 10,
        unlockedAt: stats.totalWorkouts >= 10 ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) : null
      },
      {
        id: 'nutrition-tracker',
        title: 'Nutrition Tracker',
        description: 'Log your first meal',
        icon: '🍎',
        unlocked: stats.totalMeals >= 1,
        unlockedAt: stats.totalMeals >= 1 ? new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) : null
      },
      {
        id: 'xp-master',
        title: 'XP Master',
        description: 'Earn 1000 XP points',
        icon: '⭐',
        unlocked: stats.xpPoints >= 1000,
        unlockedAt: stats.xpPoints >= 1000 ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : null
      }
    ];

    return achievements.filter(a => a.unlocked);
  };

  // Sync local data to backend using service
  const syncToBackend = async () => {
    try {
      await analyticsService.syncAllData();
      return true;
    } catch (error) {
      return false;
    }
  };

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      let data;
      
      try {
        // Try to fetch from backend first
        data = await fetchAnalyticsFromBackend();
        
        // If backend data is empty, sync local data
        if (!data.stats || data.stats.totalWorkouts === 0) {
          await syncToBackend();
          // Try fetching again after sync
          try {
            data = await fetchAnalyticsFromBackend();
          } catch (syncError) {
            // If still fails, use local data
            data = getLocalData();
          }
        }
      } catch (backendError) {
        // Backend unavailable, use local data and try to sync
        data = getLocalData();
        syncToBackend(); // Sync in background
      }

      // Set stats
      setStats(data.stats);

      // Generate and set chart data
      const { frequencyData, caloriesData } = generateChartData(data);
      setFrequencyData(frequencyData);
      setCaloriesData(caloriesData);

      // Generate muscle distribution
      setMuscleData(generateMuscleData(data.workouts));

      // Generate achievements
      setAchievements(generateAchievements(data));

    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics data');
      
      // Fallback to local data
      const localData = getLocalData();
      setStats(localData.stats);
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatTimeAgo = (date) => {
    if (!date) return 'Recently';
    
    try {
      const now = new Date();
      const past = new Date(date);
      const diffInMinutes = Math.floor((now - past) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays < 7) return `${diffInDays} days ago`;
      
      return past.toLocaleDateString();
    } catch (error) {
      return 'Recently';
    }
  };

  return {
    stats,
    caloriesData,
    frequencyData,
    muscleData,
    achievements: achievements.map(achievement => ({
      ...achievement,
      timeAgo: achievement.unlockedAt ? formatTimeAgo(achievement.unlockedAt) : 'Recently'
    })),
    isLoading,
    error,
    refresh: loadAnalytics
  };
}