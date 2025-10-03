// Home.jsx - Performance Optimized Version
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { useStreak } from '../context/StreakContext';
import { useAchievements } from '../context/AchievementsContext';
import { getRealTimeStreak } from '../utils/streakUtils';
import Hero from '../components/Hero';
import LoadingScreen from '../components/LoadingScreen';

// Import images from assets folder
import Home1 from '../assets/Home1.jpg';
import Home2 from '../assets/Home2.jpg';
import Home3 from '../assets/Home3.jpg';
import Home4 from '../assets/Home4.jpg';
import Home5 from '../assets/Home5.jpg';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { stats, isOnline } = useRealTime();
  const { currentStreak } = useStreak();
  const {
    unlockedCount,
    totalCount,
    currentXP,
    completionPercentage,
    checkAchievements
  } = useAchievements();

  // Optimized state management
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [liveUsers, setLiveUsers] = useState(2847);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const observerRef = useRef(null);
  const mountedRef = useRef(true);
  const timersRef = useRef({});

  // Memoized auth check
  const isAuthenticated = useCallback(() => {
    try {
      return auth?.isAuthenticated?.() || false;
    } catch {
      return false;
    }
  }, [auth]);

  // Optimized color classes (static)
  const colorClasses = useMemo(() => ({
    blue: {
      bg: 'bg-blue-600',
      bgSoft: 'bg-blue-500/10',
      text: 'text-blue-400',
      ring: 'ring-blue-500',
      border: 'border-blue-600'
    },
    purple: {
      bg: 'bg-purple-600',
      bgSoft: 'bg-purple-500/10',
      text: 'text-purple-400',
      ring: 'ring-purple-500',
      border: 'border-purple-600'
    },
    green: {
      bg: 'bg-green-600',
      bgSoft: 'bg-green-500/10',
      text: 'text-green-400',
      ring: 'ring-green-500',
      border: 'border-green-600'
    },
    orange: {
      bg: 'bg-orange-500',
      bgSoft: 'bg-orange-400/10',
      text: 'text-orange-400',
      ring: 'ring-orange-400',
      border: 'border-orange-500'
    },
    yellow: {
      bg: 'bg-yellow-500',
      bgSoft: 'bg-yellow-400/10',
      text: 'text-yellow-400',
      ring: 'ring-yellow-400',
      border: 'border-yellow-500'
    }
  }), []);

  // Optimized features list
  const features = useMemo(() => ([
    { id: 'workout', icon: '🏋️', title: 'WORKOUT DOMINATION', desc: 'AI-powered training with real-time form analysis', color: 'blue' },
    { id: 'analytics', icon: '📊', title: 'PROGRESS ANALYTICS', desc: 'Advanced metrics with predictive insights', color: 'purple' },
    { id: 'goals', icon: '🎯', title: 'GOAL CRUSHING', desc: 'Smart goal setting with achievement tracking', color: 'green' },
    { id: 'streak', icon: '🔥', title: 'STREAK MASTER', desc: 'Maintain momentum with streak rewards', color: 'orange' },
    { id: 'achieve', icon: '🏆', title: 'ACHIEVEMENT SYSTEM', desc: 'Unlock exclusive badges and earn XP points', color: 'yellow' },
    { id: 'nutrition', icon: '🥗', title: 'NUTRITION TRACKING', desc: 'Track meals, calories, and macros', color: 'green' }
  ]), []);

  // Optimized stats calculation
  const realTimeCurrentStreak = useMemo(() => 
    getRealTimeStreak(currentStreak, stats?.currentStreak), 
    [currentStreak, stats?.currentStreak]
  );
  
  const totalWorkouts = useMemo(() => {
    const count = stats?.totalWorkouts ?? 0;
    return count > 0 ? count : 0;
  }, [stats?.totalWorkouts, refreshTrigger]);
  
  const todayWorkouts = useMemo(() => {
    const count = stats?.todayWorkouts ?? 0;
    return count > 0 ? count : 0;
  }, [stats?.todayWorkouts, refreshTrigger]);

  // Optimized quick stats
  const quickStats = useMemo(() => [
    {
      label: "Total Workouts",
      value: totalWorkouts,
      icon: '💪',
      color: 'blue',
      path: '/workouts',
      subtitle: totalWorkouts > 0 ? `${totalWorkouts} completed!` : 'No workouts yet - Start your journey!'
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
      value: currentXP ?? 0,
      icon: '⭐',
      color: 'yellow',
      path: '/xp-points',
      subtitle: currentXP > 0 ? `Level ${Math.floor((currentXP || 0) / 100) + 1}` : 'Earn XP by working out'
    },
    {
      label: 'Achievements',
      value: `${unlockedCount ?? 0}/${totalCount ?? 0}`,
      icon: '🏆',
      color: 'purple',
      path: '/achievements',
      subtitle: unlockedCount > 0 ? `${Math.round(completionPercentage || 0)}% complete` : 'Start earning achievements'
    }
  ], [totalWorkouts, realTimeCurrentStreak, currentXP, unlockedCount, totalCount, completionPercentage]);

  const globalStats = useMemo(() => [
    { value: '15K+', label: 'ELITE ATHLETES', sublabel: 'WORLDWIDE', color: 'blue', icon: '🌍' },
    { value: '125K+', label: 'WORKOUTS', sublabel: 'COMPLETED', color: 'purple', icon: '💪' },
    { value: '85K+', label: 'GOALS', sublabel: 'ACHIEVED', color: 'green', icon: '🎯' },
    { value: '4.9★', label: 'APP RATING', sublabel: 'EXCELLENCE', color: 'yellow', icon: '⭐' }
  ], []);

  // Optimized timer management
  useEffect(() => {
    mountedRef.current = true;
    
    // Single timer for time updates (reduced frequency)
    timersRef.current.time = setInterval(() => {
      if (mountedRef.current) {
        setCurrentTime(new Date());
      }
    }, 5000); // Reduced from 1000ms to 5000ms
    
    // Live users simulation (less frequent)
    timersRef.current.liveUsers = setInterval(() => {
      if (mountedRef.current) {
        setLiveUsers(prev => {
          const delta = Math.floor(Math.random() * 6) - 2; // Reduced range
          return Math.max(100, prev + delta);
        });
      }
    }, 10000); // Reduced from 5000ms to 10000ms

    return () => {
      mountedRef.current = false;
      Object.values(timersRef.current).forEach(timer => clearInterval(timer));
    };
  }, []);

  // Optimized intersection observer
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1, // Reduced from 0.12
      rootMargin: '50px' // Added root margin for better performance
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const updates = {};
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-id') || entry.target.id;
          if (id) {
            updates[id] = entry.isIntersecting;
          }
        });
        if (Object.keys(updates).length > 0) {
          setIsVisible(prev => ({ ...prev, ...updates }));
        }
      },
      observerOptions
    );

    // Observe elements with a delay to prevent initial render blocking
    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach(el => observerRef.current?.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observerRef.current?.disconnect();
    };
  }, []);

  // Optimized feature rotation
  useEffect(() => {
    timersRef.current.features = setInterval(() => {
      if (mountedRef.current) {
        setActiveFeature(prev => (prev + 1) % features.length);
      }
    }, 5000); // Increased from 4200ms to 5000ms

    return () => {
      if (timersRef.current.features) {
        clearInterval(timersRef.current.features);
      }
    };
  }, [features.length]);

  // Optimized event listeners
  useEffect(() => {
    const handleStreakUpdate = (e) => {
      const detail = e?.detail;
      if (!detail || !mountedRef.current) return;
      
      if (detail.type === 'STREAK_UPDATED') {
        const newStreak = detail.currentStreak ?? realTimeCurrentStreak;
        setNotification({ type: 'streak', message: `🔥 Day ${newStreak} Streak Active!` });
        setTimeout(() => mountedRef.current && setNotification(null), 3000);
      }
    };

    const handleWorkoutComplete = (e) => {
      const detail = e?.detail;
      if (!detail || !mountedRef.current) return;
      
      const msg = detail.savedOffline
        ? `🎉 ${detail.exercise} completed! (Saved offline)`
        : `🎉 ${detail.exercise} completed!`;
      setNotification({ type: 'workout', message: msg });
      
      try { 
        checkAchievements(); 
      } catch (err) { 
        console.warn('Achievement check failed:', err);
      }
      
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => mountedRef.current && setNotification(null), 3000);
    };

    const handleStatsUpdate = () => {
      if (mountedRef.current) {
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    // Add event listeners
    const events = [
      ['homeStreakUpdate', handleStreakUpdate],
      ['streakUpdated', handleStreakUpdate],
      ['workoutCompleted', handleWorkoutComplete],
      ['realTimeStatsUpdate', handleStatsUpdate],
      ['analyticsWorkoutUpdate', handleStatsUpdate]
    ];

    events.forEach(([event, handler]) => {
      window.addEventListener(event, handler);
    });

    return () => {
      events.forEach(([event, handler]) => {
        window.removeEventListener(event, handler);
      });
    };
  }, [checkAchievements, realTimeCurrentStreak]);

  // Clean fake data on mount
  useEffect(() => {
    // Clean any fake workout data when component mounts
    try {
      const workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
      const realWorkouts = workouts.filter(workout => {
        return workout.exercise && 
               workout.exercise !== 'Workout' && 
               workout.exercise !== 'Test Workout' &&
               (workout.duration > 0 || workout.caloriesBurned > 0) &&
               workout.completedAt &&
               !workout.id?.includes('test_') &&
               !workout.id?.includes('fake_') &&
               !workout.id?.includes('demo_');
      });
      
      if (realWorkouts.length !== workouts.length) {
        localStorage.setItem('workoutSync_workouts', JSON.stringify(realWorkouts));
        setRefreshTrigger(prev => prev + 1);
        console.log(`🧹 Cleaned fake workouts: ${workouts.length} → ${realWorkouts.length}`);
      }
    } catch (error) {
      console.warn('Error cleaning fake workouts:', error);
    }
  }, []);

  // Handle location state
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted && mountedRef.current) {
      const message = workoutState.savedOffline
        ? `🎉 ${workoutState.exercise} completed! (Saved offline)`
        : `🎉 ${workoutState.exercise} completed!`;
      setNotification({ message, type: 'workout' });
      
      try { 
        checkAchievements(); 
      } catch (err) {
        console.warn('Achievement check failed:', err);
      }
      
      navigate(location.pathname, { replace: true });
      setTimeout(() => mountedRef.current && setNotification(null), 3000);
    }
  }, [location.state, navigate, location.pathname, checkAchievements]);

  // Loading completion handler
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Navigation helper
  const handleNav = useCallback((path) => navigate(path), [navigate]);

  // Optimized count-up hook
  function useCountUp(value, duration = 400) { // Reduced duration
    const [display, setDisplay] = useState(value);
    const rafRef = useRef(null);

    useEffect(() => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      
      const start = performance.now();
      const fromValue = Number(display) || 0;
      const toValue = Number(value) || 0;
      const delta = toValue - fromValue;

      if (delta === 0) return;

      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 2); // Simplified easing
        const next = Math.round(fromValue + delta * eased);
        setDisplay(next);
        
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };
      
      rafRef.current = requestAnimationFrame(step);
      
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [value, duration, display]);

    return display;
  }

  // Optimized components
  const StatCard = React.memo(({ stat }) => {
    const c = colorClasses[stat.color] || colorClasses.blue;
    const numericValue = typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0;
    const count = useCountUp(numericValue, 300);

    return (
      <button
        onClick={() => handleNav(stat.path)}
        className="relative group transform transition-all duration-300 text-left w-full hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      >
        <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl group-hover:border-white/20 transition-all duration-300">
          <div className="flex items-start justify-between mb-3">
            <div className={`flex items-center justify-center rounded-xl p-3 bg-gradient-to-br ${c.bgSoft} border ${c.border} shadow-lg`}>
              <div className="text-xl sm:text-2xl">{stat.icon}</div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${c.text} bg-gradient-to-r ${c.bgSoft} border ${c.border}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline && stats?.isRealTime ? 'bg-green-400' : 'bg-gray-400'}`} />
                {isOnline && stats?.isRealTime ? 'LIVE' : 'OFF'}
              </span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className={`text-xl sm:text-2xl font-black text-white ${stat.label === 'Current Streak' && realTimeCurrentStreak > 0 ? 'animate-pulse' : ''}`}>
              {typeof stat.value === 'number' ? count : stat.value}
              {stat.label === 'Current Streak' && realTimeCurrentStreak > 0 && <span className="ml-2 animate-bounce">🔥</span>}
            </div>
            
            <div className="text-xs sm:text-sm font-semibold text-slate-300">
              {stat.label}
            </div>
            
            <div className="text-xs text-slate-400 line-clamp-1">
              {stat.subtitle}
            </div>
          </div>
        </div>
      </button>
    );
  });

  const FeatureCard = ({ feature, index }) => {
    const isActive = index === activeFeature;
    const c = colorClasses[feature.color] || colorClasses.blue;
    return (
      <div
        onMouseEnter={() => setActiveFeature(index)}
        onFocus={() => setActiveFeature(index)}
        tabIndex={0}
        role="button"
        aria-pressed={isActive}
        className={`relative group cursor-pointer transform transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-white/20 ${isActive ? 'scale-105' : 'hover:scale-102'}`}
      >
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${c.bg}/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500 ${isActive ? 'opacity-40' : ''}`} />
        
        {/* Main Card */}
        <div className={`relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-500 ${isActive ? 'border-white/30 shadow-3xl' : 'border-white/10 hover:border-white/20'}`}>
          {/* Icon */}
          <div className="mb-4 sm:mb-6">
            <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${c.bgSoft} border ${c.border} shadow-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
              <span className="text-2xl sm:text-3xl">{feature.icon}</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className={`font-black text-base sm:text-lg transition-all duration-300 ${isActive ? `text-transparent bg-clip-text bg-gradient-to-r ${c.text.replace('text-', 'from-')} to-white` : `${c.text} group-hover:text-white`}`}>
              {feature.title}
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed min-h-[48px] sm:min-h-[60px] group-hover:text-slate-300 transition-colors duration-300">
              {feature.desc}
            </p>
            
            {/* Special Streak Display */}
            {feature.title === 'STREAK MASTER' && (
              <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/20 rounded-lg sm:rounded-xl">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-orange-300">
                  Current: <span className="text-white">{realTimeCurrentStreak}</span> days
                </span>
              </div>
            )}
          </div>
          
          {/* Active Indicator */}
          {isActive && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-white to-blue-200 rounded-full animate-ping" />
              <div className="absolute inset-0 w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full" />
            </div>
          )}
          
          {/* Decorative Elements */}
          <div className={`absolute -top-3 -right-3 sm:-top-4 sm:-right-4 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br ${c.bg}/10 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 ${isActive ? 'opacity-30' : ''}`} />
          <div className={`absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-tr ${c.bg}/5 rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
        </div>
      </div>
    );
  };

  const GlobalStat = ({ stat }) => {
    const c = colorClasses[stat.color] || colorClasses.blue;
    return (
      <div className="relative group transform transition-all duration-500 hover:scale-105">
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${c.bg}/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center shadow-2xl group-hover:border-white/20 group-hover:shadow-3xl transition-all duration-500">
          {/* Icon */}
          <div className="mb-4 sm:mb-6">
            <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${c.bgSoft} border ${c.border} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
              <span className="text-2xl sm:text-3xl">{stat.icon}</span>
            </div>
          </div>
          
          {/* Value */}
          <div className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-2 transition-all duration-300 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${c.text.replace('text-', 'from-')} group-hover:to-white ${c.text}`}>
            {stat.value}
          </div>
          
          {/* Label */}
          <div className="text-white font-bold text-xs sm:text-sm mb-1 sm:mb-2 group-hover:text-slate-100 transition-colors duration-300">
            {stat.label}
          </div>
          
          {/* Sublabel */}
          <div className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors duration-300 font-medium">
            {stat.sublabel}
          </div>
          
          {/* Decorative Elements */}
          <div className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${c.bg}/10 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
        </div>
      </div>
    );
  };

  /* --------------------------
     Main render
     -------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black relative overflow-hidden">
      {/* Loading Screen Component */}
      {isLoading && (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      )}

      {/* Simplified Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-64 -right-64 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-gradient-to-bl from-purple-500/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] bg-gradient-to-r from-green-500/6 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Hero Section */}
      <div className="relative">
        <Hero />
      </div>

      <div className={`container mx-auto px-3 sm:px-4 py-3 sm:py-4 relative z-10 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} space-y-8`}>
        {/* Status Bar */}
        <section data-animate data-id="status-bar" className="mb-8">
          <div className={`transition-all duration-500 transform ${isVisible['status-bar'] ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="relative bg-gradient-to-r from-slate-900/95 to-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-500'} shadow-lg`} />
                    <span className="text-xs font-black text-white tracking-wider">
                      {isOnline ? '🟢 LIVE SYNC' : '🔴 OFFLINE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">⏰</span>
                    <div className="text-xs text-white font-mono bg-slate-800/50 px-2 py-1 rounded-lg">
                      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl px-3 py-2">
                    <span className="text-blue-400 animate-pulse">👥</span>
                    <div className="flex flex-col">
                      <span className="font-black text-white text-sm tabular-nums">{liveUsers.toLocaleString()}</span>
                      <span className="text-xs text-blue-300 font-medium">ONLINE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section data-animate data-id="quick-stats" className="mb-12">
          <div className={`transition-all duration-500 delay-100 transform ${isVisible['quick-stats'] ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">
                  YOUR STATUS
                </span>
              </h2>
              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
                Real-time performance metrics for champions
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {quickStats.map((stat, i) => (
                <StatCard key={`stat-${i}`} stat={stat} />
              ))}
            </div>
          </div>
        </section>



        {/* Elite Training Experience - Home1.jpg */}
        <section data-animate data-id="training-experience" id="training-experience" className="mb-20">
          <div className={`transition-all duration-700 delay-300 transform ${isVisible['training-experience'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="relative group">
              {/* Premium Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-500 animate-pulse" />
              
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-2xl border border-white/20 shadow-2xl">
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 sm:h-96 lg:h-[500px] overflow-hidden">
                    <img 
                      src={Home1} 
                      alt="Elite Training Experience" 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 filter brightness-110 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Premium Overlay Stats */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center justify-between">
                        <div className="bg-black/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
                          <div className="text-blue-400 text-xs font-bold">EQUIPMENT GRADE</div>
                          <div className="text-white text-lg font-black">PROFESSIONAL</div>
                        </div>
                        <div className="bg-black/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
                          <div className="text-cyan-400 text-xs font-bold">SUCCESS RATE</div>
                          <div className="text-white text-lg font-black">98.7%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center relative">
                    {/* Premium Decorative Elements */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
                        <span className="text-xs font-black text-blue-400 tracking-[0.2em] uppercase">Elite Training Division</span>
                      </div>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-blue-400 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        PROFESSIONAL GRADE
                      </span>
                    </div>
                    
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-100">
                        ELITE TRAINING
                      </span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300">
                        EXPERIENCE
                      </span>
                    </h3>
                    
                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                      Experience world-class training with <span className="text-blue-400 font-bold">state-of-the-art equipment</span> designed for elite performance. Every rep counts towards your transformation into a champion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strength & Power - Home2.jpg */}
        <section data-animate data-id="strength-power" id="strength-power" className="mb-20">
          <div className={`transition-all duration-700 delay-500 transform ${isVisible['strength-power'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="relative group">
              {/* Premium Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-500 animate-pulse" />
              
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-2xl border border-white/20 shadow-2xl">

                
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center order-2 lg:order-1 relative">
                 
                    
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-gradient-to-b from-red-400 to-orange-400 rounded-full" />
                        <span className="text-xs font-black text-red-400 tracking-[0.2em] uppercase">Power & Strength Division</span>
                      </div>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-red-400 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-400/30 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                        MAXIMUM INTENSITY
                      </span>
                    </div>
                    
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-100 to-orange-100">
                        UNLEASH YOUR
                      </span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-300">
                        INNER BEAST
                      </span>
                    </h3>
                    
                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                      Push beyond your limits with <span className="text-red-400 font-bold">intense strength training</span>. Build raw power, explosive strength, and unstoppable determination that defines champions.
                    </p>
                  </div>
                  
                  <div className="relative h-80 sm:h-96 lg:h-[500px] overflow-hidden order-1 lg:order-2">
                    <img 
                      src={Home2} 
                      alt="Strength and Power Training" 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 filter brightness-110 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-red-900/40 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Premium Overlay Stats */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center justify-between">
                        <div className="bg-black/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
                          <div className="text-red-400 text-xs font-bold">POWER LEVEL</div>
                          <div className="text-white text-lg font-black">MAXIMUM</div>
                        </div>
                        <div className="bg-black/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
                          <div className="text-orange-400 text-xs font-bold">INTENSITY</div>
                          <div className="text-white text-lg font-black">BEAST</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cardio Excellence - Home3.jpg */}
        <section data-animate data-id="cardio-excellence" id="cardio-excellence" className="mb-20">
          <div className={`transition-all duration-700 delay-600 transform ${isVisible['cardio-excellence'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="relative group">
              {/* Premium Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-green-600 via-teal-500 to-green-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-500 animate-pulse" />
              
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-2xl border border-white/20 shadow-2xl">

                
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 sm:h-96 lg:h-[500px] overflow-hidden">
                    <img 
                      src={Home3} 
                      alt="Muscle Building Training" 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 filter brightness-110 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-green-900/40 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Premium Overlay Stats */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center justify-between">
                        <div className="bg-black/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
                          <div className="text-green-400 text-xs font-bold">MUSCLE GAIN</div>
                          <div className="text-white text-lg font-black">OPTIMAL</div>
                        </div>
                        <div className="bg-black/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
                          <div className="text-teal-400 text-xs font-bold">ENDURANCE</div>
                          <div className="text-white text-lg font-black">ELITE</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center relative">
                    {/* Premium Decorative Elements */}
                    
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-teal-400 rounded-full" />
                        <span className="text-xs font-black text-green-400 tracking-[0.2em] uppercase">Muscle Building Excellence</span>
                      </div>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-green-400 bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-400/30 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        HYPERTROPHY MASTERY
                      </span>
                    </div>
                    
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-teal-100">
                        BUILD MASSIVE
                      </span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-300">
                        MUSCLE GAINS
                      </span>
                    </h3>
                    
                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                      Sculpt <span className="text-emerald-400 font-bold">massive muscle gains</span> with scientifically-proven hypertrophy training. Transform your physique with precision muscle-building protocols.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Functional Training - Home4.jpg */}
        <section data-animate data-id="functional-training" id="functional-training" className="mb-20">
          <div className={`transition-all duration-700 delay-700 transform ${isVisible['functional-training'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="relative group">
              {/* Premium Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-500 animate-pulse" />
              
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-2xl border border-white/20 shadow-2xl">

                
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center order-2 lg:order-1 relative">
                    {/* Premium Decorative Elements */}
                    
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                        <span className="text-xs font-black text-purple-400 tracking-[0.2em] uppercase">Functional Movement</span>
                      </div>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-purple-400 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        SMART TRAINING
                      </span>
                    </div>
                    
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-pink-100">
                        REAL-WORLD
                      </span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300">
                        STRENGTH
                      </span>
                    </h3>
                    
                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                      Master <span className="text-purple-400 font-bold">functional movements</span> that translate to real-world performance. Train your body to move with purpose, power, and precision.
                    </p>
                  </div>
                  
                  <div className="relative h-80 sm:h-96 lg:h-[500px] overflow-hidden order-1 lg:order-2">
                    <img 
                      src={Home4} 
                      alt="Functional Training" 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 filter brightness-110 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-l from-purple-900/40 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    

                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Elite Community - Home5.jpg */}
        <section data-animate data-id="elite-community" id="elite-community" className="mb-20">
          <div className={`transition-all duration-700 delay-800 transform ${isVisible['elite-community'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="relative group">
              {/* Premium Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-600 via-orange-500 to-yellow-600 rounded-3xl blur-lg opacity-25 group-hover:opacity-40 transition-all duration-500 animate-pulse" />
              
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/98 via-slate-800/95 to-slate-900/98 backdrop-blur-2xl border border-white/20 shadow-2xl">

                
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-80 sm:h-96 lg:h-[500px] overflow-hidden">
                    <img 
                      src={Home5} 
                      alt="Elite Community" 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 filter brightness-110 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/40 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
             
                  </div>
                  
                  <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center relative">
                    {/* Premium Decorative Elements */}
                  
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-8 bg-gradient-to-b from-yellow-400 to-orange-400 rounded-full" />
                        <span className="text-xs font-black text-yellow-400 tracking-[0.2em] uppercase">Elite Champions Network</span>
                      </div>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-yellow-400 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 backdrop-blur-sm">
                        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                        EXCLUSIVE ACCESS
                      </span>
                    </div>
                    
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-100 to-orange-100">
                        JOIN THE
                      </span>
                      <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300">
                        CHAMPIONS
                      </span>
                    </h3>
                    
                    <p className="text-slate-300 text-lg leading-relaxed font-medium">
                      Connect with <span className="text-yellow-400 font-bold">elite athletes worldwide</span>. Share victories, push limits together, and become part of the ultimate fitness community that breeds champions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section data-animate data-id="cta" id="cta" className="text-center relative">
          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-slow-pulse" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-gradient-to-tl from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-slow-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className={`relative transition-all duration-700 delay-600 transform ${isVisible['cta'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="mb-12">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
                <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Join The Elite</span>
                <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-green-200 to-cyan-200">
                  READY TO
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 ml-3">
                  DOMINATE?
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed px-4">
                Join the elite community of athletes who track their progress with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 font-semibold">precision</span> and achieve <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-semibold">extraordinary results</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              {isAuthenticated() ? (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')} 
                    className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-2xl sm:rounded-3xl text-base sm:text-lg lg:text-xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400/50 hover:shadow-3xl"
                  >
                    🚀 GO TO DASHBOARD
                  </button>
                  
                  <button 
                    onClick={() => navigate('/current-streak')} 
                    className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-2xl sm:rounded-3xl text-base sm:text-lg lg:text-xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-400/50 hover:shadow-3xl"
                  >
                    🔥 CHECK STREAK ({realTimeCurrentStreak})
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/register')} 
                    className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-2xl sm:rounded-3xl text-base sm:text-lg lg:text-xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-400/50 hover:shadow-3xl"
                  >
                    🎆 START YOUR JOURNEY
                  </button>
                  
                  <button 
                    onClick={() => navigate('/login')} 
                    className="w-full sm:w-auto px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 rounded-2xl sm:rounded-3xl text-base sm:text-lg lg:text-xl font-black bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/20 text-white shadow-2xl transform transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20 hover:border-white/40 hover:shadow-3xl"
                  >
                    🔑 LOGIN
                  </button>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Notification System */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right duration-300">
          <div className={`p-3 rounded-xl shadow-xl border backdrop-blur-sm transform transition-all duration-300 ${
            notification.type === 'workout' 
              ? 'bg-green-600/95 border-green-400 text-white' 
              : notification.type === 'streak' 
              ? 'bg-orange-600/95 border-orange-400 text-white' 
              : 'bg-blue-600/95 border-blue-400 text-white'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">
                {notification.type === 'workout' ? '🎉' : notification.type === 'streak' ? '🔥' : '✨'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm leading-tight">{notification.message}</div>
                <div className="text-xs opacity-75 mt-1">Just now</div>
              </div>
              <button 
                onClick={() => setNotification(null)} 
                className="text-white/80 hover:text-white rounded-full p-1 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simplified CSS */}
      <style>
        {`
          @keyframes animate-in {
            from { opacity: 0; transform: translateX(100%); }
            to { opacity: 1; transform: translateX(0); }
          }
          
          .animate-in { animation: animate-in 0.3s ease-out; }
          .slide-in-from-right { animation-name: animate-in; }
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
        `}
      </style>
    </div>
  );
}
