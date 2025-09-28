// Example backend endpoints for workout completion
// This would be implemented in your Node.js/Express backend

/*
// Backend MongoDB Schema Example (workoutSchema.js)
const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exercise: { type: String, required: true },
  category: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  duration: { type: Number, default: 0 }, // in seconds
  sets: { type: Number, default: 1 },
  reps: { type: Number, default: 1 },
  weight: { type: Number, default: 0 }, // in lbs
  caloriesBurned: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  completedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Workout', workoutSchema);

// Backend API Routes Example (workoutRoutes.js)
const express = require('express');
const router = express.Router();
const Workout = require('../models/workoutSchema');
const auth = require('../middleware/auth'); // JWT authentication middleware

// POST /api/workouts/complete - Complete a workout
router.post('/complete', auth, async (req, res) => {
  try {
    const {
      exercise,
      category,
      difficulty,
      duration,
      sets,
      reps,
      weight,
      caloriesBurned,
      notes
    } = req.body;

    const workout = new Workout({
      userId: req.user.id,
      exercise,
      category,
      difficulty,
      duration: duration || 0,
      sets: sets || 1,
      reps: reps || 1,
      weight: weight || 0,
      caloriesBurned: caloriesBurned || 0,
      notes: notes || ''
    });

    await workout.save();

    // Update user stats
    await updateUserStats(req.user.id);

    res.status(201).json({
      success: true,
      data: workout,
      message: 'Workout completed successfully'
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete workout',
      error: error.message
    });
  }
});

// GET /api/workouts/completed/:userId - Get completed workouts
router.get('/completed/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, filter = 'all' } = req.query;

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    
    switch (filter) {
      case 'today':
        dateFilter = {
          completedAt: {
            $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          }
        };
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { completedAt: { $gte: weekAgo } };
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { completedAt: { $gte: monthAgo } };
        break;
    }

    const workouts = await Workout.find({
      userId,
      ...dateFilter
    })
    .sort({ completedAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(offset));

    const totalCount = await Workout.countDocuments({ userId, ...dateFilter });

    res.json({
      success: true,
      data: workouts,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workouts',
      error: error.message
    });
  }
});

// GET /api/workouts/stats/:userId - Get workout statistics
router.get('/stats/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      todayWorkouts,
      totalWorkouts,
      weeklyWorkouts,
      monthlyWorkouts,
      totalStats
    ] = await Promise.all([
      Workout.countDocuments({ userId, completedAt: { $gte: today } }),
      Workout.countDocuments({ userId }),
      Workout.countDocuments({ userId, completedAt: { $gte: weekAgo } }),
      Workout.countDocuments({ userId, completedAt: { $gte: monthAgo } }),
      Workout.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalCalories: { $sum: '$caloriesBurned' },
            totalDuration: { $sum: '$duration' },
            averageDuration: { $avg: '$duration' },
            favoriteExercise: { $first: '$exercise' } // This would need more complex aggregation
          }
        }
      ])
    ]);

    const stats = {
      todayWorkouts,
      totalWorkouts,
      weeklyWorkouts,
      monthlyWorkouts,
      totalCalories: totalStats[0]?.totalCalories || 0,
      totalDuration: totalStats[0]?.totalDuration || 0,
      averageDuration: Math.round(totalStats[0]?.averageDuration || 0),
      favoriteExercise: totalStats[0]?.favoriteExercise || null
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching workout stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout stats',
      error: error.message
    });
  }
});

// DELETE /api/workouts/:workoutId - Delete a workout
router.delete('/:workoutId', auth, async (req, res) => {
  try {
    const { workoutId } = req.params;
    
    const workout = await Workout.findOneAndDelete({
      _id: workoutId,
      userId: req.user.id
    });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Update user stats
    await updateUserStats(req.user.id);

    res.json({
      success: true,
      message: 'Workout deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete workout',
      error: error.message
    });
  }
});

// Helper function to update user stats
async function updateUserStats(userId) {
  try {
    const User = require('../models/userSchema');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [todayWorkouts, totalWorkouts, totalCalories] = await Promise.all([
      Workout.countDocuments({ userId, completedAt: { $gte: today } }),
      Workout.countDocuments({ userId }),
      Workout.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$caloriesBurned' } } }
      ])
    ]);

    await User.findByIdAndUpdate(userId, {
      $set: {
        'stats.todayWorkouts': todayWorkouts,
        'stats.totalWorkouts': totalWorkouts,
        'stats.totalCalories': totalCalories[0]?.total || 0,
        'stats.lastWorkoutAt': new Date()
      }
    });
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

module.exports = router;

// Usage in main app.js:
// app.use('/api/workouts', require('./routes/workoutRoutes'));
*/

// Frontend integration example
export const workoutBackendAPI = {
  // Complete a workout
  completeWorkout: async (workoutData) => {
    const response = await fetch('/api/workouts/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(workoutData)
    });
    return response.json();
  },

  // Get completed workouts
  getCompletedWorkouts: async (userId, options = {}) => {
    const params = new URLSearchParams(options);
    const response = await fetch(`/api/workouts/completed/${userId}?${params}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // Get workout statistics
  getWorkoutStats: async (userId) => {
    const response = await fetch(`/api/workouts/stats/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  },

  // Delete a workout
  deleteWorkout: async (workoutId) => {
    const response = await fetch(`/api/workouts/${workoutId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
};