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

router.delete('/:id', auth, async (req, res) => {
  await Meal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ message: 'Meal deleted' });
});

router.get('/totals', auth, async (req, res) => {
  const meals = await Meal.find({ user: req.user._id });
  const totals = meals.reduce((acc, meal) => ({
    calories: acc.calories + (meal.calories || 0),
    protein: acc.protein + (meal.protein || 0),
    carbs: acc.carbs + (meal.carbs || 0),
    fat: acc.fat + (meal.fat || 0),
    mealsCount: acc.mealsCount + 1
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 });
  res.json(totals);
});

export default router;
