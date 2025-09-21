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
    const data = req.body;
    const workout = new Workout({ ...data, user: req.user._id });
    await workout.save();
    await workout.populate('exercises.exercise');
    res.status(201).json(workout);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
