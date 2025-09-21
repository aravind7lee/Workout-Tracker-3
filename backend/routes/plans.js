// backend/routes/plans.js
import express from 'express';
import Plan from '../models/Plan.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const plans = await Plan.find({ user: req.user._id }).populate('days.exercises');
  res.json(plans);
});

router.post('/', auth, async (req, res) => {
  const plan = new Plan({ ...req.body, user: req.user._id });
  await plan.save();
  res.json(plan);
});

export default router;
