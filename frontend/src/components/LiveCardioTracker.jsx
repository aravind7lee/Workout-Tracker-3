// frontend/src/components/LiveCardioTracker.jsx - Real-time Pedometer
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
  const [locationPermission, setLocationPermission] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  
  const watchIdRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const ACTIVITY_TYPES = [
    { value: 'walking', label: 'Walking', icon: '🚶' },
    { value: 'running', label: 'Running', icon: '🏃' },
    { value: 'cycling', label: 'Cycling', icon: '🚴' },
    { value: 'swimming', label: 'Swimming', icon: '🏊' },
    { value: 'hiking', label: 'Hiking', icon: '🥾' }
  ];

  const MET_VALUES = {
    walking: 3.5,
    running: 9.8,
    cycling: 7.5,
    swimming: 8.0,
    hiking: 6.0
  };

  useEffect(() => {
    checkLocationPermission();
    return () => stopTracking();
  }, []);

  const checkLocationPermission = async () => {
    if ('geolocation' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(result.state === 'granted');
      } catch (error) {
        console.log('Permission check not supported');
      }
    }
  };

  const requestLocationPermission = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => setLocationPermission(true),
        () => alert('Location permission denied. GPS tracking disabled.')
      );
    } else {
      alert('Geolocation not supported by your browser');
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const startTracking = async () => {
    if (!locationPermission) {
      await requestLocationPermission();
      return;
    }

    setIsTracking(true);
    startTimeRef.current = Date.now();
    setSteps(0);
    setDistance(0);
    setDuration(0);
    setCalories(0);

    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          if (lastPosition) {
            const dist = calculateDistance(
              lastPosition.latitude,
              lastPosition.longitude,
              latitude,
              longitude
            );
            setDistance(prev => prev + dist);
            
            const stepsPerKm = activityType === 'walking' ? 1312 : activityType === 'running' ? 1250 : 0;
            if (stepsPerKm > 0) {
              setSteps(Math.round((distance + dist) * stepsPerKm));
            }
          }
          
          setLastPosition({ latitude, longitude });
        },
        (error) => console.error('GPS error:', error),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
      setDuration(elapsed);
      
      const met = MET_VALUES[activityType];
      const weight = 70;
      const hours = elapsed / 60;
      const cals = Math.round(met * weight * hours);
      setCalories(cals);
    }, 1000);
  };

  const stopTracking = () => {
    setIsTracking(false);
    
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const saveSession = async () => {
    if (duration === 0) {
      alert('No activity to save');
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
        notes: `Live tracked session`
      });

      alert('Session saved successfully!');
      stopTracking();
      setSteps(0);
      setDistance(0);
      setDuration(0);
      setCalories(0);
    } catch (error) {
      console.error('Failed to save session:', error);
      alert('Failed to save session');
    }
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900/95 to-slate-800/95 rounded-2xl border border-cyan-500/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
              ⚡ LIVE TRACKER
            </h3>
            <p className="text-slate-400 text-sm">Real-time pedometer & GPS tracking</p>
          </div>
          {!locationPermission && (
            <button
              onClick={requestLocationPermission}
              className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-500/30 transition-all"
            >
              📍 Enable GPS
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2 mb-6">
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
            animate={{ scale: isTracking ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isTracking ? Infinity : 0, duration: 2 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl p-4 border border-green-500/20"
          >
            <div className="text-slate-400 text-xs mb-1">STEPS</div>
            <div className="text-3xl font-black text-white">{steps.toLocaleString()}</div>
          </motion.div>

          <motion.div
            animate={{ scale: isTracking ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isTracking ? Infinity : 0, duration: 2, delay: 0.5 }}
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
            <div className="text-3xl font-black text-white">{formatTime(duration)}</div>
          </motion.div>

          <motion.div
            animate={{ scale: isTracking ? [1, 1.05, 1] : 1 }}
            transition={{ repeat: isTracking ? Infinity : 0, duration: 2, delay: 1.5 }}
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
            <span className="text-sm font-semibold">LIVE TRACKING ACTIVE</span>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LiveCardioTracker;
