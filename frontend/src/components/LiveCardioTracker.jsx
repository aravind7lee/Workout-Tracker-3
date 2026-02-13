// frontend/src/components/LiveCardioTracker.jsx - Real Motion-Based Tracker
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const LiveCardioTracker = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [activityType, setActivityType] = useState('walking');
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [calories, setCalories] = useState(0);
  const [hasMotion, setHasMotion] = useState(false);
  const [motionDetected, setMotionDetected] = useState(false);
  
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const lastStepTimeRef = useRef(0);
  const accelerationRef = useRef({ x: 0, y: 0, z: 0 });

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
    // Check if device motion is available
    if (window.DeviceMotionEvent) {
      setHasMotion(true);
    }
    return () => stopTracking();
  }, []);

  const detectStep = (event) => {
    if (!event.accelerationIncludingGravity) return;

    const { x, y, z } = event.accelerationIncludingGravity;
    const prevAcc = accelerationRef.current;

    // Calculate acceleration magnitude change
    const deltaX = Math.abs((x || 0) - prevAcc.x);
    const deltaY = Math.abs((y || 0) - prevAcc.y);
    const deltaZ = Math.abs((z || 0) - prevAcc.z);
    const totalDelta = deltaX + deltaY + deltaZ;

    accelerationRef.current = { x: x || 0, y: y || 0, z: z || 0 };

    // Detect step based on activity threshold
    const now = Date.now();
    const timeSinceLastStep = now - lastStepTimeRef.current;

    if (totalDelta > currentActivity.threshold && timeSinceLastStep > currentActivity.stepTime) {
      setMotionDetected(true);
      
      // Only count steps for walking/running
      if (currentActivity.stepTime > 0) {
        setSteps(prev => {
          const newSteps = prev + 1;
          // 1300 steps = 1 km average
          setDistance(newSteps / 1300);
          return newSteps;
        });
      }
      
      lastStepTimeRef.current = now;
    }
  };

  const startTracking = () => {
    if (!hasMotion) {
      alert('⚠️ Device motion sensors not available. This feature works best on mobile devices.');
      return;
    }

    setIsTracking(true);
    startTimeRef.current = Date.now();
    setSteps(0);
    setDistance(0);
    setDuration(0);
    setCalories(0);
    setMotionDetected(false);
    lastStepTimeRef.current = 0;

    // Add motion event listener
    window.addEventListener('devicemotion', detectStep);

    // Update duration and calories every second
    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const minutes = Math.floor(elapsed / 60);
      setDuration(minutes);
      
      // Calculate calories only if motion detected
      if (motionDetected) {
        const met = MET_VALUES[activityType];
        const weight = 70;
        const hours = elapsed / 3600;
        const cals = Math.round(met * weight * hours);
        setCalories(cals);
      }

      // For cycling/swimming, estimate distance if motion detected
      if (motionDetected && currentActivity.stepTime === 0) {
        const mins = elapsed / 60;
        if (activityType === 'cycling') {
          setDistance(mins * 0.3); // ~18 km/h
        } else if (activityType === 'swimming') {
          setDistance(mins * 0.05); // ~3 km/h
        }
      }
    }, 1000);
  };

  const stopTracking = () => {
    setIsTracking(false);
    window.removeEventListener('devicemotion', detectStep);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const saveSession = async () => {
    if (duration < 1) {
      alert('⚠️ Please track for at least 1 minute before saving');
      return;
    }

    if (!motionDetected) {
      alert('⚠️ No movement detected! Please move your device while tracking.');
      return;
    }

    try {
      await api.post('/cardio', {
        activityType,
        duration,
        distance: parseFloat(distance.toFixed(2)),
        steps,
        calories,
        intensity: 'moderate',
        notes: `Live tracked ${activityType} session`
      });

      alert('✅ Session saved successfully!');
      stopTracking();
      setSteps(0);
      setDistance(0);
      setDuration(0);
      setCalories(0);
      setMotionDetected(false);
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('❌ Failed to save session. Please try again.');
    }
  };

  const formatTime = () => {
    if (!isTracking || !startTimeRef.current) return '0s';
    const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const hrs = Math.floor(elapsed / 3600);
    const mins = Math.floor((elapsed % 3600) / 60);
    const secs = elapsed % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-cyan-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
              ⚡ LIVE TRACKER
            </h3>
            <p className="text-slate-400 text-sm">Motion-based activity tracking</p>
          </div>
          {!hasMotion && (
            <div className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-lg text-sm">
              ⚠️ Motion sensors unavailable
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {ACTIVITY_TYPES.map(activity => (
            <button
              key={activity.value}
              onClick={() => !isTracking && setActivityType(activity.value)}
              disabled={isTracking}
              className={`p-3 rounded-xl font-bold text-sm transition-all ${
                activityType === activity.value
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              } ${isTracking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-2xl mb-1">{activity.icon}</div>
              <div className="text-xs">{activity.label}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div
            animate={{ scale: isTracking && motionDetected ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isTracking && motionDetected ? Infinity : 0, duration: 2 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20"
          >
            <div className="text-slate-400 text-xs mb-1">STEPS</div>
            <div className="text-3xl font-black text-white">{steps.toLocaleString()}</div>
          </motion.div>

          <motion.div
            animate={{ scale: isTracking && motionDetected ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isTracking && motionDetected ? Infinity : 0, duration: 2, delay: 0.5 }}
            className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-xl p-4 border border-blue-500/20"
          >
            <div className="text-slate-400 text-xs mb-1">DISTANCE</div>
            <div className="text-3xl font-black text-white">{distance.toFixed(2)} km</div>
          </motion.div>

          <motion.div
            animate={{ scale: isTracking ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isTracking ? Infinity : 0, duration: 2, delay: 1 }}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/20"
          >
            <div className="text-slate-400 text-xs mb-1">DURATION</div>
            <div className="text-3xl font-black text-white">{formatTime()}</div>
          </motion.div>

          <motion.div
            animate={{ scale: isTracking && motionDetected ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isTracking && motionDetected ? Infinity : 0, duration: 2, delay: 1.5 }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-500/20"
          >
            <div className="text-slate-400 text-xs mb-1">CALORIES</div>
            <div className="text-3xl font-black text-white">{calories}</div>
          </motion.div>
        </div>

        <div className="flex gap-3">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg"
            >
              ▶️ START TRACKING
            </button>
          ) : (
            <>
              <button
                onClick={stopTracking}
                className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg"
              >
                ⏸️ STOP
              </button>
              <button
                onClick={saveSession}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-all duration-300 shadow-lg"
              >
                💾 SAVE
              </button>
            </>
          )}
        </div>

        {isTracking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center justify-center gap-2 text-green-400 bg-green-500/20 px-4 py-2 rounded-full"
          >
            <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold">
              {motionDetected ? '🔴 MOTION DETECTED - TRACKING' : '⏸️ WAITING FOR MOVEMENT...'}
            </span>
          </motion.div>
        )}

        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <p className="text-blue-400 text-sm">
            <strong>💡 How it works:</strong> This tracker uses your device's motion sensors to detect actual movement. 
            Keep your phone in your pocket or hand while moving. Steps and distance are counted ONLY when motion is detected.
          </p>
        </div>

        {!hasMotion && (
          <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
            <p className="text-orange-400 text-sm">
              <strong>⚠️ Note:</strong> Motion sensors are not available on this device. This feature works best on mobile phones with accelerometer sensors.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCardioTracker;
