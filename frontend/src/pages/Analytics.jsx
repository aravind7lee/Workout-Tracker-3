import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { useRealTime } from '../context/RealTimeContext';

import AuthGuard from '../components/AuthGuard';
import RealTimeStats from '../components/RealTimeStats';
import MealTrackingCalendar from '../components/MealTrackingCalendar';
import { clearAllOldMealData, initializeEmptyUserMeals } from '../utils/clearOldMealData';
import progressAnalyticsImg from '../assets/Progress-Analytics.jpg';
import '../styles/analytics-mobile.css';

Chart.register(...registerables);

function AnalyticsHero() {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = progressAnalyticsImg;
    img.loading = 'eager';
  }, []);

  return (
    <div className="analytics-hero relative h-96 w-full overflow-hidden mb-6">
      <div className="absolute inset-0">
        {/* Main Image */}
        {!imageError && (
          <img
            src={progressAnalyticsImg}
            alt="Progress & Analytics"
            className="analytics-hero-mobile w-full h-full object-cover transition-opacity duration-300"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        )}
        
        {/* Fallback */}
        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 absolute inset-0"></div>
        )}
        
        {/* Light Gradient Overlay - Preserve Image Clarity */}
        <div className="absolute inset-0" 
             style={{
               background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
             }}></div>
      </div>
      
      {imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <motion.div 
            className="text-center max-w-4xl w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl"
                style={{
                  color: '#f59e0b',
                  textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 2px 8px rgba(0,0,0,0.6)'
                }}>
              Progress & Analytics
            </h1>
            <p className="text-lg text-white mb-8 drop-shadow-lg"
               style={{
                 textShadow: '0 2px 12px rgba(0,0,0,0.7), 0 1px 4px rgba(0,0,0,0.5)'
               }}>
              Track your fitness journey and analyze your progress
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const { isAuthenticated } = useAuth();

  const { stats, isOnline, refreshStats } = useRealTime();
  // Achievement system removed
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);



  const loadAnalyticsData = () => {
    try {
      setIsLoading(true);
      
      // Only load data if user is authenticated
      if (!isAuthenticated()) {
        console.log('🔒 No authenticated user - setting zero analytics data');
        setAnalyticsData({
          stats: {
            totalWorkouts: 0,
            totalPlans: 0,
            todayWorkouts: 0,
            weeklyWorkouts: 0,
            totalMeals: 0,
            todayMeals: 0,
            weeklyMeals: 0,
          },
          durationTrend: null,
          workoutFrequency: null,
          muscleDistribution: null
        });
        setIsLoading(false);
        return;
      }
      
      // Get user-specific workouts from realTimeWorkoutSync
      const workouts = window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      const allPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      
      // Get user-specific meals
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const userMealKey = currentUser ? `recentMeals_${currentUser.id || currentUser._id}` : 'recentMeals';
      const meals = JSON.parse(localStorage.getItem(userMealKey) || '[]');
      
      // Calculate meal statistics
      const todayStr = new Date().toDateString();
      const todayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.consumedAt || meal.createdAt || Date.now());
        return mealDate.toDateString() === todayStr;
      });
      
      const thisWeekMeals = meals.filter(meal => {
        const mealDate = new Date(meal.consumedAt || meal.createdAt || Date.now());
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return mealDate >= weekAgo;
      });
      
      // Filter plans by current user - same as Dashboard
      const plans = currentUser ? allPlans.filter(plan => {
        return plan.userId === currentUser.id || plan.userId === currentUser._id ||
               (!plan.userId && plan.synced === false); // Backward compatibility for local plans
      }) : [];
      
      console.log(`📊 Analytics: Loading data for authenticated user - ${workouts.length} workouts, ${plans.length} plans`);
      
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        
        const dayWorkouts = workouts.filter(w => {
          const workoutDate = new Date(w.completedAt || w.createdAt);
          return workoutDate.toDateString() === date.toDateString();
        });
        
        const dayDuration = dayWorkouts.reduce((sum, workout) => {
          return sum + (workout.activeTime || workout.duration || 0);
        }, 0);
        
        last7Days.push({
          day: dayName,
          workouts: dayWorkouts.length,
          duration: Math.round(dayDuration / 60) // Convert seconds to minutes
        });
      }
      
      // Calculate muscle group distribution from workouts
      const muscleGroups = {};
      workouts.forEach(workout => {
        const muscle = workout.muscle || workout.category || 'Other';
        muscleGroups[muscle] = (muscleGroups[muscle] || 0) + 1;
      });
      
      const muscleColors = {
        'Chest': '#ef4444',
        'Back': '#3b82f6', 
        'Shoulders': '#f59e0b',
        'Arms': '#10b981',
        'Legs': '#8b5cf6',
        'Core': '#f97316',
        'Cardio': '#06b6d4',
        'Other': '#6b7280'
      };
      
      const chartData = {
        durationData: {
          labels: last7Days.map(d => d.day),
          datasets: [{
            label: 'Duration (minutes)',
            data: last7Days.map(d => d.duration),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        workoutData: {
          labels: last7Days.map(d => d.day),
          datasets: [{
            label: 'Workouts',
            data: last7Days.map(d => d.workouts),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4
          }]
        },
        muscleData: Object.keys(muscleGroups).length > 0 ? {
          labels: Object.keys(muscleGroups),
          datasets: [{
            data: Object.values(muscleGroups),
            backgroundColor: Object.keys(muscleGroups).map(muscle => 
              muscleColors[muscle] || muscleColors['Other']
            ),
            borderWidth: 2,
            borderColor: '#1e293b'
          }]
        } : null
      };
      
      setAnalyticsData({
        stats: {
          totalWorkouts: stats.totalWorkouts || 0,
          totalPlans: stats.totalPlans || plans.length, // Use stats.totalPlans first
          todayWorkouts: stats.todayWorkouts || 0,
          weeklyWorkouts: stats.weeklyWorkouts || 0,
          totalMeals: meals.length,
          todayMeals: todayMeals.length,
          weeklyMeals: thisWeekMeals.length,
          // Achievement system removed
        },
        durationTrend: chartData.durationData,
        workoutFrequency: chartData.workoutData,
        muscleDistribution: chartData.muscleData
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setAnalyticsData({
        stats: {
          totalWorkouts: 0,
          totalPlans: 0,
          todayWorkouts: 0,
          weeklyWorkouts: 0,
          totalMeals: 0,
          todayMeals: 0,
          weeklyMeals: 0,
        },
        durationTrend: null,
        workoutFrequency: null,
        muscleDistribution: null
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only clear old data if no user-specific meals exist
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (currentUser) {
      const userMealKey = `recentMeals_${currentUser.id || currentUser._id}`;
      const existingUserMeals = localStorage.getItem(userMealKey);
      if (!existingUserMeals) {
        clearAllOldMealData();
        initializeEmptyUserMeals(currentUser.id || currentUser._id);
      }
    }
    
    loadAnalyticsData();
    
    const handleWorkoutComplete = () => loadAnalyticsData();
    const handleMealAdded = () => {
      console.log('🍽️ Analytics: Meal added - refreshing data');
      loadAnalyticsData();
    };
    const handleMealDeleted = () => {
      console.log('🗑️ Analytics: Meal deleted - refreshing data');
      loadAnalyticsData();
    };
    
    // INSTANT PLAN UPDATES - Same as Dashboard with user filtering
    const getUserPlanCount = () => {
      const allPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (!currentUser) return 0;
      
      const userPlans = allPlans.filter(plan => {
        return plan.userId === currentUser.id || plan.userId === currentUser._id ||
               (!plan.userId && plan.synced === false); // Backward compatibility
      });
      return userPlans.length;
    };
    
    const handlePlanCreated = () => {
      console.log('📋 Analytics: Plan created - instant update');
      // Update plan count immediately with user-specific filtering
      const userPlanCount = getUserPlanCount();
      setAnalyticsData(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          totalPlans: userPlanCount
        }
      } : null);
      // Then do full reload
      setTimeout(() => loadAnalyticsData(), 100);
    };
    
    // Listen to all plan-related events for instant updates
    const handlePlanUpdated = () => {
      console.log('📋 Analytics: Plan updated - instant refresh');
      const userPlanCount = getUserPlanCount();
      setAnalyticsData(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          totalPlans: userPlanCount
        }
      } : null);
    };
    
    const handlePlanDeleted = () => {
      console.log('📋 Analytics: Plan deleted - instant refresh');
      const userPlanCount = getUserPlanCount();
      setAnalyticsData(prev => prev ? {
        ...prev,
        stats: {
          ...prev.stats,
          totalPlans: userPlanCount
        }
      } : null);
    };
    
    // Listen to real-time stats updates
    const handleRealTimeStatsUpdate = (event) => {
      console.log('📊 Analytics: Real-time stats update received');
      if (event.detail) {
        setAnalyticsData(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            totalWorkouts: event.detail.totalWorkouts || prev.stats.totalWorkouts,
            todayWorkouts: event.detail.todayWorkouts || prev.stats.todayWorkouts,
            weeklyWorkouts: event.detail.weeklyWorkouts || prev.stats.weeklyWorkouts
          }
        } : null);
      }
    };
    
    // INSTANT ANALYTICS REFRESH - Same as Dashboard instant updates
    const handleAnalyticsRefresh = (event) => {
      console.log('🔄 Analytics: Analytics refresh triggered - instant update');
      // Immediately reload all analytics data
      loadAnalyticsData();
    };
    
    // INSTANT DASHBOARD UPDATE LISTENER - Same as Dashboard
    const handleDashboardUpdate = (event) => {
      console.log('⚡ Analytics: Dashboard update received - instant plan count update');
      if (event.detail && (event.detail.type === 'planCreated' || event.detail.type === 'planDeleted' || event.detail.type === 'planSynced')) {
        // Instantly update plan count with user-specific filtering
        const userPlanCount = getUserPlanCount();
        setAnalyticsData(prev => prev ? {
          ...prev,
          stats: {
            ...prev.stats,
            totalPlans: userPlanCount
          }
        } : null);
        console.log('✅ Analytics: Plan count updated instantly to', userPlanCount);
      }
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('mealDeleted', handleMealDeleted);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('planUpdated', handlePlanUpdated);
    window.addEventListener('planDeleted', handlePlanDeleted);
    window.addEventListener('realTimeStatsUpdate', handleRealTimeStatsUpdate);
    window.addEventListener('analyticsRefresh', handleAnalyticsRefresh);
    window.addEventListener('dashboardUpdate', handleDashboardUpdate);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('mealDeleted', handleMealDeleted);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('planUpdated', handlePlanUpdated);
      window.removeEventListener('planDeleted', handlePlanDeleted);
      window.removeEventListener('realTimeStatsUpdate', handleRealTimeStatsUpdate);
      window.removeEventListener('analyticsRefresh', handleAnalyticsRefresh);
      window.removeEventListener('dashboardUpdate', handleDashboardUpdate);
    };
  }, [stats]);

  const refresh = () => {
    refreshStats();
    loadAnalyticsData();
  };

  const durationData = analyticsData?.durationTrend;
  const frequencyData = analyticsData?.workoutFrequency;
  const muscleData = analyticsData?.muscleDistribution;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e2e8f0',
          font: { size: 12 }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      },
      y: {
        ticks: { color: '#94a3b8', font: { size: 11 } },
        grid: { color: 'rgba(148, 163, 184, 0.1)' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#e2e8f0', font: { size: 11 }, padding: 15 }
      }
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden">
        {/* Premium Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
        
        {/* Floating Analytics Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-red-700/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-red-600/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-orange-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 space-y-8">
          <AnalyticsHero />
        
          {/* Premium Status Bar */}
          <motion.div 
            className="mx-2 sm:mx-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-neutral-900/90 to-neutral-800/90 border-2 border-neutral-700/50 backdrop-blur-md shadow-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-red-700 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">📊</span>
                </div>
                <div>
                  <div className="text-white font-bold text-base sm:text-lg md:text-xl mb-1">Real-time Analytics</div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full animate-pulse shadow-lg ${
                      isOnline ? 'bg-red-500 shadow-red-500/50' : 'bg-yellow-400 shadow-yellow-400/50'
                    }`}></span>
                    <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl font-semibold ${
                      isOnline 
                        ? 'bg-green-600/20 text-green-300 border border-red-600/30' 
                        : 'bg-yellow-600/20 text-yellow-300 border border-yellow-500/30'
                    }`}>
                      {isOnline ? '🔥 LIVE USER DATA' : '📱 LOCAL DATA'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="text-left sm:text-right">
                  <div className="text-xs text-neutral-400 mb-1">Last updated:</div>
                  <div className="text-xs sm:text-sm text-neutral-300 font-medium">{new Date().toLocaleTimeString()}</div>
                </div>
                <motion.button
                  onClick={refresh}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-700 to-red-800 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl transition-all flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-red-600/20 font-semibold text-sm sm:text-base"
                  disabled={isLoading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={`text-base sm:text-lg ${isLoading ? 'animate-spin' : ''}`}>{isLoading ? '⟳' : '🔄'}</span>
                  <span className="hidden sm:inline">{isLoading ? 'Syncing...' : 'Sync Now'}</span>
                  <span className="sm:hidden">{isLoading ? 'Sync...' : 'Sync'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        
          <div id="real-time-stats" className="mx-2 sm:mx-4">
            <motion.div 
              className="mb-4 sm:mb-6 p-4 sm:p-6 bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 rounded-xl sm:rounded-2xl border-2 border-neutral-700/50 backdrop-blur-sm shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-600 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-base sm:text-xl">📊</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1">
                    <span className="hidden sm:inline">Your Real-Time Analytics</span>
                    <span className="sm:hidden">Your Analytics</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-300 font-medium">
                    <span className="hidden sm:inline">
                      {isAuthenticated() ? 'Showing your personal workout statistics and progress data.' : 'Login to view your personal analytics.'}
                    </span>
                    <span className="sm:hidden">
                      {isAuthenticated() ? 'Your personal stats & progress.' : 'Login for analytics.'}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
            <RealTimeStats />
          </div>

          {/* Mobile-Optimized 4-Section Analytics Grid */}
          <div id="analytics-charts" className="mx-2 sm:mx-4">
            {/* Mobile-First Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              
              {/* Section 1: Weekly Duration - Mobile Optimized */}
              <motion.div 
                className="bg-gradient-to-br from-neutral-900/95 to-black/95 backdrop-blur-xl border-2 border-orange-500/30 rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl hover:shadow-orange-500/20 transition-all duration-500 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Mobile-Optimized Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm sm:text-lg lg:text-xl">⏱️</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent truncate">
                        Weekly Duration
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium hidden sm:block">Real-time workout tracking</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-orange-500/20 border border-orange-400/40 rounded-full px-2 py-1">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-orange-300">LIVE</span>
                  </div>
                </div>
                
                {/* Mobile Chart Container */}
                <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-xl p-2 sm:p-3 border border-orange-500/20">
                  {durationData && (
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3 pb-2 border-b border-orange-500/20">
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-orange-400">
                          {durationData.datasets[0].data.reduce((a, b) => a + b, 0)}m
                        </div>
                        <div className="text-xs text-neutral-400">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-amber-400">
                          {Math.max(...durationData.datasets[0].data)}m
                        </div>
                        <div className="text-xs text-neutral-400">Peak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-yellow-400">
                          {Math.round(durationData.datasets[0].data.reduce((a, b) => a + b, 0) / 7)}m
                        </div>
                        <div className="text-xs text-neutral-400">Avg</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="h-32 sm:h-40 lg:h-48">
                    {durationData ? (
                      <Line data={{
                        ...durationData,
                        datasets: [{
                          ...durationData.datasets[0],
                          borderColor: '#f59e0b',
                          backgroundColor: 'rgba(245, 158, 11, 0.1)',
                          pointRadius: 3,
                          borderWidth: 2,
                          tension: 0.4,
                          fill: true
                        }]
                      }} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: '#f59e0b',
                            bodyColor: '#ffffff',
                            borderColor: '#f59e0b',
                            borderWidth: 1
                          }
                        },
                        scales: {
                          x: {
                            ticks: { color: '#f59e0b', font: { size: 10 } },
                            grid: { color: 'rgba(245, 158, 11, 0.1)' }
                          },
                          y: {
                            ticks: { color: '#f59e0b', font: { size: 10 } },
                            grid: { color: 'rgba(245, 158, 11, 0.1)' }
                          }
                        }
                      }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                        <span className="text-2xl sm:text-3xl opacity-50 mb-2">⏱️</span>
                        <span className="text-xs sm:text-sm font-bold text-orange-400 mb-1">Ready to Track</span>
                        <span className="text-xs text-center text-neutral-400">Start workouts</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Section 2: Weekly Workouts - Mobile Optimized */}
              <motion.div 
                className="bg-gradient-to-br from-neutral-900/95 to-black/95 backdrop-blur-xl border-2 border-red-600/30 rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl hover:shadow-red-600/20 transition-all duration-500 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Mobile-Optimized Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-600 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm sm:text-lg lg:text-xl">💪</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-red-500 to-emerald-300 bg-clip-text text-transparent truncate">
                        Weekly Workouts
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium hidden sm:block">Performance analytics</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-red-600/20 border border-red-500/40 rounded-full px-2 py-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-green-300">ACTIVE</span>
                  </div>
                </div>
                
                {/* Mobile Chart Container */}
                <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-xl p-2 sm:p-3 border border-red-600/20">
                  {frequencyData && (
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3 pb-2 border-b border-red-600/20">
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-red-500">
                          {frequencyData.datasets[0].data.reduce((a, b) => a + b, 0)}
                        </div>
                        <div className="text-xs text-neutral-400">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-red-500">
                          {Math.max(...frequencyData.datasets[0].data)}
                        </div>
                        <div className="text-xs text-neutral-400">Best</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-teal-400">
                          {(frequencyData.datasets[0].data.reduce((a, b) => a + b, 0) / 7).toFixed(1)}
                        </div>
                        <div className="text-xs text-neutral-400">Avg</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="h-32 sm:h-40 lg:h-48">
                    {frequencyData ? (
                      <Bar data={{
                        ...frequencyData,
                        datasets: [{
                          ...frequencyData.datasets[0],
                          backgroundColor: '#10b981',
                          borderColor: '#10b981',
                          borderWidth: 1,
                          borderRadius: 4
                        }]
                      }} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: '#10b981',
                            bodyColor: '#ffffff',
                            borderColor: '#10b981',
                            borderWidth: 1
                          }
                        },
                        scales: {
                          x: {
                            ticks: { color: '#10b981', font: { size: 10 } },
                            grid: { color: 'rgba(16, 185, 129, 0.1)' }
                          },
                          y: {
                            ticks: { color: '#10b981', font: { size: 10 }, stepSize: 1 },
                            grid: { color: 'rgba(16, 185, 129, 0.1)' }
                          }
                        }
                      }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                        <span className="text-2xl sm:text-3xl opacity-50 mb-2">💪</span>
                        <span className="text-xs sm:text-sm font-bold text-red-500 mb-1">Ready to Crush</span>
                        <span className="text-xs text-center text-neutral-400">Begin journey</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Section 3: Muscle Groups - Mobile Optimized */}
              <motion.div 
                className="bg-gradient-to-br from-neutral-900/95 to-black/95 backdrop-blur-xl border-2 border-red-700/30 rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl hover:shadow-red-700/20 transition-all duration-500 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Mobile-Optimized Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-700 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm sm:text-lg lg:text-xl">💪</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-red-600 to-pink-300 bg-clip-text text-transparent truncate">
                        Muscle Groups
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium hidden sm:block">Training distribution</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-red-700/20 border border-red-600/40 rounded-full px-2 py-1">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-purple-300">TRACK</span>
                  </div>
                </div>
                
                {/* Mobile Chart Container */}
                <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-xl p-2 sm:p-3 border border-red-700/20">
                  {muscleData && (
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-2 sm:mb-3 pb-2 border-b border-red-700/20">
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-red-600">
                          {muscleData.datasets[0].data.reduce((a, b) => a + b, 0)}
                        </div>
                        <div className="text-xs text-neutral-400">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm sm:text-lg font-bold text-pink-400">
                          {muscleData.labels.length}
                        </div>
                        <div className="text-xs text-neutral-400">Groups</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs sm:text-sm font-bold text-violet-400 truncate">
                          {muscleData.labels[muscleData.datasets[0].data.indexOf(Math.max(...muscleData.datasets[0].data))]}
                        </div>
                        <div className="text-xs text-neutral-400">Top</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="h-32 sm:h-40 lg:h-48">
                    {muscleData ? (
                      <Doughnut data={{
                        ...muscleData,
                        datasets: [{
                          ...muscleData.datasets[0],
                          backgroundColor: [
                            '#ef4444', '#3b82f6', '#f59e0b', '#10b981', 
                            '#8b5cf6', '#f97316', '#06b6d4', '#6b7280'
                          ],
                          borderColor: '#1e293b',
                          borderWidth: 2
                        }]
                      }} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: true,
                            position: 'bottom',
                            labels: {
                              color: '#ffffff',
                              font: { size: 11, weight: 'bold' },
                              padding: 8,
                              usePointStyle: true,
                              pointStyle: 'circle',
                              generateLabels: function(chart) {
                                const data = chart.data;
                                const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                return data.labels.map((label, i) => {
                                  const value = data.datasets[0].data[i];
                                  const percentage = ((value / total) * 100).toFixed(0);
                                  return {
                                    text: `${label} ${percentage}%`,
                                    fillStyle: data.datasets[0].backgroundColor[i],
                                    strokeStyle: '#ffffff',
                                    lineWidth: 2,
                                    fontColor: '#ffffff',
                                    hidden: false,
                                    index: i
                                  };
                                });
                              }
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            titleColor: '#a855f7',
                            bodyColor: '#ffffff',
                            borderColor: '#a855f7',
                            borderWidth: 1
                          }
                        }
                      }} />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                        <span className="text-2xl sm:text-3xl opacity-50 mb-2">💪</span>
                        <span className="text-xs sm:text-sm font-bold text-red-600 mb-1">Build Profile</span>
                        <span className="text-xs text-center text-neutral-400">Target muscles</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Section 4: Quick Stats - Mobile Optimized */}
              <motion.div 
                className="bg-gradient-to-br from-neutral-900/95 to-black/95 backdrop-blur-xl border-2 border-red-600/30 rounded-2xl sm:rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl hover:shadow-red-600/20 transition-all duration-500 relative overflow-hidden group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                whileHover={{ scale: 1.02 }}
              >
                {/* Mobile-Optimized Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-sm sm:text-lg lg:text-xl">⚡</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent truncate">
                        Quick Stats
                      </h3>
                      <p className="text-xs text-neutral-400 font-medium hidden sm:block">Real-time overview</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-red-600/20 border border-red-500/40 rounded-full px-2 py-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold text-blue-300">STATS</span>
                  </div>
                </div>
                
                {/* Mobile Stats Grid */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-400/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm">💪</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-white font-semibold text-xs sm:text-sm block truncate">Total Workouts</span>
                        <div className="text-xs text-orange-300 hidden sm:block">Lifetime sessions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-400 font-bold text-lg sm:text-xl">{analyticsData?.stats?.totalWorkouts || 0}</span>
                      <div className="text-xs text-neutral-400">sessions</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-red-600/10 to-indigo-500/10 rounded-lg border border-red-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-600 to-indigo-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm">📋</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-white font-semibold text-xs sm:text-sm block truncate">Workout Plans</span>
                        <div className="text-xs text-blue-300 hidden sm:block">Custom routines</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-500 font-bold text-lg sm:text-xl">{analyticsData?.stats?.totalPlans || 0}</span>
                      <div className="text-xs text-neutral-400">plans</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-red-600/10 to-red-600/10 rounded-lg border border-red-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-600 to-red-600 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm">🍽️</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-white font-semibold text-xs sm:text-sm block truncate">Total Meals</span>
                        <div className="text-xs text-green-300 hidden sm:block">Nutrition tracking</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-500 font-bold text-lg sm:text-xl">{analyticsData?.stats?.totalMeals || 0}</span>
                      <div className="text-xs text-neutral-400">meals</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gradient-to-r from-red-600/10 to-teal-500/10 rounded-lg border border-red-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-600 to-teal-500 rounded-md flex items-center justify-center">
                        <span className="text-white text-xs sm:text-sm">🌟</span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-white font-semibold text-xs sm:text-sm block truncate">Today's Meals</span>
                        <div className="text-xs text-emerald-300 hidden sm:block">Daily progress</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-red-500 font-bold text-lg sm:text-xl">{analyticsData?.stats?.todayMeals || 0}</span>
                      <div className="text-xs text-neutral-400">today</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Premium Meal Tracking Calendar */}
          <motion.div 
            className="mx-2 sm:mx-4 pb-4 sm:pb-6 md:pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="bg-gradient-to-br from-neutral-900/95 to-black/95 backdrop-blur-xl border-2 border-red-600/30 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl hover:shadow-red-600/20 transition-all duration-500 relative overflow-hidden group">
              {/* Advanced Gym Branding Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-red-600/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
              <div className="absolute top-0 left-0 w-full h-0.5 sm:h-1 bg-gradient-to-r from-red-600 via-red-500 to-teal-500 rounded-t-xl sm:rounded-t-2xl md:rounded-t-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
              
              <div className="relative z-10">
                {/* Professional Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-1 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-600 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl border border-red-500/30">
                        <span className="text-white text-lg sm:text-xl md:text-2xl animate-bounce">🍽️</span>
                      </div>
                      <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full border-2 border-neutral-900 animate-pulse"></div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-red-500 to-green-300 bg-clip-text text-transparent truncate">
                        MEAL TRACKING CALENDAR
                      </h3>
                      <p className="text-[10px] sm:text-xs md:text-sm text-neutral-400 font-medium hidden sm:block">Track your daily nutrition consistency with real-time meal logging data</p>
                      <p className="text-[10px] text-neutral-400 font-medium sm:hidden">Track nutrition with real-time data</p>
                    </div>
                  </div>
                  
                  {/* Live Status Badge */}
                  <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-red-600/20 border border-red-500/40 rounded-full px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 flex-shrink-0">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-[9px] sm:text-[10px] md:text-xs font-bold text-emerald-300 tracking-wider">NUTRITION</span>
                  </div>
                </div>
                
                {/* Calendar Container */}
                <div className="bg-gradient-to-br from-black/60 to-black/40 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 border border-red-600/20 shadow-inner">
                  <MealTrackingCalendar />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Premium Footer Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/20 to-transparent pointer-events-none"></div>
      </div>
    </AuthGuard>
  );
}