// Simple Exercise Library - Fallback Version
import { Rocket, Dumbbell, Search, Zap, Tag, BicepsFlexed, Target, Star, BarChart3, Trash2, ClipboardList, CheckCircle2, AlertTriangle, Wind, Video, Eye, Plus, Edit, Activity, Trophy, Bomb } from 'lucide-react';
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";
import { exerciseLibrary } from "../data/exerciseLibrary";
import { onlineService } from "../services/onlineService";
import { getFormTips } from "../data/exerciseFormTips";
import { getExerciseVideo } from "../data/exerciseVideos";
import QuickPlanModal from "../components/QuickPlanModal";
import AddToExistingPlanModal from "../components/AddToExistingPlanModal";
import WorkoutSuccessNotification from "../components/WorkoutSuccessNotification";
import LibraryHeaderImg from "../assets/Libraryheader.jpg";
import Library1 from "../assets/Library1.jpg";
import Library2 from "../assets/Library2.jpg";
import Library4 from "../assets/Library4.jpg";
import Library5 from "../assets/Library5.jpg";
import Library6 from "../assets/Library6.jpg";
import Library7 from "../assets/Library7.jpg";
import Library8 from "../assets/Library8.jpg";
import Library11 from "../assets/Library11.jpg";
import "../styles/shimmer.css";
import "../styles/library-header.css";
import "../styles/exercise-gallery.css";
import "../styles/performance-optimizations.css";
import "../styles/hero-semantic-tokens.css";


