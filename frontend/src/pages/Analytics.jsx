import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import { useRealTime } from '../context/RealTimeContext';

import AuthGuard from '../components/AuthGuard';
import RealTimeStats from '../components/RealTimeStats';
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
  const { isAuthenticated, user } = useAuth();

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

          },
          durationTrend: null,
          workoutFrequency: null,
          last7Days: [],
          muscleDistribution: null,
          muscleGroupCounts: {}
        });
        setIsLoading(false);
        return;
      }
      
      // Get user-specific workouts from multiple sources for comprehensive duration tracking
      const workouts = window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      // Get plans with immediate refresh
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      console.log('📊 Analytics: Current plans count:', plans.length);
      
      // Combine workouts from both sources - show all workouts if no user or filter by user
      const allWorkouts = [...workouts, ...completedWorkouts];
      
      console.log('📊 Raw workout data:', {
        realTimeWorkouts: workouts.length,
        completedWorkouts: completedWorkouts.length,
        total: allWorkouts.length,
        user: user?.id || 'no-user'
      });
      
      // Remove duplicates based on id or timestamp
      const uniqueWorkouts = allWorkouts.reduce((acc, current) => {
        const existing = acc.find(w => 
          w.id === current.id || 
          (w.completedAt === current.completedAt && w.exercise === current.exercise)
        );
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      // Calculate muscle group distribution
      const muscleGroupCounts = {};
      uniqueWorkouts.forEach(workout => {
        const category = workout.category || workout.muscle || 'Other';
        muscleGroupCounts[category] = (muscleGroupCounts[category] || 0) + 1;
      });
      
      console.log('📊 Muscle group distribution:', muscleGroupCounts);
      
      console.log(`📊 Analytics: Processing ${uniqueWorkouts.length} unique workouts, ${plans.length} plans`);
      console.log('📊 Sample workout data:', uniqueWorkouts.slice(0, 2));
      
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        
        const dayWorkouts = uniqueWorkouts.filter(w => {
          const workoutDate = new Date(w.completedAt || w.createdAt || Date.now());
          return workoutDate.toDateString() === date.toDateString();
        });
        
        if (dayWorkouts.length > 0) {
          console.log(`📊 ${dayName}: ${dayWorkouts.length} workouts found`);
        }
        
        const dayDuration = dayWorkouts.reduce((sum, workout) => {
          // Get duration from multiple possible sources
          let duration = 0;
          if (workout.duration) {
            duration = workout.duration;
          } else if (workout.setsData && Array.isArray(workout.setsData)) {
            // Calculate duration from individual set durations
            duration = workout.setsData.reduce((setSum, set) => {
              return setSum + (set.duration || 0);
            }, 0);
          } else if (workout.totalTime) {
            duration = workout.totalTime;
          }
          return sum + duration;
        }, 0);
        
        last7Days.push({
          day: dayName,
          workouts: dayWorkouts.length,
          duration: Math.round(dayDuration), // Duration in minutes
          workoutNames: dayWorkouts.map(w => w.exercise || w.name).slice(0, 3) // Top 3 exercises
        });
      }
      
      // Create muscle group chart data
      const muscleLabels = Object.keys(muscleGroupCounts);
      const muscleData = Object.values(muscleGroupCounts);
      const muscleColors = [
        '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
      ];
      
      const chartData = {
        durationData: {
          labels: last7Days.map(d => d.day),
          datasets: [{
            label: 'Exercise Duration (minutes)',
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
            label: 'Workouts Completed',
            data: last7Days.map(d => d.workouts),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6,
            pointHoverRadius: 8
          }]
        },
        muscleData: muscleLabels.length > 0 ? {
          labels: muscleLabels,
          datasets: [{
            label: 'Workouts by Muscle Group',
            data: muscleData,
            backgroundColor: muscleColors.slice(0, muscleLabels.length),
            borderColor: '#1e293b',
            borderWidth: 2,
            hoverBorderWidth: 3
          }]
        } : null
      };
      
      const totalDuration = uniqueWorkouts.reduce((sum, w) => sum + (w.duration || w.activeTime || 0), 0);
      const weeklyWorkouts = last7Days.reduce((sum, day) => sum + day.workouts, 0);
      const totalSets = uniqueWorkouts.reduce((sum, w) => sum + (w.sets || 0), 0);
      const totalReps = uniqueWorkouts.reduce((sum, w) => sum + (w.reps || 0), 0);
      const totalWeight = uniqueWorkouts.reduce((sum, w) => sum + (w.totalWeight || 0), 0);
      const totalCalories = uniqueWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
      
      // Calculate streak (consecutive days with workouts)
      let currentStreak = 0;
      const currentDate = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(currentDate);
        checkDate.setDate(currentDate.getDate() - i);
        const hasWorkout = uniqueWorkouts.some(w => {
          const workoutDate = new Date(w.completedAt || w.createdAt);
          return workoutDate.toDateString() === checkDate.toDateString();
        });
        if (hasWorkout) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      const newAnalyticsData = {
        stats: {
          totalWorkouts: uniqueWorkouts.length,
          totalPlans: plans.length, // Real-time plan count
          todayWorkouts: last7Days[6]?.workouts || 0, // Today is last day
          weeklyWorkouts: weeklyWorkouts,
          totalDuration: totalDuration,
          totalSets: totalSets,
          totalReps: totalReps,
          totalWeight: totalWeight,
          totalCalories: totalCalories,
          currentStreak: currentStreak,
          avgWorkoutDuration: uniqueWorkouts.length > 0 ? Math.round(totalDuration / uniqueWorkouts.length) : 0,
          muscleGroupsWorked: Object.keys(muscleGroupCounts).length
        },
        durationTrend: chartData.durationData,
        workoutFrequency: chartData.workoutData,
        last7Days: last7Days,
        muscleDistribution: chartData.muscleData,
        muscleGroupCounts: muscleGroupCounts
      };
      
      console.log('📊 Final analytics data:', newAnalyticsData);
      setAnalyticsData(newAnalyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      setAnalyticsData({
        stats: {
          totalWorkouts: 0,
          totalPlans: 0,
          todayWorkouts: 0,
          weeklyWorkouts: 0,

        },
        durationTrend: null,
        workoutFrequency: null,
        last7Days: [],
        muscleDistribution: null,
        muscleGroupCounts: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
    
    const handleWorkoutComplete = (event) => {
      console.log('📊 Analytics: Workout completed event received', event.detail);
      setTimeout(loadAnalyticsData, 500); // Small delay to ensure data is saved
    };
    const handleMealAdded = () => loadAnalyticsData();
    const handlePlanCreated = (event) => {
      console.log('📊 Analytics: Plan created event received', event.detail);
      loadAnalyticsData(); // Immediate update for plans
    };
    
    // Instant plan update handlers
    const handlePlanUpdated = (event) => {
      console.log('📊 Analytics: Plan updated event received');
      loadAnalyticsData();
    };
    
    const handlePlanDeleted = (event) => {
      console.log('📊 Analytics: Plan deleted event received');
      loadAnalyticsData();
    };
    
    // Storage change listener for instant updates
    const handleStorageChange = (event) => {
      if (event.key === 'workoutPlans') {
        console.log('📊 Analytics: Plans storage changed');
        loadAnalyticsData();
      }
    };
    
    // Listen for real-time stats updates
    const handleRealTimeStatsUpdate = (event) => {
      console.log('📊 Analytics: Real-time stats update received', event.detail);
      loadAnalyticsData();
    };
    
    // Listen for analytics-specific refresh events
    const handleAnalyticsRefresh = (event) => {
      console.log('📊 Analytics: Analytics refresh event received', event.detail);
      setTimeout(loadAnalyticsData, 100); // Quick refresh for immediate update
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('realTimeStatsUpdate', handleRealTimeStatsUpdate);
    window.addEventListener('analyticsRefresh', handleAnalyticsRefresh);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('planUpdated', handlePlanUpdated);
    window.addEventListener('planDeleted', handlePlanDeleted);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('realTimeStatsUpdate', handleRealTimeStatsUpdate);
      window.removeEventListener('analyticsRefresh', handleAnalyticsRefresh);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('planUpdated', handlePlanUpdated);
      window.removeEventListener('planDeleted', handlePlanDeleted);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [stats]);

  const refresh = () => {
    refreshStats();
    loadAnalyticsData();
  };

  const durationData = analyticsData?.durationTrend;
  const frequencyData = analyticsData?.workoutFrequency;
  const last7Days = analyticsData?.last7Days || [];
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
      <div className="space-y-6">
        <AnalyticsHero />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                isOnline ? 'bg-green-400' : 'bg-yellow-400'
              }`}></span>
              Real-time Analytics
              <span className={`text-xs px-2 py-1 rounded-full ${
                isOnline 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {isOnline ? '🔥 LIVE USER DATA' : '📱 YOUR LOCAL DATA'}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('🔍 Debug: Checking workout data...');
                  console.log('localStorage completedWorkouts:', JSON.parse(localStorage.getItem('completedWorkouts') || '[]'));
                  console.log('realTimeWorkoutSync:', window.realTimeWorkoutSync?.getWorkoutHistory(30));
                  loadAnalyticsData();
                }}
                className="px-3 py-2 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg"
              >
                🔍 Debug
              </button>
              <button
                onClick={refresh}
                className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all flex items-center gap-2 shadow-lg"
                disabled={isLoading}
              >
                <span className={isLoading ? 'animate-spin' : ''}>{isLoading ? '⟳' : '🔄'}</span>
                {isLoading ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>
          </div>
        </div>
        
        <div id="real-time-stats">
          <div className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400">📊</span>
              <h3 className="text-lg font-semibold text-white">Your Real-Time Analytics</h3>
            </div>
            <p className="text-sm text-slate-400">
              {isAuthenticated() ? 'Showing your personal workout statistics and progress data.' : 'Login to view your personal analytics.'}
            </p>
          </div>
          <RealTimeStats />
        </div>

        <div id="analytics-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-amber-400">⏱️</span>
              Weekly Exercise Duration
            </h3>
            <div className="h-64">
              {durationData ? (
                <Line data={durationData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <div className="text-2xl mb-2">📊</div>
                    <div>Complete workouts to see duration trends</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-green-400">💪</span>
              Weekly Workouts
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full ml-2">
                {analyticsData?.stats?.weeklyWorkouts || 0} this week
              </span>
            </h3>
            <div className="h-64">
              {frequencyData ? (
                <Bar data={frequencyData} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      callbacks: {
                        afterBody: function(context) {
                          const dataIndex = context[0].dataIndex;
                          const dayData = last7Days[dataIndex];
                          if (dayData && dayData.workoutNames && dayData.workoutNames.length > 0) {
                            return `Exercises: ${dayData.workoutNames.join(', ')}`;
                          }
                          return '';
                        }
                      }
                    }
                  },
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      beginAtZero: true,
                      ticks: {
                        ...chartOptions.scales.y.ticks,
                        stepSize: 1
                      }
                    }
                  }
                }} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <div className="text-2xl mb-2">💪</div>
                    <div>Complete workouts to see weekly progress</div>
                  </div>
                </div>
              )}
            </div>
            {frequencyData && (
              <div className="mt-4 text-center">
                <div className="text-sm text-slate-400">
                  Total: {last7Days.reduce((sum, day) => sum + day.workouts, 0)} workouts this week
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 text-center flex items-center justify-center gap-2">
              <span className="text-purple-400">🎯</span>
              Muscle Groups
              <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full">
                {Object.keys(analyticsData?.muscleGroupCounts || {}).length} groups
              </span>
            </h3>
            <div className="h-64">
              {muscleData ? (
                <Doughnut data={muscleData} options={{
                  ...doughnutOptions,
                  plugins: {
                    ...doughnutOptions.plugins,
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.parsed || 0;
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((value / total) * 100).toFixed(1);
                          return `${label}: ${value} workouts (${percentage}%)`;
                        }
                      }
                    }
                  }
                }} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div>Complete workouts to see muscle group distribution</div>
                  </div>
                </div>
              )}
            </div>
            {muscleData && analyticsData?.muscleGroupCounts && (
              <div className="mt-4">
                <div className="text-sm text-slate-400 text-center mb-2">Muscle Group Breakdown:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(analyticsData.muscleGroupCounts).map(([muscle, count], index) => (
                    <div key={muscle} className="flex items-center justify-between bg-slate-800/30 rounded px-2 py-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'][index % 10] }}
                        ></div>
                        <span className="text-slate-300">{muscle}</span>
                      </div>
                      <span className="text-white font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <span className="text-blue-400">📊</span>
              Quick Stats
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                Real-time
              </span>
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">💪</span>
                  <span className="text-slate-300">Total Workouts</span>
                </div>
                <span className="text-white font-bold text-lg">{analyticsData?.stats?.totalWorkouts || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-purple-400">📋</span>
                  <span className="text-slate-300">Workout Plans</span>
                </div>
                <span className="text-white font-bold text-lg">{analyticsData?.stats?.totalPlans || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⏱️</span>
                  <span className="text-slate-300">Exercise Time</span>
                </div>
                <span className="text-white font-bold text-lg">{Math.floor((analyticsData?.stats?.totalDuration || 0) / 60)} min</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-orange-400">🔥</span>
                  <span className="text-slate-300">Current Streak</span>
                </div>
                <span className="text-white font-bold text-lg">{analyticsData?.stats?.currentStreak || 0} days</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">🏋️</span>
                  <span className="text-slate-300">Total Sets</span>
                </div>
                <span className="text-white font-bold text-lg">{analyticsData?.stats?.totalSets || 0}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-800/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">🎯</span>
                  <span className="text-slate-300">Muscle Groups</span>
                </div>
                <span className="text-white font-bold text-lg">{analyticsData?.stats?.muscleGroupsWorked || 0}</span>
              </div>
              {analyticsData?.stats?.totalWorkouts > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-700">
                  <div className="text-xs text-slate-400 text-center mb-2">Performance Metrics</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-slate-800/20 rounded">
                      <div className="text-slate-400">Avg Duration</div>
                      <div className="text-white font-medium">{analyticsData?.stats?.avgWorkoutDuration || 0} min</div>
                    </div>
                    <div className="text-center p-2 bg-slate-800/20 rounded">
                      <div className="text-slate-400">Total Calories</div>
                      <div className="text-white font-medium">{analyticsData?.stats?.totalCalories || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}