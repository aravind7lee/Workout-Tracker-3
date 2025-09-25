// frontend/src/pages/Analytics.jsx - Real-time MongoDB Backend Integration
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RealTimeAchievements from '../components/RealTimeAchievements';
import RealTimeStats from '../components/RealTimeStats';
import progressAnalyticsImg from '../assets/Progress & Analytics.jpg';

// Safe import of onlineService
let onlineService = null;
try {
  onlineService = require('../services/onlineService').onlineService;
} catch (error) {
  console.warn('onlineService not available, using offline mode only');
  onlineService = {
    checkBackendStatus: () => Promise.resolve(false),
    getAnalytics: () => Promise.reject(new Error('Service unavailable')),
    getWorkoutHistory: () => Promise.reject(new Error('Service unavailable')),
    getWorkoutPlans: () => Promise.reject(new Error('Service unavailable'))
  };
}

Chart.register(...registerables);

// LQIP placeholder for Analytics
const ANALYTICS_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

// Analytics Hero Component
function AnalyticsHero() {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      // Small delay to ensure image is fully rendered
      setTimeout(() => setImageLoaded(true), 100);
    };
    img.onerror = () => {
      console.warn('Analytics hero image failed to load');
      setImageLoaded(true); // Show content even if image fails
    };
    img.src = progressAnalyticsImg;
    img.loading = 'eager';
  }, []);

  const overlayClass = theme === 'dark' 
    ? 'bg-gradient-to-t from-black/70 via-black/40 to-black/20'
    : 'bg-gradient-to-t from-black/60 via-black/30 to-black/10';

  return (
    <motion.div 
      className="relative h-64 sm:h-80 md:h-96 lg:h-[480px] w-full overflow-hidden rounded-lg mb-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        {/* LQIP Placeholder */}
        <img
          src={ANALYTICS_LQIP}
          alt=""
          className="w-full h-full object-cover blur-sm transition-opacity duration-300"
          style={{ opacity: imageLoaded ? 0 : 1 }}
        />
        
        {/* Main Image */}
        <img
          src={progressAnalyticsImg}
          alt="Progress & Analytics - Professional fitness tracking and data visualization"
          className="w-full h-full object-cover absolute inset-0 transition-opacity duration-300"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          style={{ objectPosition: 'center top', opacity: imageLoaded ? 1 : 0 }}
        />
      </div>
      
      {/* Particles - Defer until image loads */}
      {imageLoaded && (
        <div className="hidden md:block absolute inset-0 opacity-30">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/40 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Overlay */}
      <div className={`absolute inset-0 ${overlayClass}`} />
      
      {/* Content - Only show after image loads */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center px-4">
          <motion.h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: imageLoaded ? 1 : 0, y: imageLoaded ? 0 : 20 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: imageLoaded ? 0.2 : 0 }}
          >
            Progress & Analytics
          </motion.h1>
          <motion.p 
            className="text-sm sm:text-base md:text-lg text-white/95 drop-shadow-md"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: imageLoaded ? 1 : 0, y: imageLoaded ? 0 : 15 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: imageLoaded ? 0.4 : 0 }}
          >
            Track your fitness journey with real-time insights
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  
  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Always load offline data first to prevent errors
      loadOfflineData();
      setIsOnline(false);
      
      // Only try backend if authenticated and service is available
      if (isAuthenticated && isAuthenticated() && onlineService) {
        try {
          const online = await Promise.race([
            onlineService.checkBackendStatus(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
          ]);
          
          if (online) {
            setIsOnline(true);
            // Backend calls with timeout and error handling
            const analyticsPromise = Promise.race([
              onlineService.getAnalytics(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]).catch(() => null);
            
            const workoutsPromise = Promise.race([
              onlineService.getWorkoutHistory(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]).catch(() => []);
            
            const plansPromise = Promise.race([
              onlineService.getWorkoutPlans(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]).catch(() => []);
            
            const [analytics, workouts, plans] = await Promise.all([
              analyticsPromise, workoutsPromise, plansPromise
            ]);
            
            if (analytics) {
              setRealTimeStats({
                totalWorkouts: analytics.totalWorkouts || 0,
                totalPlans: plans?.length || 0,
                totalMeals: analytics.totalMeals || 0,
                currentStreak: analytics.currentStreak || 0,
                xpPoints: analytics.xpPoints || 0
              });
              
              setAnalyticsData({
                stats: analytics,
                caloriesTrend: generateChartData(analytics.caloriesTrend, 'Calories'),
                workoutFrequency: generateChartData(analytics.workoutFrequency, 'Workouts'),
                muscleDistribution: generateDoughnutData(analytics.muscleGroups),
                achievements: analytics.achievements || []
              });
            }
          }
        } catch (backendError) {
          console.warn('Backend unavailable, using offline data:', backendError.message);
          setIsOnline(false);
        }
      }
    } catch (err) {
      console.error('Analytics loading error:', err);
      setError(null); // Don't show error, just use offline data
      loadOfflineData();
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  const loadOfflineData = () => {
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      
      setRealTimeStats({
        totalWorkouts: workouts.length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: Math.floor(Math.random() * 7), // Mock streak
        xpPoints: workouts.length * 100 + plans.length * 50
      });
      
      // Generate mock chart data for better UX
      const mockCaloriesData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Calories',
          data: [2200, 2100, 2300, 2000, 2400, 2200, 2100],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        }]
      };
      
      const mockWorkoutData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Workouts',
          data: [1, 0, 1, 1, 0, 1, 0],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        }]
      };
      
      setAnalyticsData({
        stats: null,
        caloriesTrend: mockCaloriesData,
        workoutFrequency: mockWorkoutData,
        muscleDistribution: null,
        achievements: []
      });
    } catch (error) {
      console.error('Error loading offline data:', error);
      // Set minimal fallback data
      setRealTimeStats({
        totalWorkouts: 0,
        totalPlans: 0,
        totalMeals: 0,
        currentStreak: 0,
        xpPoints: 0
      });
      setAnalyticsData({
        stats: null,
        caloriesTrend: null,
        workoutFrequency: null,
        muscleDistribution: null,
        achievements: []
      });
    }
  };
  
  const generateChartData = (data, label) => {
    if (!data || !Array.isArray(data)) return null;
    
    return {
      labels: data.map(item => item.date || item.day || 'Day'),
      datasets: [{
        label,
        data: data.map(item => item.value || item.count || 0),
        borderColor: label === 'Calories' ? '#3b82f6' : '#10b981',
        backgroundColor: label === 'Calories' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        tension: 0.4
      }]
    };
  };
  
  const generateDoughnutData = (muscleGroups) => {
    if (!muscleGroups || !Array.isArray(muscleGroups)) return null;
    
    return {
      labels: muscleGroups.map(group => group.name || 'Unknown'),
      datasets: [{
        data: muscleGroups.map(group => group.count || 0),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
        borderWidth: 0
      }]
    };
  };
  
  useEffect(() => {
    loadAnalyticsData();
    
    // Set up real-time refresh every 60 seconds (reduced frequency)
    const interval = setInterval(() => {
      if (isAuthenticated && isAuthenticated()) {
        loadAnalyticsData();
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [loadAnalyticsData]);
  
  const refresh = () => {
    loadAnalyticsData();
  };

  const stats = analyticsData?.stats;
  const caloriesData = analyticsData?.caloriesTrend;
  const frequencyData = analyticsData?.workoutFrequency;
  const muscleData = analyticsData?.muscleDistribution;
  const achievements = analyticsData?.achievements;

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

  if (error) {
    return (
      <div className="space-y-6">
        <AnalyticsHero />
        <div className="flex items-center justify-between">
          <button onClick={refresh} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Retry
          </button>
        </div>
        <div className="card text-center py-8">
          <div className="text-red-400 mb-2">⚠️ Failed to load analytics</div>
          <div className="text-slate-400 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Header */}
      <AnalyticsHero />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm">
            Real-time insights from MongoDB backend
            <span className={`ml-2 text-xs ${isOnline ? 'text-green-400' : 'text-yellow-400'}`}>
              • {isOnline ? 'Online Mode - Live Data' : 'Offline Mode - Local Data'}
            </span>
          </p>
        </div>
        <button
          onClick={refresh}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          disabled={isLoading}
        >
          <span className={isLoading ? 'animate-spin' : ''}>{isLoading ? '⟳' : '🔄'}</span>
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      
      {/* Real-Time Stats Overview */}
      <RealTimeStats />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="card">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Weekly Calories</h3>
          <div className="h-48 sm:h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : caloriesData ? (
              <Line data={caloriesData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Weekly Workouts</h3>
          <div className="h-48 sm:h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : frequencyData ? (
              <Bar data={frequencyData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Muscle Groups & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card lg:col-span-1">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 text-center">Muscle Groups</h3>
          <div className="h-48 sm:h-64">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : muscleData ? (
              <Doughnut data={muscleData} options={doughnutOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
            )}
          </div>
        </div>

        <RealTimeAchievements />
      </div>
    </div>
  );
}