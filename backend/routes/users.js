// backend/routes/users.js - Complete user routes
import express from 'express';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';
import Plan from '../models/Plan.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { settingsLimiter } from '../middleware/rateLimiter.js';

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
    // Validate user ID
    if (!req.user?.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Use Promise.allSettled for better error handling
    const results = await Promise.allSettled([
      Workout.find({ user: req.user.id }).lean(),
      Meal.find({ userId: req.user.id }).lean(),
      Plan.find({ user: req.user.id }).lean(),
      User.findById(req.user.id).lean()
    ]);

    // Extract results with fallbacks
    const workouts = results[0].status === 'fulfilled' ? results[0].value || [] : [];
    const meals = results[1].status === 'fulfilled' ? results[1].value || [] : [];
    const plans = results[2].status === 'fulfilled' ? results[2].value || [] : [];
    const user = results[3].status === 'fulfilled' ? results[3].value : null;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate real-time stats with null checks
    const completedWorkouts = workouts.filter(w => w && w.completed) || [];
    const totalCaloriesBurned = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
    const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    

    

    
    // Get today's workouts for daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayWorkouts = completedWorkouts.filter(w => {
      try {
        const workoutDate = new Date(w.createdAt);
        workoutDate.setHours(0, 0, 0, 0);
        return workoutDate.getTime() === today.getTime();
      } catch {
        return false;
      }
    });
    
    // Get this week's workouts
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekWorkouts = completedWorkouts.filter(w => {
      try {
        const workoutDate = new Date(w.createdAt);
        return workoutDate >= weekStart;
      } catch {
        return false;
      }
    });
    
    const stats = {
      totalWorkouts: completedWorkouts.length || 0,
      todayWorkouts: todayWorkouts.length || 0,
      weeklyWorkouts: weekWorkouts.length || 0,
      totalMeals: meals.length || 0,
      totalPlans: plans.length || 0,
      totalExercises: completedWorkouts.reduce((sum, w) => sum + (w.exercises?.length || 0), 0),


      totalCaloriesBurned: totalCaloriesBurned || 0,
      totalDuration: Math.round((totalDuration || 0) / 60),
      averageWorkoutDuration: completedWorkouts.length > 0 ? Math.round(totalDuration / completedWorkouts.length / 60) : 0,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalCheckIns: user.totalCheckIns || 0,
      joinDate: user.createdAt || new Date(),
      lastActive: new Date(),
      membershipDays: user.createdAt ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
      isRealTime: true,
      lastSync: new Date().toISOString(),
      dataSource: 'MongoDB',
      syncTimestamp: Date.now()
    };
    
    console.log(`✅ Real-time stats for user ${user._id}: ${completedWorkouts.length} workouts, ${plans.length} plans, ${user.currentStreak || 0} streak`);
    
    res.json(stats);
  } catch (error) {
    console.error('Real-time stats error:', error);
    
    // Return safe fallback stats instead of 500 error
    const fallbackStats = {
      totalWorkouts: 0,
      todayWorkouts: 0,
      weeklyWorkouts: 0,
      totalMeals: 0,
      totalPlans: 0,
      totalExercises: 0,

      totalCaloriesBurned: 0,
      totalDuration: 0,
      averageWorkoutDuration: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      joinDate: new Date(),
      lastActive: new Date(),
      membershipDays: 0,
      isRealTime: false,
      lastSync: new Date().toISOString(),
      dataSource: 'Fallback',
      syncTimestamp: Date.now(),
      error: 'Failed to load stats'
    };
    
    res.json(fallbackStats);
  }
});

// Get user achievements (simple endpoint to prevent 404)
router.get('/achievements', auth, async (req, res) => {
  try {
    // Return empty achievements array since achievements are removed
    res.json([]);
  } catch (error) {
    console.error('Achievements error:', error);
    res.json([]);
  }
});

// Get user's favorite workout splits
router.get('/favorites/splits', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favoriteWorkoutSplits');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      success: true,
      favorites: user.favoriteWorkoutSplits || [] 
    });
  } catch (error) {
    console.error('Error loading favorite splits:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to load favorites',
      favorites: [] 
    });
  }
});

