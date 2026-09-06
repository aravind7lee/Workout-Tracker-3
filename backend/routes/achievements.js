import express from 'express';
import auth from '../middleware/auth.js';
import { check, getAchievementProgress } from '../services/achievementEngine.js';

const router = express.Router();
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const newlyUnlocked = await check(userId);
    const achievements = await getAchievementProgress(userId);
    res.json({ success: true, achievements, newlyUnlocked });
  } catch (error) {
    const status = error.message === 'User not found' ? 404 : 500;
    res.status(status).json({ success: false, message: status === 404 ? 'User not found' : 'Unable to load achievements', error: error.message });
  }
});
export default router;
