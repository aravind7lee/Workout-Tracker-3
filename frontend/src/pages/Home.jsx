// Home.jsx
// Premium GymTracker Home - Professional Level UI/UX (Refactored & Enhanced)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { useStreak } from '../context/StreakContext';
import { useAchievements } from '../context/AchievementsContext';
import { workoutSync } from '../services/workoutSync';
import { getRealTimeStreak } from '../utils/streakUtils';
import Hero from '../components/Hero';
import LoadingScreen from '../components/LoadingScreen';

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
    isOnline: achievementsOnline,
    checkAchievements
  } = useAchievements();

  // UI state
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeFeature, setActiveFeature] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [liveUsers, setLiveUsers] = useState(2847);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const observerRef = useRef(null);
  const mountedRef = useRef(true);

  // Safe auth-check
  const isAuthenticated = () => {
    try {
      return auth?.isAuthenticated?.() || false;
    } catch {
      return false;
    }
  };

  /* --------------------------
     Color class mapping (Tailwind-safe)
     Do NOT use dynamic Tailwind classes elsewhere.
     -------------------------- */
  const colorClasses = {
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
  };

  // Features list
  const features = useMemo(() => ([
    { id: 'workout', icon: '🏋️', title: 'WORKOUT DOMINATION', desc: 'AI-powered training with real-time form analysis and performance optimization', color: 'blue' },
    { id: 'analytics', icon: '📊', title: 'PROGRESS ANALYTICS', desc: 'Advanced metrics with predictive insights and transformation visualization', color: 'purple' },
    { id: 'goals', icon: '🎯', title: 'GOAL CRUSHING', desc: 'Smart goal setting with achievement tracking and milestone rewards', color: 'green' },
    { id: 'streak', icon: '🔥', title: 'STREAK MASTER', desc: 'Maintain momentum with streak rewards and consistency challenges', color: 'orange' },
    { id: 'achieve', icon: '🏆', title: 'ACHIEVEMENT SYSTEM', desc: 'Unlock exclusive badges, earn XP points, and level up your fitness journey with real-time progress tracking', color: 'yellow' },
    { id: 'nutrition', icon: '🥗', title: 'NUTRITION TRACKING', desc: 'Track meals, calories, and macros with smart food recognition', color: 'green' }
  ]), []);

  // Quick stats (personalized) - Use RealTimeContext stats like Dashboard/Analytics
  const realTimeCurrentStreak = getRealTimeStreak(currentStreak, stats?.currentStreak);
  
  // Recalculate stats when refreshTrigger changes
  const totalWorkouts = useMemo(() => {
    return stats?.totalWorkouts ?? 0;
  }, [stats?.totalWorkouts, refreshTrigger]);
  
  const todayWorkouts = useMemo(() => {
    return stats?.todayWorkouts ?? 0;
  }, [stats?.todayWorkouts, refreshTrigger]);
  
  console.log('🏠 HOME: RealTime stats (trigger:', refreshTrigger, '):', { 
    totalWorkouts, 
    todayWorkouts, 
    currentXP: currentXP || 0, 
    achievements: `${unlockedCount}/${totalCount}`,
    completionPercentage: Math.round(completionPercentage || 0),
    stats 
  });

  const quickStats = [
    {
      label: "Total Workouts",
      value: totalWorkouts,
      icon: '💪',
      color: 'blue',
      path: '/workouts',
      subtitle: totalWorkouts > 0 ? `${totalWorkouts} completed!` : 'Start your first workout'
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
  ];

  const globalStats = [
    { value: '15K+', label: 'ELITE ATHLETES', sublabel: 'WORLDWIDE', color: 'blue', icon: '🌍' },
    { value: '125K+', label: 'WORKOUTS', sublabel: 'COMPLETED', color: 'purple', icon: '💪' },
    { value: '85K+', label: 'GOALS', sublabel: 'ACHIEVED', color: 'green', icon: '🎯' },
    { value: '4.9★', label: 'APP RATING', sublabel: 'EXCELLENCE', color: 'yellow', icon: '⭐' }
  ];

  /* --------------------------
     Clock + scrolling + live-users simulation
     -------------------------- */
  useEffect(() => {
    mountedRef.current = true;
    
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    const live = setInterval(() => {
      setLiveUsers(prev => {
        const delta = Math.floor(Math.random() * 10) - 4;
        const next = Math.max(100, prev + delta);
        return next;
      });
    }, 5000);

    const handleScroll = () => {
      const scrolled = window.scrollY || 0;
      setScrollY(scrolled);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      mountedRef.current = false;
      clearInterval(t);
      clearInterval(live);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  /* --------------------------
     Intersection observer for reveal animations
     -------------------------- */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const id = entry.target.getAttribute('data-id') || entry.target.id;
          if (!id) return;
          setIsVisible(prev => ({ ...prev, [id]: entry.isIntersecting }));
        });
      },
      { threshold: 0.12 }
    );

    // observe elements having data-animate attribute
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach(el => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  /* --------------------------
     Auto-rotate feature cards (with pause on hover)
     -------------------------- */
  useEffect(() => {
    let id;
    const startRotation = () => {
      id = setInterval(() => {
        setActiveFeature(prev => (prev + 1) % features.length);
      }, 4200);
    };
    
    startRotation();
    
    return () => {
      if (id) clearInterval(id);
    };
  }, [features.length]);

  /* --------------------------
     Listen for real-time streak / workout events (custom events)
     -------------------------- */
  useEffect(() => {
    const onStreak = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      if (detail.type === 'STREAK_UPDATED') {
        const newStreak = detail.currentStreak ?? realTimeCurrentStreak;
        setNotification({ type: 'streak', message: `🔥 Day ${newStreak} Streak Active! Keep it up!` });
        setTimeout(() => setNotification(null), 4200);
      }
    };

    const onWorkout = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      const msg = detail.savedOffline
        ? `🎉 ${detail.exercise} completed! (Saved offline)`
        : `🎉 ${detail.exercise} completed in ${detail.duration || '—'}!`;
      setNotification({ type: 'workout', message: msg });
      // Refresh achievements/stats
      try { checkAchievements(); } catch (err) { /* ignore */ }
      // Force re-render to update workout stats
      setRefreshTrigger(prev => prev + 1);
      setCurrentTime(new Date());
      setTimeout(() => setNotification(null), 4200);
    };

    // Listen for real-time workout updates
    const onRealTimeStatsUpdate = (event) => {
      console.log('🏠 HOME: Real-time stats update received:', event.detail);
      // Force component re-render to get fresh workout stats
      setRefreshTrigger(prev => prev + 1);
      setCurrentTime(new Date());
    };
    
    window.addEventListener('homeStreakUpdate', onStreak);
    window.addEventListener('streakUpdated', onStreak);
    window.addEventListener('workoutCompleted', onWorkout);
    window.addEventListener('realTimeStatsUpdate', onRealTimeStatsUpdate);
    window.addEventListener('analyticsWorkoutUpdate', onRealTimeStatsUpdate);

    return () => {
      window.removeEventListener('homeStreakUpdate', onStreak);
      window.removeEventListener('streakUpdated', onStreak);
      window.removeEventListener('workoutCompleted', onWorkout);
      window.removeEventListener('realTimeStatsUpdate', onRealTimeStatsUpdate);
      window.removeEventListener('analyticsWorkoutUpdate', onRealTimeStatsUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkAchievements, realTimeCurrentStreak]);

  /* --------------------------
     Handle location state (when redirected after a workout)
     -------------------------- */
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted) {
      const message = workoutState.savedOffline
        ? `🎉 ${workoutState.exercise} completed! (Saved offline)`
        : `🎉 ${workoutState.exercise} completed in ${workoutState.duration || '—'}!`;
      setNotification({ message, type: 'workout' });
      try { checkAchievements(); } catch (err) {}
      // clear history state so message doesn't reappear
      navigate(location.pathname, { replace: true });
      setTimeout(() => setNotification(null), 4200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  /* --------------------------
     Loading completion handler
     -------------------------- */
  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  /* --------------------------
     Small: accessible navigation helper for buttons
     -------------------------- */
  const handleNav = (path) => navigate(path);

  /* --------------------------
    Small animated count-up hook (in-file)
  --------------------------- */
  function useCountUp(value, duration = 600) {
    const [display, setDisplay] = useState(value);
    const rafRef = useRef(null);
    const startRef = useRef(null);
    const fromRef = useRef(value);

    useEffect(() => {
      cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      startRef.current = start;
      fromRef.current = Number(display) || 0;
      const target = Number(value) || 0;
      const delta = target - fromRef.current;

      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        const next = Math.round(fromRef.current + delta * eased);
        setDisplay(next);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };
      rafRef.current = requestAnimationFrame(step);
      return () => cancelAnimationFrame(rafRef.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, duration]);

    return display;
  }

  /* Render subcomponents inside file (keeps single-file deliverable) */
  const StatCard = ({ stat }) => {
    const c = colorClasses[stat.color] || colorClasses.blue;
    const numericValue = typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0;
    const count = useCountUp(numericValue, 500);

    return (
      <button
        onClick={() => handleNav(stat.path)}
        aria-label={`Open ${stat.label}`}
        className="relative group transform transition-all duration-500 text-left w-full hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      >
        {/* Glow Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br ${c.bg}/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
        
        {/* Main Card */}
        <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl group-hover:border-white/20 group-hover:shadow-3xl transition-all duration-500">
          {/* Icon and Value Section */}
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className={`flex items-center justify-center rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-gradient-to-br ${c.bgSoft} border ${c.border} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <div className="text-xl sm:text-2xl lg:text-3xl">{stat.icon}</div>
            </div>
            
            {/* Live Indicator */}
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${c.text} bg-gradient-to-r ${c.bgSoft} border ${c.border}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isOnline && stats?.isRealTime ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                {isOnline && stats?.isRealTime ? 'LIVE' : 'OFF'}
              </span>
            </div>
          </div>
          
          {/* Stats Display */}
          <div className="space-y-1 sm:space-y-2">
            <div className={`text-xl sm:text-2xl lg:text-3xl font-black text-white ${stat.label === 'Current Streak' && realTimeCurrentStreak > 0 ? 'animate-pulse' : ''} group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:${c.text.replace('text-', 'from-')} group-hover:to-white transition-all duration-300`}>
              {typeof stat.value === 'number' ? count : stat.value}
              {stat.label === 'Current Streak' && realTimeCurrentStreak > 0 && <span className="ml-1 sm:ml-2 animate-bounce">🔥</span>}
            </div>
            
            <div className="text-xs sm:text-sm font-semibold text-slate-300 group-hover:text-white transition-colors duration-300">
              {stat.label}
            </div>
            
            <div className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-300 line-clamp-1">
              {stat.subtitle}
            </div>
          </div>
          
          {/* Action Arrow */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 text-slate-500 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Decorative Elements */}
          <div className={`absolute -top-2 -right-2 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${c.bg}/10 rounded-full blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />
        </div>
      </button>
    );
  };

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
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary Gradient Orbs */}
        <div className="absolute -top-64 -right-64 w-[800px] h-[800px] bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-transparent rounded-full blur-3xl animate-slow-pulse" />
        <div 
          className="absolute -top-32 left-1/2 transform -translate-x-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-purple-500/8 via-pink-500/5 to-transparent rounded-full blur-3xl animate-slow-pulse" 
          style={{ animationDelay: '2s' }} 
        />
        <div 
          className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-to-bl from-orange-500/8 via-red-500/5 to-transparent rounded-full blur-3xl animate-slow-pulse" 
          style={{ animationDelay: '4s' }} 
        />
        
        {/* Secondary Accent Orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-green-500/6 to-teal-500/4 rounded-full blur-2xl animate-slow-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-gradient-to-l from-yellow-500/8 to-orange-500/6 rounded-full blur-2xl animate-slow-pulse" style={{ animationDelay: '3s' }} />
        
        {/* Animated Particles */}
        <div className="absolute top-32 left-16 w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce opacity-60" />
        <div className="absolute top-64 right-32 w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-ping opacity-50" />
        <div className="absolute bottom-48 left-1/4 w-4 h-4 bg-gradient-to-r from-green-400 to-teal-400 rounded-full animate-pulse opacity-40" />
        <div className="absolute top-1/2 right-16 w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-32 right-1/4 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '2.5s' }} />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Hero (parallax) */}
      <div className="relative" style={{ transform: `translateY(${Math.max(-200, Math.min(200, scrollY * 0.4))}px)` }}>
        <Hero />
      </div>

      <div className={`container mx-auto px-3 sm:px-4 py-3 sm:py-4 relative z-10 transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'} space-y-6 sm:space-y-8`}>
        {/* Enhanced Status Bar */}
        <section data-animate data-id="status-bar" id="status-bar" className="mb-6 sm:mb-10">
          <div className={`transition-all duration-700 transform ${isVisible['status-bar'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl sm:rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              
              {/* Main Card */}
              <div className="relative bg-gradient-to-r from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="relative">
                        <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-500'} shadow-lg`} />
                        {isOnline && <div className="absolute inset-0 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-green-400 animate-ping opacity-75" />}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-white tracking-wider">
                        {isOnline ? '🟢 LIVE SYNC' : '🔴 OFFLINE'}
                      </span>
                    </div>

                    {/* Real-time Clock */}
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 text-base sm:text-lg">⏰</span>
                      <div className="text-xs sm:text-sm text-white font-mono bg-slate-800/50 px-2 sm:px-3 py-1 rounded-lg border border-slate-700/50" aria-live="polite">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>

                    {/* Server Status */}
                    <div className="hidden md:flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 font-semibold">Server Online</span>
                      </div>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-400">Latency: <span className="text-green-400 font-semibold">12ms</span></span>
                    </div>
                  </div>

                  {/* Live Users Counter */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2">
                      <span className="text-blue-400 text-lg sm:text-xl animate-pulse">👥</span>
                      <div className="flex flex-col">
                        <span className="font-black text-white text-sm sm:text-lg tabular-nums">{liveUsers.toLocaleString()}</span>
                        <span className="text-xs text-blue-300 font-medium hidden sm:block">ELITE ATHLETES ONLINE</span>
                        <span className="text-xs text-blue-300 font-medium sm:hidden">ONLINE</span>
                      </div>
                    </div>
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full animate-ping shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Quick Stats */}
        <section data-animate data-id="quick-stats" id="quick-stats" className="mb-10 sm:mb-16">
          <div className={`transition-all duration-700 delay-150 transform ${isVisible['quick-stats'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="text-center mb-6 sm:mb-10">
              <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
                <span className="text-xs font-bold tracking-[0.2em] sm:tracking-[0.3em] text-blue-400 uppercase">Performance Dashboard</span>
                <div className="w-8 sm:w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-3 sm:mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-200">
                  YOUR
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 ml-2 sm:ml-3">
                  STATUS
                </span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
                Real-time performance metrics, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">personalized for champions</span>
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
                      src="/Home1.jpg" 
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
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-2xl" />
                    
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
                    
                    <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
                      Experience world-class training with <span className="text-blue-400 font-bold">state-of-the-art equipment</span> designed for elite performance. Every rep counts towards your transformation into a champion.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => handleNav('/workouts')}
                        className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 text-white font-black rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10">Start Elite Training</span>
                        <span className="relative z-10 text-xl">🏋️</span>
                      </button>
                      
                      <button className="inline-flex items-center gap-2 px-6 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all duration-300">
                        <span>View Equipment</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Global Community Stats */}
        <section data-animate data-id="global-stats" id="global-stats" className="mb-16">
          <div className={`transition-all duration-700 delay-450 transform ${isVisible['global-stats'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
                <span className="text-xs font-bold tracking-[0.3em] text-green-400 uppercase">Global Network</span>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-green-200 to-teal-200">
                  GLOBAL COMMUNITY
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-green-200 to-blue-200 ml-3">
                  STATS
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Join thousands of <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400 font-semibold">elite athletes worldwide</span>
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {globalStats.map((s, i) => <GlobalStat key={`global-${i}`} stat={s} />)}
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
                    
                    <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
                      Push beyond your limits with <span className="text-red-400 font-bold">intense strength training</span>. Build raw power, explosive strength, and unstoppable determination that defines champions.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => handleNav('/workouts')}
                        className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 text-white font-black rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-red-500/25"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10">Activate Beast Mode</span>
                        <span className="relative z-10 text-xl">💪</span>
                      </button>
                      
                      <button className="inline-flex items-center gap-2 px-6 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all duration-300">
                        <span>Power Programs</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative h-80 sm:h-96 lg:h-[500px] overflow-hidden order-1 lg:order-2">
                    <img 
                      src="/Home2.jpg" 
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
                      src="/Home3.jpg" 
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
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full blur-2xl" />
                    
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
                    
                    <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
                      Sculpt <span className="text-emerald-400 font-bold">massive muscle gains</span> with scientifically-proven hypertrophy training. Transform your physique with precision muscle-building protocols.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => handleNav('/workouts')}
                        className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 via-teal-600 to-green-600 text-white font-black rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-teal-500 to-green-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10">Build Muscle Elite</span>
                        <span className="relative z-10 text-xl">🏃‍♂️</span>
                      </button>
                      
                      <button className="inline-flex items-center gap-2 px-6 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all duration-300">
                        <span>Muscle Programs</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
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
                    <div className="absolute -top-20 -left-20 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl" />
                    
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
                    
                    <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
                      Master <span className="text-purple-400 font-bold">functional movements</span> that translate to real-world performance. Train your body to move with purpose, power, and precision.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => handleNav('/workouts')}
                        className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-black rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10">Train Functional</span>
                        <span className="relative z-10 text-xl">🎯</span>
                      </button>
                      
                      <button className="inline-flex items-center gap-2 px-6 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all duration-300">
                        <span>Movement Patterns</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="relative h-80 sm:h-96 lg:h-[500px] overflow-hidden order-1 lg:order-2">
                    <img 
                      src="/Home4.jpg" 
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
                      src="/Home5.jpg" 
                      alt="Elite Community" 
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 filter brightness-110 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/40 via-transparent to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Premium Overlay Stats */}
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="flex items-center justify-between">
                        <div className="bg-black/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
                          <div className="text-yellow-400 text-xs font-bold">MEMBERS</div>
                          <div className="text-white text-lg font-black">15K+</div>
                        </div>
                        <div className="bg-black/70 backdrop-blur-xl rounded-xl px-4 py-2 border border-white/10">
                          <div className="text-orange-400 text-xs font-bold">RATING</div>
                          <div className="text-white text-lg font-black">4.9★</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center relative">
                    {/* Premium Decorative Elements */}
                    <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-bl from-yellow-500/10 to-transparent rounded-full blur-2xl" />
                    
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
                    
                    <p className="text-slate-300 text-lg leading-relaxed mb-8 font-medium">
                      Connect with <span className="text-yellow-400 font-bold">elite athletes worldwide</span>. Share victories, push limits together, and become part of the ultimate fitness community that breeds champions.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => handleNav('/achievements')}
                        className="group/btn relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 text-white font-black rounded-xl overflow-hidden transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10">Join Elite Club</span>
                        <span className="relative z-10 text-xl">🏆</span>
                      </button>
                      
                      <button className="inline-flex items-center gap-2 px-6 py-4 border border-white/20 text-white font-bold rounded-xl hover:bg-white/5 transition-all duration-300">
                        <span>View Community</span>
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* Progress Tracking Features */}
        <section data-animate data-id="progress" id="progress" className="mb-16 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-slow-pulse" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-tr from-blue-500/10 via-cyan-500/10 to-green-500/10 rounded-full blur-3xl animate-slow-pulse" style={{ animationDelay: '2s' }} />
          </div>
          <div className={`transition-all duration-700 delay-500 transform ${isVisible['progress'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white mb-2">PROGRESS TRACKING</h2>
              <p className="text-sm sm:text-base text-slate-400">Advanced analytics to monitor your fitness journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {[
                {
                  name: "Sarah M.",
                  achievement: "Lost 30lbs in 4 months",
                  quote: "The real-time tracking kept me motivated every single day. Best fitness app I've ever used!",
                  streak: 127,
                  workouts: 89,
                  avatar: "👩‍💼"
                },
                {
                  name: "Mike R.",
                  achievement: "Gained 15lbs muscle",
                  quote: "The analytics helped me optimize my workouts. I can see exactly what works for my body.",
                  streak: 95,
                  workouts: 156,
                  avatar: "👨‍💻"
                },
                {
                  name: "Alex K.",
                  achievement: "Marathon PR: 3:15",
                  quote: "The streak system is addictive in the best way. 200+ days and counting!",
                  streak: 203,
                  workouts: 278,
                  avatar: "🏃‍♂️"
                }
              ].map((story, i) => (
                <div key={i} className="relative group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 h-full flex flex-col">
                  {/* Card Background with Gradient Border */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                  <div className="absolute inset-0.5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl" />
                  
                  {/* Main Card Content */}
                  <div className="relative bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex-1 flex flex-col group-hover:border-white/20 transition-all duration-500">
                    {/* Verified Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-400/30 rounded-full">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-green-400 font-medium">VERIFIED</span>
                      </div>
                    </div>

                    {/* Profile Section */}
                    <div className="flex items-start gap-4 mb-6">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center text-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                        {story.avatar}
                        <div className="absolute inset-0 bg-white/10 rounded-2xl" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-purple-200 transition-all duration-300">
                          {story.name}
                        </h3>
                        <p className="text-slate-400 text-sm mb-2">Elite Athlete</p>
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg">
                          <span>🏆</span>
                          {story.achievement}
                        </div>
                      </div>
                    </div>

                    {/* Quote */}
                    <blockquote className="text-slate-200 leading-relaxed mb-6 text-sm group-hover:text-white transition-colors duration-300 relative flex-1">
                      <span className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 absolute -top-2 -left-2 font-serif">"</span>
                      <span className="relative z-10 italic">{story.quote}</span>
                    </blockquote>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, idx) => (
                        <span key={idx} className="text-yellow-400 text-lg animate-pulse" style={{ animationDelay: `${idx * 0.1}s` }}>⭐</span>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-auto">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <span className="text-orange-400 text-lg">🔥</span>
                          <span className="text-white font-bold text-sm">{story.streak}</span>
                          <span className="text-slate-400 text-xs">days</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-blue-400 text-lg">💪</span>
                          <span className="text-white font-bold text-sm">{story.workouts}</span>
                          <span className="text-slate-400 text-xs">workouts</span>
                        </div>
                      </div>
                      
                      {/* Floating Action */}
                      <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 px-3 py-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full text-xs font-bold text-white shadow-lg hover:scale-110 active:scale-95">
                        View Story
                      </button>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 rounded-full blur-xl opacity-15 group-hover:opacity-30 transition-opacity duration-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Quick Actions */}
        <section data-animate data-id="quick-actions" id="quick-actions" className="mb-16">
          <div className={`transition-all duration-700 delay-550 transform ${isVisible['quick-actions'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
                <span className="text-xs font-bold tracking-[0.3em] text-orange-400 uppercase">Quick Access</span>
                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-yellow-200">
                  QUICK
                </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 ml-3">
                  ACTIONS
                </span>
              </h2>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
                Jump straight into your <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 font-semibold">fitness routine</span>
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: '📋', label: 'My Plans', path: '/my-plans', color: 'blue' },
                { icon: '📊', label: 'View Progress', path: '/analytics', color: 'purple' },
                { icon: '🥗', label: 'Log Meal', path: '/nutrition', color: 'green' },
                { icon: '📚', label: 'Exercise Library', path: '/library', color: 'orange' }
              ].map((action, i) => {
                const c = colorClasses[action.color] || colorClasses.blue;
                return (
                  <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className="relative group transform transition-all duration-500 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${c.bg}/20 rounded-2xl sm:rounded-3xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
                    
                    {/* Main Card */}
                    <div className={`relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 text-center shadow-2xl group-hover:border-white/20 group-hover:shadow-3xl transition-all duration-500`}>
                      {/* Icon */}
                      <div className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${c.bgSoft} border ${c.border} shadow-lg mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110`}>
                        <span className="text-2xl sm:text-3xl">{action.icon}</span>
                      </div>
                      
                      {/* Label */}
                      <div className={`${c.text} font-bold text-xs sm:text-sm group-hover:text-white transition-colors duration-300`}>
                        {action.label}
                      </div>
                      
                      {/* Decorative Elements */}
                      <div className={`absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br ${c.bg}/10 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>



        {/* Equipment Tracking */}
        <section data-animate data-id="equipment" id="equipment" className="mb-12 relative z-20">
          <div className={`transition-all duration-700 delay-750 transform ${isVisible['equipment'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-white mb-2">EQUIPMENT TRACKING</h2>
              <p className="text-sm sm:text-base text-slate-400">Track workouts with any equipment • From home to commercial gym</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[
                { name: 'Barbells', icon: '🏋️', count: '50+ exercises' },
                { name: 'Dumbbells', icon: '💪', count: '80+ exercises' },
                { name: 'Machines', icon: '⚙️', count: '120+ exercises' },
                { name: 'Cardio', icon: '🏃', count: '30+ exercises' },
                { name: 'Bodyweight', icon: '🤸', count: '60+ exercises' },
                { name: 'Cables', icon: '🔗', count: '40+ exercises' }
              ].map((equipment, i) => (
                <div key={i} className="group p-6 bg-slate-800/50 border border-slate-700/30 rounded-2xl hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-300 text-center relative z-30">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{equipment.icon}</div>
                  <h3 className="text-white font-bold text-sm mb-1">{equipment.name}</h3>
                  <p className="text-slate-400 text-xs">{equipment.count}</p>
                </div>
              ))}
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

      {/* Enhanced Notification System */}
      {notification && (
        <div className="fixed top-4 sm:top-20 right-4 z-50 max-w-xs sm:max-w-sm animate-in slide-in-from-right duration-300" role="status" aria-live="polite">
          <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-2xl border backdrop-blur-sm transform transition-all duration-300 hover:scale-105 ${
            notification.type === 'workout' 
              ? 'bg-green-600/95 border-green-400 text-white' 
              : notification.type === 'streak' 
              ? 'bg-orange-600/95 border-orange-400 text-white' 
              : 'bg-blue-600/95 border-blue-400 text-white'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-xl sm:text-2xl flex-shrink-0 animate-bounce">
                {notification.type === 'workout' ? '🎉' : notification.type === 'streak' ? '🔥' : '✨'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs sm:text-sm leading-tight">{notification.message}</div>
                <div className="text-xs opacity-75 mt-1">Just now</div>
              </div>
              <button 
                onClick={() => setNotification(null)} 
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-all duration-200 flex-shrink-0" 
                aria-label="Close notification"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Progress bar for auto-dismiss */}
            <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full animate-pulse" style={{ width: '100%', animation: 'shrink 4200ms linear forwards' }} />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced CSS animations */}
      <style>
        {`
          @keyframes slow-pulse {
            0% { transform: scale(1) rotate(0deg); opacity: 0.8; }
            25% { transform: scale(1.02) rotate(0.5deg); opacity: 0.9; }
            50% { transform: scale(1.05) rotate(0deg); opacity: 1; }
            75% { transform: scale(1.02) rotate(-0.5deg); opacity: 0.9; }
            100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
          }
          .animate-slow-pulse { 
            animation: slow-pulse 12s ease-in-out infinite; 
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            33% { transform: translateY(-10px) rotate(1deg); }
            66% { transform: translateY(-5px) rotate(-1deg); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes shrink {
            from { width: 100%; }
            to { width: 0%; }
          }
          
          @keyframes animate-in {
            from {
              opacity: 0;
              transform: translateX(100%);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .animate-in {
            animation: animate-in 0.3s ease-out;
          }
          
          .slide-in-from-right {
            animation-name: animate-in;
          }
          
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
