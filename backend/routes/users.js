// backend/routes/users.js - Complete user routes
import express from 'express';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, profileImage } = req.body;
    const updateData = { name, email };
    
    // Only update profileImage if provided
    if (profileImage !== undefined) {
      updateData.profileImage = profileImage;
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload profile picture
router.post('/upload-profile-picture', auth, async (req, res) => {
  try {
    const { profileImage } = req.body;
    
    if (!profileImage) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage },
      { new: true }
    ).select('-password');
    
    res.json({ success: true, user, profileImage: user.profileImage });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
  }
});

// Get user stats
router.get('/stats', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.id });
    const meals = await Meal.find({ userId: req.user.id });
    
    const stats = {
      totalWorkouts: workouts.length,
      totalMeals: meals.length,
      totalPlans: workouts.filter(w => w.planId).length,
      currentStreak: calculateStreak(workouts),
      xpPoints: workouts.length * 100,
      joinDate: req.user.createdAt,
      lastActive: new Date()
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user activity
router.get('/activity', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.id }).limit(10).sort({ createdAt: -1 });
    const meals = await Meal.find({ userId: req.user.id }).limit(5).sort({ createdAt: -1 });
    
    const activities = [];
    
    workouts.forEach(workout => {
      activities.push({
        id: workout._id,
        type: 'workout',
        title: 'Completed Workout',
        description: workout.name || 'Workout Session',
        timestamp: workout.createdAt,
        icon: '💪'
      });
    });
    
    meals.forEach(meal => {
      activities.push({
        id: meal._id,
        type: 'meal',
        title: 'Logged Meal',
        description: meal.name,
        timestamp: meal.createdAt,
        icon: '🍽️'
      });
    });
    
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(activities.slice(0, 10));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user achievements
router.get('/achievements', auth, async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.user.id });
    const meals = await Meal.find({ userId: req.user.id });
    
    const achievements = [];
    
    if (workouts.length >= 1) {
      achievements.push({
        id: 'first-workout',
        title: 'First Steps',
        description: 'Complete your first workout',
        icon: '🎯',
        unlocked: true,
        unlockedAt: workouts[0].createdAt
      });
    }
    
    if (workouts.length >= 10) {
      achievements.push({
        id: 'workout-10',
        title: 'Consistency Builder',
        description: 'Complete 10 workouts',
        icon: '💪',
        unlocked: true,
        unlockedAt: new Date()
      });
    }
    
    if (calculateStreak(workouts) >= 7) {
      achievements.push({
        id: 'streak-7',
        title: '7 Day Streak',
        description: 'Workout for 7 consecutive days',
        icon: '🔥',
        unlocked: true,
        unlockedAt: new Date()
      });
    }
    
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

function calculateStreak(workouts) {
  if (!workouts.length) return 0;
  
  const sortedWorkouts = workouts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  let streak = 0;
  let currentDate = new Date();
  
  for (const workout of sortedWorkouts) {
    const workoutDate = new Date(workout.createdAt);
    const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= streak + 1) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }
  
  return streak;
}

export default router;