export default function LibrarySimple() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isOnline: realTimeOnline } = useRealTime();
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(navbarSearch);
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    muscle: "",
  });

  // Basic states
  const [isOnline, setIsOnline] = useState(realTimeOnline);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(null);

  // Hero image states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // LQIP (Low Quality Image Placeholder)
  const LIBRARY_LQIP =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

  // Minimal animations for maximum performance
  const fadeIn = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.15,
      },
    },
  };

  // Debounce search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Update search when navbar search parameter changes
  useEffect(() => {
    if (navbarSearch && navbarSearch !== searchQuery) {
      setSearchQuery(navbarSearch);
    }
  }, [navbarSearch]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showQuickPlan, setShowQuickPlan] = useState(null);
  const [showAddToExisting, setShowAddToExisting] = useState(null);
  const [expandedFormTips, setExpandedFormTips] = useState({});

  // Optimized image preloading
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = LibraryHeaderImg;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  // Update online status from real-time context
  useEffect(() => {
    setIsOnline(realTimeOnline);
  }, [realTimeOnline]);

  // Simple data fetching
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        console.log(
          "🚀 Exercise Library initialized in",
          isOnline ? "ONLINE" : "OFFLINE",
          "MODE",
        );
        if (isOnline && user) {
          // Fetch basic user progress
          const analytics = await onlineService.getAnalytics();
          if (analytics) {
            setUserProgress(analytics);
          }
          setLastSync(new Date());
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, [user, isOnline]);

  // Handle workout completion message
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted) {
      // Show success message
      const message = workoutState.savedOffline
        ? `${workoutState.exercise} completed! (Saved offline)`
        : `${workoutState.exercise} completed in ${workoutState.duration}!`;
      setShowSuccessNotification(message);

      // Clear the state
      navigate(location.pathname, {
        replace: true,
      });
    }
  }, [location.state, navigate, location.pathname]);

  // Flatten all exercises from all muscle groups
  const allExercises = useMemo(() => {
    const exercises = [];
    Object.entries(exerciseLibrary).forEach(([muscleKey, muscleGroup]) => {
      muscleGroup.exercises.forEach((exercise) => {
        exercises.push({
          ...exercise,
          category: muscleGroup.name,
          muscle: muscleGroup.name,
          icon: muscleGroup.icon,
          color: muscleGroup.color,
        });
      });
    });
    return exercises;
  }, []);

  // Optimized filtering with early returns
  const filteredExercises = useMemo(() => {
    const query = debouncedSearch.toLowerCase();
    return allExercises.filter((exercise) => {
      if (filters.category && exercise.category !== filters.category)
        return false;
      if (filters.difficulty && exercise.difficulty !== filters.difficulty)
        return false;
      if (filters.muscle && exercise.muscle !== filters.muscle) return false;
      if (
        query &&
        !exercise.name.toLowerCase().includes(query) &&
        !exercise.type.toLowerCase().includes(query) &&
        !exercise.category.toLowerCase().includes(query)
      )
        return false;
      return true;
    });
  }, [allExercises, debouncedSearch, filters]);

  // Get unique values for filters
  const categories = [...new Set(allExercises.map((ex) => ex.category))];
  const difficulties = ["beginner", "intermediate", "advanced"];
  const muscles = [...new Set(allExercises.map((ex) => ex.muscle))];
  const handleQuickPlan = (exercise) => {
    setShowQuickPlan(exercise);
  };
  const handlePlanSaved = (savedPlan) => {
    setTimeout(() => {
      navigate("/my-plans?highlight=" + savedPlan.id);
    }, 500);
  };
  const handleAddToExisting = (exercise) => {
    setShowAddToExisting(exercise);
  };

  // Simple exercise tracking
  const trackExerciseView = (exercise) => {
    // Navigate directly to StartWorkout component
    navigate("/start-workout", {
      state: {
        selectedExercise: exercise,
        fromLibrary: true,
      },
    });
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden",
      style: {
        scrollBehavior: "smooth",
      },
    },
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent",
    }),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent",
    }),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent",
    }),
    /*#__PURE__*/ React.createElement(
      motion.div,
      {
        className:
          "relative w-full h-screen min-h-screen overflow-hidden hero-image-container",
        initial: {
          opacity: 0,
        },
        animate: {
          opacity: 1,
        },
        transition: {
          duration: 0.6,
        },
        role: "banner",
        "aria-label": "Exercise Library Hero Section",
      },
      !imageLoaded && !imageError
        ? /*#__PURE__*/
          // Optimized skeleton
          React.createElement(
            "div",
            {
              className:
                "w-full h-full bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 relative overflow-hidden",
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer",
            }),
          )
        : imageError
          ? /*#__PURE__*/
            // Fallback content if image fails to load
            React.createElement(
              motion.div,
              {
                className:
                  "w-full h-full bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center",
                initial: {
                  opacity: 0,
                  y: 12,
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
                  className: "text-center text-white px-4",
                },
                /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    className: "text-6xl mb-4",
                    initial: {
                      scale: 0.8,
                      opacity: 0,
                    },
                    animate: {
                      scale: 1,
                      opacity: 1,
                    },
                    transition: {
                      delay: 0.2,
                      duration: 0.5,
                    },
                  },
                  /*#__PURE__*/ React.createElement(Dumbbell, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  motion.h1,
                  {
                    className:
                      "text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl",
                    initial: {
                      y: 20,
                      opacity: 0,
                    },
                    animate: {
                      y: 0,
                      opacity: 1,
                    },
                    transition: {
                      delay: 0.3,
                      duration: 0.6,
                    },
                  },
                  "Exercise Library",
                ),
                /*#__PURE__*/ React.createElement(
                  motion.p,
                  {
                    className:
                      "text-lg md:text-xl opacity-90 max-w-2xl mx-auto drop-shadow-lg",
                    initial: {
                      y: 20,
                      opacity: 0,
                    },
                    animate: {
                      y: 0,
                      opacity: 1,
                    },
                    transition: {
                      delay: 0.4,
                      duration: 0.6,
                    },
                  },
                  "Browse, track, and customize your exercises with ease.",
                ),
              ),
            )
          : /*#__PURE__*/ React.createElement(
              React.Fragment,
              null,
              /*#__PURE__*/ React.createElement("img", {
                src: LIBRARY_LQIP,
                alt: "",
                className:
                  "w-full h-full object-cover blur-sm transition-opacity duration-300",
                style: {
                  opacity: imageLoaded ? 0 : 1,
                },
              }),
              /*#__PURE__*/ React.createElement(motion.img, {
                src: LibraryHeaderImg,
                srcSet: `
                ${LibraryHeaderImg} 1440w,
                ${LibraryHeaderImg} 1024w,
                ${LibraryHeaderImg} 768w,
                ${LibraryHeaderImg} 480w
              `,
                sizes:
                  "\r (max-width: 480px) 480px,\r (max-width: 768px) 768px,\r (max-width: 1024px) 1024px,\r 1440px\r ",
                alt: "Exercise Library header \u2013 gym workout background",
                className: "library-hero-image absolute inset-0",
                loading: "eager",
                decoding: "async",
                fetchPriority: "high",
                width: "1440",
                height: "480",
                initial: {
                  opacity: 0,
                  scale: 0.995,
                },
                animate: {
                  opacity: imageLoaded ? 1 : 0,
                  scale: imageLoaded ? 1 : 0.995,
                },
                transition: {
                  duration: 0.4,
                  ease: "easeOut",
                },
              }),
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute inset-0 hero-overlay-dark dark:hero-overlay-dark light:hero-overlay-light",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute inset-0 flex items-center justify-center",
                },
                /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    className:
                      "text-center text-white px-4 sm:px-6 max-w-4xl mx-auto",
                    initial: "hidden",
                    animate: imageLoaded ? "visible" : "hidden",
                    variants: fadeIn,
                  },
                  /*#__PURE__*/ React.createElement(
                    motion.h1,
                    {
                      className:
                        "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 hero-text-contrast leading-tight",
                      style: {
                        color: "#f59e0b",
                      },
                      initial: {
                        opacity: 0,
                        y: 30,
                      },
                      animate: imageLoaded
                        ? {
                            opacity: 1,
                            y: 0,
                          }
                        : {
                            opacity: 0,
                            y: 30,
                          },
                      transition: {
                        duration: 0.8,
                        delay: 0.3,
                      },
                    },
                    "Exercise Library",
                  ),
                  /*#__PURE__*/ React.createElement(
                    motion.p,
                    {
                      className:
                        "text-sm sm:text-base md:text-lg lg:text-xl hero-text-contrast max-w-2xl mx-auto font-medium leading-relaxed px-2",
                      initial: {
                        opacity: 0,
                        y: 20,
                      },
                      animate: imageLoaded
                        ? {
                            opacity: 1,
                            y: 0,
                          }
                        : {
                            opacity: 0,
                            y: 20,
                          },
                      transition: {
                        duration: 0.8,
                        delay: 0.5,
                      },
                    },
                    "Browse, track, and customize your exercises with ease.",
                  ),
                  /*#__PURE__*/ React.createElement(
                    motion.div,
                    {
                      className:
                        "mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center",
                      initial: {
                        opacity: 0,
                        y: 20,
                      },
                      animate: imageLoaded
                        ? {
                            opacity: 1,
                            y: 0,
                          }
                        : {
                            opacity: 0,
                            y: 20,
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
                        onClick: () =>
                          document
                            .getElementById("exercise-grid")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            }),
                        className:
                          "premium-btn-primary btn-primary preserve-color",
                      },
                      "Explore Exercises",
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
                        onClick: () =>
                          document
                            .getElementById("search-filters")
                            ?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            }),
                        className:
                          "premium-btn-secondary btn-secondary preserve-color",
                      },
                      "Start Training",
                    ),
                  ),
                ),
              ),
            ),
    ),
    /*#__PURE__*/ React.createElement(
      "section",
      {
        className:
          "py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-neutral-900 to-black",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "max-w-7xl mx-auto",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center mb-12 sm:mb-16",
          },
          /*#__PURE__*/ React.createElement(
            "h2",
            {
              className:
                "text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4",
            },
            "Exercise Categories",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className:
                "text-sm sm:text-base md:text-lg text-neutral-300 max-w-3xl mx-auto leading-relaxed px-4",
            },
            "Discover powerful features designed to transform your fitness journey with precision tracking, smart insights, and personalized recommendations.",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8",
          },
          [
            {
              image: Library1,
              title: "Strength Training",
              subtitle: "Build Raw Power",
              description: "Compound movements for maximum strength gains",
              category: "strength",
            },
            {
              image: Library2,
              title: "Muscle Building",
              subtitle: "Mass & Definition",
              description: "Hypertrophy training for maximum muscle growth",
              category: "muscle",
            },
            {
              image: Library4,
              title: "Functional Fitness",
              subtitle: "Real-World Movement",
              description: "Practical exercises for daily performance",
              category: "functional",
            },
            {
              image: Library5,
              title: "Flexibility & Mobility",
              subtitle: "Recovery & Movement",
              description: "Enhance range of motion and recovery",
              category: "flexibility",
            },
            {
              image: Library6,
              title: "Heavy Lifting",
              subtitle: "Elite Technique",
              description: "Advanced lifting techniques and form",
              category: "lifting",
            },
            {
              image: Library7,
              title: "Bodyweight Training",
              subtitle: "No Equipment Needed",
              description: "Master your bodyweight movements",
              category: "bodyweight",
            },
            {
              image: Library8,
              title: "Sports Performance",
              subtitle: "Athletic Excellence",
              description: "Sport-specific training protocols",
              category: "sports",
            },
            {
              image: Library11,
              title: "Power Training",
              subtitle: "Explosive Movement",
              description: "Develop explosive power and athletic performance",
              category: "power",
            },
          ].map((item, index) =>
            /*#__PURE__*/ React.createElement(ExerciseCard, {
              key: index,
              image: item.image,
              title: item.title,
              subtitle: item.subtitle,
              description: item.description,
              category: item.category,
              index: index,
            }),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center mt-12 sm:mt-16",
          },
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => {
                const exerciseGrid = document.getElementById("exercise-grid");
                if (exerciseGrid) {
                  exerciseGrid.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                  setTimeout(() => {
                    const searchInput = document.querySelector(
                      'input[placeholder*="Search exercises"]',
                    );
                    if (searchInput) searchInput.focus();
                  }, 500);
                }
              },
              className:
                "px-8 py-4 bg-gradient-to-r from-red-700 to-red-800 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-red-600/50",
            },
            "Start Your Exercise Journey",
          ),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative z-10 pt-12 pb-12",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "container mx-auto px-4 max-w-7xl space-y-8 sm:space-y-12",
        },
        /*#__PURE__*/ React.createElement("div", {
          className:
            "absolute top-20 left-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl animate-pulse",
        }),
        /*#__PURE__*/ React.createElement("div", {
          className:
            "absolute top-40 right-20 w-32 h-32 bg-red-600/10 rounded-full blur-2xl animate-pulse",
          style: {
            animationDelay: "1s",
          },
        }),
        /*#__PURE__*/ React.createElement("div", {
          className:
            "absolute bottom-40 left-1/4 w-24 h-24 bg-red-700/10 rounded-full blur-xl animate-pulse",
          style: {
            animationDelay: "2s",
          },
        }),
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            id: "search-filters",
            className: "mb-6 sm:mb-8 space-y-4 sm:space-y-6",
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
              className: "relative max-w-3xl mx-auto px-2 sm:px-0",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative group",
              },
              /*#__PURE__*/ React.createElement("input", {
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className:
                  "w-full p-3 sm:p-4 md:p-5 pl-12 sm:pl-14 md:pl-16 pr-10 sm:pr-12 rounded-xl sm:rounded-2xl bg-gradient-to-r from-neutral-900/80 to-neutral-800/80 border-2 border-neutral-700/50 text-white placeholder-neutral-300 text-sm sm:text-base md:text-lg font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 shadow-2xl backdrop-blur-sm group-hover:shadow-orange-500/10",
                placeholder:
                  "Search exercises by name, type, or muscle group...",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute left-3 sm:left-4 md:left-6 top-1/2 transform -translate-y-1/2 text-orange-400 text-lg sm:text-xl",
                },
                /*#__PURE__*/ React.createElement(Search, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-white text-xs sm:text-sm font-bold",
                    },
                    /*#__PURE__*/ React.createElement(Zap, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto px-2 sm:px-0",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative group",
              },
              /*#__PURE__*/ React.createElement(
                "select",
                {
                  value: filters.category,
                  onChange: (e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value,
                    })),
                  className:
                    "w-full p-3 sm:p-4 pl-10 sm:pl-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-neutral-900/90 to-neutral-800/90 border-2 border-neutral-700/50 text-white text-sm sm:text-base font-medium focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all duration-300 shadow-lg appearance-none cursor-pointer hover:shadow-red-600/10",
                },
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "",
                  },
                  "All Categories",
                ),
                categories.map((cat) =>
                  /*#__PURE__*/ React.createElement(
                    "option",
                    {
                      key: cat,
                      value: cat,
                    },
                    cat,
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-red-500 text-sm sm:text-lg pointer-events-none",
                },
                /*#__PURE__*/ React.createElement(Tag, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none text-xs sm:text-sm",
                },
                "\u25BC",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative group",
              },
              /*#__PURE__*/ React.createElement(
                "select",
                {
                  value: filters.difficulty,
                  onChange: (e) =>
                    setFilters((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    })),
                  className:
                    "w-full p-3 sm:p-4 pl-10 sm:pl-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-neutral-900/90 to-neutral-800/90 border-2 border-neutral-700/50 text-white text-sm sm:text-base font-medium focus:border-red-700 focus:ring-2 focus:ring-red-700/20 transition-all duration-300 shadow-lg appearance-none cursor-pointer hover:shadow-red-700/10",
                },
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "",
                  },
                  "All Difficulties",
                ),
                difficulties.map((diff) =>
                  /*#__PURE__*/ React.createElement(
                    "option",
                    {
                      key: diff,
                      value: diff,
                    },
                    diff.charAt(0).toUpperCase() + diff.slice(1),
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-red-600 text-sm sm:text-lg pointer-events-none",
                },
                /*#__PURE__*/ React.createElement(Zap, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none text-xs sm:text-sm",
                },
                "\u25BC",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative group sm:col-span-2 lg:col-span-1",
              },
              /*#__PURE__*/ React.createElement(
                "select",
                {
                  value: filters.muscle,
                  onChange: (e) =>
                    setFilters((prev) => ({
                      ...prev,
                      muscle: e.target.value,
                    })),
                  className:
                    "w-full p-3 sm:p-4 pl-10 sm:pl-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-neutral-900/90 to-neutral-800/90 border-2 border-neutral-700/50 text-white text-sm sm:text-base font-medium focus:border-red-600 focus:ring-2 focus:ring-red-600/20 transition-all duration-300 shadow-lg appearance-none cursor-pointer hover:shadow-red-600/10",
                },
                /*#__PURE__*/ React.createElement(
                  "option",
                  {
                    value: "",
                  },
                  "All Muscles",
                ),
                muscles.map((muscle) =>
                  /*#__PURE__*/ React.createElement(
                    "option",
                    {
                      key: muscle,
                      value: muscle,
                    },
                    muscle,
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-red-500 text-sm sm:text-lg pointer-events-none",
                },
                /*#__PURE__*/ React.createElement(BicepsFlexed, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 pointer-events-none text-xs sm:text-sm",
                },
                "\u25BC",
              ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 px-2 sm:px-0",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-700/20 to-blue-800/20 border border-red-600/30 backdrop-blur-sm p-3 sm:p-4 md:p-6 text-center group hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-red-600/20",
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
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
                    "text-xl sm:text-2xl md:text-3xl font-black text-red-500 mb-1",
                },
                allExercises.length,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs sm:text-sm font-semibold text-neutral-300",
                },
                "Total Exercises",
              ),
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute top-2 sm:top-3 right-2 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "mt-1 sm:mt-2 text-xs text-blue-300 font-medium",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "hidden sm:inline",
                  },
                  /*#__PURE__*/ React.createElement(BicepsFlexed, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " READY TO TRAIN",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "sm:hidden",
                  },
                  /*#__PURE__*/ React.createElement(BicepsFlexed, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " READY",
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-red-600/30 backdrop-blur-sm p-3 sm:p-4 md:p-6 text-center group hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-red-600/20",
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
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
                    "text-xl sm:text-2xl md:text-3xl font-black text-red-500 mb-1",
                },
                categories.length,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs sm:text-sm font-semibold text-neutral-300",
                },
                "Muscle Groups",
              ),
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute top-2 sm:top-3 right-2 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "mt-1 sm:mt-2 text-xs text-green-300 font-medium",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "hidden sm:inline",
                  },
                  /*#__PURE__*/ React.createElement(Target, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " TARGET ZONES",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "sm:hidden",
                  },
                  /*#__PURE__*/ React.createElement(Target, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " ZONES",
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-800/20 to-purple-800/20 border border-red-700/30 backdrop-blur-sm p-3 sm:p-4 md:p-6 text-center group hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-red-700/20",
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute inset-0 bg-gradient-to-br from-red-700/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
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
                    "text-xl sm:text-2xl md:text-3xl font-black text-red-600 mb-1",
                },
                filteredExercises.length,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs sm:text-sm font-semibold text-neutral-300",
                },
                "Filtered Results",
              ),
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute top-2 sm:top-3 right-2 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "mt-1 sm:mt-2 text-xs text-purple-300 font-medium",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "hidden sm:inline",
                  },
                  /*#__PURE__*/ React.createElement(Star, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " ACTIVE FILTER",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "sm:hidden",
                  },
                  /*#__PURE__*/ React.createElement(Star, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " FILTER",
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 backdrop-blur-sm p-3 sm:p-4 md:p-6 text-center group hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-orange-500/20",
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
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
                    "text-xl sm:text-2xl md:text-3xl font-black text-orange-400 mb-1",
                },
                difficulties.length,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs sm:text-sm font-semibold text-neutral-300",
                },
                "Difficulty Levels",
              ),
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute top-2 sm:top-3 right-2 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "mt-1 sm:mt-2 text-xs text-orange-300 font-medium",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "hidden sm:inline",
                  },
                  /*#__PURE__*/ React.createElement(Zap, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " CHALLENGE MODES",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "sm:hidden",
                  },
                  /*#__PURE__*/ React.createElement(Zap, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " MODES",
                ),
              ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-neutral-900/60 to-neutral-800/60 border border-neutral-700/50 backdrop-blur-sm mx-2 sm:mx-0",
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
                  "w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-600 to-red-600 rounded-lg sm:rounded-xl flex items-center justify-center",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-white font-bold text-sm sm:text-lg",
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
                "div",
                {
                  className:
                    "text-white font-semibold text-sm sm:text-base md:text-lg",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "hidden sm:inline",
                  },
                  "Showing ",
                  filteredExercises.length,
                  " of ",
                  allExercises.length,
                  " exercises",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "sm:hidden",
                  },
                  filteredExercises.length,
                  " of ",
                  allExercises.length,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center gap-1 sm:gap-2 text-xs sm:text-sm",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
                }),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-red-500 font-medium",
                  },
                  "LIVE RESULTS",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-neutral-400",
                  },
                  "\u2022",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-neutral-300 hidden sm:inline",
                  },
                  "Real-time filtering",
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-neutral-300 sm:hidden",
                  },
                  "Live",
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => {
                setSearchQuery("");
                setFilters({
                  category: "",
                  difficulty: "",
                  muscle: "",
                });
              },
              className:
                "px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 shadow-lg hover:shadow-red-500/20 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/30 text-sm sm:text-base",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "hidden sm:inline",
              },
              /*#__PURE__*/ React.createElement(Trash2, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Clear Filters",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "sm:hidden",
              },
              /*#__PURE__*/ React.createElement(Trash2, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Clear",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            id: "exercise-grid",
            className:
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
          },
          filteredExercises.length === 0
            ? /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "col-span-full text-center py-12 sm:py-16 animate-fadeIn",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "max-w-md mx-auto",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-8xl mb-6",
                    },
                    /*#__PURE__*/ React.createElement(Search, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "bg-gradient-to-br from-neutral-900/80 to-neutral-800/80 rounded-2xl p-8 border border-neutral-700/50 backdrop-blur-sm",
                    },
                    /*#__PURE__*/ React.createElement(
                      "h3",
                      {
                        className: "text-2xl font-bold text-white mb-3",
                      },
                      "No exercises found",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "p",
                      {
                        className: "text-neutral-300 mb-6 leading-relaxed",
                      },
                      "We couldn't find any exercises matching your criteria. Try adjusting your search terms or filters to discover more workouts.",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "space-y-3",
                      },
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => {
                            setSearchQuery("");
                            setFilters({
                              category: "",
                              difficulty: "",
                              muscle: "",
                            });
                          },
                          className:
                            "w-full p-4 bg-gradient-to-r from-red-700 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-600/30 shadow-lg hover:shadow-red-600/20",
                        },
                        /*#__PURE__*/ React.createElement(Trash2, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                        " Clear All Filters",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-sm text-neutral-400",
                        },
                        "Or try searching for: ",
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-blue-300 font-medium",
                          },
                          '"push ups"',
                        ),
                        ", ",
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-green-300 font-medium",
                          },
                          '"chest"',
                        ),
                        ", ",
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-purple-300 font-medium",
                          },
                          '"beginner"',
                        ),
                      ),
                    ),
                  ),
                ),
              )
            : filteredExercises.map((exercise) =>
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    key: exercise.id,
                    className:
                      "relative group overflow-hidden rounded-xl bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border border-neutral-700/50 hover:border-orange-500/50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-1",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className:
                      "absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                  }),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "relative z-10 p-4 sm:p-6",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: `w-10 h-10 sm:w-12 sm:h-12 ${exercise.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-150`,
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-xl sm:text-2xl md:text-3xl",
                          },
                          exercise.icon,
                        ),
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
                              "font-bold text-white text-base sm:text-lg mb-1 group-hover:text-orange-300 transition-colors duration-150 leading-tight",
                          },
                          exercise.name,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex items-center gap-1 sm:gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "text-xs sm:text-sm font-medium text-neutral-300",
                            },
                            exercise.category,
                          ),
                          /*#__PURE__*/ React.createElement("div", {
                            className: "w-1 h-1 bg-neutral-500 rounded-full",
                          }),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "text-xs text-neutral-400 uppercase tracking-wide",
                            },
                            "Exercise",
                          ),
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "space-y-3 sm:space-y-4 mb-4 sm:mb-6",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center justify-between p-2 sm:p-3 bg-neutral-800/30 rounded-lg sm:rounded-xl border border-neutral-700/30",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex items-center gap-1 sm:gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-orange-400 text-xs sm:text-sm",
                            },
                            /*#__PURE__*/ React.createElement(Target, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "text-xs sm:text-sm font-medium text-neutral-300",
                            },
                            "Sets/Reps:",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className:
                              "text-xs sm:text-sm font-bold text-white bg-orange-500/20 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg",
                          },
                          exercise.sets,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center justify-between p-2 sm:p-3 bg-neutral-800/30 rounded-lg sm:rounded-xl border border-neutral-700/30",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex items-center gap-1 sm:gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-500 text-xs sm:text-sm",
                            },
                            /*#__PURE__*/ React.createElement(Zap, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "text-xs sm:text-sm font-medium text-neutral-300",
                            },
                            "Type:",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: `text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg font-semibold uppercase tracking-wide ${exercise.type === "compound" ? "bg-red-700/30 text-blue-300 border border-red-600/30" : exercise.type === "isolation" ? "bg-red-800/30 text-purple-300 border border-red-700/30" : "bg-green-600/30 text-green-300 border border-red-600/30"}`,
                          },
                          exercise.type,
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "flex items-center justify-between p-2 sm:p-3 bg-neutral-800/30 rounded-lg sm:rounded-xl border border-neutral-700/30",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex items-center gap-1 sm:gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-600 text-xs sm:text-sm",
                            },
                            /*#__PURE__*/ React.createElement(Star, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "text-xs sm:text-sm font-medium text-neutral-300",
                            },
                            "Difficulty:",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: `text-xs px-2 sm:px-3 py-1 sm:py-2 rounded-md sm:rounded-lg font-semibold uppercase tracking-wide ${exercise.difficulty === "beginner" ? "bg-green-600/30 text-green-300 border border-red-600/30" : exercise.difficulty === "intermediate" ? "bg-yellow-600/30 text-yellow-300 border border-yellow-500/30" : "bg-red-600/30 text-red-300 border border-red-500/30"}`,
                          },
                          exercise.difficulty,
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "mb-4 sm:mb-6",
                      },
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () =>
                            setExpandedFormTips((prev) => ({
                              ...prev,
                              [exercise.id]: !prev[exercise.id],
                            })),
                          className:
                            "w-full flex items-center justify-between p-3 bg-gradient-to-r from-red-700/20 to-red-800/20 hover:from-red-700/30 hover:to-red-800/30 rounded-lg border border-red-600/30 transition-colors duration-150",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className:
                              "text-xs sm:text-sm font-semibold text-blue-300 flex items-center gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-base",
                            },
                            /*#__PURE__*/ React.createElement(ClipboardList, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "hidden sm:inline",
                            },
                            "Form Tips & Technique",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "sm:hidden",
                            },
                            "Form Tips",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: `text-blue-300 text-base transition-transform duration-150 ${expandedFormTips[exercise.id] ? "rotate-180" : "rotate-0"}`,
                          },
                          "\u25BC",
                        ),
                      ),
                      expandedFormTips[exercise.id] &&
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "mt-2 p-3 bg-neutral-900/50 rounded-lg border border-neutral-700/50 space-y-3 animate-fadeIn",
                          },
                          (() => {
                            const tips = getFormTips(exercise.name);
                            return /*#__PURE__*/ React.createElement(
                              React.Fragment,
                              null,
                              /*#__PURE__*/ React.createElement(
                                "div",
                                null,
                                /*#__PURE__*/ React.createElement(
                                  "h4",
                                  {
                                    className:
                                      "text-xs font-semibold text-green-300 mb-2 flex items-center gap-1",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    CheckCircle2,
                                    {
                                      className: "w-[1em] h-[1em] inline-block",
                                    },
                                  ),
                                  " Proper Form",
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "ul",
                                  {
                                    className: "space-y-1",
                                  },
                                  tips.formTips.slice(0, 3).map((tip, index) =>
                                    /*#__PURE__*/ React.createElement(
                                      "li",
                                      {
                                        key: index,
                                        className:
                                          "text-xs text-neutral-300 flex items-start gap-2",
                                      },
                                      /*#__PURE__*/ React.createElement(
                                        "span",
                                        {
                                          className: "text-red-500 mt-0.5",
                                        },
                                        "\u2022",
                                      ),
                                      /*#__PURE__*/ React.createElement(
                                        "span",
                                        null,
                                        tip,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "div",
                                null,
                                /*#__PURE__*/ React.createElement(
                                  "h4",
                                  {
                                    className:
                                      "text-xs font-semibold text-red-300 mb-2 flex items-center gap-1",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    AlertTriangle,
                                    {
                                      className: "w-[1em] h-[1em] inline-block",
                                    },
                                  ),
                                  " Avoid These",
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "ul",
                                  {
                                    className: "space-y-1",
                                  },
                                  tips.commonMistakes
                                    .slice(0, 2)
                                    .map((mistake, index) =>
                                      /*#__PURE__*/ React.createElement(
                                        "li",
                                        {
                                          key: index,
                                          className:
                                            "text-xs text-neutral-300 flex items-start gap-2",
                                        },
                                        /*#__PURE__*/ React.createElement(
                                          "span",
                                          {
                                            className: "text-red-400 mt-0.5",
                                          },
                                          "\u2022",
                                        ),
                                        /*#__PURE__*/ React.createElement(
                                          "span",
                                          null,
                                          mistake,
                                        ),
                                      ),
                                    ),
                                ),
                              ),
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className:
                                    "pt-2 border-t border-neutral-700/50",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "p",
                                  {
                                    className:
                                      "text-xs text-blue-300 font-medium flex items-center gap-1",
                                  },
                                  /*#__PURE__*/ React.createElement(Wind, {
                                    className: "w-[1em] h-[1em] inline-block",
                                  }),
                                  " ",
                                  tips.breathingTip,
                                ),
                              ),
                            );
                          })(),
                        ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "space-y-2 sm:space-y-3",
                      },
                      getExerciseVideo(exercise.name) &&
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () =>
                              window.open(
                                getExerciseVideo(exercise.name),
                                "_blank",
                                "noopener,noreferrer",
                              ),
                            className:
                              "w-full p-2 sm:p-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-semibold rounded-lg border border-red-500/30 transition-all duration-150 text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg",
                            title: `Watch ${exercise.name} correct form video`,
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-base",
                            },
                            /*#__PURE__*/ React.createElement(Video, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Watch Form Video",
                          ),
                        ),
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => setSelectedExercise(exercise),
                          className:
                            "w-full p-2 sm:p-3 bg-gradient-to-r from-neutral-800/50 to-neutral-700/50 hover:from-neutral-700/60 hover:to-neutral-500/60 text-white font-semibold rounded-lg border border-neutral-500/30 transition-colors duration-150 text-sm sm:text-base",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "hidden sm:inline",
                          },
                          /*#__PURE__*/ React.createElement(Eye, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " View Details",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "sm:hidden",
                          },
                          /*#__PURE__*/ React.createElement(Eye, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Details",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "grid grid-cols-2 gap-2 sm:gap-3",
                        },
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => handleQuickPlan(exercise),
                            className:
                              "p-2 sm:p-3 bg-gradient-to-r from-red-700 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-colors duration-150 shadow-lg text-xs sm:text-sm",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "hidden sm:inline",
                            },
                            /*#__PURE__*/ React.createElement(Plus, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " New Plan",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "sm:hidden",
                            },
                            /*#__PURE__*/ React.createElement(Plus, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Plan",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => handleAddToExisting(exercise),
                            className:
                              "p-2 sm:p-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-colors duration-150 shadow-lg text-xs sm:text-sm",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "hidden sm:inline",
                            },
                            /*#__PURE__*/ React.createElement(Edit, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Add to Plan",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "sm:hidden",
                            },
                            /*#__PURE__*/ React.createElement(Edit, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Add",
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "grid grid-cols-2 gap-2 sm:gap-3",
                        },
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => trackExerciseView(exercise),
                            className:
                              "p-2 sm:p-3 bg-gradient-to-r from-red-800 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-lg transition-colors duration-150 shadow-lg text-xs sm:text-sm",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "hidden sm:inline",
                            },
                            /*#__PURE__*/ React.createElement(Target, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Start Workout",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "sm:hidden",
                            },
                            /*#__PURE__*/ React.createElement(Target, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Start",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => {
                              // Enhanced workout completion with real-time sync
                              const workout = {
                                id: Date.now(),
                                exercise: exercise.name,
                                name: exercise.name,
                                category: exercise.category,
                                difficulty: exercise.difficulty,
                                completedAt: new Date().toISOString(),
                                duration: Math.floor(Math.random() * 120) + 60,
                                // 1-3 minutes
                                caloriesBurned:
                                  Math.floor(Math.random() * 100) + 50,
                                // 50-150 calories
                                sets: exercise.sets
                                  ? parseInt(exercise.sets.split(" ")[0]) || 3
                                  : 3,
                                reps: exercise.sets
                                  ? parseInt(exercise.sets.split("/")[1]) || 12
                                  : 12,
                                userId: user?.id,
                                savedOffline: !isOnline,
                                notes: `Completed from Exercise Library`,
                              };

                              // Save to localStorage with proper structure
                              const existing = JSON.parse(
                                localStorage.getItem("completedWorkouts") ||
                                  "[]",
                              );
                              const updatedWorkouts = [workout, ...existing];
                              localStorage.setItem(
                                "completedWorkouts",
                                JSON.stringify(updatedWorkouts),
                              );

                              // Show success message
                              setShowSuccessNotification(
                                `✅ ${exercise.name} completed! +${workout.caloriesBurned} calories`,
                              );

                              // Trigger comprehensive real-time events
                              window.dispatchEvent(
                                new CustomEvent("workoutCompleted", {
                                  detail: workout,
                                }),
                              );

                              // Update real-time stats
                              const todayWorkouts = updatedWorkouts.filter(
                                (w) =>
                                  new Date(w.completedAt).toDateString() ===
                                  new Date().toDateString(),
                              ).length;
                              const weeklyWorkouts = updatedWorkouts.filter(
                                (w) => {
                                  const workoutDate = new Date(w.completedAt);
                                  const weekAgo = new Date(
                                    Date.now() - 7 * 24 * 60 * 60 * 1000,
                                  );
                                  return workoutDate >= weekAgo;
                                },
                              ).length;
                              window.dispatchEvent(
                                new CustomEvent("realTimeStatsUpdate", {
                                  detail: {
                                    todayWorkouts,
                                    totalWorkouts: updatedWorkouts.length,
                                    weeklyWorkouts,
                                    totalCalories: updatedWorkouts.reduce(
                                      (sum, w) => sum + (w.caloriesBurned || 0),
                                      0,
                                    ),
                                  },
                                }),
                              );

                              // Trigger streak update if applicable
                              window.dispatchEvent(
                                new CustomEvent("streakUpdated", {
                                  detail: {
                                    type: "WORKOUT_COMPLETED",
                                    currentStreak: todayWorkouts,
                                    exercise: exercise.name,
                                  },
                                }),
                              );
                              console.log(
                                "🎯 Workout completed from Library:",
                                workout,
                              );
                            },
                            className:
                              "p-2 sm:p-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold rounded-lg transition-colors duration-150 shadow-lg text-xs sm:text-sm",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "hidden sm:inline",
                            },
                            /*#__PURE__*/ React.createElement(CheckCircle2, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Complete",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "sm:hidden",
                            },
                            /*#__PURE__*/ React.createElement(CheckCircle2, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Done",
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
        ),
        selectedExercise &&
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 animate-fadeIn",
              onClick: () => setSelectedExercise(null),
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "bg-gradient-to-br from-black to-black rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-neutral-800/50 shadow-2xl",
                onClick: (e) => e.stopPropagation(),
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "p-4 sm:p-6",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-start justify-between mb-4 sm:mb-6",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    null,
                    /*#__PURE__*/ React.createElement(
                      "h2",
                      {
                        className:
                          "text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2",
                      },
                      selectedExercise.name,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "p",
                      {
                        className: "text-neutral-300 text-sm sm:text-base",
                      },
                      selectedExercise.category,
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "button",
                    {
                      onClick: () => setSelectedExercise(null),
                      className:
                        "text-neutral-400 hover:text-white transition-colors text-lg sm:text-xl p-1",
                      "aria-label": "Close",
                    },
                    "\u2715",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "space-y-4 sm:space-y-6",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-neutral-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-neutral-700/30",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-orange-400 text-xs sm:text-sm font-semibold mb-1 flex items-center gap-1 sm:gap-2",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          null,
                          /*#__PURE__*/ React.createElement(Target, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                        " Sets/Reps",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-white font-bold text-base sm:text-lg",
                        },
                        selectedExercise.sets,
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-neutral-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-neutral-700/30",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-red-500 text-xs sm:text-sm font-semibold mb-1 flex items-center gap-1 sm:gap-2",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          null,
                          /*#__PURE__*/ React.createElement(Zap, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                        " Type",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: `text-xs sm:text-sm font-bold uppercase tracking-wide ${selectedExercise.type === "compound" ? "text-blue-300" : selectedExercise.type === "isolation" ? "text-purple-300" : "text-green-300"}`,
                        },
                        selectedExercise.type,
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-neutral-800/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-neutral-700/30",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-red-600 text-xs sm:text-sm font-semibold mb-1 flex items-center gap-1 sm:gap-2",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          null,
                          /*#__PURE__*/ React.createElement(Star, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                        " Difficulty",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: `text-xs sm:text-sm font-bold uppercase tracking-wide ${selectedExercise.difficulty === "beginner" ? "text-green-300" : selectedExercise.difficulty === "intermediate" ? "text-yellow-300" : "text-red-300"}`,
                        },
                        selectedExercise.difficulty,
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "bg-gradient-to-br from-neutral-900/60 to-neutral-800/60 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-neutral-700/50",
                    },
                    /*#__PURE__*/ React.createElement(
                      "h4",
                      {
                        className:
                          "text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-lg sm:text-2xl",
                        },
                        /*#__PURE__*/ React.createElement(ClipboardList, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "hidden sm:inline",
                        },
                        "Complete Form Guide",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "sm:hidden",
                        },
                        "Form Guide",
                      ),
                    ),
                    (() => {
                      const tips = getFormTips(selectedExercise.name);
                      return /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "space-y-3 sm:space-y-4",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "h5",
                            {
                              className:
                                "text-xs font-semibold text-green-300 mb-2 flex items-center gap-1",
                            },
                            /*#__PURE__*/ React.createElement(CheckCircle2, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Proper Form Checklist",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "ul",
                            {
                              className: "space-y-1",
                            },
                            tips.formTips.map((tip, index) =>
                              /*#__PURE__*/ React.createElement(
                                "li",
                                {
                                  key: index,
                                  className:
                                    "text-xs text-neutral-300 flex items-start gap-2",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  {
                                    className: "text-red-500 mt-0.5",
                                  },
                                  "\u2022",
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  null,
                                  tip,
                                ),
                              ),
                            ),
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "h5",
                            {
                              className:
                                "text-xs font-semibold text-red-300 mb-2 flex items-center gap-1",
                            },
                            /*#__PURE__*/ React.createElement(AlertTriangle, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                            " Common Mistakes to Avoid",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "ul",
                            {
                              className: "space-y-1",
                            },
                            tips.commonMistakes.map((mistake, index) =>
                              /*#__PURE__*/ React.createElement(
                                "li",
                                {
                                  key: index,
                                  className:
                                    "text-xs text-neutral-300 flex items-start gap-2",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  {
                                    className: "text-red-400 mt-0.5",
                                  },
                                  "\u2022",
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  null,
                                  mistake,
                                ),
                              ),
                            ),
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "grid grid-cols-1 gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-neutral-700/50",
                          },
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "bg-red-700/10 border border-red-600/20 rounded-md sm:rounded-lg p-2 sm:p-3",
                            },
                            /*#__PURE__*/ React.createElement(
                              "p",
                              {
                                className:
                                  "text-xs text-blue-300 font-medium flex items-start gap-1",
                              },
                              /*#__PURE__*/ React.createElement(Wind, {
                                className: "w-[1em] h-[1em] inline-block",
                              }),
                              " ",
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "font-semibold",
                                },
                                "Breathing:",
                              ),
                              " ",
                              tips.breathingTip,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "bg-orange-600/10 border border-orange-500/20 rounded-md sm:rounded-lg p-2 sm:p-3",
                            },
                            /*#__PURE__*/ React.createElement(
                              "p",
                              {
                                className:
                                  "text-xs text-orange-300 font-medium flex items-start gap-1",
                              },
                              /*#__PURE__*/ React.createElement(Activity, {
                                className: "w-[1em] h-[1em] inline-block",
                              }),
                              " ",
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "font-semibold",
                                },
                                "Rest Focus:",
                              ),
                              " ",
                              tips.restPeriodTip,
                            ),
                          ),
                        ),
                      );
                    })(),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "space-y-3 sm:space-y-4",
                    },
                    getExerciseVideo(selectedExercise.name) &&
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () =>
                            window.open(
                              getExerciseVideo(selectedExercise.name),
                              "_blank",
                              "noopener,noreferrer",
                            ),
                          className:
                            "w-full p-3 sm:p-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/30 shadow-lg hover:shadow-red-500/20 text-sm sm:text-base md:text-lg flex items-center justify-center gap-2",
                          title: `Watch ${selectedExercise.name} correct form video on YouTube`,
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-xl",
                          },
                          /*#__PURE__*/ React.createElement(Video, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          null,
                          "Watch Correct Form Video",
                        ),
                      ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "grid grid-cols-2 gap-3 sm:gap-4",
                      },
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => {
                            setSelectedExercise(null);
                            handleQuickPlan(selectedExercise);
                          },
                          className:
                            "p-3 sm:p-4 bg-gradient-to-r from-red-700 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-600/30 shadow-lg hover:shadow-red-600/20 text-sm sm:text-base",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "hidden sm:inline",
                          },
                          /*#__PURE__*/ React.createElement(Plus, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " New Plan",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "sm:hidden",
                          },
                          /*#__PURE__*/ React.createElement(Plus, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Plan",
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => {
                            const exerciseToAdd = selectedExercise;
                            setSelectedExercise(null);
                            handleAddToExisting(exerciseToAdd);
                          },
                          className:
                            "p-3 sm:p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-600/30 shadow-lg hover:shadow-red-600/20 text-sm sm:text-base",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "hidden sm:inline",
                          },
                          /*#__PURE__*/ React.createElement(Edit, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Add to Plan",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "sm:hidden",
                          },
                          /*#__PURE__*/ React.createElement(Edit, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Add",
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => {
                          trackExerciseView(selectedExercise);
                          setSelectedExercise(null);
                        },
                        className:
                          "w-full p-3 sm:p-4 bg-gradient-to-r from-red-800 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-700/30 shadow-lg hover:shadow-red-700/20 text-sm sm:text-base md:text-lg",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "hidden sm:inline",
                        },
                        /*#__PURE__*/ React.createElement(Target, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                        " Start Workout Session",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "sm:hidden",
                        },
                        /*#__PURE__*/ React.createElement(Target, {
                          className: "w-[1em] h-[1em] inline-block",
                        }),
                        " Start Workout",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => setSelectedExercise(null),
                        className:
                          "w-full p-2 sm:p-3 bg-neutral-800/50 hover:bg-neutral-700/60 text-neutral-300 hover:text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-neutral-500/30 text-sm sm:text-base",
                      },
                      "Close",
                    ),
                  ),
                ),
              ),
            ),
          ),
        showQuickPlan &&
          /*#__PURE__*/ React.createElement(QuickPlanModal, {
            exercise: showQuickPlan,
            onClose: () => setShowQuickPlan(null),
            onSave: handlePlanSaved,
          }),
        showAddToExisting &&
          /*#__PURE__*/ React.createElement(AddToExistingPlanModal, {
            exercise: showAddToExisting,
            onClose: () => setShowAddToExisting(null),
            onSave: handlePlanSaved,
          }),
        showSuccessNotification &&
          /*#__PURE__*/ React.createElement(WorkoutSuccessNotification, {
            message: showSuccessNotification,
            onClose: () => setShowSuccessNotification(null),
          }),
      ),
    ),
    /*#__PURE__*/ React.createElement("div", {
      className:
        "absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-900/20 to-transparent pointer-events-none",
    }),
  );
}

