import express from 'express';
import auth from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Get user stats
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      totalWorkouts: 24,
      totalMeals: 156,
      currentStreak: 7,
      xpPoints: 1250,
      joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      lastActive: new Date()
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get calorie trends (last 7 days)
router.get('/calories', async (req, res) => {
  try {
    const calorieData = [
      { date: '2024-01-15', calories: 2200, day: 'Mon' },
      { date: '2024-01-16', calories: 2100, day: 'Tue' },
      { date: '2024-01-17', calories: 2350, day: 'Wed' },
      { date: '2024-01-18', calories: 2000, day: 'Thu' },
      { date: '2024-01-19', calories: 2400, day: 'Fri' },
      { date: '2024-01-20', calories: 2600, day: 'Sat' },
      { date: '2024-01-21', calories: 2300, day: 'Sun' }
    ];

    res.json({ success: true, data: calorieData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get workout frequency
router.get('/frequency', async (req, res) => {
  try {
    const frequencyData = [
      { day: 'Mon', workouts: 2 },
      { day: 'Tue', workouts: 1 },
      { day: 'Wed', workouts: 3 },
      { day: 'Thu', workouts: 1 },
      { day: 'Fri', workouts: 2 },
      { day: 'Sat', workouts: 4 },
      { day: 'Sun', workouts: 1 }
    ];

    res.json({ success: true, data: frequencyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get muscle group distribution
router.get('/muscles', async (req, res) => {
  try {
    const muscleData = [
      { muscle: 'Chest', percentage: 25, color: '#3B82F6' },
      { muscle: 'Back', percentage: 20, color: '#10B981' },
      { muscle: 'Legs', percentage: 30, color: '#F59E0B' },
      { muscle: 'Arms', percentage: 15, color: '#EF4444' },
      { muscle: 'Shoulders', percentage: 10, color: '#8B5CF6' }
    ];

    res.json({ success: true, data: muscleData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get hero stats for real-time display
router.get('/hero-stats', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.json({ 
        success: true, 
        data: {
          workouts: 0,
          totalWorkouts: 0,
          meals: 0,
          totalMeals: 0,
          xpPoints: 0,
          streak: 0,
          currentStreak: 0,
          weeklyGoal: { completed: 0, target: 4, percentage: 0 },
          isRealTime: true,
          lastSync: new Date().toISOString(),
          dataSource: 'MongoDB'
        }
      });
    }

    // Import models
    const User = (await import('../models/User.js')).default;
    const Workout = (await import('../models/Workout.js')).default;
    const Meal = (await import('../models/Meal.js')).default;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Count total workouts (both completed and in-progress)
    const totalWorkouts = await Workout.countDocuments({ user: userId });
    const completedWorkouts = await Workout.countDocuments({ user: userId, completed: true });
    
    // Count total meals (handle both userId and user fields for backward compatibility)
    const totalMealsWithUserId = await Meal.countDocuments({ userId });
    const totalMealsWithUser = await Meal.countDocuments({ user: userId });
    const totalMeals = totalMealsWithUserId + totalMealsWithUser;
    
    // Auto-migrate meals with wrong field name
    if (totalMealsWithUser > 0) {
      try {
        await Meal.updateMany(
          { user: userId },
          { 
            $set: { userId: userId },
            $unset: { user: 1 }
          }
        );
        console.log(`✅ Auto-migrated ${totalMealsWithUser} meals for user ${userId}`);
      } catch (migrationError) {
        console.error('Auto-migration failed:', migrationError);
      }
    }
    
    // Calculate XP points (100 per completed workout, 50 per meal)
    const xpPoints = (completedWorkouts * 100) + (totalMeals * 50);
    
    // Get streak from user model (consistent with dedicated endpoint)
    let streak = user.currentStreak || 0;
    
    // Validate streak is still current
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastCheckIn = user.lastStreakCheckIn ? new Date(user.lastStreakCheckIn) : null;
    
    if (lastCheckIn && streak > 0) {
      lastCheckIn.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24));
      if (daysDiff > 1) {
        // Streak is broken - should be updated in database
        streak = 0;
        console.log(`⚠️ Streak broken for user ${userId} - ${daysDiff} days gap`);
      }
    }
    
    console.log(`🔥 Using streak from user model: ${streak} days`);
    
    // Calculate weekly goal progress
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyWorkouts = await Workout.countDocuments({
      user: userId,
      completed: true,
      createdAt: { $gte: startOfWeek }
    });
    
    const weeklyTarget = 4;
    const weeklyPercentage = Math.min((weeklyWorkouts / weeklyTarget) * 100, 100);

    const heroStats = {
      workouts: completedWorkouts,
      totalWorkouts: completedWorkouts,
      meals: totalMeals,
      totalMeals,
      xpPoints,
      streak,
      currentStreak: streak,
      weeklyGoal: {
        completed: weeklyWorkouts,
        target: weeklyTarget,
        percentage: weeklyPercentage
      },
      isRealTime: true,
      lastSync: new Date().toISOString(),
      dataSource: 'MongoDB',
      timestamp: Date.now()
    };

    console.log(`✅ Real-time hero stats for user ${userId}:`, {
      ...heroStats,
      streakCalculation: `${streak} days calculated from activities`
    });
    res.json({ success: true, data: heroStats });
  } catch (error) {
    console.error('❌ Hero stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track workout completion with achievement checking
router.post('/track-workout-completion', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const Workout = (await import('../models/Workout.js')).default;
    const Achievement = (await import('../models/Achievement.js')).default;
    
    // Create workout entry
    const workout = new Workout({
      user: userId,
      title: req.body.title || 'Quick Workout',
      exercises: req.body.exercises || [],
      durationMinutes: req.body.duration || 0,
      createdAt: new Date()
    });
    
    await workout.save();
    
    // Check for new achievements
    const totalWorkouts = await Workout.countDocuments({ user: userId });
    const newAchievements = [];
    
    // Define workout milestones
    const workoutMilestones = [
      { count: 1, title: 'First Rep', icon: '🎯' },
      { count: 5, title: 'Getting Strong', icon: '💪' },
      { count: 10, title: 'Fitness Enthusiast', icon: '🔥' },
      { count: 25, title: 'Iron Warrior', icon: '⚔️' },
      { count: 50, title: 'Gym Legend', icon: '👑' },
      { count: 100, title: 'Ultimate Beast', icon: '🦁' }
    ];
    
    // Check if any milestone was just reached
    for (const milestone of workoutMilestones) {
      if (totalWorkouts === milestone.count) {
        // Check if achievement already exists
        const existing = await Achievement.findOne({
          user: userId,
          title: milestone.title
        });
        
        if (!existing) {
          const achievement = new Achievement({
            user: userId,
            title: milestone.title,
            description: `Completed ${milestone.count} workout${milestone.count > 1 ? 's' : ''}`,
            badgeIcon: milestone.icon,
            achievedAt: new Date()
          });
          
          await achievement.save();
          newAchievements.push(achievement);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Workout tracked successfully',
      newAchievements: newAchievements.length > 0 ? newAchievements : null,
      totalWorkouts
    });
  } catch (error) {
    console.error('Workout tracking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track meal logging with achievement checking
router.post('/track-meal-logging', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const Meal = (await import('../models/Meal.js')).default;
    const Achievement = (await import('../models/Achievement.js')).default;
    
    // Create meal entry
    const meal = new Meal({
      userId,
      name: req.body.name || 'Quick Meal',
      calories: req.body.calories || 0,
      createdAt: new Date()
    });
    
    await meal.save();
    
    // Check for nutrition achievements
    const totalMeals = await Meal.countDocuments({ userId });
    const newAchievements = [];
    
    const nutritionMilestones = [
      { count: 1, title: 'Nutrition Starter', icon: '🥗' },
      { count: 10, title: 'Meal Tracker', icon: '🍎' },
      { count: 50, title: 'Nutrition Expert', icon: '🥇' }
    ];
    
    for (const milestone of nutritionMilestones) {
      if (totalMeals === milestone.count) {
        const existing = await Achievement.findOne({
          user: userId,
          title: milestone.title
        });
        
        if (!existing) {
          const achievement = new Achievement({
            user: userId,
            title: milestone.title,
            description: `Logged ${milestone.count} meal${milestone.count > 1 ? 's' : ''}`,
            badgeIcon: milestone.icon,
            achievedAt: new Date()
          });
          
          await achievement.save();
          newAchievements.push(achievement);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Meal tracked successfully',
      newAchievements: newAchievements.length > 0 ? newAchievements : null,
      totalMeals
    });
  } catch (error) {
    console.error('Meal tracking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all analytics data (general endpoint)
router.get('/', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.json({ 
        success: true, 
        data: {
          workouts: 0,
          meals: 0,
          xpPoints: 0,
          streak: 0,
          weeklyGoal: { completed: 0, target: 4, percentage: 0 }
        }
      });
    }

    // Import models
    const User = (await import('../models/User.js')).default;
    const Workout = (await import('../models/Workout.js')).default;
    const Meal = (await import('../models/Meal.js')).default;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Count total workouts
    const totalWorkouts = await Workout.countDocuments({ user: userId });
    
    // Count total meals (handle both userId and user fields for backward compatibility)
    const totalMealsWithUserId = await Meal.countDocuments({ userId });
    const totalMealsWithUser = await Meal.countDocuments({ user: userId });
    const totalMeals = totalMealsWithUserId + totalMealsWithUser;
    
    // Auto-migrate meals with wrong field name
    if (totalMealsWithUser > 0) {
      try {
        await Meal.updateMany(
          { user: userId },
          { 
            $set: { userId: userId },
            $unset: { user: 1 }
          }
        );
        console.log(`✅ Auto-migrated ${totalMealsWithUser} meals for user ${userId}`);
      } catch (migrationError) {
        console.error('Auto-migration failed:', migrationError);
      }
    }
    
    // Calculate XP points (100 per workout, 50 per meal)
    const xpPoints = (totalWorkouts * 100) + (totalMeals * 50);
    
    // Calculate current streak
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let streak = 0;
    let currentDate = new Date(startOfToday);
    
    while (true) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const hasActivity = await Workout.exists({
        user: userId,
        createdAt: { $gte: dayStart, $lt: dayEnd }
      }) || await Meal.exists({
        userId,
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });
      
      if (hasActivity) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Calculate weekly goal progress
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyWorkouts = await Workout.countDocuments({
      user: userId,
      createdAt: { $gte: startOfWeek }
    });
    
    const weeklyTarget = 4;
    const weeklyPercentage = Math.min((weeklyWorkouts / weeklyTarget) * 100, 100);

    const analyticsData = {
      workouts: totalWorkouts,
      meals: totalMeals,
      xpPoints,
      streak,
      totalWorkouts,
      totalMeals,
      currentStreak: streak,
      weeklyGoal: {
        completed: weeklyWorkouts,
        target: weeklyTarget,
        percentage: weeklyPercentage
      },
      weeklyWorkouts
    };

    res.json({ success: true, data: analyticsData });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user exercise statistics
router.get('/exercise-stats', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.json({ success: true, data: {} });
    }

    const Workout = (await import('../models/Workout.js')).default;
    
    // Get all user workouts with exercises
    const workouts = await Workout.find({ user: userId })
      .populate('exercises.exercise')
      .sort({ date: -1 });
    
    // Calculate exercise-specific statistics
    const exerciseStats = {};
    
    workouts.forEach(workout => {
      workout.exercises?.forEach(exerciseLog => {
        const exerciseName = exerciseLog.exercise?.name || 'Unknown Exercise';
        
        if (!exerciseStats[exerciseName]) {
          exerciseStats[exerciseName] = {
            totalSessions: 0,
            totalSets: 0,
            totalReps: 0,
            maxWeight: 0,
            lastPerformed: null,
            personalBest: 0,
            averageReps: 0,
            totalVolume: 0
          };
        }
        
        const stats = exerciseStats[exerciseName];
        stats.totalSessions++;
        stats.totalSets += exerciseLog.sets?.length || 0;
        
        let sessionReps = 0;
        let sessionVolume = 0;
        
        exerciseLog.sets?.forEach(set => {
          const reps = set.reps || 0;
          const weight = set.weight || 0;
          
          stats.totalReps += reps;
          sessionReps += reps;
          sessionVolume += reps * weight;
          
          if (weight > stats.maxWeight) {
            stats.maxWeight = weight;
            stats.personalBest = weight;
          }
        });
        
        stats.totalVolume += sessionVolume;
        stats.averageReps = Math.round(stats.totalReps / stats.totalSessions);
        
        const workoutDate = new Date(workout.date || workout.createdAt);
        if (!stats.lastPerformed || workoutDate > stats.lastPerformed) {
          stats.lastPerformed = workoutDate;
        }
      });
    });
    
    res.json({ success: true, data: exerciseStats });
  } catch (error) {
    console.error('Exercise stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track exercise interactions
router.post('/track-exercise', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { exerciseId, action, timestamp } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    // Log exercise interaction (could be stored in a separate collection)
    console.log(`User ${userId} performed ${action} on exercise ${exerciseId} at ${timestamp}`);
    
    // You could create an ExerciseInteraction model to track this data
    // For now, we'll just acknowledge the tracking
    
    res.json({ success: true, message: 'Exercise interaction tracked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Sync offline data
router.post('/sync-offline-data', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { workouts, meals, exercises, timestamp } = req.body;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const Workout = (await import('../models/Workout.js')).default;
    const Meal = (await import('../models/Meal.js')).default;
    
    let syncedCount = 0;
    
    // Sync workouts
    if (workouts && workouts.length > 0) {
      for (const workoutData of workouts) {
        try {
          const workout = new Workout({
            ...workoutData,
            user: userId,
            syncedFromOffline: true
          });
          await workout.save();
          syncedCount++;
        } catch (error) {
          console.error('Failed to sync workout:', error);
        }
      }
    }
    
    // Sync meals
    if (meals && meals.length > 0) {
      for (const mealData of meals) {
        try {
          const meal = new Meal({
            ...mealData,
            userId,
            syncedFromOffline: true
          });
          await meal.save();
          syncedCount++;
        } catch (error) {
          console.error('Failed to sync meal:', error);
        }
      }
    }
    
    res.json({ 
      success: true, 
      message: `Synced ${syncedCount} items from offline storage`,
      syncedCount 
    });
  } catch (error) {
    console.error('Offline sync error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get real-time achievements with MongoDB data
router.get('/achievements', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.json({ success: true, data: [] });
    }

    // Import models
    const User = (await import('../models/User.js')).default;
    const Workout = (await import('../models/Workout.js')).default;
    const Meal = (await import('../models/Meal.js')).default;
    const Plan = (await import('../models/Plan.js')).default;
    const Achievement = (await import('../models/Achievement.js')).default;

    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get real-time statistics
    const totalWorkouts = await Workout.countDocuments({ user: userId });
    const totalMeals = await Meal.countDocuments({ userId });
    const totalPlans = await Plan.countDocuments({ user: userId });
    
    // Calculate current streak
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let currentStreak = 0;
    let currentDate = new Date(startOfToday);
    
    while (true) {
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const hasActivity = await Workout.exists({
        user: userId,
        createdAt: { $gte: dayStart, $lt: dayEnd }
      }) || await Meal.exists({
        userId,
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });
      
      if (hasActivity) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Calculate total XP
    const totalXP = (totalWorkouts * 100) + (totalPlans * 150) + (totalMeals * 50);
    
    // Get existing achievements from database
    const existingAchievements = await Achievement.find({ user: userId });
    const unlockedIds = new Set(existingAchievements.map(a => a.title));
    
    // Define all possible achievements with real-time data
    const achievementDefinitions = [
      // 🏋️ WORKOUT ACHIEVEMENTS
      { id: 'workout_1', title: 'First Rep', description: 'Completed your first workout', icon: '🎯', xp: 100, tier: 'bronze', threshold: 1, current: totalWorkouts, type: 'workout' },
      { id: 'workout_5', title: 'Getting Strong', description: 'Completed 5 workouts', icon: '💪', xp: 250, tier: 'bronze', threshold: 5, current: totalWorkouts, type: 'workout' },
      { id: 'workout_10', title: 'Fitness Enthusiast', description: 'Completed 10 workouts', icon: '🔥', xp: 500, tier: 'silver', threshold: 10, current: totalWorkouts, type: 'workout' },
      { id: 'workout_25', title: 'Iron Warrior', description: 'Completed 25 workouts', icon: '⚔️', xp: 1000, tier: 'silver', threshold: 25, current: totalWorkouts, type: 'workout' },
      { id: 'workout_50', title: 'Gym Legend', description: 'Completed 50 workouts', icon: '👑', xp: 2000, tier: 'gold', threshold: 50, current: totalWorkouts, type: 'workout' },
      { id: 'workout_100', title: 'Ultimate Beast', description: 'Completed 100 workouts', icon: '🦁', xp: 5000, tier: 'platinum', threshold: 100, current: totalWorkouts, type: 'workout' },
      
      // 📋 PLANNING ACHIEVEMENTS
      { id: 'plan_1', title: 'Plan Creator', description: 'Created your first workout plan', icon: '📋', xp: 150, tier: 'bronze', threshold: 1, current: totalPlans, type: 'plan' },
      { id: 'plan_3', title: 'Strategic Planner', description: 'Created 3 workout plans', icon: '🎯', xp: 400, tier: 'silver', threshold: 3, current: totalPlans, type: 'plan' },
      { id: 'plan_5', title: 'Master Planner', description: 'Created 5 workout plans', icon: '🧠', xp: 750, tier: 'gold', threshold: 5, current: totalPlans, type: 'plan' },
      
      // 🔥 STREAK ACHIEVEMENTS
      { id: 'streak_3', title: 'On Fire', description: '3-day workout streak', icon: '🔥', xp: 200, tier: 'bronze', threshold: 3, current: currentStreak, type: 'streak' },
      { id: 'streak_7', title: 'Week Warrior', description: '7-day workout streak', icon: '⚡', xp: 500, tier: 'silver', threshold: 7, current: currentStreak, type: 'streak' },
      { id: 'streak_14', title: 'Unstoppable', description: '14-day workout streak', icon: '🚀', xp: 1000, tier: 'gold', threshold: 14, current: currentStreak, type: 'streak' },
      { id: 'streak_30', title: 'Consistency King', description: '30-day workout streak', icon: '👑', xp: 2500, tier: 'platinum', threshold: 30, current: currentStreak, type: 'streak' },
      
      // 🥗 NUTRITION ACHIEVEMENTS
      { id: 'nutrition_1', title: 'Nutrition Starter', description: 'Logged your first meal', icon: '🥗', xp: 50, tier: 'bronze', threshold: 1, current: totalMeals, type: 'nutrition' },
      { id: 'nutrition_10', title: 'Meal Tracker', description: 'Logged 10 meals', icon: '🍎', xp: 300, tier: 'silver', threshold: 10, current: totalMeals, type: 'nutrition' },
      { id: 'nutrition_50', title: 'Nutrition Expert', description: 'Logged 50 meals', icon: '🥇', xp: 1000, tier: 'gold', threshold: 50, current: totalMeals, type: 'nutrition' },
      
      // 💎 XP ACHIEVEMENTS
      { id: 'xp_500', title: 'XP Collector', description: 'Earned 500 XP points', icon: '💎', xp: 100, tier: 'bronze', threshold: 500, current: totalXP, type: 'xp' },
      { id: 'xp_1000', title: 'XP Master', description: 'Earned 1,000 XP points', icon: '💠', xp: 200, tier: 'silver', threshold: 1000, current: totalXP, type: 'xp' },
      { id: 'xp_2500', title: 'XP Legend', description: 'Earned 2,500 XP points', icon: '🌟', xp: 500, tier: 'gold', threshold: 2500, current: totalXP, type: 'xp' },
      { id: 'xp_5000', title: 'XP God', description: 'Earned 5,000 XP points', icon: '⭐', xp: 1000, tier: 'platinum', threshold: 5000, current: totalXP, type: 'xp' }
    ];
    
    // Process achievements and check for new unlocks
    const processedAchievements = [];
    const newlyUnlocked = [];
    
    for (const def of achievementDefinitions) {
      const isUnlocked = def.current >= def.threshold;
      const wasAlreadyUnlocked = unlockedIds.has(def.title);
      
      // If newly unlocked, save to database
      if (isUnlocked && !wasAlreadyUnlocked) {
        try {
          const newAchievement = new Achievement({
            user: userId,
            title: def.title,
            description: def.description,
            badgeIcon: def.icon,
            achievedAt: new Date()
          });
          await newAchievement.save();
          newlyUnlocked.push(def.title);
        } catch (error) {
          console.error('Failed to save achievement:', error);
        }
      }
      
      processedAchievements.push({
        id: def.id,
        title: def.title,
        description: def.description,
        icon: def.icon,
        xp: def.xp,
        tier: def.tier,
        category: def.type,
        unlocked: isUnlocked,
        progress: Math.min(def.current, def.threshold),
        target: def.threshold,
        percentage: Math.min((def.current / def.threshold) * 100, 100),
        unlockedAt: isUnlocked ? (wasAlreadyUnlocked ? existingAchievements.find(a => a.title === def.title)?.achievedAt : new Date()) : null,
        isNew: newlyUnlocked.includes(def.title)
      });
    }
    
    // Sort achievements: unlocked first, then by tier, then by progress
    processedAchievements.sort((a, b) => {
      if (a.unlocked !== b.unlocked) return b.unlocked - a.unlocked;
      const tierOrder = { 'platinum': 4, 'gold': 3, 'silver': 2, 'bronze': 1 };
      if (tierOrder[a.tier] !== tierOrder[b.tier]) return tierOrder[b.tier] - tierOrder[a.tier];
      return b.percentage - a.percentage;
    });
    
    // Include summary statistics
    const summary = {
      totalAchievements: processedAchievements.length,
      unlockedCount: processedAchievements.filter(a => a.unlocked).length,
      totalXPEarned: processedAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp, 0),
      newlyUnlocked: newlyUnlocked.length,
      stats: {
        totalWorkouts,
        totalMeals,
        totalPlans,
        currentStreak,
        totalXP
      }
    };

    res.json({ 
      success: true, 
      data: processedAchievements,
      summary,
      message: newlyUnlocked.length > 0 ? `🎉 ${newlyUnlocked.length} new achievement(s) unlocked!` : null
    });
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Real-time achievement progress tracking
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    
    if (!userId) {
      return res.json({ success: true, data: {} });
    }

    const User = (await import('../models/User.js')).default;
    const Workout = (await import('../models/Workout.js')).default;
    const Meal = (await import('../models/Meal.js')).default;
    const Plan = (await import('../models/Plan.js')).default;

    // Get current statistics
    const [totalWorkouts, totalMeals, totalPlans] = await Promise.all([
      Workout.countDocuments({ user: userId }),
      Meal.countDocuments({ userId }),
      Plan.countDocuments({ user: userId })
    ]);
    
    // Calculate streak
    const today = new Date();
    let currentStreak = 0;
    let currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    while (currentStreak < 365) { // Max 365 days to prevent infinite loop
      const dayStart = new Date(currentDate);
      const dayEnd = new Date(currentDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const hasActivity = await Workout.exists({
        user: userId,
        createdAt: { $gte: dayStart, $lt: dayEnd }
      }) || await Meal.exists({
        userId,
        createdAt: { $gte: dayStart, $lt: dayEnd }
      });
      
      if (hasActivity) {
        currentStreak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    const totalXP = (totalWorkouts * 100) + (totalPlans * 150) + (totalMeals * 50);
    
    // Calculate progress to next milestones
    const getNextMilestone = (current, milestones) => {
      const next = milestones.find(m => m > current);
      return next ? {
        target: next,
        progress: current,
        percentage: Math.min((current / next) * 100, 100),
        remaining: next - current
      } : null;
    };
    
    const progress = {
      workouts: {
        current: totalWorkouts,
        next: getNextMilestone(totalWorkouts, [1, 5, 10, 25, 50, 100])
      },
      plans: {
        current: totalPlans,
        next: getNextMilestone(totalPlans, [1, 3, 5, 10])
      },
      meals: {
        current: totalMeals,
        next: getNextMilestone(totalMeals, [1, 10, 50, 100])
      },
      streak: {
        current: currentStreak,
        next: getNextMilestone(currentStreak, [3, 7, 14, 30, 60, 100])
      },
      xp: {
        current: totalXP,
        next: getNextMilestone(totalXP, [500, 1000, 2500, 5000, 10000])
      }
    };
    
    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('Progress tracking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unlock achievement manually (for testing or special events)
router.post('/unlock/:achievementId', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { achievementId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const Achievement = (await import('../models/Achievement.js')).default;
    
    // Check if already unlocked
    const existing = await Achievement.findOne({ 
      user: userId, 
      title: achievementId 
    });
    
    if (existing) {
      return res.json({ success: false, message: 'Achievement already unlocked' });
    }
    
    // Create new achievement
    const achievement = new Achievement({
      user: userId,
      title: achievementId,
      description: 'Manually unlocked',
      badgeIcon: '🏆',
      achievedAt: new Date()
    });
    
    await achievement.save();
    
    res.json({ 
      success: true, 
      message: 'Achievement unlocked!',
      achievement 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'Analytics service is running with real-time achievements' 
  });
});

export default router;