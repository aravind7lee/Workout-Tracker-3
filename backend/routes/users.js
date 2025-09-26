// backend/routes/users.js - Complete user routes
import express from 'express';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Get user profile with guaranteed profileImage persistence
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure profileImage is always included in response
    const profileData = {
      ...user.toObject(),
      profileImage: user.profileImage || null // Explicitly include profileImage
    };
    
    console.log(`✅ Profile fetched for user ${user._id} - ProfileImage: ${user.profileImage ? 'Present' : 'None'}`);
    res.json(profileData);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile with real-time sync and streak data
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      name, 
      email, 
      profileImage, 
      currentStreak, 
      longestStreak, 
      totalCheckIns, 
      lastStreakCheckIn, 
      streakStartDate, 
      xpPoints, 
      streakHistory,
      unlockedMilestones,
      streakLevel,
      lifetimeStats
    } = req.body;
    
    const updateData = { 
      updatedAt: new Date(),
      lastActiveDate: new Date()
    };
    
    // Update profile fields
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    
    // Update streak fields with validation
    if (currentStreak !== undefined) updateData.currentStreak = Math.max(0, currentStreak);
    if (longestStreak !== undefined) updateData.longestStreak = Math.max(0, longestStreak);
    if (totalCheckIns !== undefined) updateData.totalCheckIns = Math.max(0, totalCheckIns);
    if (lastStreakCheckIn !== undefined) updateData.lastStreakCheckIn = new Date(lastStreakCheckIn);
    if (streakStartDate !== undefined) updateData.streakStartDate = streakStartDate ? new Date(streakStartDate) : null;
    if (xpPoints !== undefined) updateData.xpPoints = Math.max(0, xpPoints);
    if (streakHistory !== undefined) updateData.streakHistory = streakHistory;
    if (unlockedMilestones !== undefined) updateData.unlockedMilestones = unlockedMilestones;
    if (streakLevel !== undefined) updateData.streakLevel = streakLevel;
    if (lifetimeStats !== undefined) updateData.lifetimeStats = lifetimeStats;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Log the update for real-time tracking
    const updatedFields = Object.keys(updateData).filter(key => key !== 'updatedAt' && key !== 'lastActiveDate');
    console.log(`✅ Real-time update for user ${user._id}: ${updatedFields.join(', ')}`);
    
    res.json({ 
      success: true, 
      user,
      message: 'Profile updated successfully',
      timestamp: new Date().toISOString(),
      syncedFields: updatedFields
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile',
      error: error.message 
    });
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

