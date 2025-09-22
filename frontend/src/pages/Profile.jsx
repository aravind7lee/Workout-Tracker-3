// frontend/src/pages/Profile.jsx - WORKING PROFILE WITH MOCK DATA
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Use mock data or localStorage data
      let userData = localStorage.getItem('user');
      if (userData) {
        userData = JSON.parse(userData);
      } else {
        // Create mock user data
        userData = {
          id: 'user_123',
          name: 'John Doe',
          email: 'john.doe@example.com',
          profileImage: null,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastLogin: new Date().toISOString()
        };
        localStorage.setItem('user', JSON.stringify(userData));
      }

      setUser(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || ''
      });
    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user data in localStorage
      const updatedUser = {
        ...user,
        ...formData
      };
      
      setUser(updatedUser);
      setEditing(false);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpdate = (newImageUrl) => {
    const updatedUser = {
      ...user,
      profileImage: newImageUrl
    };
    setUser(updatedUser);
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

  if (!user) {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400 mt-1">Manage your account settings and preferences</p>
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
        {/* Profile Image Section */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-6">Profile Picture</h2>
            <ImageUploader
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
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Last Login
                  </label>
                  <div className="text-white">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-6">Account Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">12</div>
            <div className="text-sm text-slate-400">Workouts</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-green-400">45</div>
            <div className="text-sm text-slate-400">Meals Logged</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">1,250</div>
            <div className="text-sm text-slate-400">XP Points</div>
          </div>
          <div className="text-center p-4 bg-slate-700/30 rounded-lg">
            <div className="text-2xl font-bold text-orange-400">7</div>
            <div className="text-sm text-slate-400">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Profile Actions */}
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

export default Profile;