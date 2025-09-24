// backend/routes/sync.js
import express from 'express';
import Plan from '../models/Plan.js';
import Workout from '../models/Workout.js';
import Meal from '../models/Meal.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get sync status
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const planCount = await Plan.countDocuments({ user: req.user._id });
    const workoutCount = await Workout.countDocuments({ user: req.user._id });
    const mealCount = await Meal.countDocuments({ user: req.user._id });
    
    const lastWorkout = await Workout.findOne({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    const lastPlan = await Plan.findOne({ user: req.user._id })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          lastLogin: user.lastLogin
        },
        counts: {
          plans: planCount,
          workouts: workoutCount,
          meals: mealCount
        },
        lastActivity: {
          workout: lastWorkout?.createdAt,
          plan: lastPlan?.updatedAt
        },
        syncTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ success: false, message: 'Failed to get sync status' });
  }
});

// Sync offline data
router.post('/offline-data', auth, async (req, res) => {
  try {
    const { workouts, meals, plans, planDeletes, timestamp } = req.body;
    const syncResults = {
      workouts: { synced: 0, failed: 0 },
      meals: { synced: 0, failed: 0 },
      plans: { synced: 0, failed: 0 },
      planDeletes: { synced: 0, failed: 0 }
    };

    // Sync workouts
    if (workouts && workouts.length > 0) {
      for (const workoutData of workouts) {
        try {
          const workout = new Workout({
            ...workoutData,
            user: req.user._id,
            createdAt: workoutData.createdAt || new Date()
          });
          await workout.save();
          syncResults.workouts.synced++;
        } catch (error) {
          console.error('Failed to sync workout:', error);
          syncResults.workouts.failed++;
        }
      }
    }

    // Sync meals
    if (meals && meals.length > 0) {
      for (const mealData of meals) {
        try {
          const meal = new Meal({
            ...mealData,
            user: req.user._id,
            createdAt: mealData.createdAt || new Date()
          });
          await meal.save();
          syncResults.meals.synced++;
        } catch (error) {
          console.error('Failed to sync meal:', error);
          syncResults.meals.failed++;
        }
      }
    }

    // Sync plans
    if (plans && plans.length > 0) {
      for (const planData of plans) {
        try {
          const plan = new Plan({
            ...planData,
            user: req.user._id,
            createdAt: planData.createdAt || new Date(),
            updatedAt: new Date()
          });
          await plan.save();
          syncResults.plans.synced++;
        } catch (error) {
          console.error('Failed to sync plan:', error);
          syncResults.plans.failed++;
        }
      }
    }

    // Process plan deletions
    if (planDeletes && planDeletes.length > 0) {
      for (const deletion of planDeletes) {
        try {
          await Plan.findOneAndDelete({ 
            _id: deletion.planId, 
            user: req.user._id 
          });
          syncResults.planDeletes.synced++;
        } catch (error) {
          console.error('Failed to sync plan deletion:', error);
          syncResults.planDeletes.failed++;
        }
      }
    }

    // Update user's last sync time
    await User.findByIdAndUpdate(req.user._id, {
      lastSync: new Date(),
      syncCount: { $inc: 1 }
    });

    res.json({
      success: true,
      message: 'Offline data synced successfully',
      syncResults,
      syncTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing offline data:', error);
    res.status(500).json({ success: false, message: 'Failed to sync offline data' });
  }
});

// Refresh all user data
router.post('/refresh', auth, async (req, res) => {
  try {
    // Get all user data
    const [plans, workouts, meals] = await Promise.all([
      Plan.find({ user: req.user._id }).sort({ updatedAt: -1 }),
      Workout.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50),
      Meal.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50)
    ]);

    // Calculate stats
    const totalWorkouts = await Workout.countDocuments({ user: req.user._id });
    const totalPlans = plans.length;
    const totalMeals = await Meal.countDocuments({ user: req.user._id });

    // Get recent activity
    const recentActivity = await Workout.aggregate([
      { $match: { user: req.user._id } },
      { $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
        calories: { $sum: "$calories" }
      }},
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);

    res.json({
      success: true,
      data: {
        plans,
        workouts,
        meals,
        stats: {
          totalWorkouts,
          totalPlans,
          totalMeals
        },
        recentActivity,
        refreshTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
    res.status(500).json({ success: false, message: 'Failed to refresh data' });
  }
});

// Real-time plan sync endpoint
router.post('/plans/sync', auth, async (req, res) => {
  try {
    const { localPlans, pendingDeletes } = req.body;
    const syncResults = [];

    // Get current backend plans
    const backendPlans = await Plan.find({ user: req.user._id });

    // Process pending deletions first
    if (pendingDeletes && pendingDeletes.length > 0) {
      for (const deletion of pendingDeletes) {
        try {
          await Plan.findOneAndDelete({ 
            _id: deletion.planId, 
            user: req.user._id 
          });
        } catch (error) {
          console.error('Failed to delete plan:', error);
        }
      }
    }

    // Sync local plans to backend
    if (localPlans && localPlans.length > 0) {
      for (const localPlan of localPlans) {
        try {
          // Check if plan already exists
          const existingPlan = backendPlans.find(p => 
            p._id.toString() === localPlan.backendId || 
            p.name === localPlan.name
          );

          if (!existingPlan && !localPlan.synced) {
            // Create new plan
            const newPlan = new Plan({
              name: localPlan.name,
              exercises: localPlan.exercises,
              category: localPlan.category,
              description: localPlan.description,
              user: req.user._id,
              createdAt: localPlan.createdAt || new Date(),
              updatedAt: new Date()
            });

            await newPlan.save();
            
            syncResults.push({
              localId: localPlan.id,
              backendId: newPlan._id,
              action: 'created',
              success: true
            });
          } else if (existingPlan && localPlan.updatedAt > existingPlan.updatedAt) {
            // Update existing plan
            await Plan.findByIdAndUpdate(existingPlan._id, {
              name: localPlan.name,
              exercises: localPlan.exercises,
              category: localPlan.category,
              description: localPlan.description,
              updatedAt: new Date()
            });

            syncResults.push({
              localId: localPlan.id,
              backendId: existingPlan._id,
              action: 'updated',
              success: true
            });
          }
        } catch (error) {
          console.error('Failed to sync plan:', error);
          syncResults.push({
            localId: localPlan.id,
            action: 'failed',
            success: false,
            error: error.message
          });
        }
      }
    }

    // Get updated plans list
    const updatedPlans = await Plan.find({ user: req.user._id })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      syncResults,
      plans: updatedPlans,
      syncTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error syncing plans:', error);
    res.status(500).json({ success: false, message: 'Failed to sync plans' });
  }
});

// Get real-time user progress
router.get('/progress', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayWorkouts = await Workout.countDocuments({
      user: req.user._id,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayCalories = await Workout.aggregate([
      { $match: { 
        user: req.user._id,
        createdAt: { $gte: today, $lt: tomorrow }
      }},
      { $group: { _id: null, total: { $sum: '$calories' } }}
    ]);

    // Weekly stats
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyWorkouts = await Workout.countDocuments({
      user: req.user._id,
      createdAt: { $gte: weekAgo }
    });

    // Most used plans
    const planUsage = await Workout.aggregate([
      { $match: { user: req.user._id } },
      { $unwind: '$exercises' },
      { $group: {
        _id: '$exercises.exercise',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      progress: {
        today: {
          workouts: todayWorkouts,
          calories: todayCalories[0]?.total || 0
        },
        week: {
          workouts: weeklyWorkouts
        },
        planUsage,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting progress:', error);
    res.status(500).json({ success: false, message: 'Failed to get progress' });
  }
});

export default router;