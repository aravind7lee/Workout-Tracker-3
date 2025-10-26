// frontend/src/pages/ProfileEnhanced.jsx - ENHANCED GYM-THEMED PROFILE
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageUploader from '../components/ImageUploader';
import AuthGuard from '../components/AuthGuard';
import api from '../utils/api';

// Import gym-themed background images
import GymBg1 from '../assets/wp8463825-male-workout-wallpapers.jpg';
import GymBg2 from '../assets/woman-gym-body-building.jpg';
import ArnoldBg from '../assets/Arnold Schwarzenegge1.jpg';
import ChrisBg from '../assets/ChrisBumstead1.jpg';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  // Real-time data fetching
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch all profile data in parallel
      const [profileRes, statsRes, activityRes, achievementsRes] = await Promise.allSettled([
        api.get('/users/profile'),
        api.get('/users/stats'),
        api.get('/users/activity'),
        api.get('/users/achievements')
      ]);

      // Handle profile data
      if (profileRes.status === 'fulfilled') {
        const profileData = profileRes.value.data;
        setUser(profileData);
        localStorage.setItem('user', JSON.stringify(profileData));
        setFormData({ name: profileData.name || '', email: profileData.email || '' });
      } else {
        // Fallback to localStorage
        const localUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (localUser.name) {
          setUser(localUser);
          setFormData({ name: localUser.name || '', email: localUser.email || '' });
        }
      }

      // Handle stats data
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data);
      } else {
        setStats(getFallbackStats());
      }

      // Handle activity data
      if (activityRes.status === 'fulfilled') {
        setActivity(activityRes.value.data);
      } else {
        setActivity([]);
      }

      // Handle achievements data
      if (achievementsRes.status === 'fulfilled') {
        setAchievements(achievementsRes.value.data);
      } else {
        setAchievements([]);
      }

      setLastSync(new Date());
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError('Failed to load profile data');
      
      // Try to load from localStorage as fallback
      const localUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (localUser.name) {
        setUser(localUser);
        setFormData({ name: localUser.name || '', email: localUser.email || '' });
        setStats(getFallbackStats());
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Get fallback stats from localStorage
  const getFallbackStats = () => {
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
    const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
    
    return {
      totalWorkouts: workouts.filter(w => w.completed).length,
      totalMeals: meals.length,
      totalPlans: plans.length,
      currentStreak: 0,
      xpPoints: workouts.length * 100,
      totalCaloriesBurned: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
      membershipDays: 0,
      isRealTime: false
    };
  };

  // Real-time event listeners
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initial data fetch
    fetchProfileData();

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      fetchProfileData(); // Refresh data when coming back online
    };
    const handleOffline = () => setIsOnline(false);

    // Real-time update listeners
    const handleWorkoutComplete = () => {
      console.log('🏋️ Workout completed - refreshing profile');
      setTimeout(fetchProfileData, 1000); // Small delay for backend processing
    };
    
    const handleMealAdded = () => {
      console.log('🍽️ Meal added - refreshing profile');
      setTimeout(fetchProfileData, 1000);
    };

    const handlePlanCreated = () => {
      console.log('📋 Plan created - refreshing profile');
      setTimeout(fetchProfileData, 1000);
    };

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('workoutCompleted', handleWorkoutComplete);
    window.addEventListener('mealAdded', handleMealAdded);
    window.addEventListener('planCreated', handlePlanCreated);
    
    // Auto-refresh every 30 seconds when online
    const refreshInterval = setInterval(() => {
      if (navigator.onLine) {
        fetchProfileData();
      }
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('workoutCompleted', handleWorkoutComplete);
      window.removeEventListener('mealAdded', handleMealAdded);
      window.removeEventListener('planCreated', handlePlanCreated);
      clearInterval(refreshInterval);
    };
  }, [navigate, fetchProfileData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put('/users/profile', formData);
      const updatedUser = response.data.user || response.data;
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditing(false);
      
      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg z-50';
      successMsg.textContent = '✅ Profile updated successfully!';
      document.body.appendChild(successMsg);
      setTimeout(() => document.body.removeChild(successMsg), 3000);
      
    } catch (error) {
      console.error('Profile update error:', error);
      // Show error message
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50';
      errorMsg.textContent = '❌ Failed to update profile';
      document.body.appendChild(errorMsg);
      setTimeout(() => document.body.removeChild(errorMsg), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpdate = async (imageUrl) => {
    try {
      // Update profile with new image URL (Cloudinary handles persistence)
      const response = await api.put('/users/profile', { 
        ...formData, 
        profileImage: imageUrl 
      });
      
      const updatedUser = response.data.user || response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('✅ Profile image updated and synced across devices');
    } catch (error) {
      console.error('Image update error:', error);
      // Still update locally for offline functionality
      const updatedUser = { ...user, profileImage: imageUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (error && !user) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-6">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-4">Connection Issue</h2>
        <p className="text-slate-400 mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={fetchProfileData}
            className="btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            🔄 Retry
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="btn bg-slate-600 hover:bg-slate-700 text-white"
          >
            🚪 Re-login
          </button>
        </div>
        <p className="text-slate-500 text-sm mt-4">
          {isOnline ? 'Check your internet connection' : 'You are currently offline'}
        </p>
      </motion.div>
    );
  }

  if (!user) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-6xl mb-6">👤</div>
        <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
        <p className="text-slate-400 mb-4">Please log in to view your profile</p>
        <button 
          onClick={() => navigate('/login')}
          className="btn bg-blue-600 hover:bg-blue-700 text-white"
        >
          🔑 Go to Login
        </button>
      </motion.div>
    );
  }

  return (
    <AuthGuard>
      {/* Modern Gym Hero Section */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Dynamic Background with Gym Vibes */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 z-10"></div>
          <motion.div 
            className="absolute inset-0 opacity-20"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          >
            <img 
              src={GymBg1} 
              alt="Gym Background" 
              className="w-full h-full object-cover"
            />
          </motion.div>
          {/* Animated overlay patterns */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 via-transparent to-cyan-900/10 z-20"></div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-30 max-w-7xl mx-auto px-4 py-8">
          {/* Hero Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-cyan-400 bg-clip-text text-transparent"
              style={{ fontFamily: 'var(--font-heading)' }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              💪 MY PROFILE
            </motion.h1>
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className={`px-6 py-3 rounded-full border-2 backdrop-blur-sm ${
                isOnline 
                  ? 'bg-green-500/20 text-green-300 border-green-400 shadow-lg shadow-green-500/25' 
                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-lg shadow-yellow-500/25'
              }`}>
                <span className="font-bold text-lg">
                  {isOnline ? '🔥 LIVE SYNC ACTIVE' : '⚡ OFFLINE MODE'}
                </span>
              </div>
              <button
                onClick={fetchProfileData}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? '🔄 SYNCING...' : '🔄 REFRESH'}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-full shadow-lg shadow-red-500/25 transition-all duration-300"
              >
                🚪 LOGOUT
              </button>
            </motion.div>
            <motion.p 
              className="text-slate-300 text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              🏋️ Professional Gym Tracker • 💾 MongoDB Database • 🔄 Cross-Device Sync
              {lastSync && (
                <span className="block text-sm text-slate-400 mt-2">
                  Last sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
            </motion.p>
          </motion.div>

          {/* Profile Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Profile Image Section - Enhanced Gym Style */}
            <motion.div 
              className="lg:col-span-1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <img src={ArnoldBg} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      🖼️ PROFILE PICTURE
                    </h2>
                    <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                      CLOUDINARY
                    </div>
                  </div>
                  <ImageUploader
                    currentImage={user?.profileImage}
                    onImageUpdate={handleImageUpdate}
                  />
                  <div className="mt-6 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600/30">
                    <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Cross-device sync enabled
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400 text-sm">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      Stored securely in cloud
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Information - Enhanced */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50">
                {/* Card Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <img src={ChrisBg} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="relative z-10 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <h2 className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                        📝 PROFILE INFORMATION
                      </h2>
                      {user?.synced === false && (
                        <div className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                          PENDING SYNC
                        </div>
                      )}
                    </div>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-lg transition-all duration-300"
                      >
                        ✏️ EDIT
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <form onSubmit={handleSaveProfile} className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                          required
                        />
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-full shadow-lg transition-all duration-300 disabled:opacity-50"
                        >
                          {saving ? '🔄 SAVING...' : '💾 SAVE CHANGES'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false);
                            setFormData({
                              name: user?.name || '',
                              email: user?.email || ''
                            });
                          }}
                          className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold rounded-full shadow-lg transition-all duration-300"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Full Name
                          </label>
                          <div className="text-white text-xl font-semibold">{user?.name || 'Not set'}</div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Email Address
                          </label>
                          <div className="text-white text-xl font-semibold">{user?.email || 'Not set'}</div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Member Since
                          </label>
                          <div className="text-white font-semibold">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Account Status
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 font-bold">Active • Real-time Sync Enabled</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Data Storage
                          </label>
                          <div className="text-white font-semibold text-sm">
                            📊 MongoDB Database • ☁️ Cloudinary Images • 🔄 Cross-device Sync
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Enhanced Progress Stats with Gym Theme */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <img src={GymBg2} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      📊 YOUR PROGRESS
                    </h2>
                    <div className={`px-4 py-2 rounded-full border-2 ${
                      stats?.isRealTime 
                        ? 'bg-green-500/20 text-green-400 border-green-400 animate-pulse' 
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-400'
                    }`}>
                      <span className="font-bold text-sm">
                        {stats?.isRealTime ? 'LIVE DATA' : 'CACHED'}
                      </span>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">
                    {stats?.lastSync ? `Updated: ${new Date(stats.lastSync).toLocaleTimeString()}` : 'Loading...'}
                  </span>
                </div>
                
                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <motion.div 
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 p-6 hover:scale-105 transition-transform duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-black text-blue-400 mb-2">{stats?.totalWorkouts || 0}</div>
                      <div className="text-sm text-slate-300 font-bold uppercase tracking-wider">Total Workouts</div>
                      {stats?.totalWorkouts > 0 && (
                        <div className="text-xs text-blue-300 mt-2 font-semibold">
                          💪 {stats?.averageWorkoutDuration || 0}min avg
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 p-6 hover:scale-105 transition-transform duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-black text-green-400 mb-2">{stats?.totalMeals || 0}</div>
                      <div className="text-sm text-slate-300 font-bold uppercase tracking-wider">Meals Logged</div>
                      {stats?.totalMeals > 0 && (
                        <div className="text-xs text-green-300 mt-2 font-semibold">
                          🍽️ Nutrition tracked
                        </div>
                      )}
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 p-6 hover:scale-105 transition-transform duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-black text-purple-400 mb-2">{stats?.xpPoints || 0}</div>
                      <div className="text-sm text-slate-300 font-bold uppercase tracking-wider">XP Points</div>
                      <div className="text-xs text-purple-300 mt-2 font-semibold">
                        Level {Math.floor((stats?.xpPoints || 0) / 1000) + 1}
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 p-6 hover:scale-105 transition-transform duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-black text-orange-400 mb-2">{stats?.currentStreak || 0}</div>
                      <div className="text-sm text-slate-300 font-bold uppercase tracking-wider">Day Streak</div>
                      <div className="text-xs text-orange-300 mt-2 font-semibold">
                        {stats?.currentStreak >= 7 ? '🔥 On Fire!' : stats?.currentStreak > 0 ? '💪 Keep Going!' : '🎯 Start Today!'}
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-black text-red-400 mb-1">{stats?.totalCaloriesBurned || 0}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Calories Burned</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-black text-cyan-400 mb-1">{stats?.totalPlans || 0}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Workout Plans</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="text-2xl font-black text-yellow-400 mb-1">{stats?.membershipDays || 0}</div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Days Member</div>
                  </div>
                </div>
                
                {(!stats?.totalWorkouts && !stats?.totalMeals) && (
                  <motion.div 
                    className="text-center py-12 border-2 border-dashed border-slate-600 rounded-2xl bg-slate-800/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-2xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                      START YOUR FITNESS JOURNEY!
                    </h3>
                    <p className="text-slate-400 mb-6 text-lg">Complete your first workout or log a meal to see real-time progress here.</p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <button 
                        onClick={() => navigate('/library')}
                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-lg transition-all duration-300"
                      >
                        🏋️ START WORKOUT
                      </button>
                      <button 
                        onClick={() => navigate('/nutrition')}
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-full shadow-lg transition-all duration-300"
                      >
                        🍎 LOG MEAL
                      </button>
                      <button 
                        onClick={() => navigate('/my-plans')}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-full shadow-lg transition-all duration-300"
                      >
                        📋 CREATE PLAN
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions - Enhanced Gym Style */}
          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50">
              <div className="relative z-10 p-8">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                  <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                    ⚡ QUICK ACTIONS
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <motion.button 
                    onClick={() => navigate('/my-plans')}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 p-8 hover:scale-105 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📋</div>
                      <div className="text-white font-bold text-lg">MY PLANS</div>
                    </div>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => navigate('/analytics')}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 p-8 hover:scale-105 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
                      <div className="text-white font-bold text-lg">ANALYTICS</div>
                    </div>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => navigate('/nutrition')}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 p-8 hover:scale-105 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🍎</div>
                      <div className="text-white font-bold text-lg">NUTRITION</div>
                    </div>
                  </motion.button>
                  
                  <motion.button 
                    onClick={() => navigate('/library')}
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 p-8 hover:scale-105 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📚</div>
                      <div className="text-white font-bold text-lg">EXERCISES</div>
                    </div>
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity - Enhanced */}
          {activity.length > 0 && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50">
                <div className="relative z-10 p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      📈 RECENT ACTIVITY
                    </h2>
                    <div className="px-4 py-2 bg-blue-500/20 text-blue-400 text-sm font-bold rounded-full border border-blue-500/30">
                      {activity.length} ITEMS
                    </div>
                  </div>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {activity.slice(0, 8).map((item, index) => (
                      <motion.div 
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="text-3xl">{item.icon}</div>
                        <div className="flex-1">
                          <div className="text-white font-bold text-lg">{item.title}</div>
                          <div className="text-slate-400">{item.description}</div>
                          {item.details && (
                            <div className="text-xs text-slate-500 mt-1">
                              {Object.values(item.details).filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievements - Enhanced */}
          {achievements.length > 0 && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50">
                <div className="relative z-10 p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <h2 className="text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                      🏆 ACHIEVEMENTS
                    </h2>
                    <div className="px-4 py-2 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-full border border-yellow-500/30">
                      {achievements.length} UNLOCKED
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievements.slice(0, 6).map((achievement, index) => (
                      <motion.div 
                        key={achievement.id}
                        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 p-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-4">{achievement.icon}</div>
                          <div className="text-white font-bold text-lg mb-2">{achievement.title}</div>
                          <div className="text-slate-400 text-sm mb-3">{achievement.description}</div>
                          <div className="text-xs text-yellow-400 font-semibold">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
};

export default Profile;

// Enhanced Profile Features:
// ✅ Modern gym-themed UI with dynamic backgrounds
// ✅ Preserved all MongoDB integration and real-time functionality
// ✅ Enhanced visual hierarchy with gradient cards
// ✅ Improved typography with gym vibes
// ✅ Better responsive design
// ✅ Animated elements and hover effects
// ✅ Professional gym tracker appearance
// ✅ All original functionality maintained