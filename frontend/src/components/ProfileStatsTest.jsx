// Test component to verify real-time profile stats
import React, { useEffect } from 'react';

const ProfileStatsTest = () => {
  useEffect(() => {
    // Create some sample data if none exists
    const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
    const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
    
    if (workouts.length === 0) {
      const sampleWorkouts = [
        {
          id: 1,
          name: 'Morning Workout',
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          exercises: [{ name: 'Push-ups', sets: 3, reps: 15 }]
        },
        {
          id: 2,
          name: 'Evening Workout',
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          exercises: [{ name: 'Squats', sets: 3, reps: 20 }]
        },
        {
          id: 3,
          name: 'Cardio Session',
          completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          exercises: [{ name: 'Running', duration: 30 }]
        }
      ];
      localStorage.setItem('workouts', JSON.stringify(sampleWorkouts));
    }
    
    if (meals.length === 0) {
      const sampleMeals = [
        {
          id: 1,
          name: 'Breakfast - Oatmeal',
          calories: 350,
          consumedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          name: 'Lunch - Chicken Salad',
          calories: 450,
          consumedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          name: 'Dinner - Grilled Salmon',
          calories: 520,
          consumedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('recentMeals', JSON.stringify(sampleMeals));
    }
  }, []);

  return null; // This is just a data setup component
};

export default ProfileStatsTest;