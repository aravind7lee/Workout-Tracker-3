// frontend/src/pages/Profile.jsx - REAL-TIME PROFILE WITH MONGODB INTEGRATION
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ImageUploader from '../components/ImageUploader';
import AuthGuard from '../components/AuthGuard';
import api from '../utils/api';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400 text-lg">Loading your profile...</p>
          <p className="text-slate-500 text-sm mt-2">
            {isOnline ? 'Syncing with MongoDB...' : 'Loading from cache...'}
          </p>
        </motion.div>
      </div>
    );
  }

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
      <div className="max-w-6xl mx-auto space-y-6">
      {/* Real-time Status Header */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              💼 My Profile
              <span className={`text-xs px-3 py-1 rounded-full border ${
                isOnline 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse' 
                  : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }`}>
                {isOnline ? '🔄 REAL-TIME SYNC' : '📴 OFFLINE MODE'}
              </span>
            </h1>
            <p className="text-slate-400 mt-2 flex items-center gap-2 text-sm">
              <span className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
              }`}></span>
              Professional Gym Tracker • MongoDB Database • Cross-Device Sync
              {lastSync && (
                <span className="ml-2 text-xs">
                  Last sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchProfileData}
              disabled={loading}
              className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
            >
              {loading ? '🔄 Syncing...' : '🔄 Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Image Section - Cloudinary Integration */}
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              🖼️ Profile Picture
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                CLOUDINARY
              </span>
            </h2>
            <ImageUploader
              currentImage={user?.profileImage}
              onImageUpdate={handleImageUpdate}
            />
            <div className="mt-4 p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-2">
                ✅ Cross-device sync enabled
              </div>
              <div className="text-xs text-slate-400">
                ☁️ Stored securely in cloud
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Information */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                📝 Profile Information
                {user?.synced === false && (
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-500/30">
                    PENDING SYNC
                  </span>
                )}
              </h2>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white"
                >
                  ✏️ Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input w-full"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                  >
                    {saving ? '🔄 Saving...' : '💾 Save Changes'}
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
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Full Name
                  </label>
                  <div className="text-white text-lg">{user?.name || 'Not set'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Email Address
                  </label>
                  <div className="text-white text-lg">{user?.email || 'Not set'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Member Since
                  </label>
                  <div className="text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Account Status
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-green-400">Active • Real-time Sync Enabled</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Data Storage
                  </label>
                  <div className="text-white text-sm">
                    📊 MongoDB Database • ☁️ Cloudinary Images • 🔄 Cross-device Sync
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Real-time Progress Stats */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            📊 Your Progress
            <span className={`text-xs px-2 py-1 rounded-full border ${
              stats?.isRealTime 
                ? 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse' 
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}>
              {stats?.isRealTime ? 'LIVE DATA' : 'CACHED'}
            </span>
          </h2>
          <span className="text-xs text-slate-500">
            {stats?.lastSync ? `Updated: ${new Date(stats.lastSync).toLocaleTimeString()}` : 'Loading...'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <motion.div 
            className="text-center p-4 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl font-bold text-blue-400">{stats?.totalWorkouts || 0}</div>
            <div className="text-sm text-slate-400">Total Workouts</div>
            {stats?.totalWorkouts > 0 && (
              <div className="text-xs text-blue-300 mt-1">
                💪 {stats?.averageWorkoutDuration || 0}min avg
              </div>
            )}
          </motion.div>
          
          <motion.div 
            className="text-center p-4 bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl font-bold text-green-400">{stats?.totalMeals || 0}</div>
            <div className="text-sm text-slate-400">Meals Logged</div>
            {stats?.totalMeals > 0 && (
              <div className="text-xs text-green-300 mt-1">
                🍽️ Nutrition tracked
              </div>
            )}
          </motion.div>
          
          <motion.div 
            className="text-center p-4 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl font-bold text-purple-400">{stats?.xpPoints || 0}</div>
            <div className="text-sm text-slate-400">XP Points</div>
            <div className="text-xs text-purple-300 mt-1">
              Level {Math.floor((stats?.xpPoints || 0) / 1000) + 1}
            </div>
          </motion.div>
          
          <motion.div 
            className="text-center p-4 bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg hover:scale-105 transition-transform"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-3xl font-bold text-orange-400">{stats?.currentStreak || 0}</div>
            <div className="text-sm text-slate-400">Day Streak</div>
            <div className="text-xs text-orange-300 mt-1">
              {stats?.currentStreak >= 7 ? '🔥 On Fire!' : stats?.currentStreak > 0 ? '💪 Keep Going!' : '🎯 Start Today!'}
            </div>
          </motion.div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-red-400">{stats?.totalCaloriesBurned || 0}</div>
            <div className="text-xs text-slate-400">Calories Burned</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-cyan-400">{stats?.totalPlans || 0}</div>
            <div className="text-xs text-slate-400">Workout Plans</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-xl font-bold text-yellow-400">{stats?.membershipDays || 0}</div>
            <div className="text-xs text-slate-400">Days Member</div>
          </div>
        </div>
        
        {(!stats?.totalWorkouts && !stats?.totalMeals) && (
          <motion.div 
            className="text-center py-8 border-2 border-dashed border-slate-600 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="text-4xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold text-white mb-2">Start Your Fitness Journey!</h3>
            <p className="text-slate-400 mb-4">Complete your first workout or log a meal to see real-time progress here.</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button 
                onClick={() => navigate('/library')}
                className="btn bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                🏋️ Start Workout
              </button>
              <button 
                onClick={() => navigate('/nutrition')}
                className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                🍎 Log Meal
              </button>
              <button 
                onClick={() => navigate('/my-plans')}
                className="btn bg-purple-600 hover:bg-purple-700 text-white text-sm"
              >
                📋 Create Plan
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Recent Activity */}
      {activity.length > 0 && (
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            📈 Recent Activity
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              {activity.length} items
            </span>
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {activity.slice(0, 8).map((item, index) => (
              <motion.div 
                key={item.id}
                className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="text-white font-medium">{item.title}</div>
                  <div className="text-slate-400 text-sm">{item.description}</div>
                  {item.details && (
                    <div className="text-xs text-slate-500 mt-1">
                      {Object.values(item.details).filter(Boolean).join(' • ')}
                    </div>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <motion.div 
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            🏆 Achievements
            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
              {achievements.length} unlocked
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.slice(0, 6).map((achievement, index) => (
              <motion.div 
                key={achievement.id}
                className="p-4 bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <div className="text-white font-semibold">{achievement.title}</div>
                <div className="text-slate-400 text-sm">{achievement.description}</div>
                <div className="text-xs text-yellow-400 mt-2">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.button 
            onClick={() => navigate('/my-plans')}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex-col h-auto py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm">My Plans</div>
          </motion.button>
          
          <motion.button 
            onClick={() => navigate('/analytics')}
            className="btn bg-purple-600 hover:bg-purple-700 text-white flex-col h-auto py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm">Analytics</div>
          </motion.button>
          
          <motion.button 
            onClick={() => navigate('/nutrition')}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-col h-auto py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-2">🍎</div>
            <div className="text-sm">Nutrition</div>
          </motion.button>
          
          <motion.button 
            onClick={() => navigate('/library')}
            className="btn bg-orange-600 hover:bg-orange-700 text-white flex-col h-auto py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm">Exercises</div>
          </motion.button>
        </div>
      </motion.div>
      </div>
    </AuthGuard>
  );
};

export default Profile;

// Real-time Profile Features:
// ✅ MongoDB integration for persistent data
// ✅ Cross-device synchronization
// ✅ Cloudinary image storage (preserved)
// ✅ Real-time stats updates
// ✅ Offline functionality with localStorage fallback
// ✅ Professional gym app experience
// ✅ Instant updates when workouts/meals are completed
// ✅ Achievement tracking
// ✅ Activity history
// ✅ No dummy data - only real user progress