import { Dumbbell, Save, ArrowLeft, Target, ChevronUp, ChevronDown, Trash2, BicepsFlexed, Star, Bomb, Activity, Zap, CheckCircle2, RefreshCw, Book, Calendar, Moon, Circle, BarChart3 } from 'lucide-react';
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { exerciseLibrary } from "../data/exerciseLibrary";
import { useAuth } from "../context/AuthContext";



const EditSplit = () => {
  const navigate = useNavigate();
  const { splitId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("chest");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [weeklyPlan, setWeeklyPlan] = useState({
    Monday: {
      exercises: [],
      isRestDay: false,
    },
    Tuesday: {
      exercises: [],
      isRestDay: false,
    },
    Wednesday: {
      exercises: [],
      isRestDay: false,
    },
    Thursday: {
      exercises: [],
      isRestDay: false,
    },
    Friday: {
      exercises: [],
      isRestDay: false,
    },
    Saturday: {
      exercises: [],
      isRestDay: false,
    },
    Sunday: {
      exercises: [],
      isRestDay: false,
    },
  });
  const [splitName, setSplitName] = useState("");
  const [splitDescription, setSplitDescription] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverArea, setDragOverArea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState("live");
  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  const currentMuscleGroup = exerciseLibrary[selectedMuscleGroup];
  const exercises = currentMuscleGroup.exercises;
  const getTotalExercises = () => {
    try {
      return Object.values(weeklyPlan).reduce(
        (total, day) => total + (day.exercises?.length || 0),
        0,
      );
    } catch (error) {
      console.error("Error calculating total exercises:", error);
      return 0;
    }
  };
  const getCurrentDayExercises = () => {
    try {
      return weeklyPlan[selectedDay]?.exercises || [];
    } catch (error) {
      console.error("Error getting current day exercises:", error);
      return [];
    }
  };

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
    return category;
  };
  const groupExercisesByMuscleGroup = (exercises) => {
    const grouped = {};
    exercises.forEach((exercise) => {
      const muscleGroup = getMuscleGroupFromCategory(exercise.category);
      if (!grouped[muscleGroup]) {
        grouped[muscleGroup] = [];
      }
      grouped[muscleGroup].push(exercise);
    });
    return grouped;
  };
  const toggleRestDay = useCallback(() => {
    setWeeklyPlan((prev) => {
      if (!prev[selectedDay]) return prev;
      return {
        ...prev,
        [selectedDay]: {
          exercises: prev[selectedDay].isRestDay
            ? prev[selectedDay].exercises
            : [],
          isRestDay: !prev[selectedDay].isRestDay,
        },
      };
    });
  }, [selectedDay]);

  // Load split data for editing
  useEffect(() => {
    if (!splitId) {
      navigate("/your-workout-splits");
      return;
    }
    try {
      const customSplits = JSON.parse(
        localStorage.getItem("custom_workout_splits") || "[]",
      );
      const splitToEdit = customSplits.find(
        (split) => split.id.toString() === splitId,
      );
      if (!splitToEdit) {
        alert("Split not found!");
        navigate("/your-workout-splits");
        return;
      }

      // Load split data
      setSplitName(splitToEdit.name);
      setSplitDescription(splitToEdit.description || "");

      // Load weekly schedule if available
      if (splitToEdit.weeklySchedule) {
        const newWeeklyPlan = {
          ...weeklyPlan,
        };
        Object.keys(splitToEdit.weeklySchedule).forEach((day) => {
          if (newWeeklyPlan[day]) {
            const dayWorkout = splitToEdit.weeklySchedule[day];
            if (dayWorkout === "Rest Day") {
              newWeeklyPlan[day] = {
                exercises: [],
                isRestDay: true,
              };
            } else {
              // Parse exercises from the day's workout
              const exercises =
                splitToEdit.exercises?.filter((ex) => ex.day === day) || [];
              const mappedExercises = exercises.map((ex, index) => ({
                id: ex.id || `edit-${index}`,
                name: ex.name,
                category: ex.category || ex.muscle || "General",
                sets: ex.sets || "3x10-12",
                type: ex.type || "compound",
                difficulty: ex.difficulty || "intermediate",
                planId: `edit-${Date.now()}-${index}`,
                originalId: ex.id || `edit-${index}`,
                day: day,
              }));
              newWeeklyPlan[day] = {
                exercises: mappedExercises,
                isRestDay: false,
              };
            }
          }
        });
        setWeeklyPlan(newWeeklyPlan);
      } else {
        // Fallback for old format - distribute exercises across days
        const mappedExercises =
          splitToEdit.exercises?.map((ex, index) => ({
            id: ex.id || `edit-${index}`,
            name: ex.name,
            category: ex.category || ex.muscle || "General",
            sets: ex.sets || "3x10-12",
            type: ex.type || "compound",
            difficulty: ex.difficulty || "intermediate",
            planId: `edit-${Date.now()}-${index}`,
            originalId: ex.id || `edit-${index}`,
            day: ex.day || "Monday",
          })) || [];
        const newWeeklyPlan = {
          ...weeklyPlan,
        };
        mappedExercises.forEach((exercise) => {
          const day = exercise.day || "Monday";
          if (newWeeklyPlan[day]) {
            newWeeklyPlan[day].exercises.push(exercise);
          }
        });
        setWeeklyPlan(newWeeklyPlan);
      }
      setLoading(false);
      console.log("✅ Split loaded for editing:", splitToEdit.name);
    } catch (error) {
      console.error("Error loading split:", error);
      alert("Error loading split for editing");
      navigate("/your-workout-splits");
    }
  }, [splitId, navigate]);
  const handleDragStart = useCallback((e, item, source) => {
    setDraggedItem({
      item,
      source,
    });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        item,
        source,
      }),
    );
  }, []);
  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = "1";
    e.target.style.transform = "rotate(0deg)";
    setDraggedItem(null);
    setDragOverArea(null);
  }, []);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  }, []);
  const handleDragEnter = useCallback((e, area) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverArea(area);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverArea(null);
    }
  }, []);
  const handleDrop = useCallback(
    (e, targetArea) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverArea(null);
      let dragData;
      try {
        dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
      } catch (error) {
        dragData = draggedItem;
      }
      if (!dragData) return;
      const { item, source } = dragData;
      if (source === "library" && targetArea === "split") {
        const newSplitItem = {
          ...item,
          planId: `split-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          originalId: item.id,
          day: selectedDay,
        };
        setWeeklyPlan((prev) => ({
          ...prev,
          [selectedDay]: {
            ...prev[selectedDay],
            exercises: [...prev[selectedDay].exercises, newSplitItem],
            isRestDay: false,
          },
        }));
      } else if (source === "split" && targetArea === "library") {
        setWeeklyPlan((prev) => ({
          ...prev,
          [selectedDay]: {
            ...prev[selectedDay],
            exercises: prev[selectedDay].exercises.filter(
              (ex) => ex.planId !== item.planId,
            ),
          },
        }));
      }
      setDraggedItem(null);
    },
    [draggedItem, selectedDay],
  );
  const addToSplit = useCallback(
    (exercise) => {
      const newSplitItem = {
        ...exercise,
        planId: `split-${Date.now()}-${Math.random()}`,
        originalId: exercise.id,
        day: selectedDay,
      };
      setWeeklyPlan((prev) => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          exercises: [...prev[selectedDay].exercises, newSplitItem],
          isRestDay: false,
        },
      }));
    },
    [selectedDay],
  );
  const removeFromSplit = useCallback(
    (planId) => {
      setWeeklyPlan((prev) => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          exercises: prev[selectedDay].exercises.filter(
            (item) => item.planId !== planId,
          ),
        },
      }));
    },
    [selectedDay],
  );
  const moveUp = useCallback(
    (index) => {
      if (index === 0) return;
      setWeeklyPlan((prev) => {
        const exercises = [...prev[selectedDay].exercises];
        [exercises[index - 1], exercises[index]] = [
          exercises[index],
          exercises[index - 1],
        ];
        return {
          ...prev,
          [selectedDay]: {
            ...prev[selectedDay],
            exercises,
          },
        };
      });
    },
    [selectedDay],
  );
  const moveDown = useCallback(
    (index) => {
      setWeeklyPlan((prev) => {
        const exercises = [...prev[selectedDay].exercises];
        if (index === exercises.length - 1) return prev;
        [exercises[index], exercises[index + 1]] = [
          exercises[index + 1],
          exercises[index],
        ];
        return {
          ...prev,
          [selectedDay]: {
            ...prev[selectedDay],
            exercises,
          },
        };
      });
    },
    [selectedDay],
  );
  const updateSplit = async () => {
    if (!splitName.trim()) {
      alert("Please enter a split name");
      return;
    }
    if (getTotalExercises() === 0) {
      alert("Please add exercises to your split");
      return;
    }
    setSaving(true);
    setSyncStatus("saving");
    try {
      const updatedSplit = {
        id: parseInt(splitId),
        name: splitName.trim(),
        description:
          splitDescription ||
          `Custom workout split with ${getTotalExercises()} exercises`,
        category: ["custom"],
        frequency: `${Object.values(weeklyPlan).filter((day) => !day.isRestDay && day.exercises.length > 0).length} days/week`,
        difficulty: "Custom",
        duration: `${getTotalExercises() * 3}-${getTotalExercises() * 4} min`,
        weeklySchedule: Object.keys(weeklyPlan).reduce((schedule, day) => {
          if (weeklyPlan[day].isRestDay) {
            schedule[day] = "Rest Day";
          } else if (weeklyPlan[day].exercises.length > 0) {
            schedule[day] = weeklyPlan[day].exercises
              .map((ex) => ex.name)
              .join(", ");
          } else {
            schedule[day] = "No exercises planned";
          }
          return schedule;
        }, {}),
        muscles: Object.keys(weeklyPlan).reduce((muscles, day) => {
          if (
            !weeklyPlan[day].isRestDay &&
            weeklyPlan[day].exercises.length > 0
          ) {
            muscles[day] = weeklyPlan[day].exercises
              .map((ex) => ex.category || ex.name)
              .join(", ");
          }
          return muscles;
        }, {}),
        benefits: [
          "Custom designed",
          "Personalized training",
          "Your exercise selection",
        ],
        bestFor: "Custom workout based on your preferences",
        isCustom: true,
        createdBy: user?.name || "User",
        userId: user?._id || user?.id,
        exercises: Object.keys(weeklyPlan).reduce((allExercises, day) => {
          if (!weeklyPlan[day].isRestDay) {
            const dayExercises = weeklyPlan[day].exercises.map((exercise) => ({
              name: exercise.name,
              category: exercise.category,
              sets: exercise.sets,
              muscle: exercise.category,
              difficulty: exercise.difficulty || "intermediate",
              day: day,
            }));
            allExercises.push(...dayExercises);
          }
          return allExercises;
        }, []),
        updatedAt: new Date().toISOString(),
      };

      // Update in localStorage
      const existingCustomSplits = JSON.parse(
        localStorage.getItem("custom_workout_splits") || "[]",
      );
      const updatedSplits = existingCustomSplits.map((split) =>
        split.id.toString() === splitId
          ? {
              ...split,
              ...updatedSplit,
            }
          : split,
      );
      localStorage.setItem(
        "custom_workout_splits",
        JSON.stringify(updatedSplits),
      );
      setSyncStatus("synced");

      // Dispatch real-time event
      window.dispatchEvent(
        new CustomEvent("customSplitCreated", {
          detail: {
            split: updatedSplit,
          },
        }),
      );
      alert(
        `🚀 SPLIT UPDATED!\n\n✅ "${splitName}" updated successfully\n💪 ${getTotalExercises()} exercises included\n⚡ Changes saved!`,
      );

      // Navigate back to Your WorkoutSplits
      navigate("/your-workout-splits");
    } catch (error) {
      console.error("Error updating split:", error);
      setSyncStatus("error");
      alert("Failed to update split. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSyncStatus("live"), 3000);
    }
  };
  if (loading) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center",
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
        /*#__PURE__*/ React.createElement("div", null, "Loading Split..."),
      ),
    );
  }
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "bg-gradient-to-r from-gray-950 via-black to-gray-950 border-b border-orange-500/20 sticky top-0 z-40",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-center justify-between",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center space-x-2 sm:space-x-4",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => navigate("/your-workout-splits"),
                className:
                  "flex items-center space-x-1 sm:space-x-2 text-gray-400 hover:text-white transition-colors",
              },
              /*#__PURE__*/ React.createElement(ArrowLeft, {
                className: "w-4 h-4 sm:w-5 sm:h-5",
              }),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-sm sm:text-base truncate",
                },
                "Back to Your WorkoutSplits",
              ),
            ),
            /*#__PURE__*/ React.createElement("div", {
              className: "h-4 sm:h-6 w-px bg-gray-700",
            }),
            /*#__PURE__*/ React.createElement(
              "h1",
              {
                className:
                  "text-base sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent truncate",
              },
              "Edit Workout Split",
            ),
          ),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "bg-neutral-900 border border-neutral-800 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "h2",
          {
            className:
              "text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 text-white",
          },
          /*#__PURE__*/ React.createElement(RefreshCw, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          " EDITING WORKOUT SPLIT ",
          /*#__PURE__*/ React.createElement(Dumbbell, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-900/30 border border-red-600/50 rounded-lg",
          },
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-blue-300 text-xs sm:text-sm",
            },
            /*#__PURE__*/ React.createElement(CheckCircle2, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Edit mode active - You are editing an existing split",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-3 sm:space-y-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            null,
            /*#__PURE__*/ React.createElement("input", {
              type: "text",
              value: splitName,
              onChange: (e) => setSplitName(e.target.value),
              placeholder: "Enter split name...",
              className:
                "w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 text-sm sm:text-base",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            null,
            /*#__PURE__*/ React.createElement("textarea", {
              value: splitDescription,
              onChange: (e) => setSplitDescription(e.target.value),
              placeholder: "Describe your custom split (optional)...",
              rows: 2,
              className:
                "w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 resize-none text-sm sm:text-base",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex flex-col sm:flex-row gap-2 sm:gap-4",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => navigate("/your-workout-splits"),
                className:
                  "w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-medium inline-flex items-center justify-center gap-2 text-sm sm:text-base",
              },
              /*#__PURE__*/ React.createElement(Target, {
                className: "w-3 h-3 sm:w-4 sm:h-4",
              }),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "truncate",
                },
                "Your WorkoutSplits",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: updateSplit,
                disabled:
                  saving || !splitName.trim() || getTotalExercises() === 0,
                className:
                  "w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-red-800 to-red-700 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 rounded-lg font-medium text-sm sm:text-base",
              },
              saving ? "🔄 Updating..." : "💾 Update Split",
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `bg-neutral-900/60 border border-neutral-800 rounded-lg p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] transition-all duration-200 ${dragOverArea === "library" ? "bg-neutral-800/50 border-neutral-500 shadow-lg" : ""}`,
            onDragOver: handleDragOver,
            onDragEnter: (e) => handleDragEnter(e, "library"),
            onDragLeave: handleDragLeave,
            onDrop: (e) => handleDrop(e, "library"),
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "h3",
              {
                className:
                  "text-lg sm:text-xl font-semibold text-white flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "animate-pulse",
                },
                /*#__PURE__*/ React.createElement(Book, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                null,
                "Exercise Library",
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-xs sm:text-sm text-neutral-400",
                },
                "(",
                exercises.length,
                ")",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex items-center gap-2",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: `px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white ${currentMuscleGroup.color} shadow-lg`,
                },
                currentMuscleGroup.name,
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "mb-3 sm:mb-4",
            },
            /*#__PURE__*/ React.createElement(
              "h4",
              {
                className: "text-xs sm:text-sm font-medium text-white mb-2",
              },
              /*#__PURE__*/ React.createElement(Calendar, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Select Day",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "grid grid-cols-7 gap-1",
              },
              days.map((day) =>
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    key: day,
                    onClick: () => setSelectedDay(day),
                    className: `p-1 sm:p-2 rounded-lg text-xs font-medium transition-all ${selectedDay === day ? "bg-orange-600 text-white shadow-lg" : weeklyPlan[day]?.isRestDay ? "bg-gray-600 text-gray-300" : (weeklyPlan[day]?.exercises?.length || 0) > 0 ? "bg-green-600/30 text-green-300 border border-red-600/50" : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50"}`,
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "truncate text-xs",
                    },
                    day.slice(0, 3),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs mt-1",
                    },
                    weeklyPlan[day]?.isRestDay
                      ? "😴"
                      : (weeklyPlan[day]?.exercises?.length || 0) > 0
                        ? "💪"
                        : "⚪",
                  ),
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "mb-3 sm:mb-4",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: toggleRestDay,
                className: `w-full p-2 sm:p-3 rounded-lg font-medium transition-all text-sm sm:text-base ${weeklyPlan[selectedDay]?.isRestDay ? "bg-gray-600 text-white border border-gray-500" : "bg-neutral-800/50 text-neutral-300 hover:bg-gray-600/50 border border-neutral-700"}`,
              },
              weeklyPlan[selectedDay]?.isRestDay
                ? "😴 Rest Day Active"
                : "😴 Mark as Rest Day",
            ),
          ),
          !weeklyPlan[selectedDay]?.isRestDay &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2 mb-3 sm:mb-4",
              },
              Object.entries(exerciseLibrary).map(([key, group]) =>
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    key: key,
                    onClick: () => setSelectedMuscleGroup(key),
                    className: `p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedMuscleGroup === key ? `${group.color} text-white shadow-lg` : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50"}`,
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-lg sm:text-xl mb-1",
                    },
                    group.icon,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "truncate text-xs",
                    },
                    group.name,
                  ),
                ),
              ),
            ),
          !weeklyPlan[selectedDay]?.isRestDay
            ? /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto",
                },
                exercises.map((exercise, index) => {
                  const isInSplit = getCurrentDayExercises().some(
                    (p) => p.originalId === exercise.id,
                  );
                  return /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      key: exercise.id,
                      draggable: true,
                      onDragStart: (e) =>
                        handleDragStart(
                          e,
                          {
                            ...exercise,
                            category: currentMuscleGroup.name,
                          },
                          "library",
                        ),
                      onDragEnd: handleDragEnd,
                      className: `p-3 sm:p-4 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200 select-none transform hover:scale-[1.01] sm:hover:scale-[1.02] ${isInSplit ? "bg-green-900/30 border-green-700 shadow-green-900/20 shadow-lg" : "bg-neutral-900/60 border-neutral-800 hover:bg-neutral-800/60 hover:border-neutral-700 hover:shadow-md"}`,
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex items-center justify-between",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex-1 min-w-0",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex items-center gap-2",
                          },
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className:
                                "font-medium text-white text-sm sm:text-base truncate",
                            },
                            exercise.name,
                          ),
                          isInSplit &&
                            /*#__PURE__*/ React.createElement(
                              "span",
                              {
                                className:
                                  "text-red-500 text-xs bg-green-900/30 px-2 py-1 rounded-full border border-green-700 flex-shrink-0",
                              },
                              "\u2713 Added",
                            ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "text-xs sm:text-sm text-neutral-400 flex items-center gap-1 sm:gap-2 mt-1 flex-wrap",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "flex items-center gap-1",
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
                              exercise.sets,
                            ),
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: `px-1 sm:px-2 py-1 rounded text-xs border ${exercise.difficulty === "beginner" ? "bg-green-900/30 text-green-300 border-green-700" : exercise.difficulty === "intermediate" ? "bg-yellow-900/30 text-yellow-300 border-yellow-700" : "bg-red-900/30 text-red-300 border-red-700"}`,
                            },
                            exercise.difficulty,
                          ),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () =>
                            addToSplit({
                              ...exercise,
                              category: currentMuscleGroup.name,
                            }),
                          disabled: isInSplit,
                          className: `text-base sm:text-lg font-bold w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0 ${isInSplit ? "text-red-500 bg-green-900/30 border border-green-700 cursor-not-allowed" : "text-red-500 hover:text-blue-300 hover:bg-blue-900/20 border border-transparent hover:border-blue-700"}`,
                        },
                        isInSplit ? "✓" : "+",
                      ),
                    ),
                  );
                }),
              )
            : /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center justify-center h-64 border-2 border-dashed border-gray-600 rounded-xl",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-6xl mb-4",
                    },
                    /*#__PURE__*/ React.createElement(Moon, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "h4",
                    {
                      className: "text-gray-300 text-lg font-semibold mb-2",
                    },
                    selectedDay,
                    " - Rest Day",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className: "text-gray-400",
                    },
                    "No exercises planned for this day",
                  ),
                ),
              ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 min-h-[500px] transition-all duration-300 ${dragOverArea === "split" ? "bg-green-900/30 border-red-500 shadow-xl ring-2 ring-red-500/50 scale-[1.02]" : "hover:bg-neutral-900/80 hover:border-neutral-700"}`,
            onDragOver: handleDragOver,
            onDragEnter: (e) => handleDragEnter(e, "split"),
            onDragLeave: handleDragLeave,
            onDrop: (e) => handleDrop(e, "split"),
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center justify-between mb-5",
            },
            /*#__PURE__*/ React.createElement(
              "h3",
              {
                className:
                  "text-2xl font-bold text-white flex items-center gap-3",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-3xl animate-pulse",
                },
                /*#__PURE__*/ React.createElement(Target, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "bg-gradient-to-r from-red-600 to-red-600 bg-clip-text text-transparent",
                },
                "Editing Your Split",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className:
                  "text-sm font-medium text-neutral-300 bg-neutral-800/60 px-3 py-2 rounded-full border border-neutral-700 shadow-sm",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-red-500 mr-1",
                },
                /*#__PURE__*/ React.createElement(BarChart3, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
              ),
              getCurrentDayExercises().length,
              " ",
              getCurrentDayExercises().length === 1 ? "exercise" : "exercises",
              " today",
            ),
          ),
          getCurrentDayExercises().length === 0
            ? /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center justify-center min-h-[300px] border-2 border-dashed border-neutral-700 rounded-xl",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-center px-6 py-8",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-6xl mb-4 animate-bounce",
                    },
                    /*#__PURE__*/ React.createElement(Target, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "h4",
                    {
                      className: "text-neutral-300 text-xl font-semibold mb-2",
                    },
                    weeklyPlan[selectedDay]?.isRestDay
                      ? `${selectedDay} - Rest Day`
                      : `Plan ${selectedDay} Workout`,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className: "text-neutral-400 text-base mb-3",
                    },
                    weeklyPlan[selectedDay]?.isRestDay
                      ? "This is a rest day - no exercises planned"
                      : "Drag exercises here or tap the + button to add them",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "space-y-3",
                    },
                    /*#__PURE__*/ React.createElement(
                      "p",
                      {
                        className: "text-neutral-500 text-sm",
                      },
                      "Edit Your Custom Workout Split",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-sm mx-auto",
                      },
                      Object.entries(muscleGroupMapping).map(([name, config]) =>
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            key: name,
                            className:
                              "text-center p-2 bg-neutral-900/30 rounded-lg border border-neutral-800",
                          },
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-base sm:text-lg mb-1",
                            },
                            config.icon,
                          ),
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "text-xs text-neutral-400",
                            },
                            name,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              )
            : /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "space-y-4 sm:space-y-6 max-h-[500px] sm:max-h-[600px] overflow-y-auto",
                },
                (() => {
                  const groupedExercises = groupExercisesByMuscleGroup(
                    getCurrentDayExercises(),
                  );
                  return Object.entries(groupedExercises)
                    .map(([muscleGroup, exercises]) => {
                      const config = muscleGroupMapping[muscleGroup];
                      if (!config || exercises.length === 0) return null;
                      return /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          key: muscleGroup,
                          className:
                            "bg-neutral-900/40 rounded-xl border border-neutral-800/50 overflow-hidden",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: `${config.color} bg-opacity-20 border-b border-neutral-800/50 px-3 sm:px-4 py-2 sm:py-3`,
                          },
                          /*#__PURE__*/ React.createElement(
                            "div",
                            {
                              className: "flex items-center justify-between",
                            },
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: "flex items-center gap-2 sm:gap-3",
                              },
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "text-xl sm:text-2xl",
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
                                      "text-white font-semibold text-base sm:text-lg",
                                  },
                                  muscleGroup,
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "p",
                                  {
                                    className:
                                      "text-neutral-400 text-xs sm:text-sm",
                                  },
                                  exercises.length,
                                  " exercise",
                                  exercises.length !== 1 ? "s" : "",
                                ),
                              ),
                            ),
                            /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                className: `px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white ${config.color} bg-opacity-80`,
                              },
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "hidden sm:inline",
                                },
                                muscleGroup,
                                " Workout",
                              ),
                              /*#__PURE__*/ React.createElement(
                                "span",
                                {
                                  className: "sm:hidden",
                                },
                                muscleGroup,
                              ),
                            ),
                          ),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "p-3 sm:p-4 space-y-2 sm:space-y-3",
                          },
                          exercises.map((exercise, exerciseIndex) => {
                            const globalIndex =
                              getCurrentDayExercises().findIndex(
                                (ex) => ex.planId === exercise.planId,
                              );
                            return /*#__PURE__*/ React.createElement(
                              "div",
                              {
                                key: exercise.planId,
                                className:
                                  "group p-3 sm:p-4 rounded-lg bg-gradient-to-r from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 border border-neutral-700/50 transition-all duration-300 hover:shadow-lg select-none",
                              },
                              /*#__PURE__*/ React.createElement(
                                "div",
                                {
                                  className: "flex items-center gap-2 sm:gap-4",
                                },
                                /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className: "flex-shrink-0",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "span",
                                    {
                                      className: `text-white font-bold text-xs sm:text-sm ${config.color} bg-opacity-80 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border border-neutral-700`,
                                    },
                                    exerciseIndex + 1,
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
                                      className: "flex items-center gap-2 mb-1",
                                    },
                                    /*#__PURE__*/ React.createElement(
                                      "h5",
                                      {
                                        className:
                                          "font-medium text-white text-sm sm:text-base truncate",
                                      },
                                      exercise.name,
                                    ),
                                    /*#__PURE__*/ React.createElement(
                                      "span",
                                      {
                                        className:
                                          "text-xs bg-neutral-800/60 text-neutral-300 px-2 py-1 rounded-md border border-neutral-700 flex-shrink-0",
                                      },
                                      "\u2713 In Split",
                                    ),
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "div",
                                    {
                                      className:
                                        "flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-neutral-400",
                                    },
                                    /*#__PURE__*/ React.createElement(
                                      "span",
                                      {
                                        className:
                                          "flex items-center gap-1 bg-neutral-800/40 px-1 sm:px-2 py-1 rounded border border-neutral-700",
                                      },
                                      /*#__PURE__*/ React.createElement(
                                        "span",
                                        null,
                                        /*#__PURE__*/ React.createElement(
                                          Dumbbell,
                                          {
                                            className:
                                              "w-[1em] h-[1em] inline-block",
                                          },
                                        ),
                                      ),
                                      /*#__PURE__*/ React.createElement(
                                        "span",
                                        null,
                                        exercise.sets,
                                      ),
                                    ),
                                    exercise.difficulty &&
                                      /*#__PURE__*/ React.createElement(
                                        "span",
                                        {
                                          className: `px-1 sm:px-2 py-1 rounded text-xs border ${exercise.difficulty === "beginner" ? "bg-green-900/30 text-green-300 border-green-700/50" : exercise.difficulty === "intermediate" ? "bg-yellow-900/30 text-yellow-300 border-yellow-700/50" : "bg-red-900/30 text-red-300 border-red-700/50"}`,
                                        },
                                        exercise.difficulty,
                                      ),
                                  ),
                                ),
                                /*#__PURE__*/ React.createElement(
                                  "div",
                                  {
                                    className: "flex items-center gap-1",
                                  },
                                  /*#__PURE__*/ React.createElement(
                                    "button",
                                    {
                                      onClick: () => moveUp(globalIndex),
                                      disabled: globalIndex === 0,
                                      className:
                                        "text-neutral-400 hover:text-white disabled:opacity-30 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-neutral-700/50 transition-all",
                                    },
                                    /*#__PURE__*/ React.createElement(
                                      ChevronUp,
                                      {
                                        className: "w-3 h-3",
                                      },
                                    ),
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "button",
                                    {
                                      onClick: () => moveDown(globalIndex),
                                      disabled:
                                        globalIndex ===
                                        getCurrentDayExercises().length - 1,
                                      className:
                                        "text-neutral-400 hover:text-white disabled:opacity-30 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-neutral-700/50 transition-all",
                                    },
                                    /*#__PURE__*/ React.createElement(
                                      ChevronDown,
                                      {
                                        className: "w-3 h-3",
                                      },
                                    ),
                                  ),
                                  /*#__PURE__*/ React.createElement(
                                    "button",
                                    {
                                      onClick: () =>
                                        removeFromSplit(exercise.planId),
                                      className:
                                        "text-red-400 hover:text-red-300 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-red-900/30 transition-all",
                                    },
                                    /*#__PURE__*/ React.createElement(Trash2, {
                                      className: "w-3 h-3 sm:w-4 sm:h-4",
                                    }),
                                  ),
                                ),
                              ),
                            );
                          }),
                        ),
                      );
                    })
                    .filter(Boolean);
                })(),
              ),
        ),
      ),
    ),
  );
};
export default EditSplit;
