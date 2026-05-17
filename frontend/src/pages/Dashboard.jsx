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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-neutral-400">Loading dashboard...</p>
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
        <div className="bg-gradient-to-b from-black via-neutral-900 to-black py-8 sm:py-12 md:py-16 lg:py-20">
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
      <div className="space-y-2.5 sm:space-y-3 md:space-y-4 lg:space-y-6 px-2 sm:px-3 md:px-4 lg:px-6 py-2.5 sm:py-3 md:py-4 lg:py-6">
      
      {/* Notification removed as requested */}
      
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-red-700/5 to-red-600/5 blur-2xl"></div>
        <div className="relative card p-2.5 sm:p-3 md:p-4 lg:p-6 backdrop-blur-sm border border-neutral-800/50">
          <div className="flex flex-col gap-2 sm:gap-2.5 md:gap-3">
            {/* Welcome Section */}
            <div>
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black text-white mb-1 sm:mb-1.5 md:mb-2 uppercase tracking-wide">
                Welcome{authUser?.name ? `, ${authUser.name}` : ''}! 👋
              </h1>
              <p className="text-neutral-400 text-[10px] sm:text-xs md:text-sm leading-relaxed">
                Track progress, manage workouts, achieve goals.
              </p>
            </div>
            
            {/* Status Section */}
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 md:gap-2 text-[9px] sm:text-[10px] md:text-xs">
                <span className={`flex items-center gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-bold uppercase tracking-wide ${
                  plansOnline ? 'bg-green-900/30 text-red-500 border border-red-600/30' : 'bg-red-900/30 text-red-400 border border-red-500/30'
                }`}>
                  {plansOnline ? '🚀' : '❌'}
                  <span className="hidden xs:inline sm:hidden md:inline">{plansOnline ? 'LIVE' : 'OFFLINE'}</span>
                  <span className="xs:hidden sm:inline md:hidden">{plansOnline ? 'REAL-TIME' : 'OFFLINE'}</span>
                </span>
                {planLastSync && (
                  <span className="text-neutral-500 bg-neutral-900/50 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border border-neutral-800/50 hidden sm:inline">
                    {new Date(planLastSync).toLocaleTimeString()}
                  </span>
                )}
                {planSyncStatus !== 'idle' && (
                  <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-bold border ${
                    planSyncStatus === 'syncing' ? 'bg-blue-900/30 text-red-500 border-red-600/30' :
                    planSyncStatus === 'synced' ? 'bg-green-900/30 text-red-500 border-red-600/30' : 'bg-red-900/30 text-red-400 border-red-500/30'
                  }`}>
                    {planSyncStatus === 'syncing' ? '🔄' : planSyncStatus === 'synced' ? '✅' : '❌'}
                    <span className="hidden sm:inline ml-1">{planSyncStatus === 'syncing' ? 'SYNC' : planSyncStatus === 'synced' ? 'SYNCED' : 'ERROR'}</span>
                  </span>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              <button
                onClick={handleRefresh}
                className="btn bg-red-700 hover:bg-blue-700 active:bg-blue-800 text-white text-[10px] sm:text-xs md:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex-1 sm:flex-none min-w-[80px] font-bold uppercase tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                🔄 <span className="hidden xs:inline">Refresh</span>
              </button>
              <button
                onClick={handleForceSync}
                disabled={planSyncStatus === 'syncing'}
                className="btn bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-[10px] sm:text-xs md:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex-1 sm:flex-none min-w-[80px] disabled:opacity-50 font-bold uppercase tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                {planSyncStatus === 'syncing' ? '🔄' : '⚡'} <span className="hidden xs:inline">{planSyncStatus === 'syncing' ? 'Sync...' : 'Sync'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="btn bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[10px] sm:text-xs md:text-sm px-2 py-1.5 sm:px-3 sm:py-2 flex-1 sm:flex-none min-w-[80px] font-bold uppercase tracking-wide transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <span className="hidden xs:inline">Logout</span><span className="xs:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Gym-Style Feature Hero */}
      <div className="relative mb-2.5 sm:mb-3 md:mb-4 lg:mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-red-500/10 to-yellow-500/10 rounded-xl sm:rounded-2xl md:rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-black/95 via-neutral-900/95 to-black/95 rounded-xl sm:rounded-2xl md:rounded-3xl border border-orange-500/20 overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Text Content */}
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-2.5 sm:space-y-3 md:space-y-4 lg:space-y-6 order-last lg:order-first">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <span className="text-base sm:text-xl md:text-2xl">🔥</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-white uppercase tracking-wider leading-none">BEAST MODE</h3>
                  <p className="text-orange-400 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-wide">ACTIVATED</p>
                </div>
              </div>
              <p className="text-neutral-300 text-[10px] sm:text-xs md:text-sm lg:text-base leading-relaxed">
                Transform your physique with precision tracking, real-time analytics, and the mindset of champions.
              </p>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
                <button 
                  onClick={() => navigate('/my-plans')}
                  className="relative group overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-wide hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-orange-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative">🏋️ <span className="hidden xs:inline">TRAIN</span><span className="xs:hidden">GO</span></span>
                </button>
                <button 
                  onClick={() => navigate('/analytics')}
                  className="bg-neutral-800/50 border border-neutral-700 text-neutral-300 px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-wide hover:bg-neutral-700/50 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  📊 <span className="hidden xs:inline">STATS</span><span className="xs:hidden">VIEW</span>
                </button>
              </div>
            </div>
            
            {/* Full-Width Image */}
            <motion.div 
              className="relative order-first lg:order-last h-64 sm:h-80 md:h-96 lg:h-full lg:min-h-[400px]"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 blur-2xl"></div>
              <img 
                src={Dashboard1} 
                alt="Gym Training" 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent lg:bg-gradient-to-r lg:from-black/90 lg:via-black/30 lg:to-transparent"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Second Enhanced Gym Feature Section */}
      <div className="relative mb-2.5 sm:mb-3 md:mb-4 lg:mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-red-700/10 to-red-600/10 rounded-xl sm:rounded-2xl md:rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-black/95 via-neutral-900/95 to-black/95 rounded-xl sm:rounded-2xl md:rounded-3xl border border-red-600/20 overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Full-Width Image */}
            <motion.div 
              className="relative order-first h-64 sm:h-80 md:h-96 lg:h-full lg:min-h-[400px]"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-red-700/20 blur-2xl"></div>
              <img 
                src={Dashboard2} 
                alt="Elite Performance" 
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent lg:bg-gradient-to-l lg:from-black/90 lg:via-black/30 lg:to-transparent"></div>
            </motion.div>
            
            {/* Text Content */}
            <motion.div 
              className="p-3 sm:p-4 md:p-6 lg:p-8 space-y-2.5 sm:space-y-3 md:space-y-4 lg:space-y-6 order-last"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
                  <span className="text-base sm:text-xl md:text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-white uppercase tracking-wider leading-none">ELITE PERFORMANCE</h3>
                  <p className="text-red-500 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-wide">UNLEASHED</p>
                </div>
              </div>
              <p className="text-neutral-300 text-[10px] sm:text-xs md:text-sm lg:text-base leading-relaxed">
                Elevate your training with advanced analytics, personalized insights, and the power to break every limit.
              </p>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
                <button 
                  onClick={() => navigate('/analytics')}
                  className="relative group overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-wide hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-red-600/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative">📊 <span className="hidden xs:inline">ANALYTICS</span><span className="xs:hidden">VIEW</span></span>
                </button>
                <button 
                  onClick={() => navigate('/library')}
                  className="bg-neutral-800/50 border border-neutral-700 text-neutral-300 px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 rounded-lg sm:rounded-xl font-bold text-[10px] sm:text-xs md:text-sm lg:text-base uppercase tracking-wide hover:bg-neutral-700/50 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  📚 <span className="hidden xs:inline">LIBRARY</span><span className="xs:hidden">BROWSE</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced Gym-Style Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
        <button 
          onClick={() => navigate('/workouts')}
          className="group relative bg-gradient-to-br from-black/90 to-neutral-900/90 border border-red-600/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/20 text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-red-600 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl">💪</span>
              </div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-red-500 bg-red-600/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-bold uppercase tracking-wide border border-red-600/30">
                {workoutStats?.lastUpdate ? 'LIVE' : isOnline && stats.isRealTime ? 'LIVE' : 'OFF'}
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 leading-none">{workoutStats?.totalWorkouts || stats?.totalWorkouts || 0}</div>
            <div className="text-neutral-400 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-widest mb-1 sm:mb-2">TOTAL WORKOUTS</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-red-500 font-bold">
              {(workoutStats?.totalWorkouts || stats?.totalWorkouts || 0) > 0 ? `${workoutStats?.totalWorkouts || stats?.totalWorkouts} done!` : 'Start now!'}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </button>
        

        
        <button 
          onClick={() => navigate('/analytics')}
          className="group relative bg-gradient-to-br from-black/90 to-neutral-900/90 border border-red-600/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-2xl hover:shadow-red-600/20 text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-red-600 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30">
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl">📊</span>
              </div>
              <div className="text-[9px] sm:text-[10px] md:text-xs text-red-500 bg-red-600/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-bold uppercase tracking-wide border border-red-600/30">
                {isOnline && stats.isRealTime ? 'LIVE' : 'OFF'}
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 leading-none">{workoutStats?.weeklyWorkouts || stats?.weeklyWorkouts || 0}</div>
            <div className="text-neutral-400 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-widest mb-1 sm:mb-2">THIS WEEK</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-red-500 font-bold">
              {(workoutStats?.weeklyWorkouts || stats?.weeklyWorkouts || 0) > 0 ? `${workoutStats?.weeklyWorkouts || stats?.weeklyWorkouts} this week!` : 'Get started!'}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </button>
        
        <button 
          onClick={() => navigate('/my-plans')}
          className="group relative bg-gradient-to-br from-black/90 to-neutral-900/90 border border-orange-500/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 text-left overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-base sm:text-lg md:text-xl lg:text-2xl">📋</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {planSyncStatus === 'syncing' && (
                  <div className="animate-spin w-2 h-2 sm:w-3 sm:h-3 border border-orange-500 border-t-transparent rounded-full"></div>
                )}
                <div className="text-[9px] sm:text-[10px] md:text-xs text-orange-400 bg-orange-500/20 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full font-bold uppercase tracking-wide border border-orange-500/30">
                  {plansOnline && isRealTime ? 'SYNC' : 'OFF'}
                </div>
              </div>
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 leading-none">{dashboardStats.totalPlans}</div>
            <div className="text-neutral-400 text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-black uppercase tracking-widest mb-1 sm:mb-2">WORKOUT PLANS</div>
            <div className="text-[9px] sm:text-[10px] md:text-xs text-orange-400 font-bold">
              {dashboardStats.totalPlans > 0 ? `${dashboardStats.totalPlans} ready!` : 'Build now!'}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </button>
      </div>

      {/* Enhanced Quick Actions - Gym Style */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-700/5 via-red-600/5 to-red-600/5 rounded-xl sm:rounded-2xl md:rounded-3xl blur-2xl"></div>
        <div className="relative bg-gradient-to-br from-black/95 via-neutral-900/95 to-black/95 rounded-xl sm:rounded-2xl md:rounded-3xl border border-red-700/20 p-3 sm:p-4 md:p-6 lg:p-8 backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-6 lg:mb-8">
            <div>
              <h2 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-white uppercase tracking-wider mb-0.5 sm:mb-1 md:mb-2 leading-none">QUICK ACTIONS</h2>
              <p className="text-neutral-400 text-[9px] sm:text-[10px] md:text-xs lg:text-sm">Your fitness arsenal</p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] md:text-xs text-red-500 bg-red-600/20 px-2 py-1 sm:px-2.5 sm:py-1.5 md:px-3 md:py-2 rounded-full border border-red-600/30">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
              <span className="font-bold uppercase tracking-wide">LIVE</span>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 lg:gap-4">
            <button 
              onClick={() => navigate('/library')}
              className="group relative bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-red-600/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-xl hover:shadow-red-600/20 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-600 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg shadow-red-600/30">
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl">📚</span>
                </div>
                <div className="font-black text-white text-[10px] sm:text-xs md:text-sm uppercase tracking-wide mb-1 leading-none">LIBRARY</div>
                <div className="text-[9px] sm:text-[10px] md:text-xs text-red-500 font-bold">Browse</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
            
            <button 
              onClick={() => navigate('/my-plans')}
              className="group relative bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-red-600/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-xl hover:shadow-red-600/20 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-600 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg shadow-red-600/30">
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl">📋</span>
                </div>
                <div className="font-black text-white text-[10px] sm:text-xs md:text-sm uppercase tracking-wide mb-1 flex items-center justify-center gap-1 leading-none">
                  <span>PLANS ({dashboardStats.totalPlans})</span>
                  {planSyncStatus === 'syncing' && (
                    <div className="animate-spin w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 border border-green-300 border-t-transparent rounded-full"></div>
                  )}
                </div>
                <div className="text-[9px] sm:text-[10px] md:text-xs text-red-500 font-bold">
                  {dashboardStats.totalPlans > 0 ? `${dashboardStats.totalPlans} ready` : 'Build'}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
            
            <button 
              onClick={() => navigate('/nutrition')}
              className="group relative bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-orange-500/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/20 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg shadow-orange-500/30">
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl">🍎</span>
                </div>
                <div className="font-black text-white text-[10px] sm:text-xs md:text-sm uppercase tracking-wide mb-1 leading-none">MEALS</div>
                <div className="text-[9px] sm:text-[10px] md:text-xs text-orange-400 font-bold">
                  {stats.totalMeals > 0 ? `${stats.totalMeals}` : 'Fuel'}
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
            
            <button 
              onClick={() => navigate('/analytics')}
              className="group relative bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-red-700/30 rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 hover:scale-105 active:scale-95 transition-all duration-300 hover:shadow-xl hover:shadow-red-700/20 text-center overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-700/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-red-700 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4 shadow-lg shadow-red-700/30">
                  <span className="text-base sm:text-lg md:text-xl lg:text-2xl">📊</span>
                </div>
                <div className="font-black text-white text-[10px] sm:text-xs md:text-sm uppercase tracking-wide mb-1 leading-none">ANALYTICS</div>
                <div className="text-[9px] sm:text-[10px] md:text-xs text-red-600 font-bold">Track</div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Workout Plans Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-red-600/5 to-red-700/5 rounded-2xl sm:rounded-3xl blur-xl"></div>
        <div className="relative bg-gradient-to-br from-black/95 via-neutral-900/95 to-black/95 rounded-2xl sm:rounded-3xl border border-red-600/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-1 sm:mb-2">MY WORKOUT PLANS</h2>
              <p className="text-neutral-400 text-xs sm:text-sm">Your personalized training arsenal</p>
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
                className="bg-gradient-to-r from-red-600 to-red-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-600/25"
              >
                ⚡ <span className="hidden sm:inline">CREATE PLAN</span><span className="sm:hidden">CREATE</span>
              </button>
            </div>
          </div>
          {!recentPlans || recentPlans.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-neutral-800 to-neutral-700 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl">📋</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 uppercase tracking-wide">
                {dashboardStats.loading ? 'LOADING ARSENAL...' : 'BUILD YOUR ARSENAL'}
              </h3>
              <p className="text-neutral-400 mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto px-4">
                {dashboardStats.loading ? 'Syncing your workout plans...' : 'No workout plans yet. Time to create your first masterpiece!'}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-4 sm:mb-6">
                <span className={`w-2 h-2 rounded-full ${plansOnline ? 'bg-red-500 animate-pulse' : 'bg-red-400'}`}></span>
                <span className="hidden sm:inline">{plansOnline ? 'REAL-TIME MONGODB DATA' : 'OFFLINE MODE'}</span>
                <span className="sm:hidden">{plansOnline ? 'LIVE' : 'OFFLINE'}</span>
              </div>
              <button 
                onClick={() => navigate('/plans')}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-600/25 text-sm sm:text-base"
              >
                🚀 <span className="hidden sm:inline">CREATE FIRST PLAN</span><span className="sm:hidden">CREATE PLAN</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs text-red-500 bg-red-600/20 px-3 py-2 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">{plansOnline ? 'REAL-TIME MONGODB PLANS' : 'LOCAL PLANS'}</span>
                  <span className="sm:hidden">{plansOnline ? 'LIVE PLANS' : 'LOCAL'}</span>
                </div>
                <div className="text-xs text-neutral-400 bg-neutral-800/50 px-3 py-2 rounded-full">
                  {dashboardStats.totalPlans} TOTAL • {planStats.syncedPlans} <span className="hidden sm:inline">SYNCED</span><span className="sm:hidden">SYNC</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(showAllPlans ? recentPlans : recentPlans.slice(0, 3)).map((plan, index) => (
                  <div key={plan.id || index} className="group relative bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 border border-neutral-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-red-600/30 overflow-hidden">
                    {/* Sync Status Badge */}
                    <div className="absolute top-3 right-3">
                      {plan.synced ? (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full shadow-lg" title="Synced to MongoDB"></div>
                      ) : (
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg" title="Pending sync"></div>
                      )}
                    </div>
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="relative z-10">
                      <div className="mb-3 sm:mb-4 pr-4 sm:pr-6">
                        <h3 className="font-bold text-white text-sm sm:text-base md:text-lg uppercase tracking-wide truncate">{plan.name || 'UNNAMED PLAN'}</h3>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                        <span className="text-xs text-neutral-400 bg-neutral-700/50 px-2 py-1 sm:px-3 sm:py-1 rounded-full uppercase tracking-wide">
                          {plan.category || 'GENERAL'}
                        </span>
                        <span className="text-xs text-red-500 font-semibold">
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
                          className="bg-gradient-to-r from-red-600 to-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wide flex-1 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-600/25"
                          title={`Start workout: ${plan.name}`}
                        >
                          🏋️ <span className="hidden sm:inline">START</span><span className="sm:hidden">GO</span>
                        </button>
                        <button 
                          onClick={() => navigate('/my-plans')}
                          className="bg-neutral-700/50 border border-neutral-500/30 text-neutral-300 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold uppercase tracking-wide flex-1 hover:bg-neutral-500/50 transition-all duration-300"
                        >
                          📋 <span className="hidden sm:inline">VIEW</span><span className="sm:hidden">SEE</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
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
        <div className="relative bg-gradient-to-br from-black/95 via-neutral-900/95 to-black/95 rounded-2xl sm:rounded-3xl border border-red-500/20 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider mb-1 sm:mb-2">RECENT WORKOUTS</h2>
              <p className="text-neutral-400 text-xs sm:text-sm">Your training history and achievements</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {recentWorkouts.length > 5 && (
                <button
                  onClick={() => setShowAllWorkouts(!showAllWorkouts)}
                  className="bg-red-600/20 border border-red-600/30 text-red-500 px-3 py-2 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-red-600/30 transition-all duration-300"
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
              <p className="text-neutral-400 mb-4 sm:mb-6 text-sm sm:text-base max-w-md mx-auto px-4">
                {isOnline ? `No completed workouts found for ${authUser?.name || 'your account'}. Ready to make history?` : 'No completed workouts found in local storage. Time to get started!'}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 mb-4 sm:mb-6">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-red-500 animate-pulse' : 'bg-red-400'}`}></span>
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
                  className="bg-neutral-800/50 border border-neutral-700 text-neutral-300 px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold uppercase tracking-wide hover:bg-neutral-700/50 transition-all duration-300 text-sm sm:text-base"
                >
                  📚 <span className="hidden sm:inline">BROWSE EXERCISES</span><span className="sm:hidden">LIBRARY</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
                <div className="flex items-center gap-2 text-xs text-red-500 bg-red-600/20 px-3 py-2 rounded-full">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  <span className="hidden sm:inline">{isOnline ? `REAL-TIME DATA FOR ${authUser?.name?.toUpperCase() || 'YOU'}` : 'YOUR LOCAL WORKOUTS'}</span>
                  <span className="sm:hidden">{isOnline ? 'LIVE DATA' : 'LOCAL'}</span>
                </div>
                <div className="text-xs text-neutral-400 bg-neutral-800/50 px-3 py-2 rounded-full">
                  {recentWorkouts.length} WORKOUT{recentWorkouts.length !== 1 ? 'S' : ''} <span className="hidden sm:inline">COMPLETED</span>
                </div>
              </div>
              {(showAllWorkouts ? recentWorkouts : recentWorkouts.slice(0, 5)).map((workout, index) => (
                <div key={workout.id || index} className="group relative bg-gradient-to-r from-neutral-900/80 to-neutral-800/80 border border-neutral-700/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:border-red-600/30 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-600 to-red-600 rounded-l-xl sm:rounded-l-2xl"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-sm sm:text-lg">✓</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-sm sm:text-base md:text-lg uppercase tracking-wide truncate">
                          {workout.exercise || workout.planName || workout.exerciseName || 'WORKOUT SESSION'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-1">
                          <span className="bg-neutral-700/50 px-2 py-1 rounded-full">
                            {workout.exercises?.length || 1} EX{(workout.exercises?.length || 1) !== 1 ? 'S' : ''}
                          </span>
                          <span className="text-red-500 font-semibold">✓ DONE</span>
                          {workout.synced && <span className="text-red-500 font-semibold hidden sm:inline">☁️ SYNCED</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-neutral-400 font-semibold uppercase tracking-wide">
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
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
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