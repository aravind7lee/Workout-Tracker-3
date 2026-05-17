// frontend/src/pages/Nutrition.jsx
import { Utensils, BarChart3, CheckCircle2, Search, XCircle, Apple, Star, Target } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
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


export default function Nutrition() {
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get("search") || "";
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
    setError,
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
      setError("Please enter a valid food name");
      return;
    }
    try {
      setIsLookingUp(true);
      setError(null);
      let enrichedItem;

      // Check if it's a food object from Quick Add Foods or a string query
      if (typeof queryOrFood === "object" && queryOrFood.name) {
        // It's a food object from Quick Add Foods - use exact data
        console.log("🍽️ Using Quick Add Foods data:", queryOrFood);
        console.log(
          "📊 Quick Add Values - Cal:",
          queryOrFood.calories,
          "Protein:",
          queryOrFood.protein,
          "Carbs:",
          queryOrFood.carbs,
          "Fat:",
          queryOrFood.fat,
        );
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
        console.log(
          "✅ Final Quick Add Item - Cal:",
          enrichedItem.calories,
          "Protein:",
          enrichedItem.protein,
          "Carbs:",
          enrichedItem.carbs,
          "Fat:",
          enrichedItem.fat,
        );
      } else {
        // It's a string query - do API lookup
        const query =
          typeof queryOrFood === "string"
            ? queryOrFood
            : queryOrFood.toString();
        console.log("🔍 Looking up nutrition for:", query);
        const nutritionItem = await lookupFood(query.trim());
        if (!nutritionItem || typeof nutritionItem !== "object") {
          throw new Error("Invalid nutrition data received");
        }
        enrichedItem = {
          name: nutritionItem.name || "Unknown Food",
          parsedName:
            nutritionItem.parsedName || nutritionItem.name || "Unknown Food",
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
      console.log("✅ Nutrition data ready:", enrichedItem);
    } catch (error) {
      console.error("❌ Nutrition lookup failed:", error);
      const errorMsg =
        typeof queryOrFood === "string"
          ? queryOrFood
          : queryOrFood.name || "food";
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
        fat: mealData.fat || 0,
      });
      setShowPreviewModal(false);
      setNutritionItems([]);

      // Show success notification
      const successMsg = document.createElement("div");
      successMsg.className =
        "fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm";
      successMsg.innerHTML = `
        <div class="flex items-center gap-3">
          <div className="text-xl"><Utensils className="w-[1em] h-[1em] inline-block" /></div>
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
      console.error("Failed to add meal:", error);

      // Show error notification
      const errorMsg = document.createElement("div");
      errorMsg.className =
        "fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 max-w-sm";
      errorMsg.innerHTML = `
        <div class="flex items-center gap-3">
          <div className="text-xl"><X className="w-[1em] h-[1em] inline-block" /></div>
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
      throw new Error("Invalid meal ID");
    }
    try {
      await deleteMeal(mealId);

      // Trigger profile refresh after meal deletion
      realTimeEvents.triggerProfileRefresh();
    } catch (error) {
      console.error("Delete meal error:", error);
      throw error; // Re-throw to let the component handle notifications
    }
  };

  // Don't render nutrition components if not authenticated
  if (!isAuthenticated && !loading) {
    return /*#__PURE__*/ React.createElement(
      AuthGuard,
      null,
      /*#__PURE__*/ React.createElement("div", null),
    );
  }
  return /*#__PURE__*/ React.createElement(
    NutritionErrorBoundary,
    null,
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "nutrition-page min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden",
      },
      /*#__PURE__*/ React.createElement("div", {
        className:
          "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-transparent to-transparent",
      }),
      /*#__PURE__*/ React.createElement("div", {
        className:
          "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-neutral-950/30 via-transparent to-transparent",
      }),
      /*#__PURE__*/ React.createElement("div", {
        className:
          "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-red-950/10 via-transparent to-transparent",
      }),
      /*#__PURE__*/ React.createElement("div", {
        className:
          "absolute top-20 left-10 w-20 h-20 bg-red-600/10 rounded-full blur-xl animate-pulse",
      }),
      /*#__PURE__*/ React.createElement("div", {
        className:
          "absolute top-40 right-20 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl animate-pulse",
        style: {
          animationDelay: "1s",
        },
      }),
      /*#__PURE__*/ React.createElement("div", {
        className:
          "absolute bottom-40 left-1/4 w-24 h-24 bg-red-600/10 rounded-full blur-xl animate-pulse",
        style: {
          animationDelay: "2s",
        },
      }),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "relative z-10 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-8",
        },
        /*#__PURE__*/ React.createElement(NutritionHero, null),
        /*#__PURE__*/ React.createElement(NutritionGallery, null),
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            className:
              "mx-2 sm:mx-3 md:mx-4 p-2.5 sm:p-3 md:p-4 lg:p-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-neutral-900/80 to-neutral-800/80 border border-neutral-700/50 backdrop-blur-sm shadow-2xl",
            initial: {
              opacity: 0,
              y: 20,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            transition: {
              duration: 0.6,
            },
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2.5 md:gap-3 lg:gap-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-red-600 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-red-600/30",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-white font-bold text-base sm:text-lg md:text-xl",
                  },
                  /*#__PURE__*/ React.createElement(Apple, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                null,
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "preserve-color font-black text-xs sm:text-sm md:text-base lg:text-lg mb-0.5 sm:mb-1 uppercase tracking-wide leading-none",
                    style: {
                      color: "#22c55e",
                    },
                  },
                  "Nutrition Tracker",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-3 text-[9px] sm:text-[10px] md:text-xs lg:text-sm",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "inline-flex items-center gap-1 sm:gap-1.5 text-red-500 font-bold",
                    },
                    /*#__PURE__*/ React.createElement("span", {
                      className:
                        "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-600 rounded-full animate-pulse shadow-lg shadow-red-600/50",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "hidden xs:inline sm:hidden md:inline",
                      },
                      "LIVE API",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "xs:hidden sm:inline md:hidden",
                      },
                      "Real-time",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-400 hidden xs:inline",
                    },
                    "\u2022",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300 font-semibold",
                    },
                    "Goal: ",
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "capitalize text-orange-400",
                      },
                      targets.goalType || "maintain",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-400 hidden sm:inline",
                    },
                    "\u2022",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-neutral-300 font-bold",
                    },
                    meals.length,
                    " ",
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "hidden xs:inline",
                      },
                      "meals",
                    ),
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-1.5 sm:gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-green-600/20 border border-red-600/30 rounded-md sm:rounded-lg md:rounded-xl",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-green-300 font-black text-[9px] sm:text-[10px] md:text-xs lg:text-sm uppercase tracking-wider",
                  },
                  /*#__PURE__*/ React.createElement(Star, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " ",
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "hidden xs:inline",
                    },
                    "LIVE",
                  ),
                ),
              ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mx-2 sm:mx-3 md:mx-4",
          },
          /*#__PURE__*/ React.createElement(MealInput, {
            onLookup: handleLookup,
            isLookingUp: isLookingUp,
            error: error,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mx-2 sm:mx-3 md:mx-4",
          },
          /*#__PURE__*/ React.createElement(FoodCategories, {
            onFoodSelect: handleLookup,
            isLoading: isLookingUp,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mx-2 sm:mx-3 md:mx-4",
          },
          /*#__PURE__*/ React.createElement(RealTimeNutritionProgress, {
            totals: totals,
            targets: targets,
            meals: meals,
            customCalorieTarget: customCalorieTarget,
            setCustomCalorieTarget: setCustomCalorieTarget,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mx-2 sm:mx-3 md:mx-4",
          },
          /*#__PURE__*/ React.createElement(NutritionInsights, {
            totals: totals,
            targets: targets,
            meals: meals,
            customCalorieTarget: customCalorieTarget,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mx-2 sm:mx-3 md:mx-4",
          },
          /*#__PURE__*/ React.createElement(NutritionSocialDashboard, {
            totals: totals,
            targets: targets,
            meals: meals,
            customCalorieTarget: customCalorieTarget,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mx-2 sm:mx-3 md:mx-4",
          },
          /*#__PURE__*/ React.createElement(NutritionAnalytics, {
            totals: totals,
            targets: targets,
            meals: meals,
            customCalorieTarget: customCalorieTarget,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mx-2 sm:mx-3 md:mx-4 pb-4 sm:pb-5 md:pb-6 lg:pb-8",
          },
          /*#__PURE__*/ React.createElement(RealTimeMealsList, {
            meals: meals,
            isLoading: isLoading,
            onDeleteMeal: handleDeleteMeal,
          }),
        ),
        /*#__PURE__*/ React.createElement(NutritionPreviewModal, {
          isOpen: showPreviewModal,
          onClose: () => setShowPreviewModal(false),
          nutritionItems: nutritionItems,
          onConfirm: handleConfirmMeal,
          isAdding: isAddingMeal,
        }),
      ),
      /*#__PURE__*/ React.createElement("div", {
        className:
          "absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-red-950/20 to-transparent pointer-events-none",
      }),
    ),
  );
}
