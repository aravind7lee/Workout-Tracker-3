import express from 'express';
import mongoose from 'mongoose';
import Workout from '../models/Workout.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { broadcastToUser } from './sse.js';

const router = express.Router();

// Helper to safely get user ID
const getUserId = (user) => (user._id || user.id || user).toString();

// GET /api/workouts - Get user workouts or public workouts with pagination & filtering
router.get('/', auth, async (req, res) => {
  try {
    const { public: isPublic, status, page = 1, limit = 10, search, startDate, endDate, exercise } = req.query;
    const userId = getUserId(req.user);
    
    let query = {};
    if (isPublic === 'true') {
      query.isPublic = true;
    } else {
      query.user = userId;
    }

    if (status && ['in-progress', 'completed', 'abandoned'].includes(status)) {
      query.status = status;
    } else if (isPublic !== 'true') {
      query.completed = true; // Default to completed workouts for history
    }

    if (search) {
      const searchRegex = new RegExp(search.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i');
      query.$or = [
        { title: searchRegex },
        { 'exercises.exerciseName': searchRegex }
      ];
    }

    if (exercise) {
      query['exercises.exerciseName'] = new RegExp(`^${exercise.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i');
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 10), 200);
    const skip = (pageNum - 1) * limitNum;

    const [workouts, total] = await Promise.all([
      Workout.find(query)
        .populate('exercises.exercise')
        .populate('user', 'name profileImage')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum),
      Workout.countDocuments(query)
    ]);
    
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      workouts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore: pageNum < totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/workouts/last - Get most recent completed workout for user
router.get('/last', auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const workout = await Workout.findOne({ user: userId, completed: true })
      .populate('exercises.exercise')
      .sort({ date: -1 });

    if (!workout) {
      return res.status(200).json({ success: true, workout: null, message: 'No previous workouts found' });
    }

    res.json({ success: true, workout });
  } catch (error) {
    console.error('Error fetching last workout:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/workouts/prs - Authoritative Personal Records calculated from MongoDB Atlas
router.get('/prs', auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    
    const prs = await Workout.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), completed: true } },
      { $unwind: '$exercises' },
      { $unwind: '$exercises.sets' },
      {
        $project: {
          exerciseName: '$exercises.exerciseName',
          weight: '$exercises.sets.weight',
          reps: '$exercises.sets.reps',
          date: '$date'
        }
      },
      {
        $group: {
          _id: '$exerciseName',
          maxWeight: { $max: '$weight' },
          maxReps: { $max: '$reps' },
          latestDate: { $max: '$date' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({ success: true, prs });
  } catch (error) {
    console.error('Error deriving PRs:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate PRs', error: error.message });
  }
});

// GET /api/workouts/exercise-history/:exerciseName - Comprehensive historical trend for an exercise
router.get('/exercise-history/:exerciseName', auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const exerciseName = decodeURIComponent(req.params.exerciseName).trim();

    if (!exerciseName) {
      return res.status(400).json({ success: false, message: 'Exercise name is required' });
    }

    const workouts = await Workout.find({
      user: userId,
      completed: true,
      'exercises.exerciseName': { $regex: new RegExp(`^${exerciseName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    }).sort({ date: -1 }).limit(30);

    let maxWeight = 0;
    let maxVolume = 0;
    let maxReps = 0;
    let max1RM = 0;

    const history = workouts.map(w => {
      const exLog = w.exercises.find(ex => 
        ex.exerciseName && ex.exerciseName.toLowerCase() === exerciseName.toLowerCase()
      );

      const sets = exLog ? (exLog.sets || []) : [];
      let sessionVolume = 0;

      sets.forEach(s => {
        const wt = Number(s.weight) || 0;
        const rp = Number(s.reps) || 0;
        sessionVolume += (wt * rp);
        if (wt > maxWeight) maxWeight = wt;
        if (rp > maxReps) maxReps = rp;
        const e1RM = Math.round(wt * (1 + rp / 30));
        if (e1RM > max1RM) max1RM = e1RM;
      });

      if (sessionVolume > maxVolume) maxVolume = sessionVolume;

      return {
        workoutId: w._id,
        workoutTitle: w.title,
        date: w.date || w.createdAt,
        totalVolume: sessionVolume,
        sets: sets.map(s => ({ weight: s.weight, reps: s.reps, rest: s.rest }))
      };
    });

    res.json({
      success: true,
      exerciseName,
      stats: {
        totalSessions: history.length,
        maxWeight,
        maxVolume,
        maxReps,
        estimated1RM: max1RM
      },
      history
    });
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// GET /api/workouts/previous-performance/:exerciseName - Get previous performance for an exercise
router.get('/previous-performance/:exerciseName', auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const exerciseName = decodeURIComponent(req.params.exerciseName).trim();

    if (!exerciseName) {
      return res.status(400).json({ success: false, message: 'Exercise name is required' });
    }

    // Find the latest workout by this user containing an exercise matching exerciseName
    const workout = await Workout.findOne({
      user: userId,
      completed: true,
      'exercises.exerciseName': { $regex: new RegExp(`^${exerciseName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') }
    }).sort({ date: -1 });

    if (!workout) {
      return res.json({ success: true, performance: null });
    }

    // Find matching exercise entry inside workout
    const exLog = workout.exercises.find(ex => 
      ex.exerciseName && ex.exerciseName.toLowerCase() === exerciseName.toLowerCase()
    );

    if (!exLog) {
      return res.json({ success: true, performance: null });
    }

    res.json({
      success: true,
      performance: {
        date: workout.date || workout.createdAt,
        workoutTitle: workout.title,
        sets: (exLog.sets || []).map(s => ({
          reps: s.reps || 0,
          weight: s.weight || 0,
          rest: s.rest || 60
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching previous performance:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

const inferMuscleGroup = (name = '', cat = '') => {
  if (cat && cat !== 'General' && cat !== 'Workout') return cat;
  const n = String(name).toLowerCase();
  if (n.includes('bench') || n.includes('chest') || n.includes('pec') || n.includes('push-up') || n.includes('pushup') || (n.includes('fly') && !n.includes('rear delt'))) return 'Chest';
  if (n.includes('row') || n.includes('lat') || n.includes('pull-up') || n.includes('pullup') || n.includes('pulldown') || (n.includes('deadlift') && !n.includes('romanian') && !n.includes('rdl'))) return 'Back';
  if (n.includes('shoulder') || n.includes('military') || n.includes('overhead') || n.includes('lateral raise') || n.includes('front raise') || n.includes('rear delt') || n.includes('face pull') || n.includes('shrug') || n.includes('arnold')) return 'Shoulders';
  if (n.includes('bicep') || (n.includes('curl') && !n.includes('leg') && !n.includes('hamstring')) || n.includes('preacher') || n.includes('hammer')) return 'Biceps';
  if (n.includes('tricep') || n.includes('pushdown') || n.includes('skull crusher') || n.includes('kickback') || n.includes('dip')) return 'Triceps';
  if (n.includes('squat') || n.includes('leg') || n.includes('lunge') || n.includes('calf') || n.includes('calves') || n.includes('hamstring') || n.includes('quad') || n.includes('glute') || n.includes('thrust') || n.includes('rdl') || n.includes('romanian')) return 'Legs';
  if (n.includes('abs') || n.includes('core') || n.includes('plank') || n.includes('crunch') || n.includes('twist')) return 'Core';
  return 'General';
};

// POST /api/workouts - Create a new workout
router.post('/', auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const { title, category, muscle, exercises, durationMinutes, calories, date, isPublic, status, startedAt } = req.body;
    
    // Validation
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Workout title is required' });
    }

    const validatedStatus = ['in-progress', 'completed', 'abandoned'].includes(status) ? status : 'completed';
    
    const parsedExercises = (Array.isArray(exercises) ? exercises : []).map(ex => {
      let exerciseId = null;
      let exerciseName = ex.exerciseName || ex.name || '';

      if (ex.exercise && mongoose.Types.ObjectId.isValid(ex.exercise)) {
        exerciseId = ex.exercise;
      } else if (!exerciseName && typeof ex.exercise === 'string' && ex.exercise.trim() !== '') {
        exerciseName = ex.exercise;
      }

      if (!exerciseName) {
        exerciseName = 'Unknown Exercise';
      }

      const exCategory = inferMuscleGroup(exerciseName, ex.category || ex.muscle);

      return {
        exercise: exerciseId,
        exerciseName: String(exerciseName).trim(),
        category: exCategory,
        muscle: exCategory,
        sets: (Array.isArray(ex.sets) ? ex.sets : []).map(set => ({
          reps: Math.max(0, parseInt(set.reps, 10) || 0),
          weight: Math.max(0, parseFloat(set.weight) || 0),
          rest: Math.max(0, parseInt(set.rest, 10) || 60)
        })),
        notes: ex.notes ? String(ex.notes).trim() : ''
      };
    });

    // Determine primary workout category / muscle group
    let workoutCategory = category || muscle;
    if (!workoutCategory || workoutCategory === 'General') {
      const dominantCategory = parsedExercises.find(e => e.category && e.category !== 'General')?.category;
      workoutCategory = dominantCategory || inferMuscleGroup(title) || 'General';
    }

    // Construct sanitized workout object
    const workoutData = {
      user: userId,
      title: title.trim(),
      category: workoutCategory,
      muscle: workoutCategory,
      status: validatedStatus,
      completed: validatedStatus === 'completed',
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: validatedStatus === 'completed' ? new Date() : null,
      exercises: parsedExercises,
      durationMinutes: Math.max(0, Number(durationMinutes) || 0),
      calories: Math.max(0, Number(calories) || 0),
      date: date ? new Date(date) : new Date(),
      isPublic: Boolean(isPublic)
    };
    
    const workout = new Workout(workoutData);
    const savedWorkout = await workout.save();
    await savedWorkout.populate('exercises.exercise');
    
    // Automatically update streak on completed workout
    let streakInfo = null;
    if (validatedStatus === 'completed') {
      try {
        const user = await User.findById(userId);
        if (user) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayStr = today.toISOString().split('T')[0];
          
          const lastCheckIn = user.lastStreakCheckIn ? new Date(user.lastStreakCheckIn) : null;
          let lastCheckInStr = null;
          if (lastCheckIn) {
            lastCheckIn.setHours(0, 0, 0, 0);
            lastCheckInStr = lastCheckIn.toISOString().split('T')[0];
          }

          if (lastCheckInStr !== todayStr) {
            let newStreak = 1;
            let streakStartDate = today;
            if (lastCheckIn) {
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              const yesterdayStr = yesterday.toISOString().split('T')[0];
              if (lastCheckInStr === yesterdayStr) {
                newStreak = (user.currentStreak || 0) + 1;
                streakStartDate = user.streakStartDate || today;
              }
            }

            const updatedUser = await User.findByIdAndUpdate(userId, {
              currentStreak: newStreak,
              longestStreak: Math.max(user.longestStreak || 0, newStreak),
              lastStreakCheckIn: today,
              streakStartDate: streakStartDate,
              $inc: { totalCheckIns: 1 },
              $push: {
                streakHistory: {
                  date: today,
                  streakDay: newStreak,
                  workoutId: savedWorkout._id,
                  tier: newStreak <= 7 ? 'Beginner' : newStreak <= 30 ? 'Intermediate' : newStreak <= 100 ? 'Advanced' : 'Expert'
                }
              }
            }, { new: true });

            streakInfo = {
              currentStreak: newStreak,
              longestStreak: updatedUser.longestStreak,
              totalCheckIns: updatedUser.totalCheckIns,
              isActiveToday: true
            };
            broadcastToUser(userId, 'streak_updated', streakInfo);
          }
        }
      } catch (streakErr) {
        console.warn('⚠️ Streak auto-update warning:', streakErr.message);
      }
    }

    // Broadcast real-time event
    broadcastToUser(userId, 'workout_updated', { workoutId: savedWorkout._id });
    
    res.status(201).json({ 
      success: true,
      workout: savedWorkout,
      streak: streakInfo,
      message: 'Workout saved successfully'
    });
  } catch (error) {
    console.error('❌ Workout save error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to save workout', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/workouts/:id - Get single workout
router.get('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid workout ID format' });
    }

    const userId = getUserId(req.user);
    const workout = await Workout.findById(req.params.id)
      .populate('exercises.exercise')
      .populate('user', 'name profileImage');
    
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    
    const workoutOwnerId = getUserId(workout.user._id || workout.user);
    if (!workout.isPublic && workoutOwnerId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json(workout);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PATCH /api/workouts/:id/visibility - Toggle visibility
router.patch('/:id/visibility', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid workout ID format' });
    }

    const userId = getUserId(req.user);
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    
    if (getUserId(workout.user) !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    workout.isPublic = !workout.isPublic;
    await workout.save();
    
    res.json({ success: true, isPublic: workout.isPublic });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PUT /api/workouts/:id - Update workout
router.put('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid workout ID format' });
    }

    const userId = getUserId(req.user);
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    
    if (getUserId(workout.user) !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    // Explicit field whitelist against mass assignment
    const { title, exercises, durationMinutes, calories, isPublic, status } = req.body;
    
    if (title !== undefined) workout.title = String(title).trim();
    if (durationMinutes !== undefined) workout.durationMinutes = Math.max(0, Number(durationMinutes) || 0);
    if (calories !== undefined) workout.calories = Math.max(0, Number(calories) || 0);
    if (isPublic !== undefined) workout.isPublic = Boolean(isPublic);
    if (status !== undefined && ['in-progress', 'completed', 'abandoned'].includes(status)) {
      workout.status = status;
      workout.completed = status === 'completed';
    }

    if (Array.isArray(exercises)) {
      workout.exercises = exercises.map(ex => {
        let exerciseId = null;
        let exerciseName = ex.exerciseName || ex.name || '';

        if (ex.exercise && mongoose.Types.ObjectId.isValid(ex.exercise)) {
          exerciseId = ex.exercise;
        } else if (!exerciseName && typeof ex.exercise === 'string' && ex.exercise.trim() !== '') {
          exerciseName = ex.exercise;
        }

        if (!exerciseName) {
          exerciseName = 'Unknown Exercise';
        }

        const exCategory = inferMuscleGroup(exerciseName, ex.category || ex.muscle);

        return {
          exercise: exerciseId,
          exerciseName: String(exerciseName).trim(),
          category: exCategory,
          muscle: exCategory,
          sets: (Array.isArray(ex.sets) ? ex.sets : []).map(set => ({
            reps: Math.max(0, parseInt(set.reps, 10) || 0),
            weight: Math.max(0, parseFloat(set.weight) || 0),
            rest: Math.max(0, parseInt(set.rest, 10) || 60)
          })),
          notes: ex.notes ? String(ex.notes).trim() : ''
        };
      });
    }

    await workout.save();
    await workout.populate('exercises.exercise');
    
    // Broadcast real-time event
    broadcastToUser(userId, 'workout_updated', { workoutId: workout._id });
    
    res.json({ success: true, workout });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// DELETE /api/workouts/:id - Delete workout
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid workout ID format' });
    }

    const userId = getUserId(req.user);
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    
    if (getUserId(workout.user) !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    await Workout.findByIdAndDelete(req.params.id);
    
    // Broadcast real-time event
    broadcastToUser(userId, 'workout_updated', { workoutId: req.params.id });
    
    res.json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// POST /api/workouts/cleanup-duplicates - Remove duplicate workouts for current user
router.post('/cleanup-duplicates', auth, async (req, res) => {
  try {
    const userId = getUserId(req.user);
    
    // Get all workouts for this user
    const allWorkouts = await Workout.find({ user: userId }).sort({ createdAt: 1 });
    
    // Group by title
    const byTitle = {};
    allWorkouts.forEach(w => {
      const title = w.title || 'Unknown';
      if (!byTitle[title]) byTitle[title] = [];
      byTitle[title].push(w);
    });
    
    let totalDeleted = 0;
    const details = [];
    
    for (const [title, workouts] of Object.entries(byTitle)) {
      if (workouts.length > 1) {
        // Keep the first (oldest), delete the rest
        const idsToDelete = workouts.slice(1).map(w => w._id);
        await Workout.deleteMany({ _id: { $in: idsToDelete } });
        totalDeleted += idsToDelete.length;
        details.push({ title, kept: 1, deleted: idsToDelete.length });
      }
    }
    
    const remaining = await Workout.countDocuments({ user: userId });
    
    res.json({
      success: true,
      message: `Cleaned up ${totalDeleted} duplicate workouts`,
      details,
      remainingWorkouts: remaining
    });
  } catch (error) {
    console.error('Error cleaning duplicates:', error);
    res.status(500).json({ success: false, message: 'Failed to clean duplicates', error: error.message });
  }
});

export default router;

