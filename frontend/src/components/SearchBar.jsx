import { Search, X, ClipboardList, Utensils } from 'lucide-react';
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { exerciseLibrary } from "../data/exerciseLibrary";
import nutritionApi from "../services/nutritionApi";
import foodCategoriesService from "../services/foodCategoriesService";


export default function SearchBar({ isMobile = false, onClose = () => {} }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Get all searchable data
  const getAllData = async () => {
    const exercises = [];
    const plans = [];
    const meals = [];

    // Get exercises from library
    Object.entries(exerciseLibrary).forEach(([muscleKey, muscleGroup]) => {
      muscleGroup.exercises.forEach((exercise) => {
        exercises.push({
          id: exercise.id,
          type: "exercise",
          title: exercise.name,
          description: `${muscleGroup.name} • ${exercise.sets} • ${exercise.difficulty}`,
          icon: muscleGroup.icon,
          category: muscleGroup.name,
        });
      });
    });

    // Get plans from localStorage
    try {
      const savedPlans = JSON.parse(
        localStorage.getItem("workoutPlans") || "[]",
      );
      savedPlans.forEach((plan) => {
        plans.push({
          id: plan.id,
          type: "plan",
          title: plan.name,
          description: `${plan.exercises?.length || 0} exercises • ${plan.category || "Custom"}`,
          icon: /*#__PURE__*/ React.createElement(ClipboardList, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          category: plan.category || "Custom",
        });
      });
    } catch (error) {
      console.error("Error loading plans:", error);
    }

    // Get comprehensive food items from food categories service
    try {
      const foodCategories = await foodCategoriesService.getFoodCategories();
      Object.values(foodCategories).forEach((category) => {
        if (category.foods) {
          category.foods.forEach((food, index) => {
            meals.push({
              id: `${category.title.toLowerCase().replace(/\s+/g, "-")}-${index}`,
              type: "meal",
              title: food.name,
              description: `${food.calories} cal • ${food.protein}g protein • ${food.carbs}g carbs • ${food.fat}g fat`,
              icon: /*#__PURE__*/ React.createElement(Utensils, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              foodData: food,
            });
          });
        }
      });
    } catch (error) {
      console.log("Failed to load food categories, using fallback");
    }
    return [...exercises, ...plans, ...meals];
  };

  // Wrapper to handle async getAllData
  const getAllDataSync = () => {
    const [data, setData] = useState([]);
    useEffect(() => {
      getAllData().then(setData);
    }, []);
    return data;
  };

  // Enhanced search function with comprehensive food database
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const searchTerm = searchQuery.toLowerCase();
      let allResults = [];

      // Search in local data (exercises, plans, food database)
      const allItems = await getAllData();
      const localResults = allItems.filter((item) => {
        return (
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category?.toLowerCase().includes(searchTerm)
        );
      });
      allResults = [...localResults];

      // Skip API lookup for search to maintain consistency
      // All food results come from static database only

      // Sort by relevance
      const sorted = allResults.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();

        // Exact matches first
        if (aTitle === searchTerm && bTitle !== searchTerm) return -1;
        if (bTitle === searchTerm && aTitle !== searchTerm) return 1;

        // Starts with matches next
        if (aTitle.startsWith(searchTerm) && !bTitle.startsWith(searchTerm))
          return -1;
        if (bTitle.startsWith(searchTerm) && !aTitle.startsWith(searchTerm))
          return 1;

        // API results (more accurate) before database results
        if (a.nutritionData && !b.nutritionData) return -1;
        if (b.nutritionData && !a.nutritionData) return 1;
        return aTitle.localeCompare(bTitle);
      });
      setResults(sorted.slice(0, 20));
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    }
    setIsSearching(false);
  };

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 200); // Faster response for better UX

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle result click
  const handleResultClick = (result) => {
    let targetUrl;
    if (result.type === "exercise") {
      // Navigate to library with the specific exercise search
      targetUrl = `/library?search=${encodeURIComponent(result.title)}`;
    } else if (result.type === "meal") {
      targetUrl = `/nutrition?search=${encodeURIComponent(result.title)}`;
    } else if (result.type === "plan") {
      targetUrl = result.id
        ? `/my-plans?highlight=${result.id}`
        : `/my-plans?search=${encodeURIComponent(result.title)}`;
    } else {
      targetUrl = `/library?search=${encodeURIComponent(result.title)}`;
    }

    // Clear search and close
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onClose();

    // Navigate
    window.location.href = targetUrl;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setQuery("");
      setResults([]);
      setIsOpen(false);
      onClose();
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  // Handle close
  const handleClose = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    onClose();
  };

  // Desktop version
  if (!isMobile) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        ref: searchRef,
        className: "relative",
      },
      /*#__PURE__*/ React.createElement(
        AnimatePresence,
        null,
        isOpen
          ? /*#__PURE__*/ React.createElement(
              motion.div,
              {
                initial: {
                  width: 40,
                  opacity: 0,
                },
                animate: {
                  width: 320,
                  opacity: 1,
                },
                exit: {
                  width: 40,
                  opacity: 0,
                },
                transition: {
                  duration: 0.3,
                },
                className: "relative",
              },
              /*#__PURE__*/ React.createElement(
                "form",
                {
                  onSubmit: handleSubmit,
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "relative",
                  },
                  /*#__PURE__*/ React.createElement(Search, {
                    className:
                      "absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 z-10",
                    size: 16,
                  }),
                  /*#__PURE__*/ React.createElement("input", {
                    type: "text",
                    value: query,
                    onChange: (e) => setQuery(e.target.value),
                    placeholder: "Search all foods, workouts, plans...",
                    className:
                      "w-full pl-10 pr-10 py-2 bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20",
                    autoFocus: true,
                  }),
                  isSearching &&
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "absolute right-10 top-1/2 transform -translate-y-1/2",
                      },
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full",
                      }),
                    ),
                  /*#__PURE__*/ React.createElement(
                    "button",
                    {
                      type: "button",
                      onClick: handleClose,
                      className:
                        "absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white",
                    },
                    /*#__PURE__*/ React.createElement(X, {
                      size: 16,
                    }),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                AnimatePresence,
                null,
                query &&
                  /*#__PURE__*/ React.createElement(
                    motion.div,
                    {
                      initial: {
                        opacity: 0,
                        y: 10,
                      },
                      animate: {
                        opacity: 1,
                        y: 0,
                      },
                      exit: {
                        opacity: 0,
                        y: 10,
                      },
                      className:
                        "absolute top-full left-0 right-0 mt-2 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/50 rounded-xl shadow-2xl py-2 max-h-80 overflow-y-auto z-50",
                    },
                    results.length > 0
                      ? /*#__PURE__*/ React.createElement(
                          React.Fragment,
                          null,
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "px-4 py-2 text-xs font-medium uppercase tracking-wide text-neutral-400 border-b border-neutral-700/50",
                            },
                            "Results (",
                            results.length,
                            ")",
                          ),
                          results.map((result) =>
                            /*#__PURE__*/ React.createElement(
                              "button",
                              {
                                key: result.id,
                                onClick: () => handleResultClick(result),
                                className:
                                  "w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-neutral-800/50 transition-colors",
                              },
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "text-2xl",
                                },
                                result.icon,
                              ),
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "flex-1 min-w-0",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className:
                                      "font-medium truncate text-white",
                                  },
                                  result.title,
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className:
                                      "text-sm truncate text-neutral-400",
                                  },
                                  result.description,
                                ),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className:
                                    "text-xs px-2 py-1 rounded-full bg-neutral-800/50 text-neutral-300 capitalize",
                                },
                                result.type,
                              ),
                            ),
                          ),
                        )
                      : !isSearching
                        ? /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "px-4 py-8 text-center text-neutral-400",
                            },
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "mb-2",
                              },
                              "No results found",
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "text-sm",
                              },
                              "Try different keywords",
                            ),
                          )
                        : /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "px-4 py-8 text-center",
                            },
                            /*#__PURE__*/ React.createElement("div", {
                              className:
                                "animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full mx-auto",
                            }),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "text-xs mt-2 text-neutral-400",
                              },
                              "Searching...",
                            ),
                          ),
                  ),
              ),
            )
          : /*#__PURE__*/ React.createElement(
              motion.button,
              {
                whileHover: {
                  scale: 1.1,
                },
                whileTap: {
                  scale: 0.9,
                },
                onClick: () => setIsOpen(true),
                className:
                  "p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/50 rounded-xl transition-all duration-200",
              },
              /*#__PURE__*/ React.createElement(Search, {
                size: 20,
              }),
            ),
      ),
    );
  }

  // Mobile version
  return /*#__PURE__*/ React.createElement(
    React.Fragment,
    null,
    /*#__PURE__*/ React.createElement(
      motion.button,
      {
        whileHover: {
          scale: 1.1,
        },
        whileTap: {
          scale: 0.9,
        },
        onClick: () => setIsOpen(true),
        className:
          "flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[14px] bg-[#1a1a1a]/80 backdrop-blur-md border border-[#2a2a2a] text-zinc-300 hover:text-white hover:bg-[#252525] transition-all duration-300 shadow-lg",
      },
      /*#__PURE__*/ React.createElement(Search, {
        size: 18,
      }),
    ),
    /*#__PURE__*/ React.createElement(
      AnimatePresence,
      null,
      isOpen &&
        /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          /*#__PURE__*/ React.createElement(motion.div, {
            initial: {
              opacity: 0,
            },
            animate: {
              opacity: 1,
            },
            exit: {
              opacity: 0,
            },
            onClick: handleClose,
            className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]",
            style: {
              touchAction: "none",
            },
          }),
          /*#__PURE__*/ React.createElement(
            motion.div,
            {
              initial: {
                y: "-100%",
                opacity: 0,
              },
              animate: {
                y: 0,
                opacity: 1,
              },
              exit: {
                y: "-100%",
                opacity: 0,
              },
              transition: {
                type: "spring",
                damping: 30,
                stiffness: 300,
              },
              className:
                "fixed top-0 left-0 right-0 z-[100] p-4 bg-black/95 backdrop-blur-xl border-b border-neutral-700/50",
            },
            /*#__PURE__*/ React.createElement(
              "form",
              {
                onSubmit: handleSubmit,
                className: "mb-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "relative",
                },
                /*#__PURE__*/ React.createElement(Search, {
                  className:
                    "absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 z-10",
                  size: 18,
                }),
                /*#__PURE__*/ React.createElement("input", {
                  type: "text",
                  value: query,
                  onChange: (e) => setQuery(e.target.value),
                  placeholder: "Search all foods, workouts, plans...",
                  className:
                    "w-full pl-10 pr-10 py-3 bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:border-red-600/50 focus:ring-2 focus:ring-red-600/20",
                  autoFocus: true,
                }),
                isSearching &&
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "absolute right-10 top-1/2 transform -translate-y-1/2",
                    },
                    /*#__PURE__*/ React.createElement("div", {
                      className:
                        "animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full",
                    }),
                  ),
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    type: "button",
                    onClick: handleClose,
                    className:
                      "absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white",
                  },
                  /*#__PURE__*/ React.createElement(X, {
                    size: 16,
                  }),
                ),
              ),
            ),
            query &&
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "rounded-xl p-2 max-h-60 overflow-y-auto bg-neutral-900/60 backdrop-blur-sm border border-neutral-700/50",
                },
                results.length > 0
                  ? /*#__PURE__*/ React.createElement(
                      React.Fragment,
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-xs font-medium uppercase tracking-wide px-2 py-1 mb-2 text-neutral-400",
                        },
                        "Results (",
                        results.length,
                        ")",
                      ),
                      results.map((result) =>
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            key: result.id,
                            onClick: () => handleResultClick(result),
                            className:
                              "w-full flex items-center space-x-3 px-3 py-3 text-left rounded-lg transition-colors hover:bg-neutral-800/50 active:bg-neutral-700/50",
                            style: {
                              minHeight: "48px",
                              touchAction: "manipulation",
                              WebkitTapHighlightColor: "transparent",
                            },
                          },
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-lg",
                            },
                            result.icon,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "flex-1 min-w-0",
                            },
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className:
                                  "font-medium text-sm truncate text-white",
                              },
                              result.title,
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "text-xs truncate text-neutral-400",
                              },
                              result.description,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "text-xs px-2 py-1 rounded-full bg-neutral-800/50 text-neutral-300 capitalize",
                            },
                            result.type,
                          ),
                        ),
                      ),
                    )
                  : !isSearching
                    ? /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "px-2 py-4 text-center",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-sm text-neutral-400",
                          },
                          "No results found",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-xs mt-1 text-neutral-500",
                          },
                          "Try different keywords",
                        ),
                      )
                    : /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "px-2 py-4 text-center",
                        },
                        /*#__PURE__*/ React.createElement("div", {
                          className:
                            "animate-spin w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full mx-auto",
                        }),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-xs mt-2 text-neutral-400",
                          },
                          "Searching...",
                        ),
                      ),
              ),
          ),
        ),
    ),
  );
}