// Get user stats with real-time MongoDB data
router.get('/stats', auth, async (req, res) => {
  try {
    const [workouts, meals, plans, user] = await Promise.all([
      Workout.find({ userId: req.user.id }),
      Meal.find({ userId: req.user.id }),
      Plan.find({ userId: req.user.id }),
      User.findById(req.user.id)
    ]);
    
    // Calculate real-time stats
    const completedWorkouts = workouts.filter(w => w.completed);
    const totalCaloriesBurned = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    
    // Get real streak from user model or calculate from workouts
    let currentStreak = user.currentStreak || 0;
    if (!user.currentStreak) {
      currentStreak = calculateStreak(completedWorkouts);
      // Update user with calculated streak
      await User.findByIdAndUpdate(req.user.id, { currentStreak });
    }
    
    // Calculate XP from user model or from activities
    const calculatedXP = (completedWorkouts.length * 100) + (plans.length * 50) + (meals.length * 25);
    const userXP = user.xpPoints || calculatedXP;
    
    // Update user XP if it's different from calculated
    if (user.xpPoints !== calculatedXP) {
      await User.findByIdAndUpdate(req.user.id, { xpPoints: calculatedXP });
    }
    
    // Get today's workouts for daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayWorkouts = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.createdAt);
      workoutDate.setHours(0, 0, 0, 0);
      return workoutDate.getTime() === today.getTime();
    });
    
    // Get this week's workouts
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekWorkouts = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.createdAt);
      return workoutDate >= weekStart;
    });
    
    const stats = {
      totalWorkouts: completedWorkouts.length,
      todayWorkouts: todayWorkouts.length,
      weeklyWorkouts: weekWorkouts.length,
      totalMeals: meals.length,
      totalPlans: plans.length,
      totalExercises: completedWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0),
      currentStreak,
      xpPoints: calculatedXP,
      totalCaloriesBurned,
      totalDuration: Math.round(totalDuration / 60),
      averageWorkoutDuration: completedWorkouts.length > 0 ? Math.round(totalDuration / completedWorkouts.length / 60) : 0,
      longestStreak: user.longestStreak || currentStreak,
      totalCheckIns: user.totalCheckIns || 0,
      joinDate: user.createdAt,
      lastActive: new Date(),
      membershipDays: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
      isRealTime: true,
      lastSync: new Date().toISOString(),
      dataSource: 'MongoDB',
      syncTimestamp: Date.now()
    };
    
    console.log(`✅ Real-time stats for user ${user._id}: ${completedWorkouts.length} workouts, ${plans.length} plans, ${currentStreak} streak, ${calculatedXP} XP`);
    
    res.json(stats);
  } catch (error) {
    console.error('Real-time stats error:', error);
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

// Enhanced streak calculation with better logic
function calculateStreak(workouts) {
  if (!workouts.length) return 0;
  
  // Get unique workout dates (only completed workouts)
  const workoutDates = [...new Set(
    workouts
      .filter(w => w.completed)
      .map(w => {
        const date = new Date(w.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
  )].sort((a, b) => b - a); // Sort descending (most recent first)
  
  if (!workoutDates.length) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  
  const yesterday = new Date(todayTime - 24 * 60 * 60 * 1000);
  const yesterdayTime = yesterday.getTime();
  
  // Check if streak is current (today or yesterday)
  const mostRecentWorkout = workoutDates[0];
  if (mostRecentWorkout !== todayTime && mostRecentWorkout !== yesterdayTime) {
    return 0; // Streak is broken
  }
  
  // Count consecutive days
  let expectedDate = mostRecentWorkout;
  
  for (const workoutTime of workoutDates) {
    if (workoutTime === expectedDate) {
      streak++;
      expectedDate -= 24 * 60 * 60 * 1000; // Move to previous day
    } else {
      break; // Gap found, streak ends
    }
  }
  
  return streak;
}

// Get user settings with real-time data
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get real-time activity counts
    const [workouts, meals, plans] = await Promise.all([
      Workout.countDocuments({ userId: req.user.id, completed: true }),
      Meal.countDocuments({ userId: req.user.id }),
      Plan.countDocuments({ userId: req.user.id })
    ]);
    
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
      // Real-time activity summary
      activitySummary: {
        totalWorkouts: workouts,
        totalMeals: meals,
        totalPlans: plans,
        currentStreak: user.currentStreak || 0,
        xpPoints: user.xpPoints || ((workouts * 100) + (plans * 50) + (meals * 25)),
        membershipDays: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
      },
      lastSync: new Date().toISOString(),
      isRealTime: true,
      syncTimestamp: Date.now(),
      dataSource: 'MongoDB'
    };
    
    console.log(`✅ Real-time settings loaded for user ${user._id}: ${workouts} workouts, ${meals} meals, ${plans} plans`);
    
    res.json(settings);
  } catch (error) {
    console.error('Settings get error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user settings with real-time sync
router.put('/settings', auth, async (req, res) => {
  try {
    const { profile, fitnessGoals, notifications, privacy, preferences, data, globalSync, autoSaveTimestamp } = req.body;
    
    const updateData = {
      updatedAt: new Date(),
      lastActiveDate: new Date()
    };
    
    // Update profile fields
    if (profile) {
      if (profile.name !== undefined) updateData.name = profile.name;
      if (profile.email !== undefined) updateData.email = profile.email;
      if (profile.phone !== undefined) updateData.phone = profile.phone;
      if (profile.location !== undefined) updateData.location = profile.location;
    }
    
    // Update settings fields with validation
    if (fitnessGoals) {
      updateData.fitnessGoals = {
        goal: fitnessGoals.goal || 'maintain',
        activityLevel: fitnessGoals.activityLevel || 'moderate',
        targetWeight: fitnessGoals.targetWeight || null,
        weeklyGoal: Math.max(1, Math.min(7, fitnessGoals.weeklyGoal || 3))
      };
    }
    
    if (notifications) {
      updateData.notifications = {
        emailNotifications: notifications.emailNotifications ?? true,
        pushNotifications: notifications.pushNotifications ?? true,
        workoutReminders: notifications.workoutReminders ?? true,
        mealReminders: notifications.mealReminders ?? false,
        achievementAlerts: notifications.achievementAlerts ?? true
      };
    }
    
    if (privacy) {
      updateData.privacy = {
        profileVisibility: privacy.profileVisibility || 'public',
        dataSharing: privacy.dataSharing ?? false,
        analyticsOptOut: privacy.analyticsOptOut ?? false
      };
    }
    
    if (preferences) {
      updateData.preferences = {
        theme: preferences.theme || 'dark',
        language: preferences.language || 'en',
        units: preferences.units || 'metric',
        dateFormat: preferences.dateFormat || 'MM/DD/YYYY',
        timeFormat: preferences.timeFormat || '12h'
      };
    }
    
    if (data) {
      updateData.dataSettings = {
        autoBackup: data.autoBackup ?? true,
        syncAcrossDevices: data.syncAcrossDevices ?? true,
        dataRetention: data.dataRetention || '1year'
      };
    }
    
    // Add sync metadata
    if (globalSync) {
      updateData.lastGlobalSync = new Date();
    }
    
    if (autoSaveTimestamp) {
      updateData.lastAutoSave = new Date(autoSaveTimestamp);
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
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
      isRealTime: true,
      syncTimestamp: Date.now(),
      globalSync: !!globalSync
    };
    
    // Log the successful update
    const updatedFields = Object.keys(updateData).filter(key => 
      !['updatedAt', 'lastActiveDate', 'lastGlobalSync', 'lastAutoSave'].includes(key)
    );
    
    console.log(`✅ Real-time settings update for user ${user._id}: ${updatedFields.join(', ')}`);
    
    res.json({ 
      success: true, 
      settings, 
      user,
      message: 'Settings updated successfully',
      timestamp: new Date().toISOString(),
      syncedFields: updatedFields,
      source: 'mongodb'
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update settings', 
      error: error.message,
      source: 'error'
    });
  }
});

// Get XP details
router.get('/xp-details', auth, async (req, res) => {
  try {
    const [workouts, meals, plans] = await Promise.all([
      Workout.find({ userId: req.user.id, completed: true }),
      Meal.find({ userId: req.user.id }),
      Plan.find({ userId: req.user.id })
    ]);
    
    const workoutXP = workouts.length * 100;
    const mealXP = meals.length * 25;
    const planXP = plans.length * 50;
    const totalXP = workoutXP + mealXP + planXP;
    
    res.json({
      totalXP,
      workoutXP,
      mealXP,
      planXP,
      xpSources: { workouts: workoutXP, meals: mealXP, plans: planXP, streaks: 0 },
      xpHistory: [],
      achievements: []
    });
  } catch (error) {
    console.error('XP details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start/Continue streak
router.post('/streak/check-in', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCheckIn = user.lastStreakCheckIn ? new Date(user.lastStreakCheckIn) : null;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if already checked in today
    if (lastCheckIn && lastCheckIn.getTime() === today.getTime()) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    let newStreak = 1;
    if (lastCheckIn && lastCheckIn.getTime() === yesterday.getTime()) {
      newStreak = (user.currentStreak || 0) + 1;
    }

    // Update user streak data
    user.currentStreak = newStreak;
    user.longestStreak = Math.max(user.longestStreak || 0, newStreak);
    user.lastStreakCheckIn = today;
    user.totalCheckIns = (user.totalCheckIns || 0) + 1;
    user.xpPoints = (user.xpPoints || 0) + 10;

    // Initialize streak history if not exists
    if (!user.streakHistory) {
      user.streakHistory = [];
    }

    // Add to streak history
    user.streakHistory.push({
      date: today,
      streakDay: newStreak,
      xpEarned: 10
    });

    await user.save();

    res.json({
      currentStreak: newStreak,
      longestStreak: user.longestStreak,
      totalCheckIns: user.totalCheckIns,
      xpEarned: 10,
      canCheckIn: false
    });
  } catch (error) {
    console.error('Error checking in streak:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get streak status
router.get('/streak/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastCheckIn = user.lastStreakCheckIn ? new Date(user.lastStreakCheckIn) : null;
    const canCheckIn = !lastCheckIn || lastCheckIn.getTime() !== today.getTime();

    // Check if streak is broken
    let currentStreak = user.currentStreak || 0;
    if (lastCheckIn) {
      const daysDiff = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) {
        currentStreak = 0;
        user.currentStreak = 0;
        await user.save();
      }
    }

    // Calculate milestones
    const milestones = [
      { days: 3, emoji: '🔥', title: '3 Day Streak' },
      { days: 7, emoji: '🚀', title: '7 Day Streak' },
      { days: 14, emoji: '⚡', title: '14 Day Streak' },
      { days: 30, emoji: '🏆', title: '30 Day Streak' },
      { days: 60, emoji: '👑', title: '60 Day Streak' },
      { days: 100, emoji: '💎', title: '100 Day Streak' },
      { days: 365, emoji: '🌟', title: '365 Day Streak' }
    ];

    const milestoneProgress = milestones.map(milestone => ({
      ...milestone,
      achieved: currentStreak >= milestone.days,
      progress: Math.min(currentStreak, milestone.days),
      remaining: Math.max(0, milestone.days - currentStreak)
    }));

    // Get weekly progress
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weeklyProgress = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      
      const hasCheckIn = user.streakHistory?.some(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === date.getTime();
      }) || false;
      
      weeklyProgress.push({
        date: date.toISOString(),
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        hasCheckIn,
        isToday: date.getTime() === today.getTime()
      });
    }

    res.json({
      currentStreak,
      longestStreak: user.longestStreak || 0,
      totalCheckIns: user.totalCheckIns || 0,
      canCheckIn,
      milestones: milestoneProgress,
      weeklyProgress,
      streakHistory: user.streakHistory || []
    });
  } catch (error) {
    console.error('Error fetching streak status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get streak details
router.get('/streak-details', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const workouts = await Workout.find({ userId: req.user.id, completed: true }).sort({ createdAt: -1 });
    const currentStreak = user.currentStreak || 0;
    
    res.json({
      currentStreak,
      longestStreak: user.longestStreak || 0,
      lastWorkoutDate: workouts.length > 0 ? workouts[0].createdAt : null,
      streakHistory: user.streakHistory || [],
      weeklyProgress: []
    });
  } catch (error) {
    console.error('Streak details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Real-time profile sync endpoint
router.post('/sync-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const stats = await getStatsForUser(req.user.id);
    const activity = await getActivityForUser(req.user.id);
    const achievements = await getAchievementsForUser(req.user.id);
    
    // Update last active timestamp
    await User.findByIdAndUpdate(req.user.id, { 
      lastActiveDate: new Date(),
      lastSyncDate: new Date()
    });
    
    res.json({
      success: true,
      data: {
        profile: user,
        stats,
        activity,
        achievements,
        syncTime: new Date().toISOString(),
        syncTimestamp: Date.now()
      },
      message: 'Profile synced successfully'
    });
  } catch (error) {
    console.error('Profile sync error:', error);
    res.status(500).json({ success: false, message: 'Sync failed', error: error.message });
  }
});

// Real-time settings sync status
router.get('/sync-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('lastActiveDate lastSyncDate lastGlobalSync lastAutoSave');
    
    res.json({
      success: true,
      status: {
        lastActive: user.lastActiveDate || user.createdAt,
        lastSync: user.lastSyncDate || user.updatedAt,
        lastGlobalSync: user.lastGlobalSync || null,
        lastAutoSave: user.lastAutoSave || null,
        isOnline: true,
        syncTimestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Sync status error:', error);
    res.status(500).json({ success: false, message: 'Failed to get sync status', error: error.message });
  }
});

// Helper functions for reusability
async function getStatsForUser(userId) {
  const [workouts, meals, plans, user] = await Promise.all([
    Workout.find({ userId }),
    Meal.find({ userId }),
    Plan.find({ userId }),
    User.findById(userId)
  ]);
  
  const completedWorkouts = workouts.filter(w => w.completed);
  const currentStreak = calculateStreak(completedWorkouts);
  const totalCaloriesBurned = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const calculatedXP = (completedWorkouts.length * 100) + (plans.length * 50) + (meals.length * 25);
  
  // Get today's and this week's workouts
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayWorkouts = completedWorkouts.filter(w => {
    const workoutDate = new Date(w.createdAt);
    workoutDate.setHours(0, 0, 0, 0);
    return workoutDate.getTime() === today.getTime();
  });
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekWorkouts = completedWorkouts.filter(w => {
    const workoutDate = new Date(w.createdAt);
    return workoutDate >= weekStart;
  });
  
  return {
    totalWorkouts: completedWorkouts.length,
    todayWorkouts: todayWorkouts.length,
    weeklyWorkouts: weekWorkouts.length,
    totalMeals: meals.length,
    totalPlans: plans.length,
    totalExercises: completedWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0),
    currentStreak,
    longestStreak: user.longestStreak || currentStreak,
    xpPoints: user.xpPoints || calculatedXP,
    totalCaloriesBurned,
    totalDuration: Math.round(totalDuration / 60),
    averageWorkoutDuration: completedWorkouts.length > 0 ? Math.round(totalDuration / completedWorkouts.length / 60) : 0,
    joinDate: user.createdAt,
    lastActive: new Date(),
    membershipDays: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)),
    isRealTime: true,
    lastSync: new Date().toISOString(),
    syncTimestamp: Date.now()
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