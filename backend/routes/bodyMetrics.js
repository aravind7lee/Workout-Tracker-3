import express from 'express';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';
import BodyMetric from '../models/BodyMetric.js';
import User from '../models/User.js';
import { check as checkAchievements } from '../services/achievementEngine.js';

const router = express.Router();
router.use(auth);

const userId = (req) => req.user._id || req.user.id;
const optionalNumber = (value) => value === '' || value === null || value === undefined
  ? null
  : Number(value);

router.post('/', async (req, res) => {
  try {
    const weight = Number(req.body.weight);
    if (!Number.isFinite(weight) || weight <= 0 || weight > 1000) {
      return res.status(400).json({ success: false, message: 'Weight must be between 1 and 1000.' });
    }

    const bodyFatPercentage = optionalNumber(req.body.bodyFatPercentage);
    if (bodyFatPercentage !== null && (!Number.isFinite(bodyFatPercentage) || bodyFatPercentage < 0 || bodyFatPercentage > 100)) {
      return res.status(400).json({ success: false, message: 'Body fat percentage must be between 0 and 100.' });
    }

    const measurements = Object.fromEntries(
      ['chest', 'waist', 'hips', 'biceps', 'thighs', 'neck']
        .map((key) => [key, optionalNumber(req.body.measurements?.[key])])
        .filter(([, value]) => value !== null && Number.isFinite(value) && value >= 0)
    );

    const metric = await BodyMetric.create({
      user: userId(req),
      date: req.body.date ? new Date(req.body.date) : new Date(),
      weight,
      bodyFatPercentage,
      measurements,
      notes: String(req.body.notes || '').trim(),
      source: ['manual', 'smart_scale', 'onboarding'].includes(req.body.source) ? req.body.source : 'manual'
    });

    await User.findByIdAndUpdate(userId(req), {
      'metrics.currentWeight': weight,
      ...(bodyFatPercentage !== null ? { 'metrics.bodyFatPercentage': bodyFatPercentage } : {})
    });

    const achievements = await checkAchievements(userId(req)).catch((error) => {
      console.warn('Achievement check skipped after metric save:', error.message);
      return [];
    });
    res.status(201).json({ success: true, metric, achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to log body metric', error: error.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const metric = await BodyMetric.findOne({ user: userId(req) }).sort({ date: -1 });
    res.json({ success: true, metric });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load latest metric', error: error.message });
  }
});

router.get('/chart', async (req, res) => {
  try {
    const allowed = new Set(['30', '90', '365', 'all']);
    const range = allowed.has(String(req.query.days)) ? String(req.query.days) : '90';
    const query = { user: userId(req) };
    if (range !== 'all') {
      const since = new Date();
      since.setDate(since.getDate() - Number(range));
      query.date = { $gte: since };
    }
    const metrics = await BodyMetric.find(query).sort({ date: 1 }).lean();
    res.json({
      success: true,
      range,
      data: metrics.map((item) => ({
        id: item._id,
        date: item.date,
        weight: item.weight,
        bodyFatPercentage: item.bodyFatPercentage
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load chart data', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const query = { user: userId(req) };
    const [metrics, total] = await Promise.all([
      BodyMetric.find(query).sort({ date: -1 }).skip((page - 1) * limit).limit(limit),
      BodyMetric.countDocuments(query)
    ]);
    res.json({ success: true, metrics, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to load body metrics', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid metric ID.' });
    }
    const metric = await BodyMetric.findOneAndDelete({ _id: req.params.id, user: userId(req) });
    if (!metric) return res.status(404).json({ success: false, message: 'Metric not found.' });
    res.json({ success: true, message: 'Metric deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Unable to delete body metric', error: error.message });
  }
});

export default router;
