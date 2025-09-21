// backend/routes/nutrition.js
import express from 'express';
import auth from '../middleware/auth.js';
import Meal from '../models/Meal.js';
import User from '../models/User.js';
import nutritionService from '../services/nutritionService.js';

const router = express.Router();

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map();

// Rate limiting middleware
const rateLimit = (req, res, next) => {
  const key = req.user ? req.user._id.toString() : req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = req.user ? 60 : 20; // Higher limit for authenticated users
  
  if (!rateLimitMap.has(key)) {
    rateLimitMap.set(key, []);
  }
  
  const requests = rateLimitMap.get(key);
  
  // Remove old requests outside the window
  const validRequests = requests.filter(time => now - time < windowMs);
  rateLimitMap.set(key, validRequests);
  
  if (validRequests.length >= maxRequests) {
    return res.status(429).json({
      ok: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
  
  validRequests.push(now);
  next();
};

// GET /api/nutrition/test - Test endpoint
router.get('/test', async (req, res) => {
  try {
    const testResult = await nutritionService.lookup('chicken breast 100g');
    res.json({
      ok: true,
      message: 'Nutrition service is working',
      testResult: testResult
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Nutrition service test failed',
      message: error.message
    });
  }
});

// POST /api/nutrition/lookup - Main nutrition lookup endpoint
router.post('/lookup', rateLimit, async (req, res) => {
  try {
    const { query } = req.body;
    
    // Validate query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Query is required and must be a non-empty string'
      });
    }
    
    if (query.length > 200) {
      return res.status(400).json({
        ok: false,
        error: 'Query too long (max 200 characters)'
      });
    }
    
    console.log(`🔍 Nutrition lookup: "${query}" ${req.user ? `(user: ${req.user.email})` : `(IP: ${req.ip})`}`);
    
    // Perform lookup
    const result = await nutritionService.lookup(query.trim());
    
    // Log cache performance
    if (result.cached) {
      console.log('📊 Cache hit rate improved');
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Nutrition lookup error:', error);
    res.status(500).json({
      ok: false,
      error: 'Internal server error during nutrition lookup',
      message: error.message
    });
  }
});

// POST /api/meals - Add meal to user's log
router.post('/meals', auth, async (req, res) => {
  try {
    const {
      rawQuery,
      parsedName,
      servingText,
      servingGrams,
      multiplier,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      sugar,
      sodium,
      source,
      meta,
      mealType
    } = req.body;

    // Validate required fields
    if (!rawQuery || !parsedName || !servingText || !servingGrams || 
        calories === undefined || protein === undefined || 
        carbs === undefined || fat === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required meal data'
      });
    }

    // Validate numeric values
    if (calories < 0 || protein < 0 || carbs < 0 || fat < 0 || servingGrams <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid nutrition values'
      });
    }

    // Create meal record
    const meal = new Meal({
      userId: req.user._id,
      rawQuery: rawQuery.trim(),
      parsedName: parsedName.trim(),
      servingText: servingText.trim(),
      servingGrams: Number(servingGrams),
      multiplier: Number(multiplier) || 1,
      calories: Math.round(Number(calories)),
      protein: Math.round(Number(protein) * 10) / 10,
      carbs: Math.round(Number(carbs) * 10) / 10,
      fat: Math.round(Number(fat) * 10) / 10,
      fiber: Math.round(Number(fiber || 0) * 10) / 10,
      sugar: Math.round(Number(sugar || 0) * 10) / 10,
      sodium: Math.round(Number(sodium || 0) * 10) / 10,
      source: source || 'unknown',
      meta: meta || {},
      mealType: mealType || 'snack',
      consumedAt: new Date(),
      synced: true
    });

    await meal.save();

    console.log(`✅ Meal added: ${meal.parsedName} (${meal.calories} cal) for user: ${req.user.email}`);

    res.status(201).json({
      success: true,
      data: meal,
      message: 'Meal added successfully'
    });

  } catch (error) {
    console.error('❌ Add meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add meal',
      error: error.message
    });
  }
});

// GET /api/meals - Get meals for a specific date
router.get('/meals', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Validate date
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }
    
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meals = await Meal.find({
      userId: req.user._id,
      consumedAt: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      synced: true
    }).sort({ consumedAt: -1 });

    res.json({
      success: true,
      data: meals,
      count: meals.length,
      date: targetDate.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('❌ Get meals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve meals',
      error: error.message
    });
  }
});

// GET /api/meals/totals - Get aggregated totals for a date
router.get('/meals/totals', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Validate date
    if (isNaN(targetDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const totals = await Meal.getDailyTotals(req.user._id, targetDate);

    // Round totals for display
    const roundedTotals = {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      sugar: Math.round(totals.sugar * 10) / 10,
      sodium: Math.round(totals.sodium * 10) / 10,
      mealsCount: totals.mealsCount
    };

    res.json({
      success: true,
      data: roundedTotals,
      date: targetDate.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('❌ Get totals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve daily totals',
      error: error.message
    });
  }
});

// PUT /api/meals/:id - Update meal
router.put('/meals/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['servingText', 'servingGrams', 'multiplier', 'calories', 'protein', 'carbs', 'fat', 'mealType'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    updates.updatedAt = new Date();

    const updatedMeal = await Meal.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    console.log(`✅ Meal updated: ${updatedMeal.parsedName} for user: ${req.user.email}`);

    res.json({
      success: true,
      data: updatedMeal,
      message: 'Meal updated successfully'
    });

  } catch (error) {
    console.error('❌ Update meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meal',
      error: error.message
    });
  }
});

// DELETE /api/meals/:id - Delete meal
router.delete('/meals/:id', auth, async (req, res) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    console.log(`✅ Meal deleted: ${meal.parsedName} for user: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meal',
      error: error.message
    });
  }
});

// GET /api/users/me/targets - Get user's nutrition targets
router.get('/users/me/targets', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const targets = {
      baselineCalories: user.baselineCalories,
      goalType: user.goalType,
      macroTargets: user.macroTargets,
      dailyProteinTarget: user.dailyProteinTarget,
      macroPercents: user.macroPercents,
      physicalStats: {
        weight: user.weight,
        height: user.height,
        age: user.age,
        sex: user.sex
      }
    };

    res.json({
      success: true,
      data: targets
    });

  } catch (error) {
    console.error('❌ Get targets error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve nutrition targets',
      error: error.message
    });
  }
});

export default router;