// Add/Remove favorite workout split
router.post('/favorites/splits', auth, async (req, res) => {
  try {
    const { splitId, action } = req.body;
    
    if (!splitId || !action || !['add', 'remove'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request. splitId and action (add/remove) required' 
      });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    let favorites = user.favoriteWorkoutSplits || [];
    
    if (action === 'add') {
      if (!favorites.includes(splitId)) {
        favorites.push(splitId);
      }
    } else if (action === 'remove') {
      favorites = favorites.filter(id => id !== splitId);
    }
    
    await User.findByIdAndUpdate(
      req.user.id,
      { favoriteWorkoutSplits: favorites },
      { new: true }
    );
    
    res.json({ 
      success: true,
      favorites,
      message: `Split ${action === 'add' ? 'added to' : 'removed from'} favorites`
    });
  } catch (error) {
    console.error('Error updating favorite splits:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update favorites' 
    });
  }
});

// Get user activity with enhanced details
router.get('/activity', auth, async (req, res) => {
  try {
    const [workouts, meals] = await Promise.all([
      Workout.find({ user: req.user.id }).limit(15).sort({ createdAt: -1 }),
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





// Get user settings with improved error handling and rate limiting
router.get('/settings', settingsLimiter, auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }
    
    // Get real-time activity counts with timeout protection
    let workouts = 0, meals = 0, plans = 0;
    
    try {
      const results = await Promise.allSettled([
        Workout.countDocuments({ user: req.user.id, completed: true }),
        Meal.countDocuments({ userId: req.user.id }),
        Plan.countDocuments({ user: req.user.id })
      ]);
      
      workouts = results[0].status === 'fulfilled' ? results[0].value : 0;
      meals = results[1].status === 'fulfilled' ? results[1].value : 0;
      plans = results[2].status === 'fulfilled' ? results[2].value : 0;
    } catch (dbError) {
      console.warn('⚠️ Database query failed, using defaults:', dbError.message);
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
      // Real-time activity summary
      activitySummary: {
        totalWorkouts: workouts,
        totalMeals: meals,
        totalPlans: plans,
        currentStreak: user.currentStreak || 0,

        membershipDays: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
      },
      lastSync: new Date().toISOString(),
      isRealTime: true,
      syncTimestamp: Date.now(),
      dataSource: 'MongoDB',
      success: true
    };
    
    console.log(`✅ Settings loaded for user ${user._id}`);
    
    res.json(settings);
  } catch (error) {
    console.error('❌ Settings get error:', error.message);
    
    // Return a proper error response
    res.status(500).json({ 
      success: false,
      message: 'Failed to load settings',
      error: error.message,
      code: 'SETTINGS_LOAD_ERROR'
    });
  }
});

// Update user settings with improved error handling and rate limiting
router.put('/settings', settingsLimiter, auth, async (req, res) => {
  try {
    const { profile, fitnessGoals, notifications, privacy, preferences, data, globalSync, autoSaveTimestamp } = req.body;
    
    const updateData = {
      updatedAt: new Date(),
      lastActiveDate: new Date()
    };
    
    // Update profile fields with validation
    if (profile) {
      if (profile.name !== undefined && typeof profile.name === 'string') {
        updateData.name = profile.name.trim();
      }
      if (profile.email !== undefined && typeof profile.email === 'string') {
        updateData.email = profile.email.toLowerCase().trim();
      }
      if (profile.phone !== undefined) updateData.phone = profile.phone;
      if (profile.location !== undefined) updateData.location = profile.location;
    }
    
    // Update settings fields with validation
    if (fitnessGoals) {
      updateData.fitnessGoals = {
        goal: ['lose', 'maintain', 'gain', 'muscle', 'strength'].includes(fitnessGoals.goal) ? fitnessGoals.goal : 'maintain',
        activityLevel: ['sedentary', 'light', 'moderate', 'very', 'extra'].includes(fitnessGoals.activityLevel) ? fitnessGoals.activityLevel : 'moderate',
        targetWeight: fitnessGoals.targetWeight && !isNaN(fitnessGoals.targetWeight) ? Number(fitnessGoals.targetWeight) : null,
        weeklyGoal: Math.max(1, Math.min(7, parseInt(fitnessGoals.weeklyGoal) || 3))
      };
    }
    
    if (notifications) {
      updateData.notifications = {
        emailNotifications: Boolean(notifications.emailNotifications ?? true),
        pushNotifications: Boolean(notifications.pushNotifications ?? true),
        workoutReminders: Boolean(notifications.workoutReminders ?? true),
        mealReminders: Boolean(notifications.mealReminders ?? false),
        achievementAlerts: Boolean(notifications.achievementAlerts ?? true)
      };
    }
    
    if (privacy) {
      updateData.privacy = {
        profileVisibility: ['public', 'friends', 'private'].includes(privacy.profileVisibility) ? privacy.profileVisibility : 'public',
        dataSharing: Boolean(privacy.dataSharing ?? false),
        analyticsOptOut: Boolean(privacy.analyticsOptOut ?? false)
      };
    }
    
    if (preferences) {
      updateData.preferences = {
        theme: ['dark', 'light', 'auto'].includes(preferences.theme) ? preferences.theme : 'dark',
        language: ['en', 'es', 'fr', 'de'].includes(preferences.language) ? preferences.language : 'en',
        units: ['metric', 'imperial'].includes(preferences.units) ? preferences.units : 'metric',
        dateFormat: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(preferences.dateFormat) ? preferences.dateFormat : 'MM/DD/YYYY',
        timeFormat: ['12h', '24h'].includes(preferences.timeFormat) ? preferences.timeFormat : '12h'
      };
    }
    
    if (data) {
      updateData.dataSettings = {
        autoBackup: Boolean(data.autoBackup ?? true),
        syncAcrossDevices: Boolean(data.syncAcrossDevices ?? true),
        dataRetention: ['6months', '1year', '2years', 'forever'].includes(data.dataRetention) ? data.dataRetention : '1year'
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
      return res.status(404).json({ 
        success: false, 
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
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
    
    console.log(`✅ Settings updated for user ${user._id}`);
    
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
    console.error('❌ Settings update error:', error.message);
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update settings', 
      error: error.message,
      code: 'SETTINGS_UPDATE_ERROR',
      source: 'error'
    });
  }
});



// Helper: Get local YYYY-MM-DD string
const toLocalDateKey = (d) => {
  if (!d) return '';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Start/Continue streak - ROBUST REAL-TIME PERSISTENCE
router.post('/streak/check-in', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const todayKey = toLocalDateKey(now);
    
    const lastCheckInKey = user.lastStreakCheckIn ? toLocalDateKey(user.lastStreakCheckIn) : null;

    // Build unique active days count
    const uniqueDates = new Set();
    if (Array.isArray(user.streakHistory)) {
      user.streakHistory.forEach(h => {
        const k = toLocalDateKey(h.date);
        if (k) uniqueDates.add(k);
      });
    }
    uniqueDates.add(todayKey);

    // Check if already checked in today
    if (lastCheckInKey === todayKey && (user.currentStreak || 0) > 0) {
      const accurateTotal = Math.max(uniqueDates.size, user.currentStreak || 1);
      user.totalCheckIns = accurateTotal;
      user.longestStreak = Math.max(user.longestStreak || 0, user.currentStreak || 1);
      await user.save();

      return res.status(200).json({ 
        success: true,
        alreadyCheckedIn: true,
        message: `🔥 Streak Active Today (${user.currentStreak}d Logged)!`,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        totalCheckIns: accurateTotal,
        lastCheckInDate: todayKey,
        canCheckIn: false,
        isActiveToday: true
      });
    }

    // Calculate yesterday's key
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toLocalDateKey(yesterday);

    let newStreak = 1;
    let streakStartDate = now;

    if (lastCheckInKey) {
      if (lastCheckInKey === yesterdayKey) {
        // Consecutive day check-in: increment streak
        newStreak = (user.currentStreak || 0) + 1;
        streakStartDate = user.streakStartDate || now;
      } else if (lastCheckInKey === todayKey) {
        // Same day: preserve current
        newStreak = Math.max(1, user.currentStreak || 1);
        streakStartDate = user.streakStartDate || now;
      } else {
        // Broken streak: restart fresh from day 1
        newStreak = 1;
        streakStartDate = now;
      }
    }

    const newLongest = Math.max(user.longestStreak || 0, newStreak);
    const accurateTotal = Math.max(uniqueDates.size, newStreak);

    // Filter duplicate check-in entries for today
    const existingHistory = Array.isArray(user.streakHistory) ? user.streakHistory : [];
    const filteredHistory = existingHistory.filter(h => toLocalDateKey(h.date) !== todayKey);
    filteredHistory.push({
      date: now,
      streakDay: newStreak,
      tier: newStreak <= 7 ? 'Beginner' : newStreak <= 30 ? 'Intermediate' : newStreak <= 100 ? 'Advanced' : 'Expert'
    });

    user.currentStreak = newStreak;
    user.longestStreak = newLongest;
    user.lastStreakCheckIn = now;
    user.streakStartDate = streakStartDate;
    user.totalCheckIns = accurateTotal;
    user.streakHistory = filteredHistory;
    user.lastActiveDate = now;
    user.lastSyncDate = now;

    await user.save();

    console.log(`✅ [Streak API] User ${req.user.id} checked in: ${newStreak} days active, total logs: ${accurateTotal}`);

    return res.status(200).json({
      success: true,
      currentStreak: newStreak,
      longestStreak: newLongest,
      totalCheckIns: accurateTotal,
      lastCheckInDate: todayKey,
      streakStartDate: toLocalDateKey(streakStartDate),
      canCheckIn: false,
      isActiveToday: true,
      isRealTime: true,
      message: newStreak === 1 ? '🔥 Day 1 - Streak Started!' : `🔥 Day ${newStreak} - Streak Logged!`,
      streakHistory: filteredHistory,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('❌ Error checking in streak:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get streak status - ROBUST REAL-TIME DATA & FULL CALENDAR HISTORY
router.get('/streak/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const now = new Date();
    const todayKey = toLocalDateKey(now);
    
    const lastCheckInKey = user.lastStreakCheckIn ? toLocalDateKey(user.lastStreakCheckIn) : null;
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toLocalDateKey(yesterday);

    let currentStreak = user.currentStreak || 0;
    let streakStartDate = user.streakStartDate;

    // Check if streak was broken (more than 1 day missed)
    if (lastCheckInKey && currentStreak > 0) {
      if (lastCheckInKey !== todayKey && lastCheckInKey !== yesterdayKey) {
        // Gap of 2+ days without checkin -> Reset
        currentStreak = 0;
        streakStartDate = null;
        user.currentStreak = 0;
        user.streakStartDate = null;
        await user.save();
        console.log(`🔥 Streak reset for user ${req.user.id} due to missed days`);
      }
    }

    const isActiveToday = lastCheckInKey === todayKey && currentStreak > 0;
    const canCheckIn = !isActiveToday;

    // Calculate unique total active days
    const uniqueDates = new Set();
    if (Array.isArray(user.streakHistory)) {
      user.streakHistory.forEach(h => {
        const k = toLocalDateKey(h.date);
        if (k) uniqueDates.add(k);
      });
    }
    if (isActiveToday || currentStreak > 0) {
      uniqueDates.add(todayKey);
    }
    const accurateTotal = Math.max(uniqueDates.size, currentStreak > 0 ? currentStreak : 0);

    // Generate Weekly Progress (Sunday to Saturday)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    
    const weeklyProgress = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dKey = toLocalDateKey(d);
      const isToday = dKey === todayKey;
      const hasCheckIn = uniqueDates.has(dKey) || (isToday && isActiveToday);

      weeklyProgress.push({
        date: dKey,
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        hasCheckIn,
        completed: hasCheckIn,
        isToday,
        isPast: d < now && !isToday
      });
    }

    // Milestones
    const milestones = [
      { days: 1, title: 'First Day', tier: 'Beginner' },
      { days: 3, title: '3 Day Fire', tier: 'Beginner' },
      { days: 7, title: 'Week Warrior', tier: 'Beginner' },
      { days: 14, title: '2 Week Power', tier: 'Intermediate' },
      { days: 21, title: '3 Week Strong', tier: 'Intermediate' },
      { days: 30, title: 'Monthly Master', tier: 'Intermediate' },
      { days: 60, title: '2 Month King', tier: 'Advanced' },
      { days: 100, title: 'Century Club', tier: 'Expert' }
    ];

    const milestoneProgress = milestones.map(m => ({
      ...m,
      achieved: currentStreak >= m.days,
      progress: Math.min(currentStreak, m.days),
      remaining: Math.max(0, m.days - currentStreak),
      progressPercent: Math.min(100, (currentStreak / m.days) * 100)
    }));

    const responseData = {
      success: true,
      currentStreak,
      longestStreak: Math.max(user.longestStreak || 0, currentStreak),
      totalCheckIns: accurateTotal,
      lastCheckInDate: lastCheckInKey,
      streakStartDate: streakStartDate ? toLocalDateKey(streakStartDate) : null,
      canCheckIn,
      isActiveToday,
      milestones: milestoneProgress,
      weeklyProgress,
      streakHistory: user.streakHistory || [],
      isRealTime: true,
      lastSync: now.toISOString(),
      dataSource: 'MongoDB'
    };

    res.json(responseData);
  } catch (error) {
    console.error('❌ Error fetching streak status:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get streak details for detailed history page
router.get('/streak-details', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const workouts = await Workout.find({ userId: req.user.id, completed: true }).sort({ createdAt: -1 });
    const currentStreak = user.currentStreak || 0;
    const longestStreak = Math.max(user.longestStreak || 0, currentStreak);

    // Build timeline entries & compute accurate total unique logs
    const historyEntries = Array.isArray(user.streakHistory) ? user.streakHistory : [];
    const uniqueDates = new Set();
    historyEntries.forEach(h => {
      const k = toLocalDateKey(h.date);
      if (k) uniqueDates.add(k);
    });
    workouts.forEach(w => {
      const k = toLocalDateKey(w.createdAt);
      if (k) uniqueDates.add(k);
    });
    if (currentStreak > 0) {
      uniqueDates.add(toLocalDateKey(new Date()));
    }

    const totalLogs = Math.max(uniqueDates.size, currentStreak > 0 ? currentStreak : 0);

    // Sync accurate count to user document
    if (user.totalCheckIns !== totalLogs || user.longestStreak !== longestStreak) {
      user.totalCheckIns = totalLogs;
      user.longestStreak = longestStreak;
      await user.save();
    }
    
    // Milestones
    const milestones = [
      { days: 1, title: 'First Day', tier: 'Beginner' },
      { days: 3, title: '3 Day Fire', tier: 'Beginner' },
      { days: 7, title: 'Week Warrior', tier: 'Beginner' },
      { days: 14, title: '2 Week Power', tier: 'Intermediate' },
      { days: 21, title: '3 Week Strong', tier: 'Intermediate' },
      { days: 30, title: 'Monthly Master', tier: 'Intermediate' },
      { days: 60, title: '2 Month King', tier: 'Advanced' },
      { days: 100, title: 'Century Club', tier: 'Expert' },
      { days: 365, title: 'Year Champion', tier: 'Legendary' }
    ];

    const milestoneProgress = milestones.map(m => ({
      ...m,
      achieved: currentStreak >= m.days,
      progress: Math.min(currentStreak, m.days),
      remaining: Math.max(0, m.days - currentStreak),
      progressPercent: Math.min(100, (currentStreak / m.days) * 100)
    }));

    res.json({
      success: true,
      currentStreak,
      longestStreak,
      totalCheckIns: totalLogs,
      lastStreakCheckIn: user.lastStreakCheckIn,
      streakStartDate: user.streakStartDate,
      streakHistory: historyEntries,
      workouts: workouts.map(w => ({
        id: w._id,
        name: w.name,
        date: w.createdAt,
        duration: w.duration,
        calories: w.calories,
        completedExercises: w.completedExercises?.length || 0
      })),
      milestones: milestoneProgress
    });
  } catch (error) {
    console.error('Streak details error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
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
    Workout.find({ user: userId }),
    Meal.find({ userId }),
    Plan.find({ user: userId }),
    User.findById(userId)
  ]);
  
  const completedWorkouts = workouts.filter(w => w.completed);

  const totalCaloriesBurned = completedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalDuration = completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);

  
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
    longestStreak: user.longestStreak || 0,

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
    Workout.find({ user: userId }).limit(15).sort({ createdAt: -1 }),
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