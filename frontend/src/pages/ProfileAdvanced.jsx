import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfilePictureAdvanced from '../components/ProfilePictureAdvanced';
import { realTimeProfileService } from '../services/realTimeProfileService';
import { onlineService } from '../services/onlineService';

const ProfileAdvanced = () => {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalPlans: 0,
    totalMeals: 0,
    currentStreak: 0,
    xpPoints: 0,
    lastSync: null,
    isRealTime: false
  });
  const [activity, setActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const syncInterval = useRef(null);
  const navigate = useNavigate();
  const { user, logout, updateUser, isAuthenticated } = useAuth();

  // Initialize real-time profile system
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    const initializeRealTimeProfile = async () => {
      try {
        // Check online status
        const online = await onlineService.checkBackendStatus();
        setIsOnline(online);
        
        if (online) {
          setSyncStatus('syncing');
          
          // Start real-time sync
          realTimeProfileService.startRealTimeSync();
          
          // Load real-time data
          await loadRealTimeData();
          
          setSyncStatus('synced');
          setLastSyncTime(new Date().toISOString());
        } else {
          setSyncStatus('offline');
          // Load local data as fallback
          loadLocalData();
        }
      } catch (error) {
        console.error('Failed to initialize real-time profile:', error);
        setSyncStatus('error');
        loadLocalData();
      } finally {
        setLoading(false);
      }
    };

    initializeRealTimeProfile();

    // Set up real-time event listeners
    const handleStatsUpdate = (data) => {
      setStats(data.stats);
      setLastSyncTime(new Date().toISOString());
    };

    const handleActivityUpdate = (data) => {
      setActivity(data.activity);
    };

    const handleSyncStatus = (data) => {
      setSyncStatus(data.status);
      if (data.timestamp) {
        setLastSyncTime(data.timestamp);
      }
    };

    const handleNetworkStatus = (data) => {
      setIsOnline(data.isOnline);
      if (data.isOnline) {
        setSyncStatus('syncing');
        setTimeout(() => loadRealTimeData(), 2000);
      } else {
        setSyncStatus('offline');
      }
    };

    realTimeProfileService.addEventListener('statsUpdated', handleStatsUpdate);
    realTimeProfileService.addEventListener('activityUpdated', handleActivityUpdate);
    realTimeProfileService.addEventListener('syncStatus', handleSyncStatus);
    realTimeProfileService.addEventListener('networkStatusChanged', handleNetworkStatus);

    // Set up sync interval
    syncInterval.current = setInterval(() => {
      if (isOnline) {
        loadRealTimeData();
      }
    }, 30000);

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
      realTimeProfileService.removeEventListener('statsUpdated', handleStatsUpdate);
      realTimeProfileService.removeEventListener('activityUpdated', handleActivityUpdate);
      realTimeProfileService.removeEventListener('syncStatus', handleSyncStatus);
      realTimeProfileService.removeEventListener('networkStatusChanged', handleNetworkStatus);
      realTimeProfileService.cleanup();
    };
  }, [navigate, isOnline]);

  // Load real-time data from MongoDB
  const loadRealTimeData = async () => {
    try {
      const [statsData, activityData, achievementsData] = await Promise.all([
        realTimeProfileService.getRealTimeStats(),
        loadActivity(),
        loadAchievements()
      ]);
      
      if (statsData) {
        setStats({
          ...statsData,
          isRealTime: true,
          lastSync: new Date().toISOString()
        });
      }
      
      if (activityData) setActivity(activityData);
      if (achievementsData) setAchievements(achievementsData);
      
    } catch (error) {
      console.error('Failed to load real-time data:', error);
      loadLocalData();
    }
  };

  // Load local data as fallback
  const loadLocalData = () => {
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      
      setStats({
        totalWorkouts: workouts.length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: calculateStreak(workouts),
        xpPoints: workouts.length * 100 + plans.length * 50,
        isRealTime: false,
        lastSync: null
      });
    } catch (error) {
      console.error('Error loading local data:', error);
    }
  };

  // Load activity data
  const loadActivity = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/users/activity`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const activityData = await response.json();
        return activityData;
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
    return [];
  };

  // Load achievements data
  const loadAchievements = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/users/achievements`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const achievementsData = await response.json();
        return achievementsData;
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
    return [];
  };

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Calculate streak function
  const calculateStreak = (workouts) => {
    if (!workouts.length) return 0;
    
    const sortedWorkouts = workouts.sort((a, b) => 
      new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date)
    );
    
    let streak = 0;
    let currentDate = new Date();
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.completedAt || workout.date);
      const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = workoutDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSyncStatus('saving');

    try {
      // Use real-time profile service for MongoDB update
      const result = await realTimeProfileService.updateProfile(formData);
      
      if (result.success) {
        updateUser(result.user);
        setEditing(false);
        setSyncStatus('synced');
        setLastSyncTime(new Date().toISOString());
        
        alert('🎉 Profile updated successfully!\n\n✅ Saved to MongoDB\n☁️ Real-time sync active\n📱 Available on all devices');
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      setSyncStatus('error');
      alert('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => {
        if (syncStatus !== 'synced') {
          setSyncStatus(isOnline ? 'idle' : 'offline');
        }
      }, 3000);
    }
  };

  const handleImageUpdate = async (newImageUrl) => {
    try {
      setSyncStatus('syncing');
      
      // Update via real-time service
      const result = await realTimeProfileService.updateProfile({ profileImage: newImageUrl });
      
      if (result.success) {
        updateUser(result.user);
        setSyncStatus('synced');
        setLastSyncTime(new Date().toISOString());
        
        // Force re-render by updating localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
      }
    } catch (error) {
      console.error('Image update failed:', error);
      setSyncStatus('error');
      
      // Fallback to local update
      const updatedUser = { ...user, profileImage: newImageUrl };
      updateUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get sync status display
  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'synced': return { icon: '✅', text: 'Synced', color: 'text-green-400' };
      case 'syncing': return { icon: '🔄', text: 'Syncing...', color: 'text-blue-400' };
      case 'saving': return { icon: '💾', text: 'Saving...', color: 'text-yellow-400' };
      case 'offline': return { icon: '📱', text: 'Offline', color: 'text-orange-400' };
      case 'error': return { icon: '❌', text: 'Error', color: 'text-red-500' };
      default: return { icon: '⚡', text: 'Ready', color: 'text-slate-400' };
    }
  };

  const statusDisplay = getSyncStatusDisplay();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading real-time profile...</p>
          <p className="mt-2 text-xs text-slate-500">Connecting to MongoDB...</p>
        </div>
      </div>
    );
  }

  const currentUser = user;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Real-Time Status Bar */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`${statusDisplay.color} text-sm font-medium`}>
              {statusDisplay.icon} {statusDisplay.text}
            </span>
            {isOnline && (
              <span className="text-xs text-green-300 bg-green-900/30 px-2 py-1 rounded-full">
                🌐 Live MongoDB
              </span>
            )}
            {stats.isRealTime && (
              <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded-full">
                ⚡ Real-time
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            {lastSyncTime && (
              <span>Last sync: {new Date(lastSyncTime).toLocaleTimeString()}</span>
            )}
            <button
              onClick={() => realTimeProfileService.forceSync()}
              className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded hover:bg-blue-800/30"
            >
              🔄 Sync
            </button>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-2">
              <span>💪</span>
              <span>My Profile</span>
              <span className="text-lg">🏋️</span>
            </h1>
            <p className="text-slate-400 mt-1">Professional Gym Tracker • Real-time MongoDB Integration</p>
            {currentUser && (
              <div className="text-xs text-green-400 mt-1">
                Logged in as: {currentUser.name} ({currentUser.email})
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="btn bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Picture</h2>
            <ProfilePictureAdvanced
              currentImage={currentUser?.profileImage}
              onImageUpdate={handleImageUpdate}
            />
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Profile Information</h2>
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
                    {saving ? 'Saving...' : '💾 Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        name: currentUser?.name || '',
                        email: currentUser?.email || ''
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
                  <div className="text-white text-lg">{currentUser?.name || 'Not provided'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Email Address
                  </label>
                  <div className="text-white text-lg">{currentUser?.email || 'Not provided'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Member Since
                  </label>
                  <div className="text-white">
                    {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Recently joined'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Last Active
                  </label>
                  <div className="text-white">Just now</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>





      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <span>🏆</span>
            <span>Achievements</span>
            <span className="text-xs bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded-full">
              {achievements.filter(a => a.unlocked).length} Unlocked
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-700/30' 
                    : 'bg-slate-700/30 border-slate-600/30'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      achievement.unlocked ? 'text-yellow-300' : 'text-slate-400'
                    }`}>
                      {achievement.title}
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <span className="text-green-400 text-sm">✓</span>
                  )}
                </div>
                <div className="text-sm text-slate-400">{achievement.description}</div>
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-yellow-400 mt-2">
                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Professional Footer */}
      <div className="card bg-gradient-to-r from-slate-800/60 to-slate-900/60">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🏆</span>
            <span className="text-lg font-semibold text-white">Professional Gym Tracker</span>
            <span className="text-2xl">🏆</span>
          </div>
          <div className="text-sm text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-4">
            <span>✅ Real-time MongoDB sync</span>
            <span className="hidden sm:inline">•</span>
            <span>💪 Professional-level tracking</span>
            <span className="hidden sm:inline">•</span>
            <span>📱 Cross-device availability</span>
            <span className="hidden sm:inline">•</span>
            <span>🔥 Gym-quality experience</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Your progress is automatically saved and synced across all devices
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdvanced;