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

export default router;
