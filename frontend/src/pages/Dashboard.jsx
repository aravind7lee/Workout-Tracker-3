// Real-Time MongoDB Dashboard - INSTANT PLAN UPDATES
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';


import { useRealTimeDashboard } from '../hooks/useRealTimeDashboard';
import { useRealTimeWorkouts } from '../hooks/useRealTimeWorkouts';
import DashboardHero from '../components/DashboardHero';
import AuthGuard from '../components/AuthGuard';
import DashboardErrorBoundary from '../components/DashboardErrorBoundary';

import api from '../utils/api';
import Dashboard1 from '../assets/Dashboard1.jpg';
import Dashboard2 from '../assets/Dashboard2.jpg';
import Dashboardnew from '../assets/Dashboardnew.jpg';
import DashboardImageCard from '../components/DashboardImageCard';

const Dashboard = () => {
  const { user: authUser, logout, isAuthenticated, loading: authLoading } = useAuth();
  const { stats, isOnline, loading: statsLoading, refreshStats } = useRealTime();
  const { stats: workoutStats, refreshStats: refreshWorkoutStats } = useRealTimeWorkouts();

  

  // Achievement system removed
  
  // REAL-TIME DASHBOARD HOOK - INSTANT PLAN UPDATES
  const {
    dashboardStats,
    planStats,
    recentPlans,
    syncStatus: planSyncStatus,
    refreshDashboard,
    forceSync,
    isOnline: plansOnline,
    isRealTime,
    lastSync: planLastSync
  } = useRealTimeDashboard();
  
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [showAllWorkouts, setShowAllWorkouts] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);

  const navigate = useNavigate();

  const checkOnlineStatus = async () => {
    try {
      const response = await api.get('/health');
      const online = response.status === 200;
      console.log('🔗 Backend status:', online ? 'ONLINE' : 'OFFLINE');
      return online;
    } catch (error) {
      console.warn('⚠️ Backend check failed:', error.message);
      return false;
    }
  };

  const loadDashboardData = async () => {
    try {
      if (!authLoading && !isAuthenticated()) {
        setLoading(false);
        return;
      }
      
      console.log('🚀 Loading REAL-TIME dashboard data...');
      
      // Get workouts from real-time sync service first
      const localWorkouts = window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      setRecentWorkouts(localWorkouts);
      console.log('✅ Real-time workouts loaded:', localWorkouts.length);
      
      // Try to load from MongoDB backend as well
      try {
        const response = await api.get('/workouts');
        if (response?.data) {
          const mongoWorkouts = Array.isArray(response.data.workouts) ? response.data.workouts : 
                               Array.isArray(response.data) ? response.data : [];
          
          const realCompletedWorkouts = mongoWorkouts.filter(workout => 
            workout.completed === true || workout.completedAt
          );
          
          // Combine and deduplicate
          const allWorkouts = [...localWorkouts, ...realCompletedWorkouts];
          const uniqueWorkouts = allWorkouts.filter((workout, index, self) => 
            index === self.findIndex(w => w.id === workout.id || 
              (w.exercise === workout.exercise && w.completedAt === workout.completedAt))
          );
          
          setRecentWorkouts(uniqueWorkouts); // Show all workouts
          console.log('✅ Combined workouts loaded:', uniqueWorkouts.length);
        }
      } catch (apiError) {
        console.warn('⚠️ MongoDB load failed, using local data:', apiError.message);
      }
      
    } catch (error) {
      console.error('❌ Dashboard load error:', error.message);
      // Fallback to real-time sync data
      const fallbackWorkouts = window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      setRecentWorkouts(fallbackWorkouts);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      setLoading(false);
      return;
    }
    
    if (authLoading) {
      return;
    }
    
    loadDashboardData();
    
    // Listen for real-time events
    const handleWorkoutCompleted = (event) => {
      console.log('🏋️ Dashboard: Workout completed - refreshing data');
      
      // Get fresh workouts from real-time sync
      const freshWorkouts = window.realTimeWorkoutSync?.getWorkoutHistory(30) || [];
      setRecentWorkouts(freshWorkouts);
      
      // Show completion message if event has details
      if (event.detail) {
        const { workout, exercise, duration, sets, offline } = event.detail;
        setCompletionData({ exercise, duration, sets, offline });
        setShowCompletionMessage(true);
        setTimeout(() => setShowCompletionMessage(false), 5000);
      }
      
      // Refresh stats
      refreshStats();
      
      // Full refresh after short delay
      setTimeout(() => loadDashboardData(), 1000);
    };
    

    
    const handlePlanCreated = () => {
      console.log('📋 Plan created - refreshing dashboard');
      loadDashboardData();
    };
    
    const handleMealAdded = () => {
      console.log('🍽️ Meal added - refreshing stats');
      refreshStats();
    };
    
    const handleMealDeleted = () => {
      console.log('🗑️ Meal deleted - refreshing stats');
      refreshStats();
    };
    
    window.addEventListener('workoutCompleted', handleWorkoutCompleted);

    window.addEventListener('planCreated', handlePlanCreated);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('mealDeleted', handleMealDeleted);
    
    // NO AUTOMATIC REFRESH - MANUAL ONLY
    // const refreshInterval = setInterval(() => {
    //   if (isAuthenticated()) {
    //     refreshStats();
    //     loadDashboardData();
    //   }
    // }, 600000); // Disabled to prevent API spam
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);

      window.removeEventListener('planCreated', handlePlanCreated);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('mealDeleted', handleMealDeleted);
      // clearInterval(refreshInterval); // Disabled
    };
  }, [isAuthenticated, refreshStats]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered - REAL-TIME SYNC');
    refreshStats();
    loadDashboardData();
    await refreshDashboard();
  };
  
  const handleForceSync = async () => {
    console.log('🚀 Force sync triggered - INSTANT UPDATES');
    const result = await forceSync();
    if (result.success) {
      console.log('✅ Force sync completed successfully');
    } else {
      console.error('❌ Force sync failed:', result.error);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardErrorBoundary>
      <AuthGuard>
        <div>
        {/* Dashboard Hero Section - Full Viewport */}
        <DashboardHero />

        {/* Premium Gym Branded Section - Dashboardnew.jpg - Full Responsive Image */}
        <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src={Dashboardnew}
                alt="Professional Gym Training - Real-time fitness tracking"
                className="w-full h-auto object-cover"
                style={{
                  maxHeight: '80vh',
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                loading="eager"
              />
            </motion.div>
          </div>
        </div>
      
      {/* Dashboard Content */}
      <div className="space-y-3 sm:space-y-4 md:space-y-6 px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-6 lg:py-8">
      
      {/* Notification removed as requested */}
      
      {/* Header */}
      <div className="card p-3 sm:p-4 md:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Welcome Section */}
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
              Welcome back{authUser?.name ? `, ${authUser.name}` : ''}! 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm md:text-base leading-relaxed">
              Track your progress, manage workouts, and achieve your fitness goals efficiently.
            </p>
          </div>
          
          {/* Status Section */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs">
              <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                plansOnline ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
              }`}>
                {plansOnline ? '🚀' : '❌'}
                <span className="hidden sm:inline">{plansOnline ? 'REAL-TIME MongoDB + INSTANT Plan Updates' : 'MongoDB connection failed'}</span>
                <span className="sm:hidden">{plansOnline ? 'LIVE' : 'OFFLINE'}</span>
              </span>
              {planLastSync && (
                <span className="text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                  Plans sync: {new Date(planLastSync).toLocaleTimeString()}
                </span>
              )}
              {planSyncStatus !== 'idle' && (
                <span className={`px-2 py-1 rounded-full ${
                  planSyncStatus === 'syncing' ? 'bg-blue-900/30 text-blue-400' :
                  planSyncStatus === 'synced' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                  {planSyncStatus === 'syncing' ? '🔄 Syncing...' : 
                      planSyncStatus === 'synced' ? '✅ Synced' : '❌ Sync Error'}
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleRefresh}
              className="btn bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 py-2 flex-1 sm:flex-none"
            >
              🔄 <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleForceSync}
              disabled={planSyncStatus === 'syncing'}
              className="btn bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm px-3 py-2 flex-1 sm:flex-none disabled:opacity-50"
            >
              {planSyncStatus === 'syncing' ? '🔄' : '⚡'} <span className="hidden sm:inline">{planSyncStatus === 'syncing' ? 'Syncing...' : 'Force Sync'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm px-3 py-2 flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Logout</span><span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Gym-Style Feature Hero */}
      <div className="relative mb-4 sm:mb-6 md:mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-2xl sm:rounded-3xl border border-orange-500/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">🔥</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white uppercase tracking-wider">BEAST MODE</h3>
                  <p className="text-orange-400 text-xs sm:text-sm font-semibold">ACTIVATED</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
                Transform your physique with precision tracking, real-time analytics, and the mindset of champions.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => navigate('/my-plans')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 text-sm sm:text-base"
                >
                  🏋️ <span className="hidden sm:inline">START TRAINING</span><span className="sm:hidden">TRAIN</span>
                </button>
                <button 
                  onClick={() => navigate('/analytics')}
                  className="bg-slate-700/50 border border-slate-600 text-slate-300 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold hover:bg-slate-600/50 transition-all duration-300 text-sm sm:text-base"
                >
                  📊 <span className="hidden sm:inline">VIEW STATS</span><span className="sm:hidden">STATS</span>
                </button>
              </div>
            </div>
            <motion.div 
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl blur-lg"></div>
              <img 
                src={Dashboard1} 
                alt="Gym Training" 
                className="relative w-full h-48 sm:h-64 md:h-72 lg:h-96 object-contain rounded-2xl border border-orange-500/30 bg-slate-800/50"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Second Enhanced Gym Feature Section */}
      <div className="relative mb-4 sm:mb-6 md:mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-2xl sm:rounded-3xl border border-blue-500/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <motion.div 
              className="relative order-2 lg:order-1"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg"></div>
              <img 
                src={Dashboard2} 
                alt="Elite Performance" 
                className="relative w-full h-48 sm:h-64 md:h-72 lg:h-96 object-contain rounded-2xl border border-blue-500/30 bg-slate-800/50"
              />
            </motion.div>
            <motion.div 
              className="space-y-6 order-1 lg:order-2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl sm:text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white uppercase tracking-wider">ELITE PERFORMANCE</h3>
                  <p className="text-blue-400 text-xs sm:text-sm font-semibold">UNLEASHED</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg leading-relaxed">
                Elevate your training with advanced analytics, personalized insights, and the power to break every limit.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => navigate('/analytics')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
                >
                  📊 <span className="hidden sm:inline">VIEW ANALYTICS</span><span className="sm:hidden">ANALYTICS</span>
                </button>
                <button 
                  onClick={() => navigate('/library')}
                  className="bg-slate-700/50 border border-slate-600 text-slate-300 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold hover:bg-slate-600/50 transition-all duration-300 text-sm sm:text-base"
                >
                  📚 <span className="hidden sm:inline">EXERCISE LIBRARY</span><span className="sm:hidden">LIBRARY</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Gym-Style Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        <button 
          onClick={() => navigate('/workouts')}
          className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-lg sm:text-xl md:text-2xl">💪</span>
              </div>
              <div className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                {workoutStats?.lastUpdate ? 'LIVE' : isOnline && stats.isRealTime ? 'LIVE' : 'OFF'}
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white mb-1 sm:mb-2">{workoutStats?.totalWorkouts || stats?.totalWorkouts || 0}</div>
            <div className="text-slate-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-1 sm:mb-2">TOTAL WORKOUTS</div>
            <div className="text-xs text-blue-400 font-medium">
              <span className="hidden sm:inline">{(workoutStats?.totalWorkouts || stats?.totalWorkouts || 0) > 0 ? `${workoutStats?.totalWorkouts || stats?.totalWorkouts} sessions crushed!` : 'Ready to dominate?'}</span>
              <span className="sm:hidden">{(workoutStats?.totalWorkouts || stats?.totalWorkouts || 0) > 0 ? `${workoutStats?.totalWorkouts || stats?.totalWorkouts} done!` : 'Start now!'}</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </button>
        

        
        <button 
          onClick={() => navigate('/analytics')}
          className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20 text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                {isOnline && stats.isRealTime ? 'LIVE' : 'OFFLINE'}
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-2">{workoutStats?.weeklyWorkouts || stats?.weeklyWorkouts || 0}</div>
            <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">THIS WEEK</div>
            <div className="text-xs text-green-400 font-medium">
              {(workoutStats?.weeklyWorkouts || stats?.weeklyWorkouts || 0) > 0 ? `${workoutStats?.weeklyWorkouts || stats?.weeklyWorkouts} sessions this week!` : 'Time to get started!'}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </button>
        

        
        <button 
          onClick={() => navigate('/my-plans')}
          className="group relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-orange-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div className="flex items-center gap-2">
                {planSyncStatus === 'syncing' && (
                  <div className="animate-spin w-3 h-3 border border-orange-500 border-t-transparent rounded-full"></div>
                )}
                <div className="text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">
                  {plansOnline && isRealTime ? 'SYNC' : 'OFFLINE'}
                </div>
              </div>
            </div>
            <div className="text-3xl font-black text-white mb-2">{dashboardStats.totalPlans}</div>
            <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">WORKOUT PLANS</div>
            <div className="text-xs text-orange-400 font-medium">
              {dashboardStats.totalPlans > 0 ? `${dashboardStats.totalPlans} plans locked & loaded!` : 'Build your arsenal!'}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </button>
      </div>

      {/* Enhanced Quick Actions - Gym Style */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-cyan-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-2xl sm:rounded-3xl border border-purple-500/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-1 sm:mb-2">QUICK ACTIONS</h2>
              <p className="text-slate-400 text-xs sm:text-sm">Your fitness arsenal at your fingertips</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/20 px-2 sm:px-3 py-1 sm:py-2 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="hidden sm:inline">REAL-TIME DATA</span>
              <span className="sm:hidden">LIVE</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/library')}
              className="group relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-blue-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <span className="text-lg sm:text-2xl">📚</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide mb-1 sm:mb-2">EXERCISE LIBRARY</div>
                <div className="text-xs text-blue-400 font-medium">Browse arsenal</div>
                <div className="absolute top-2 right-2 text-xs text-blue-400">
                  {isOnline && stats.isRealTime ? '🔴' : '❌'}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
            
            <button 
              onClick={() => navigate('/my-plans')}
              className="group relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-green-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <span className="text-lg sm:text-2xl">📋</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide mb-1 flex items-center justify-center gap-1 sm:gap-2">
                  <span className="hidden sm:inline">MY PLANS ({dashboardStats.totalPlans})</span>
                  <span className="sm:hidden">PLANS ({dashboardStats.totalPlans})</span>
                  {planSyncStatus === 'syncing' && (
                    <div className="animate-spin w-2 h-2 sm:w-3 sm:h-3 border border-green-300 border-t-transparent rounded-full"></div>
                  )}
                </div>
                <div className="text-xs text-green-400 font-medium">
                  {dashboardStats.totalPlans > 0 ? `${dashboardStats.totalPlans} ready` : 'Build arsenal'}
                </div>
                <div className="absolute top-2 right-2 text-xs text-green-400">
                  {plansOnline && isRealTime ? '🚀' : '❌'}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
            
            <button 
              onClick={() => navigate('/nutrition')}
              className="group relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-orange-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <span className="text-lg sm:text-2xl">🍎</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide mb-1 sm:mb-2">MEAL PLANNER</div>
                <div className="text-xs text-orange-400 font-medium">
                  {stats.totalMeals > 0 ? `${stats.totalMeals} meals` : 'Fuel up'}
                </div>
                <div className="absolute top-2 right-2 text-xs text-orange-400">
                  {isOnline && stats.isRealTime ? '🔴' : '❌'}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
            
            <button 
              onClick={() => navigate('/analytics')}
              className="group relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-purple-500/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <span className="text-lg sm:text-2xl">📊</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm uppercase tracking-wide mb-1 sm:mb-2">ANALYTICS</div>
                <div className="text-xs text-purple-400 font-medium">Track progress</div>
                <div className="absolute top-2 right-2 text-xs text-purple-400">
                  {isOnline && stats.isRealTime ? '🔴' : '❌'}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Workout Plans Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-2xl sm:rounded-3xl border border-green-500/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-1 sm:mb-2">MY WORKOUT PLANS</h2>
              <p className="text-slate-400 text-xs sm:text-sm">Your personalized training arsenal</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {recentPlans && recentPlans.length > 3 && (
                <button
                  onClick={() => setShowAllPlans(!showAllPlans)}
                  className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-orange-500/30 transition-all duration-300"
                >
                  <span className="hidden sm:inline">{showAllPlans ? 'Show Less' : `Show More (${recentPlans.length})`}</span>
                  <span className="sm:hidden">{showAllPlans ? 'Less' : `More (${recentPlans.length})`}</span>
                </button>
              )}
              <button
                onClick={() => navigate('/plans')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
              >
                ⚡ <span className="hidden sm:inline">CREATE PLAN</span><span className="sm:hidden">CREATE</span>
              </button>
            </div>
          </div>
          {!recentPlans || recentPlans.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl">📋</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 uppercase tracking-wide">
                {dashboardStats.loading ? 'LOADING ARSENAL...' : 'BUILD YOUR ARSENAL'}
              </h3>
              <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto px-4">
                {dashboardStats.loading ? 'Syncing your workout plans...' : 'No workout plans yet. Time to create your first masterpiece!'}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4 sm:mb-6">
                <span className={`w-2 h-2 rounded-full ${plansOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                <span className="hidden sm:inline">{plansOnline ? 'REAL-TIME MONGODB DATA' : 'OFFLINE MODE'}</span>
                <span className="sm:hidden">{plansOnline ? 'LIVE' : 'OFFLINE'}</span>
              </div>
              <button 
                onClick={() => navigate('/plans')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-sm sm:text-base"
              >
                🚀 <span className="hidden sm:inline">CREATE FIRST PLAN</span><span className="sm:hidden">CREATE PLAN</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/20 px-3 py-2 rounded-full">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">{plansOnline ? 'REAL-TIME MONGODB PLANS' : 'LOCAL PLANS'}</span>
                  <span className="sm:hidden">{plansOnline ? 'LIVE PLANS' : 'LOCAL'}</span>
                </div>
                <div className="text-xs text-slate-400 bg-slate-700/50 px-3 py-2 rounded-full">
                  {dashboardStats.totalPlans} TOTAL • {planStats.syncedPlans} <span className="hidden sm:inline">SYNCED</span><span className="sm:hidden">SYNC</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(showAllPlans ? recentPlans : recentPlans.slice(0, 3)).map((plan, index) => (
                  <div key={plan.id || index} className="group relative bg-gradient-to-br from-slate-800/80 to-slate-700/80 border border-slate-600/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-green-500/30 overflow-hidden">
                    {/* Sync Status Badge */}
                    <div className="absolute top-3 right-3">
                      {plan.synced ? (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full shadow-lg" title="Synced to MongoDB"></div>
                      ) : (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg" title="Pending sync"></div>
                      )}
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="mb-3 sm:mb-4 pr-4 sm:pr-6">
                        <h3 className="font-bold text-white text-sm sm:text-base md:text-lg uppercase tracking-wide truncate">{plan.name || 'UNNAMED PLAN'}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                        <span className="text-xs text-slate-400 bg-slate-600/50 px-2 py-1 sm:px-3 sm:py-1 rounded-full uppercase tracking-wide">
                          {plan.category || 'GENERAL'}
                        </span>
                        <span className="text-xs text-green-400 font-semibold">
                          {plan.exercises?.length || 0} <span className="hidden sm:inline">EXERCISES</span><span className="sm:hidden">EX</span>
                        </span>
                        {plan.isTemp && <span className="text-xs text-yellow-400 font-semibold">• <span className="hidden sm:inline">CREATING...</span><span className="sm:hidden">NEW</span></span>}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button 
                          onClick={() => {
                            const workoutId = plan.id || plan.tempId || `temp_${Date.now()}`;
                            console.log('🚀 Starting workout for plan:', plan.name, 'ID:', workoutId);
                            navigate(`/workout/${workoutId}`);
                          }}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex-1 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                          title={`Start workout: ${plan.name}`}
                        >
                          🏋️ <span className="hidden sm:inline">START</span><span className="sm:hidden">GO</span>
                        </button>
                        <button 
                          onClick={() => navigate('/my-plans')}
                          className="bg-slate-600/50 border border-slate-500/30 text-slate-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold uppercase tracking-wide flex-1 hover:bg-slate-500/50 transition-all duration-300"
                        >
                          📋 <span className="hidden sm:inline">VIEW</span><span className="sm:hidden">SEE</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>



      {/* Enhanced Recent Workouts Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-yellow-500/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-2xl sm:rounded-3xl border border-red-500/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-1 sm:mb-2">RECENT WORKOUTS</h2>
              <p className="text-slate-400 text-xs sm:text-sm">Your training history and achievements</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {recentWorkouts.length > 5 && (
                <button
                  onClick={() => setShowAllWorkouts(!showAllWorkouts)}
                  className="bg-blue-500/20 border border-blue-500/30 text-blue-400 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-500/30 transition-all duration-300"
                >
                  <span className="hidden sm:inline">{showAllWorkouts ? 'Show Less' : `Show More (${recentWorkouts.length})`}</span>
                  <span className="sm:hidden">{showAllWorkouts ? 'Less' : `More (${recentWorkouts.length})`}</span>
                </button>
              )}
              <button
                onClick={() => navigate('/my-plans')}
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25"
              >
                🔥 <span className="hidden sm:inline">START WORKOUT</span><span className="sm:hidden">START</span>
              </button>
            </div>
          </div>
          {!recentWorkouts || recentWorkouts.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl">🏋️</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 uppercase tracking-wide">
                TIME TO DOMINATE
              </h3>
              <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto px-4">
                {isOnline ? `No completed workouts found for ${authUser?.name || 'your account'}. Ready to make history?` : 'No completed workouts found in local storage. Time to get started!'}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-4 sm:mb-6">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                <span className="hidden sm:inline">{isOnline ? `REAL-TIME DATA FOR ${authUser?.name?.toUpperCase() || 'USER'}` : 'OFFLINE DATA FROM DEVICE'}</span>
                <span className="sm:hidden">{isOnline ? 'LIVE DATA' : 'OFFLINE'}</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <button 
                  onClick={() => navigate('/my-plans')}
                  className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25 text-sm sm:text-base"
                >
                  📋 <span className="hidden sm:inline">VIEW PLANS</span><span className="sm:hidden">PLANS</span>
                </button>
                <button 
                  onClick={() => navigate('/library')}
                  className="bg-slate-700/50 border border-slate-600 text-slate-300 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold uppercase tracking-wide hover:bg-slate-600/50 transition-all duration-300 text-sm sm:text-base"
                >
                  📚 <span className="hidden sm:inline">BROWSE EXERCISES</span><span className="sm:hidden">LIBRARY</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/20 px-3 py-2 rounded-full">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">{isOnline ? `REAL-TIME DATA FOR ${authUser?.name?.toUpperCase() || 'YOU'}` : 'YOUR LOCAL WORKOUTS'}</span>
                  <span className="sm:hidden">{isOnline ? 'LIVE DATA' : 'LOCAL'}</span>
                </div>
                <div className="text-xs text-slate-400 bg-slate-700/50 px-3 py-2 rounded-full">
                  {recentWorkouts.length} WORKOUT{recentWorkouts.length !== 1 ? 'S' : ''} <span className="hidden sm:inline">COMPLETED</span>
                </div>
              </div>
              {(showAllWorkouts ? recentWorkouts : recentWorkouts.slice(0, 5)).map((workout, index) => (
                <div key={workout.id || index} className="group relative bg-gradient-to-r from-slate-800/80 to-slate-700/80 border border-slate-600/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:border-green-500/30 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-green-500 to-emerald-500 rounded-l-xl sm:rounded-l-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm sm:text-lg">✓</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm sm:text-base md:text-lg uppercase tracking-wide truncate">
                          {workout.exercise || workout.planName || workout.exerciseName || 'WORKOUT SESSION'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                          <span className="bg-slate-600/50 px-2 py-1 rounded-full">
                            {workout.exercises?.length || 1} EX{(workout.exercises?.length || 1) !== 1 ? 'S' : ''}
                          </span>
                          <span className="text-green-400 font-semibold">✓ DONE</span>
                          {workout.synced && <span className="text-blue-400 font-semibold hidden sm:inline">☁️ SYNCED</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                        {workout.completedAt ? (
                          new Date(workout.completedAt).toLocaleDateString() === new Date().toLocaleDateString() 
                            ? 'TODAY' 
                            : new Date(workout.completedAt).toLocaleDateString().toUpperCase()
                        ) : 'TODAY'}
                      </div>
                      <button
                        onClick={() => {
                          const workoutId = workout.planId || workout.id;
                          if (workoutId) {
                            console.log('🔄 Repeating workout:', workout.exercise || workout.planName, 'ID:', workoutId);
                            navigate(`/workout/${workoutId}`);
                          } else {
                            console.warn('⚠️ Workout ID missing, redirecting to plans');
                            navigate('/my-plans');
                          }
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/25"
                        title={`Repeat workout: ${workout.exercise || workout.planName || 'Workout Session'}`}
                      >
                        🔄 <span className="hidden sm:inline">REPEAT</span>
                      </button>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
      </AuthGuard>
    </DashboardErrorBoundary>
  );
};

export default Dashboard;