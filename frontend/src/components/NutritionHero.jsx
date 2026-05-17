import { Salad } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import NutritionParticles from "./NutritionParticles";
import SkeletonLoader from "./SkeletonLoader";
import nutritionHeaderImg from "../assets/Nutritionheader.jpg";
import "../styles/nutrition-hero.css";


// LQIP base64 placeholder (tiny blurred version)
const LQIP_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";
export default function NutritionHero() {
  const { theme } = useTheme();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    // Preload image immediately
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      // Small delay for smooth transition
      setTimeout(() => setImageError(false), 50);
    };
    img.onerror = () => setImageError(true);
    img.src = nutritionHeaderImg;

    // Start loading immediately
    img.loading = "eager";
  }, []);

  // Professional overlay for maximum visual impact with stronger Light Mode overlay
  const overlayClasses =
    theme === "dark"
      ? "bg-gradient-to-t from-black/80 via-black/50 to-black/30"
      : "bg-gradient-to-t from-black/60 via-black/50 to-black/40";
  return /*#__PURE__*/ React.createElement(
    motion.div,
    {
      className:
        "nutrition-hero-container relative h-screen w-full overflow-hidden mb-6 sm:mb-8 shadow-xl sm:shadow-2xl",
      initial: {
        opacity: 0,
        y: 30,
      },
      animate: {
        opacity: 1,
        y: 0,
      },
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
      role: "banner",
      "aria-label": "Nutrition Tracker Hero Section",
      style: {
        backgroundColor: theme === "dark" ? "#1a1a1a" : "#f8fafc",
      },
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "absolute inset-0",
      },
      /*#__PURE__*/ React.createElement("img", {
        src: LQIP_PLACEHOLDER,
        alt: "",
        className:
          "w-full h-full object-cover blur-sm transition-opacity duration-300",
        style: {
          opacity: imageLoaded ? 0 : 1,
        },
      }),
      /*#__PURE__*/ React.createElement(motion.img, {
        src: nutritionHeaderImg,
        alt: "Professional nutrition tracking and meal planning - healthy foods and fitness lifestyle",
        className: "nutrition-hero-image w-full h-full absolute inset-0",
        initial: {
          opacity: 0,
        },
        animate: {
          opacity: imageLoaded ? 1 : 0,
        },
        transition: {
          duration: 0.8,
          ease: "easeOut",
        },
        loading: "eager",
        decoding: "async",
        fetchPriority: "high",
        sizes: "100vw",
        style: {
          objectFit: "cover",
          objectPosition: "center center",
          width: "100%",
          height: "100%",
        },
      }),
      imageError &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "w-full h-full bg-gradient-to-br from-green-600 via-red-700 to-red-800 flex items-center justify-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-white text-6xl",
            },
            /*#__PURE__*/ React.createElement(Salad, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
        ),
    ),
    imageLoaded &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "absolute inset-0 opacity-40",
        },
        /*#__PURE__*/ React.createElement(NutritionParticles, null),
      ),
    /*#__PURE__*/ React.createElement("div", {
      className: "absolute inset-0",
      style: {
        background:
          theme === "light"
            ? "rgba(0,0,0,0.45)"
            : "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.5) 35%, rgba(0,0,0,0.3) 100%)",
      },
    }),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "absolute inset-0 flex items-center justify-center",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto",
        },
        /*#__PURE__*/ React.createElement(
          motion.h1,
          {
            className:
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 sm:mb-4 leading-tight nutrition-hero-title preserve-color bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent",
            initial: {
              opacity: 0,
              y: 50,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            transition: {
              duration: 0.8,
              delay: 0.3,
            },
            style: {
              fontWeight: "900",
              backgroundImage:
                "linear-gradient(to right, #4ade80, #10b981, #059669)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
            },
          },
          "Nutrition Tracker",
        ),
        /*#__PURE__*/ React.createElement(
          motion.p,
          {
            className:
              "text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 leading-relaxed font-medium max-w-3xl mx-auto nutrition-hero-subtitle",
            initial: {
              opacity: 0,
              y: 30,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            transition: {
              duration: 0.8,
              delay: 0.5,
            },
            style: {
              color: theme === "light" ? "#374151" : "#CCCCCC",
              textShadow: "none",
              fontWeight: theme === "light" ? "700" : "500",
            },
          },
          "Transform your fitness journey with precision nutrition tracking",
          /*#__PURE__*/ React.createElement("br", {
            className: "hidden sm:block",
          }),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "nutrition-hero-accent",
              style: {
                color: theme === "light" ? "#4B5563" : "#AAAAAA",
                fontWeight: theme === "light" ? "600" : "500",
              },
            },
            "Real-time insights",
          ),
          " \u2022 ",
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "nutrition-hero-accent",
              style: {
                color: theme === "light" ? "#4B5563" : "#AAAAAA",
                fontWeight: theme === "light" ? "600" : "500",
              },
            },
            "Smart goals",
          ),
          " \u2022 ",
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "nutrition-hero-accent",
              style: {
                color: theme === "light" ? "#4B5563" : "#AAAAAA",
                fontWeight: theme === "light" ? "600" : "500",
              },
            },
            "Professional results",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            className:
              "flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center",
            initial: {
              opacity: 0,
              y: 20,
            },
            animate: {
              opacity: 1,
              y: 0,
            },
            transition: {
              duration: 0.8,
              delay: 0.7,
            },
          },
          /*#__PURE__*/ React.createElement(
            motion.button,
            {
              whileHover: {
                scale: 1.04,
                y: -2,
              },
              whileTap: {
                scale: 0.97,
              },
              onClick: () => {
                const mealInput = document.querySelector("[data-meal-input]");
                if (mealInput) {
                  mealInput.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  setTimeout(() => {
                    const input = mealInput.querySelector("input");
                    if (input) input.focus();
                  }, 500);
                }
              },
              "aria-label": "Start tracking your nutrition now",
              className:
                "premium-btn-primary btn-primary preserve-color nutrition-hero-btn",
            },
            "Start Tracking",
            /*#__PURE__*/ React.createElement(
              "svg",
              {
                width: "13",
                height: "13",
                viewBox: "0 0 13 13",
                fill: "none",
                "aria-hidden": "true",
              },
              /*#__PURE__*/ React.createElement("path", {
                d: "M1 6.5h11M7 1l5 5.5-5 5.5",
                stroke: "currentColor",
                strokeWidth: "2",
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            motion.button,
            {
              whileHover: {
                scale: 1.04,
                y: -2,
              },
              whileTap: {
                scale: 0.97,
              },
              onClick: () => {
                const progressSection = document.querySelector(
                  "[data-progress-section]",
                );
                if (progressSection) {
                  progressSection.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                } else {
                  window.scrollTo({
                    top: window.innerHeight,
                    behavior: "smooth",
                  });
                }
              },
              "aria-label": "Learn more about nutrition tracking features",
              className:
                "premium-btn-secondary btn-secondary preserve-color nutrition-hero-btn",
            },
            "Learn More",
          ),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute bottom-0 left-0 right-0 h-20 sm:h-24 lg:h-32 bg-gradient-to-t from-light-bg-primary dark:from-dark-bg-primary to-transparent",
    }),
  );
}
