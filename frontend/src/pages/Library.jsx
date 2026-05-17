// Real-time Exercise Library with User Progress Tracking
import { CheckCircle2, Smartphone, Search, Target, User, Rocket, Dumbbell, Circle, BarChart3, XCircle } from 'lucide-react';
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { exerciseLibrary } from "../data/exerciseLibrary";
import { onlineService } from "../services/onlineService";
import { realTimeSyncService } from "../services/realTimeSyncService";
import { offlineStorageService } from "../services/offlineStorageService";
import QuickPlanModal from "../components/QuickPlanModal";
import AddToExistingPlanModal from "../components/AddToExistingPlanModal";
import SuccessNotification from "../components/SuccessNotification";
import WorkoutSetupModal from "../components/WorkoutSetupModal";
import LibraryHeaderImg from "../assets/Libraryheader.jpg";


export default function Library() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [filters, setFilters] = useState({
    category: "",
    difficulty: "",
    muscle: "",
  });

  // Real-time data states
  const [isOnline, setIsOnline] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [exerciseStats, setExerciseStats] = useState({});
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);

  // Update search when navbar search parameter changes
  useEffect(() => {
    if (navbarSearch && navbarSearch !== searchQuery) {
      setSearchQuery(navbarSearch);
    }
  }, [navbarSearch]);

  // Check for workout completion from navigation state
  useEffect(() => {
    const state = location.state;
    if (state?.workoutCompleted) {
      let message = `${state.exercise} completed in ${state.duration}`;
      if (state.savedOnline) {
        message += " ✅ Saved online!";
      } else if (state.savedOffline) {
        message += " 📱 Saved offline";
      }
      if (state.error) {
        message += ` (Error: ${state.error})`;
      }
      setShowSuccessNotification(message);

      // Clear the state to prevent showing notification on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Debug: Track modal state changes
  useEffect(() => {
    if (showWorkoutSetup) {
      console.log("🔍 WorkoutSetupModal opened for:", showWorkoutSetup.name);
    } else {
      console.log("🔍 WorkoutSetupModal closed");
    }
  }, [showWorkoutSetup]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showQuickPlan, setShowQuickPlan] = useState(null);
  const [showAddToExisting, setShowAddToExisting] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(null);
  const [showWorkoutSetup, setShowWorkoutSetup] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [visibleCards, setVisibleCards] = useState(20);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Load header image with optimization
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = LibraryHeaderImg;
    img.loading = "eager";
  }, []);

  // Lazy load more cards on scroll
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleCards < filteredExercises.length
        ) {
          setVisibleCards((prev) =>
            Math.min(prev + 20, filteredExercises.length),
          );
        }
      },
      {
        rootMargin: "200px",
      },
    );
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [visibleCards, filteredExercises.length]);

  // Reset visible cards when filters change
  useEffect(() => {
    setVisibleCards(20);
  }, [searchQuery, filters]);

  // Real-time data fetching with sync service
  useEffect(() => {
    const initializeRealTimeData = async () => {
      setLoading(true);
      try {
        // Check backend status
        const online = await onlineService.checkBackendStatus();
        setIsOnline(online);
        if (user) {
          try {
            // Get real-time data (online or cached)
            const data = await realTimeSyncService.getRealTimeData();
            if (data && data.userProgress) {
              setUserProgress(data.userProgress);
            }
            if (
              data &&
              data.workoutHistory &&
              Array.isArray(data.workoutHistory)
            ) {
              setRecentWorkouts(data.workoutHistory.slice(0, 5));

              // Calculate exercise-specific stats
              const stats = calculateExerciseStats(data.workoutHistory);
              setExerciseStats(stats);
            }
            if (data && data.exerciseStats) {
              setExerciseStats((prev) => ({
                ...prev,
                ...data.exerciseStats,
              }));
            }
            setLastSync(new Date());

            // Start real-time sync if online
            if (online) {
              realTimeSyncService.startRealTimeSync(1); // Sync every minute
            }
          } catch (syncError) {
            console.error("Real-time sync error:", syncError);
            // Continue with cached data
          }
        }
      } catch (error) {
        console.error("Failed to load real-time data:", error);
        // Load cached data as fallback
        try {
          const cachedProgress = offlineStorageService.getCachedUserProgress();
          const cachedStats = offlineStorageService.getCachedExerciseStats();
          const cachedHistory = offlineStorageService.getCachedWorkoutHistory();
          if (cachedProgress) setUserProgress(cachedProgress);
          if (cachedStats && typeof cachedStats === "object")
            setExerciseStats(cachedStats);
          if (
            cachedHistory &&
            cachedHistory.workouts &&
            Array.isArray(cachedHistory.workouts)
          ) {
            setRecentWorkouts(cachedHistory.workouts.slice(0, 5));
          }
        } catch (cacheError) {
          console.error("Failed to load cached data:", cacheError);
        }
      } finally {
        setLoading(false);
      }
    };
    initializeRealTimeData();

    // Set up sync callbacks
    const handleSyncUpdate = (event, data) => {
      try {
        if (
          event === "progress_updated" ||
          event === "incremental_sync_complete"
        ) {
          if (data && data.userProgress) {
            setUserProgress(data.userProgress);
          }
          setLastSync(new Date());
        } else if (event === "full_sync_complete") {
          if (data && data.userProgress) setUserProgress(data.userProgress);
          if (
            data &&
            data.workoutHistory &&
            Array.isArray(data.workoutHistory)
          ) {
            setRecentWorkouts(data.workoutHistory.slice(0, 5));
            const stats = calculateExerciseStats(data.workoutHistory);
            setExerciseStats(stats);
          }
          if (data && data.exerciseStats) {
            setExerciseStats((prev) => ({
              ...prev,
              ...data.exerciseStats,
            }));
          }
          setLastSync(data.timestamp || new Date());
        }
      } catch (error) {
        console.error("Sync callback error:", error);
      }
    };
    realTimeSyncService.onSync(handleSyncUpdate);
    return () => {
      realTimeSyncService.offSync(handleSyncUpdate);
      realTimeSyncService.stopAutoSync();
    };
  }, [user]);

  // Calculate exercise-specific statistics
  const calculateExerciseStats = (workouts) => {
    if (!Array.isArray(workouts)) return {};
    const stats = {};
    try {
      workouts.forEach((workout) => {
        if (!workout || !workout.exercises) return;
        workout.exercises.forEach((exercise) => {
          const exerciseName =
            exercise.exercise?.name || exercise.name || "Unknown Exercise";
          if (!stats[exerciseName]) {
            stats[exerciseName] = {
              totalSessions: 0,
              totalSets: 0,
              totalReps: 0,
              maxWeight: 0,
              lastPerformed: null,
              personalBest: 0,
            };
          }
          stats[exerciseName].totalSessions++;
          stats[exerciseName].totalSets += exercise.sets?.length || 0;
          if (Array.isArray(exercise.sets)) {
            exercise.sets.forEach((set) => {
              stats[exerciseName].totalReps += set.reps || 0;
              if (set.weight && set.weight > stats[exerciseName].maxWeight) {
                stats[exerciseName].maxWeight = set.weight;
                stats[exerciseName].personalBest = set.weight;
              }
            });
          }
          const workoutDate = new Date(workout.date || workout.createdAt);
          if (
            !stats[exerciseName].lastPerformed ||
            workoutDate > stats[exerciseName].lastPerformed
          ) {
            stats[exerciseName].lastPerformed = workoutDate;
          }
        });
      });
    } catch (error) {
      console.error("Error calculating exercise stats:", error);
    }
    return stats;
  };

  // Flatten all exercises from all muscle groups with real-time data
  const allExercises = useMemo(() => {
    const exercises = [];
    Object.entries(exerciseLibrary).forEach(([muscleKey, muscleGroup]) => {
      muscleGroup.exercises.forEach((exercise) => {
        const exerciseStatsData = exerciseStats[exercise.name] || {};
        exercises.push({
          ...exercise,
          category: muscleGroup.name,
          muscle: muscleGroup.name,
          icon: muscleGroup.icon,
          color: muscleGroup.color,
          // Real-time progress data
          userStats: exerciseStatsData,
          hasProgress: Object.keys(exerciseStatsData).length > 0,
          lastPerformed: exerciseStatsData.lastPerformed,
          totalSessions: exerciseStatsData.totalSessions || 0,
          personalBest: exerciseStatsData.maxWeight || 0,
        });
      });
    });
    return exercises;
  }, [exerciseStats]);

  // Filter exercises based on search and filters
  const filteredExercises = useMemo(() => {
    return allExercises.filter((exercise) => {
      const matchesSearch =
        !searchQuery ||
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !filters.category || exercise.category === filters.category;
      const matchesDifficulty =
        !filters.difficulty || exercise.difficulty === filters.difficulty;
      const matchesMuscle =
        !filters.muscle || exercise.muscle === filters.muscle;
      return (
        matchesSearch && matchesCategory && matchesDifficulty && matchesMuscle
      );
    });
  }, [allExercises, searchQuery, filters]);

  // Get unique values for filters
  const categories = [...new Set(allExercises.map((ex) => ex.category))];
  const difficulties = ["beginner", "intermediate", "advanced"];
  const muscles = [...new Set(allExercises.map((ex) => ex.muscle))];
  const handleQuickPlan = (exercise) => {
    setShowQuickPlan(exercise);
  };
  const handlePlanSaved = (savedPlan) => {
    // Show success message and navigate immediately for better UX
    setTimeout(() => {
      navigate("/my-plans?highlight=" + savedPlan.id);
    }, 500);
  };
  const handleAddToExisting = (exercise) => {
    setShowAddToExisting(exercise);
  };

  // Show workout setup modal - this opens the modal on the same page
  const handleStartWorkout = (exercise) => {
    console.log("🎯 Opening workout setup modal for:", exercise.name);
    console.log(
      "👤 User type:",
      user ? (user.isDemo ? "Demo User" : "Real User") : "Not logged in",
    );
    setShowWorkoutSetup(exercise);
  };

  // Handle workout setup completion - this navigates to StartWorkout with config
  const handleWorkoutSetupComplete = async ({ exercise, config }) => {
    console.log("✅ Workout setup completed:", {
      exercise: exercise.name,
      config,
    });
    console.log(
      "👤 User info:",
      user
        ? {
            id: user.id,
            email: user.email,
            isDemo: user.isDemo,
          }
        : "Not logged in",
    );
    try {
      // Track the interaction for all users (works online and offline)
      if (user) {
        await realTimeSyncService.trackExerciseInteraction(
          exercise.id,
          "workout_start",
        );

        // Update local stats immediately for better UX
        if (!isOnline) {
          const updatedStats = offlineStorageService.simulateRealTimeUpdate(
            exercise.name,
            "workout_start",
          );
          setExerciseStats((prev) => ({
            ...prev,
            [exercise.name]: updatedStats,
          }));
        }
      }

      // Close the setup modal
      setShowWorkoutSetup(null);

      // Navigate to workout session with exercise and configuration
      console.log("🚀 Navigating to StartWorkout with config:", config);
      navigate("/start-workout", {
        state: {
          selectedExercise: exercise,
          workoutConfig: config,
          fromLibrary: true,
          user: user, // Pass user info to StartWorkout
        },
      });
    } catch (error) {
      console.error("Failed to start workout session:", error);
      // Close modal and still navigate even if tracking fails
      setShowWorkoutSetup(null);
      navigate("/start-workout", {
        state: {
          selectedExercise: exercise,
          workoutConfig: config,
          fromLibrary: true,
          user: user,
        },
      });
    }
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "min-h-screen bg-black",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative w-full h-56 md:h-96 lg:h-[480px] overflow-hidden",
      },
      imageError
        ? /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "w-full h-full bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-center text-white px-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-6xl mb-4",
                },
                /*#__PURE__*/ React.createElement(Dumbbell, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "h1",
                {
                  className:
                    "text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl",
                },
                "Exercise Library",
              ),
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className:
                    "text-lg md:text-xl opacity-90 max-w-2xl mx-auto drop-shadow-lg",
                },
                "Browse, track, and customize your exercises with ease.",
              ),
            ),
          )
        : /*#__PURE__*/ React.createElement(
            React.Fragment,
            null,
            /*#__PURE__*/ React.createElement("img", {
              src: LibraryHeaderImg,
              alt: "Exercise Library header",
              className: "w-full h-full object-cover",
              loading: "eager",
              decoding: "async",
              style: {
                objectPosition: "50% 50%",
              },
            }),
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60",
            }),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "absolute inset-0 flex items-center justify-center",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center text-white px-4 max-w-4xl mx-auto",
                },
                /*#__PURE__*/ React.createElement(
                  "h1",
                  {
                    className:
                      "text-3xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-2xl leading-tight",
                    style: {
                      color: "#f59e0b",
                    },
                  },
                  "Exercise Library",
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-lg md:text-xl lg:text-2xl opacity-95 max-w-2xl mx-auto drop-shadow-lg font-medium leading-relaxed",
                  },
                  "Browse, track, and customize your exercises with ease.",
                ),
              ),
            ),
          ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative bg-black pt-8 pb-12",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "container mx-auto px-4 max-w-7xl",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "card p-6 mb-8 relative z-10 transform -translate-y-8",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex flex-col sm:flex-row items-center justify-between mb-6 gap-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-3",
              },
              /*#__PURE__*/ React.createElement("div", {
                className: `w-3 h-3 rounded-full ${isOnline ? "bg-red-500 animate-pulse" : "bg-yellow-400"}`,
              }),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-white font-medium text-sm sm:text-base",
                },
                isOnline
                  ? "🟢 Online Mode - Real-time Progress Tracking"
                  : "🟡 Offline Mode - Limited Features",
              ),
            ),
            lastSync &&
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xs text-neutral-400 flex items-center gap-2",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  null,
                  "Last sync: ",
                  lastSync.toLocaleTimeString(),
                ),
                (() => {
                  try {
                    const syncStatus = realTimeSyncService.getSyncStatus();
                    return (
                      syncStatus &&
                      syncStatus.pendingOfflineItems > 0 &&
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs",
                        },
                        syncStatus.pendingOfflineItems,
                        " pending",
                      )
                    );
                  } catch (error) {
                    return null;
                  }
                })(),
              ),
          ),
          user && userProgress
            ? /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-center p-3 bg-neutral-900/50 rounded-lg",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xl sm:text-2xl font-bold text-red-500",
                    },
                    userProgress.workouts || 0,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs sm:text-sm text-neutral-400",
                    },
                    "Total Workouts",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-center p-3 bg-neutral-900/50 rounded-lg",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xl sm:text-2xl font-bold text-red-500",
                    },
                    userProgress.streak || 0,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs sm:text-sm text-neutral-400",
                    },
                    "Day Streak",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-center p-3 bg-neutral-900/50 rounded-lg",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xl sm:text-2xl font-bold text-red-600",
                    },
                    userProgress.xpPoints || 0,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs sm:text-sm text-neutral-400",
                    },
                    "XP Points",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-center p-3 bg-neutral-900/50 rounded-lg",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-xl sm:text-2xl font-bold text-orange-400",
                    },
                    userProgress.weeklyGoal?.completed || 0,
                    "/",
                    userProgress.weeklyGoal?.target || 4,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs sm:text-sm text-neutral-400",
                    },
                    "Weekly Goal",
                  ),
                ),
              )
            : /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center py-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-neutral-400 text-sm",
                  },
                  user
                    ? "Loading your progress..."
                    : "Sign in to track your progress",
                ),
              ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-6 mb-8",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              id: "search-filters",
              className: "space-y-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "relative",
              },
              /*#__PURE__*/ React.createElement("input", {
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className:
                  "w-full p-4 pl-12 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white placeholder-neutral-400 text-base focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all",
                placeholder:
                  "Search exercises by name, type, or muscle group...",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 text-lg",
                },
                /*#__PURE__*/ React.createElement(Search, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
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
                    "p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-base focus:ring-2 focus:ring-red-600 focus:border-transparent",
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
                "select",
                {
                  value: filters.difficulty,
                  onChange: (e) =>
                    setFilters((prev) => ({
                      ...prev,
                      difficulty: e.target.value,
                    })),
                  className:
                    "p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-base focus:ring-2 focus:ring-red-600 focus:border-transparent",
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
                "select",
                {
                  value: filters.muscle,
                  onChange: (e) =>
                    setFilters((prev) => ({
                      ...prev,
                      muscle: e.target.value,
                    })),
                  className:
                    "p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-base focus:ring-2 focus:ring-red-600 focus:border-transparent",
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
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "card text-center py-4 bg-blue-900/20 border border-blue-800/30",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-2xl font-bold text-red-500",
                },
                allExercises.length,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-sm text-neutral-400",
                },
                "Total Exercises",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "card text-center py-4 bg-green-900/20 border border-green-800/30",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-2xl font-bold text-red-500",
                },
                categories.length,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-sm text-neutral-400",
                },
                "Muscle Groups",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "card text-center py-4 bg-purple-900/20 border border-purple-800/30",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-2xl font-bold text-red-600",
                },
                filteredExercises.length,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-sm text-neutral-400",
                },
                "Filtered Results",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "card text-center py-4 bg-orange-900/20 border border-orange-800/30",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-2xl font-bold text-orange-400",
                },
                allExercises.filter((ex) => ex.hasProgress).length,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-sm text-neutral-400",
                },
                "Exercises Done",
              ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-neutral-400 text-base",
            },
            "Showing ",
            filteredExercises.length,
            " of ",
            allExercises.length,
            " exercises",
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
              className: "btn-secondary text-sm px-4 py-2",
            },
            "Clear All Filters",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            id: "exercise-grid",
            className:
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
          },
          filteredExercises.length === 0
            ? /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "col-span-full text-center py-16",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-6xl mb-4",
                  },
                  /*#__PURE__*/ React.createElement(Search, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-xl font-semibold text-white mb-2",
                  },
                  "No exercises found",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-neutral-400 mb-6",
                  },
                  "Try adjusting your search or filters",
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
                      "btn bg-red-700 hover:bg-blue-700 text-white px-6 py-3",
                  },
                  "Clear All Filters",
                ),
              )
            : filteredExercises.slice(0, visibleCards).map((exercise) =>
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    key: exercise.id,
                    className: `card transition-transform hover:scale-[1.02] will-change-transform plan-card ${exercise.hasProgress ? "ring-2 ring-red-600/30" : "hover:ring-2 hover:ring-red-600/30"}`,
                    style: {
                      contain: "layout style paint",
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-start gap-3 mb-4",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: `w-12 h-12 ${exercise.color} rounded-lg flex items-center justify-center flex-shrink-0 relative`,
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-2xl",
                        },
                        exercise.icon,
                      ),
                      exercise.hasProgress &&
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-xs text-white",
                            },
                            "\u2713",
                          ),
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
                            "font-semibold text-white text-base mb-1 truncate",
                        },
                        exercise.name,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-sm text-neutral-400",
                        },
                        exercise.category,
                      ),
                      exercise.hasProgress &&
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-xs text-red-500 mt-1",
                          },
                          exercise.totalSessions,
                          " sessions \u2022 Best: ",
                          exercise.personalBest,
                          "kg",
                        ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "space-y-3 mb-4",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex items-center justify-between",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-sm text-neutral-300",
                        },
                        "Sets/Reps:",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-sm font-medium text-white",
                        },
                        exercise.sets,
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex items-center justify-between",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-sm text-neutral-300",
                        },
                        "Type:",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: `text-xs px-2 py-1 rounded ${exercise.type === "compound" ? "bg-blue-900/30 text-blue-300" : exercise.type === "isolation" ? "bg-purple-900/30 text-purple-300" : "bg-green-900/30 text-green-300"}`,
                        },
                        exercise.type,
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex items-center justify-between",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-sm text-neutral-300",
                        },
                        "Difficulty:",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: `text-xs px-2 py-1 rounded ${exercise.difficulty === "beginner" ? "bg-green-900/30 text-green-300" : exercise.difficulty === "intermediate" ? "bg-yellow-900/30 text-yellow-300" : "bg-red-900/30 text-red-300"}`,
                        },
                        exercise.difficulty,
                      ),
                    ),
                    exercise.hasProgress &&
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "bg-neutral-900/50 rounded p-2 space-y-1",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex justify-between text-xs",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-neutral-400",
                            },
                            "Last performed:",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-500",
                            },
                            exercise.lastPerformed
                              ? new Date(
                                  exercise.lastPerformed,
                                ).toLocaleDateString()
                              : "Never",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex justify-between text-xs",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-neutral-400",
                            },
                            "Total sets:",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-500",
                            },
                            exercise.userStats.totalSets || 0,
                          ),
                        ),
                      ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "space-y-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => setSelectedExercise(exercise),
                        className: "btn-secondary w-full text-sm",
                      },
                      exercise.hasProgress
                        ? "📊 View Progress"
                        : "View Details",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex gap-2",
                      },
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => handleQuickPlan(exercise),
                          className:
                            "btn bg-red-700 hover:bg-blue-700 text-white flex-1 text-sm",
                        },
                        "+ New Plan",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => handleAddToExisting(exercise),
                          className:
                            "btn bg-green-600 hover:bg-green-700 text-white flex-1 text-sm",
                        },
                        "+ Add to Plan",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "button",
                      {
                        onClick: () => {
                          console.log(
                            "💆 Start Workout button clicked for:",
                            exercise.name,
                          );
                          console.log(
                            "👤 User type:",
                            user
                              ? user.isDemo
                                ? "Demo User"
                                : "Real User"
                              : "Not logged in",
                          );
                          handleStartWorkout(exercise);
                        },
                        className: `btn ${isOnline ? "bg-red-800 hover:bg-purple-700" : "bg-neutral-700 hover:bg-neutral-800"} text-white w-full text-sm`,
                      },
                      /*#__PURE__*/ React.createElement(Target, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " ",
                      isOnline ? "Start Workout" : "Start Workout (Offline)",
                    ),
                  ),
                ),
              ),
          visibleCards < filteredExercises.length &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                ref: loadMoreRef,
                className: "col-span-full text-center py-8",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-neutral-400",
                },
                "Loading more exercises...",
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
            "fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4",
          onClick: () => setSelectedExercise(null),
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-br from-black to-black rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-neutral-800/50 shadow-2xl",
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
                className: "space-y-4",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-3",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: `w-12 h-12 ${selectedExercise.color} rounded-lg flex items-center justify-center relative`,
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-2xl",
                    },
                    selectedExercise.icon,
                  ),
                  selectedExercise.hasProgress &&
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-xs text-white",
                        },
                        "\u2713",
                      ),
                    ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "font-medium text-white",
                    },
                    selectedExercise.category,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm text-neutral-400",
                    },
                    selectedExercise.sets,
                  ),
                  selectedExercise.hasProgress &&
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xs text-red-500 mt-1",
                      },
                      selectedExercise.totalSessions,
                      " sessions completed",
                    ),
                ),
              ),
              selectedExercise.hasProgress &&
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "bg-neutral-900/50 rounded-lg p-3 space-y-2",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm font-medium text-white mb-2",
                    },
                    /*#__PURE__*/ React.createElement(BarChart3, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Your Progress",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "grid grid-cols-2 gap-3 text-xs",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-neutral-400",
                        },
                        "Total Sessions",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-red-500 font-medium",
                        },
                        selectedExercise.userStats.totalSessions,
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-neutral-400",
                        },
                        "Total Sets",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-red-500 font-medium",
                        },
                        selectedExercise.userStats.totalSets,
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-neutral-400",
                        },
                        "Total Reps",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-red-600 font-medium",
                        },
                        selectedExercise.userStats.totalReps,
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-neutral-400",
                        },
                        "Max Weight",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-orange-400 font-medium",
                        },
                        selectedExercise.userStats.maxWeight,
                        "kg",
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs text-neutral-400 mt-2",
                    },
                    "Last performed: ",
                    selectedExercise.lastPerformed
                      ? new Date(
                          selectedExercise.lastPerformed,
                        ).toLocaleDateString()
                      : "Never",
                  ),
                ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "grid grid-cols-2 gap-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm text-neutral-400 mb-1",
                    },
                    "Type",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: `text-xs px-2 py-1 rounded inline-block ${selectedExercise.type === "compound" ? "bg-blue-900/30 text-blue-300" : selectedExercise.type === "isolation" ? "bg-purple-900/30 text-purple-300" : "bg-green-900/30 text-green-300"}`,
                    },
                    selectedExercise.type,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm text-neutral-400 mb-1",
                    },
                    "Difficulty",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: `text-xs px-2 py-1 rounded inline-block ${selectedExercise.difficulty === "beginner" ? "bg-green-900/30 text-green-300" : selectedExercise.difficulty === "intermediate" ? "bg-yellow-900/30 text-yellow-300" : "bg-red-900/30 text-red-300"}`,
                    },
                    selectedExercise.difficulty,
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "space-y-2 pt-4 border-t border-neutral-800/50",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex gap-2",
                  },
                  /*#__PURE__*/ React.createElement(
                    "button",
                    {
                      onClick: () => {
                        setSelectedExercise(null);
                        handleQuickPlan(selectedExercise);
                      },
                      className:
                        "btn bg-red-700 hover:bg-blue-700 text-white flex-1",
                    },
                    "New Plan",
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
                        "btn bg-green-600 hover:bg-green-700 text-white flex-1",
                    },
                    "Add to Plan",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () => {
                      console.log(
                        "💆 Modal Start Workout button clicked for:",
                        selectedExercise.name,
                      );
                      console.log(
                        "👤 User type:",
                        user
                          ? user.isDemo
                            ? "Demo User"
                            : "Real User"
                          : "Not logged in",
                      );
                      const exerciseToStart = selectedExercise;
                      setSelectedExercise(null);
                      handleStartWorkout(exerciseToStart);
                    },
                    className: `btn ${isOnline ? "bg-red-800 hover:bg-purple-700" : "bg-neutral-700 hover:bg-neutral-800"} text-white w-full`,
                  },
                  /*#__PURE__*/ React.createElement(Target, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " ",
                  isOnline
                    ? "Start Workout Session"
                    : "Start Workout (Offline)",
                ),
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () => setSelectedExercise(null),
                    className: "btn-secondary w-full",
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
    user &&
      (() => {
        try {
          const syncStatus = realTimeSyncService.getSyncStatus();
          return (
            syncStatus &&
            syncStatus.syncInProgress &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "fixed bottom-4 right-4 bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-40",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-sm",
                },
                "Syncing...",
              ),
            )
          );
        } catch (error) {
          return null;
        }
      })(),
    showSuccessNotification &&
      /*#__PURE__*/ React.createElement(SuccessNotification, {
        message: showSuccessNotification,
        onClose: () => setShowSuccessNotification(null),
      }),
    showWorkoutSetup &&
      /*#__PURE__*/ React.createElement(WorkoutSetupModal, {
        exercise: showWorkoutSetup,
        onClose: () => {
          console.log("❌ Closing workout setup modal");
          setShowWorkoutSetup(null);
        },
        onStartWorkout: handleWorkoutSetupComplete,
      }),
  );
}

// Add cleanup on component unmount
Library.displayName = "Library";
