// frontend/src/pages/Profile.jsx - ENHANCED GYM-THEMED PROFILE v2.0
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const navigate = useNavigate();

  // Force browser refresh - ENHANCED PROFILE LOADED
  console.log('🔥 ENHANCED GYM PROFILE v2.0 LOADED - NEW UI ACTIVE! 💪');

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
      const [profileRes, statsRes, activityRes] = await Promise.allSettled([
        api.get('/users/profile'),
        api.get('/users/stats'),
        api.get('/users/activity')
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
          {/* Hero Header - Perfect Alignment */}
          <motion.div 
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-red-500 via-orange-500 to-cyan-400 bg-clip-text text-transparent leading-tight"
              style={{ fontFamily: 'var(--font-heading)' }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              💪 MY PROFILE
            </motion.h1>
            <motion.div 
              className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className={`px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-full border-2 backdrop-blur-sm text-center ${
                isOnline 
                  ? 'bg-green-500/20 text-green-300 border-green-400 shadow-lg shadow-green-500/25' 
                  : 'bg-yellow-500/20 text-yellow-300 border-yellow-400 shadow-lg shadow-yellow-500/25'
              }`}>
                <span className="font-bold text-sm sm:text-base md:text-lg whitespace-nowrap">
                  {isOnline ? '🔥 LIVE SYNC' : '⚡ OFFLINE'}
                </span>
              </div>
              <button
                onClick={fetchProfileData}
                disabled={loading}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
              >
                {loading ? '🔄 SYNCING...' : '🔄 REFRESH'}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold rounded-full shadow-lg shadow-red-500/25 transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
              >
                🚪 LOGOUT
              </button>
            </motion.div>
            <motion.p 
              className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              🏋️ Professional Gym Tracker • 💾 MongoDB Database • 🔄 Cross-Device Sync
              {lastSync && (
                <span className="block text-xs sm:text-sm text-slate-400 mt-2">
                  Last sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
            </motion.p>
          </motion.div>

          {/* Profile Cards Grid - Perfect Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
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
                <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                        🖼️ PROFILE PICTURE
                      </h2>
                    </div>
                    <div className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full border border-green-500/30">
                      CLOUDINARY
                    </div>
                  </div>
                  <ImageUploader
                    currentImage={user?.profileImage}
                    onImageUpdate={handleImageUpdate}
                  />
                  <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl sm:rounded-2xl border border-slate-600/30">
                    <div className="flex items-center gap-2 text-green-400 text-xs sm:text-sm mb-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                      Cross-device sync enabled
                    </div>
                    <div className="flex items-center gap-2 text-cyan-400 text-xs sm:text-sm">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-400 rounded-full"></div>
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
                <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                          📝 PROFILE INFO
                        </h2>
                      </div>
                      {user?.synced === false && (
                        <div className="px-2 sm:px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                          PENDING SYNC
                        </div>
                      )}
                    </div>
                    {!editing && (
                      <button
                        onClick={() => setEditing(true)}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-full shadow-lg transition-all duration-300 text-sm sm:text-base whitespace-nowrap"
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

                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 text-sm sm:text-base"
                        >
                          {saving ? '🔄 SAVING...' : '💾 SAVE'}
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
                          className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 text-sm sm:text-base"
                        >
                          CANCEL
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-400 mb-1 sm:mb-2 uppercase tracking-wider">
                            Full Name
                          </label>
                          <div className="text-white text-lg sm:text-xl font-semibold break-words">{user?.name || 'Not set'}</div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-400 mb-1 sm:mb-2 uppercase tracking-wider">
                            Email Address
                          </label>
                          <div className="text-white text-lg sm:text-xl font-semibold break-words">{user?.email || 'Not set'}</div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-400 mb-1 sm:mb-2 uppercase tracking-wider">
                            Member Since
                          </label>
                          <div className="text-white text-sm sm:text-base font-semibold">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-400 mb-1 sm:mb-2 uppercase tracking-wider">
                            Account Status
                          </label>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-400 font-bold text-sm sm:text-base">Active • Real-time Sync</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-bold text-slate-400 mb-1 sm:mb-2 uppercase tracking-wider">
                            Data Storage
                          </label>
                          <div className="text-white font-semibold text-xs sm:text-sm leading-relaxed">
                            📊 MongoDB • ☁️ Cloudinary • 🔄 Cross-device
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>





          {/* Recent Activity - Enhanced */}
          {activity.length > 0 && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-black/50">
                <div className="relative z-10 p-4 sm:p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                        📈 RECENT ACTIVITY
                      </h2>
                    </div>
                    <div className="px-2 sm:px-3 lg:px-4 py-1 sm:py-2 bg-blue-500/20 text-blue-400 text-xs sm:text-sm font-bold rounded-full border border-blue-500/30">
                      {activity.length} ITEMS
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4 max-h-64 sm:max-h-80 overflow-y-auto">
                    {activity.slice(0, 8).map((item, index) => (
                      <motion.div 
                        key={item.id}
                        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-slate-800/50 rounded-lg sm:rounded-xl border border-slate-700/50 hover:bg-slate-800/70 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="text-xl sm:text-2xl lg:text-3xl flex-shrink-0">{item.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-bold text-sm sm:text-base lg:text-lg truncate">{item.title}</div>
                          <div className="text-slate-400 text-xs sm:text-sm truncate">{item.description}</div>
                          {item.details && (
                            <div className="text-xs text-slate-500 mt-1 truncate">
                              {Object.values(item.details).filter(Boolean).join(' • ')}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-semibold flex-shrink-0">
                          {new Date(item.timestamp).toLocaleDateString()}
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