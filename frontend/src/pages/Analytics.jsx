// frontend/src/pages/Analytics.jsx - Real-time MongoDB Backend Integration
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthGuard from '../components/AuthGuard';
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

// LQIP placeholder for Analytics hero
const ANALYTICS_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

// Production-grade Analytics Hero Component
function AnalyticsHero() {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [particlesEnabled, setParticlesEnabled] = useState(false);

  useEffect(() => {
    // Preload image immediately
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      // Small delay for smooth transition
      setTimeout(() => setImageError(false), 50);
      // Defer particles until after image animation
      setTimeout(() => setParticlesEnabled(true), 800);
    };
    img.onerror = () => {
      setImageError(true);
      setImageLoaded(true); // Show content even if image fails
    };
    img.src = progressAnalyticsImg;
    
    // Start loading immediately
    img.loading = 'eager';
  }, []);

  // Enhanced theme-aware styling

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delay: 0.1,
        staggerChildren: 0.06,
        delayChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <div className="analytics-hero relative h-screen w-full overflow-hidden mb-6">
      {/* LQIP Skeleton with shimmer */}
      <div 
        className={`analytics-hero-skeleton absolute inset-0 transition-opacity duration-300 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <img
          src={ANALYTICS_LQIP}
          alt=""
          className="w-full h-full object-cover blur-sm scale-110"
          aria-hidden="true"
        />
      </div>
      
      {/* Main Hero Image with responsive optimization */}
      <motion.div
        className="analytics-hero-image-container absolute inset-0"
        initial={{ opacity: 0, scale: 0.995 }}
        animate={{ 
          opacity: imageLoaded ? 1 : 0, 
          scale: imageLoaded ? 1 : 0.995 
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <picture className="w-full h-full">
          <source 
            media="(max-width: 767px)" 
            srcSet={progressAnalyticsImg}
            className="mobile-hero-source"
          />
          <source 
            media="(min-width: 768px)" 
            srcSet={progressAnalyticsImg}
            className="desktop-hero-source"
          />
          <img
            src={progressAnalyticsImg}
            alt="Progress & Analytics – athlete training background"
            className="analytics-hero-image w-full h-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            width="1440"
            height="480"
          />
        </picture>
      </motion.div>
      
      {/* Premium Theme-aware Overlay */}
      <div className={`absolute inset-0 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-black/40 via-black/60 to-black/80' 
          : 'bg-gradient-to-b from-black/20 via-black/40 to-black/60'
      }`} />
      
      {/* Subtle Particle Background */}
      {particlesEnabled && (
        <div className="analytics-hero-particles absolute inset-0 pointer-events-none" aria-hidden="true">
          {Array.from({ length: 6 }, (_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${
                theme === 'dark' ? 'bg-blue-400/20' : 'bg-white/30'
              }`}
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
              }}
              animate={{
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>
      )}
      
      {/* Premium Content Overlay - Only show after image loads */}
      {imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center max-w-4xl w-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
          <motion.h1 
            className={`font-bold mb-4 drop-shadow-2xl ${
              theme === 'dark' ? 'text-white' : 'text-white'
            } text-3xl sm:text-4xl md:text-5xl lg:text-6xl`}
            variants={itemVariants}
            style={{
              textShadow: theme === 'dark' 
                ? '0 4px 8px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'
                : '0 4px 12px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.7)'
            }}
          >
            Progress & Analytics
          </motion.h1>
          
          <motion.p 
            className={`mb-8 max-w-2xl mx-auto drop-shadow-lg ${
              theme === 'dark' ? 'text-gray-100' : 'text-white'
            } text-sm sm:text-base md:text-lg lg:text-xl`}
            variants={subtitleVariants}
            style={{
              textShadow: theme === 'dark'
                ? '0 2px 4px rgba(0,0,0,0.7)'
                : '0 2px 6px rgba(0,0,0,0.8)'
            }}
          >
            Visualize your performance, track your gains, and analyze your workouts efficiently.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={subtitleVariants}
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const analyticsSection = document.getElementById('analytics-charts');
                if (analyticsSection) {
                  analyticsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-8 py-4 rounded-xl font-semibold text-white shadow-2xl transition-all duration-300 ${
                theme === 'dark'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  : 'bg-gradient-to-r from-blue-700 to-purple-700 hover:from-blue-800 hover:to-purple-800'
              }`}
              style={{
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
              }}
            >
              View Analytics
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const statsSection = document.getElementById('real-time-stats');
                if (statsSection) {
                  statsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className={`px-8 py-4 rounded-xl font-semibold transition-all duration-300 backdrop-blur-sm ${
                theme === 'dark'
                  ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
              }`}
            >
              Track Progress
            </motion.button>
          </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const { isAuthenticated } = useAuth();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Start with false for instant display
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  
  const loadAnalyticsData = useCallback(async () => {
    try {
      // Load offline data INSTANTLY first - no loading state
      loadOfflineData();
      setIsLoading(false); // Show data immediately
      setIsOnline(false);
      
      // Try backend in background without blocking UI
      if (isAuthenticated && isAuthenticated() && onlineService) {
        try {
          const online = await Promise.race([
            onlineService.checkBackendStatus(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
          ]);
          
          if (online) {
            setIsOnline(true);
            // Backend calls with faster timeout
            const analyticsPromise = Promise.race([
              onlineService.getAnalytics(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]).catch(() => null);
            
            const workoutsPromise = Promise.race([
              onlineService.getWorkoutHistory(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]).catch(() => []);
            
            const plansPromise = Promise.race([
              onlineService.getWorkoutPlans(),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]).catch(() => []);
            
            const [analytics, workouts, plans] = await Promise.all([
              analyticsPromise, workoutsPromise, plansPromise
            ]);
            
            if (analytics) {
              // Update with backend data seamlessly
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
      loadOfflineData();
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  const loadOfflineData = () => {
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      
      // Calculate real streak from workout dates
      const calculateStreak = (workouts) => {
        if (!workouts.length) return 0;
        const today = new Date();
        let streak = 0;
        for (let i = 0; i < 30; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() - i);
          const hasWorkout = workouts.some(w => {
            const workoutDate = new Date(w.completedAt || w.createdAt);
            return workoutDate.toDateString() === checkDate.toDateString();
          });
          if (hasWorkout) streak++;
          else break;
        }
        return streak;
      };
      
      setRealTimeStats({
        totalWorkouts: workouts.length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: calculateStreak(workouts),
        xpPoints: workouts.length * 100 + plans.length * 50
      });
      
      // Generate real chart data from actual workouts
      const generateRealChartData = () => {
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
        
        return {
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
      };
      
      const chartData = generateRealChartData();
      
      setAnalyticsData({
        stats: null,
        caloriesTrend: chartData.caloriesData,
        workoutFrequency: chartData.workoutData,
        muscleDistribution: null,
        achievements: []
      });
    } catch (error) {
      console.error('Error loading offline data:', error);
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
    
    // Real-time event listeners for instant updates
    const handleWorkoutComplete = () => {
      console.log('🏋️ Workout completed - updating analytics');
      loadAnalyticsData();
    };
    
    const handleMealAdded = () => {
      console.log('🍽️ Meal added - updating analytics');
      loadAnalyticsData();
    };
    
    const handlePlanCreated = () => {
      console.log('📋 Plan created - updating analytics');
      loadAnalyticsData();
    };
    
    // Listen for custom events
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    
    // Set up real-time refresh every 60 seconds for live data (optimized)
    const interval = setInterval(() => {
      if (isAuthenticated && isAuthenticated()) {
        loadAnalyticsData();
      }
    }, 60000);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
      clearInterval(interval);
    };
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
    <AuthGuard>
      <div className="space-y-4 sm:space-y-6">
        {/* Hero Header */}
        <AnalyticsHero />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              isOnline ? 'bg-green-400' : 'bg-yellow-400'
            }`}></span>
            Real-time MongoDB Analytics
            <span className={`text-xs px-2 py-1 rounded-full ${
              isOnline 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            }`}>
              {isOnline ? '🔥 LIVE' : '📱 LOCAL'}
            </span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
              ⚡ Real-Time
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
      
      {/* Real-Time Stats Overview */}
      <div id="real-time-stats">
        <RealTimeStats />
      </div>

      {/* Charts Grid */}
      <div id="analytics-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
    </AuthGuard>
  );
}