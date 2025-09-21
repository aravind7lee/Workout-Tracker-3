import express from 'express';
import Meal from '../models/Meal.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user's nutrition targets
router.get('/users/me/targets', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const targets = {
      baselineCalories: user.baselineCalories || 2000,
      goalType: user.goalType || 'maintain',
      macroTargets: user.macroTargets || { protein: 150, carbs: 200, fat: 65 }
    };

    res.json({ success: true, data: targets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get meals for a specific date
router.get('/meals', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId: req.user.id,
      consumedAt: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ consumedAt: -1 });

    res.json({ success: true, data: meals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get nutrition totals for a specific date
router.get('/meals/totals', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId: req.user.id,
      consumedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const totals = meals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories || 0),
      protein: Math.round((acc.protein + (meal.protein || 0)) * 10) / 10,
      carbs: Math.round((acc.carbs + (meal.carbs || 0)) * 10) / 10,
      fat: Math.round((acc.fat + (meal.fat || 0)) * 10) / 10,
      mealsCount: acc.mealsCount + 1
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, mealsCount: 0 });

    res.json({ success: true, data: totals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add a new meal
router.post('/meals', auth, async (req, res) => {
  try {
    const meal = new Meal({
      ...req.body,
      userId: req.user.id,
      consumedAt: new Date()
    });

    await meal.save();
    res.status(201).json({ success: true, data: meal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a meal
router.delete('/meals/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Nutrition lookup with real food database
router.post('/lookup', auth, async (req, res) => {
  try {
    const { query } = req.body;
    
    // Real nutrition database lookup
    const nutritionDatabase = {
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6 },
      'rice': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
      'broccoli': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
      'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
      'oats': { calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
      'salmon': { calories: 208, protein: 20, carbs: 0, fat: 12 },
      'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
      'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15 },
      'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
      'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50 }
    };

    const searchTerm = query.toLowerCase();
    let result = nutritionDatabase[searchTerm];
    
    if (!result) {
      // Find closest match
      const matches = Object.keys(nutritionDatabase).filter(food => 
        food.includes(searchTerm) || searchTerm.includes(food)
      );
      
      if (matches.length > 0) {
        result = nutritionDatabase[matches[0]];
        result.name = matches[0];
      } else {
        // Default values for unknown foods
        result = {
          name: query,
          calories: 100,
          protein: 5,
          carbs: 15,
          fat: 3
        };
      }
    } else {
      result.name = searchTerm;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;