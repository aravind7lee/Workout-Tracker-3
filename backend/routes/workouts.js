// backend/routes/workouts.js
import express from 'express';
import Workout from '../models/Workout.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { public: isPublic } = req.query;
    
    let query = {};
    if (isPublic === 'true') {
      query.isPublic = true;
    } else {
      query.user = req.user._id;
    }
    
    const workouts = await Workout.find(query)
      .populate('exercises.exercise')
      .populate('user', 'name profileImage')
      .sort({ date: -1 });
    
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    console.log('📝 Received workout data:', JSON.stringify(req.body, null, 2));
    console.log('👤 User ID:', req.user._id);
    
    const data = req.body;
    
    // Validate required fields
    if (!data.title) {
      console.log('❌ Missing title');
      return res.status(400).json({ message: 'Workout title is required' });
    }
    
    // Create workout with proper structure - simplified for MongoDB
    const workoutData = {
      user: req.user._id,
      title: data.title,
      exercises: (data.exercises || []).map(ex => ({
        exercise: ex.exercise || ex.name || 'Unknown Exercise',
        sets: (ex.sets || []).map(set => ({
          reps: Number(set.reps) || 0,
          weight: Number(set.weight) || 0,
          rest: Number(set.rest) || 60
        })),
        notes: ex.notes || ''
      })),
      durationMinutes: Number(data.durationMinutes) || 0,
      calories: Number(data.calories) || 0,
      date: data.date ? new Date(data.date) : new Date(),
      isPublic: Boolean(data.isPublic)
    };
    
    console.log('💾 Creating workout with data:', JSON.stringify(workoutData, null, 2));
    
    const workout = new Workout(workoutData);
    const savedWorkout = await workout.save();
    
    console.log('✅ Workout saved successfully with ID:', savedWorkout._id);
    
    res.status(201).json({ 
      success: true,
      workout: savedWorkout,
      message: 'Workout saved successfully'
    });
  } catch (error) {
    console.error('❌ Workout save error:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to save workout', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : 'Internal server error'
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('exercises.exercise')
      .populate('user', 'name profileImage');
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    // Check if user can access this workout
    if (!workout.isPublic && workout.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle workout visibility
router.patch('/:id/visibility', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    workout.isPublic = !workout.isPublic;
    await workout.save();
    
    res.json({ isPublic: workout.isPublic });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update workout
router.put('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    Object.assign(workout, req.body);
    await workout.save();
    await workout.populate('exercises.exercise');
    
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete workout
router.delete('/:id', auth, async (req, res) => {
  try {
    const workout = await Workout.findById(req.params.id);
    
    if (!workout) {
      return res.status(404).json({ message: 'Workout not found' });
    }
    
    if (workout.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
