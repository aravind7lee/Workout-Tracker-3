import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { useAchievements } from '../context/AchievementsContext';
import CompletedWorkouts from '../components/CompletedWorkouts';
import RealTimeNotification from '../components/RealTimeNotification';

export default function Workouts() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { stats, isOnline } = useRealTime();
  const { checkAchievements } = useAchievements();
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, loading, navigate]);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle navigation from StartWorkout
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted) {
      const message = workoutState.sets 
        ? `🎉 ${workoutState.exercise} completed! ${workoutState.sets} sets, ${workoutState.duration}, +${workoutState.calories} calories!`
        : `🎉 ${workoutState.exercise} completed!`;
      
      setNotification({
        message,
        type: 'workout'
      });
      
      checkAchievements();
      navigate(location.pathname, { replace: true });
      setTimeout(() => setNotification(null), 6000);
    }
  }, [location.state, navigate, location.pathname, checkAchievements]);

  // Listen for workout completion events and real-time sync
  useEffect(() => {
    const handleWorkoutCompleted = (event) => {
      if (event.detail) {
        const workout = event.detail;
        console.log('🎯 Workouts page: Received workout completion:', workout);
        
        setNotification({
          message: `🎉 ${workout.exercise || workout.name} completed! +${workout.caloriesBurned || 0} calories burned!`,
          type: 'workout'
        });
        setTimeout(() => setNotification(null), 5000);
        
        // Force refresh of CompletedWorkouts component
        window.dispatchEvent(new CustomEvent('refreshCompletedWorkouts'));
      }
    };

    const handleStatsUpdate = (event) => {
      if (event.detail) {
        console.log('📊 Workouts page: Stats updated:', event.detail);
        // The RealTimeContext will handle the stats update
      }
    };
    
    const handleRealTimeSync = (event) => {
      console.log('🔄 Workouts page: Real-time sync received:', event.detail);
      // Stats are automatically updated via RealTimeContext
    };

    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    window.addEventListener('realTimeStatsUpdate', handleStatsUpdate);
    window.addEventListener('realTimeStatsSync', handleRealTimeSync);
    
    return () => {
      window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
      window.removeEventListener('realTimeStatsUpdate', handleStatsUpdate);
      window.removeEventListener('realTimeStatsSync', handleRealTimeSync);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-blue-900/20 border-b border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"></div>
        <div className="relative container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text mb-4">
              YOUR WORKOUTS
            </h1>
            <p className="text-lg text-slate-300 mb-6">Track your completed workouts and progress in real-time</p>
            
            {/* Quick Action Button */}
            <div className="mb-6">
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/library')}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 font-semibold"
                >
                  🏋️ Start New Workout
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="btn bg-slate-600 hover:bg-slate-700 text-white px-4 py-3"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
            
            {/* Real-time Status */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 bg-slate-800/50 px-4 py-2 rounded-full border border-slate-600/30">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                <span className="text-sm font-bold text-white">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
              </div>
              <div className="text-sm text-slate-300 font-mono bg-slate-800/50 px-4 py-2 rounded-full border border-slate-600/30">
                {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
              </div>
            </div>

            {/* Real-Time Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 relative">
                <div className="text-2xl font-black text-blue-400">{stats?.todayWorkouts || 0}</div>
                <div className="text-xs text-slate-300 uppercase tracking-wide">Today's Workouts</div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 relative">
                <div className="text-2xl font-black text-green-400">{stats?.totalWorkouts || 0}</div>
                <div className="text-xs text-slate-300 uppercase tracking-wide">Total Workouts</div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 relative">
                <div className="text-2xl font-black text-purple-400">{stats?.weeklyWorkouts || 0}</div>
                <div className="text-xs text-slate-300 uppercase tracking-wide">This Week</div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="bg-gradient-to-br from-slate-800/60 via-slate-700/40 to-slate-800/60 backdrop-blur-sm border border-slate-600/30 rounded-xl p-4 relative">
                <div className="text-2xl font-black text-orange-400">{stats?.totalCalories || 0}</div>
                <div className="text-xs text-slate-300 uppercase tracking-wide">Total Calories</div>
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <CompletedWorkouts />
      </div>

      {/* Real-time Notifications */}
      {notification && (
        <RealTimeNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}