import express from 'express';
import auth from '../middleware/auth.js';
import FitnessIntelligenceService from '../services/fitnessIntelligenceService.js';

const router = express.Router();

// Apply auth middleware to all intelligence endpoints
router.use(auth);

// Helper to safely get user ID
const getUserId = (user) => (user._id || user.id || user).toString();

// GET /api/intelligence/recommendations - Compile all recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const data = await FitnessIntelligenceService.getAllRecommendations(userId);
    res.json(data);
  } catch (error) {
    console.error('Error in intelligence recommendations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/intelligence/progressive-overload - Progressive overload rules
router.get('/progressive-overload', async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const overload = await FitnessIntelligenceService.getProgressiveOverload(userId);
    res.json({ success: true, recommendations: overload });
  } catch (error) {
    console.error('Error in progressive overload endpoint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/intelligence/plateau - Plateau detection
router.get('/plateau', async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const plateaus = await FitnessIntelligenceService.getPlateauDetections(userId);
    res.json({ success: true, plateaus });
  } catch (error) {
    console.error('Error in plateau endpoint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/intelligence/muscle-balance - Muscle group volume balance
router.get('/muscle-balance', async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const balance = await FitnessIntelligenceService.getMuscleBalance(userId);
    res.json({ success: true, balance });
  } catch (error) {
    console.error('Error in muscle balance endpoint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/intelligence/today-focus - What Should I Do Today recommendation
router.get('/today-focus', async (req, res) => {
  try {
    const userId = getUserId(req.user);
    const todayFocus = await FitnessIntelligenceService.getTodayFocus(userId);
    res.json({ success: true, todayFocus });
  } catch (error) {
    console.error('Error in today focus endpoint:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
