import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfilePictureAdvanced from '../components/ProfilePictureAdvanced';
import { realTimeStatsService } from '../services/realTimeStatsService';

const ProfileAdvanced = () => {
  const [stats, setStats] = useState(() => {
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      return {
        totalWorkouts: workouts.length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: 0,
        xpPoints: workouts.length * 100 + plans.length * 50
      };
    } catch (error) {
      return { totalWorkouts: 0, totalPlans: 0, totalMeals: 0, currentStreak: 0, xpPoints: 0 };
    }
  });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logout, updateUser, isAuthenticated } = useAuth();

  // Load user data and stats
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }
    
    // Clear any existing fake data first
    localStorage.removeItem('workouts');
    localStorage.removeItem('recentMeals');
    localStorage.removeItem('workoutPlans');
    
    // Initialize with empty arrays for clean start
    localStorage.setItem('workouts', '[]');
    localStorage.setItem('recentMeals', '[]');
    localStorage.setItem('workoutPlans', '[]');
    
    // Get stats from localStorage
    try {
      const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const currentStats = {
        totalWorkouts: workouts.length,
        totalPlans: plans.length,
        totalMeals: meals.length,
        currentStreak: 0,
        xpPoints: workouts.length * 100 + plans.length * 50
      };
      setStats(currentStats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
    setLoading(false);
  }, [navigate]);

  // Update stats when localStorage changes
  useEffect(() => {
    const updateStats = () => {
      try {
        const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
        const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
        const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
        setStats({
          totalWorkouts: workouts.length,
          totalPlans: plans.length,
          totalMeals: meals.length,
          currentStreak: 0,
          xpPoints: workouts.length * 100 + plans.length * 50
        });
      } catch (error) {
        console.error('Error updating stats:', error);
      }
    };
    
    // Listen for storage changes
    window.addEventListener('storage', updateStats);
    
    return () => {
      window.removeEventListener('storage', updateStats);
    };
  }, []);

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

    try {
      const updatedUser = { ...user, ...formData };
      updateUser(updatedUser);
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpdate = (newImageUrl) => {
    const updatedUser = { ...user, profileImage: newImageUrl };
    updateUser(updatedUser);
    // Force re-render by updating localStorage
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const currentUser = user;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400 mt-1">Manage your account and track your progress</p>
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

      {/* Your Progress - Real Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Your Progress</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{stats?.totalWorkouts || 0}</div>
            <div className="text-sm text-slate-400">Total Workouts</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{stats?.totalMeals || 0}</div>
            <div className="text-sm text-slate-400">Meals Logged</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{stats?.xpPoints || 0}</div>
            <div className="text-sm text-slate-400">XP Points</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">{stats?.currentStreak || 0}</div>
            <div className="text-sm text-slate-400">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/my-plans')}
            className="btn bg-blue-600 hover:bg-blue-700 text-white flex-col h-auto py-4"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm">My Plans</div>
          </button>
          
          <button 
            onClick={() => navigate('/analytics')}
            className="btn bg-purple-600 hover:bg-purple-700 text-white flex-col h-auto py-4"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="text-sm">Analytics</div>
          </button>
          
          <button 
            onClick={() => navigate('/nutrition')}
            className="btn bg-green-600 hover:bg-green-700 text-white flex-col h-auto py-4"
          >
            <div className="text-2xl mb-2">🍎</div>
            <div className="text-sm">Nutrition</div>
          </button>
          
          <button 
            onClick={() => navigate('/library')}
            className="btn bg-orange-600 hover:bg-orange-700 text-white flex-col h-auto py-4"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="text-sm">Exercises</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdvanced;