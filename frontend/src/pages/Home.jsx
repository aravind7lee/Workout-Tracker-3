// Home.jsx
// Premium GymTracker Home - Professional Level UI/UX (Refactored & Enhanced)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { useStreak } from '../context/StreakContext';
import { useAchievements } from '../context/AchievementsContext';
import { useRealTimeWorkouts } from '../hooks/useRealTimeWorkouts';
import { getRealTimeStreak } from '../utils/streakUtils';
import Hero from '../components/Hero';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { stats, isOnline } = useRealTime();
  const { stats: workoutStats } = useRealTimeWorkouts();
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
  const [loadingProgress, setLoadingProgress] = useState(0);
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
    { id: 'achieve', icon: '🏆', title: 'ACHIEVEMENT SYSTEM', desc: 'Unlock exclusive badges and level up your fitness journey', color: 'yellow' },
    { id: 'nutrition', icon: '🥗', title: 'NUTRITION TRACKING', desc: 'Track meals, calories, and macros with smart food recognition', color: 'green' }
  ]), []);

  // Quick stats (personalized)
  const realTimeCurrentStreak = getRealTimeStreak(currentStreak, stats?.currentStreak);
  const todayWorkouts = workoutStats?.todayWorkouts ?? stats?.todayWorkouts ?? 0;

  const quickStats = [
    {
      label: "Today's Workouts",
      value: todayWorkouts,
      icon: '💪',
      color: 'blue',
      path: '/workouts',
      subtitle: todayWorkouts > 0 ? `${todayWorkouts} completed today!` : 'Start your first workout'
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
      path: '/dashboard',
      subtitle: currentXP > 0 ? `Level ${Math.floor(currentXP / 100) + 1}` : 'Earn XP by working out'
    },
    {
      label: 'Achievements',
      value: `${unlockedCount ?? 0}/${totalCount ?? 0}`,
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

  /* --------------------------
     Clock + scrolling + live-users simulation + premium loading
     -------------------------- */
  useEffect(() => {
    mountedRef.current = true;
    
    // Ultra-smooth 120fps loading with premium progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsLoading(false), 200);
          return 100;
        }
        return prev + 0.8;
      });
    }, 24); // 3000ms / 125 steps = 24ms per step (120fps)
    
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
      clearInterval(progressInterval);
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
      setTimeout(() => setNotification(null), 4200);
    };

    window.addEventListener('homeStreakUpdate', onStreak);
    window.addEventListener('streakUpdated', onStreak);
    window.addEventListener('workoutCompleted', onWorkout);

    return () => {
      window.removeEventListener('homeStreakUpdate', onStreak);
      window.removeEventListener('streakUpdated', onStreak);
      window.removeEventListener('workoutCompleted', onWorkout);
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
        className="relative group p-3 sm:p-4 rounded-2xl bg-slate-800/60 border border-slate-600/30 hover:shadow-xl hover:bg-slate-800/80 transform transition-all duration-300 text-left w-full hover:scale-105 active:scale-95"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex items-center justify-center rounded-lg p-2 sm:p-3 ${c.bgSoft} ${c.border ? c.border : ''}`}>
            <div className="text-xl sm:text-2xl">{stat.icon}</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-base sm:text-lg lg:text-2xl font-extrabold text-white ${stat.label === 'Current Streak' && realTimeCurrentStreak > 0 ? 'animate-pulse' : ''}`}>
              {typeof stat.value === 'number' ? count : stat.value}
              {stat.label === 'Current Streak' && realTimeCurrentStreak > 0 && <span className="ml-1">🔥</span>}
            </div>
            <div className="text-xs text-slate-400 truncate">{stat.label}</div>
            <div className="text-xs mt-1 text-green-400 line-clamp-1">{stat.subtitle}</div>
          </div>
        </div>

        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-xs">
          <span className={`inline-block px-1.5 py-0.5 sm:px-2 rounded text-xs ${c.text} font-semibold`}>
            {isOnline && stats?.isRealTime ? 'LIVE' : 'OFF'}
          </span>
        </div>

        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-slate-400 text-xs group-hover:text-white transition-colors">→</div>
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
        className={`relative p-4 sm:p-6 rounded-2xl border border-slate-700/40 bg-slate-900/50 backdrop-blur-sm transform transition-all duration-400 focus:outline-none focus:ring-2 cursor-pointer group ${isActive ? `${c.ring} scale-105 shadow-2xl bg-slate-800/70` : 'hover:scale-102 hover:bg-slate-800/60 hover:border-slate-600/60'}`}
      >
        <div className="mb-3 sm:mb-4 text-3xl sm:text-4xl transition-transform duration-300 group-hover:scale-110">{feature.icon}</div>
        <h3 className={`font-bold text-base sm:text-lg mb-2 ${c.text} transition-colors duration-300`}>{feature.title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed min-h-[40px] sm:min-h-[48px] group-hover:text-slate-300 transition-colors duration-300">{feature.desc}</p>

        {feature.title === 'STREAK MASTER' && (
          <div className="mt-3 sm:mt-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            <span className="text-xs text-orange-400 font-medium">Current: {realTimeCurrentStreak} days</span>
          </div>
        )}

        {/* Enhanced accent with better positioning */}
        <div className={`absolute -right-8 -top-8 w-32 h-32 sm:-right-10 sm:-top-10 sm:w-40 sm:h-40 rounded-full ${c.bgSoft} blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-400 pointer-events-none`} />
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full animate-ping" />
        )}
      </div>
    );
  };

  const GlobalStat = ({ stat }) => {
    const c = colorClasses[stat.color] || colorClasses.blue;
    return (
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-800/50 border border-slate-700/30 text-center hover:bg-slate-800/70 hover:border-slate-600/50 transition-all duration-300 group">
        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 transition-transform duration-300 group-hover:scale-110">{stat.icon}</div>
        <div className={`text-xl sm:text-2xl font-extrabold ${c.text} mb-1 transition-colors duration-300`}>{stat.value}</div>
        <div className="text-white font-semibold text-xs sm:text-sm mb-1">{stat.label}</div>
        <div className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors duration-300">{stat.sublabel}</div>
      </div>
    );
  };

  /* --------------------------
     Main render
     -------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* PREMIUM GYM LOADING SCREEN */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900">
          <div className="text-center px-8">
            {/* Logo Container */}
            <div className="relative mb-8">
              {/* Glow Effect */}
              <div className="absolute inset-0 -m-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-red-500/20 rounded-full blur-2xl animate-pulse" />
              
              {/* Logo */}
              <img 
                src="/logo.png" 
                alt="Workout Tracker Logo" 
                className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto object-contain filter drop-shadow-2xl"
                style={{ 
                  filter: `brightness(1.3) contrast(1.2) drop-shadow(0 0 20px rgba(59,130,246,0.4))`,
                  transform: `scale(${0.8 + (loadingProgress / 100) * 0.3})`
                }}
                onLoad={() => console.log('Logo loaded successfully')}
              />
              
              {/* Orbiting Dots */}
              <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-6" />
                <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-red-400 rounded-full transform -translate-x-1/2 translate-y-6" />
                <div className="absolute left-0 top-1/2 w-2 h-2 bg-green-400 rounded-full transform -translate-x-6 -translate-y-1/2" />
                <div className="absolute right-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full transform translate-x-6 -translate-y-1/2" />
              </div>
            </div>
            
            {/* Loading Text */}
            <div className="mb-6">
              <div className="text-white text-xl sm:text-2xl font-black mb-2" style={{
                textShadow: '0 0 20px rgba(255,255,255,0.5)'
              }}>
                🔥 UNLEASHING BEAST MODE 🔥
              </div>
              
              <div className="text-slate-400 text-sm font-medium tracking-wide">
                {loadingProgress < 25 && '🔥 Igniting Power Systems...'}
                {loadingProgress >= 25 && loadingProgress < 50 && '💪 Calibrating Strength Metrics...'}
                {loadingProgress >= 50 && loadingProgress < 75 && '🎯 Optimizing Performance Engine...'}
                {loadingProgress >= 75 && loadingProgress < 95 && '🚀 Finalizing Elite Protocols...'}
                {loadingProgress >= 95 && '✨ Ready to Dominate!'}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-72 sm:w-80 mx-auto">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 rounded-full transition-all duration-100 ease-out relative"
                  style={{ width: `${loadingProgress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
              
              <div className="flex justify-between items-center mt-3 text-xs font-mono">
                <span className="text-slate-500">PROGRESS</span>
                <span className="text-white font-bold text-base">
                  {Math.round(loadingProgress)}%
                </span>
                <span className="text-slate-500">ELITE</span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-44 -right-36 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl animate-slow-pulse" />
        <div 
          className="absolute -bottom-44 -left-36 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl animate-slow-pulse" 
          style={{ animationDelay: '2s' }} 
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-slow-pulse" 
          style={{ animationDelay: '3.5s' }} 
        />

        {/* particles */}
        <div className="absolute top-24 left-12 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce" />
        <div className="absolute top-48 right-24 w-1 h-1 bg-purple-400/40 rounded-full animate-ping" />
        <div className="absolute bottom-36 left-1/4 w-3 h-3 bg-green-400/20 rounded-full animate-pulse" />
      </div>

      {/* Hero (parallax) */}
      <div className="relative" style={{ transform: `translateY(${Math.max(-200, Math.min(200, scrollY * 0.4))}px)` }}>
        <Hero />
      </div>

      <div className={`container mx-auto px-4 py-8 relative z-10 transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {/* Status Bar */}
        <section data-animate data-id="status-bar" id="status-bar" className="mb-8">
          <div className={`transition-all duration-700 transform ${isVisible['status-bar'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="bg-gradient-to-r from-slate-800/80 via-slate-700/60 to-slate-800/80 backdrop-blur-xl border border-slate-600/20 rounded-2xl p-4 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm font-bold text-white">{isOnline ? 'LIVE' : 'OFFLINE'}</span>
                  </div>

                  <div className="text-sm text-slate-300 font-mono" aria-live="polite">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </div>

                  <div className="hidden sm:block text-xs text-slate-400">
                    Server: Online • Latency: 12ms
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-slate-300 flex items-center gap-2">
                    <span className="text-blue-400">👥</span>
                    <span className="font-bold text-blue-400 tabular-nums">{liveUsers.toLocaleString()}</span>
                    <span>users online</span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats - Always show for demo purposes */}
        <section data-animate data-id="quick-stats" id="quick-stats" className="mb-12">
          <div className={`transition-all duration-700 delay-150 transform ${isVisible['quick-stats'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white mb-2">YOUR ELITE STATUS</h2>
              <p className="text-sm sm:text-base text-slate-400">Real-time performance metrics, personalized for you</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickStats.map((stat, i) => (
                <StatCard key={`stat-${i}`} stat={stat} />
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section data-animate data-id="features" id="features" className="mb-12">
          <div className={`transition-all duration-700 delay-300 transform ${isVisible['features'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white mb-2">ELITE FITNESS FEATURES</h2>
              <p className="text-sm sm:text-base text-slate-400">Professional-grade tools for serious athletes</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">Real-time data synchronization</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {features.map((f, idx) => <FeatureCard key={f.id} feature={f} index={idx} />)}
            </div>
          </div>
        </section>

        {/* Global Community Stats */}
        <section data-animate data-id="global-stats" id="global-stats" className="mb-12">
          <div className={`transition-all duration-700 delay-450 transform ${isVisible['global-stats'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-white mb-2">GLOBAL COMMUNITY STATS</h2>
              <p className="text-sm sm:text-base text-slate-400">Join thousands of elite athletes worldwide</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {globalStats.map((s, i) => <GlobalStat key={`global-${i}`} stat={s} />)}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section data-animate data-id="cta" id="cta" className="text-center">
          <div className={`transition-all duration-700 delay-600 transform ${isVisible['cta'] ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-95'}`}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-green-100 to-white mb-4">READY TO DOMINATE?</h2>
            <p className="text-sm sm:text-base text-slate-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">Join the elite community of athletes who track their progress with precision and achieve extraordinary results.</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated() ? (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')} 
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 hover:scale-105 hover:shadow-2xl active:scale-95 transform transition-all duration-300 text-white shadow-xl"
                  >
                    🚀 GO TO DASHBOARD
                  </button>
                  <button 
                    onClick={() => navigate('/current-streak')} 
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 hover:scale-105 hover:shadow-2xl active:scale-95 transform transition-all duration-300 text-white shadow-xl"
                  >
                    🔥 CHECK STREAK ({realTimeCurrentStreak})
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/register')} 
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:scale-105 hover:shadow-2xl active:scale-95 transform transition-all duration-300 text-white shadow-xl"
                  >
                    🎆 START YOUR JOURNEY
                  </button>
                  <button 
                    onClick={() => navigate('/login')} 
                    className="px-6 sm:px-8 py-3 sm:py-4 rounded-2xl text-base sm:text-lg font-bold border border-slate-700 text-white hover:scale-105 hover:bg-slate-800/50 hover:border-slate-600 active:scale-95 transform transition-all duration-300"
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
            0% { transform: scale(1); opacity: 0.85; }
            50% { transform: scale(1.03); opacity: 1; }
            100% { transform: scale(1); opacity: 0.85; }
          }
          .animate-slow-pulse { 
            animation: slow-pulse 8s ease-in-out infinite; 
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