// Optimized Exercise Card with React.memo for performance
const ExerciseCard = /*#__PURE__*/ React.memo(
  ({ image, title, subtitle, description, category, index }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    useEffect(() => {
      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = image;
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [image]);
    const categoryColors = {
      strength: "from-red-500 to-orange-500",
      muscle: "from-red-600 to-red-600",
      functional: "from-red-600 to-red-600",
      flexibility: "from-red-700 to-pink-500",
      lifting: "from-yellow-500 to-orange-500",
      bodyweight: "from-red-700 to-red-600",
      sports: "from-red-600 to-red-600",
      power: "from-violet-500 to-red-700",
    };
    const categoryIcons = {
      strength: /*#__PURE__*/ React.createElement(BicepsFlexed, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      muscle: /*#__PURE__*/ React.createElement(Star, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      functional: /*#__PURE__*/ React.createElement(Zap, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      flexibility: /*#__PURE__*/ React.createElement(Activity, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      lifting: /*#__PURE__*/ React.createElement(Dumbbell, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      bodyweight: /*#__PURE__*/ React.createElement(Activity, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      sports: /*#__PURE__*/ React.createElement(Trophy, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      power: /*#__PURE__*/ React.createElement(Bomb, {
        className: "w-[1em] h-[1em] inline-block",
      }),
    };
    const gradientClass = categoryColors[category] || "from-red-600 to-red-600";
    const icon = categoryIcons[category] || "💪";
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "exercise-card group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 backdrop-blur-sm hover:-translate-y-2",
        style: {
          animationDelay: `${index * 50}ms`,
        },
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "relative h-64 sm:h-72 lg:h-80 overflow-hidden",
        },
        !imageLoaded &&
          !imageError &&
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "absolute inset-0",
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded-2xl",
            }),
          ),
        !imageError &&
          /*#__PURE__*/ React.createElement("img", {
            src: image,
            alt: title,
            className:
              "w-full h-full object-cover transition-all duration-500 group-hover:scale-110",
            style: {
              opacity: imageLoaded ? 1 : 0,
            },
            loading: "lazy",
            decoding: "async",
            sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
          }),
        imageError &&
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: `w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`,
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-white text-6xl",
              },
              icon,
            ),
          ),
        /*#__PURE__*/ React.createElement("div", {
          className:
            "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent",
        }),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "absolute inset-0 flex flex-col justify-end p-6",
          },
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-xl sm:text-2xl font-bold mb-2 text-white",
            },
            title,
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: `text-sm sm:text-base font-medium mb-3 bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`,
            },
            subtitle,
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className:
                "text-xs sm:text-sm text-gray-300 opacity-90 leading-relaxed",
            },
            description,
          ),
        ),
        /*#__PURE__*/ React.createElement("div", {
          className:
            "absolute inset-0 bg-gradient-to-t from-red-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        }),
      ),
    );
  },
);
