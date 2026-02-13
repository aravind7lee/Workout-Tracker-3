// backend/routes/cardio.js - Cardio Routes
import express from 'express';
import Cardio from '../models/Cardio.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all cardio sessions for user
router.get('/', auth, async (req, res) => {
  try {
    const { activityType, startDate, endDate, limit = 50 } = req.query;
    
    let query = { user: req.user._id };
    
    if (activityType) {
      query.activityType = activityType;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const sessions = await Cardio.find(query)
      .populate('linkedWorkout', 'title')
      .sort({ date: -1 })
      .limit(parseInt(limit));
    
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('❌ Cardio fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get cardio statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const sessions = await Cardio.find({
      user: req.user._id,
      date: { $gte: startDate }
    });
    
    const stats = {
      totalSessions: sessions.length,
      totalDistance: sessions.reduce((sum, s) => sum + s.distance, 0),
      totalDuration: sessions.reduce((sum, s) => sum + s.duration, 0),
      totalCalories: sessions.reduce((sum, s) => sum + s.calories, 0),
      averagePace: sessions.filter(s => s.pace > 0).reduce((sum, s, _, arr) => sum + s.pace / arr.length, 0),
      averageSpeed: sessions.filter(s => s.speed > 0).reduce((sum, s, _, arr) => sum + s.speed / arr.length, 0),
      averageHeartRate: sessions.filter(s => s.heartRate.average > 0).reduce((sum, s, _, arr) => sum + s.heartRate.average / arr.length, 0),
      byActivity: {}
    };
    
    // Group by activity type
    sessions.forEach(session => {
      if (!stats.byActivity[session.activityType]) {
        stats.byActivity[session.activityType] = {
          count: 0,
          distance: 0,
          duration: 0,
          calories: 0
        };
      }
      stats.byActivity[session.activityType].count++;
      stats.byActivity[session.activityType].distance += session.distance;
      stats.byActivity[session.activityType].duration += session.duration;
      stats.byActivity[session.activityType].calories += session.calories;
    });
    
    res.json({ success: true, stats });
  } catch (error) {
    console.error('❌ Cardio stats error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Create new cardio session
router.post('/', auth, async (req, res) => {
  try {
    console.log('📝 Creating cardio session:', req.body);
    
    const cardioData = {
      user: req.user._id,
      activityType: req.body.activityType,
      date: req.body.date || new Date(),
      duration: Number(req.body.duration),
      distance: Number(req.body.distance) || 0,
      steps: Number(req.body.steps) || 0,
      heartRate: {
        average: Number(req.body.heartRate?.average) || 0,
        max: Number(req.body.heartRate?.max) || 0,
        min: Number(req.body.heartRate?.min) || 0
      },
      calories: Number(req.body.calories) || 0,
      intensity: req.body.intensity || 'moderate',
      notes: req.body.notes || '',
      linkedWorkout: req.body.linkedWorkout || null
    };

    
    
    const session = new Cardio(cardioData);
    await session.save();
    
    console.log('✅ Cardio session created:', session._id);
    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error('❌ Cardio create error:', error);
    res.status(500).json({ success: false, message: 'Failed to create session', error: error.message });
  }
});

// Get single cardio session
router.get('/:id', auth, async (req, res) => {
  try {
    const session = await Cardio.findById(req.params.id)
      .populate('linkedWorkout', 'title');
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    res.json({ success: true, session });
  } catch (error) {
    console.error('❌ Cardio fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Update cardio session
router.put('/:id', auth, async (req, res) => {
  try {
    const session = await Cardio.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    Object.assign(session, req.body);
    await session.save();
    
    console.log('✅ Cardio session updated:', session._id);
    res.json({ success: true, session });
  } catch (error) {
    console.error('❌ Cardio update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update session', error: error.message });
  }
});

// Delete cardio session
router.delete('/:id', auth, async (req, res) => {
  try {
    const session = await Cardio.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    
    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    
    await Cardio.findByIdAndDelete(req.params.id);
    
    console.log('✅ Cardio session deleted:', req.params.id);
    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    console.error('❌ Cardio delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete session', error: error.message });
  }
});

export default router;
