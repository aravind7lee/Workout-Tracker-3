// Premium GymTracker Home - Professional Level UI/UX
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { useStreak } from '../context/StreakContext';
import { useAchievements } from '../context/AchievementsContext';
import { getRealTimeStreak } from '../utils/streakUtils';
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [liveUsers, setLiveUsers] = useState(2847);
  const observerRef = useRef();
  
  const isAuthenticated = () => {
    try {
      return auth?.isAuthenticated() || false;
    } catch {
      return false;
    }
  };

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live users counter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers(prev => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Scroll effects
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // REAL-TIME STREAK UPDATES - Listen for instant updates
  useEffect(() => {
    const handleStreakUpdate = (event) => {
      if (event.detail) {
        const streakData = event.detail;
        console.log('🔥 HOME: Real-time streak update received:', streakData);
        
        // Show notification for streak updates
        if (streakData.type === 'STREAK_UPDATED' && streakData.currentStreak > 0) {
          setNotification({
            message: `🔥 Day ${streakData.currentStreak} Streak Active! Keep it up!`,
            type: 'streak'
          });
          setTimeout(() => setNotification(null), 4000);
        }
      }
    };
    
    // Listen for real-time streak updates
    window.addEventListener('homeStreakUpdate', handleStreakUpdate);
    window.addEventListener('streakUpdated', handleStreakUpdate);
    
    return () => {
      window.removeEventListener('homeStreakUpdate', handleStreakUpdate);
      window.removeEventListener('streakUpdated', handleStreakUpdate);
    };
  }, []);

  // Handle workout completion notifications and refresh stats
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
      
      checkAchievements();
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname, checkAchievements]);

  // Listen for workout completion events to update stats
  useEffect(() => {
    const handleWorkoutCompleted = (event) => {
      if (event.detail) {
        console.log('🏋️ HOME: Workout completed, stats will auto-refresh');
        // RealTimeContext will handle the stats update automatically
      }
    };

    window.addEventListener('workoutCompleted', handleWorkoutCompleted);
    return () => window.removeEventListener('workoutCompleted', handleWorkoutCompleted);
  }, []);

  const features = [
    { icon: '🏋️', title: 'WORKOUT DOMINATION', desc: 'AI-powered training with real-time form analysis and performance optimization', color: 'blue' },
    { icon: '📊', title: 'PROGRESS ANALYTICS', desc: 'Advanced metrics with predictive insights and transformation visualization', color: 'purple' },
    { icon: '🎯', title: 'GOAL CRUSHING', desc: 'Smart goal setting with achievement tracking and milestone rewards', color: 'green' },
    { icon: '🔥', title: 'STREAK MASTER', desc: 'Maintain momentum with streak rewards and consistency challenges', color: 'orange' },
    { icon: '🏆', title: 'ACHIEVEMENT SYSTEM', desc: 'Unlock exclusive badges and level up your fitness journey', color: 'yellow' },
    { icon: '🥗', title: 'NUTRITION TRACKING', desc: 'Track your meals, calories, and macros with smart food recognition and personalized recommendations', color: 'green' }
  ];

  // REAL-TIME STREAK DATA - Use utility function for consistency across all pages
  const realTimeCurrentStreak = getRealTimeStreak(currentStreak, stats?.currentStreak);
  
  const quickStats = [
    { 
      label: 'Today\'s Workouts', 
      value: stats?.todayWorkouts || 0, 
      icon: '💪', 
      color: 'blue', 
      path: '/workouts',
      subtitle: stats?.todayWorkouts > 0 ? `${stats.todayWorkouts} completed today!` : 'Start your first workout'
    },
    { 
      label: 'Current Streak', 
      value: realTimeCurrentStreak, 
      icon: '🔥', 
      color: 'orange', 
      path: '/current-streak',
      subtitle: realTimeCurrentStreak > 0 ? `${realTimeCurrentStreak} days strong!` : 'Start your streak'
    },
    { 
      label: 'Total XP', 
      value: currentXP || 0, 
      icon: '⭐', 
      color: 'yellow', 
      path: '/dashboard',
      subtitle: currentXP > 0 ? `Level ${Math.floor(currentXP / 100) + 1}` : 'Earn XP by working out'
    },
    { 
      label: 'Achievements', 
      value: `${unlockedCount}/${totalCount}`, 
      icon: '🏆', 
      color: 'purple', 
      path: '/achievements',
      subtitle: unlockedCount > 0 ? `${completionPercentage}% complete` : 'Start earning achievements'
    }
  ];

  const globalStats = [
    { value: '15K+', label: 'ELITE ATHLETES', sublabel: 'WORLDWIDE', color: 'blue', icon: '🌍' },
    { value: '125K+', label: 'WORKOUTS', sublabel: 'COMPLETED', color: 'purple', icon: '💪' },
    { value: '85K+', label: 'GOALS', sublabel: 'ACHIEVED', color: 'green', icon: '🎯' },
    { value: '4.9★', label: 'APP RATING', sublabel: 'EXCELLENCE', color: 'yellow', icon: '⭐' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400/40 rounded-full animate-ping" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-32 left-1/4 w-3 h-3 bg-green-400/20 rounded-full animate-pulse" style={{animationDelay: '5s'}}></div>
      </div>

      {/* Enhanced Hero Section with Parallax */}
      <div className="relative" style={{transform: `translateY(${scrollY * 0.5}px)`}}>
        <Hero />
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        
        {/* Real-time Status Bar */}
        <div className="mb-8" data-animate id="status-bar">
          <div className={`transform transition-all duration-1000 ${isVisible['status-bar'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-gradient-to-r from-slate-800/80 via-slate-700/80 to-slate-800/80 backdrop-blur-xl border border-slate-600/30 rounded-2xl p-4 mb-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                    <span className="text-sm font-bold text-white">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
                  </div>
                  <div className="text-sm text-slate-300 font-mono">
                    {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}
                  </div>
                  <div className="hidden sm:block text-xs text-slate-400">
                    Server: Online • Latency: 12ms
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-300">
                    👥 <span className="font-bold text-blue-400">{liveUsers.toLocaleString()}</span> users online
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Quick Stats Dashboard */}
        {isAuthenticated() && (
          <div className="mb-12" data-animate id="quick-stats">
            <div className={`transform transition-all duration-1000 delay-200 ${isVisible['quick-stats'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text mb-2 font-heading">
                  YOUR ELITE STATUS
                </h2>
                <p className="text-slate-400">Real-time performance metrics</p>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {quickStats.map((stat, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(stat.path)}
                    className="card cursor-pointer hover:scale-105 transition-all duration-300 text-left relative hover:shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${stat.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="text-lg sm:text-2xl">{stat.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xl sm:text-2xl font-bold text-white ${
                          stat.label === 'Current Streak' && realTimeCurrentStreak > 0 ? 'animate-pulse' : ''
                        }`}>
                          {stat.value}{stat.label === 'Current Streak' && realTimeCurrentStreak > 0 ? '🔥' : ''}
                        </div>
                        <div className="text-slate-400 text-xs sm:text-sm">{stat.label}</div>
                        <div className="text-xs text-green-400">
                          {stat.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className={`absolute top-2 right-2 text-xs text-${stat.color}-400/70`}>
                      {isOnline && stats.isRealTime ? '🔴 LIVE' : '❌ OFFLINE'}
                    </div>
                    <div className={`absolute bottom-2 right-2 text-${stat.color}-400/50 text-xs`}>→</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Features Section with Real-time Indicators */}
        <div className="mb-12" data-animate id="features">
          <div className={`transform transition-all duration-1000 delay-400 ${isVisible['features'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text mb-2 font-heading">
                ELITE FITNESS FEATURES
              </h2>
              <p className="text-slate-400">Professional-grade tools for serious athletes</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Real-time data synchronization</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`
                    card cursor-pointer hover:scale-105 transition-all duration-500 text-center relative overflow-hidden
                    ${activeFeature === index ? 'ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20' : ''}
                  `}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className={`text-lg font-bold mb-3 text-${feature.color}-400`}>{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                    
                    {/* Real-time indicator for streak feature */}
                    {feature.title === 'STREAK MASTER' && (
                      <div className="mt-3 flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-orange-400">
                          Current: {realTimeCurrentStreak} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Stats with Real-time Updates */}
        <div className="mb-12" data-animate id="global-stats">
          <div className={`transform transition-all duration-1000 delay-600 ${isVisible['global-stats'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text mb-2 font-heading">
                GLOBAL COMMUNITY STATS
              </h2>
              <p className="text-slate-400">Join thousands of elite athletes worldwide</p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {globalStats.map((stat, index) => (
                <div
                  key={index}
                  className="card text-center hover:scale-105 transition-all duration-300"
                >
                  <div className="text-3xl mb-3">{stat.icon}</div>
                  <div className={`text-2xl sm:text-3xl font-bold text-${stat.color}-400 mb-2`}>{stat.value}</div>
                  <div className="text-white font-semibold text-sm mb-1">{stat.label}</div>
                  <div className="text-slate-400 text-xs">{stat.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center" data-animate id="cta">
          <div className={`transform transition-all duration-1000 delay-800 ${isVisible['cta'] ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-gradient-to-r from-white via-green-100 to-white bg-clip-text mb-4 font-heading">
              READY TO DOMINATE?
            </h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
              Join the elite community of athletes who track their progress with precision and achieve extraordinary results.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated() ? (
                <>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:from-blue-700 hover:via-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    🚀 GO TO DASHBOARD
                  </button>
                  <button
                    onClick={() => navigate('/current-streak')}
                    className="btn bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    🔥 CHECK STREAK ({realTimeCurrentStreak})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/register')}
                    className="btn bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300"
                  >
                    🎆 START YOUR JOURNEY
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="btn-secondary px-8 py-4 text-lg font-bold hover:scale-105 transition-all duration-300"
                  >
                    🔑 LOGIN
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Real-time Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-sm">
          <div className={`
            p-4 rounded-lg shadow-2xl border animate-bounce
            ${
              notification.type === 'workout' 
                ? 'bg-green-600 border-green-500 text-white'
                : notification.type === 'streak'
                ? 'bg-orange-600 border-orange-500 text-white'
                : 'bg-blue-600 border-blue-500 text-white'
            }
          `}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {notification.type === 'workout' ? '🎉' : notification.type === 'streak' ? '🔥' : '✨'}
              </span>
              <div className="flex-1">
                <div className="font-bold text-sm">{notification.message}</div>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="text-white hover:text-gray-200 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}