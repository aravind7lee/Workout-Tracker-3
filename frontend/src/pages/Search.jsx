// frontend/src/pages/Search.jsx
import { BicepsFlexed, Dumbbell, Activity, Star, Target, Drumstick, Milk, Soup, Fish, Nut, ClipboardList, TrendingDown, Zap, Home, RefreshCw, ArrowUp, Apple, Salad } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";


export default function Search() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Comprehensive search data matching the navbar search
  const searchData = {
    workouts: [
      {
        id: 1,
        type: "workout",
        name: "Push Day Workout",
        description: "Chest, Shoulders, Triceps - Upper body strength",
        category: "Strength",
        difficulty: "Intermediate",
        icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 2,
        type: "workout",
        name: "Pull Day Workout",
        description: "Back, Biceps - Upper body pulling",
        category: "Strength",
        difficulty: "Intermediate",
        icon: /*#__PURE__*/ React.createElement(Dumbbell, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 3,
        type: "workout",
        name: "Leg Day Workout",
        description: "Quads, Hamstrings, Glutes - Lower body power",
        category: "Strength",
        difficulty: "Advanced",
        icon: /*#__PURE__*/ React.createElement(Activity, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 4,
        type: "workout",
        name: "Full Body HIIT",
        description: "High Intensity Interval Training - Fat burn",
        category: "Cardio",
        difficulty: "Advanced",
        icon: /*#__PURE__*/ React.createElement(Star, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 5,
        type: "workout",
        name: "Cardio Blast",
        description: "Fat burning cardio session - Endurance",
        category: "Cardio",
        difficulty: "Beginner",
        icon: /*#__PURE__*/ React.createElement(Activity, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 6,
        type: "workout",
        name: "Core Crusher",
        description: "Abs, obliques, lower back - Core strength",
        category: "Core",
        difficulty: "Intermediate",
        icon: /*#__PURE__*/ React.createElement(Target, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
    ],
    meals: [
      {
        id: 9,
        type: "meal",
        name: "Grilled Chicken Breast",
        description: "165 cal, 31g protein - Lean protein source",
        category: "Protein",
        difficulty: "Easy",
        icon: /*#__PURE__*/ React.createElement(Drumstick, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 10,
        type: "meal",
        name: "Greek Yogurt Salad",
        description: "130 cal, 23g protein - High protein snack",
        category: "Snack",
        difficulty: "Easy",
        icon: /*#__PURE__*/ React.createElement(Milk, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 11,
        type: "meal",
        name: "Steel Cut Oatmeal",
        description: "307 cal, 10g protein - Complex carbs",
        category: "Breakfast",
        difficulty: "Easy",
        icon: /*#__PURE__*/ React.createElement(Soup, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 12,
        type: "meal",
        name: "Baked Salmon",
        description: "208 cal, 25g protein - Omega-3 rich",
        category: "Protein",
        difficulty: "Medium",
        icon: /*#__PURE__*/ React.createElement(Fish, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 13,
        type: "meal",
        name: "Avocado Toast",
        description: "322 cal, 4g protein - Healthy fats",
        category: "Breakfast",
        difficulty: "Easy",
        icon: /*#__PURE__*/ React.createElement(Nut, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
    ],
    plans: [
      {
        id: 17,
        type: "plan",
        name: "Beginner Strength Program",
        description: "4-week strength building for newcomers",
        category: "Strength",
        difficulty: "Beginner",
        icon: /*#__PURE__*/ React.createElement(ClipboardList, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 18,
        type: "plan",
        name: "Weight Loss Challenge",
        description: "Fat loss with cardio and strength training",
        category: "Weight Loss",
        difficulty: "Intermediate",
        icon: /*#__PURE__*/ React.createElement(TrendingDown, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 19,
        type: "plan",
        name: "Muscle Building Protocol",
        description: "Hypertrophy focused 8-week program",
        category: "Muscle Building",
        difficulty: "Advanced",
        icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 20,
        type: "plan",
        name: "Athletic Performance",
        description: "Sports performance enhancement plan",
        category: "Performance",
        difficulty: "Advanced",
        icon: /*#__PURE__*/ React.createElement(Zap, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 21,
        type: "plan",
        name: "Home Workout Plan",
        description: "No equipment needed - Bodyweight only",
        category: "Home",
        difficulty: "Beginner",
        icon: /*#__PURE__*/ React.createElement(Home, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
    ],
    exercises: [
      {
        id: 25,
        type: "exercise",
        name: "Bench Press",
        description: "Chest, Triceps, Shoulders - Compound push",
        category: "Chest",
        difficulty: "Intermediate",
        icon: /*#__PURE__*/ React.createElement(Dumbbell, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 26,
        type: "exercise",
        name: "Deadlift",
        description: "Full body compound movement - King of lifts",
        category: "Back",
        difficulty: "Advanced",
        icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 27,
        type: "exercise",
        name: "Back Squats",
        description: "Legs, Glutes, Core - Lower body foundation",
        category: "Legs",
        difficulty: "Intermediate",
        icon: /*#__PURE__*/ React.createElement(Activity, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 28,
        type: "exercise",
        name: "Pull-ups",
        description: "Back, Biceps - Bodyweight pulling",
        category: "Back",
        difficulty: "Intermediate",
        icon: /*#__PURE__*/ React.createElement(RefreshCw, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 29,
        type: "exercise",
        name: "Push-ups",
        description: "Chest, Triceps, Core - Bodyweight push",
        category: "Chest",
        difficulty: "Beginner",
        icon: /*#__PURE__*/ React.createElement(ArrowUp, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
      {
        id: 30,
        type: "exercise",
        name: "Overhead Press",
        description: "Shoulders, Triceps, Core - Vertical push",
        category: "Shoulders",
        difficulty: "Intermediate",
        icon: /*#__PURE__*/ React.createElement(Dumbbell, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      },
    ],
  };
  useEffect(() => {
    const performSearch = async () => {
      if (query) {
        setLoading(true);

        // Simulate API delay for realistic experience
        await new Promise((resolve) => setTimeout(resolve, 300));
        try {
          // Get all items from search data
          const allItems = [
            ...searchData.workouts,
            ...searchData.meals,
            ...searchData.plans,
            ...searchData.exercises,
          ];

          // Filter by type if specified
          const typeFiltered = type
            ? allItems.filter((item) => item.type === type)
            : allItems;

          // Filter by search query
          const filtered = typeFiltered.filter((item) => {
            const searchTerm = query.toLowerCase();
            return (
              item.name.toLowerCase().includes(searchTerm) ||
              item.description.toLowerCase().includes(searchTerm) ||
              item.category.toLowerCase().includes(searchTerm) ||
              item.type.toLowerCase().includes(searchTerm)
            );
          });

          // Sort by relevance
          const sorted = filtered.sort((a, b) => {
            const aName = a.name.toLowerCase();
            const bName = b.name.toLowerCase();
            const searchTerm = query.toLowerCase();

            // Exact matches first
            if (aName === searchTerm && bName !== searchTerm) return -1;
            if (bName === searchTerm && aName !== searchTerm) return 1;

            // Name starts with search term
            if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm))
              return -1;
            if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm))
              return 1;
            return aName.localeCompare(bName);
          });
          setResults(sorted.slice(0, 20)); // Show up to 20 results
        } catch (error) {
          console.error("Search error:", error);
          setResults([]);
        }
        setLoading(false);
      } else {
        setResults([]);
      }
    };
    const timeoutId = setTimeout(performSearch, 200);
    return () => clearTimeout(timeoutId);
  }, [query, type]);
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "max-w-4xl mx-auto py-8",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "mb-8",
      },
      /*#__PURE__*/ React.createElement(
        "h1",
        {
          className: "text-3xl font-bold text-gray-900 dark:text-white mb-4",
        },
        "Search Results",
      ),
      query &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex flex-col sm:flex-row sm:items-center gap-2",
          },
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-gray-600 dark:text-gray-400",
            },
            "Showing results for: ",
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "font-semibold",
              },
              '"',
              query,
              '"',
            ),
          ),
          type &&
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className:
                  "inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 capitalize",
              },
              type,
              "s only",
            ),
        ),
    ),
    loading
      ? /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex justify-center py-12",
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "animate-spin rounded-full h-12 w-12 border-b-2 border-red-700",
          }),
        )
      : /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-4",
          },
          results.length > 0
            ? results.map((item) => {
                const getTypeColor = (type) => {
                  switch (type) {
                    case "workout":
                      return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
                    case "meal":
                      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
                    case "plan":
                      return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
                    case "exercise":
                      return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
                    default:
                      return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
                  }
                };
                const getDifficultyColor = (difficulty) => {
                  switch (difficulty?.toLowerCase()) {
                    case "beginner":
                    case "easy":
                      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
                    case "intermediate":
                    case "medium":
                      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
                    case "advanced":
                    case "hard":
                      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
                    default:
                      return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
                  }
                };
                const handleItemClick = () => {
                  switch (item.type) {
                    case "workout":
                    case "exercise":
                      navigate(`/exercises/${item.id}`);
                      break;
                    case "meal":
                      navigate(`/nutrition?search=${item.name}`);
                      break;
                    case "plan":
                      navigate(`/plans/${item.id}`);
                      break;
                    default:
                      navigate(`/search?q=${encodeURIComponent(item.name)}`);
                  }
                };
                return /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    key: item.id,
                    className:
                      "bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 cursor-pointer",
                    onClick: handleItemClick,
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-start justify-between",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex-1",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex items-center gap-3 mb-2",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-2xl",
                          },
                          item.icon,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "h3",
                          {
                            className:
                              "text-xl font-semibold text-gray-900 dark:text-white",
                          },
                          item.name,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "p",
                        {
                          className: "text-gray-600 dark:text-gray-400 mb-3",
                        },
                        item.description,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center space-x-3 flex-wrap gap-2",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: `px-3 py-1 rounded-full text-sm capitalize ${getTypeColor(item.type)}`,
                          },
                          item.type,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: `px-3 py-1 rounded-full text-sm ${getDifficultyColor(item.difficulty)}`,
                          },
                          item.difficulty,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className:
                              "px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-sm",
                          },
                          item.category,
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          handleItemClick();
                        },
                        className:
                          "ml-4 px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0",
                      },
                      "View Details",
                    ),
                  ),
                );
              })
            : query
              ? /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-center py-12",
                  },
                  /*#__PURE__*/ React.createElement(MagnifyingGlassIcon, {
                    className: "h-16 w-16 text-gray-400 mx-auto mb-4",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "h3",
                    {
                      className:
                        "text-lg font-medium text-gray-900 dark:text-white mb-2",
                    },
                    "No results found",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className: "text-gray-600 dark:text-gray-400 mb-4",
                    },
                    "Try searching with different keywords or browse our categories",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex flex-wrap justify-center gap-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/search?q=workout"),
                        className:
                          "px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors",
                      },
                      /*#__PURE__*/ React.createElement(Dumbbell, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " Workouts",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/search?q=meal"),
                        className:
                          "px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors",
                      },
                      /*#__PURE__*/ React.createElement(Apple, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " Meals",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/search?q=plan"),
                        className:
                          "px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors",
                      },
                      /*#__PURE__*/ React.createElement(ClipboardList, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " Plans",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/search?q=exercise"),
                        className:
                          "px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors",
                      },
                      /*#__PURE__*/ React.createElement(BicepsFlexed, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " Exercises",
                    ),
                  ),
                )
              : /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-center py-12",
                  },
                  /*#__PURE__*/ React.createElement(MagnifyingGlassIcon, {
                    className: "h-16 w-16 text-gray-400 mx-auto mb-4",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "h3",
                    {
                      className:
                        "text-lg font-medium text-gray-900 dark:text-white mb-2",
                    },
                    "Start searching",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className: "text-gray-600 dark:text-gray-400 mb-6",
                    },
                    "Find workouts, meals, plans, and exercises",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto",
                    },
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/search?q=strength"),
                        className:
                          "p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-3xl mb-2",
                        },
                        /*#__PURE__*/ React.createElement(BicepsFlexed, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "font-medium text-gray-900 dark:text-white",
                        },
                        "Strength",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/search?q=cardio"),
                        className:
                          "p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-3xl mb-2",
                        },
                        /*#__PURE__*/ React.createElement(Activity, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "font-medium text-gray-900 dark:text-white",
                        },
                        "Cardio",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/search?q=nutrition"),
                        className:
                          "p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-3xl mb-2",
                        },
                        /*#__PURE__*/ React.createElement(Salad, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "font-medium text-gray-900 dark:text-white",
                        },
                        "Nutrition",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => navigate("/search?q=beginner"),
                        className:
                          "p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-3xl mb-2",
                        },
                        /*#__PURE__*/ React.createElement(Star, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "font-medium text-gray-900 dark:text-white",
                        },
                        "Beginner",
                      ),
                    ),
                  ),
                ),
        ),
  );
}
