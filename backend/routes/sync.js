// Real-time Data Sync Routes for Professional Gym App
import express from 'express';
import auth from '../middleware/auth.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';
import User from '../models/User.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);

// Sync offline data to backend
router.post('/offline-data', async (req, res) => {
  try {
    const userId = req.user._id;
    const { workouts, meals, exercises, timestamp } = req.body;
    
    let syncResults = {
      workouts: { synced: 0, failed: 0 },
      meals: { synced: 0, failed: 0 },
      exercises: { synced: 0, failed: 0 },
      totalSynced: 0,
      errors: []
    };

    // Sync workouts
    if (workouts && workouts.length > 0) {
      for (const workoutData of workouts) {
        try {
          // Check if workout already exists (prevent duplicates)
          const existingWorkout = await Workout.findOne({
            user: userId,
            date: workoutData.date || workoutData.createdAt,
            title: workoutData.title
          });

          if (!existingWorkout) {
            const workout = new Workout({
              ...workoutData,
              user: userId,
              syncedFromOffline: true,
              originalOfflineId: workoutData.id
            });
            
            await workout.save();
            syncResults.workouts.synced++;
            syncResults.totalSynced++;
          }
        } catch (error) {
          console.error('Failed to sync workout:', error);
          syncResults.workouts.failed++;
          syncResults.errors.push({
            type: 'workout',
            data: workoutData,
            error: error.message
          });
        }
      }
    }

    // Sync meals
    if (meals && meals.length > 0) {
      for (const mealData of meals) {
        try {
          // Check if meal already exists
          const existingMeal = await Meal.findOne({
            userId,
            date: mealData.date || mealData.createdAt,
            name: mealData.name
          });

          if (!existingMeal) {
            const meal = new Meal({
              ...mealData,
              userId,
              syncedFromOffline: true,
              originalOfflineId: mealData.id
            });
            
            await meal.save();
            syncResults.meals.synced++;
            syncResults.totalSynced++;
          }
        } catch (error) {
          console.error('Failed to sync meal:', error);
          syncResults.meals.failed++;
          syncResults.errors.push({
            type: 'meal',
            data: mealData,
            error: error.message
          });
        }
      }
    }

    // Update user stats after sync
    if (syncResults.totalSynced > 0) {
      try {
        const user = await User.findById(userId);
        if (user) {
          const totalWorkouts = await Workout.countDocuments({ user: userId });
          const totalMeals = await Meal.countDocuments({ userId });
          
          user.stats = {
            ...user.stats,
            totalWorkouts,
            totalMeals,
            xp: (totalWorkouts * 100) + (totalMeals * 50),
            lastSync: new Date()
          };
          
          await user.save();
        }
      } catch (error) {
        console.error('Failed to update user stats:', error);
      }
    }

    res.json({
      success: true,
      message: `Successfully synced ${syncResults.totalSynced} items from offline storage`,
      results: syncResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Offline sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync offline data',
      error: error.message
    });
  }
});

// Get sync status for user
router.get('/status', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's last sync time
    const user = await User.findById(userId);
    const lastSync = user?.stats?.lastSync;
    
    // Count total user data
    const [totalWorkouts, totalMeals, recentWorkouts] = await Promise.all([
      Workout.countDocuments({ user: userId }),
      Meal.countDocuments({ userId }),
      Workout.find({ user: userId })
        .sort({ date: -1 })
        .limit(5)
        .populate('exercises.exercise')
    ]);

    res.json({
      success: true,
      data: {
        lastSync,
        totalWorkouts,
        totalMeals,
        recentWorkouts,
        syncAvailable: true,
        serverTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Sync status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message
    });
  }
});

// Force full data refresh
router.post('/refresh', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get all user data
    const [workouts, meals, user] = await Promise.all([
      Workout.find({ user: userId })
        .sort({ date: -1 })
        .populate('exercises.exercise'),
      Meal.find({ userId })
        .sort({ date: -1 }),
      User.findById(userId)
    ]);

    // Calculate fresh stats
    const stats = {
      totalWorkouts: workouts.length,
      totalMeals: meals.length,
      xp: (workouts.length * 100) + (meals.length * 50),
      streak: 0, // Calculate streak logic here
      weeklyGoal: {
        completed: 0, // Calculate weekly workouts
        target: 4,
        percentage: 0
      }
    };

    res.json({
      success: true,
      data: {
        workouts: workouts.slice(0, 50), // Limit for performance
        meals: meals.slice(0, 50),
        userProgress: stats,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          stats: user.stats
        },
        refreshTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Data refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh data',
      error: error.message
    });
  }
});

// Health check for sync service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'online',
    service: 'sync',
    timestamp: new Date().toISOString(),
    message: 'Sync service is running'
  });
});

// Batch sync endpoint for high-volume data
router.post('/batch', async (req, res) => {
  try {
    const userId = req.user._id;
    const { batch, batchId, totalBatches } = req.body;
    
    // Process batch data
    let processed = 0;
    const errors = [];
    
    for (const item of batch) {
      try {
        if (item.type === 'workout') {
          const workout = new Workout({
            ...item.data,
            user: userId,
            batchId,
            syncedFromOffline: true
          });
          await workout.save();
          processed++;
        } else if (item.type === 'meal') {
          const meal = new Meal({
            ...item.data,
            userId,
            batchId,
            syncedFromOffline: true
          });
          await meal.save();
          processed++;
        }
      } catch (error) {
        errors.push({
          item,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      batchId,
      processed,
      errors: errors.length,
      isLastBatch: batchId === totalBatches - 1,
      message: `Processed ${processed} items in batch ${batchId + 1}/${totalBatches}`
    });
    
  } catch (error) {
    console.error('Batch sync error:', error);
    res.status(500).json({
      success: false,
      message: 'Batch sync failed',
      error: error.message
    });
  }
});

export default router;