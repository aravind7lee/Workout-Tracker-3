// backend/routes/meals.js
import express from 'express';
import Meal from '../models/Meal.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const meals = await Meal.find({ user: req.user._id }).sort({ date: -1 });
  res.json(meals);
});

router.post('/', auth, async (req, res) => {
  const meal = new Meal({ ...req.body, user: req.user._id });
  await meal.save();
  res.json(meal);
});

export default router;
