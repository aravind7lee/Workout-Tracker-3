// backend/routes/achievements.js
import express from 'express';
import Achievement from '../models/Achievement.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const items = await Achievement.find({ user: req.user._id }).sort({ achievedAt: -1 });
  res.json(items);
});

router.post('/', auth, async (req, res) => {
  const item = new Achievement({ ...req.body, user: req.user._id });
  await item.save();
  res.json(item);
});

export default router;
