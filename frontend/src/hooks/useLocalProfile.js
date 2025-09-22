// Local profile hook - works without backend API
import { useState, useEffect } from 'react';

export function useLocalProfile() {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        setProfile(JSON.parse(userData));
      }
      
      // Calculate stats from localStorage
      const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      
      const calculatedStats = {
        totalWorkouts: workouts.length,
        totalMeals: meals.length,
        totalPlans: plans.length,
        currentStreak: calculateStreak(workouts),
        xpPoints: workouts.length * 100 + plans.length * 50,
        joinDate: plans.length > 0 ? plans[0].createdAt : new Date().toISOString(),
        lastActive: workouts.length > 0 ? workouts[0].completedAt : new Date().toISOString()
      };
      
      setStats(calculatedStats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...profileData };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfile(updatedUser);
      
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

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

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
    refresh: loadProfile
  };
}