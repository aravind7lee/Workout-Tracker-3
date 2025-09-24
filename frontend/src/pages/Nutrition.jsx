// frontend/src/pages/Nutrition.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useRealTimeNutrition } from '../hooks/useRealTimeNutrition';
import MealInput from '../components/MealInput';
import NutritionPreviewModal from '../components/NutritionPreviewModal';
import FoodCategories from '../components/FoodCategories';
import NutritionErrorBoundary from '../components/NutritionErrorBoundary';

export default function Nutrition() {
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get('search') || '';
  
  // Real-time nutrition data with Nutritionix API
  const {
    meals,
    totals,
    targets,
    isLoading,
    error,
    lookupFood,
    addMeal,
    deleteMeal,
    setError
  } = useRealTimeNutrition();

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [nutritionItems, setNutritionItems] = useState([]);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [customCalorieTarget, setCustomCalorieTarget] = useState(null);
  
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Auto-search when coming from navbar
  useEffect(() => {
    if (navbarSearch) {
      handleLookup(navbarSearch);
    }
  }, [navbarSearch]);

  const handleLookup = async (query) => {
    if (!query || typeof query !== 'string') {
      setError('Please enter a valid food name');
      return;
    }

    try {
      setIsLookingUp(true);
      setError(null);
      
      console.log('🔍 Looking up nutrition for:', query);
      
      // Real-time Nutritionix API lookup
      const nutritionItem = await lookupFood(query.trim());
      
      // Ensure we have valid nutrition data
      if (!nutritionItem || typeof nutritionItem !== 'object') {
        throw new Error('Invalid nutrition data received');
      }
      
      // Add default meal type and ensure all required properties
      const enrichedItem = {
        name: nutritionItem.name || 'Unknown Food',
        parsedName: nutritionItem.parsedName || nutritionItem.name || 'Unknown Food',
        calories: nutritionItem.calories || 0,
        protein: nutritionItem.protein || 0,
        carbs: nutritionItem.carbs || 0,
        fat: nutritionItem.fat || 0,
        fiber: nutritionItem.fiber || 0,
        sugar: nutritionItem.sugar || 0,
        sodium: nutritionItem.sodium || 0,
        servingText: nutritionItem.servingText || '1 serving',
        servingGrams: nutritionItem.servingGrams || 100,
        mealType: nutritionItem.mealType || 'snack',
        source: nutritionItem.source || 'unknown',
        ...nutritionItem
      };
      
      setNutritionItems([enrichedItem]);
      setShowPreviewModal(true);
      
      console.log('✅ Nutrition lookup successful:', enrichedItem);
    } catch (error) {
      console.error('❌ Nutrition lookup failed:', error);
      setError(`Failed to lookup "${query}". Please try again.`);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleConfirmMeal = async (mealData) => {
    try {
      setIsAddingMeal(true);
      await addMeal(mealData);
      setShowPreviewModal(false);
      setNutritionItems([]);
    } catch (error) {
      console.error('Failed to add meal:', error);
      alert('Failed to add meal: ' + error.message);
    } finally {
      setIsAddingMeal(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!mealId) {
      alert('Cannot delete meal: Invalid meal ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteMeal(mealId);
      } catch (error) {
        console.error('Delete meal error:', error);
        alert('Failed to delete meal: ' + error.message);
      }
    }
  };

  const getProgressColor = (current, target) => {
    const percentage = (current / target) * 100;
    if (percentage < 50) return 'bg-red-500';
    if (percentage < 80) return 'bg-yellow-500';
    if (percentage <= 100) return 'bg-green-500';
    return 'bg-blue-500';
  };

  const getGoalGuidance = () => {
    const goalType = targets.goalType || 'maintain';
    const currentTarget = customCalorieTarget || targets.baselineCalories || 2000;
    const caloriesDiff = currentTarget - (totals.calories || 0);
    
    switch (goalType) {
      case 'cut':
        if (caloriesDiff > 200) return { text: `${caloriesDiff} calories remaining - good for cutting!`, color: 'text-green-400' };
        if (caloriesDiff > 0) return { text: `${caloriesDiff} calories remaining - on track`, color: 'text-yellow-400' };
        return { text: `${Math.abs(caloriesDiff)} calories over target`, color: 'text-red-400' };
      
      case 'bulk':
        if (caloriesDiff < -200) return { text: `${Math.abs(caloriesDiff)} calories over - great for bulking!`, color: 'text-green-400' };
        if (caloriesDiff < 0) return { text: `${Math.abs(caloriesDiff)} calories over target`, color: 'text-yellow-400' };
        return { text: `Need ${caloriesDiff} more calories for bulking`, color: 'text-blue-400' };
      
      case 'recomp':
        if (Math.abs(caloriesDiff) < 100) return { text: 'Perfect for body recomposition!', color: 'text-green-400' };
        return { text: `${Math.abs(caloriesDiff)} calories ${caloriesDiff > 0 ? 'under' : 'over'} target`, color: 'text-yellow-400' };
      
      default:
        if (Math.abs(caloriesDiff) < 100) return { text: 'Maintaining calorie balance!', color: 'text-green-400' };
        return { text: `${Math.abs(caloriesDiff)} calories ${caloriesDiff > 0 ? 'remaining' : 'over'}`, color: 'text-blue-400' };
    }
  };

  const guidance = getGoalGuidance();
  const currentCalorieTarget = customCalorieTarget || targets.calories || 2000;
  
  // Calculate progress percentages
  const progress = {
    calories: ((totals.calories || 0) / currentCalorieTarget) * 100,
    protein: ((totals.protein || 0) / (targets.protein || 150)) * 100,
    carbs: ((totals.carbs || 0) / (targets.carbs || 250)) * 100,
    fat: ((totals.fat || 0) / (targets.fat || 67)) * 100
  };

  return (
    <NutritionErrorBoundary>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-semibold text-white">Nutrition Tracker</h2>
        <div className="text-sm text-slate-400">
          Real-time Nutritionix API • Goal: {targets.goalType || 'maintain'} • {meals.length} meals today
        </div>
      </div>

      {/* Add Food Input */}
      <MealInput 
        onLookup={handleLookup}
        isLookingUp={isLookingUp}
        error={error}
      />

      {/* Pre-populated Food Categories */}
      <FoodCategories 
        onFoodSelect={handleLookup}
        isLoading={isLookingUp}
      />

      {/* Today's Progress */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>📊</span> Today's Progress
        </h3>
        
        {/* Calorie Target Selector */}
        <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
          <div className="flex items-center justify-between gap-4">
            <div className={`text-sm font-medium ${guidance.color}`}>
              {guidance.text}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Daily Target:</label>
              <select
                value={customCalorieTarget || targets.calories || 2000}
                onChange={(e) => setCustomCalorieTarget(parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
              >
                <option value={2000}>2000 cal</option>
                <option value={2300}>2300 cal</option>
                <option value={2500}>2500 cal</option>
                <option value={2800}>2800 cal</option>
                <option value={3000}>3000 cal</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Calories */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Calories</span>
              <span className="text-white">{Math.round(totals.calories || 0)} / {currentCalorieTarget}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(totals.calories || 0, currentCalorieTarget)}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(((totals.calories || 0) / currentCalorieTarget) * 100, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Protein</span>
              <span className="text-white">{Math.round((totals.protein || 0) * 10) / 10}g / {targets.protein || 150}g</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(totals.protein || 0, targets.protein || 150)}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress.protein, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Carbs</span>
              <span className="text-white">{Math.round((totals.carbs || 0) * 10) / 10}g / {targets.carbs || 250}g</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(totals.carbs || 0, targets.carbs || 250)}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress.carbs, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Fat</span>
              <span className="text-white">{Math.round((totals.fat || 0) * 10) / 10}g / {targets.fat || 67}g</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <motion.div 
                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(totals.fat || 0, targets.fat || 67)}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress.fat, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🍽️</span> Today's Meals ({meals.length})
        </h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-slate-700/30 h-16 rounded-lg" />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-slate-400 mb-4">No meals logged today</p>
            <p className="text-sm text-slate-500">Add your first meal above to start tracking!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {meals.map((meal) => (
                <motion.div
                  key={meal._id || meal.id || `meal-${Math.random()}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                    meal.synced === false 
                      ? 'bg-blue-500/10 border border-blue-500/30' 
                      : 'bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-white capitalize">{meal.parsedName || meal.name || 'Unknown Food'}</div>
                      {meal.synced === false && (
                        <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                          Syncing...
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-slate-400">{meal.servingText || 'Standard serving'}</div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <span>{new Date(meal.consumedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="capitalize">{meal.mealType || 'snack'}</span>
                      {meal.source && (
                        <span className={`px-1 rounded text-xs ${
                          meal.source === 'nutritionix' ? 'bg-green-500/20 text-green-400' :
                          meal.source === 'fallback' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-slate-600/50 text-slate-400'
                        }`}>
                          {meal.source === 'nutritionix' ? '🔥 Live' : meal.source}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-white font-medium">{Math.round(meal.calories || 0)}</div>
                      <div className="text-slate-400 text-xs">cal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-medium">{Math.round((meal.protein || 0) * 10) / 10}g</div>
                      <div className="text-slate-400 text-xs">protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-medium">{Math.round((meal.carbs || 0) * 10) / 10}g</div>
                      <div className="text-slate-400 text-xs">carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-medium">{Math.round((meal.fat || 0) * 10) / 10}g</div>
                      <div className="text-slate-400 text-xs">fat</div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteMeal(meal._id || meal.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition-colors ml-2 border border-red-400/30 hover:border-red-400/60"
                      title="Delete meal"
                      disabled={!meal._id && !meal.id}
                    >
                      <span className="text-sm">🗑️ Remove</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

        {/* Nutrition Preview Modal */}
        <NutritionPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          nutritionItems={nutritionItems}
          onConfirm={handleConfirmMeal}
          isAdding={isAddingMeal}
        />
      </div>
    </NutritionErrorBoundary>
  );
}