// Real-time Home page with MongoDB integration - Online Mode Only
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { useStreak } from '../context/StreakContext';
import { useAchievements } from '../context/AchievementsContext';
import Hero from '../components/Hero';
import RealTimeNotification from '../components/RealTimeNotification';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { stats, isOnline } = useRealTime();
  const { currentStreak } = useStreak();
  const { unlockedCount, totalCount, currentXP, completionPercentage, isOnline: achievementsOnline, checkAchievements } = useAchievements();
  const [notification, setNotification] = useState(null);
  
  const isAuthenticated = () => {
    try {
      return auth?.isAuthenticated() || false;
    } catch {
      return false;
    }
  };

  // Handle workout completion notifications
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted) {
      const message = workoutState.savedOffline 
        ? `🎉 ${workoutState.exercise} completed! (Saved offline)`
        : `🎉 ${workoutState.exercise} completed in ${workoutState.duration}!`;
      
      setNotification({
        message,
        type: 'workout'
      });
      
      // Check for new achievements
      checkAchievements();
      
      // Clear the state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname, checkAchievements]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section - Full Width at Top */}
      <Hero />
      
      <div className="container mx-auto px-4 py-8">

        {/* Enhanced Features Section - AURA++++ - Mobile Responsive */}
        <div className="mb-12 sm:mb-16 lg:mb-20 px-4">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text mb-3 sm:mb-4 font-heading tracking-tight">
              ELITE FEATURES
            </h2>
            <div className="w-16 sm:w-20 lg:w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-900/20 via-blue-800/10 to-blue-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-blue-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl sm:text-3xl">🏋️</span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-3 sm:mb-4 font-heading tracking-tight">WORKOUT DOMINATION</h3>
                <p className="text-slate-300 font-medium leading-relaxed text-sm sm:text-base">Master your training with precision tracking and real-time performance analytics</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-900/20 via-purple-800/10 to-purple-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-purple-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl sm:text-3xl">📊</span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-3 sm:mb-4 font-heading tracking-tight">PROGRESS ANALYTICS</h3>
                <p className="text-slate-300 font-medium leading-relaxed text-sm sm:text-base">Visualize your transformation with advanced metrics and performance insights</p>
              </div>
            </div>
            
            <div className="group relative overflow-hidden bg-gradient-to-br from-green-900/20 via-green-800/10 to-green-900/20 backdrop-blur-sm border border-green-500/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 hover:border-green-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 text-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <span className="text-2xl sm:text-3xl">🎯</span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-white mb-3 sm:mb-4 font-heading tracking-tight">GOAL CRUSHING</h3>
                <p className="text-slate-300 font-medium leading-relaxed text-sm sm:text-base">Set ambitious targets and systematically destroy every fitness milestone</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Section - AURA++++ Level */}
        <div className="mb-20">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text mb-4 font-heading tracking-tight">
              {isAuthenticated() ? 'YOUR DOMINANCE' : 'GLOBAL DOMINANCE'}
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 mx-auto mb-4 rounded-full"></div>
            {isAuthenticated() && (
              <div className="flex items-center justify-center gap-3 bg-slate-800/40 backdrop-blur-sm rounded-full px-6 py-3 border border-slate-700/50">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'} shadow-lg`}></div>
                <span className="text-slate-300 font-semibold text-sm tracking-wide uppercase">
                  {isOnline ? '🔥 LIVE SYNC ACTIVE' : '⚡ OFFLINE MODE'}
                </span>
              </div>
            )}
          </div>

          {/* User Stats - Real-time MongoDB Data - Clickable Navigation */}
          {isAuthenticated() && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
              <button
                onClick={() => navigate('/analytics')}
                className="group relative overflow-hidden bg-gradient-to-br from-blue-900/30 via-blue-800/20 to-blue-900/30 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 hover:border-blue-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-5xl font-black text-blue-400 mb-3 font-heading tracking-tighter">{stats.totalWorkouts || 0}</div>
                  <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">WORKOUTS</div>
                  <div className="text-xs text-blue-300/70 mt-1">{stats.totalWorkouts > 0 ? 'CONQUERED' : 'START NOW'}</div>
                </div>
                <div className="absolute top-4 right-4 text-blue-400/30 text-2xl">💪</div>
                <div className="absolute top-2 left-2 text-xs text-blue-400/70">
                  {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
                </div>
                <div className="absolute bottom-2 right-2 text-blue-400/50 text-xs">→</div>
              </button>

              <button
                onClick={() => navigate('/nutrition')}
                className="group relative overflow-hidden bg-gradient-to-br from-green-900/30 via-green-800/20 to-green-900/30 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 hover:border-green-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-5xl font-black text-green-400 mb-3 font-heading tracking-tighter">{stats.totalMeals || 0}</div>
                  <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">MEALS</div>
                  <div className="text-xs text-green-300/70 mt-1">{stats.totalMeals > 0 ? 'TRACKED' : 'START LOGGING'}</div>
                </div>
                <div className="absolute top-4 right-4 text-green-400/30 text-2xl">🍎</div>
                <div className="absolute top-2 left-2 text-xs text-green-400/70">
                  {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
                </div>
                <div className="absolute bottom-2 right-2 text-green-400/50 text-xs">→</div>
              </button>

              <button
                onClick={() => navigate('/xp-points')}
                className="group relative overflow-hidden bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-purple-900/30 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-5xl font-black text-purple-400 mb-3 font-heading tracking-tighter">{(stats.xpPoints || 0).toLocaleString()}</div>
                  <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">XP POINTS</div>
                  <div className="text-xs text-purple-300/70 mt-1">{stats.xpPoints > 0 ? 'EARNED' : 'START EARNING'}</div>
                </div>
                <div className="absolute top-4 right-4 text-purple-400/30 text-2xl">⭐</div>
                <div className="absolute top-2 left-2 text-xs text-purple-400/70">
                  {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
                </div>
                <div className="absolute bottom-2 right-2 text-purple-400/50 text-xs">→</div>
              </button>

              <button
                onClick={() => navigate('/current-streak')}
                className="group relative overflow-hidden bg-gradient-to-br from-orange-900/30 via-red-800/20 to-orange-900/30 backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 hover:border-orange-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-5xl font-black text-orange-400 mb-3 font-heading tracking-tighter flex items-center gap-2">
                    {stats.currentStreak || currentStreak || 0}<span className="text-red-400 animate-pulse">🔥</span>
                  </div>
                  <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">DAY STREAK</div>
                  <div className="text-xs text-orange-300/70 mt-1">{(stats.currentStreak || currentStreak) > 0 ? 'UNSTOPPABLE' : 'START TODAY'}</div>
                </div>
                <div className="absolute top-4 right-4 text-orange-400/30 text-2xl">⚡</div>
                <div className="absolute top-2 left-2 text-xs text-orange-400/70">
                  {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
                </div>
                <div className="absolute bottom-2 right-2 text-orange-400/50 text-xs">→</div>
              </button>

              <button
                onClick={() => navigate('/achievements')}
                className="group relative overflow-hidden bg-gradient-to-br from-yellow-900/30 via-amber-800/20 to-yellow-900/30 backdrop-blur-sm border border-yellow-500/20 rounded-2xl p-8 hover:border-yellow-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10 cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="text-5xl font-black text-yellow-400 mb-3 font-heading tracking-tighter flex items-center gap-2">
                    {unlockedCount}
                    <span className={`text-xs px-2 py-1 rounded-full ${isOnline && stats.isRealTime ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {isOnline && stats.isRealTime ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">ACHIEVEMENTS</div>
                  <div className="text-xs text-yellow-300/70 mt-1">
                    {unlockedCount > 0 ? `${completionPercentage}% Complete • ${currentXP.toLocaleString()} XP` : 'START EARNING'}
                  </div>
                </div>
                <div className="absolute top-4 right-4 text-yellow-400/30 text-2xl">🏆</div>
                <div className="absolute top-2 left-2 text-xs text-yellow-400/70">
                  {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
                </div>
                <div className="absolute bottom-2 right-2 text-yellow-400/50 text-xs">→</div>
              </button>
            </div>
          )}

          {/* Global Stats - Always Visible */}
          <div className="relative">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-slate-200 via-white to-slate-200 bg-clip-text mb-2 font-heading">
                GLOBAL IMPACT
              </h3>
              <p className="text-slate-400 font-medium">Join the elite fitness community</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-8 hover:border-blue-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl md:text-5xl font-black text-blue-400 mb-3 font-heading tracking-tighter">15K+</div>
                  <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">ACTIVE USERS</div>
                  <div className="text-xs text-blue-300/70 mt-1">WORLDWIDE</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-8 hover:border-purple-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl md:text-5xl font-black text-purple-400 mb-3 font-heading tracking-tighter">75K+</div>
                  <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">WORKOUTS</div>
                  <div className="text-xs text-purple-300/70 mt-1">COMPLETED</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-500/20 rounded-full animate-ping"></div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-8 hover:border-green-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl md:text-5xl font-black text-green-400 mb-3 font-heading tracking-tighter">40K+</div>
                  <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">GOALS</div>
                  <div className="text-xs text-green-300/70 mt-1">ACHIEVED</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500/20 rounded-full animate-ping"></div>
              </div>

              <div className="group relative overflow-hidden bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-8 hover:border-yellow-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-3 font-heading tracking-tighter flex items-center justify-center gap-1">
                    4.9<span className="text-yellow-300">★</span>
                  </div>
                  <div className="text-slate-300 font-bold text-sm uppercase tracking-widest">APP RATING</div>
                  <div className="text-xs text-yellow-300/70 mt-1">EXCELLENCE</div>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500/20 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced CTA Section - AURA++++ - Mobile Responsive */}
        <div className="relative text-center px-4">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 rounded-2xl sm:rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-br from-slate-800/50 via-slate-700/30 to-slate-800/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text mb-4 sm:mb-6 font-heading tracking-tight leading-tight">
              {isAuthenticated() ? 'UNLEASH YOUR POTENTIAL' : 'JOIN THE ELITE'}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 font-medium max-w-2xl mx-auto leading-relaxed">
              {isAuthenticated() 
                ? 'Your transformation awaits. Access your personalized dashboard and dominate your fitness goals.' 
                : 'Transform your body, elevate your mind. Join thousands of elite athletes already crushing their goals.'}
            </p>
            <button
              onClick={() => navigate(isAuthenticated() ? '/dashboard' : '/register')}
              className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white font-black text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 border border-blue-400/30 w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 tracking-wide uppercase">
                {isAuthenticated() ? '🚀 ENTER DASHBOARD' : '⚡ START DOMINATING'}
              </span>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
            </button>
            {!isAuthenticated() && (
              <p className="text-xs sm:text-sm text-slate-400 mt-3 sm:mt-4 font-medium">Free forever • No credit card required • Join 15K+ elite athletes</p>
            )}
          </div>
        </div>
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