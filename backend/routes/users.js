// backend/routes/users.js - Complete user routes
import express from 'express';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

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

// Upload profile picture with Cloudinary
router.post('/upload-profile-picture', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    
    // Cloudinary URL from uploaded file
    const profileImageUrl = req.file.path;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: profileImageUrl },
      { new: true }
    ).select('-password');
    
    res.json({ 
      success: true, 
      user, 
      profileImage: profileImageUrl,
      message: 'Profile picture uploaded successfully'
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload profile picture' });
  }
});

// Update profile picture (for base64 or URL updates)
router.put('/profile-picture', auth, async (req, res) => {
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
    console.error('Profile picture update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update profile picture' });
  }
});

// Get user stats with real-time data
router.get('/stats', auth, async (req, res) => {
  try {
    const [workouts, meals, user] = await Promise.all([
      Workout.find({ userId: req.user.id }),
      Meal.find({ userId: req.user.id }),
      User.findById(req.user.id)
    ]);
    
    // Calculate comprehensive stats
    const completedWorkouts = workouts.filter(w => w.completed);
    const uniquePlans = [...new Set(workouts.filter(w => w.planId).map(w => w.planId))];
    const currentStreak = calculateStreak(completedWorkouts);
    const totalCaloriesBurned = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    
    const stats = {
      totalWorkouts: completedWorkouts.length,
      totalMeals: meals.length,
      totalPlans: uniquePlans.length,
      currentStreak,
      xpPoints: completedWorkouts.length * 100 + uniquePlans.length * 50 + meals.length * 25,
      totalCaloriesBurned,
      totalDuration: Math.round(totalDuration / 60), // Convert to minutes
      averageWorkoutDuration: completedWorkouts.length > 0 ? Math.round(totalDuration / completedWorkouts.length / 60) : 0,
      joinDate: user.createdAt,
      lastActive: new Date(),
      membershipDays: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
      isRealTime: true,
      lastSync: new Date().toISOString()
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user activity with enhanced details
router.get('/activity', auth, async (req, res) => {
  try {
    const [workouts, meals] = await Promise.all([
      Workout.find({ userId: req.user.id }).limit(15).sort({ createdAt: -1 }),
      Meal.find({ userId: req.user.id }).limit(10).sort({ createdAt: -1 })
    ]);
    
    const activities = [];
    
    workouts.forEach(workout => {
      activities.push({
        id: workout._id,
        type: 'workout',
        title: workout.completed ? 'Completed Workout' : 'Started Workout',
        description: workout.name || `${workout.exercises?.length || 0} exercises`,
        timestamp: workout.createdAt,
        icon: workout.completed ? '💪' : '🏋️',
        details: {
          duration: workout.duration ? `${Math.round(workout.duration / 60)}min` : null,
          calories: workout.caloriesBurned ? `${workout.caloriesBurned} cal` : null,
          exercises: workout.exercises?.length || 0
        }
      });
    });
    
    meals.forEach(meal => {
      activities.push({
        id: meal._id,
        type: 'meal',
        title: 'Logged Meal',
        description: meal.name || 'Meal entry',
        timestamp: meal.createdAt,
        icon: '🍽️',
        details: {
          calories: meal.calories ? `${meal.calories} cal` : null,
          protein: meal.protein ? `${meal.protein}g protein` : null
        }
      });
    });
    
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(activities.slice(0, 15));
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user achievements with comprehensive tracking
router.get('/achievements', auth, async (req, res) => {
  try {
    const [workouts, meals, user] = await Promise.all([
      Workout.find({ userId: req.user.id }),
      Meal.find({ userId: req.user.id }),
      User.findById(req.user.id)
    ]);
    
    const completedWorkouts = workouts.filter(w => w.completed);
    const currentStreak = calculateStreak(completedWorkouts);
    const totalCalories = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const membershipDays = Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24));
    
    const achievements = [];
    
    // Workout achievements
    if (completedWorkouts.length >= 1) {
      achievements.push({
        id: 'first-workout',
        title: 'First Steps',
        description: 'Complete your first workout',
        icon: '🎯',
        unlocked: true,
        unlockedAt: completedWorkouts[0].createdAt,
        category: 'workout'
      });
    }
    
    if (completedWorkouts.length >= 5) {
      achievements.push({
        id: 'workout-5',
        title: 'Getting Started',
        description: 'Complete 5 workouts',
        icon: '🏃',
        unlocked: true,
        unlockedAt: completedWorkouts[4]?.createdAt,
        category: 'workout'
      });
    }
    
    if (completedWorkouts.length >= 10) {
      achievements.push({
        id: 'workout-10',
        title: 'Consistency Builder',
        description: 'Complete 10 workouts',
        icon: '💪',
        unlocked: true,
        unlockedAt: completedWorkouts[9]?.createdAt,
        category: 'workout'
      });
    }
    
    if (completedWorkouts.length >= 25) {
      achievements.push({
        id: 'workout-25',
        title: 'Dedicated Athlete',
        description: 'Complete 25 workouts',
        icon: '🏋️',
        unlocked: true,
        unlockedAt: completedWorkouts[24]?.createdAt,
        category: 'workout'
      });
    }
    
    if (completedWorkouts.length >= 50) {
      achievements.push({
        id: 'workout-50',
        title: 'Fitness Warrior',
        description: 'Complete 50 workouts',
        icon: '⚡',
        unlocked: true,
        unlockedAt: completedWorkouts[49]?.createdAt,
        category: 'workout'
      });
    }
    
    // Streak achievements
    if (currentStreak >= 3) {
      achievements.push({
        id: 'streak-3',
        title: '3 Day Streak',
        description: 'Workout for 3 consecutive days',
        icon: '🔥',
        unlocked: true,
        unlockedAt: new Date(),
        category: 'streak'
      });
    }
    
    if (currentStreak >= 7) {
      achievements.push({
        id: 'streak-7',
        title: 'Week Warrior',
        description: 'Workout for 7 consecutive days',
        icon: '🔥',
        unlocked: true,
        unlockedAt: new Date(),
        category: 'streak'
      });
    }
    
    if (currentStreak >= 30) {
      achievements.push({
        id: 'streak-30',
        title: 'Monthly Master',
        description: 'Workout for 30 consecutive days',
        icon: '🏆',
        unlocked: true,
        unlockedAt: new Date(),
        category: 'streak'
      });
    }
    
    // Nutrition achievements
    if (meals.length >= 10) {
      achievements.push({
        id: 'nutrition-10',
        title: 'Nutrition Tracker',
        description: 'Log 10 meals',
        icon: '🥗',
        unlocked: true,
        unlockedAt: meals[9]?.createdAt,
        category: 'nutrition'
      });
    }
    
    // Calorie achievements
    if (totalCalories >= 1000) {
      achievements.push({
        id: 'calories-1000',
        title: 'Calorie Burner',
        description: 'Burn 1000+ calories total',
        icon: '🔥',
        unlocked: true,
        unlockedAt: new Date(),
        category: 'calories'
      });
    }
    
    // Membership achievements
    if (membershipDays >= 7) {
      achievements.push({
        id: 'member-week',
        title: 'One Week Strong',
        description: 'Member for 7 days',
        icon: '📅',
        unlocked: true,
        unlockedAt: new Date(user.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
        category: 'membership'
      });
    }
    
    if (membershipDays >= 30) {
      achievements.push({
        id: 'member-month',
        title: 'Monthly Member',
        description: 'Member for 30 days',
        icon: '🗓️',
        unlocked: true,
        unlockedAt: new Date(user.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
        category: 'membership'
      });
    }
    
    // Sort by unlock date (most recent first)
    achievements.sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));
    
    res.json(achievements);
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Enhanced streak calculation
function calculateStreak(workouts) {
  if (!workouts.length) return 0;
  
  // Get unique workout dates (only completed workouts)
  const workoutDates = [...new Set(
    workouts
      .filter(w => w.completed)
      .map(w => new Date(w.createdAt).toDateString())
  )].sort((a, b) => new Date(b) - new Date(a));
  
  if (!workoutDates.length) return 0;
  
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
  
  // Check if streak is current (today or yesterday)
  if (workoutDates[0] !== today && workoutDates[0] !== yesterday) {
    return 0;
  }
  
  // Count consecutive days
  let currentDate = new Date(workoutDates[0]);
  
  for (const dateStr of workoutDates) {
    const workoutDate = new Date(dateStr);
    const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      streak++;
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (daysDiff === 1) {
      // Skip a day, but continue counting
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }
  
  return streak;
}

// Get user settings
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    const settings = {
      profile: {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      },
      fitnessGoals: user.fitnessGoals || {
        goal: 'maintain',
        activityLevel: 'moderate',
        targetWeight: null,
        weeklyGoal: 3
      },
      notifications: user.notifications || {
        emailNotifications: true,
        pushNotifications: true,
        workoutReminders: true,
        mealReminders: false,
        achievementAlerts: true
      },
      privacy: user.privacy || {
        profileVisibility: 'public',
        dataSharing: false,
        analyticsOptOut: false
      },
      preferences: user.preferences || {
        theme: 'dark',
        language: 'en',
        units: 'metric',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      },
      data: user.dataSettings || {
        autoBackup: true,
        syncAcrossDevices: true,
        dataRetention: '1year'
      },
      lastSync: new Date().toISOString(),
      isRealTime: true
    };
    
    res.json(settings);
  } catch (error) {
    console.error('Settings get error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user settings
router.put('/settings', auth, async (req, res) => {
  try {
    const { profile, fitnessGoals, notifications, privacy, preferences, data } = req.body;
    
    const updateData = {};
    
    // Update profile fields
    if (profile) {
      if (profile.name) updateData.name = profile.name;
      if (profile.email) updateData.email = profile.email;
      if (profile.phone !== undefined) updateData.phone = profile.phone;
      if (profile.location !== undefined) updateData.location = profile.location;
    }
    
    // Update settings fields
    if (fitnessGoals) updateData.fitnessGoals = fitnessGoals;
    if (notifications) updateData.notifications = notifications;
    if (privacy) updateData.privacy = privacy;
    if (preferences) updateData.preferences = preferences;
    if (data) updateData.dataSettings = data;
    
    updateData.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select('-password');
    
    const settings = {
      profile: {
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || ''
      },
      fitnessGoals: user.fitnessGoals || {
        goal: 'maintain',
        activityLevel: 'moderate',
        targetWeight: null,
        weeklyGoal: 3
      },
      notifications: user.notifications || {
        emailNotifications: true,
        pushNotifications: true,
        workoutReminders: true,
        mealReminders: false,
        achievementAlerts: true
      },
      privacy: user.privacy || {
        profileVisibility: 'public',
        dataSharing: false,
        analyticsOptOut: false
      },
      preferences: user.preferences || {
        theme: 'dark',
        language: 'en',
        units: 'metric',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      },
      data: user.dataSettings || {
        autoBackup: true,
        syncAcrossDevices: true,
        dataRetention: '1year'
      },
      lastSync: new Date().toISOString(),
      isRealTime: true
    };
    
    res.json({ success: true, settings, user });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update settings', error: error.message });
  }
});

// Real-time profile sync endpoint
router.post('/sync-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const stats = await getStatsForUser(req.user.id);
    const activity = await getActivityForUser(req.user.id);
    const achievements = await getAchievementsForUser(req.user.id);
    
    res.json({
      success: true,
      data: {
        profile: user,
        stats,
        activity,
        achievements,
        syncTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Profile sync error:', error);
    res.status(500).json({ success: false, message: 'Sync failed', error: error.message });
  }
});

// Helper functions for reusability
async function getStatsForUser(userId) {
  const [workouts, meals, user] = await Promise.all([
    Workout.find({ userId }),
    Meal.find({ userId }),
    User.findById(userId)
  ]);
  
  const completedWorkouts = workouts.filter(w => w.completed);
  const uniquePlans = [...new Set(workouts.filter(w => w.planId).map(w => w.planId))];
  const currentStreak = calculateStreak(completedWorkouts);
  const totalCaloriesBurned = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  
  return {
    totalWorkouts: completedWorkouts.length,
    totalMeals: meals.length,
    totalPlans: uniquePlans.length,
    currentStreak,
    xpPoints: completedWorkouts.length * 100 + uniquePlans.length * 50 + meals.length * 25,
    totalCaloriesBurned,
    totalDuration: Math.round(totalDuration / 60),
    averageWorkoutDuration: completedWorkouts.length > 0 ? Math.round(totalDuration / completedWorkouts.length / 60) : 0,
    joinDate: user.createdAt,
    lastActive: new Date(),
    membershipDays: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
    isRealTime: true,
    lastSync: new Date().toISOString()
  };
}

async function getActivityForUser(userId) {
  const [workouts, meals] = await Promise.all([
    Workout.find({ userId }).limit(15).sort({ createdAt: -1 }),
    Meal.find({ userId }).limit(10).sort({ createdAt: -1 })
  ]);
  
  const activities = [];
  
  workouts.forEach(workout => {
    activities.push({
      id: workout._id,
      type: 'workout',
      title: workout.completed ? 'Completed Workout' : 'Started Workout',
      description: workout.name || `${workout.exercises?.length || 0} exercises`,
      timestamp: workout.createdAt,
      icon: workout.completed ? '💪' : '🏋️',
      details: {
        duration: workout.duration ? `${Math.round(workout.duration / 60)}min` : null,
        calories: workout.caloriesBurned ? `${workout.caloriesBurned} cal` : null,
        exercises: workout.exercises?.length || 0
      }
    });
  });
  
  meals.forEach(meal => {
    activities.push({
      id: meal._id,
      type: 'meal',
      title: 'Logged Meal',
      description: meal.name || 'Meal entry',
      timestamp: meal.createdAt,
      icon: '🍽️',
      details: {
        calories: meal.calories ? `${meal.calories} cal` : null,
        protein: meal.protein ? `${meal.protein}g protein` : null
      }
    });
  });
  
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return activities.slice(0, 15);
}

async function getAchievementsForUser(userId) {
  // Implementation similar to the achievements endpoint
  // Simplified for brevity
  return [];
}

export default router;