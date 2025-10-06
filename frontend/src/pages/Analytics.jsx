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
          caloriesTrend: null,
          workoutFrequency: null,
          muscleDistribution: null
        });
        setIsLoading(false);
        return;
      }
      
      // Get user-specific workouts from realTimeWorkoutSync
      const workouts = window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      
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
        
        const dayMeals = meals.filter(m => {
          const mealDate = new Date(m.consumedAt || m.createdAt);
          return mealDate.toDateString() === date.toDateString();
        });
        
        last7Days.push({
          day: dayName,
          workouts: dayWorkouts.length,
          calories: dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
        });
      }
      
      const chartData = {
        caloriesData: {
          labels: last7Days.map(d => d.day),
          datasets: [{
            label: 'Calories',
            data: last7Days.map(d => d.calories),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
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
        }
      };
      
      setAnalyticsData({
        stats: {
          totalWorkouts: stats.totalWorkouts || 0,
          totalPlans: plans.length,
          todayWorkouts: stats.todayWorkouts || 0,
          weeklyWorkouts: stats.weeklyWorkouts || 0,

          // Achievement system removed
        },
        caloriesTrend: chartData.caloriesData,
        workoutFrequency: chartData.workoutData,
        muscleDistribution: null
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
        caloriesTrend: null,
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
    const handlePlanCreated = () => loadAnalyticsData();
    
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
    };
  }, [stats]);

  const refresh = () => {
    refreshStats();
    loadAnalyticsData();
  };

  const caloriesData = analyticsData?.caloriesTrend;
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
            <h3 className="text-xl font-semibold text-white mb-4">Weekly Calories</h3>
            <div className="h-64">
              {caloriesData ? (
                <Line data={caloriesData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
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
            <h3 className="text-xl font-semibold text-white mb-4 text-center">Muscle Groups</h3>
            <div className="h-64">
              {muscleData ? (
                <Doughnut data={muscleData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
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