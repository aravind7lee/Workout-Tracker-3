import { Target, Zap, AlertTriangle, BicepsFlexed, TrendingUp, Utensils, Scale, RefreshCw, CheckCircle2, BarChart3, Clock } from 'lucide-react';
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";


const RealTimeNutritionProgress = ({
  totals,
  targets,
  meals,
  customCalorieTarget,
  setCustomCalorieTarget,
}) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("today");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Real-time calculations
  const currentCalorieTarget = customCalorieTarget || targets.calories || 2000;
  const progress = useMemo(
    () => ({
      calories: ((totals.calories || 0) / currentCalorieTarget) * 100,
      protein: ((totals.protein || 0) / (targets.protein || 150)) * 100,
      carbs: ((totals.carbs || 0) / (targets.carbs || 200)) * 100,
      fat: ((totals.fat || 0) / (targets.fat || 65)) * 100,
    }),
    [totals, currentCalorieTarget, targets],
  );

  // Advanced metrics
  const metrics = useMemo(() => {
    const totalMacros =
      (totals.protein || 0) * 4 +
      (totals.carbs || 0) * 4 +
      (totals.fat || 0) * 9;
    const proteinCals = (totals.protein || 0) * 4;
    const carbCals = (totals.carbs || 0) * 4;
    const fatCals = (totals.fat || 0) * 9;
    return {
      macroDistribution: {
        protein: totalMacros > 0 ? (proteinCals / totalMacros) * 100 : 0,
        carbs: totalMacros > 0 ? (carbCals / totalMacros) * 100 : 0,
        fat: totalMacros > 0 ? (fatCals / totalMacros) * 100 : 0,
      },
      caloriesRemaining: Math.max(
        0,
        currentCalorieTarget - (totals.calories || 0),
      ),
      proteinPerKg: (totals.protein || 0) / 70,
      // Assuming 70kg body weight
      mealFrequency: meals.length,
      avgCaloriesPerMeal:
        meals.length > 0 ? (totals.calories || 0) / meals.length : 0,
      hydrationGoal: 2500,
      // ml
      currentHydration: 0, // This would come from hydration tracking
    };
  }, [totals, currentCalorieTarget, meals]);
  const getProgressColor = (percentage) => {
    if (percentage < 50) return "from-red-500 to-red-600";
    if (percentage < 80) return "from-yellow-500 to-orange-500";
    if (percentage <= 100) return "from-red-600 to-emerald-600";
    return "from-red-600 to-red-800";
  };
  const getGoalGuidance = () => {
    const goalType = targets.goalType || "maintain";
    const caloriesDiff = currentCalorieTarget - (totals.calories || 0);
    switch (goalType) {
      case "cut":
        if (caloriesDiff > 200)
          return {
            text: `${caloriesDiff} calories remaining - perfect for cutting!`,
            color: "text-red-500",
            icon: /*#__PURE__*/ React.createElement(Target, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          };
        if (caloriesDiff > 0)
          return {
            text: `${caloriesDiff} calories remaining - on track`,
            color: "text-yellow-400",
            icon: /*#__PURE__*/ React.createElement(Zap, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          };
        return {
          text: `${Math.abs(caloriesDiff)} calories over target`,
          color: "text-red-400",
          icon: /*#__PURE__*/ React.createElement(AlertTriangle, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        };
      case "bulk":
        if (caloriesDiff < -200)
          return {
            text: `${Math.abs(caloriesDiff)} calories over - excellent for bulking!`,
            color: "text-red-500",
            icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          };
        if (caloriesDiff < 0)
          return {
            text: `${Math.abs(caloriesDiff)} calories over target`,
            color: "text-yellow-400",
            icon: /*#__PURE__*/ React.createElement(TrendingUp, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          };
        return {
          text: `Need ${caloriesDiff} more calories for bulking`,
          color: "text-red-500",
          icon: /*#__PURE__*/ React.createElement(Utensils, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        };
      case "recomp":
        if (Math.abs(caloriesDiff) < 100)
          return {
            text: "Perfect for body recomposition!",
            color: "text-red-500",
            icon: /*#__PURE__*/ React.createElement(Scale, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          };
        return {
          text: `${Math.abs(caloriesDiff)} calories ${caloriesDiff > 0 ? "under" : "over"} target`,
          color: "text-yellow-400",
          icon: /*#__PURE__*/ React.createElement(RefreshCw, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        };
      default:
        if (Math.abs(caloriesDiff) < 100)
          return {
            text: "Maintaining perfect calorie balance!",
            color: "text-red-500",
            icon: /*#__PURE__*/ React.createElement(CheckCircle2, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          };
        return {
          text: `${Math.abs(caloriesDiff)} calories ${caloriesDiff > 0 ? "remaining" : "over"}`,
          color: "text-red-500",
          icon: /*#__PURE__*/ React.createElement(BarChart3, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        };
    }
  };
  const guidance = getGoalGuidance();
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "bg-light-bg-soft dark:bg-dark-bg-soft backdrop-blur-premium border border-gray-200 dark:border-dark-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-light-card dark:shadow-dark-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-dark-glow",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex items-center gap-2 sm:gap-3",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-lg sm:rounded-xl flex items-center justify-center",
          },
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "text-white text-base sm:text-lg",
            },
            /*#__PURE__*/ React.createElement(BarChart3, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className:
                "text-base sm:text-lg font-semibold text-light-text-primary dark:text-dark-text-primary",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "hidden sm:inline",
              },
              "Real-Time Nutrition Progress",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "sm:hidden",
              },
              "Nutrition Progress",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted",
            },
            /*#__PURE__*/ React.createElement("span", {
              className: "w-2 h-2 bg-red-600 rounded-full animate-pulse",
            }),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "hidden sm:inline",
              },
              "Live tracking \u2022 ",
              meals.length,
              " meals today",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "sm:hidden",
              },
              "Live \u2022 ",
              meals.length,
              " meals",
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex items-center gap-2",
        },
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: () => setShowAdvanced(!showAdvanced),
            className:
              "px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm bg-red-600/10 text-red-700 dark:text-red-500 rounded-md sm:rounded-lg hover:bg-red-600/20 transition-all",
          },
          showAdvanced ? "Simple" : "Advanced",
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-gradient-to-r dark:from-neutral-950 dark:to-neutral-900 rounded-lg sm:rounded-xl border border-gray-200 dark:border-red-950/20 shadow-sm dark:shadow-lg",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-center gap-2 sm:gap-3",
          },
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "text-lg sm:text-2xl",
            },
            guidance.icon,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: `font-medium text-sm sm:text-base ${guidance.color}`,
            },
            guidance.text,
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-center gap-2",
          },
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "text-xs text-light-text-muted dark:text-dark-text-muted",
            },
            "Target:",
          ),
          /*#__PURE__*/ React.createElement(
            "select",
            {
              value: customCalorieTarget || targets.calories || 2000,
              onChange: (e) => setCustomCalorieTarget(parseInt(e.target.value)),
              className:
                "bg-light-bg-primary dark:bg-dark-bg-primary border border-gray-300 dark:border-dark-border rounded px-2 py-1 text-xs sm:text-sm text-light-text-primary dark:text-dark-text-primary focus:border-red-600 dark:focus:border-dark-accent focus:outline-none focus:ring-2 focus:ring-red-600/20 dark:focus:ring-dark-accent/20 transition-all",
            },
            targets.calories &&
              ![1600, 1800, 2000, 2200, 2300, 2500, 2800, 3000].includes(
                Math.round(targets.calories),
              ) &&
              /*#__PURE__*/ React.createElement(
                "option",
                {
                  key: "dynamic-target",
                  value: Math.round(targets.calories),
                },
                `${Math.round(targets.calories)} cal (${(targets.goalType || "Target").toUpperCase()})`,
              ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 1600,
              },
              "1600 cal",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 1800,
              },
              "1800 cal",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 2000,
              },
              "2000 cal",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 2200,
              },
              "2200 cal",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 2300,
              },
              "2300 cal",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 2500,
              },
              "2500 cal",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 2800,
              },
              "2800 cal",
            ),
            /*#__PURE__*/ React.createElement(
              "option",
              {
                value: 3000,
              },
              "3000 cal",
            ),
          ),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "flex gap-1 mb-4 sm:mb-6 p-1 bg-gray-100 dark:bg-dark-bg-tertiary/50 rounded-lg",
      },
      ["overview", "macros", "insights"].map((tab) =>
        /*#__PURE__*/ React.createElement(
          "button",
          {
            key: tab,
            onClick: () => setActiveTab(tab),
            className: `flex-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all ${activeTab === tab ? "bg-white dark:bg-dark-bg-primary text-red-700 dark:text-red-500 shadow-sm" : "text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary"}`,
          },
          tab.charAt(0).toUpperCase() + tab.slice(1),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      AnimatePresence,
      {
        mode: "wait",
      },
      activeTab === "overview" &&
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            key: "overview",
            initial: {
              opacity: 0,
              y: 20,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            exit: {
              opacity: 0,
              y: -20,
            },
            className: "space-y-6",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2 sm:space-y-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex justify-between items-center",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-xs sm:text-sm font-medium text-light-text-muted dark:text-dark-text-muted",
                  },
                  "Calories",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-xs sm:text-sm font-bold text-light-text-primary dark:text-dark-text-primary",
                  },
                  Math.round(totals.calories || 0),
                  " / ",
                  currentCalorieTarget,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2 sm:h-3",
                  },
                  /*#__PURE__*/ React.createElement(motion.div, {
                    className: `h-2 sm:h-3 rounded-full bg-gradient-to-r ${getProgressColor(progress.calories)}`,
                    initial: {
                      width: 0,
                    },
                    animate: {
                      width: `${Math.min(progress.calories, 100)}%`,
                    },
                    transition: {
                      duration: 0.8,
                      ease: "easeOut",
                    },
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "absolute inset-0 flex items-center justify-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-xs font-medium text-white drop-shadow-sm",
                    },
                    Math.round(progress.calories),
                    "%",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs text-center text-light-text-muted dark:text-dark-text-muted",
                },
                metrics.caloriesRemaining,
                " remaining",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2 sm:space-y-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex justify-between items-center",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-xs sm:text-sm font-medium text-red-700 dark:text-red-500",
                  },
                  "Protein",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-xs sm:text-sm font-bold text-light-text-primary dark:text-dark-text-primary",
                  },
                  Math.round((totals.protein || 0) * 10) / 10,
                  "g / ",
                  targets.protein || 150,
                  "g",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2 sm:h-3",
                  },
                  /*#__PURE__*/ React.createElement(motion.div, {
                    className:
                      "h-2 sm:h-3 rounded-full bg-gradient-to-r from-red-600 to-red-700",
                    initial: {
                      width: 0,
                    },
                    animate: {
                      width: `${Math.min(progress.protein, 100)}%`,
                    },
                    transition: {
                      duration: 0.8,
                      ease: "easeOut",
                      delay: 0.1,
                    },
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "absolute inset-0 flex items-center justify-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-xs font-medium text-white drop-shadow-sm",
                    },
                    Math.round(progress.protein),
                    "%",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs text-center text-red-700 dark:text-red-500",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "hidden sm:inline",
                  },
                  Math.round(metrics.proteinPerKg * 10) / 10,
                  "g/kg body weight",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "sm:hidden",
                  },
                  Math.round(metrics.proteinPerKg * 10) / 10,
                  "g/kg",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2 sm:space-y-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex justify-between items-center",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-xs sm:text-sm font-medium text-green-600 dark:text-red-500",
                  },
                  "Carbs",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-xs sm:text-sm font-bold text-light-text-primary dark:text-dark-text-primary",
                  },
                  Math.round((totals.carbs || 0) * 10) / 10,
                  "g / ",
                  targets.carbs || 200,
                  "g",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2 sm:h-3",
                  },
                  /*#__PURE__*/ React.createElement(motion.div, {
                    className:
                      "h-2 sm:h-3 rounded-full bg-gradient-to-r from-red-600 to-green-600",
                    initial: {
                      width: 0,
                    },
                    animate: {
                      width: `${Math.min(progress.carbs, 100)}%`,
                    },
                    transition: {
                      duration: 0.8,
                      ease: "easeOut",
                      delay: 0.2,
                    },
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "absolute inset-0 flex items-center justify-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-xs font-medium text-white drop-shadow-sm",
                    },
                    Math.round(progress.carbs),
                    "%",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs text-center text-green-600 dark:text-red-500",
                },
                "Energy source",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2 sm:space-y-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex justify-between items-center",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-xs sm:text-sm font-medium text-yellow-600 dark:text-yellow-400",
                  },
                  "Fat",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-xs sm:text-sm font-bold text-light-text-primary dark:text-dark-text-primary",
                  },
                  Math.round((totals.fat || 0) * 10) / 10,
                  "g / ",
                  targets.fat || 65,
                  "g",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2 sm:h-3",
                  },
                  /*#__PURE__*/ React.createElement(motion.div, {
                    className:
                      "h-2 sm:h-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500",
                    initial: {
                      width: 0,
                    },
                    animate: {
                      width: `${Math.min(progress.fat, 100)}%`,
                    },
                    transition: {
                      duration: 0.8,
                      ease: "easeOut",
                      delay: 0.3,
                    },
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "absolute inset-0 flex items-center justify-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-xs font-medium text-white drop-shadow-sm",
                    },
                    Math.round(progress.fat),
                    "%",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs text-center text-yellow-600 dark:text-yellow-400",
                },
                "Essential fats",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-center p-2.5 sm:p-3 bg-white dark:bg-dark-bg-tertiary/30 border border-gray-200 dark:border-transparent rounded-xl shadow-xs",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary",
                },
                metrics.mealFrequency,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs text-light-text-muted dark:text-dark-text-muted",
                },
                "Meals Today",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-center p-2.5 sm:p-3 bg-white dark:bg-dark-bg-tertiary/30 border border-gray-200 dark:border-transparent rounded-xl shadow-xs",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary",
                },
                Math.round(metrics.avgCaloriesPerMeal),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs text-light-text-muted dark:text-dark-text-muted",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "hidden sm:inline",
                  },
                  "Avg Cal/Meal",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "sm:hidden",
                  },
                  "Avg/Meal",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-center p-2.5 sm:p-3 bg-white dark:bg-dark-bg-tertiary/30 border border-gray-200 dark:border-transparent rounded-xl shadow-xs",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-base sm:text-lg font-bold text-green-600 dark:text-red-500",
                },
                Math.round(metrics.macroDistribution.protein),
                "%",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs text-light-text-muted dark:text-dark-text-muted",
                },
                "Protein %",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-center p-2.5 sm:p-3 bg-white dark:bg-dark-bg-tertiary/30 border border-gray-200 dark:border-transparent rounded-xl shadow-xs",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-base sm:text-lg font-bold text-red-700 dark:text-red-500",
                },
                targets.goalType?.toUpperCase() || "MAINTAIN",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs text-light-text-muted dark:text-dark-text-muted",
                },
                "Goal Type",
              ),
            ),
          ),
        ),

      activeTab === "macros" &&
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            key: "macros",
            initial: {
              opacity: 0,
              y: 20,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            exit: {
              opacity: 0,
              y: -20,
            },
            className: "space-y-6",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl p-6",
            },
            /*#__PURE__*/ React.createElement(
              "h4",
              {
                className:
                  "text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4",
              },
              "Macro Distribution",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex justify-between mb-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className:
                          "text-sm font-medium text-red-700 dark:text-red-500",
                      },
                      "Protein",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-sm font-bold",
                      },
                      Math.round(metrics.macroDistribution.protein),
                      "%",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2",
                    },
                    /*#__PURE__*/ React.createElement(motion.div, {
                      className:
                        "h-2 rounded-full bg-gradient-to-r from-red-600 to-red-700",
                      initial: {
                        width: 0,
                      },
                      animate: {
                        width: `${metrics.macroDistribution.protein}%`,
                      },
                      transition: {
                        duration: 1,
                        ease: "easeOut",
                      },
                    }),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex justify-between mb-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className:
                          "text-sm font-medium text-green-600 dark:text-red-500",
                      },
                      "Carbs",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-sm font-bold",
                      },
                      Math.round(metrics.macroDistribution.carbs),
                      "%",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2",
                    },
                    /*#__PURE__*/ React.createElement(motion.div, {
                      className:
                        "h-2 rounded-full bg-gradient-to-r from-red-600 to-green-600",
                      initial: {
                        width: 0,
                      },
                      animate: {
                        width: `${metrics.macroDistribution.carbs}%`,
                      },
                      transition: {
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.2,
                      },
                    }),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex justify-between mb-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className:
                          "text-sm font-medium text-yellow-600 dark:text-yellow-400",
                      },
                      "Fat",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-sm font-bold",
                      },
                      Math.round(metrics.macroDistribution.fat),
                      "%",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "w-full bg-gray-200 dark:bg-dark-bg-tertiary rounded-full h-2",
                    },
                    /*#__PURE__*/ React.createElement(motion.div, {
                      className:
                        "h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500",
                      initial: {
                        width: 0,
                      },
                      animate: {
                        width: `${metrics.macroDistribution.fat}%`,
                      },
                      transition: {
                        duration: 1,
                        ease: "easeOut",
                        delay: 0.4,
                      },
                    }),
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "p-4 bg-neutral-900/50 dark:bg-neutral-950/40 rounded-xl border border-neutral-800 dark:border-red-950/30",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-2xl font-bold text-red-700 dark:text-red-500",
                  },
                  Math.round((totals.protein || 0) * 4),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-sm text-red-700 dark:text-red-500",
                  },
                  "Protein Calories",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-xs text-light-text-muted dark:text-dark-text-muted mt-1",
                  },
                  Math.round(totals.protein || 0),
                  "g \xD7 4 cal/g",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-2xl font-bold text-green-600 dark:text-red-500",
                  },
                  Math.round((totals.carbs || 0) * 4),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-sm text-green-600 dark:text-red-500",
                  },
                  "Carb Calories",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-xs text-light-text-muted dark:text-dark-text-muted mt-1",
                  },
                  Math.round(totals.carbs || 0),
                  "g \xD7 4 cal/g",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-2xl font-bold text-yellow-600 dark:text-yellow-400",
                  },
                  Math.round((totals.fat || 0) * 9),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-sm text-yellow-600 dark:text-yellow-400",
                  },
                  "Fat Calories",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-xs text-light-text-muted dark:text-dark-text-muted mt-1",
                  },
                  Math.round(totals.fat || 0),
                  "g \xD7 9 cal/g",
                ),
              ),
            ),
          ),
        ),
      activeTab === "insights" &&
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            key: "insights",
            initial: {
              opacity: 0,
              y: 20,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            exit: {
              opacity: 0,
              y: -20,
            },
            className: "space-y-6",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "space-y-4",
            },
            /*#__PURE__*/ React.createElement(
              "h4",
              {
                className:
                  "text-lg font-semibold text-light-text-primary dark:text-dark-text-primary",
              },
              "Smart Insights",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "grid gap-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "p-4 bg-gradient-to-r from-neutral-950 to-neutral-900 rounded-xl border border-neutral-800 dark:border-red-950/30",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-start gap-3",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-2xl",
                    },
                    /*#__PURE__*/ React.createElement(BicepsFlexed, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "font-medium text-red-600 dark:text-red-500",
                      },
                      "Protein Status",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-sm text-light-text-muted dark:text-dark-text-muted mt-1",
                      },
                      progress.protein >= 100
                        ? "Excellent! You've hit your protein target. Great for muscle maintenance and growth."
                        : progress.protein >= 80
                          ? `You're ${Math.round(100 - progress.protein)}% away from your protein goal. Consider adding lean protein sources.`
                          : "Low protein intake detected. Add protein-rich foods like chicken, fish, or legumes.",
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-start gap-3",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-2xl",
                    },
                    /*#__PURE__*/ React.createElement(Scale, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "font-medium text-green-700 dark:text-green-300",
                      },
                      "Calorie Balance",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-sm text-light-text-muted dark:text-dark-text-muted mt-1",
                      },
                      Math.abs(metrics.caloriesRemaining) < 100
                        ? "Perfect calorie balance! You're right on target for your goals."
                        : metrics.caloriesRemaining > 200
                          ? `You have ${metrics.caloriesRemaining} calories remaining. Consider a healthy snack.`
                          : "You're slightly over your calorie target. This is normal and okay occasionally.",
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-start gap-3",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-2xl",
                    },
                    /*#__PURE__*/ React.createElement(Clock, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "font-medium text-purple-700 dark:text-purple-300",
                      },
                      "Meal Frequency",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-sm text-light-text-muted dark:text-dark-text-muted mt-1",
                      },
                      metrics.mealFrequency >= 4
                        ? "Great meal frequency! Regular eating helps maintain steady energy levels."
                        : metrics.mealFrequency >= 2
                          ? "Good meal frequency. Consider adding a healthy snack if you feel hungry."
                          : "Low meal frequency detected. Try to eat more regularly throughout the day.",
                    ),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-start gap-3",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-2xl",
                    },
                    /*#__PURE__*/ React.createElement(Target, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "font-medium text-orange-700 dark:text-orange-300",
                      },
                      "Macro Balance",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-sm text-light-text-muted dark:text-dark-text-muted mt-1",
                      },
                      metrics.macroDistribution.protein >= 25
                        ? "Excellent protein ratio! This supports muscle maintenance and satiety."
                        : metrics.macroDistribution.protein >= 15
                          ? "Good protein ratio. Consider increasing slightly for better results."
                          : "Low protein ratio. Aim for 25-30% of calories from protein for optimal results.",
                    ),
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "bg-gray-50 dark:bg-dark-bg-tertiary/30 rounded-xl p-6",
            },
            /*#__PURE__*/ React.createElement(
              "h4",
              {
                className:
                  "text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4",
              },
              "Today's Progress Summary",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex justify-between items-center",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-sm text-light-text-muted dark:text-dark-text-muted",
                  },
                  "Goal Achievement",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-sm font-medium text-light-text-primary dark:text-dark-text-primary",
                  },
                  Math.round(
                    (progress.calories +
                      progress.protein +
                      progress.carbs +
                      progress.fat) /
                      4,
                  ),
                  "% Complete",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex justify-between items-center",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-sm text-light-text-muted dark:text-dark-text-muted",
                  },
                  "Best Macro",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-sm font-medium text-green-600 dark:text-red-500",
                  },
                  progress.protein >= Math.max(progress.carbs, progress.fat)
                    ? "Protein"
                    : progress.carbs >= progress.fat
                      ? "Carbs"
                      : "Fat",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex justify-between items-center",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-sm text-light-text-muted dark:text-dark-text-muted",
                  },
                  "Next Meal Suggestion",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-sm font-medium text-red-700 dark:text-red-500",
                  },
                  progress.protein < 80
                    ? "High Protein"
                    : progress.carbs < 80
                      ? "Complex Carbs"
                      : progress.fat < 80
                        ? "Healthy Fats"
                        : "Balanced",
                ),
              ),
            ),
          ),
        ),
    ),
  );
};
export default RealTimeNutritionProgress;
