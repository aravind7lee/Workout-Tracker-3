// backend/routes/meals.js
import express from 'express';
import Meal from '../models/Meal.js';
import auth from '../middleware/auth.js';
import mongoose from 'mongoose';
import { check as checkAchievements } from '../services/achievementEngine.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    // Handle both userId and user fields for backward compatibility
    const mealsWithUserId = await Meal.find({ userId: req.user._id }).sort({ consumedAt: -1 });
    const mealsWithUser = await Meal.find({ user: req.user._id }).sort({ consumedAt: -1 });
    
    // Auto-migrate meals with wrong field name
    if (mealsWithUser.length > 0) {
      try {
        await Meal.updateMany(
          { user: req.user._id },
          { 
            $set: { userId: req.user._id },
            $unset: { user: 1 }
          }
        );
        console.log(`✅ Auto-migrated ${mealsWithUser.length} meals for user ${req.user._id}`);
        
        // Re-fetch after migration
        const allMeals = await Meal.find({ userId: req.user._id }).sort({ consumedAt: -1 });
        res.json(allMeals);
      } catch (migrationError) {
        console.error('Auto-migration failed:', migrationError);
        // Return combined results if migration fails
        const combinedMeals = [...mealsWithUserId, ...mealsWithUser]
          .sort((a, b) => new Date(b.consumedAt || b.createdAt) - new Date(a.consumedAt || a.createdAt));
        res.json(combinedMeals);
      }
    } else {
      res.json(mealsWithUserId);
    }
  } catch (error) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, calories, protein, carbs, fat, quantity, unit, mealType, consumedAt } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Meal name is required' });
    }

    if (calories === undefined || isNaN(Number(calories))) {
      return res.status(400).json({ success: false, message: 'Valid calories value is required' });
    }

    const meal = new Meal({
      userId: req.user._id,
      name: name.trim(),
      calories: Math.max(0, Number(calories) || 0),
      protein: Math.max(0, Number(protein) || 0),
      carbs: Math.max(0, Number(carbs) || 0),
      fat: Math.max(0, Number(fat) || 0),
      quantity: Math.max(0.1, Number(quantity) || 1),
      unit: unit ? String(unit).trim() : 'serving',
      mealType: ['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType) ? mealType : 'snack',
      consumedAt: consumedAt ? new Date(consumedAt) : new Date()
    });
    
    await meal.save();
    const achievements = await checkAchievements(req.user._id).catch((error) => { console.warn('Achievement check skipped after meal save:', error.message); return []; });
    res.status(201).json({ success: true, meal, achievements });
  } catch (error) {
    console.error('Error saving meal:', error);
    res.status(500).json({ success: false, message: 'Failed to save meal', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid meal ID format' });
    }

    const meal = await Meal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }
    
    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ success: false, message: 'Failed to delete meal', error: error.message });
  }
});

// Migration route to fix existing meals with wrong field name
router.post('/migrate-user-field', auth, async (req, res) => {
  try {
    // Find meals with 'user' field instead of 'userId'
    const mealsToMigrate = await Meal.find({ user: req.user._id });
    
    if (mealsToMigrate.length > 0) {
      // Update each meal to use 'userId' field
      for (const meal of mealsToMigrate) {
        await Meal.updateOne(
          { _id: meal._id },
          { 
            $set: { userId: meal.user },
            $unset: { user: 1 }
          }
        );
      }
      
      console.log(`✅ Migrated ${mealsToMigrate.length} meals for user ${req.user._id}`);
      res.json({ 
        success: true, 
        message: `Migrated ${mealsToMigrate.length} meals`,
        migratedCount: mealsToMigrate.length
      });
    } else {
      res.json({ 
        success: true, 
        message: 'No meals need migration',
        migratedCount: 0
      });
    }
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
