import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfilePictureAdvanced from '../components/ProfilePictureAdvanced';
import { useRealTimeProfile } from '../hooks/useRealTimeProfile';
import { profileServiceReal } from '../services/profileServiceReal';

const ProfileAdvanced = () => {
  // Real-time profile data
  const {
    profile,
    stats: profileStats,
    activity,
    achievements,
    loading: profileLoading,
    error: profileError,
    updateProfile,
    uploadProfilePicture,
    refresh
  } = useRealTimeProfile();
  
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  // Use real-time data
  const user = profile;
  const stats = profileStats;
  const loading = profileLoading;

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || ''
      });
    }
  }, [profile]);

  // Redirect if no user
  useEffect(() => {
    if (!loading && (!profile || !profile.email)) {
      navigate('/login');
    }
  }, [loading, profile, navigate]);

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
      await updateProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpdate = async (imageFile) => {
    try {
      await uploadProfilePicture(imageFile);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Failed to upload image: ' + error.message);
    }
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

  if (!user || !user.email) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">❌</div>
        <h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
        <button 
          onClick={() => navigate('/login')}
          className="btn bg-blue-600 hover:bg-blue-700 text-white"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400 mt-1">
              Real-time profile synced with backend storage
              <span className="ml-2 text-green-400 text-xs">• Live Data</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={refresh}
              className="btn bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading}
            >
              {loading ? '🔄' : '🔄'} Refresh
            </button>
            <button
              onClick={handleLogout}
              className="btn bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Picture</h2>
            <ProfilePictureAdvanced
              currentImage={user.profileImage}
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
                        name: user.name || '',
                        email: user.email || ''
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
                  <div className="text-white text-lg">{user.name}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Email Address
                  </label>
                  <div className="text-white text-lg">{user.email}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Member Since
                  </label>
                  <div className="text-white">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently joined'}
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

      {/* Real-Time Stats */}
      {stats && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Your Progress</h2>
            <div className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Real-time Data
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-slate-700/30 rounded-lg relative">
              <div className="text-2xl font-bold text-blue-400">{stats.totalWorkouts || 0}</div>
              <div className="text-sm text-slate-400">Total Workouts</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg relative">
              <div className="text-2xl font-bold text-green-400">{stats.totalMeals || 0}</div>
              <div className="text-sm text-slate-400">Meals Logged</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg relative">
              <div className="text-2xl font-bold text-purple-400">{stats.xpPoints || 0}</div>
              <div className="text-sm text-slate-400">XP Points</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-center p-4 bg-slate-700/30 rounded-lg relative">
              <div className="text-2xl font-bold text-orange-400">{stats.currentStreak || 0}</div>
              <div className="text-sm text-slate-400">Day Streak</div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {activity && activity.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-3">
            {activity.slice(0, 5).map((item, index) => (
              <div key={item.id || index} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                <div className="text-2xl">{item.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-white">{item.title}</div>
                  <div className="text-sm text-slate-400">{item.description}</div>
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(item.timestamp).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <div className="text-3xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-green-400">{achievement.title}</div>
                  <div className="text-sm text-slate-400">{achievement.description}</div>
                  {achievement.unlockedAt && (
                    <div className="text-xs text-slate-500 mt-1">
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="text-green-400 text-xl">✓</div>
              </div>
            ))}
          </div>
        </div>
      )}

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