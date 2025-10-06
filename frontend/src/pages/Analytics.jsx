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
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      
      // Filter plans by current user - same as Dashboard
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
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
    loadAnalyticsData();
    
    const handleWorkoutComplete = () => loadAnalyticsData();
    const handleMealAdded = () => loadAnalyticsData();
    
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
    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('planUpdated', handlePlanUpdated);
    window.addEventListener('planDeleted', handlePlanDeleted);
    window.addEventListener('realTimeStatsUpdate', handleRealTimeStatsUpdate);
    window.addEventListener('analyticsRefresh', handleAnalyticsRefresh);
    window.addEventListener('dashboardUpdate', handleDashboardUpdate);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealAdded', handleMealAdded);
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
              Weekly Duration
            </h3>
            <div className="h-64">
              {durationData ? (
                <Line data={durationData} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const minutes = context.parsed.y;
                          const hours = Math.floor(minutes / 60);
                          const mins = minutes % 60;
                          return hours > 0 
                            ? `Duration: ${hours}h ${mins}m`
                            : `Duration: ${mins} minutes`;
                        }
                      }
                    }
                  },
                  scales: {
                    ...chartOptions.scales,
                    y: {
                      ...chartOptions.scales.y,
                      ticks: {
                        ...chartOptions.scales.y.ticks,
                        callback: function(value) {
                          return value >= 60 ? `${Math.floor(value/60)}h ${value%60}m` : `${value}m`;
                        }
                      }
                    }
                  }
                }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <span className="text-4xl mb-2">⏱️</span>
                  <span>No workout duration data</span>
                  <span className="text-xs mt-1">Complete workouts to see your time trends</span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Weekly Workouts</h3>
            <div className="h-64">
              {frequencyData ? (
                <Bar data={frequencyData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center justify-center gap-2">
              <span className="text-purple-400">💪</span>
              Muscle Groups
            </h3>
            <div className="h-64">
              {muscleData ? (
                <Doughnut data={muscleData} options={{
                  ...doughnutOptions,
                  plugins: {
                    ...doughnutOptions.plugins,
                    tooltip: {
                      titleColor: '#ffffff',
                      bodyColor: '#ffffff',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a, b) => a + b, 0);
                          const percentage = ((context.parsed / total) * 100).toFixed(1);
                          return `${context.label}: ${context.parsed} workouts (${percentage}%)`;
                        }
                      }
                    },
                    legend: {
                      ...doughnutOptions.plugins.legend,
                      labels: {
                        color: '#e2e8f0',
                        font: { size: 12 },
                        padding: 15,
                        generateLabels: function(chart) {
                          const data = chart.data;
                          const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                          return data.labels.map((label, i) => {
                            const value = data.datasets[0].data[i];
                            const percentage = ((value / total) * 100).toFixed(1);
                            return {
                              text: `${label} (${percentage}%)`,
                              fillStyle: data.datasets[0].backgroundColor[i],
                              strokeStyle: data.datasets[0].backgroundColor[i],
                              fontColor: '#ffffff',
                              lineWidth: 0,
                              hidden: false,
                              index: i
                            };
                          });
                        }
                      }
                    }
                  }
                }} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <span className="text-4xl mb-2">💪</span>
                  <span>No muscle group data</span>
                  <span className="text-xs mt-1">Complete workouts to see muscle distribution</span>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Your Total Workouts</span>
                <span className="text-white font-bold">{analyticsData?.stats?.totalWorkouts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Your Workout Plans</span>
                <span className="text-white font-bold">{analyticsData?.stats?.totalPlans || 0}</span>
              </div>


            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}