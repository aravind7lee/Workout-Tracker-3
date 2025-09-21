// frontend/src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { workoutService } from '../services/workoutService';
import { planService } from '../services/planService';
import ImageUploader from '../components/ImageUploader';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', bio: '' });
  const [stats, setStats] = useState({ workouts: 0, calories: 0, streak: 0, prs: 0 });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          bio: parsedUser.bio || 'Passionate about fitness and achieving my goals!'
        });
      }
      
      // Load real-time stats
      const workoutStats = workoutService.getWorkoutStats();
      const allWorkouts = workoutService.getAllWorkouts();
      const totalPlans = planService.getAllPlans().length;
      
      // Calculate calories (estimate 300 calories per workout)
      const totalCalories = allWorkouts.reduce((sum, workout) => {
        return sum + (workout.duration * 10); // 10 calories per minute
      }, 0);
      
      // Calculate streak (consecutive days with workouts)
      const streak = calculateStreak(allWorkouts);
      
      setStats({
        workouts: workoutStats.total,
        calories: totalCalories,
        streak: streak,
        prs: Math.floor(workoutStats.total / 5) // 1 PR per 5 workouts
      });
      
      setRecentWorkouts(allWorkouts.slice(0, 4));
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateStreak = (workouts) => {
    if (workouts.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const dateStr = currentDate.toDateString();
      const hasWorkout = workouts.some(w => 
        new Date(w.completedAt).toDateString() === dateStr
      );
      
      if (hasWorkout) {
        streak++;
      } else if (streak > 0) {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to update profile');
        return;
      }
      
      const response = await api.put('/users/profile', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setEditing(false);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.status === 401) {
        alert('Authentication failed. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        // Fallback to local storage
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setEditing(false);
        alert('Profile updated locally!');
      }
    }
  };
  

  
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      bio: user.bio || ''
    });
    setEditing(false);
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

  const token = localStorage.getItem('token');
  if (!token) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-6">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
        <p className="text-slate-400 mb-6">Please log in to view your profile</p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate('/login')}
            className="btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="btn border border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">My Profile</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="btn bg-blue-600 hover:bg-blue-700 text-white"
          >
            {editing ? 'Cancel' : '✏️ Edit Profile'}
          </button>
          <button
            onClick={handleLogout}
            className="btn bg-red-600 hover:bg-red-700 text-white"
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          <ImageUploader 
            currentImage={user?.profileImage}
            onImageUpdate={(imageData, userData) => {
              // Update user state with real-time data from MongoDB
              if (userData) {
                setUser(userData);
              } else {
                const updatedUser = { ...user, profileImage: imageData };
                setUser(updatedUser);
              }
            }}
          />
          
          <div className="flex-1 text-center sm:text-left">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 rounded bg-slate-800/60 border border-slate-700 text-white"
                  placeholder="Your name"
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2 rounded bg-slate-800/60 border border-slate-700 text-white"
                  placeholder="Your email"
                />
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-2 rounded bg-slate-800/60 border border-slate-700 text-white h-20"
                  placeholder="Tell us about yourself..."
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="btn bg-green-600 hover:bg-green-700 text-white flex-1">
                    Save
                  </button>
                  <button onClick={handleCancel} className="btn border border-slate-600 text-slate-300 hover:bg-slate-700 flex-1">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-xl sm:text-2xl font-semibold text-white mb-1">{user?.name}</div>
                <div className="text-slate-400 mb-2">{user?.email}</div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                  <span>🗺️</span>
                  <span>Member since {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'Recently'}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="text-slate-400">
                    Level {Math.floor(stats.workouts / 10) + 1}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {!editing && (
          <div className="mt-6">
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <span>📝</span> About Me
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {user?.bio || 'Passionate about fitness and achieving my goals! 💪'}
            </p>
          </div>
        )}
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="card text-center hover:scale-105 transition-transform">
          <div className="text-3xl mb-2">💪</div>
          <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
            {stats.workouts}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">Workouts</div>
          <div className="text-xs text-slate-500 mt-1">Completed</div>
        </div>
        
        <div className="card text-center hover:scale-105 transition-transform">
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
            {stats.calories.toLocaleString()}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">Calories</div>
          <div className="text-xs text-slate-500 mt-1">Burned</div>
        </div>
        
        <div className="card text-center hover:scale-105 transition-transform">
          <div className="text-3xl mb-2">⚡</div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">
            {stats.streak}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">Day Streak</div>
          <div className="text-xs text-slate-500 mt-1">Current</div>
        </div>
        
        <div className="card text-center hover:scale-105 transition-transform">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-2xl sm:text-3xl font-bold text-orange-400 mb-1">
            {stats.prs}
          </div>
          <div className="text-xs sm:text-sm text-slate-400">Personal Records</div>
          <div className="text-xs text-slate-500 mt-1">Achieved</div>
        </div>
      </div>

      {/* Recent Workouts */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
            <span>🏃</span> Recent Workouts
          </h3>
          <button
            onClick={() => navigate('/my-plans')}
            className="btn-secondary text-sm"
          >
            View All
          </button>
        </div>
        
        {recentWorkouts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🏋️</div>
            <p className="text-slate-400 mb-4">No workouts completed yet</p>
            <button
              onClick={() => navigate('/my-plans')}
              className="btn bg-blue-600 hover:bg-blue-700 text-white"
            >
              Start Your First Workout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((workout, index) => (
              <div key={workout.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-colors">
                <div className="text-2xl">💪</div>
                <div className="flex-1">
                  <div className="text-white text-sm sm:text-base font-medium">{workout.planName}</div>
                  <div className="text-slate-400 text-xs sm:text-sm">
                    {workout.exercises.length} exercises • {workout.duration} min • {new Date(workout.completedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-green-400 text-sm font-medium">✓ Completed</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Achievement Badges */}
      <div className="card">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <span>🏅</span> Achievements
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { icon: '🔥', name: 'First Workout', earned: stats.workouts >= 1 },
            { icon: '💪', name: 'Consistent', earned: stats.streak >= 3 },
            { icon: '🎯', name: '10 Workouts', earned: stats.workouts >= 10 },
            { icon: '⚡', name: 'Week Streak', earned: stats.streak >= 7 },
            { icon: '🏆', name: 'Calorie Burner', earned: stats.calories >= 1000 },
            { icon: '🌟', name: 'Dedicated', earned: stats.workouts >= 25 }
          ].map((badge, index) => (
            <div key={index} className={`p-3 rounded-lg text-center transition-all ${
              badge.earned 
                ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30' 
                : 'bg-slate-700/30 border border-slate-600 opacity-50'
            }`}>
              <div className="text-2xl mb-1">{badge.icon}</div>
              <div className="text-xs font-medium text-white">{badge.name}</div>
              {badge.earned && <div className="text-xs text-yellow-400 mt-1">Earned!</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}