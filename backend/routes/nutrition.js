import express from 'express';
import Meal from '../models/Meal.js';
import User from '../models/User.js';
import Food from '../models/Food.js';
import auth from '../middleware/auth.js';
import fetch from 'node-fetch';
import foodDatabase from '../services/foodDatabase.js';
import { check as checkAchievements } from '../services/achievementEngine.js';

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

    // Ensure each meal has proper ID structure
    const mealsWithIds = meals.map(meal => ({
      ...meal.toObject(),
      id: meal._id.toString() // Ensure we have both _id and id
    }));

    res.json({ success: true, data: mealsWithIds });
  } catch (error) {
    console.error('Get meals error:', error);
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
    const mealData = {
      ...req.body,
      userId: req.user.id,
      consumedAt: new Date()
    };
    
    // Ensure required fields
    if (!mealData.name && !mealData.parsedName) {
      return res.status(400).json({ success: false, message: 'Meal name is required' });
    }
    
    const meal = new Meal(mealData);
    await meal.save();
    
    // Return meal with proper ID structure
    const mealResponse = {
      ...meal.toObject(),
      id: meal._id.toString() // Ensure we have both _id and id
    };
    
    const achievements = await checkAchievements(req.user.id).catch((error) => { console.warn('Achievement check skipped after meal save:', error.message); return []; });
    res.status(201).json({ success: true, data: mealResponse, achievements });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete a meal
router.delete('/meals/:id', auth, async (req, res) => {
  try {
    const mealId = req.params.id;
    
    // Validate meal ID
    if (!mealId || mealId === 'undefined' || mealId === 'null') {
      return res.status(400).json({ success: false, message: 'Invalid meal ID' });
    }
    
    // Check if it's a valid MongoDB ObjectId
    if (!mealId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid meal ID format' });
    }

    const meal = await Meal.findOneAndDelete({
      _id: mealId,
      userId: req.user.id
    });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Invalid meal ID format' });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get food categories with comprehensive database
router.get('/food-categories', async (req, res) => {
  try {
    // Try MongoDB first, fallback to static database
    let categories;
    
    try {
      const [animalProteins, plantProteins, carbs, dairy, vegetables, fruits, nuts, snacks, beverages] = await Promise.all([
        Food.getFoodsByCategory('animal_protein').limit(12),
        Food.getFoodsByCategory('plant_protein').limit(10),
        Food.getFoodsByCategory('carbohydrates').limit(14),
        Food.getFoodsByCategory('dairy').limit(8),
        Food.getFoodsByCategory('vegetables').limit(10),
        Food.getFoodsByCategory('fruits').limit(10),
        Food.getFoodsByCategory('nuts_seeds').limit(8),
        Food.getFoodsByCategory('snacks').limit(8),
        Food.getFoodsByCategory('beverages').limit(6)
      ]);
      
      categories = {
        animalProteins: {
          icon: '🥩',
          title: 'Animal Proteins',
          foods: animalProteins
        },
        plantProteins: {
          icon: '🌱',
          title: 'Plant Proteins',
          foods: plantProteins
        },
        dairy: {
          icon: '🥛',
          title: 'Dairy & Alternatives',
          foods: dairy
        },
        vegetables: {
          icon: '🥦',
          title: 'Vegetables',
          foods: vegetables
        },
        fruits: {
          icon: '🍎',
          title: 'Fruits',
          foods: fruits
        },
        carbs: {
          icon: '🍚',
          title: 'Carbohydrates (Fuel Sources)',
          foods: carbs
        },
        nuts: {
          icon: '🥜',
          title: 'Nuts & Seeds',
          foods: nuts
        },
        snacks: {
          icon: '🍫',
          title: 'Snacks & Condiments',
          foods: snacks
        },
        beverages: {
          icon: '🥤',
          title: 'Beverages',
          foods: beverages
        }
      };
    } catch (dbError) {
      console.log('MongoDB unavailable, using static database:', dbError.message);
      
      // Fallback to static database
      categories = {
        animalProteins: {
          icon: '🥩',
          title: 'Animal Proteins',
          foods: foodDatabase.getFoodsByCategory('animal_protein')
        },
        plantProteins: {
          icon: '🌱',
          title: 'Plant Proteins', 
          foods: foodDatabase.getFoodsByCategory('plant_protein')
        },
        dairy: {
          icon: '🥛',
          title: 'Dairy & Alternatives',
          foods: foodDatabase.getFoodsByCategory('dairy')
        },
        vegetables: {
          icon: '🥦',
          title: 'Vegetables',
          foods: foodDatabase.getFoodsByCategory('vegetables')
        },
        fruits: {
          icon: '🍎',
          title: 'Fruits',
          foods: foodDatabase.getFoodsByCategory('fruits')
        },
        carbs: {
          icon: '🍚',
          title: 'Carbohydrates (Fuel Sources)',
          foods: foodDatabase.getFoodsByCategory('carbohydrates')
        },
        nuts: {
          icon: '🥜',
          title: 'Nuts & Seeds',
          foods: foodDatabase.getFoodsByCategory('nuts_seeds')
        },
        snacks: {
          icon: '🍫',
          title: 'Snacks & Condiments',
          foods: foodDatabase.getFoodsByCategory('snacks')
        },
        beverages: {
          icon: '🥤',
          title: 'Beverages',
          foods: foodDatabase.getFoodsByCategory('beverages')
        }
      };
    }
    
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Food categories error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Search foods in database
router.get('/foods/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }
    
    let results;
    
    try {
      // Try MongoDB first
      results = await Food.searchFoods(q, 10);
    } catch (dbError) {
      console.log('MongoDB search failed, using static database:', dbError.message);
      // Fallback to static database
      results = foodDatabase.searchFood(q);
    }
    
    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Food search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Real-time Nutritionix API lookup
router.post('/lookup', auth, async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, message: 'Food query is required' });
    }

    // Call Nutritionix API
    const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
      method: 'POST',
      headers: {
        'x-app-id': process.env.NUTRITIONIX_APP_ID,
        'x-app-key': process.env.NUTRITIONIX_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        timezone: 'US/Eastern'
      })
    });

    if (!response.ok) {
      throw new Error(`Nutritionix API error: ${response.status}`);
    }

    const data = await response.json();
    const foods = data.foods || [];
    
    if (foods.length === 0) {
      return res.status(404).json({ success: false, message: 'Food not found' });
    }

    // Parse first food item
    const food = foods[0];
    const result = {
      name: food.food_name || 'Unknown Food',
      parsedName: food.food_name || 'Unknown Food',
      serving: `${food.serving_qty || 1} ${food.serving_unit || 'serving'}`,
      servingText: `${food.serving_qty || 1} ${food.serving_unit || 'serving'}`,
      servingGrams: food.serving_weight_grams || 100,
      calories: Math.round(food.nf_calories || 0),
      protein: Math.round((food.nf_protein || 0) * 10) / 10,
      carbs: Math.round((food.nf_total_carbohydrate || 0) * 10) / 10,
      fat: Math.round((food.nf_total_fat || 0) * 10) / 10,
      fiber: Math.round((food.nf_dietary_fiber || 0) * 10) / 10,
      sugar: Math.round((food.nf_sugars || 0) * 10) / 10,
      sodium: Math.round((food.nf_sodium || 0) * 10) / 10,
      image: food.photo?.thumb || '',
      source: 'nutritionix'
    };

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Nutritionix lookup failed:', error.message);
    
    // Comprehensive fallback database
    const fallbackDatabase = {
      // Proteins
      'chicken breast': { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingText: '100g', servingGrams: 100 },
      'chicken': { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, servingText: '100g', servingGrams: 100 },
      'chicken thighs': { name: 'Chicken Thighs', calories: 209, protein: 26, carbs: 0, fat: 11, servingText: '100g', servingGrams: 100 },
      'turkey breast': { name: 'Turkey Breast', calories: 189, protein: 29, carbs: 0, fat: 7.4, servingText: '100g', servingGrams: 100 },
      'salmon': { name: 'Salmon', calories: 208, protein: 25.4, carbs: 0, fat: 12.4, servingText: '100g', servingGrams: 100 },
      'tuna': { name: 'Tuna', calories: 144, protein: 30, carbs: 0, fat: 0.8, servingText: '100g', servingGrams: 100 },
      'sardines': { name: 'Sardines', calories: 208, protein: 25, carbs: 0, fat: 11.5, servingText: '100g', servingGrams: 100 },
      'mackerel': { name: 'Mackerel', calories: 305, protein: 19, carbs: 0, fat: 25, servingText: '100g', servingGrams: 100 },
      'beef steak': { name: 'Beef Steak', calories: 271, protein: 26, carbs: 0, fat: 18, servingText: '100g', servingGrams: 100 },
      'ground beef lean': { name: 'Ground Beef (Lean)', calories: 250, protein: 26, carbs: 0, fat: 15, servingText: '100g', servingGrams: 100 },
      'pork loin': { name: 'Pork Loin', calories: 242, protein: 27, carbs: 0, fat: 14, servingText: '100g', servingGrams: 100 },
      'eggs': { name: 'Eggs', calories: 70, protein: 6, carbs: 0.5, fat: 5, servingText: '1 large', servingGrams: 50 },
      'egg': { name: 'Egg', calories: 70, protein: 6, carbs: 0.5, fat: 5, servingText: '1 large', servingGrams: 50 },
      'egg whites': { name: 'Egg Whites', calories: 52, protein: 11, carbs: 0.7, fat: 0.2, servingText: '3 whites', servingGrams: 100 },
      
      // Dairy
      'greek yogurt': { name: 'Greek Yogurt', calories: 130, protein: 23, carbs: 9, fat: 0, servingText: '1 cup', servingGrams: 170 },
      'skimmed milk': { name: 'Skimmed Milk', calories: 83, protein: 8.3, carbs: 12, fat: 0.2, servingText: '1 cup', servingGrams: 240 },
      'whole milk': { name: 'Whole Milk', calories: 149, protein: 7.7, carbs: 11.7, fat: 7.9, servingText: '1 cup', servingGrams: 240 },
      'cottage cheese': { name: 'Cottage Cheese', calories: 98, protein: 11, carbs: 3.4, fat: 4.3, servingText: '100g', servingGrams: 100 },
      'cheese slice': { name: 'Cheese Slice', calories: 113, protein: 7, carbs: 1, fat: 9, servingText: '1 slice', servingGrams: 20 },
      'whey protein': { name: 'Whey Protein', calories: 120, protein: 25, carbs: 2, fat: 1, servingText: '1 scoop', servingGrams: 30 },
      'soy milk': { name: 'Soy Milk', calories: 80, protein: 7, carbs: 4, fat: 4, servingText: '1 cup', servingGrams: 240 },
      'almond milk': { name: 'Almond Milk', calories: 39, protein: 1.5, carbs: 3.4, fat: 2.9, servingText: '1 cup', servingGrams: 240 },
      
      // Vegetables
      'broccoli': { name: 'Broccoli', calories: 25, protein: 3, carbs: 5, fat: 0.3, servingText: '1 cup', servingGrams: 90 },
      'spinach': { name: 'Spinach', calories: 7, protein: 0.9, carbs: 1.1, fat: 0.1, servingText: '1 cup raw', servingGrams: 30 },
      'kale': { name: 'Kale', calories: 8, protein: 0.6, carbs: 1.4, fat: 0.1, servingText: '1 cup raw', servingGrams: 16 },
      'carrots': { name: 'Carrots', calories: 25, protein: 0.5, carbs: 6, fat: 0.1, servingText: '1 medium', servingGrams: 60 },
      'bell pepper': { name: 'Bell Pepper', calories: 24, protein: 1, carbs: 7, fat: 0.3, servingText: '1 medium', servingGrams: 120 },
      'tomatoes': { name: 'Tomatoes', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, servingText: '1 medium', servingGrams: 100 },
      'onions': { name: 'Onions', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, servingText: '1 medium', servingGrams: 100 },
      'sweet potato': { name: 'Sweet Potato', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, servingText: '100g', servingGrams: 100 },
      'potato': { name: 'Potato', calories: 77, protein: 2, carbs: 17, fat: 0.1, servingText: '100g', servingGrams: 100 },
      'cauliflower': { name: 'Cauliflower', calories: 25, protein: 2, carbs: 5, fat: 0.3, servingText: '1 cup', servingGrams: 100 },
      
      // Fruits
      'apple': { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, servingText: '1 medium', servingGrams: 150 },
      'banana': { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, servingText: '1 medium', servingGrams: 120 },
      'orange': { name: 'Orange', calories: 62, protein: 1.2, carbs: 15.4, fat: 0.2, servingText: '1 medium', servingGrams: 130 },
      'blueberries': { name: 'Blueberries', calories: 84, protein: 1.1, carbs: 21.5, fat: 0.5, servingText: '1 cup', servingGrams: 150 },
      'strawberries': { name: 'Strawberries', calories: 49, protein: 1, carbs: 11.7, fat: 0.5, servingText: '1 cup', servingGrams: 150 },
      'grapes': { name: 'Grapes', calories: 104, protein: 1.1, carbs: 27.3, fat: 0.2, servingText: '1 cup', servingGrams: 150 },
      'mango': { name: 'Mango', calories: 135, protein: 1.1, carbs: 35, fat: 0.6, servingText: '1 medium', servingGrams: 200 },
      'pineapple': { name: 'Pineapple', calories: 83, protein: 0.9, carbs: 21.6, fat: 0.2, servingText: '1 cup', servingGrams: 150 },
      'papaya': { name: 'Papaya', calories: 62, protein: 0.7, carbs: 15.7, fat: 0.4, servingText: '1 cup', servingGrams: 140 },
      'watermelon': { name: 'Watermelon', calories: 46, protein: 0.9, carbs: 11.5, fat: 0.2, servingText: '1 cup', servingGrams: 150 },
      
      // Carbs & Grains
      'white rice': { name: 'White Rice', calories: 205, protein: 4.3, carbs: 45, fat: 0.4, servingText: '1 cup cooked', servingGrams: 150 },
      'rice': { name: 'White Rice', calories: 205, protein: 4.3, carbs: 45, fat: 0.4, servingText: '1 cup cooked', servingGrams: 150 },
      'brown rice': { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, servingText: '1 cup cooked', servingGrams: 150 },
      'quinoa': { name: 'Quinoa', calories: 222, protein: 8, carbs: 39, fat: 3.6, servingText: '1 cup cooked', servingGrams: 185 },
      'oats': { name: 'Oats', calories: 307, protein: 10.7, carbs: 54.8, fat: 5.3, servingText: '1 cup', servingGrams: 90 },
      'whole wheat bread': { name: 'Whole Wheat Bread', calories: 69, protein: 3.6, carbs: 12, fat: 1.2, servingText: '1 slice', servingGrams: 40 },
      'white bread': { name: 'White Bread', calories: 79, protein: 2.3, carbs: 14.2, fat: 1.2, servingText: '1 slice', servingGrams: 35 },
      'pasta': { name: 'Pasta', calories: 220, protein: 8, carbs: 44, fat: 1.1, servingText: '1 cup cooked', servingGrams: 140 },
      'roti chapati': { name: 'Roti/Chapati', calories: 104, protein: 3.1, carbs: 18, fat: 2.4, servingText: '1 piece', servingGrams: 40 },
      'corn': { name: 'Corn', calories: 132, protein: 5, carbs: 29, fat: 1.5, servingText: '1 cup', servingGrams: 150 },
      'lentils': { name: 'Lentils', calories: 230, protein: 18, carbs: 40, fat: 0.8, servingText: '1 cup cooked', servingGrams: 200 },
      'chickpeas': { name: 'Chickpeas', calories: 269, protein: 15, carbs: 45, fat: 4.2, servingText: '1 cup cooked', servingGrams: 160 },
      'kidney beans': { name: 'Kidney Beans', calories: 225, protein: 15, carbs: 40, fat: 0.9, servingText: '1 cup cooked', servingGrams: 180 },
      
      // Nuts & Seeds
      'almonds': { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, servingText: '28g', servingGrams: 28 },
      'walnuts': { name: 'Walnuts', calories: 185, protein: 4.3, carbs: 3.9, fat: 18.5, servingText: '28g', servingGrams: 28 },
      'cashews': { name: 'Cashews', calories: 157, protein: 5.2, carbs: 8.6, fat: 12.4, servingText: '28g', servingGrams: 28 },
      'peanuts': { name: 'Peanuts', calories: 161, protein: 7.3, carbs: 4.6, fat: 14, servingText: '28g', servingGrams: 28 },
      'chia seeds': { name: 'Chia Seeds', calories: 138, protein: 4.7, carbs: 12, fat: 8.7, servingText: '2 tbsp', servingGrams: 28 },
      'flax seeds': { name: 'Flax Seeds', calories: 151, protein: 5.2, carbs: 8.1, fat: 11.9, servingText: '2 tbsp', servingGrams: 28 },
      'pumpkin seeds': { name: 'Pumpkin Seeds', calories: 151, protein: 7, carbs: 5, fat: 13, servingText: '28g', servingGrams: 28 },
      'sunflower seeds': { name: 'Sunflower Seeds', calories: 164, protein: 5.8, carbs: 6.5, fat: 14.1, servingText: '28g', servingGrams: 28 },
      
      // Snacks & Condiments
      'peanut butter': { name: 'Peanut Butter', calories: 188, protein: 8, carbs: 8, fat: 16, servingText: '2 tbsp', servingGrams: 32 },
      'almond butter': { name: 'Almond Butter', calories: 196, protein: 7.2, carbs: 7.4, fat: 18.3, servingText: '2 tbsp', servingGrams: 32 },
      'dark chocolate': { name: 'Dark Chocolate', calories: 155, protein: 2, carbs: 13, fat: 9, servingText: '28g', servingGrams: 28 },
      'protein bar': { name: 'Protein Bar', calories: 200, protein: 20, carbs: 20, fat: 6, servingText: '1 bar', servingGrams: 60 },
      'honey': { name: 'Honey', calories: 64, protein: 0.1, carbs: 17.3, fat: 0, servingText: '1 tbsp', servingGrams: 21 },
      'olive oil': { name: 'Olive Oil', calories: 119, protein: 0, carbs: 0, fat: 13.5, servingText: '1 tbsp', servingGrams: 14 },
      'coconut oil': { name: 'Coconut Oil', calories: 121, protein: 0, carbs: 0, fat: 13.5, servingText: '1 tbsp', servingGrams: 14 },
      'butter': { name: 'Butter', calories: 102, protein: 0.1, carbs: 0, fat: 11.5, servingText: '1 tbsp', servingGrams: 14 },
      
      // Beverages
      'black coffee': { name: 'Black Coffee', calories: 2, protein: 0.3, carbs: 0, fat: 0, servingText: '1 cup', servingGrams: 240 },
      'green tea': { name: 'Green Tea', calories: 2, protein: 0.5, carbs: 0, fat: 0, servingText: '1 cup', servingGrams: 240 },
      'black tea': { name: 'Black Tea', calories: 2, protein: 0, carbs: 0.7, fat: 0, servingText: '1 cup', servingGrams: 240 },
      'fresh orange juice': { name: 'Fresh Orange Juice', calories: 112, protein: 1.7, carbs: 25.8, fat: 0.5, servingText: '1 cup', servingGrams: 240 },
      'smoothie': { name: 'Smoothie', calories: 150, protein: 5, carbs: 30, fat: 2, servingText: '1 cup', servingGrams: 250 },
      'sports drink': { name: 'Sports Drink', calories: 80, protein: 0, carbs: 21, fat: 0, servingText: '1 bottle', servingGrams: 500 }
    };
    
    const searchTerm = req.body.query.toLowerCase().trim();
    let fallback = fallbackDatabase[searchTerm];
    
    // Try partial matching if no direct match
    if (!fallback) {
      for (const [key, nutrition] of Object.entries(fallbackDatabase)) {
        if (searchTerm.includes(key) || key.includes(searchTerm)) {
          fallback = nutrition;
          break;
        }
      }
    }
    
    // Default fallback if nothing matches
    if (!fallback) {
      fallback = {
        name: req.body.query || 'Unknown Food',
        parsedName: req.body.query || 'Unknown Food',
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 3,
        fiber: 2,
        sugar: 5,
        sodium: 50,
        servingText: '1 serving',
        servingGrams: 100
      };
    } else {
      fallback = {
        ...fallback,
        parsedName: fallback.name,
        fiber: fallback.fiber || 0,
        sugar: fallback.sugar || 0,
        sodium: fallback.sodium || 0
      };
    }
    
    res.json({ success: true, data: { ...fallback, source: 'fallback' } });
  }
});

export default router;
