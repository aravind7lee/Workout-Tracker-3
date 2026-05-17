// frontend/src/components/MealInput.jsx
import { Egg, Drumstick, Salad, Banana, Apple, Soup, Fish, Milk, Zap, Search, Lightbulb, AlertTriangle } from 'lucide-react';
import React, { useState } from "react";
import { motion } from "framer-motion";


export default function MealInput({ onLookup, isLookingUp, error }) {
  const [query, setQuery] = useState("");
  const quickAddFoods = [
    {
      name: "2 eggs",
      emoji: /*#__PURE__*/ React.createElement(Egg, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    },
    {
      name: "chicken breast 100g",
      emoji: /*#__PURE__*/ React.createElement(Drumstick, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    },
    {
      name: "1 cup rice",
      emoji: /*#__PURE__*/ React.createElement(Salad, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    },
    {
      name: "banana",
      emoji: /*#__PURE__*/ React.createElement(Banana, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    },
    {
      name: "apple",
      emoji: /*#__PURE__*/ React.createElement(Apple, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    },
    {
      name: "1 cup oats",
      emoji: /*#__PURE__*/ React.createElement(Soup, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    },
    {
      name: "salmon 100g",
      emoji: /*#__PURE__*/ React.createElement(Fish, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    },
    {
      name: "greek yogurt",
      emoji: /*#__PURE__*/ React.createElement(Milk, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    },
  ];
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLookingUp) return;
    try {
      console.log("MealInput submitting query:", query.trim());
      await onLookup(query.trim());
      setQuery("");
    } catch (error) {
      console.error("MealInput lookup failed:", error);
    }
  };
  const quickAdd = async (foodName) => {
    if (isLookingUp) return;
    try {
      console.log("Quick add submitting:", foodName);
      await onLookup(foodName);
      setQuery("");
    } catch (error) {
      console.error("Quick add failed:", error);
      setQuery(foodName); // Fallback to setting query
    }
  };
  return /*#__PURE__*/ React.createElement(
    motion.div,
    {
      "data-meal-input": true,
      className:
        "relative overflow-hidden bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md border border-neutral-700/50 rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8 shadow-2xl hover:shadow-red-600/10 transition-all duration-300",
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
      whileHover: {
        scale: 1.01,
      },
    },
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-orange-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500",
    }),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative z-10",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "flex items-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 mb-3 sm:mb-4 md:mb-5 lg:mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-red-600 to-red-600 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/30",
          },
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "text-base sm:text-lg md:text-2xl lg:text-3xl",
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
            "h3",
            {
              className:
                "text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-black text-white mb-0.5 sm:mb-1 uppercase tracking-wide leading-none",
            },
            "Add Food",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className:
                "text-neutral-300 font-bold text-[10px] sm:text-xs md:text-sm lg:text-base",
            },
            "Track nutrition",
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mb-3 sm:mb-4 md:mb-5 lg:mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className:
              "text-xs sm:text-sm md:text-base lg:text-lg font-black text-white mb-2 sm:mb-2.5 md:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2 uppercase tracking-wide",
          },
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "text-orange-400",
            },
            /*#__PURE__*/ React.createElement(Zap, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          "Quick add:",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "grid grid-cols-2 xs:grid-cols-4 gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3",
          },
          quickAddFoods.map((food) =>
            /*#__PURE__*/ React.createElement(
              motion.button,
              {
                key: food.name,
                onClick: () => quickAdd(food.name),
                className:
                  "relative group overflow-hidden p-2 sm:p-2.5 md:p-3 lg:p-4 bg-gradient-to-r from-neutral-800/60 to-neutral-700/60 hover:from-green-600/30 hover:to-emerald-600/30 rounded-lg sm:rounded-xl text-white transition-all duration-300 flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 border border-neutral-500/30 hover:border-red-600/50 backdrop-blur-sm hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-600/30 shadow-lg hover:shadow-red-600/20",
                disabled: isLookingUp,
                whileHover: {
                  scale: 1.05,
                },
                whileTap: {
                  scale: 0.95,
                },
              },
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute inset-0 bg-gradient-to-br from-red-600/0 to-red-600/0 group-hover:from-red-600/10 group-hover:to-red-600/10 transition-all duration-300",
              }),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "relative text-base sm:text-lg md:text-xl lg:text-2xl",
                },
                food.emoji,
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "relative text-[9px] sm:text-[10px] md:text-xs lg:text-sm font-bold text-center leading-tight",
                },
                food.name,
              ),
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "form",
        {
          onSubmit: handleSubmit,
          className: "space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "relative",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "relative group",
            },
            /*#__PURE__*/ React.createElement("input", {
              type: "text",
              value: query,
              onChange: (e) => setQuery(e.target.value),
              placeholder:
                "Enter food with quantity (e.g., 'chicken 150g', '2 eggs')",
              className:
                "w-full p-2.5 sm:p-3 md:p-4 lg:p-5 pl-9 sm:pl-10 md:pl-12 lg:pl-14 pr-3 sm:pr-4 md:pr-5 lg:pr-6 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-r from-neutral-800/80 to-neutral-700/80 border border-neutral-500/50 text-white placeholder-neutral-400 text-xs sm:text-sm md:text-base lg:text-lg font-medium focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all duration-300 shadow-lg backdrop-blur-sm group-hover:shadow-red-600/10",
              id: "nutrition-search-input",
              disabled: isLookingUp,
              maxLength: 200,
            }),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "absolute left-2.5 sm:left-3 md:left-4 lg:left-5 top-1/2 transform -translate-y-1/2 text-red-500 text-sm sm:text-base md:text-lg lg:text-xl",
              },
              /*#__PURE__*/ React.createElement(Search, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-neutral-300 mt-1.5 sm:mt-2 md:mt-2.5 lg:mt-3 flex items-center gap-1 sm:gap-1.5 md:gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-red-500",
              },
              /*#__PURE__*/ React.createElement(Lightbulb, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "hidden sm:inline",
              },
              "Be specific with quantities for accurate data",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "sm:hidden",
              },
              "Be specific with quantities",
            ),
          ),
        ),
        error &&
          /*#__PURE__*/ React.createElement(
            motion.div,
            {
              initial: {
                opacity: 0,
                y: -10,
              },
              animate: {
                opacity: 1,
                y: 0,
              },
              className:
                "text-red-300 text-[10px] sm:text-xs md:text-sm bg-gradient-to-r from-red-600/20 to-red-700/20 p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-red-500/30 backdrop-blur-sm flex items-center gap-1.5 sm:gap-2 md:gap-3",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className:
                  "text-red-400 text-xs sm:text-sm md:text-base lg:text-lg",
              },
              /*#__PURE__*/ React.createElement(AlertTriangle, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            /*#__PURE__*/ React.createElement("span", null, error),
          ),
        /*#__PURE__*/ React.createElement(
          motion.button,
          {
            type: "submit",
            disabled: isLookingUp || !query.trim(),
            className:
              "relative group overflow-hidden w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black py-2.5 sm:py-3 md:py-4 lg:py-5 px-4 sm:px-6 md:px-8 rounded-lg sm:rounded-xl md:rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-600/30 shadow-2xl hover:shadow-red-600/20 text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-wider",
            whileHover: {
              scale: 1.02,
            },
            whileTap: {
              scale: 0.98,
            },
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700",
          }),
          isLookingUp
            ? /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "relative flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "animate-spin w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 border-2 border-white border-t-transparent rounded-full",
                }),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "hidden sm:inline",
                  },
                  "Analyzing...",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "sm:hidden",
                  },
                  "Wait...",
                ),
              )
            : /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "relative flex items-center justify-center gap-1.5 sm:gap-2 md:gap-3",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-sm sm:text-base md:text-lg lg:text-xl",
                  },
                  /*#__PURE__*/ React.createElement(Search, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "hidden xs:inline",
                  },
                  "Lookup",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "xs:hidden",
                  },
                  "Go",
                ),
              ),
        ),
      ),
    ),
  );
}
