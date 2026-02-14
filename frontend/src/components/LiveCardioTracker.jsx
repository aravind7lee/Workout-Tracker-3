// frontend/src/components/LiveCardioTracker.jsx - Real Motion-Based Tracker
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const LiveCardioTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activityType, setActivityType] = useState('walking');
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [calories, setCalories] = useState(0);
  const [hasMotion, setHasMotion] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  
  const startTimeRef = useRef(null);
  const pausedTimeRef = useRef(0);
  const intervalRef = useRef(null);
  const lastStepTimeRef = useRef(0);
  const accelerationRef = useRef({ x: 0, y: 0, z: 0 });
  const motionHandlerRef = useRef(null);
  const isTrackingRef = useRef(false);

  const ACTIVITY_TYPES = [
    { value: 'walking', label: 'Walking', icon: '🚶', threshold: 1.2, stepTime: 600 },
    { value: 'running', label: 'Running', icon: '🏃', threshold: 2.0, stepTime: 375 },
    { value: 'cycling', label: 'Cycling', icon: '🚴', threshold: 0.8, stepTime: 0 },
    { value: 'swimming', label: 'Swimming', icon: '🏊', threshold: 0.6, stepTime: 0 }
  ];

  const MET_VALUES = {
    walking: 3.5,
    running: 9.8,
    cycling: 7.5,
    swimming: 8.0
  };

  const currentActivity = ACTIVITY_TYPES.find(a => a.value === activityType);

  useEffect(() => {
    if (window.DeviceMotionEvent) {
      setHasMotion(true);
      console.log('✅ Motion sensors detected - Real tracking mode');
    } else {
      // Enable demo mode for laptops/PCs without sensors
      setDemoMode(true);
      console.log('💻 No motion sensors - Demo mode enabled');
    }
    loadRecentSessions();
    return () => stopTracking();
  }, []);

  const loadRecentSessions = async () => {
    try {
      const response = await api.get('/cardio?limit=5');
      if (response.data.success) {
        setRecentSessions(response.data.sessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const detectStep = (event) => {
    if (!isTrackingRef.current || isPaused || !event.accelerationIncludingGravity) return;

    const { x, y, z } = event.accelerationIncludingGravity;
    const prevAcc = accelerationRef.current;

    const deltaX = Math.abs((x || 0) - prevAcc.x);
    const deltaY = Math.abs((y || 0) - prevAcc.y);
    const deltaZ = Math.abs((z || 0) - prevAcc.z);
    const totalDelta = deltaX + deltaY + deltaZ;

    accelerationRef.current = { x: x || 0, y: y || 0, z: z || 0 };

    const now = Date.now();
    const timeSinceLastStep = now - lastStepTimeRef.current;

    if (totalDelta > currentActivity.threshold && timeSinceLastStep > currentActivity.stepTime) {
      setMotionDetected(true);
      
      if (currentActivity.stepTime > 0) {
        setSteps(prev => {
          const newSteps = prev + 1;
          setDistance(newSteps / 1300);
          return newSteps;
        });
      }
      
      lastStepTimeRef.current = now;
    }
  };

  const startTracking = () => {
    if (!hasMotion && !demoMode) {
      alert('⚠️ Device motion sensors not available. This feature works best on mobile devices.');
      return;
    }

    console.log(`🚀 Starting tracking - Demo Mode: ${demoMode}, Activity: ${activityType}`);

    setIsTracking(true);
    setIsPaused(false);
    isTrackingRef.current = true;
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    setSteps(0);
    setDistance(0);
    setDuration(0);
    setCalories(0);
    setMotionDetected(false);
    lastStepTimeRef.current = 0;

    // Real motion detection for mobile
    if (hasMotion) {
      motionHandlerRef.current = detectStep;
      window.addEventListener('devicemotion', motionHandlerRef.current);
      console.log('📱 Real motion sensor activated');
    }

    // Main interval for duration and calories
    intervalRef.current = setInterval(() => {
      if (!isTrackingRef.current || isPaused) return;
      
      const elapsed = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
      const minutes = Math.floor(elapsed / 60);
      setDuration(minutes);
      
      // Demo mode: simulate steps for laptops
      if (demoMode && !isPaused) {
        setMotionDetected(true);
        
        // Simulate realistic step counting
        if (currentActivity.stepTime > 0) {
          const stepsPerSecond = activityType === 'running' ? 2.5 : 1.5;
          const newSteps = Math.floor(elapsed * stepsPerSecond);
          setSteps(newSteps);
          setDistance(newSteps / 1300);
          if (elapsed % 5 === 0) {
            console.log(`💻 Demo: ${newSteps} steps, ${(newSteps / 1300).toFixed(2)} km`);
          }
        } else {
          // For cycling/swimming, use time-based distance
          const mins = elapsed / 60;
          if (activityType === 'cycling') {
            setDistance(mins * 0.3);
          } else if (activityType === 'swimming') {
            setDistance(mins * 0.05);
          }
        }
      }
      
      // Calculate calories
      setCalories(prev => {
        const met = MET_VALUES[activityType];
        const weight = 70;
        const hours = elapsed / 3600;
        return Math.round(met * weight * hours);
      });

      // For cycling/swimming with real sensors
      if (hasMotion && currentActivity.stepTime === 0) {
        const mins = elapsed / 60;
        if (activityType === 'cycling') {
          setDistance(mins * 0.3);
        } else if (activityType === 'swimming') {
          setDistance(mins * 0.05);
        }
      }
    }, 1000);
  };

  const pauseTracking = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now() - startTimeRef.current - pausedTimeRef.current;
  };

  const resumeTracking = () => {
    setIsPaused(false);
    startTimeRef.current = Date.now() - pausedTimeRef.current;
  };

  const stopTracking = () => {
    if (!isTracking) return;
    
    const shouldSave = window.confirm('Do you want to save this session?\n\nClick OK to save, Cancel to discard.');
    
    setIsTracking(false);
    setIsPaused(false);
    isTrackingRef.current = false;
    
    if (motionHandlerRef.current) {
      window.removeEventListener('devicemotion', motionHandlerRef.current);
      motionHandlerRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (shouldSave && duration >= 1) {
      saveSession();
    } else if (shouldSave && duration < 1) {
      alert('⚠️ Please track for at least 1 minute before saving');
      setSteps(0);
      setDistance(0);
      setDuration(0);
      setCalories(0);
      setMotionDetected(false);
    } else {
      setSteps(0);
      setDistance(0);
      setDuration(0);
      setCalories(0);
      setMotionDetected(false);
    }
  };

  const saveSession = async () => {
    if (duration < 1) {
      alert('⚠️ Please track for at least 1 minute before saving');
      return;
    }

    try {
      const response = await api.post('/cardio', {
        activityType,
        duration,
        distance: parseFloat(distance.toFixed(2)),
        steps,
        calories,
        intensity: 'moderate',
        notes: demoMode ? `Demo tracked ${activityType} session` : `Live tracked ${activityType} session`
      });

      if (response.data.success) {
        alert(`✅ Session saved!\n\n${currentActivity.icon} ${currentActivity.label}\n${steps.toLocaleString()} steps\n${distance.toFixed(2)} km\n${duration} min\n${calories} cal`);
        
        // Reset values
        setSteps(0);
        setDistance(0);
        setDuration(0);
        setCalories(0);
        setMotionDetected(false);
        
        // Reload sessions and auto-show history
        setTimeout(() => {
          loadRecentSessions();
          setShowHistory(true);
        }, 500);
      }
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('❌ Failed to save session. Please try again.');
    }
  };

  const formatTime = () => {
    const hrs = Math.floor(duration / 60);
    const mins = duration % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m`;
    return '0m';
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-purple-500/5 blur-2xl"></div>
        <div className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 rounded-xl sm:rounded-2xl border border-cyan-500/30 p-3 sm:p-5 md:p-6 backdrop-blur-sm shadow-2xl">
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-lg sm:text-xl">⚡</span>
              </div>
              <div>
                <h3 className="text-base sm:text-xl md:text-2xl font-black text-white uppercase tracking-wider leading-none">
                  LIVE TRACKER
                </h3>
                <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1">Real-time motion tracking</p>
              </div>
            </div>
            {!hasMotion && (
              <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-400/40 text-orange-300 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wide shadow-lg">
                💻 DEMO
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-5">
            {ACTIVITY_TYPES.map(activity => (
              <button
                key={activity.value}
                onClick={() => !isTracking && setActivityType(activity.value)}
                disabled={isTracking}
                className={`relative group p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl font-bold transition-all duration-300 ${
                  activityType === activity.value
                    ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-500 text-white shadow-xl shadow-cyan-500/40 scale-105'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80 hover:text-white hover:scale-105 border border-slate-700/50'
                } ${isTracking ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
              >
                <div className="text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1">{activity.icon}</div>
                <div className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-wider font-extrabold">{activity.label}</div>
                {activityType === activity.value && (
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg sm:rounded-xl pointer-events-none"></div>
                )}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 mb-3 sm:mb-4 md:mb-5">
            <motion.div
              animate={{ scale: isTracking && motionDetected ? [1, 1.03, 1] : 1 }}
              transition={{ repeat: isTracking && motionDetected ? Infinity : 0, duration: 1.5 }}
              className="relative overflow-hidden bg-gradient-to-br from-green-500/15 via-emerald-500/10 to-green-600/15 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-green-500/30 shadow-lg"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-400/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs sm:text-sm">🚶</span>
                  <div className="text-green-400 text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest">STEPS</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">{steps.toLocaleString()}</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ scale: isTracking && motionDetected ? [1, 1.03, 1] : 1 }}
              transition={{ repeat: isTracking && motionDetected ? Infinity : 0, duration: 1.5, delay: 0.3 }}
              className="relative overflow-hidden bg-gradient-to-br from-blue-500/15 via-cyan-500/10 to-blue-600/15 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-blue-500/30 shadow-lg"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-400/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs sm:text-sm">📍</span>
                  <div className="text-blue-400 text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest">DISTANCE</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">{distance.toFixed(2)} <span className="text-xs sm:text-sm md:text-base text-slate-400 font-bold">km</span></div>
              </div>
            </motion.div>

            <motion.div
              animate={{ scale: isTracking ? [1, 1.03, 1] : 1 }}
              transition={{ repeat: isTracking ? Infinity : 0, duration: 1.5, delay: 0.6 }}
              className="relative overflow-hidden bg-gradient-to-br from-orange-500/15 via-red-500/10 to-orange-600/15 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-orange-500/30 shadow-lg"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-400/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs sm:text-sm">⏱️</span>
                  <div className="text-orange-400 text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest">DURATION</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">{formatTime()}</div>
              </div>
            </motion.div>

            <motion.div
              animate={{ scale: isTracking && motionDetected ? [1, 1.03, 1] : 1 }}
              transition={{ repeat: isTracking && motionDetected ? Infinity : 0, duration: 1.5, delay: 0.9 }}
              className="relative overflow-hidden bg-gradient-to-br from-purple-500/15 via-pink-500/10 to-purple-600/15 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-purple-500/30 shadow-lg"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-400/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs sm:text-sm">🔥</span>
                  <div className="text-purple-400 text-[9px] sm:text-[10px] md:text-xs font-black uppercase tracking-widest">CALORIES</div>
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-none">{calories}</div>
              </div>
            </motion.div>
          </div>

          <div className="flex gap-2 sm:gap-2.5 md:gap-3">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="relative flex-1 group overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white px-4 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm md:text-base uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-green-500/40"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <span className="relative flex items-center justify-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg">▶️</span>
                  <span className="hidden xs:inline sm:hidden md:inline">START</span>
                  <span className="hidden sm:inline md:hidden">START TRACKING</span>
                  <span className="hidden md:inline">START TRACKING</span>
                </span>
              </button>
            ) : (
              <>
                {!isPaused ? (
                  <button
                    onClick={pauseTracking}
                    className="relative flex-1 group overflow-hidden bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-600 text-white px-3 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm md:text-base uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-yellow-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center gap-1.5">
                      <span className="text-base sm:text-lg">⏸️</span>
                      <span className="hidden sm:inline">PAUSE</span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={resumeTracking}
                    className="relative flex-1 group overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white px-3 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm md:text-base uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-green-500/40"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                    <span className="relative flex items-center justify-center gap-1.5">
                      <span className="text-base sm:text-lg">▶️</span>
                      <span className="hidden sm:inline">RESUME</span>
                    </span>
                  </button>
                )}
                <button
                  onClick={stopTracking}
                  className="relative flex-1 group overflow-hidden bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-3 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm md:text-base uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-xl shadow-red-500/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative flex items-center justify-center gap-1.5">
                    <span className="text-base sm:text-lg">⏹️</span>
                    <span className="hidden sm:inline">STOP</span>
                  </span>
                </button>
              </>
            )}
          </div>

          {isTracking && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 sm:mt-4 relative overflow-hidden flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full backdrop-blur-sm ${
                isPaused 
                  ? 'text-yellow-300 bg-gradient-to-r from-yellow-500/25 to-orange-500/25 border border-yellow-400/40 shadow-lg shadow-yellow-500/20' 
                  : motionDetected 
                    ? 'text-green-300 bg-gradient-to-r from-green-500/25 to-emerald-500/25 border border-green-400/40 shadow-lg shadow-green-500/20' 
                    : 'text-blue-300 bg-gradient-to-r from-blue-500/25 to-cyan-500/25 border border-blue-400/40 shadow-lg shadow-blue-500/20'
              }`}
            >
              <span className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shadow-lg ${
                isPaused ? 'bg-yellow-400 shadow-yellow-400/50' : 'bg-green-400 animate-pulse shadow-green-400/50'
              }`}></span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-center">
                {isPaused 
                  ? <><span className="hidden sm:inline">PAUSED - TAP RESUME</span><span className="sm:hidden">PAUSED</span></>
                  : motionDetected 
                    ? <><span className="hidden sm:inline">🔴 LIVE TRACKING ACTIVE</span><span className="sm:hidden">🔴 LIVE</span></>
                    : <><span className="hidden sm:inline">WAITING FOR MOTION...</span><span className="sm:hidden">WAITING...</span></>}
              </span>
            </motion.div>
          )}

          <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-lg sm:rounded-xl backdrop-blur-sm">
            <p className="text-blue-300 text-[10px] sm:text-xs md:text-sm leading-relaxed">
              <strong className="font-black text-blue-200">💡 HOW IT WORKS:</strong> {demoMode 
                ? 'Demo mode active for PC testing. On mobile, real motion sensors track your movement.' 
                : 'Uses device motion sensors for real-time tracking. Keep phone in pocket while moving.'}
            </p>
          </div>

          {demoMode && (
            <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 md:p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-lg sm:rounded-xl backdrop-blur-sm">
              <p className="text-green-300 text-[10px] sm:text-xs md:text-sm leading-relaxed">
                <strong className="font-black text-green-200">✅ DEMO ACTIVE:</strong> Simulated tracking for testing. Real sensors activate on mobile devices.
              </p>
            </div>
          )}
        </div>
      </div>

      {recentSessions.length > 0 && (
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-cyan-500/5 blur-2xl"></div>
          <div className="relative bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 rounded-xl sm:rounded-2xl border border-purple-500/30 p-3 sm:p-5 md:p-6 backdrop-blur-sm shadow-2xl">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <span className="text-lg sm:text-xl">📊</span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-black text-white uppercase tracking-wider">
                  RECENT ACTIVITY
                </h3>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-cyan-300 hover:text-cyan-200 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30"
              >
                {showHistory ? '▲ HIDE' : '▼ SHOW'}
              </button>
            </div>
            
            {showHistory && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 mb-3 sm:mb-4">
                  {recentSessions.slice(0, 3).map((session, idx) => {
                    const activity = ACTIVITY_TYPES.find(a => a.value === session.activityType);
                    const date = new Date(session.date);
                    return (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative overflow-hidden bg-gradient-to-r from-slate-800/60 via-slate-800/40 to-slate-800/60 border border-slate-700/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
                          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-700 to-slate-600 rounded-lg sm:rounded-xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg">
                              {activity?.icon || '🏃'}
                            </div>
                            <div>
                              <div className="text-white font-black capitalize text-xs sm:text-sm md:text-base uppercase tracking-wide">{session.activityType}</div>
                              <div className="text-slate-400 text-[9px] sm:text-[10px] md:text-xs font-semibold">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
                            {session.steps > 0 && (
                              <div className="bg-gradient-to-br from-green-500/15 to-emerald-500/15 border border-green-500/30 rounded-md sm:rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2 text-center">
                                <div className="text-green-300 text-sm sm:text-base md:text-lg font-black leading-none">{session.steps.toLocaleString()}</div>
                                <div className="text-green-500/70 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-bold mt-0.5">steps</div>
                              </div>
                            )}
                            <div className="bg-gradient-to-br from-blue-500/15 to-cyan-500/15 border border-blue-500/30 rounded-md sm:rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2 text-center">
                              <div className="text-blue-300 text-sm sm:text-base md:text-lg font-black leading-none">{session.distance.toFixed(1)}<span className="text-[10px] sm:text-xs text-blue-400/70">km</span></div>
                              <div className="text-blue-500/70 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-bold mt-0.5">distance</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-500/15 to-red-500/15 border border-orange-500/30 rounded-md sm:rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2 text-center">
                              <div className="text-orange-300 text-sm sm:text-base md:text-lg font-black leading-none">{session.duration}<span className="text-[10px] sm:text-xs text-orange-400/70">m</span></div>
                              <div className="text-orange-500/70 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-bold mt-0.5">time</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500/15 to-pink-500/15 border border-purple-500/30 rounded-md sm:rounded-lg px-2 py-1.5 sm:px-2.5 sm:py-2 text-center">
                              <div className="text-purple-300 text-sm sm:text-base md:text-lg font-black leading-none">{session.calories}</div>
                              <div className="text-purple-500/70 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-bold mt-0.5">cal</div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => window.location.href = '/cardio-analytics'}
                  className="relative group overflow-hidden w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white px-4 py-3 sm:py-3.5 md:py-4 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm md:text-base uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-cyan-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <span className="text-base sm:text-lg">📊</span>
                    <span className="hidden sm:inline">VIEW FULL ANALYTICS & HISTORY</span>
                    <span className="sm:hidden">FULL ANALYTICS</span>
                  </span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCardioTracker;
