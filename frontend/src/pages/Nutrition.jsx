// frontend/src/pages/Nutrition.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { 
  Utensils, BarChart3, CheckCircle2, Search, XCircle, 
  Apple, Star, Target, Zap, Flame, ShieldAlert, Sparkles 
} from 'lucide-react';
import { useRealTimeNutrition } from "../hooks/useRealTimeNutrition";
import { useAuthGuard } from "../hooks/useAuthGuard";
import MealInput from "../components/MealInput";
import NutritionPreviewModal from "../components/NutritionPreviewModal";
import FoodCategories from "../components/FoodCategories";
import NutritionErrorBoundary from "../components/NutritionErrorBoundary";
import NutritionHero from "../components/NutritionHero";
import NutritionGallery from "../components/NutritionGallery";
import RealTimeNutritionProgress from "../components/RealTimeNutritionProgress";
import NutritionInsights from "../components/NutritionInsights";
import NutritionSocialDashboard from "../components/NutritionSocialDashboard";
import NutritionAnalytics from "../components/NutritionAnalytics";
import RealTimeMealsList from "../components/RealTimeMealsList";
import AuthGuard from "../components/AuthGuard";
import realTimeEvents from "../utils/realTimeEvents";
import TDEECalculatorCard from "../components/TDEECalculatorCard";

