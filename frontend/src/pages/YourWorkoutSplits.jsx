import { Dumbbell, Plus, Search, Trash2, Play, Edit, Copy, Target, Calendar, Clock, Users, BicepsFlexed, Star, Bomb, Activity, Zap, Rocket, Lock, XCircle, CheckCircle2, ClipboardList, RefreshCw, Globe, Key, Moon } from 'lucide-react';
import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  getUserSplits,
  deleteUserSplit,
  saveUserSplit,
} from "../utils/userSpecificSplits";



const YourWorkoutSplits = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const navbarSearch = searchParams.get("search") || "";

  // Muscle group mapping and categorization functions
  const muscleGroupMapping = {
    Chest: {
      icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "bg-red-600",
      key: "chest",
    },
    Shoulders: {
      icon: /*#__PURE__*/ React.createElement(Star, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "bg-orange-600",
      key: "shoulders",
    },
    Back: {
      icon: /*#__PURE__*/ React.createElement(Target, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "bg-red-700",
      key: "back",
    },
    Arms: {
      icon: /*#__PURE__*/ React.createElement(Bomb, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "bg-red-800",
      key: "arms",
    },
    Legs: {
      icon: /*#__PURE__*/ React.createElement(Activity, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "bg-green-600",
      key: "legs",
    },
    Core: {
      icon: /*#__PURE__*/ React.createElement(Zap, {
        className: "w-[1em] h-[1em] inline-block",
      }),
      color: "bg-yellow-600",
      key: "abs",
    },
  };
  const getMuscleGroupFromCategory = (category) => {
    if (!category) return "Core";
    const categoryLower = category.toLowerCase();
    if (categoryLower === "abdominals" || categoryLower === "abs")
      return "Core";
    if (categoryLower.includes("chest")) return "Chest";
    if (categoryLower.includes("shoulder")) return "Shoulders";
    if (categoryLower.includes("back") || categoryLower.includes("lat"))
      return "Back";
    if (
      categoryLower.includes("arm") ||
      categoryLower.includes("bicep") ||
      categoryLower.includes("tricep")
    )
      return "Arms";
    if (
      categoryLower.includes("leg") ||
      categoryLower.includes("quad") ||
      categoryLower.includes("hamstring") ||
      categoryLower.includes("glute") ||
      categoryLower.includes("calf")
    )
      return "Legs";
    return category;
  };
  const groupExercisesByMuscleGroup = (exerciseString) => {
    if (
      !exerciseString ||
      exerciseString === "Rest Day" ||
      exerciseString === "No exercises planned"
    ) {
      return {};
    }

    // Comprehensive exercise mapping based on exercise library
    const exerciseToMuscleGroup = {
      // Chest exercises
      "Barbell Bench Press": "Chest",
      "Incline Dumbbell Press": "Chest",
      "Decline Bench Press": "Chest",
      "Cable Crossover": "Chest",
      "Pec-Deck Machine": "Chest",
      "Weighted Dips": "Chest",
      "Push-ups": "Chest",
      "Incline Cable Fly": "Chest",
      "Dumbbell Bench Press": "Chest",
      "Incline Barbell Press": "Chest",
      "Decline Dumbbell Press": "Chest",
      "Dumbbell Flyes": "Chest",
      "Incline Dumbbell Flyes": "Chest",
      "Decline Cable Fly": "Chest",
      "Chest Press Machine": "Chest",
      // Shoulders exercises
      "Overhead Press": "Shoulders",
      "Lateral Raises": "Shoulders",
      "Front Raises": "Shoulders",
      "Rear Delt Fly": "Shoulders",
      "Arnold Press": "Shoulders",
      "Upright Rows": "Shoulders",
      "Face Pulls": "Shoulders",
      "Pike Push-ups": "Shoulders",
      "Dumbbell Shoulder Press": "Shoulders",
      "Cable Lateral Raises": "Shoulders",
      "Reverse Pec Deck": "Shoulders",
      "Seated Dumbbell Press": "Shoulders",
      "Cable Front Raises": "Shoulders",
      "Bent-Over Lateral Raises": "Shoulders",
      "Machine Shoulder Press": "Shoulders",
      "Handstand Push-ups": "Shoulders",
      "Single-Arm Lateral Raise": "Shoulders",
      "Y-Raises": "Shoulders",
      Shrugs: "Shoulders",
      "Cuban Press": "Shoulders",
      // Back exercises
      Deadlift: "Back",
      "Pull-ups": "Back",
      "Barbell Rows": "Back",
      "Lat Pulldowns": "Back",
      "Cable Rows": "Back",
      "T-Bar Rows": "Back",
      "Single-Arm Dumbbell Row": "Back",
      Hyperextensions: "Back",
      "Chin-ups": "Back",
      "Wide-Grip Pulldowns": "Back",
      "Chest-Supported Row": "Back",
      "Inverted Rows": "Back",
      "Sumo Deadlift": "Back",
      "Romanian Deadlift": "Back",
      "Good Mornings": "Back",
      "Reverse Fly": "Back",
      "Rack Pulls": "Back",
      "Meadows Row": "Back",
      "Cable Pullovers": "Back",
      "Pendlay Rows": "Back",
      // Arms exercises
      "Barbell Curls": "Arms",
      "Close-Grip Bench Press": "Arms",
      "Hammer Curls": "Arms",
      "Tricep Dips": "Arms",
      "Preacher Curls": "Arms",
      "Overhead Tricep Extension": "Arms",
      "Cable Curls": "Arms",
      "Tricep Pushdowns": "Arms",
      "Dumbbell Curls": "Arms",
      "Skull Crushers": "Arms",
      "Concentration Curls": "Arms",
      "Diamond Push-ups": "Arms",
      "Cable Hammer Curls": "Arms",
      "Rope Tricep Extensions": "Arms",
      "21s Bicep Curls": "Arms",
      "Reverse Curls": "Arms",
      "Tricep Kickbacks": "Arms",
      "Zottman Curls": "Arms",
      "Overhead Cable Extension": "Arms",
      "Spider Curls": "Arms",
      // Legs exercises
      Squats: "Legs",
      "Romanian Deadlifts": "Legs",
      "Leg Press": "Legs",
      "Leg Curls": "Legs",
      "Leg Extensions": "Legs",
      "Calf Raises": "Legs",
      "Bulgarian Split Squats": "Legs",
      "Walking Lunges": "Legs",
      "Front Squats": "Legs",
      "Goblet Squats": "Legs",
      "Stiff Leg Deadlifts": "Legs",
      "Hack Squats": "Legs",
      "Step-ups": "Legs",
      "Reverse Lunges": "Legs",
      "Sumo Squats": "Legs",
      "Single-Leg Deadlifts": "Legs",
      "Wall Sits": "Legs",
      "Jump Squats": "Legs",
      "Seated Calf Raises": "Legs",
      "Pistol Squats": "Legs",
      // Core exercises
      Plank: "Core",
      Crunches: "Core",
      "Russian Twists": "Core",
      "Leg Raises": "Core",
      "Mountain Climbers": "Core",
      "Dead Bug": "Core",
      "Bicycle Crunches": "Core",
      "Hanging Knee Raises": "Core",
      "Side Plank": "Core",
      "Reverse Crunches": "Core",
      "V-Ups": "Core",
      "Flutter Kicks": "Core",
      "Hollow Body Hold": "Core",
      "Cable Crunches": "Core",
      Woodchoppers: "Core",
      "Ab Wheel Rollouts": "Core",
      "Hanging Leg Raises": "Core",
      "Dragon Flags": "Core",
      "Sit-ups": "Core",
      "Plank to Push-up": "Core",
    };
    const exercises = exerciseString.split(", ");
    const grouped = {};
    exercises.forEach((exerciseName) => {
      // Use exact mapping first, then fallback to pattern matching
      let muscleGroup = exerciseToMuscleGroup[exerciseName];
      if (!muscleGroup) {
        // Fallback pattern matching for custom exercises
        const nameLower = exerciseName.toLowerCase();
        if (
          nameLower.includes("tricep") ||
          nameLower.includes("bicep") ||
          nameLower.includes("curl") ||
          nameLower.includes("dip")
        ) {
          muscleGroup = "Arms";
        } else if (
          nameLower.includes("lateral") ||
          nameLower.includes("shoulder") ||
          nameLower.includes("press") ||
          nameLower.includes("raise")
        ) {
          muscleGroup = "Shoulders";
        } else if (
          nameLower.includes("bench") ||
          nameLower.includes("chest") ||
          nameLower.includes("pec")
        ) {
          muscleGroup = "Chest";
        } else if (
          nameLower.includes("pull") ||
          nameLower.includes("row") ||
          nameLower.includes("lat") ||
          nameLower.includes("back")
        ) {
          muscleGroup = "Back";
        } else if (
          nameLower.includes("leg") ||
          nameLower.includes("squat") ||
          nameLower.includes("calf")
        ) {
          muscleGroup = "Legs";
        } else {
          muscleGroup = "Core";
        }
      }
      if (!grouped[muscleGroup]) {
        grouped[muscleGroup] = [];
      }
      grouped[muscleGroup].push(exerciseName);
    });
    return grouped;
  };
  const [customSplits, setCustomSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [syncStatus, setSyncStatus] = useState("live");
  const [lastSync, setLastSync] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({
    totalSplits: 0,
  });
  const [selectedSplit, setSelectedSplit] = useState(null);

  // Filter splits based on search
  const filteredSplits = useMemo(() => {
    if (!searchQuery) return customSplits;
    return customSplits.filter(
      (split) =>
        split.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        split.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (split.exercises &&
          split.exercises.some((exercise) =>
            exercise.name.toLowerCase().includes(searchQuery.toLowerCase()),
          )),
    );
  }, [customSplits, searchQuery]);

  // Update search when navbar search parameter changes
  useEffect(() => {
    if (navbarSearch && navbarSearch !== searchQuery) {
      setSearchQuery(navbarSearch);
    }
  }, [navbarSearch]);

  // Load custom splits on mount and when user changes
  useEffect(() => {
    loadCustomSplits();

    // Listen for real-time split creation events
    const handleSplitCreated = () => {
      console.log("🚀 Your WorkoutSplits - Split Created, reloading...");
      loadCustomSplits();
    };
    window.addEventListener("customSplitCreated", handleSplitCreated);
    return () => {
      window.removeEventListener("customSplitCreated", handleSplitCreated);
    };
  }, [user]);
  const loadCustomSplits = async () => {
    setLoading(true);
    setSyncStatus("syncing");
    try {
      if (!isAuthenticated()) {
        // If not authenticated, show empty splits
        setCustomSplits([]);
        setRealTimeStats({
          totalSplits: 0,
        });
        setLastSync(new Date());
        setSyncStatus("synced");
        console.log("🔒 User not authenticated - showing empty splits list");
        setTimeout(() => setSyncStatus("live"), 2000);
        return;
      }

      // Use utility function to get user-specific splits
      const userSplits = getUserSplits(user);
      setCustomSplits(userSplits);
      setRealTimeStats({
        totalSplits: userSplits.length,
      });
      setLastSync(new Date());
      setSyncStatus("synced");
      console.log(
        `✅ Loaded ${userSplits.length} user-specific custom splits for user ${currentUserId}`,
      );

      // Auto-hide sync status
      setTimeout(() => setSyncStatus("live"), 2000);
    } catch (error) {
      console.error("❌ Failed to load custom splits:", error);
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("live"), 3000);
    } finally {
      setLoading(false);
    }
  };
  const deleteSplit = async (splitId) => {
    if (window.confirm("Are you sure you want to delete this custom split?")) {
      try {
        console.log("🗑️ Deleting custom split:", splitId);
        if (!isAuthenticated()) {
          alert("Please login to delete splits.");
          return;
        }

        // Use utility function to delete split
        deleteUserSplit(user, splitId);

        // Update state
        setCustomSplits((prev) => prev.filter((split) => split.id !== splitId));
        setRealTimeStats((prev) => ({
          ...prev,
          totalSplits: prev.totalSplits - 1,
        }));
        console.log(
          "✅ Custom split deleted successfully from user-specific storage",
        );
      } catch (error) {
        console.error("❌ Error deleting custom split:", error);
        alert("Failed to delete split. Please try again.");
      }
    }
  };
  const duplicateSplit = async (split) => {
    try {
      console.log("📋 Duplicating custom split:", split.name);
      if (!isAuthenticated()) {
        alert("Please login to duplicate splits.");
        return;
      }
      const duplicatedSplit = {
        ...split,
        id: Date.now(),
        name: `${split.name} (Copy)`,
        createdAt: new Date().toISOString(),
      };

      // Use utility function to save split
      saveUserSplit(user, duplicatedSplit);

      // Update state
      setCustomSplits((prev) => [duplicatedSplit, ...prev]);
      setRealTimeStats((prev) => ({
        ...prev,
        totalSplits: prev.totalSplits + 1,
      }));
      console.log(
        "✅ Custom split duplicated successfully in user-specific storage",
      );
    } catch (error) {
      console.error("❌ Error duplicating custom split:", error);
      alert("Failed to duplicate split. Please try again.");
    }
  };
  const editSplit = (split) => {
    // Navigate to edit split page with split ID
    navigate(`/edit-split/${split.id}`);
  };
  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case "synced":
        return {
          icon: /*#__PURE__*/ React.createElement(CheckCircle2, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          text: "Synced",
          color: "text-red-500",
        };
      case "syncing":
        return {
          icon: /*#__PURE__*/ React.createElement(RefreshCw, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          text: "Loading...",
          color: "text-red-500",
        };
      case "error":
        return {
          icon: /*#__PURE__*/ React.createElement(XCircle, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          text: "Error",
          color: "text-red-500",
        };
      default:
        return {
          icon: /*#__PURE__*/ React.createElement(Globe, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          text: "Live",
          color: "text-red-500",
        };
    }
  };
  const statusDisplay = getSyncStatusDisplay();
  if (loading) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black flex items-center justify-center",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-white text-center",
        },
        /*#__PURE__*/ React.createElement("div", {
          className:
            "animate-spin w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full mx-auto mb-4",
        }),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          "Loading Your WorkoutSplits...",
        ),
      ),
    );
  }
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "bg-gradient-to-r from-gray-950 via-black to-gray-950 border-b border-red-700/20",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "max-w-7xl mx-auto px-3 py-3",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-3",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center justify-between",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-lg",
                },
                /*#__PURE__*/ React.createElement(BicepsFlexed, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                null,
                /*#__PURE__*/ React.createElement(
                  "h1",
                  {
                    className: "text-base sm:text-lg font-bold text-white",
                  },
                  "My Workout Plans",
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className: "text-xs text-neutral-400",
                  },
                  "Professional Gym Tracking",
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: loadCustomSplits,
                disabled: syncStatus === "syncing",
                className:
                  "p-1.5 bg-neutral-900/60 text-white rounded-md text-xs",
              },
              syncStatus === "syncing" ? <RefreshCw className="w-[1em] h-[1em] inline-block animate-spin"/> : <RefreshCw className="w-[1em] h-[1em] inline-block"/>,
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center justify-between bg-neutral-900/40 rounded-lg p-2 border border-neutral-800/50",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-3",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center gap-1",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse",
                }),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-xs font-medium text-red-500",
                  },
                  "REAL-TIME",
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
                    className: "text-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm font-bold text-white",
                    },
                    realTimeStats.totalSplits,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs text-neutral-400",
                    },
                    "Total Plans",
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
                      className: `text-sm font-bold ${statusDisplay.color}`,
                    },
                    "0",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs text-neutral-400",
                    },
                    "Synced",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: `${statusDisplay.color} text-xs font-medium flex items-center gap-1`,
              },
              /*#__PURE__*/ React.createElement(
                "span",
                null,
                statusDisplay.icon,
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            Link,
            {
              to: "/custom-split-builder",
              className:
                "w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm",
            },
            /*#__PURE__*/ React.createElement(Plus, {
              className: "w-3 h-3",
            }),
            /*#__PURE__*/ React.createElement("span", null, "Create New Plan"),
          ),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8",
      },
      (customSplits.length > 0 || searchQuery) &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "relative mb-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "bg-neutral-900/40 rounded-lg p-2 border border-neutral-800/50",
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
                  "w-full p-2 pl-8 pr-8 rounded-md bg-black/60 border border-neutral-700 text-white placeholder-neutral-400 text-sm",
                placeholder: "Search your plans...",
              }),
              /*#__PURE__*/ React.createElement(Search, {
                className:
                  "absolute left-2 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute right-2 top-1/2 transform -translate-y-1/2 text-neutral-400 text-sm",
                },
                /*#__PURE__*/ React.createElement(Search, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              searchQuery &&
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () => setSearchQuery(""),
                    className:
                      "absolute right-6 top-1/2 transform -translate-y-1/2 text-neutral-400 text-xs p-1",
                  },
                  "\u2715",
                ),
            ),
          ),
        ),
      searchQuery && filteredSplits.length === 0 && customSplits.length > 0
        ? /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-center py-12 bg-neutral-900/30 rounded-xl border border-neutral-800",
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
              "h3",
              {
                className: "text-xl font-semibold text-white mb-2",
              },
              "No Splits Found",
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className: "text-neutral-400 mb-6",
              },
              'No custom splits match "',
              searchQuery,
              '". Try a different search term.',
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => setSearchQuery(""),
                className:
                  "bg-red-800 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors",
              },
              "Clear Search",
            ),
          )
        : customSplits.length === 0
          ? /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-center py-6 bg-neutral-900/30 rounded-lg border border-neutral-800",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-3xl mb-3",
                },
                /*#__PURE__*/ React.createElement(Target, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "h3",
                {
                  className: "text-base font-semibold text-white mb-2",
                },
                isAuthenticated() ? "No Custom Splits Yet" : "Login Required",
              ),
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className: "text-neutral-400 mb-4 text-sm px-4",
                },
                isAuthenticated()
                  ? "You haven't created any custom workout splits yet. Start building your first split!"
                  : "Please login to view and create your personal workout splits.",
              ),
              isAuthenticated()
                ? /*#__PURE__*/ React.createElement(
                    Link,
                    {
                      to: "/custom-split-builder",
                      className:
                        "bg-gradient-to-r from-red-800 to-red-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 text-sm",
                    },
                    /*#__PURE__*/ React.createElement(Plus, {
                      className: "w-3 h-3",
                    }),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "Create Your First Split",
                    ),
                  )
                : /*#__PURE__*/ React.createElement(
                    Link,
                    {
                      to: "/login",
                      className:
                        "bg-red-700 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center gap-2 text-sm",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      /*#__PURE__*/ React.createElement(Key, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      "Login to View Splits",
                    ),
                  ),
            )
          : /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-4",
              },
              searchQuery &&
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "bg-neutral-900/40 rounded-lg p-3 border border-neutral-800/50",
                  },
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className: "text-neutral-300 text-sm font-medium",
                    },
                    "Showing ",
                    filteredSplits.length,
                    " of ",
                    customSplits.length,
                    ' plans for "',
                    searchQuery,
                    '"',
                  ),
                ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
                },
                filteredSplits.map((split) =>
                  /*#__PURE__*/ React.createElement(
                    motion.div,
                    {
                      key: split.id,
                      className:
                        "bg-neutral-900/80 border border-neutral-800/60 rounded-lg overflow-hidden hover:border-red-700/50 transition-all duration-300",
                      initial: {
                        opacity: 0,
                        y: 20,
                      },
                      animate: {
                        opacity: 1,
                        y: 0,
                      },
                      transition: {
                        duration: 0.3,
                      },
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-neutral-900/60 p-3 border-b border-neutral-800/50",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex items-start justify-between mb-2",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex-1",
                          },
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "flex items-center gap-1 mb-1",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className:
                                  "text-xs font-medium text-red-600 bg-red-700/20 px-1.5 py-0.5 rounded border border-red-700/30",
                              },
                              /*#__PURE__*/ React.createElement(Star, {
                                className: "w-[1em] h-[1em] inline-block",
                              }),
                              " Local",
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "h3",
                            {
                              className: "text-sm font-bold text-white mb-1",
                            },
                            split.name,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "p",
                            {
                              className: "text-xs text-neutral-400",
                            },
                            split.exercises?.length || 0,
                            " exercises",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex items-center gap-0.5",
                          },
                          /*#__PURE__*/ React.createElement(
                            "button",
                            {
                              onClick: () => duplicateSplit(split),
                              className:
                                "text-red-500 p-1 rounded hover:bg-blue-900/20",
                            },
                            /*#__PURE__*/ React.createElement(Copy, {
                              className: "w-3 h-3",
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "button",
                            {
                              onClick: () => deleteSplit(split.id),
                              className:
                                "text-red-400 p-1 rounded hover:bg-red-900/20",
                            },
                            /*#__PURE__*/ React.createElement(Trash2, {
                              className: "w-3 h-3",
                            }),
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex items-center gap-1 text-xs",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-neutral-300",
                          },
                          split.difficulty || "General",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-neutral-500",
                          },
                          "\u2022",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-neutral-400",
                          },
                          /*#__PURE__*/ React.createElement(ClipboardList, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "p-3",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "space-y-1.5 mb-3",
                        },
                        split.exercises?.slice(0, 2).map((exercise, index) =>
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              key: index,
                              className:
                                "flex items-center gap-2 bg-neutral-900/40 rounded p-2 border border-neutral-800/30",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className:
                                  "text-red-600 font-bold text-xs bg-red-700/20 w-4 h-4 rounded-full flex items-center justify-center",
                              },
                              index + 1,
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
                                    "text-white font-medium text-xs truncate",
                                },
                                exercise.name,
                              ),
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "text-neutral-400 text-xs",
                                },
                                exercise.sets,
                              ),
                            ),
                          ),
                        ),
                        (split.exercises?.length || 0) > 2 &&
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-center py-1",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "text-xs text-red-600",
                              },
                              "+",
                              (split.exercises?.length || 0) - 2,
                              " more",
                            ),
                          ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "bg-neutral-900/40 rounded p-2 border border-neutral-800/30 mb-3",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "flex items-center gap-1 text-xs text-neutral-400 mb-1",
                          },
                          /*#__PURE__*/ React.createElement(Calendar, {
                            className: "w-3 h-3",
                          }),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Created: ",
                            new Date(split.createdAt).toLocaleDateString(),
                          ),
                        ),
                        lastSync &&
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "flex items-center gap-1 text-xs text-neutral-400",
                            },
                            /*#__PURE__*/ React.createElement(Clock, {
                              className: "w-3 h-3",
                            }),
                            /*#__PURE__*/ React.createElement(
                              "span",
                              null,
                              "Last sync: ",
                              lastSync.toLocaleTimeString(),
                            ),
                          ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "space-y-1.5",
                        },
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => setSelectedSplit(split),
                            className:
                              "w-full bg-red-800/20 text-purple-300 border border-red-700/30 py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            /*#__PURE__*/ React.createElement(Dumbbell, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "View Splits",
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => editSplit(split),
                            className:
                              "w-full bg-red-800 text-white py-2 px-3 rounded text-xs font-medium flex items-center justify-center gap-1",
                          },
                          /*#__PURE__*/ React.createElement(Edit, {
                            className: "w-3 h-3",
                          }),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            null,
                            "Edit Plan",
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
    ),
    selectedSplit &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4",
          onClick: () => setSelectedSplit(null),
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-br from-neutral-900 to-black rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-red-700/30 shadow-2xl",
            onClick: (e) => e.stopPropagation(),
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "p-6",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-start justify-between mb-6",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                null,
                /*#__PURE__*/ React.createElement(
                  "h2",
                  {
                    className: "text-2xl font-bold text-white mb-2",
                  },
                  selectedSplit.name,
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className: "text-neutral-300",
                  },
                  selectedSplit.description,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => setSelectedSplit(null),
                  className: "text-neutral-400 hover:text-white text-2xl",
                },
                "\xD7",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "bg-neutral-800/30 rounded-lg p-4 text-center",
                },
                /*#__PURE__*/ React.createElement(Calendar, {
                  className: "w-6 h-6 text-red-500 mx-auto mb-2",
                }),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-sm text-neutral-400",
                  },
                  "Frequency",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-white font-medium",
                  },
                  selectedSplit.frequency,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "bg-neutral-800/30 rounded-lg p-4 text-center",
                },
                /*#__PURE__*/ React.createElement(Target, {
                  className: "w-6 h-6 text-red-500 mx-auto mb-2",
                }),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-sm text-neutral-400",
                  },
                  "Difficulty",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-white font-medium",
                  },
                  selectedSplit.difficulty,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "bg-neutral-800/30 rounded-lg p-4 text-center",
                },
                /*#__PURE__*/ React.createElement(Clock, {
                  className: "w-6 h-6 text-red-600 mx-auto mb-2",
                }),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-sm text-neutral-400",
                  },
                  "Duration",
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-white font-medium",
                  },
                  selectedSplit.duration,
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "mb-6",
              },
              /*#__PURE__*/ React.createElement(
                "h3",
                {
                  className: "text-lg font-semibold text-white mb-3",
                },
                /*#__PURE__*/ React.createElement(Calendar, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Weekly Schedule",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "space-y-3",
                },
                selectedSplit.weeklySchedule
                  ? Object.entries(selectedSplit.weeklySchedule).map(
                      ([day, dayContent]) => {
                        const isRestDay =
                          dayContent === "Rest Day" ||
                          dayContent === "No exercises planned";
                        const groupedExercises = isRestDay
                          ? {}
                          : groupExercisesByMuscleGroup(dayContent);
                        return /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            key: day,
                            className:
                              "bg-neutral-800/20 rounded-lg border border-neutral-700/30 overflow-hidden",
                          },
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "flex items-center justify-between p-3 border-b border-neutral-700/30",
                            },
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className: "font-semibold text-white text-lg",
                              },
                              day,
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: `text-xs px-2 py-1 rounded-full ${isRestDay ? "bg-gray-600 text-gray-300" : "bg-red-700/20 text-purple-300"}`,
                              },
                              isRestDay ? <><Moon className="w-[1em] h-[1em] inline-block"/> Rest</> : <><Dumbbell className="w-[1em] h-[1em] inline-block"/> Workout</>,
                            ),
                          ),
                          isRestDay
                            ? /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "p-3",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className:
                                      "text-neutral-400 text-sm flex items-center gap-2",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className: "text-lg",
                                    },
                                    /*#__PURE__*/ React.createElement(Moon, {
                                      className: "w-[1em] h-[1em] inline-block",
                                    }),
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    null,
                                    dayContent,
                                  ),
                                ),
                              )
                            : Object.keys(groupedExercises).length > 0
                              ? /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className: "p-3 space-y-3",
                                  },
                                  Object.entries(groupedExercises)
                                    .map(([muscleGroup, exercises]) => {
                                      const config =
                                        muscleGroupMapping[muscleGroup];
                                      if (!config || exercises.length === 0)
                                        return null;
                                      return /*#__PURE__*/ React.createElement(
                                        "div",
                                        {
                                          key: muscleGroup,
                                          className:
                                            "bg-neutral-900/40 rounded-lg border border-neutral-800/50 overflow-hidden",
                                        },
                                        /*#__PURE__*/ React.createElement(
                                          "div",
                                          {
                                            className: `${config.color} bg-opacity-20 border-b border-neutral-800/50 px-3 py-2`,
                                          },
                                          /*#__PURE__*/ React.createElement(
                                            "div",
                                            {
                                              className:
                                                "flex items-center gap-2",
                                            },
                                            /*#__PURE__*/ React.createElement(
                                              "span",
                                              {
                                                className: "text-lg",
                                              },
                                              config.icon,
                                            ),
                                            /*#__PURE__*/ React.createElement(
                                              "div",
                                              null,
                                              /*#__PURE__*/ React.createElement(
                                                "h4",
                                                {
                                                  className:
                                                    "text-white font-semibold text-sm",
                                                },
                                                muscleGroup,
                                              ),
                                              /*#__PURE__*/ React.createElement(
                                                "p",
                                                {
                                                  className:
                                                    "text-neutral-400 text-xs",
                                                },
                                                exercises.length,
                                                " exercise",
                                                exercises.length !== 1
                                                  ? "s"
                                                  : "",
                                              ),
                                            ),
                                          ),
                                        ),
                                        /*#__PURE__*/ React.createElement(
                                          "div",
                                          {
                                            className: "p-3",
                                          },
                                          /*#__PURE__*/ React.createElement(
                                            "div",
                                            {
                                              className: "space-y-1",
                                            },
                                            exercises.map((exercise, idx) =>
                                              /*#__PURE__*/ React.createElement(
                                                "div",
                                                {
                                                  key: idx,
                                                  className:
                                                    "text-white text-sm flex items-center gap-2",
                                                },
                                                /*#__PURE__*/ React.createElement(
                                                  "span",
                                                  {
                                                    className: `text-white font-bold text-xs ${config.color} bg-opacity-80 w-5 h-5 rounded-full flex items-center justify-center`,
                                                  },
                                                  idx + 1,
                                                ),
                                                /*#__PURE__*/ React.createElement(
                                                  "span",
                                                  null,
                                                  exercise,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ),
                                      );
                                    })
                                    .filter(Boolean),
                                )
                              : /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className: "p-3",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "div",
                                    {
                                      className: "text-white text-sm",
                                    },
                                    dayContent,
                                  ),
                                ),
                        );
                      },
                    )
                  : // Fallback for old format splits
                    [
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day) => {
                      const dayExercises =
                        selectedSplit.exercises?.filter(
                          (ex) => ex.day === day,
                        ) || [];
                      const exerciseNames = dayExercises
                        .map((ex) => ex.name)
                        .join(", ");
                      const groupedExercises =
                        dayExercises.length > 0
                          ? groupExercisesByMuscleGroup(exerciseNames)
                          : {};
                      return /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          key: day,
                          className:
                            "bg-neutral-800/20 rounded-lg border border-neutral-700/30 overflow-hidden",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "flex items-center justify-between p-3 border-b border-neutral-700/30",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "font-semibold text-white text-lg",
                            },
                            day,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: `text-xs px-2 py-1 rounded-full ${dayExercises.length === 0 ? "bg-gray-600 text-gray-300" : "bg-red-700/20 text-purple-300"}`,
                            },
                            dayExercises.length === 0
                              ? "😴 Rest"
                              : "💪 Workout",
                          ),
                        ),
                        dayExercises.length === 0
                          ? /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "p-3",
                              },
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className:
                                    "text-neutral-400 text-sm flex items-center gap-2",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  {
                                    className: "text-lg",
                                  },
                                  /*#__PURE__*/ React.createElement(Moon, {
                                    className: "w-[1em] h-[1em] inline-block",
                                  }),
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "span",
                                  null,
                                  "No exercises planned",
                                ),
                              ),
                            )
                          : Object.keys(groupedExercises).length > 0
                            ? /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "p-3 space-y-3",
                                },
                                Object.entries(groupedExercises)
                                  .map(([muscleGroup, exercises]) => {
                                    const config =
                                      muscleGroupMapping[muscleGroup];
                                    if (!config || exercises.length === 0)
                                      return null;
                                    return /*#__PURE__*/ React.createElement(
                                      "div",
                                      {
                                        key: muscleGroup,
                                        className:
                                          "bg-neutral-900/40 rounded-lg border border-neutral-800/50 overflow-hidden",
                                      },
                                      /*#__PURE__*/ React.createElement(
                                        "div",
                                        {
                                          className: `${config.color} bg-opacity-20 border-b border-neutral-800/50 px-3 py-2`,
                                        },
                                        /*#__PURE__*/ React.createElement(
                                          "div",
                                          {
                                            className:
                                              "flex items-center gap-2",
                                          },
                                          /*#__PURE__*/ React.createElement(
                                            "span",
                                            {
                                              className: "text-lg",
                                            },
                                            config.icon,
                                          ),
                                          /*#__PURE__*/ React.createElement(
                                            "div",
                                            null,
                                            /*#__PURE__*/ React.createElement(
                                              "h4",
                                              {
                                                className:
                                                  "text-white font-semibold text-sm",
                                              },
                                              muscleGroup,
                                            ),
                                            /*#__PURE__*/ React.createElement(
                                              "p",
                                              {
                                                className:
                                                  "text-neutral-400 text-xs",
                                              },
                                              exercises.length,
                                              " exercise",
                                              exercises.length !== 1 ? "s" : "",
                                            ),
                                          ),
                                        ),
                                      ),
                                      /*#__PURE__*/ React.createElement(
                                        "div",
                                        {
                                          className: "p-3",
                                        },
                                        /*#__PURE__*/ React.createElement(
                                          "div",
                                          {
                                            className: "space-y-1",
                                          },
                                          exercises.map((exercise, idx) =>
                                            /*#__PURE__*/ React.createElement(
                                              "div",
                                              {
                                                key: idx,
                                                className:
                                                  "text-white text-sm flex items-center gap-2",
                                              },
                                              /*#__PURE__*/ React.createElement(
                                                "span",
                                                {
                                                  className: `text-white font-bold text-xs ${config.color} bg-opacity-80 w-5 h-5 rounded-full flex items-center justify-center`,
                                                },
                                                idx + 1,
                                              ),
                                              /*#__PURE__*/ React.createElement(
                                                "span",
                                                null,
                                                exercise,
                                              ),
                                            ),
                                          ),
                                        ),
                                      ),
                                    );
                                  })
                                  .filter(Boolean),
                              )
                            : /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "p-3",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className: "space-y-1",
                                  },
                                  dayExercises.map((exercise, idx) =>
                                    /*#__PURE__*/ React.createElement(
                                      "div",
                                      {
                                        key: idx,
                                        className: "text-white text-sm",
                                      },
                                      exercise.name,
                                    ),
                                  ),
                                ),
                              ),
                      );
                    }),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex gap-3",
              },
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => {
                    setSelectedSplit(null);
                    editSplit(selectedSplit);
                  },
                  className:
                    "flex-1 bg-gradient-to-r from-red-800 to-red-700 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                },
                /*#__PURE__*/ React.createElement(Edit, {
                  className: "w-4 h-4",
                }),
                "Edit Split",
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => {
                    setSelectedSplit(null);
                    duplicateSplit(selectedSplit);
                  },
                  className:
                    "flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2",
                },
                /*#__PURE__*/ React.createElement(Copy, {
                  className: "w-4 h-4",
                }),
                "Duplicate",
              ),
            ),
          ),
        ),
      ),
  );
};
export default YourWorkoutSplits;
