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
    
    // Count total meals
    const totalMeals = await Meal.countDocuments({ userId });
    
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

    const heroStats = {
      workouts: totalWorkouts,
      meals: totalMeals,
      xpPoints,
      streak,
      weeklyGoal: {
        completed: weeklyWorkouts,
        target: weeklyTarget,
        percentage: weeklyPercentage
      }
    };

    res.json({ success: true, data: heroStats });
  } catch (error) {
    console.error('Hero stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track workout completion
router.post('/track-workout-completion', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const Workout = (await import('../models/Workout.js')).default;
    
    // Create workout entry
    const workout = new Workout({
      user: userId,
      title: 'Quick Workout',
      exercises: [],
      durationMinutes: 0,
      createdAt: new Date()
    });
    
    await workout.save();
    res.json({ success: true, message: 'Workout tracked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track meal logging
router.post('/track-meal-logging', async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const Meal = (await import('../models/Meal.js')).default;
    
    // Create meal entry
    const meal = new Meal({
      userId,
      name: 'Quick Meal',
      calories: 0,
      createdAt: new Date()
    });
    
    await meal.save();
    res.json({ success: true, message: 'Meal tracked' });
  } catch (error) {
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
    
    // Count total meals
    const totalMeals = await Meal.countDocuments({ userId });
    
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

// Get achievements
router.get('/achievements', async (req, res) => {
  try {
    const achievements = [
      {
        id: 1,
        title: 'First Workout',
        description: 'Complete your first workout',
        icon: '🏋️',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        title: 'Nutrition Tracker',
        description: 'Log your first meal',
        icon: '🍎',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        id: 3,
        title: 'Week Warrior',
        description: 'Work out 5 times in a week',
        icon: '🔥',
        unlocked: false,
        progress: 3,
        target: 5
      },
      {
        id: 4,
        title: 'Consistency King',
        description: 'Maintain a 30-day streak',
        icon: '👑',
        unlocked: false,
        progress: 7,
        target: 30
      }
    ];

    res.json({ success: true, data: achievements });
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
    message: 'Analytics service is running' 
  });
});

export default router;