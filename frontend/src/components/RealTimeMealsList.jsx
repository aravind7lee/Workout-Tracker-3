import { Utensils, Hourglass, Trash2, Star, X } from 'lucide-react';
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";


const RealTimeMealsList = ({ meals, isLoading, onDeleteMeal }) => {
  const [stableMeals, setStableMeals] = useState([]);
  const [deletingMealIds, setDeletingMealIds] = useState(new Set());
  const prevMealsRef = useRef([]);

  // Ensure meals persist and don't disappear
  useEffect(() => {
    if (meals && meals.length > 0) {
      setStableMeals(
        meals.filter((meal) => !deletingMealIds.has(meal._id || meal.id)),
      );
    } else if (!isLoading) {
      setStableMeals([]);
    }
  }, [meals, isLoading, deletingMealIds]);
  const handleDeleteMeal = async (mealId) => {
    if (!mealId || deletingMealIds.has(mealId)) return;
    if (window.confirm("Are you sure you want to delete this meal?")) {
      try {
        // Add to deleting set to prevent re-adding
        setDeletingMealIds((prev) => new Set([...prev, mealId]));

        // Optimistically remove from stable meals
        setStableMeals((prev) =>
          prev.filter(
            (meal) =>
              meal._id &&
              meal._id.toString() !== mealId.toString() &&
              meal.id &&
              meal.id.toString() !== mealId.toString(),
          ),
        );

        // Call parent delete function
        await onDeleteMeal(mealId);

        // Show success notification
        const notification = document.createElement("div");
        notification.className =
          "fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50";
        notification.innerHTML = `
          <div class="flex items-center gap-3">
            <div class="text-xl">✅</div>
            <div class="font-medium">Meal Deleted Successfully</div>
          </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 2000);
      } catch (error) {
        console.error("Delete meal error:", error);

        // Remove from deleting set on error
        setDeletingMealIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(mealId);
          return newSet;
        });

        // Show error notification
        const errorNotification = document.createElement("div");
        errorNotification.className =
          "fixed top-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg z-50";
        errorNotification.innerHTML = `
          <div class="flex items-center gap-3">
            <div className="text-xl"><X className="w-[1em] h-[1em] inline-block" /></div>
            <div>
              <div class="font-medium">Delete Failed</div>
              <div class="text-sm opacity-90">${error.message}</div>
            </div>
          </div>
        `;
        document.body.appendChild(errorNotification);
        setTimeout(() => {
          if (document.body.contains(errorNotification)) {
            document.body.removeChild(errorNotification);
          }
        }, 4000);
      } finally {
        // Clean up deleting state after a delay
        setTimeout(() => {
          setDeletingMealIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(mealId);
            return newSet;
          });
        }, 1000);
      }
    }
  };
  const displayMeals = meals || [];
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "bg-light-bg-soft dark:bg-dark-bg-soft backdrop-blur-premium border border-gray-200 dark:border-dark-border rounded-2xl p-6 shadow-light-card dark:shadow-dark-card transition-all duration-300 hover:shadow-lg dark:hover:shadow-dark-glow",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex items-center justify-between mb-4",
      },
      /*#__PURE__*/ React.createElement(
        "h3",
        {
          className:
            "text-lg font-semibold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2",
        },
        /*#__PURE__*/ React.createElement(
          "span",
          null,
          /*#__PURE__*/ React.createElement(Utensils, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        ),
        " Today's Meals",
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex items-center gap-2",
        },
        /*#__PURE__*/ React.createElement("span", {
          className: "w-2 h-2 bg-red-600 rounded-full animate-pulse",
        }),
        /*#__PURE__*/ React.createElement(
          "span",
          {
            className:
              "text-sm text-light-text-muted dark:text-dark-text-muted",
          },
          displayMeals.length,
          " meals",
        ),
      ),
    ),
    isLoading && displayMeals.length === 0
      ? /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-3",
          },
          [1, 2, 3].map((i) =>
            /*#__PURE__*/ React.createElement("div", {
              key: i,
              className:
                "animate-pulse bg-gray-200 dark:bg-dark-bg-tertiary/50 h-16 rounded-lg",
            }),
          ),
        )
      : displayMeals.length === 0
        ? /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center py-8",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-4xl mb-3",
              },
              /*#__PURE__*/ React.createElement(Utensils, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className:
                  "text-light-text-muted dark:text-dark-text-muted mb-4",
              },
              "No meals logged today",
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className:
                  "text-sm text-light-text-muted/80 dark:text-dark-text-muted/80",
              },
              "Add your first meal above to start tracking!",
            ),
          )
        : /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "space-y-3",
            },
            /*#__PURE__*/ React.createElement(
              AnimatePresence,
              {
                mode: "popLayout",
              },
              displayMeals.map((meal) => {
                const mealId = meal._id || meal.id || `meal-${Math.random()}`;
                const isDeleting = deletingMealIds.has(mealId);
                return /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    key: mealId,
                    layout: true,
                    initial: {
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                    },
                    animate: {
                      opacity: isDeleting ? 0.5 : 1,
                      y: 0,
                      scale: isDeleting ? 0.95 : 1,
                    },
                    exit: {
                      opacity: 0,
                      x: -100,
                      scale: 0.9,
                    },
                    transition: {
                      duration: 0.3,
                      ease: "easeOut",
                    },
                    className: `flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-lg transition-all duration-200 space-y-3 sm:space-y-0 ${isDeleting ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800" : meal.synced === false ? "bg-red-600/10 dark:bg-red-600/10 border border-red-600/30 dark:border-red-500/30" : "bg-gray-50 dark:bg-dark-bg-secondary/60 hover:bg-gray-100 dark:hover:bg-dark-bg-secondary/80 border border-gray-200 dark:border-dark-border backdrop-blur-xs"}`,
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex-1 space-y-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex items-center justify-between",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex items-center gap-2 flex-1",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "font-medium text-light-text-primary dark:text-dark-text-primary capitalize text-sm sm:text-base",
                          },
                          meal.parsedName || meal.name || "Unknown Food",
                        ),
                        meal.synced === false &&
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "text-xs bg-red-600/20 text-red-500 px-2 py-1 rounded animate-pulse",
                            },
                            "Syncing...",
                          ),
                        isDeleting &&
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded",
                            },
                            "Deleting...",
                          ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => handleDeleteMeal(mealId),
                          disabled: isDeleting || (!meal._id && !meal.id),
                          className:
                            "sm:hidden text-red-400 hover:text-red-300 hover:bg-red-500/20 dark:hover:bg-red-500/30 p-1.5 rounded-lg transition-all border border-red-400/30 hover:border-red-400/60 disabled:opacity-50 disabled:cursor-not-allowed",
                          title: "Delete meal",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-xs",
                          },
                          isDeleting ? "⏳" : "🗑️",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted",
                      },
                      meal.servingText || "Standard serving",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-xs text-light-text-muted/80 dark:text-dark-text-muted/80 flex flex-wrap items-center gap-2",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        null,
                        new Date(
                          meal.consumedAt || Date.now(),
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "capitalize",
                        },
                        meal.mealType || "snack",
                      ),
                      meal.source &&
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: `px-1 rounded text-xs ${meal.source === "nutritionix" ? "bg-red-600/20 text-red-500" : meal.source === "fallback" ? "bg-yellow-500/20 text-yellow-400" : "bg-neutral-700/50 text-neutral-400"}`,
                          },
                          meal.source === "nutritionix"
                            ? "🔥 Live"
                            : meal.source,
                        ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "grid grid-cols-4 gap-2 sm:hidden pt-2 border-t border-gray-200 dark:border-dark-border",
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
                              "text-light-text-primary dark:text-dark-text-primary font-medium text-sm",
                          },
                          Math.round(meal.calories || 0),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-light-text-muted dark:text-dark-text-muted text-xs",
                          },
                          "cal",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-center",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-red-700 dark:text-red-500 font-medium text-sm",
                          },
                          Math.round((meal.protein || 0) * 10) / 10,
                          "g",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-light-text-muted dark:text-dark-text-muted text-xs",
                          },
                          "protein",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-center",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-green-600 dark:text-red-500 font-medium text-sm",
                          },
                          Math.round((meal.carbs || 0) * 10) / 10,
                          "g",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-light-text-muted dark:text-dark-text-muted text-xs",
                          },
                          "carbs",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-center",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-yellow-600 dark:text-yellow-400 font-medium text-sm",
                          },
                          Math.round((meal.fat || 0) * 10) / 10,
                          "g",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-light-text-muted dark:text-dark-text-muted text-xs",
                          },
                          "fat",
                        ),
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "hidden sm:flex items-center gap-4 text-sm",
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
                            "text-light-text-primary dark:text-dark-text-primary font-medium",
                        },
                        Math.round(meal.calories || 0),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-light-text-muted dark:text-dark-text-muted text-xs",
                        },
                        "cal",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-center",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-red-700 dark:text-red-500 font-medium",
                        },
                        Math.round((meal.protein || 0) * 10) / 10,
                        "g",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-light-text-muted dark:text-dark-text-muted text-xs",
                        },
                        "protein",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-center",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-green-600 dark:text-red-500 font-medium",
                        },
                        Math.round((meal.carbs || 0) * 10) / 10,
                        "g",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-light-text-muted dark:text-dark-text-muted text-xs",
                        },
                        "carbs",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-center",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-yellow-600 dark:text-yellow-400 font-medium",
                        },
                        Math.round((meal.fat || 0) * 10) / 10,
                        "g",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-light-text-muted dark:text-dark-text-muted text-xs",
                        },
                        "fat",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => handleDeleteMeal(mealId),
                        disabled: isDeleting || (!meal._id && !meal.id),
                        className:
                          "text-red-400 hover:text-red-300 hover:bg-red-500/20 dark:hover:bg-red-500/30 p-2 rounded-lg transition-all ml-2 border border-red-400/30 hover:border-red-400/60 dark:hover:shadow-red-500/20 dark:hover:shadow-lg backdrop-blur-xs disabled:opacity-50 disabled:cursor-not-allowed",
                        title: "Delete meal",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-sm",
                        },
                        isDeleting ? "⏳ Deleting..." : "🗑️ Remove",
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
  );
};
export default RealTimeMealsList;