export default function Nutrition() {
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get("search") || "";
  const { isAuthenticated, loading } = useAuthGuard();

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
    setError,
  } = useRealTimeNutrition();

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [nutritionItems, setNutritionItems] = useState([]);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [customCalorieTarget, setCustomCalorieTarget] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Auto-search when coming from navbar search query
  useEffect(() => {
    if (navbarSearch) {
      handleLookup(navbarSearch);
    }
  }, [navbarSearch]);

  const handleLookup = async (queryOrFood) => {
    if (!queryOrFood) {
      setError("Please enter a valid food name");
      return;
    }
    try {
      setIsLookingUp(true);
      setError(null);
      let enrichedItem;

      // Check if it's a pre-calculated food object or a raw string search query
      if (typeof queryOrFood === "object" && queryOrFood.name) {
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
          servingText: queryOrFood.serving || "1 serving",
          servingGrams: queryOrFood.servingGrams || 100,
          mealType: "snack",
          source: "quick-add",
        };
      } else {
        const query = typeof queryOrFood === "string" ? queryOrFood : queryOrFood.toString();
        const nutritionItem = await lookupFood(query.trim());
        if (!nutritionItem || typeof nutritionItem !== "object") {
          throw new Error("Invalid nutrition data received");
        }
        enrichedItem = {
          name: nutritionItem.name || "Unknown Food",
          parsedName: nutritionItem.parsedName || nutritionItem.name || "Unknown Food",
          calories: nutritionItem.calories || 0,
          protein: nutritionItem.protein || 0,
          carbs: nutritionItem.carbs || 0,
          fat: nutritionItem.fat || 0,
          fiber: nutritionItem.fiber || 0,
          sugar: nutritionItem.sugar || 0,
          sodium: nutritionItem.sodium || 0,
          servingText: nutritionItem.servingText || "1 serving",
          servingGrams: nutritionItem.servingGrams || 100,
          mealType: nutritionItem.mealType || "snack",
          source: nutritionItem.source || "api",
          ...nutritionItem,
        };
      }
      setNutritionItems([enrichedItem]);
      setShowPreviewModal(true);
    } catch (err) {
      console.error("Nutrition lookup error:", err);
      const errorMsg = typeof queryOrFood === "string" ? queryOrFood : queryOrFood.name || "food";
      setError(`Failed to lookup "${errorMsg}". Please try again.`);
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleConfirmMeal = async (mealData) => {
    try {
      setIsAddingMeal(true);
      await addMeal(mealData);

      realTimeEvents.dispatchMealAdded({
        ...mealData,
        addedAt: new Date().toISOString(),
        calories: mealData.calories || 0,
        protein: mealData.protein || 0,
        carbs: mealData.carbs || 0,
        fat: mealData.fat || 0,
      });

      setShowPreviewModal(false);
      setNutritionItems([]);
    } catch (err) {
      console.error("Failed to add meal:", err);
    } finally {
      setIsAddingMeal(false);
    }
  };

  const handleDeleteMeal = async (mealId) => {
    if (!mealId) throw new Error("Invalid meal ID");
    try {
      await deleteMeal(mealId);
      realTimeEvents.triggerProfileRefresh();
    } catch (err) {
      console.error("Delete meal error:", err);
      throw err;
    }
  };

  if (!isAuthenticated && !loading) {
    return (
      <AuthGuard>
        <div />
      </AuthGuard>
    );
  }

  return (
    <NutritionErrorBoundary>
      <div className="nutrition-page min-h-screen bg-black text-white pb-40 sm:pb-32 relative overflow-hidden">
        
        {/* Ambient Glow Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-950/25 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-10 w-24 h-24 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-60 right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 sm:space-y-6 md:space-y-8">
          
          {/* 1. Hero Section */}
          <NutritionHero />

          {/* 2. Gallery Section */}
          <NutritionGallery />

          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
            <TDEECalculatorCard />
          </div>

          {/* 3. Main Nutrition Dashboard Wrapper */}
          <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 space-y-4 sm:space-y-6">
            
            {/* Live API & Goal Status Card */}
            <motion.div
              className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-gradient-to-r dark:from-neutral-900/90 dark:via-neutral-900/70 dark:to-neutral-950 border border-gray-200 dark:border-neutral-800 shadow-sm dark:shadow-xl"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <Apple className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-base font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wide truncate">
                      Nutrition Live Sync
                    </h2>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-xs text-gray-500 dark:text-neutral-400 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Live API
                      </span>
                      <span>•</span>
                      <span>Goal: <strong className="text-orange-600 dark:text-orange-400 capitalize">{targets.goalType || "maintain"}</strong></span>
                      <span>•</span>
                      <span><strong className="text-gray-900 dark:text-white">{meals.length}</strong> logged</span>
                    </div>
                  </div>
                </div>

                <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg shrink-0">
                  <span className="text-emerald-400 font-black text-[9px] sm:text-xs uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="hidden xs:inline">Active</span>
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Meal Search / Natural Language Input */}
            <div data-meal-input="true">
              <MealInput
                onLookup={handleLookup}
                isLookingUp={isLookingUp}
                error={error}
              />
            </div>

            {/* Quick Food Categories */}
            <div>
              <FoodCategories
                onFoodSelect={handleLookup}
                isLoading={isLookingUp}
              />
            </div>

            {/* Real-Time Nutrition Progress & Macro Ring */}
            <div data-progress-section="true">
              <RealTimeNutritionProgress
                totals={totals}
                targets={targets}
                meals={meals}
                customCalorieTarget={customCalorieTarget}
                setCustomCalorieTarget={setCustomCalorieTarget}
              />
            </div>

            {/* Nutrition AI Insights */}
            <div>
              <NutritionInsights
                totals={totals}
                targets={targets}
                meals={meals}
                customCalorieTarget={customCalorieTarget}
              />
            </div>

            {/* Social Dashboard */}
            <div>
              <NutritionSocialDashboard
                totals={totals}
                targets={targets}
                meals={meals}
                customCalorieTarget={customCalorieTarget}
              />
            </div>

            {/* Analytics Section */}
            <div>
              <NutritionAnalytics
                totals={totals}
                targets={targets}
                meals={meals}
                customCalorieTarget={customCalorieTarget}
              />
            </div>

            {/* Real-Time Meals Log List */}
            <div className="pb-4">
              <RealTimeMealsList
                meals={meals}
                isLoading={isLoading}
                onDeleteMeal={handleDeleteMeal}
              />
            </div>

          </div>

          {/* Modal Preview */}
          <NutritionPreviewModal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            nutritionItems={nutritionItems}
            onConfirm={handleConfirmMeal}
            isAdding={isAddingMeal}
          />

        </div>
      </div>
    </NutritionErrorBoundary>
  );
}
