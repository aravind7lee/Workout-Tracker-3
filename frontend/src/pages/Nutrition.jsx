// frontend/src/pages/Nutrition.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useRealTimeNutrition } from '../hooks/useRealTimeNutrition';
import MealInput from '../components/MealInput';
import NutritionPreviewModal from '../components/NutritionPreviewModal';
import FoodCategories from '../components/FoodCategories';
import NutritionErrorBoundary from '../components/NutritionErrorBoundary';
import NutritionHero from '../components/NutritionHero';
import AuthGuard from '../components/AuthGuard';
import realTimeEvents from '../utils/realTimeEvents';

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
      // Navbar search is always a string query, not a food object
      handleLookup(navbarSearch);
    }
  }, [navbarSearch]);

  const handleLookup = async (queryOrFood) => {
    if (!queryOrFood) {
      setError('Please enter a valid food name');
      return;
    }

    try {
      setIsLookingUp(true);
      setError(null);
      
      let enrichedItem;
      
      // Check if it's a food object from Quick Add Foods or a string query
      if (typeof queryOrFood === 'object' && queryOrFood.name) {
        // It's a food object from Quick Add Foods - use exact data
        console.log('🍽️ Using Quick Add Foods data:', queryOrFood);
        console.log('📊 Quick Add Values - Cal:', queryOrFood.calories, 'Protein:', queryOrFood.protein, 'Carbs:', queryOrFood.carbs, 'Fat:', queryOrFood.fat);
        
        enrichedItem = {
          name: queryOrFood.name,
          parsedName: queryOrFood.name,
          calories: queryOrFood.calories || 0,
          protein: queryOrFood.protein || 0,
          carbs: queryOrFood.carbs || 0,
          fat: queryOrFood.fat || 0,
          fiber: queryOrFood.fiber || 0,
          sugar: queryOrFood.sugar || 0,
          sodium: queryOrFood.sodium || 0,
          servingText: queryOrFood.serving || '1 serving',
          servingGrams: queryOrFood.servingGrams || 100,
          mealType: 'snack',
          source: 'quick-add'
        };
        
        console.log('✅ Final Quick Add Item - Cal:', enrichedItem.calories, 'Protein:', enrichedItem.protein, 'Carbs:', enrichedItem.carbs, 'Fat:', enrichedItem.fat);
      } else {
        // It's a string query - do API lookup
        const query = typeof queryOrFood === 'string' ? queryOrFood : queryOrFood.toString();
        console.log('🔍 Looking up nutrition for:', query);
        
        const nutritionItem = await lookupFood(query.trim());
        
        if (!nutritionItem || typeof nutritionItem !== 'object') {
          throw new Error('Invalid nutrition data received');
        }
        
        enrichedItem = {
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
          source: nutritionItem.source || 'api',
          ...nutritionItem
        };
      }
      
      setNutritionItems([enrichedItem]);
      setShowPreviewModal(true);
      
      console.log('✅ Nutrition data ready:', enrichedItem);
    } catch (error) {
      console.error('❌ Nutrition lookup failed:', error);
      const errorMsg = typeof queryOrFood === 'string' ? queryOrFood : queryOrFood.name || 'food';
      setError(`Failed to lookup "${errorMsg}". Please try again.`);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleConfirmMeal = async (mealData) => {
    try {
      setIsAddingMeal(true);
      
      // Add meal to database/storage
      await addMeal(mealData);
      
      // Dispatch real-time event for instant profile update
      realTimeEvents.dispatchMealAdded({
        ...mealData,
        addedAt: new Date().toISOString(),
        calories: mealData.calories || 0,
        protein: mealData.protein || 0,
        carbs: mealData.carbs || 0,
        fat: mealData.fat || 0
      });
      
      setShowPreviewModal(false);
      setNutritionItems([]);
      
      // Show success notification
      const successMsg = document.createElement('div');
      successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
      successMsg.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-xl">🍽️</div>
          <div>
            <div class="font-medium">Meal Added!</div>
            <div class="text-sm opacity-90">${mealData.parsedName || mealData.name} • ${Math.round(mealData.calories || 0)} cal</div>
          </div>
        </div>
      `;
      document.body.appendChild(successMsg);
      setTimeout(() => {
        if (document.body.contains(successMsg)) {
          document.body.removeChild(successMsg);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Failed to add meal:', error);
      
      // Show error notification
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm';
      errorMsg.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-xl">❌</div>
          <div>
            <div class="font-medium">Failed to Add Meal</div>
            <div class="text-sm opacity-90">${error.message}</div>
          </div>
        </div>
      `;
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        if (document.body.contains(errorMsg)) {
          document.body.removeChild(errorMsg);
        }
      }, 4000);
    } finally {
      setIsAddingMeal(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!mealId) {
      const errorMsg = document.createElement('div');
      errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
      errorMsg.textContent = 'Cannot delete meal: Invalid meal ID';
      document.body.appendChild(errorMsg);
      setTimeout(() => {
        if (document.body.contains(errorMsg)) {
          document.body.removeChild(errorMsg);
        }
      }, 3000);
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this meal?')) {
      try {
        await deleteMeal(mealId);
        
        // Trigger profile refresh after meal deletion
        realTimeEvents.triggerProfileRefresh();
        
        // Show success notification
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
        successMsg.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="text-xl">✅</div>
            <div class="font-medium">Meal Deleted</div>
          </div>
        `;
        document.body.appendChild(successMsg);
        setTimeout(() => {
          if (document.body.contains(successMsg)) {
            document.body.removeChild(successMsg);
          }
        }, 2000);
        
      } catch (error) {
        console.error('Delete meal error:', error);
        
        // Show error notification
        const errorMsg = document.createElement('div');
        errorMsg.className = 'fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50';
        errorMsg.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="text-xl">❌</div>
            <div>
              <div class="font-medium">Delete Failed</div>
              <div class="text-sm opacity-90">${error.message}</div>
            </div>
          </div>
        `;
        document.body.appendChild(errorMsg);
        setTimeout(() => {
          if (document.body.contains(errorMsg)) {
            document.body.removeChild(errorMsg);
          }
        }, 4000);
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
    <AuthGuard>
      <NutritionErrorBoundary>
        <div className="space-y-6">
        {/* Hero Header */}
        <NutritionHero />
        
        {/* Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4">
          <div className="text-sm text-light-text-muted dark:text-dark-text-muted flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Real-time Nutritionix API
            </span>
            <span>•</span>
            <span>Goal: <span className="capitalize font-medium">{targets.goalType || 'maintain'}</span></span>
            <span>•</span>
            <span>{meals.length} meals today</span>
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
      <div 
        data-progress-section
        className="bg-light-bg-soft dark:bg-dark-bg-soft backdrop-blur-premium border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-light-card dark:shadow-dark-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-dark-glow"
      >
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
          <span>📊</span> Today's Progress
        </h3>
        
        {/* Calorie Target Selector */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-bg-tertiary/50 backdrop-blur-xs rounded-lg border border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between gap-4">
            <div className={`text-sm font-medium ${guidance.color.replace('text-', 'text-').replace('-400', '-600 dark:text-').replace('-600', '-400')}`}>
              {guidance.text}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-light-text-muted dark:text-dark-text-muted">Daily Target:</label>
              <select
                value={customCalorieTarget || targets.calories || 2000}
                onChange={(e) => setCustomCalorieTarget(parseInt(e.target.value))}
                className="bg-light-bg-primary dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded px-2 py-1 text-sm text-light-text-primary dark:text-dark-text-primary focus:border-blue-500 dark:focus:border-dark-accent focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-dark-accent/20 transition-all"
              >
                <option value={1600}>1600 cal</option>
                <option value={1800}>1800 cal</option>
                <option value={2000}>2000 cal</option>
                <option value={2200}>2200 cal</option>
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
              <span className="text-light-text-muted dark:text-dark-text-muted">Calories</span>
              <span className="text-light-text-primary dark:text-dark-text-primary font-medium">{Math.round(totals.calories || 0)} / {currentCalorieTarget}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
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
              <span className="text-light-text-muted dark:text-dark-text-muted">Protein</span>
              <span className="text-light-text-primary dark:text-dark-text-primary font-medium">{Math.round((totals.protein || 0) * 10) / 10}g / {targets.protein || 150}g</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
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
              <span className="text-light-text-muted dark:text-dark-text-muted">Carbs</span>
              <span className="text-light-text-primary dark:text-dark-text-primary font-medium">{Math.round((totals.carbs || 0) * 10) / 10}g / {targets.carbs || 250}g</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
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
              <span className="text-light-text-muted dark:text-dark-text-muted">Fat</span>
              <span className="text-light-text-primary dark:text-dark-text-primary font-medium">{Math.round((totals.fat || 0) * 10) / 10}g / {targets.fat || 67}g</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2">
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
      <div className="bg-light-bg-soft dark:bg-dark-bg-soft backdrop-blur-premium border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-light-card dark:shadow-dark-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-dark-glow">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4 flex items-center gap-2">
          <span>🍽️</span> Today's Meals ({meals.length})
        </h3>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-gray-200 dark:bg-dark-bg-tertiary/50 h-16 rounded-lg" />
            ))}
          </div>
        ) : meals.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-light-text-muted dark:text-dark-text-muted mb-4">No meals logged today</p>
            <p className="text-sm text-light-text-muted/80 dark:text-dark-text-muted/80">Add your first meal above to start tracking!</p>
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
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg transition-all duration-200 space-y-3 sm:space-y-0 ${
                    meal.synced === false 
                      ? 'bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 dark:border-blue-400/30' 
                      : 'bg-gray-50 dark:bg-dark-bg-secondary/60 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary/80 border border-gray-200 dark:border-dark-border backdrop-blur-xs'
                  }`}
                >
                  {/* Mobile: Stacked Layout */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="font-medium text-light-text-primary dark:text-dark-text-primary capitalize text-sm sm:text-base">{meal.parsedName || meal.name || 'Unknown Food'}</div>
                        {meal.synced === false && (
                          <div className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            Syncing...
                          </div>
                        )}
                      </div>
                      {/* Mobile: Remove button in header */}
                      <button
                        onClick={() => handleDeleteMeal(meal._id || meal.id)}
                        className="sm:hidden text-red-400 hover:text-red-300 hover:bg-red-500/20 dark:hover:bg-red-500/30 p-1.5 rounded-lg transition-all border border-red-400/30 hover:border-red-400/60"
                        title="Delete meal"
                        disabled={!meal._id && !meal.id}
                      >
                        <span className="text-xs">🗑️</span>
                      </button>
                    </div>
                    
                    <div className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted">{meal.servingText || 'Standard serving'}</div>
                    
                    <div className="text-xs text-light-text-muted/80 dark:text-dark-text-muted/80 flex flex-wrap items-center gap-2">
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
                    
                    {/* Mobile: Nutrition info in grid */}
                    <div className="grid grid-cols-4 gap-2 sm:hidden pt-2 border-t border-gray-200 dark:border-dark-border">
                      <div className="text-center">
                        <div className="text-light-text-primary dark:text-dark-text-primary font-medium text-sm">{Math.round(meal.calories || 0)}</div>
                        <div className="text-light-text-muted dark:text-dark-text-muted text-xs">cal</div>
                      </div>
                      <div className="text-center">
                        <div className="text-blue-600 dark:text-blue-400 font-medium text-sm">{Math.round((meal.protein || 0) * 10) / 10}g</div>
                        <div className="text-light-text-muted dark:text-dark-text-muted text-xs">protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-600 dark:text-green-400 font-medium text-sm">{Math.round((meal.carbs || 0) * 10) / 10}g</div>
                        <div className="text-light-text-muted dark:text-dark-text-muted text-xs">carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-yellow-600 dark:text-yellow-400 font-medium text-sm">{Math.round((meal.fat || 0) * 10) / 10}g</div>
                        <div className="text-light-text-muted dark:text-dark-text-muted text-xs">fat</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Desktop: Horizontal layout */}
                  <div className="hidden sm:flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-light-text-primary dark:text-dark-text-primary font-medium">{Math.round(meal.calories || 0)}</div>
                      <div className="text-light-text-muted dark:text-dark-text-muted text-xs">cal</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-600 dark:text-blue-400 font-medium">{Math.round((meal.protein || 0) * 10) / 10}g</div>
                      <div className="text-light-text-muted dark:text-dark-text-muted text-xs">protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-600 dark:text-green-400 font-medium">{Math.round((meal.carbs || 0) * 10) / 10}g</div>
                      <div className="text-light-text-muted dark:text-dark-text-muted text-xs">carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-600 dark:text-yellow-400 font-medium">{Math.round((meal.fat || 0) * 10) / 10}g</div>
                      <div className="text-light-text-muted dark:text-dark-text-muted text-xs">fat</div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteMeal(meal._id || meal.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 dark:hover:bg-red-500/30 p-2 rounded-lg transition-all ml-2 border border-red-400/30 hover:border-red-400/60 dark:hover:shadow-red-500/20 dark:hover:shadow-lg backdrop-blur-xs"
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
    </AuthGuard>
  );
}