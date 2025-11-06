// Home.jsx - Ultra Performance Optimized
import React, { useState, useEffect, useRef, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';

import { forceStatsRefresh } from '../utils/forceStatsRefresh';
import Hero from '../components/Hero';
import LoadingScreen from '../components/LoadingScreen';

// Lazy load images
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



  // Optimized features list
  const features = useMemo(() => ([
    { id: 'workout', icon: '🏋️', title: 'WORKOUT DOMINATION', desc: 'AI-powered training with real-time form analysis', color: 'blue' },
    { id: 'analytics', icon: '📊', title: 'PROGRESS ANALYTICS', desc: 'Advanced metrics with predictive insights', color: 'purple' },
    { id: 'goals', icon: '🎯', title: 'GOAL CRUSHING', desc: 'Smart goal setting with achievement tracking', color: 'green' },
    { id: 'nutrition', icon: '🥗', title: 'NUTRITION TRACKING', desc: 'Track meals, calories, and macros', color: 'green' }
  ]), []);

  const totalWorkouts = useMemo(() => {
    if (!isAuthenticated() || !auth?.user) {
      return 0;
    }
    const count = stats?.totalWorkouts ?? 0;
    return count > 0 ? count : 0;
  }, [stats?.totalWorkouts, refreshTrigger, isAuthenticated, auth?.user]);
  
  const todayWorkouts = useMemo(() => {
    if (!isAuthenticated() || !auth?.user) {
      return 0;
    }
    const count = stats?.todayWorkouts ?? 0;
    return count > 0 ? count : 0;
  }, [stats?.todayWorkouts, refreshTrigger, isAuthenticated, auth?.user]);

  // Optimized quick stats - USER SPECIFIC
  const quickStats = useMemo(() => {
    if (!isAuthenticated() || !auth?.user) {
      return [
        {
          label: "Total Workouts",
          value: 0,
          icon: '💪',
          color: 'blue',
          path: '/login',
          subtitle: 'Login to track your workouts'
        },
      ];
    }
    
    return [
      {
        label: "Total Workouts",
        value: totalWorkouts,
        icon: '💪',
        color: 'blue',
        path: '/workouts',
        subtitle: totalWorkouts > 0 ? `${totalWorkouts} completed!` : 'No workouts yet - Start your journey!'
      },
    ];
  }, [totalWorkouts, isAuthenticated, auth?.user]);

  const globalStats = useMemo(() => [
    { value: '15K+', label: 'ELITE ATHLETES', sublabel: 'WORLDWIDE', color: 'blue', icon: '🌍' },
    { value: '125K+', label: 'WORKOUTS', sublabel: 'COMPLETED', color: 'purple', icon: '💪' },
    { value: '85K+', label: 'GOALS', sublabel: 'ACHIEVED', color: 'green', icon: '🎯' },
    { value: '4.9★', label: 'APP RATING', sublabel: 'EXCELLENCE', color: 'yellow', icon: '⭐' }
  ], []);

  // Optimized timer management
  useEffect(() => {
    mountedRef.current = true;
    
    timersRef.current.time = setInterval(() => {
      if (mountedRef.current) {
        setCurrentTime(new Date());
      }
    }, 5000);
    
    timersRef.current.liveUsers = setInterval(() => {
      if (mountedRef.current) {
        setLiveUsers(prev => {
          const delta = Math.floor(Math.random() * 6) - 2;
          return Math.max(100, prev + delta);
        });
      }
    }, 10000);

    return () => {
      mountedRef.current = false;
      Object.values(timersRef.current).forEach(timer => clearInterval(timer));
    };
  }, []);

  // Ultra-optimized intersection observer with passive listeners
  useEffect(() => {
    const observerOptions = {
      threshold: 0.05,
      rootMargin: '100px 0px'
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        requestAnimationFrame(() => {
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
        });
      },
      observerOptions
    );

    const timeoutId = setTimeout(() => {
      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach(el => observerRef.current?.observe(el));
    }, 50);

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
    }, 5000);

    return () => {
      if (timersRef.current.features) {
        clearInterval(timersRef.current.features);
      }
    };
  }, [features.length]);

  // Optimized event listeners
  useEffect(() => {
    const handleWorkoutComplete = (e) => {
      const detail = e?.detail;
      if (!detail || !mountedRef.current) return;
      
      const msg = detail.savedOffline
        ? `🎉 ${detail.exercise} completed! (Saved offline)`
        : `🎉 ${detail.exercise} completed!`;
      setNotification({ type: 'workout', message: msg });
      
      setRefreshTrigger(prev => prev + 1);
      setTimeout(() => mountedRef.current && setNotification(null), 3000);
    };

    const handleStatsUpdate = () => {
      if (mountedRef.current) {
        setRefreshTrigger(prev => prev + 1);
      }
    };
    
    const events = [
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
  }, []);

  // Clean fake data on mount - USER SPECIFIC
  useEffect(() => {
    if (!isAuthenticated() || !auth?.user) {
      console.log('🔒 No authenticated user - skipping workout cleanup');
      return;
    }
    
    try {
      const currentUser = auth.user;
      const workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
      
      const realUserWorkouts = workouts.filter(workout => {
        const isRealWorkout = workout.exercise && 
                             workout.exercise !== 'Workout' && 
                             workout.exercise !== 'Test Workout' &&
                             (workout.duration > 0 || workout.caloriesBurned > 0) &&
                             workout.completedAt &&
                             !workout.id?.includes('test_') &&
                             !workout.id?.includes('fake_') &&
                             !workout.id?.includes('demo_');
        
        const belongsToUser = workout.userId === currentUser.id || 
                             workout.userId === currentUser._id ||
                             (!workout.userId && isRealWorkout);
        
        return isRealWorkout && belongsToUser;
      });
      
      if (realUserWorkouts.length !== workouts.length) {
        const otherUsersWorkouts = workouts.filter(w => 
          w.userId && w.userId !== currentUser.id && w.userId !== currentUser._id
        );
        const allWorkouts = [...otherUsersWorkouts, ...realUserWorkouts];
        
        localStorage.setItem('workoutSync_workouts', JSON.stringify(allWorkouts));
        setRefreshTrigger(prev => prev + 1);
        console.log(`🧹 Cleaned fake workouts for user ${currentUser.id}: ${workouts.length} → ${realUserWorkouts.length} user workouts`);
      }
    } catch (error) {
      console.warn('Error cleaning fake workouts:', error);
    }
  }, [isAuthenticated, auth?.user]);

  // Handle location state
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted && mountedRef.current) {
      const message = workoutState.savedOffline
        ? `🎉 ${workoutState.exercise} completed! (Saved offline)`
        : `🎉 ${workoutState.exercise} completed!`;
      setNotification({ message, type: 'workout' });
      
      navigate(location.pathname, { replace: true });
      setTimeout(() => mountedRef.current && setNotification(null), 3000);
    }
  }, [location.state, navigate, location.pathname]);

  // Loading completion handler
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Navigation helper
  const handleNav = useCallback((path) => navigate(path), [navigate]);

  // Optimized count-up hook
  function useCountUp(value, duration = 400) {
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
        const eased = 1 - Math.pow(1 - progress, 2);
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

  // Optimized Image Component with lazy loading
  const OptimizedImage = React.memo(({ src, alt, className }) => (
    <img 
      src={src} 
      alt={alt} 
      loading="lazy"
      decoding="async"
      className={className}
      style={{ contentVisibility: 'auto' }}
    />
  ));

  // Optimized components
  const StatCard = React.memo(({ stat }) => {
    const numericValue = typeof stat.value === 'number' ? stat.value : parseInt(stat.value) || 0;
    const count = useCountUp(numericValue, 300);
    
    const isLocked = !isAuthenticated() || !auth?.user;

    return (
      <button
        onClick={() => handleNav(stat.path)}
        className="relative group transform transition-all duration-300 text-left w-full hover:translate-x-0.5 focus:outline-none focus:ring-2 focus:ring-lime-500"
      >
        <div className="relative bg-zinc-900 border-l-2 sm:border-l-8 border-lime-500 p-3 sm:p-8 shadow-2xl group-hover:bg-zinc-800 transition-all duration-300">
          <div className="flex items-start justify-between mb-3 sm:mb-6">
            <div className="flex items-center justify-center bg-black border border-lime-500 sm:border-2 p-1.5 sm:p-4">
              <div className="text-lg sm:text-3xl">{stat.icon}</div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 sm:px-4 sm:py-2 bg-black border sm:border-2 text-[9px] sm:text-xs font-black uppercase tracking-wide ${isLocked ? 'border-zinc-700 text-zinc-500' : (isOnline && stats?.isRealTime ? 'border-lime-500 text-lime-500' : 'border-zinc-700 text-zinc-500')}`}>
                <div className={`w-1 h-1 sm:w-2 sm:h-2 ${isLocked ? 'bg-zinc-500' : (isOnline && stats?.isRealTime ? 'bg-lime-500 animate-pulse' : 'bg-zinc-500')}`} />
                {isLocked ? 'LOCKED' : (isOnline && stats?.isRealTime ? 'LIVE' : 'OFFLINE')}
              </span>
            </div>
          </div>
          
          <div className="space-y-1.5 sm:space-y-3">
            <div className="text-2xl sm:text-5xl font-black text-white leading-none">
              {isLocked ? '🔒' : (typeof stat.value === 'number' ? count : stat.value)}
            </div>
            
            <div className="text-[10px] sm:text-sm font-black text-lime-500 uppercase tracking-wide sm:tracking-widest">
              {stat.label}
            </div>
            
            <div className="text-[10px] sm:text-sm text-zinc-400 font-medium leading-snug">
              {isLocked ? 'Login to view your stats' : stat.subtitle}
            </div>
            
            {process.env.NODE_ENV === 'development' && !isLocked && (
              <div className="text-[9px] sm:text-xs text-zinc-600 mt-1">
                Source: {stats?.dataSource || 'Unknown'}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  });

  const FeatureCard = ({ feature, index }) => {
    const isActive = index === activeFeature;
    return (
      <div
        onMouseEnter={() => setActiveFeature(index)}
        onFocus={() => setActiveFeature(index)}
        tabIndex={0}
        role="button"
        aria-pressed={isActive}
        className={`relative group cursor-pointer transform transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-lime-500 ${isActive ? 'translate-x-1' : 'hover:translate-x-0.5'}`}
      >
        <div className={`relative bg-zinc-900 border-l-4 p-4 sm:p-6 lg:p-8 shadow-2xl transition-all duration-300 ${isActive ? 'border-lime-500 bg-zinc-800' : 'border-zinc-700 hover:border-zinc-600'}`}>
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-black border-2 border-lime-500">
              <span className="text-2xl sm:text-3xl">{feature.icon}</span>
            </div>
          </div>
          
          <div className="space-y-2 sm:space-y-4">
            <h3 className={`font-black text-base sm:text-xl uppercase tracking-tight transition-all duration-300 ${isActive ? 'text-lime-500' : 'text-white group-hover:text-lime-500'}`}>
              {feature.title}
            </h3>
            
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-medium group-hover:text-zinc-300 transition-colors duration-300">
              {feature.desc}
            </p>
          </div>
          
          {isActive && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-lime-500" />
            </div>
          )}
        </div>
      </div>
    );
  };

  const GlobalStat = ({ stat }) => {
    return (
      <div className="relative group transform transition-all duration-300 hover:translate-y-[-2px]">
        <div className="relative bg-zinc-900 border-2 border-zinc-800 p-4 sm:p-6 lg:p-8 text-center shadow-2xl group-hover:border-lime-500 transition-all duration-300">
          <div className="mb-4 sm:mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-black border-2 border-lime-500">
              <span className="text-2xl sm:text-3xl">{stat.icon}</span>
            </div>
          </div>
          
          <div className="text-2xl sm:text-4xl lg:text-5xl font-black mb-2 sm:mb-3 text-white transition-all duration-300 group-hover:text-lime-500">
            {stat.value}
          </div>
          
          <div className="text-white font-black text-xs sm:text-sm uppercase tracking-widest mb-1 sm:mb-2">
            {stat.label}
          </div>
          
          <div className="text-zinc-500 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
            {stat.sublabel}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {isLoading && (
        <LoadingScreen onLoadingComplete={handleLoadingComplete} />
      )}

      <div className="relative">
        <Hero />
      </div>

      <div className={`container mx-auto px-2 sm:px-6 py-3 sm:py-8 relative z-10 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} space-y-6 sm:space-y-12`}>
        {/* Status Bar */}
        <section data-animate data-id="status-bar" className="mb-4 sm:mb-6">
          <div className={`transition-all duration-500 ${isVisible['status-bar'] ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ willChange: isVisible['status-bar'] ? 'auto' : 'transform, opacity' }}>
            <div className="relative bg-zinc-900 border border-zinc-800 sm:border-2 p-2.5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-2 sm:gap-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 ${isOnline ? 'bg-lime-500' : 'bg-red-600'} animate-pulse`} />
                  <span className="text-[10px] sm:text-xs font-black text-white tracking-wider uppercase">
                    {isOnline ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lime-500 text-xs sm:text-sm">⏱</span>
                  <div className="text-[10px] sm:text-xs text-white font-mono bg-black px-1.5 py-0.5 sm:px-2 sm:py-1 border border-zinc-800">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 bg-black border border-lime-500 sm:border-2 px-2 py-1 sm:px-6 sm:py-3">
                  <span className="text-lime-500 text-sm sm:text-lg">💪</span>
                  <div className="flex flex-col leading-none">
                    <span className="font-black text-white text-xs sm:text-lg tabular-nums">120+</span>
                    <span className="text-[8px] sm:text-xs text-lime-500 font-black tracking-wide">WORKOUTS</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section data-animate data-id="quick-stats" className="mb-6 sm:mb-16">
          <div className={`transition-all duration-500 delay-100 ${isVisible['quick-stats'] ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} style={{ willChange: isVisible['quick-stats'] ? 'auto' : 'transform, opacity' }}>
            <div className="text-center mb-4 sm:mb-10">
              <div className="inline-block mb-2 sm:mb-3">
                <div className="h-0.5 w-8 sm:h-1 sm:w-20 bg-lime-500 mb-2 sm:mb-3" />
              </div>
              <h2 className="text-xl sm:text-4xl md:text-5xl font-black mb-2 sm:mb-4 text-white uppercase tracking-tight px-3">
                {isAuthenticated() && auth?.user ? 'YOUR STATS' : 'GET STARTED'}
              </h2>
              <p className="text-xs sm:text-lg text-zinc-400 max-w-2xl mx-auto font-medium px-3 leading-snug">
                {isAuthenticated() && auth?.user 
                  ? 'Track your performance in real-time' 
                  : 'Login to start tracking your fitness journey'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-6 max-w-lg mx-auto px-3">
              {quickStats.map((stat, i) => (
                <StatCard key={`stat-${i}`} stat={stat} />
              ))}
            </div>
          </div>
        </section>

        {/* Elite Training Experience - Home1.jpg */}
        <section data-animate data-id="training-experience" id="training-experience" className="mb-6 sm:mb-20">
          <div className={`transition-all duration-700 delay-300 ${isVisible['training-experience'] ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ willChange: isVisible['training-experience'] ? 'auto' : 'transform, opacity' }}>
            <div className="relative group">
              <div className="relative overflow-hidden bg-zinc-900 border border-lime-500 sm:border-4 shadow-2xl" style={{ contain: 'layout style paint' }}>
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-[220px] sm:h-[400px] lg:h-[600px] overflow-hidden">
                    <OptimizedImage 
                      src={Home1} 
                      alt="Elite Training Experience" 
                      className="w-full h-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-8 sm:left-8 sm:right-8">
                      <div className="flex items-center gap-1 sm:gap-4">
                        <div className="bg-black/90 border border-lime-500 px-1.5 py-1 sm:px-6 sm:py-3 flex-1">
                          <div className="text-lime-500 text-[7px] sm:text-xs font-black tracking-wide uppercase leading-none">Equipment</div>
                          <div className="text-white text-[10px] sm:text-2xl font-black leading-tight mt-0.5">PRO</div>
                        </div>
                        <div className="bg-black/90 border border-white px-1.5 py-1 sm:px-6 sm:py-3 flex-1">
                          <div className="text-white text-[7px] sm:text-xs font-black tracking-wide uppercase leading-none">Success</div>
                          <div className="text-lime-500 text-[10px] sm:text-2xl font-black leading-tight mt-0.5">98.7%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-8 lg:p-16 flex flex-col justify-center relative bg-black">
                    <div className="relative mb-3 sm:mb-8">
                      <div className="flex items-center gap-1.5 sm:gap-4 mb-2 sm:mb-6">
                        <div className="w-0.5 sm:w-2 h-6 sm:h-16 bg-lime-500" />
                        <span className="text-[9px] sm:text-sm font-black text-lime-500 tracking-wider uppercase">Elite Training</span>
                      </div>
                      <span className="inline-flex items-center gap-1 sm:gap-3 px-2 py-1 sm:px-6 sm:py-3 text-[8px] sm:text-sm font-black text-lime-500 bg-zinc-900 border sm:border-2 border-lime-500 uppercase tracking-wide">
                        <div className="w-1 h-1 sm:w-2 sm:h-2 bg-lime-500" />
                        PRO GRADE
                      </span>
                    </div>
                    
                    <h3 className="relative text-lg sm:text-4xl lg:text-6xl font-black mb-2 sm:mb-8 leading-[0.85] uppercase">
                      <span className="text-white">
                        ELITE TRAINING
                      </span>
                      <br />
                      <span className="text-lime-500">
                        EXPERIENCE
                      </span>
                    </h3>
                    
                    <p className="relative text-zinc-400 text-[11px] sm:text-lg lg:text-xl leading-snug sm:leading-relaxed font-medium">
                      Experience world-class training with <span className="text-lime-500 font-black">state-of-the-art equipment</span> designed for elite performance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Strength & Power - Home2.jpg */}
        <section data-animate data-id="strength-power" id="strength-power" className="mb-6 sm:mb-20">
          <div className={`transition-all duration-700 delay-500 ${isVisible['strength-power'] ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ willChange: isVisible['strength-power'] ? 'auto' : 'transform, opacity' }}>
            <div className="relative group">
              <div className="relative overflow-hidden bg-zinc-900 border border-red-600 sm:border-4 shadow-2xl" style={{ contain: 'layout style paint' }}>
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="p-3 sm:p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1 relative bg-black">
                    <div className="mb-3 sm:mb-8">
                      <div className="flex items-center gap-1.5 sm:gap-4 mb-2 sm:mb-6">
                        <div className="w-0.5 sm:w-2 h-6 sm:h-16 bg-red-600" />
                        <span className="text-[9px] sm:text-sm font-black text-red-600 tracking-wider uppercase">Power & Strength</span>
                      </div>
                      <span className="inline-flex items-center gap-1 sm:gap-3 px-2 py-1 sm:px-6 sm:py-3 text-[8px] sm:text-sm font-black text-red-600 bg-zinc-900 border sm:border-2 border-red-600 uppercase tracking-wide">
                        <div className="w-1 h-1 sm:w-2 sm:h-2 bg-red-600" />
                        MAX INTENSITY
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-4xl lg:text-6xl font-black mb-2 sm:mb-8 leading-[0.85] uppercase">
                      <span className="text-white">
                        UNLEASH YOUR
                      </span>
                      <br />
                      <span className="text-red-600">
                        INNER BEAST
                      </span>
                    </h3>
                    
                    <p className="text-zinc-400 text-[11px] sm:text-lg lg:text-xl leading-snug sm:leading-relaxed font-medium">
                      Push beyond limits with <span className="text-red-600 font-black">intense strength training</span>. Build raw power and determination.
                    </p>
                  </div>
                  
                  <div className="relative h-[220px] sm:h-[400px] lg:h-[600px] overflow-hidden order-1 lg:order-2">
                    <OptimizedImage 
                      src={Home2} 
                      alt="Strength and Power Training" 
                      className="w-full h-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-8 sm:left-8 sm:right-8">
                      <div className="flex items-center gap-1 sm:gap-4">
                        <div className="bg-black/90 border border-red-600 px-1.5 py-1 sm:px-6 sm:py-3 flex-1">
                          <div className="text-red-600 text-[7px] sm:text-xs font-black tracking-wide uppercase leading-none">Power</div>
                          <div className="text-white text-[10px] sm:text-2xl font-black leading-tight mt-0.5">MAX</div>
                        </div>
                        <div className="bg-black/90 border border-white px-1.5 py-1 sm:px-6 sm:py-3 flex-1">
                          <div className="text-white text-[7px] sm:text-xs font-black tracking-wide uppercase leading-none">Intensity</div>
                          <div className="text-red-600 text-[10px] sm:text-2xl font-black leading-tight mt-0.5">BEAST</div>
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
        <section data-animate data-id="cardio-excellence" id="cardio-excellence" className="mb-6 sm:mb-20">
          <div className={`transition-all duration-700 delay-600 ${isVisible['cardio-excellence'] ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ willChange: isVisible['cardio-excellence'] ? 'auto' : 'transform, opacity' }}>
            <div className="relative group">
              <div className="relative overflow-hidden bg-zinc-900 border border-emerald-500 sm:border-4 shadow-2xl" style={{ contain: 'layout style paint' }}>
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-[220px] sm:h-[400px] lg:h-[600px] overflow-hidden">
                    <OptimizedImage 
                      src={Home3} 
                      alt="Muscle Building Training" 
                      className="w-full h-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                    
                    <div className="absolute bottom-1.5 left-1.5 right-1.5 sm:bottom-8 sm:left-8 sm:right-8">
                      <div className="flex items-center gap-1 sm:gap-4">
                        <div className="bg-black/90 border border-emerald-500 px-1.5 py-1 sm:px-6 sm:py-3 flex-1">
                          <div className="text-emerald-500 text-[7px] sm:text-xs font-black tracking-wide uppercase leading-none">Muscle</div>
                          <div className="text-white text-[10px] sm:text-2xl font-black leading-tight mt-0.5">OPTIMAL</div>
                        </div>
                        <div className="bg-black/90 border border-white px-1.5 py-1 sm:px-6 sm:py-3 flex-1">
                          <div className="text-white text-[7px] sm:text-xs font-black tracking-wide uppercase leading-none">Endurance</div>
                          <div className="text-emerald-500 text-[10px] sm:text-2xl font-black leading-tight mt-0.5">ELITE</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-8 lg:p-16 flex flex-col justify-center relative bg-black">
                    <div className="mb-3 sm:mb-8">
                      <div className="flex items-center gap-1.5 sm:gap-4 mb-2 sm:mb-6">
                        <div className="w-0.5 sm:w-2 h-6 sm:h-16 bg-emerald-500" />
                        <span className="text-[9px] sm:text-sm font-black text-emerald-500 tracking-wider uppercase">Muscle Building</span>
                      </div>
                      <span className="inline-flex items-center gap-1 sm:gap-3 px-2 py-1 sm:px-6 sm:py-3 text-[8px] sm:text-sm font-black text-emerald-500 bg-zinc-900 border sm:border-2 border-emerald-500 uppercase tracking-wide">
                        <div className="w-1 h-1 sm:w-2 sm:h-2 bg-emerald-500" />
                        HYPERTROPHY
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-4xl lg:text-6xl font-black mb-2 sm:mb-8 leading-[0.85] uppercase">
                      <span className="text-white">
                        BUILD MASSIVE
                      </span>
                      <br />
                      <span className="text-emerald-500">
                        MUSCLE GAINS
                      </span>
                    </h3>
                    
                    <p className="text-zinc-400 text-[11px] sm:text-lg lg:text-xl leading-snug sm:leading-relaxed font-medium">
                      Sculpt <span className="text-emerald-500 font-black">massive muscle gains</span> with proven hypertrophy training.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Functional Training - Home4.jpg */}
        <section data-animate data-id="functional-training" id="functional-training" className="mb-6 sm:mb-20">
          <div className={`transition-all duration-700 delay-700 ${isVisible['functional-training'] ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ willChange: isVisible['functional-training'] ? 'auto' : 'transform, opacity' }}>
            <div className="relative group">
              <div className="relative overflow-hidden bg-zinc-900 border border-purple-600 sm:border-4 shadow-2xl" style={{ contain: 'layout style paint' }}>
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="p-3 sm:p-8 lg:p-16 flex flex-col justify-center order-2 lg:order-1 relative bg-black">
                    <div className="mb-3 sm:mb-8">
                      <div className="flex items-center gap-1.5 sm:gap-4 mb-2 sm:mb-6">
                        <div className="w-0.5 sm:w-2 h-6 sm:h-16 bg-purple-600" />
                        <span className="text-[9px] sm:text-sm font-black text-purple-600 tracking-wider uppercase">Functional</span>
                      </div>
                      <span className="inline-flex items-center gap-1 sm:gap-3 px-2 py-1 sm:px-6 sm:py-3 text-[8px] sm:text-sm font-black text-purple-600 bg-zinc-900 border sm:border-2 border-purple-600 uppercase tracking-wide">
                        <div className="w-1 h-1 sm:w-2 sm:h-2 bg-purple-600" />
                        SMART TRAINING
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-4xl lg:text-6xl font-black mb-2 sm:mb-8 leading-[0.85] uppercase">
                      <span className="text-white">
                        REAL-WORLD
                      </span>
                      <br />
                      <span className="text-purple-600">
                        STRENGTH
                      </span>
                    </h3>
                    
                    <p className="text-zinc-400 text-[11px] sm:text-lg lg:text-xl leading-snug sm:leading-relaxed font-medium">
                      Master <span className="text-purple-600 font-black">functional movements</span> for real-world performance.
                    </p>
                  </div>
                  
                  <div className="relative h-[220px] sm:h-[400px] lg:h-[600px] overflow-hidden order-1 lg:order-2">
                    <OptimizedImage 
                      src={Home4} 
                      alt="Functional Training" 
                      className="w-full h-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Elite Community - Home5.jpg */}
        <section data-animate data-id="elite-community" id="elite-community" className="mb-6 sm:mb-20">
          <div className={`transition-all duration-700 delay-800 ${isVisible['elite-community'] ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ willChange: isVisible['elite-community'] ? 'auto' : 'transform, opacity' }}>
            <div className="relative group">
              <div className="relative overflow-hidden bg-zinc-900 border border-amber-500 sm:border-4 shadow-2xl" style={{ contain: 'layout style paint' }}>
                <div className="grid lg:grid-cols-2 gap-0">
                  <div className="relative h-[220px] sm:h-[400px] lg:h-[600px] overflow-hidden">
                    <OptimizedImage 
                      src={Home5} 
                      alt="Elite Community" 
                      className="w-full h-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                  </div>
                  
                  <div className="p-3 sm:p-8 lg:p-16 flex flex-col justify-center relative bg-black">
                    <div className="mb-3 sm:mb-8">
                      <div className="flex items-center gap-1.5 sm:gap-4 mb-2 sm:mb-6">
                        <div className="w-0.5 sm:w-2 h-6 sm:h-16 bg-amber-500" />
                        <span className="text-[9px] sm:text-sm font-black text-amber-500 tracking-wider uppercase">Elite Champions</span>
                      </div>
                      <span className="inline-flex items-center gap-1 sm:gap-3 px-2 py-1 sm:px-6 sm:py-3 text-[8px] sm:text-sm font-black text-amber-500 bg-zinc-900 border sm:border-2 border-amber-500 uppercase tracking-wide">
                        <div className="w-1 h-1 sm:w-2 sm:h-2 bg-amber-500" />
                        EXCLUSIVE
                      </span>
                    </div>
                    
                    <h3 className="text-lg sm:text-4xl lg:text-6xl font-black mb-2 sm:mb-8 leading-[0.85] uppercase">
                      <span className="text-white">
                        JOIN THE
                      </span>
                      <br />
                      <span className="text-amber-500">
                        CHAMPIONS
                      </span>
                    </h3>
                    
                    <p className="text-zinc-400 text-[11px] sm:text-lg lg:text-xl leading-snug sm:leading-relaxed font-medium">
                      Connect with <span className="text-amber-500 font-black">elite athletes worldwide</span>. Share victories and push limits together.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section data-animate data-id="cta" id="cta" className="text-center relative py-6 sm:py-20">
          <div className={`relative transition-all duration-700 delay-600 ${isVisible['cta'] ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`} style={{ willChange: isVisible['cta'] ? 'auto' : 'transform, opacity' }}>
            <div className="mb-6 sm:mb-16 px-3">
              <div className="inline-flex items-center gap-1.5 sm:gap-4 mb-3 sm:mb-8">
                <div className="w-8 sm:w-24 h-0.5 sm:h-1 bg-lime-500" />
                <span className="text-[9px] sm:text-sm font-black tracking-[0.15em] sm:tracking-[0.3em] text-lime-500 uppercase">Join The Elite</span>
                <div className="w-8 sm:w-24 h-0.5 sm:h-1 bg-lime-500" />
              </div>
              
              <h2 className="text-2xl sm:text-5xl md:text-7xl font-black mb-3 sm:mb-8 uppercase leading-[0.85]">
                <span className="text-white">
                  READY TO
                </span>
                <br />
                <span className="text-lime-500">
                  DOMINATE?
                </span>
              </h2>
              
              <p className="text-xs sm:text-xl lg:text-2xl text-zinc-400 mb-6 sm:mb-12 max-w-3xl mx-auto leading-snug sm:leading-relaxed font-medium">
                Join elite athletes who track progress with <span className="text-lime-500 font-black">precision</span> and achieve <span className="text-white font-black">extraordinary results</span>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-stretch sm:items-center px-3">
              {isAuthenticated() ? (
                <>
                  <button 
                    onClick={() => navigate('/dashboard')} 
                    className="w-full sm:w-auto px-6 py-3 sm:px-12 sm:py-6 text-sm sm:text-xl font-black bg-lime-500 text-black shadow-2xl transform transition-all duration-300 hover:bg-white hover:translate-y-[-2px] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-lime-500 uppercase tracking-wide"
                  >
                    🚀 GO TO DASHBOARD
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/register')} 
                    className="w-full sm:w-auto px-6 py-3 sm:px-12 sm:py-6 text-sm sm:text-xl font-black bg-lime-500 text-black shadow-2xl transform transition-all duration-300 hover:bg-white hover:translate-y-[-2px] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-lime-500 uppercase tracking-wide"
                  >
                    🎆 START YOUR JOURNEY
                  </button>
                  
                  <button 
                    onClick={() => navigate('/login')} 
                    className="w-full sm:w-auto px-6 py-3 sm:px-12 sm:py-6 text-sm sm:text-xl font-black bg-zinc-900 border border-white sm:border-4 text-white shadow-2xl transform transition-all duration-300 hover:bg-white hover:text-black hover:translate-y-[-2px] active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-white uppercase tracking-wide"
                  >
                    🔑 LOGIN
                  </button>
                  
                  {process.env.NODE_ENV === 'development' && (
                    <button 
                      onClick={() => {
                        forceStatsRefresh();
                        setRefreshTrigger(prev => prev + 1);
                      }}
                      className="w-full sm:w-auto px-3 py-2 text-[10px] sm:text-sm bg-red-600 hover:bg-red-700 text-white font-black uppercase"
                    >
                      🔧 Debug: Refresh Stats
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <style>
        {`
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          @keyframes animate-in {
            from { opacity: 0; transform: translate3d(100%, 0, 0); }
            to { opacity: 1; transform: translate3d(0, 0, 0); }
          }
          
          .animate-in { 
            animation: animate-in 0.3s ease-out;
            will-change: transform, opacity;
          }
          
          .slide-in-from-right { animation-name: animate-in; }
          
          .line-clamp-1 {
            overflow: hidden;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
          }
          
          [data-animate] {
            will-change: transform, opacity;
            transform: translate3d(0, 0, 0);
          }
          
          img {
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
          
          .group:hover img {
            transform: translate3d(0, 0, 0) scale(1.05);
          }
        `}
      </style>
    </div>
  );
}