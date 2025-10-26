// frontend/src/pages/Nutrition.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useRealTimeNutrition } from '../hooks/useRealTimeNutrition';
import { useAuthGuard } from '../hooks/useAuthGuard';
import MealInput from '../components/MealInput';
import NutritionPreviewModal from '../components/NutritionPreviewModal';
import FoodCategories from '../components/FoodCategories';
import NutritionErrorBoundary from '../components/NutritionErrorBoundary';
import NutritionHero from '../components/NutritionHero';
import NutritionGallery from '../components/NutritionGallery';
import RealTimeNutritionProgress from '../components/RealTimeNutritionProgress';
import NutritionInsights from '../components/NutritionInsights';
import NutritionSocialDashboard from '../components/NutritionSocialDashboard';
import NutritionAnalytics from '../components/NutritionAnalytics';
import RealTimeMealsList from '../components/RealTimeMealsList';
import AuthGuard from '../components/AuthGuard';
import realTimeEvents from '../utils/realTimeEvents';

export default function Nutrition() {
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get('search') || '';
  const { isAuthenticated, loading } = useAuthGuard();
  
  // Real-time nutrition data with Nutritionix API (only if authenticated)
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
      throw new Error('Invalid meal ID');
    }
    
    try {
      await deleteMeal(mealId);
      
      // Trigger profile refresh after meal deletion
      realTimeEvents.triggerProfileRefresh();
      
      // Dispatch meal deleted event for Dashboard
      window.dispatchEvent(new CustomEvent('mealDeleted', {
        detail: { mealId, timestamp: new Date().toISOString() }
      }));
      
    } catch (error) {
      console.error('Delete meal error:', error);
      throw error; // Re-throw to let the component handle notifications
    }
  };



  // Don't render nutrition components if not authenticated
  if (!isAuthenticated && !loading) {
    return (
      <AuthGuard>
        <div></div>
      </AuthGuard>
    );
  }

  return (
    <NutritionErrorBoundary>
      <div className="space-y-6">
      {/* Hero Header */}
      <NutritionHero />
      
      {/* Nutrition Gallery */}
      <NutritionGallery />
        
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

      {/* Enhanced Real-Time Progress Section */}
      <RealTimeNutritionProgress 
        totals={totals}
        targets={targets}
        meals={meals}
        customCalorieTarget={customCalorieTarget}
        setCustomCalorieTarget={setCustomCalorieTarget}
      />

      {/* Smart Nutrition Insights */}
      <NutritionInsights 
        totals={totals}
        targets={targets}
        meals={meals}
        customCalorieTarget={customCalorieTarget}
      />

      {/* Social Dashboard */}
      <NutritionSocialDashboard 
        totals={totals}
        targets={targets}
        meals={meals}
        customCalorieTarget={customCalorieTarget}
      />

      {/* Advanced Analytics */}
      <NutritionAnalytics 
        totals={totals}
        targets={targets}
        meals={meals}
        customCalorieTarget={customCalorieTarget}
      />

      {/* Enhanced Real-Time Meals List */}
      <RealTimeMealsList 
        meals={meals}
        isLoading={isLoading}
        onDeleteMeal={handleDeleteMeal}
      />

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