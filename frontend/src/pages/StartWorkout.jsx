// Real-time Start Workout Component
import { Dumbbell, BicepsFlexed, Trophy, Target, Antenna, Star, Zap, Pause, AlertTriangle, Settings, Rocket, Play, CheckCircle2, PartyPopper, Smile, Angry, Frown, ArrowRight, Bed, ClipboardList, Wind, Activity, Lightbulb, Pencil, Timer, Bomb, Flame, Save } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";
import { onlineService } from "../services/onlineService";
import PRService from "../services/prService";
import PRNotification from "../components/PRNotification";
import { getFormTips } from "../data/exerciseFormTips";


export default function StartWorkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { updateWorkoutStats, triggerUpdate } = useRealTime();
  const [exercise, setExercise] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [workoutData, setWorkoutData] = useState({
    sets: [],
    notes: "",
    startTime: new Date(),
    duration: 0,
    targetSets: 3,
    targetReps: 12,
  });
  const [showSetSelector, setShowSetSelector] = useState(false);
  const [customSets, setCustomSets] = useState(3);
  const [currentSet, setCurrentSet] = useState({
    reps: "",
    weight: "",
    rest: 60,
  });
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [workoutStarted, setWorkoutStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSetInProgress, setCurrentSetInProgress] = useState(false);
  const [isInRestPeriod, setIsInRestPeriod] = useState(false);
  const [showRestChoice, setShowRestChoice] = useState(false);
  const [currentSetTimer, setCurrentSetTimer] = useState(0);
  const [totalWorkoutTime, setTotalWorkoutTime] = useState(0);
  const [currentSetStarted, setCurrentSetStarted] = useState(false);
  const [showWorkoutComplete, setShowWorkoutComplete] = useState(false);
  const [editingSetIndex, setEditingSetIndex] = useState(null);
  const [editSetData, setEditSetData] = useState({
    reps: "",
    weight: "",
  });
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [planExercisesCompleted, setPlanExercisesCompleted] = useState([]);
  useEffect(() => {
    // Get exercise and configuration from navigation state
    const selectedExercise = location.state?.selectedExercise;
    const workoutConfig = location.state?.workoutConfig;
    const plan = location.state?.workoutPlan;

    // Handle workout plan from My Plans page
    if (plan) {
      setWorkoutPlan(plan);
      // Set first exercise from the plan
      if (plan.exercises && plan.exercises.length > 0) {
        const firstExercise = plan.exercises[0];
        setExercise({
          id: firstExercise.id || Date.now(),
          name: firstExercise.name,
          category: firstExercise.category || plan.category || "General",
          icon: /*#__PURE__*/ React.createElement(Dumbbell, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          color: "bg-orange-500",
          sets: firstExercise.sets || "3 sets",
          difficulty: plan.difficulty || "intermediate",
        });
        setShowSetSelector(true);
      }
      return;
    }
    if (selectedExercise) {
      setExercise(selectedExercise);

      // Apply workout configuration if provided
      if (workoutConfig) {
        setCurrentSet({
          reps: workoutConfig.targetReps.toString(),
          weight: workoutConfig.weight.toString(),
          rest: workoutConfig.restTime,
        });

        // Set initial workout data with config
        setWorkoutData((prev) => ({
          ...prev,
          notes: workoutConfig.notes || "",
          targetSets: workoutConfig.targetSets,
          targetReps: workoutConfig.targetReps,
        }));
        setCustomSets(workoutConfig.targetSets);
      } else {
        // Show set selector for new workouts
        setShowSetSelector(true);
      }
    } else {
      // Fallback exercise if none provided
      setExercise({
        id: 1,
        name: "Push-ups",
        category: "Chest",
        icon: /*#__PURE__*/ React.createElement(BicepsFlexed, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        color: "bg-red-600",
        sets: "3 sets of 10-15 reps",
        difficulty: "beginner",
      });
      setShowSetSelector(true);
    }

    // Check online status
    checkOnlineStatus();
  }, [location.state]);

  // Timer effect - workout timer pauses during rest and choice selection
  useEffect(() => {
    if (!workoutStarted || isPaused) return;
    const interval = setInterval(() => {
      // Current set timer - only runs when set is started and not resting/choosing and workout not complete
      if (
        !isResting &&
        !showRestChoice &&
        currentSetStarted &&
        !showWorkoutComplete
      ) {
        setCurrentSetTimer((prev) => prev + 1);
      }

      // Handle rest timer separately
      if (isResting && restTimer > 0) {
        setRestTimer((prev) => prev - 1);
      } else if (isResting && restTimer === 0) {
        setIsResting(false);
        setIsInRestPeriod(false);
        // Ensure inputs are clear when rest ends
        if (!currentSet.reps && !currentSet.weight) {
          // Inputs already cleared, ready for next set
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [
    workoutStarted,
    isPaused,
    isResting,
    restTimer,
    showRestChoice,
    currentSetStarted,
    showWorkoutComplete,
  ]);
  const checkOnlineStatus = async () => {
    try {
      const online = await onlineService.checkBackendStatus();
      setIsOnline(online);
    } catch (error) {
      setIsOnline(false);
    }
  };
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const finishSet = () => {
    if (currentSet.reps && currentSet.weight) {
      const newSet = {
        ...currentSet,
        reps: parseInt(currentSet.reps),
        weight: parseFloat(currentSet.weight),
        timestamp: new Date(),
        duration: currentSetTimer, // Save current set duration
      };
      const updatedSets = [...workoutData.sets, newSet];
      setWorkoutData((prev) => ({
        ...prev,
        sets: updatedSets,
      }));

      // Add current set time to total workout time
      setTotalWorkoutTime((prev) => prev + currentSetTimer);

      // Reset current set timer for next set
      setCurrentSetTimer(0);

      // Check if all target sets are completed
      if (updatedSets.length >= workoutData.targetSets) {
        // All sets completed - stop timers and show completion message
        setCurrentSetStarted(false);
        setShowWorkoutComplete(true);
      } else {
        // More sets remaining - show rest choice
        setShowRestChoice(true);
      }

      // Don't reset here - will be reset when user chooses rest option
    }
  };
  const startRest = () => {
    setIsResting(true);
    setIsInRestPeriod(true);
    setRestTimer(currentSet.rest || 60);
    setShowRestChoice(false);
    // Clear inputs for next set - user must enter new values
    setCurrentSet((prev) => ({
      ...prev,
      reps: "",
      weight: "",
    }));
    // Reset set started state - user must start next set manually
    setCurrentSetStarted(false);
  };
  const skipRest = () => {
    setShowRestChoice(false);
    // Clear inputs for next set - user must enter new values
    setCurrentSet((prev) => ({
      ...prev,
      reps: "",
      weight: "",
    }));
    // Reset set started state - user must start next set manually
    setCurrentSetStarted(false);
  };
  const finishRest = () => {
    // Immediately end the rest period
    setIsResting(false);
    setIsInRestPeriod(false);
    setRestTimer(0);
    // Clear inputs for next set - user must enter new values
    setCurrentSet((prev) => ({
      ...prev,
      reps: "",
      weight: "",
    }));
    // Reset set started state - user must start next set manually
    setCurrentSetStarted(false);
  };
  const finishWorkout = async () => {
    // Calculate total active workout time (excluding rest periods)
    const totalActiveTime = totalWorkoutTime + currentSetTimer;

    // Check if this is part of a workout plan
    const isPartOfPlan = workoutPlan !== null;
    const hasMoreExercises =
      isPartOfPlan && currentExerciseIndex < workoutPlan.exercises.length - 1;

    // If moving to next exercise in plan, allow even with 0 sets (already saved)
    if (workoutData.sets.length === 0 && !hasMoreExercises) {
      alert("Please add at least one set before finishing the workout.");
      return;
    }

    // If moving to next exercise and sets are already saved, skip saving again
    if (workoutData.sets.length === 0 && hasMoreExercises) {
      const nextIndex = currentExerciseIndex + 1;
      const nextExercise = workoutPlan.exercises[nextIndex];
      setCurrentExerciseIndex(nextIndex);
      setExercise({
        id: nextExercise.id || Date.now(),
        name: nextExercise.name,
        category: nextExercise.category || workoutPlan.category || "General",
        icon: /*#__PURE__*/ React.createElement(Dumbbell, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        color: "bg-orange-500",
        sets: nextExercise.sets || "3 sets",
        difficulty: workoutPlan.difficulty || "intermediate",
      });
      setWorkoutData({
        sets: [],
        notes: "",
        startTime: new Date(),
        duration: 0,
        targetSets: 3,
        targetReps: 12,
      });
      setCurrentSet({
        reps: "",
        weight: "",
        rest: 60,
      });
      setCurrentSetTimer(0);
      setTotalWorkoutTime(0);
      setWorkoutStarted(false);
      setCurrentSetStarted(false);
      setShowWorkoutComplete(false);
      setShowSetSelector(true);
      return;
    }

    // Save current exercise completion
    const exerciseCompletion = {
      exerciseName: exercise.name,
      sets: workoutData.sets.length,
      reps: workoutData.sets.reduce((total, set) => total + set.reps, 0),
      totalWeight: workoutData.sets.reduce(
        (total, set) => total + set.weight * set.reps,
        0,
      ),
      duration: totalActiveTime,
      setsData: workoutData.sets,
    };
    setPlanExercisesCompleted((prev) => [...prev, exerciseCompletion]);

    // If there are more exercises in the plan, move to next exercise
    if (hasMoreExercises) {
      const nextIndex = currentExerciseIndex + 1;
      const nextExercise = workoutPlan.exercises[nextIndex];
      setCurrentExerciseIndex(nextIndex);
      setExercise({
        id: nextExercise.id || Date.now(),
        name: nextExercise.name,
        category: nextExercise.category || workoutPlan.category || "General",
        icon: /*#__PURE__*/ React.createElement(Dumbbell, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        color: "bg-orange-500",
        sets: nextExercise.sets || "3 sets",
        difficulty: workoutPlan.difficulty || "intermediate",
      });

      // Reset workout state for next exercise
      setWorkoutData({
        sets: [],
        notes: "",
        startTime: new Date(),
        duration: 0,
        targetSets: 3,
        targetReps: 12,
      });
      setCurrentSet({
        reps: "",
        weight: "",
        rest: 60,
      });
      setCurrentSetTimer(0);
      setWorkoutStarted(false);
      setCurrentSetStarted(false);
      setShowSetSelector(true);
      return; // Don't finish the entire workout yet
    }

    // Complete the entire workout (single exercise or last exercise in plan)
    const completedWorkout = isPartOfPlan
      ? {
          id: Date.now(),
          exercise: `${workoutPlan.name} Plan`,
          name: `${workoutPlan.name} Workout`,
          category: workoutPlan.category || "Plan Workout",
          muscle: workoutPlan.category || "Multiple",
          difficulty: workoutPlan.difficulty || "Intermediate",
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          duration:
            planExercisesCompleted.reduce((sum, ex) => sum + ex.duration, 0) +
            totalActiveTime,
          totalTime: timer,
          activeTime:
            planExercisesCompleted.reduce((sum, ex) => sum + ex.duration, 0) +
            totalActiveTime,
          caloriesBurned:
            Math.floor(
              ((planExercisesCompleted.reduce(
                (sum, ex) => sum + ex.duration,
                0,
              ) +
                totalActiveTime) /
                60) *
                5,
            ) +
            (planExercisesCompleted.length + 1) * 20,
          sets:
            planExercisesCompleted.reduce((sum, ex) => sum + ex.sets, 0) +
            workoutData.sets.length,
          reps:
            planExercisesCompleted.reduce((sum, ex) => sum + ex.reps, 0) +
            workoutData.sets.reduce((total, set) => total + set.reps, 0),
          totalWeight:
            planExercisesCompleted.reduce(
              (sum, ex) => sum + ex.totalWeight,
              0,
            ) +
            workoutData.sets.reduce(
              (total, set) => total + set.weight * set.reps,
              0,
            ),
          userId: user?.id,
          user: user?.id,
          savedOffline: !isOnline,
          notes:
            workoutData.notes ||
            `Completed ${workoutPlan.name} plan with ${planExercisesCompleted.length + 1} exercises`,
          planId: workoutPlan.id,
          planName: workoutPlan.name,
          exercises: [...planExercisesCompleted, exerciseCompletion],
        }
      : {
          id: Date.now(),
          exercise: exercise.name,
          name: exercise.name,
          category: exercise.category || exercise.muscle || "Other",
          muscle: exercise.category || exercise.muscle || "Other",
          difficulty: exercise.difficulty,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          duration: totalActiveTime,
          totalTime: timer,
          activeTime: totalActiveTime,
          caloriesBurned:
            Math.floor((totalActiveTime / 60) * 5) +
            workoutData.sets.length * 10,
          sets: workoutData.sets.length,
          reps: workoutData.sets.reduce((total, set) => total + set.reps, 0),
          totalWeight: workoutData.sets.reduce(
            (total, set) => total + set.weight * set.reps,
            0,
          ),
          userId: user?.id,
          user: user?.id,
          savedOffline: !isOnline,
          notes:
            workoutData.notes ||
            `Completed ${workoutData.sets.length} sets in ${formatTime(totalActiveTime)} active time`,
          setsData: workoutData.sets,
        };

    // Check for new Personal Records (PRs)
    if (user?.id) {
      const newPRs = PRService.checkAndUpdatePR(user.id, exercise.name, {
        id: completedWorkout.id,
        sets: workoutData.sets,
      });
      if (newPRs.length > 0) {
        console.log("🏆 New PR detected!", newPRs);
        // PR notification will be shown automatically via event listener
      }
    }
    console.log("🎯 StartWorkout: Saving completed workout:", completedWorkout);
    try {
      // Save to localStorage for /workouts page
      const existing = JSON.parse(
        localStorage.getItem("completedWorkouts") || "[]",
      );
      const updatedWorkouts = [completedWorkout, ...existing];
      localStorage.setItem(
        "completedWorkouts",
        JSON.stringify(updatedWorkouts),
      );

      // Calculate real-time stats
      const todayWorkouts = updatedWorkouts.filter(
        (w) =>
          new Date(w.completedAt).toDateString() === new Date().toDateString(),
      ).length;
      const weeklyWorkouts = updatedWorkouts.filter((w) => {
        const workoutDate = new Date(w.completedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return workoutDate >= weekAgo;
      }).length;

      // Trigger comprehensive real-time events with duration data
      window.dispatchEvent(
        new CustomEvent("workoutCompleted", {
          detail: completedWorkout,
        }),
      );
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
            totalDuration: updatedWorkouts.reduce(
              (sum, w) => sum + (w.duration || 0),
              0,
            ),
          },
        }),
      );

      // Trigger analytics refresh specifically
      window.dispatchEvent(
        new CustomEvent("analyticsRefresh", {
          detail: {
            workout: completedWorkout,
            duration: totalActiveTime,
          },
        }),
      );
      console.log(
        "📡 Events dispatched: workoutCompleted, realTimeStatsUpdate, analyticsRefresh",
      );

      // Trigger streak update
      window.dispatchEvent(
        new CustomEvent("streakUpdated", {
          detail: {
            type: "WORKOUT_COMPLETED",
            currentStreak: todayWorkouts,
            exercise: exercise.name,
          },
        }),
      );
      console.log("🎯 Workout saved to localStorage:", completedWorkout);
      console.log("🎯 Total workouts in storage:", updatedWorkouts.length);

      // Navigate to analytics page to show the updated charts
      navigate("/analytics", {
        state: {
          workoutCompleted: true,
          exercise: exercise.name,
          duration: formatTime(totalActiveTime),
          sets: workoutData.sets.length,
          calories: completedWorkout.caloriesBurned,
        },
      });
    } catch (error) {
      console.error("Error finishing workout:", error);
      alert("Error saving workout. Please try again.");
    }
  };
  if (!exercise) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex items-center justify-center min-h-screen",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-white",
        },
        "Loading workout...",
      ),
    );
  }
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-gradient-to-br from-black via-gray-900 to-black",
    },
    /*#__PURE__*/ React.createElement(PRNotification, null),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "bg-gradient-to-r from-orange-600/10 via-red-600/10 to-orange-600/10 border-b border-orange-500/20 backdrop-blur-sm",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 md:py-4",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-center justify-between gap-2",
          },
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => navigate("/library"),
              className:
                "flex items-center gap-1.5 sm:gap-2 md:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-lg sm:rounded-xl border border-neutral-700/50 text-neutral-300 hover:text-white transition-all duration-300 backdrop-blur-sm",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-orange-400 text-sm sm:text-base",
              },
              "\u2190",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "font-semibold text-[10px] sm:text-xs md:text-sm",
              },
              "EXERCISE LIBRARY",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: `px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-lg sm:rounded-xl font-bold text-[9px] sm:text-xs md:text-sm border backdrop-blur-sm ${isOnline ? "bg-green-600/20 text-red-500 border-red-600/30 shadow-lg shadow-red-600/20" : "bg-yellow-600/20 text-yellow-400 border-yellow-500/30 shadow-lg shadow-yellow-500/20"}`,
            },
            isOnline ? <><Flame className="w-[1em] h-[1em] inline-block"/> LIVE SYNC</> : <><Zap className="w-[1em] h-[1em] inline-block"/> OFFLINE</>,
          ),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6 md:space-y-8",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-neutral-900/90 via-gray-800/90 to-black/90 border border-orange-500/20 backdrop-blur-sm ${isPaused ? "ring-2 ring-yellow-500/50 shadow-2xl shadow-yellow-500/20" : "shadow-2xl shadow-orange-500/10"}`,
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "absolute inset-0 opacity-5",
          },
          /*#__PURE__*/ React.createElement("div", {
            className: "absolute inset-0",
            style: {
              backgroundImage:
                "radial-gradient(circle at 25% 25%, #ff6b35 0%, transparent 50%), radial-gradient(circle at 75% 75%, #f7931e 0%, transparent 50%)",
            },
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "relative p-3 sm:p-4 md:p-6",
          },
          workoutPlan &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "mb-3 sm:mb-4 p-2 sm:p-2.5 md:p-3 bg-red-700/20 border border-red-600/30 rounded-lg",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center justify-between mb-1.5 sm:mb-2",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-blue-300 font-bold text-xs sm:text-sm",
                  },
                  /*#__PURE__*/ React.createElement(Dumbbell, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " ",
                  workoutPlan.name,
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "text-red-500 text-[10px] sm:text-xs md:text-sm",
                  },
                  "Exercise ",
                  currentExerciseIndex + 1,
                  " of ",
                  workoutPlan.exercises.length,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "w-full bg-neutral-800 rounded-full h-1.5 sm:h-2",
                },
                /*#__PURE__*/ React.createElement("div", {
                  className:
                    "bg-red-600 h-1.5 sm:h-2 rounded-full transition-all duration-300",
                  style: {
                    width: `${((currentExerciseIndex + 1) / workoutPlan.exercises.length) * 100}%`,
                  },
                }),
              ),
            ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: `w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 ${exercise.color} rounded-xl sm:rounded-2xl flex items-center justify-center relative shadow-2xl border-2 border-orange-500/30`,
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className: "text-2xl sm:text-3xl md:text-4xl",
                },
                exercise.icon,
              ),
              isPaused &&
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-xs sm:text-sm text-black font-bold",
                    },
                    /*#__PURE__*/ React.createElement(Pause, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex-1 min-w-0",
              },
              /*#__PURE__*/ React.createElement(
                "h1",
                {
                  className:
                    "text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white mb-1 sm:mb-1.5 md:mb-2 tracking-wide truncate",
                  style: {
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                  },
                },
                exercise.name.toUpperCase(),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-orange-600/20 text-orange-400 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold border border-orange-500/30",
                  },
                  exercise.category.toUpperCase(),
                ),
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "text-neutral-300 font-medium text-[10px] sm:text-xs md:text-sm truncate",
                  },
                  exercise.sets,
                ),
              ),
              isPaused &&
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "mt-1.5 sm:mt-2 px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-yellow-600/20 text-yellow-400 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold animate-pulse border border-yellow-500/30",
                  },
                  /*#__PURE__*/ React.createElement(Pause, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " WORKOUT PAUSED",
                ),
            ),
          ),
        ),
      ),
      showSetSelector &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "bg-neutral-900 rounded-xl p-4 sm:p-5 md:p-6 max-w-md w-full",
            },
            /*#__PURE__*/ React.createElement(
              "h3",
              {
                className:
                  "text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4",
              },
              "How many sets do you want to perform?",
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              {
                className:
                  "text-xs sm:text-sm text-neutral-300 mb-4 sm:mb-5 md:mb-6",
              },
              "Choose the number of sets for your ",
              exercise.name,
              " workout.",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "grid grid-cols-3 gap-2 sm:gap-2.5 md:gap-3 mb-4 sm:mb-5 md:mb-6",
              },
              [1, 2, 3, 4, 5, 6].map((num) =>
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    key: num,
                    onClick: () => setCustomSets(num),
                    className: `p-2.5 sm:p-3 md:p-4 rounded-lg text-center transition-all ${customSets === num ? "bg-red-700 text-white border-2 border-red-500" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border-2 border-transparent"}`,
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-lg sm:text-xl md:text-2xl font-bold",
                    },
                    num,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-[9px] sm:text-[10px] md:text-xs",
                    },
                    num === 1 ? "set" : "sets",
                  ),
                ),
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "mb-4 sm:mb-5 md:mb-6",
              },
              /*#__PURE__*/ React.createElement(
                "label",
                {
                  className:
                    "block text-[10px] sm:text-xs md:text-sm font-medium text-neutral-300 mb-2",
                },
                "Custom amount:",
              ),
              /*#__PURE__*/ React.createElement("input", {
                type: "number",
                value: customSets,
                onChange: (e) =>
                  setCustomSets(Math.max(1, parseInt(e.target.value) || 1)),
                className:
                  "w-full p-2.5 sm:p-3 rounded-lg bg-neutral-800 border border-neutral-700 text-white text-xs sm:text-sm",
                min: "1",
                max: "20",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex gap-2 sm:gap-2.5 md:gap-3",
              },
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => navigate("/library"),
                  className:
                    "btn-secondary flex-1 text-xs sm:text-sm py-2 sm:py-2.5",
                },
                "Cancel",
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => {
                    setWorkoutData((prev) => ({
                      ...prev,
                      targetSets: customSets,
                    }));
                    setShowSetSelector(false);
                    setShowWorkoutComplete(false);
                  },
                  className:
                    "btn bg-red-700 hover:bg-blue-700 text-white flex-1 text-xs sm:text-sm py-2 sm:py-2.5",
                },
                "Start with ",
                customSets,
                " ",
                customSets === 1 ? "set" : "sets",
              ),
            ),
          ),
        ),
      !workoutStarted &&
        !showSetSelector &&
        !showWorkoutComplete &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-r from-green-600/20 to-red-700/20 border border-red-600/30 rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-5 md:mb-6 text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-1.5 sm:mb-2",
            },
            "Ready to Start?",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-xs sm:text-sm text-neutral-300 mb-1.5 sm:mb-2",
            },
            "Target: ",
            workoutData.targetSets,
            " ",
            workoutData.targetSets === 1 ? "set" : "sets",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className:
                "text-neutral-400 mb-3 sm:mb-4 text-[10px] sm:text-xs md:text-sm",
            },
            "Enter your reps and weight before starting the workout.",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 max-w-md mx-auto",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "label",
                {
                  className:
                    "block text-[10px] sm:text-xs md:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2",
                },
                "Reps",
              ),
              /*#__PURE__*/ React.createElement("input", {
                type: "number",
                value: currentSet.reps,
                onChange: (e) =>
                  setCurrentSet((prev) => ({
                    ...prev,
                    reps: e.target.value,
                  })),
                className:
                  "w-full p-2.5 sm:p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center text-xs sm:text-sm",
                placeholder: "12",
                min: "1",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "label",
                {
                  className:
                    "block text-[10px] sm:text-xs md:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2",
                },
                "Weight (kg)",
              ),
              /*#__PURE__*/ React.createElement("input", {
                type: "number",
                step: "0.5",
                value: currentSet.weight,
                onChange: (e) =>
                  setCurrentSet((prev) => ({
                    ...prev,
                    weight: e.target.value,
                  })),
                className:
                  "w-full p-2.5 sm:p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center text-xs sm:text-sm",
                placeholder: "20",
                min: "0",
              }),
            ),
          ),
          (!currentSet.reps || !currentSet.weight) &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-2 sm:p-2.5 md:p-3 mb-3 sm:mb-4 text-yellow-300 text-[10px] sm:text-xs md:text-sm",
              },
              /*#__PURE__*/ React.createElement(AlertTriangle, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Please enter both reps and weight to start your workout",
            ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex flex-col sm:flex-row gap-2 sm:gap-2.5 md:gap-3 justify-center",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => setShowSetSelector(true),
                className:
                  "btn bg-neutral-700 hover:bg-neutral-800 text-white px-4 py-2 sm:px-5 sm:py-2.5 md:px-6 md:py-3 text-xs sm:text-sm",
              },
              /*#__PURE__*/ React.createElement(Settings, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Change Sets",
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => {
                  if (!currentSet.reps || !currentSet.weight) {
                    alert(
                      "Please enter both reps and weight before starting the workout!",
                    );
                    return;
                  }
                  setWorkoutStarted(true);
                  setCurrentSetStarted(true);
                },
                disabled: !currentSet.reps || !currentSet.weight,
                className:
                  "btn bg-green-600 hover:bg-green-700 text-white px-6 py-2 sm:px-7 sm:py-2.5 md:px-8 md:py-3 text-sm sm:text-base md:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
              },
              /*#__PURE__*/ React.createElement(Rocket, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Start Workout",
            ),
          ),
        ),
      workoutStarted &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "bg-neutral-900/50 rounded-lg p-4 mb-6",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center mb-4",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-3xl font-bold text-red-500 mb-2",
              },
              showRestChoice
                ? formatTime(0)
                : isResting
                  ? formatTime(0)
                  : formatTime(currentSetTimer),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-sm text-neutral-400",
              },
              showRestChoice
                ? "Set Completed - Choose Rest Option"
                : isResting
                  ? "Resting (Set Timer Reset)"
                  : !currentSetStarted && workoutData.sets.length > 0
                    ? `Set ${workoutData.sets.length + 1} - Enter Details to Start`
                    : "Current Set Duration",
            ),
            totalWorkoutTime > 0 &&
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xs text-neutral-500 mt-1",
                },
                "Total Active Time: ",
                formatTime(totalWorkoutTime),
              ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "mt-3",
              },
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => setIsPaused(!isPaused),
                  className: `btn ${isPaused ? "bg-green-600 hover:bg-green-700" : "bg-yellow-600 hover:bg-yellow-700"} text-white px-6 py-2`,
                },
                isPaused ? <><Play className="w-[1em] h-[1em] inline-block"/> Resume Workout</> : <><Pause className="w-[1em] h-[1em] inline-block"/> Pause Workout</>,
              ),
            ),
            isPaused &&
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "mt-2 text-yellow-400 text-sm animate-pulse",
                },
                /*#__PURE__*/ React.createElement(Pause, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Workout paused - Timer stopped",
              ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "mb-3",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "flex justify-between text-sm text-neutral-400 mb-1",
              },
              /*#__PURE__*/ React.createElement("span", null, "Progress"),
              /*#__PURE__*/ React.createElement(
                "span",
                null,
                workoutData.sets.length,
                " / ",
                workoutData.targetSets,
                " sets",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "w-full bg-neutral-800 rounded-full h-2",
              },
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "bg-red-600 h-2 rounded-full transition-all duration-300",
                style: {
                  width: `${Math.min(100, (workoutData.sets.length / workoutData.targetSets) * 100)}%`,
                },
              }),
            ),
          ),
          workoutData.sets.length >= workoutData.targetSets &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-center text-red-500 text-sm font-medium",
              },
              /*#__PURE__*/ React.createElement(CheckCircle2, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Target sets completed! You can add more or finish.",
            ),
        ),
      showWorkoutComplete &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-r from-green-600/30 to-red-700/30 border border-red-500 rounded-lg p-8 mb-6 text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-4xl mb-4",
            },
            /*#__PURE__*/ React.createElement(PartyPopper, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-3xl font-bold text-red-500 mb-3",
            },
            "Congratulations!",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-xl font-semibold text-white mb-2",
            },
            "You have successfully completed",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-2xl font-bold text-red-500 mb-4",
            },
            workoutData.targetSets,
            " sets of ",
            exercise.name,
            "!",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "bg-neutral-900/50 rounded-lg p-4 mb-6",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "grid grid-cols-3 gap-4 text-center",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                null,
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-2xl font-bold text-red-500",
                  },
                  workoutData.sets.length,
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-sm text-neutral-300",
                  },
                  "Sets Completed",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                null,
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-2xl font-bold text-red-500",
                  },
                  formatTime(totalWorkoutTime + currentSetTimer),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-sm text-neutral-300",
                  },
                  "Active Time",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                null,
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-2xl font-bold text-red-600",
                  },
                  workoutData.sets.reduce((total, set) => total + set.reps, 0),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-sm text-neutral-300",
                  },
                  "Total Reps",
                ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "bg-neutral-900/30 border border-neutral-700 rounded-lg p-6 mb-6",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-lg font-semibold text-white mb-3",
              },
              "How did this workout feel?",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-sm text-neutral-300 mb-4",
              },
              "Select how you felt during this workout:",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "grid grid-cols-2 md:grid-cols-4 gap-3 mb-4",
              },
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () =>
                    setWorkoutData((prev) => ({
                      ...prev,
                      notes: prev.notes ? `${prev.notes} • Easy` : "Easy",
                    })),
                  className:
                    "btn bg-green-600/20 border border-red-600 text-green-300 hover:bg-green-600/40 px-4 py-3 transition-all duration-200",
                },
                /*#__PURE__*/ React.createElement(Smile, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Easy",
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () =>
                    setWorkoutData((prev) => ({
                      ...prev,
                      notes: prev.notes ? `${prev.notes} • Hard` : "Hard",
                    })),
                  className:
                    "btn bg-red-600/20 border border-red-500 text-red-300 hover:bg-red-600/40 px-4 py-3 transition-all duration-200",
                },
                /*#__PURE__*/ React.createElement(Angry, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Hard",
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () =>
                    setWorkoutData((prev) => ({
                      ...prev,
                      notes: prev.notes ? `${prev.notes} • Perfect` : "Perfect",
                    })),
                  className:
                    "btn bg-red-700/20 border border-red-600 text-blue-300 hover:bg-red-700/40 px-4 py-3 transition-all duration-200",
                },
                /*#__PURE__*/ React.createElement(Target, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Perfect",
              ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () =>
                    setWorkoutData((prev) => ({
                      ...prev,
                      notes: prev.notes
                        ? `${prev.notes} • Struggled`
                        : "Struggled",
                    })),
                  className:
                    "btn bg-orange-600/20 border border-orange-500 text-orange-300 hover:bg-orange-600/40 px-4 py-3 transition-all duration-200",
                },
                /*#__PURE__*/ React.createElement(Frown, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Struggled",
              ),
            ),
            workoutData.notes &&
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-sm text-neutral-400 bg-neutral-800/50 rounded-lg p-3",
                },
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "font-medium",
                  },
                  "Your feedback:",
                ),
                " ",
                workoutData.notes,
              ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-lg text-green-300 mb-6",
            },
            /*#__PURE__*/ React.createElement(BicepsFlexed, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Outstanding effort! You've crushed your workout goals!",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex gap-3 justify-center",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => {
                  setShowWorkoutComplete(false);
                  // Add one more set if user wants
                  setCurrentSet((prev) => ({
                    ...prev,
                    reps: "",
                    weight: "",
                  }));
                  setCurrentSetStarted(false);
                },
                className:
                  "btn bg-red-700 hover:bg-blue-700 text-white px-6 py-3",
              },
              /*#__PURE__*/ React.createElement(BicepsFlexed, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Add Bonus Set",
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: finishWorkout,
                className:
                  "btn bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold",
              },
              workoutPlan &&
                currentExerciseIndex < workoutPlan.exercises.length - 1
                ? <><ArrowRight className="w-[1em] h-[1em] inline-block"/> Next Exercise</> : <><Trophy className="w-[1em] h-[1em] inline-block"/> Finish Workout</>,
            ),
          ),
        ),
      showRestChoice &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-red-700/20 border border-red-600 rounded-lg p-6 mb-6 text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-2xl font-bold text-white mb-3",
            },
            /*#__PURE__*/ React.createElement(CheckCircle2, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Set Completed!",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-300 mb-4",
            },
            "What would you like to do next?",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex gap-3 justify-center",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: startRest,
                className:
                  "btn bg-orange-600 hover:bg-orange-700 text-white px-6 py-3",
              },
              /*#__PURE__*/ React.createElement(Bed, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Take Rest (",
              Math.floor(currentSet.rest / 60),
              ":",
              (currentSet.rest % 60).toString().padStart(2, "0"),
              ")",
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: skipRest,
                className:
                  "btn bg-green-600 hover:bg-green-700 text-white px-6 py-3",
              },
              /*#__PURE__*/ React.createElement(Rocket, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Next Set Now",
            ),
          ),
        ),
      isResting &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `border rounded-lg p-4 mb-6 text-center transition-all duration-300 ${!isPaused && restTimer <= 10 && restTimer > 0 ? "bg-red-600/30 border-red-400 animate-pulse shadow-lg shadow-red-500/20" : "bg-orange-600/20 border-orange-500"}`,
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: `text-2xl font-bold mb-2 transition-all duration-300 ${!isPaused && restTimer <= 10 && restTimer > 0 ? "text-red-300 animate-bounce text-3xl" : "text-orange-400"}`,
            },
            /*#__PURE__*/ React.createElement(Bed, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Rest: ",
            isPaused ? <><Pause className="w-[1em] h-[1em] inline-block"/> Paused</> : formatTime(restTimer),
          ),
          !isPaused &&
            restTimer > 10 &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "mb-4 p-4 bg-red-700/20 border border-red-500/50 rounded-lg",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-sm font-semibold text-blue-300 mb-3 flex items-center gap-2",
                },
                /*#__PURE__*/ React.createElement(ClipboardList, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Form Reminder for ",
                exercise.name,
              ),
              (() => {
                const tips = getFormTips(exercise.name);
                const randomTip =
                  tips.formTips[
                    Math.floor(restTimer / 10) % tips.formTips.length
                  ];
                return /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "space-y-2",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm text-blue-200 flex items-start gap-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-red-500 mt-0.5",
                      },
                      "\u2022",
                    ),
                    /*#__PURE__*/ React.createElement("span", null, randomTip),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-xs text-blue-300 bg-red-700/20 rounded p-2 border border-red-600/30",
                    },
                    /*#__PURE__*/ React.createElement(Wind, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " ",
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "font-medium",
                      },
                      "Remember:",
                    ),
                    " ",
                    tips.breathingTip,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "text-xs text-orange-300 bg-orange-600/20 rounded p-2 border border-orange-500/30",
                    },
                    /*#__PURE__*/ React.createElement(Activity, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " ",
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "font-medium",
                      },
                      "Rest Focus:",
                    ),
                    " ",
                    tips.restPeriodTip,
                  ),
                );
              })(),
            ),
          !isPaused &&
            restTimer <= 10 &&
            restTimer > 0 &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "mb-4 p-4 bg-red-600/50 border-2 border-red-400 rounded-lg animate-pulse",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xl font-bold text-red-200 mb-2 animate-bounce",
                },
                /*#__PURE__*/ React.createElement(AlertTriangle, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " ",
                restTimer,
                " SECONDS LEFT!",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-sm text-red-300 font-semibold",
                },
                /*#__PURE__*/ React.createElement(Star, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Get ready for your next set!",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xs text-red-200 mt-1",
                },
                "Prepare yourself - rest time almost over!",
              ),
              (() => {
                const tips = getFormTips(exercise.name);
                const urgentTip = tips.formTips[0]; // Show first/most important tip
                return /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "mt-3 p-2 bg-red-700/30 rounded border border-red-500/50",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs text-red-200 font-medium",
                    },
                    /*#__PURE__*/ React.createElement(Target, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " Quick Form Check: ",
                    urgentTip,
                  ),
                );
              })(),
            ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-sm text-orange-300",
            },
            isPaused
              ? "Rest timer paused"
              : `Take a break before your next set (${Math.floor(currentSet.rest / 60)}:${(currentSet.rest % 60).toString().padStart(2, "0")} total)`,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-xs text-blue-300 mt-1",
            },
            /*#__PURE__*/ React.createElement(Lightbulb, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Workout timer paused during rest",
          ),
          isPaused &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-xs text-yellow-200 mt-1",
              },
              /*#__PURE__*/ React.createElement(Pause, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Resume to continue rest timer",
            ),
          !isPaused &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "mt-4",
              },
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: finishRest,
                  className:
                    "btn bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold transition-all duration-200 transform hover:scale-105",
                },
                /*#__PURE__*/ React.createElement(Rocket, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Finish Rest Now",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xs text-green-300 mt-2",
                },
                /*#__PURE__*/ React.createElement(BicepsFlexed, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Ready to continue? Skip the remaining rest time!",
              ),
            ),
        ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-[10px] sm:text-xs md:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2",
            },
            "Reps ",
            workoutData.sets.length > 0 &&
              `(Set ${workoutData.sets.length + 1})`,
          ),
          /*#__PURE__*/ React.createElement("input", {
            type: "number",
            value: currentSet.reps,
            onChange: (e) =>
              setCurrentSet((prev) => ({
                ...prev,
                reps: e.target.value,
              })),
            className:
              "w-full p-2.5 sm:p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-xs sm:text-sm",
            placeholder:
              workoutData.sets.length > 0 ? "Enter reps for next set" : "12",
            disabled: isPaused,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-[10px] sm:text-xs md:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2",
            },
            "Weight (kg) ",
            workoutData.sets.length > 0 &&
              `(Set ${workoutData.sets.length + 1})`,
          ),
          /*#__PURE__*/ React.createElement("input", {
            type: "number",
            step: "0.5",
            value: currentSet.weight,
            onChange: (e) =>
              setCurrentSet((prev) => ({
                ...prev,
                weight: e.target.value,
              })),
            className:
              "w-full p-2.5 sm:p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-xs sm:text-sm",
            placeholder:
              workoutData.sets.length > 0 ? "Enter weight for next set" : "20",
            disabled: isPaused,
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className:
                "block text-[10px] sm:text-xs md:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2",
            },
            "Rest Time (",
            Math.floor(currentSet.rest / 60),
            ":",
            (currentSet.rest % 60).toString().padStart(2, "0"),
            ")",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center gap-1.5 sm:gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  setCurrentSet((prev) => ({
                    ...prev,
                    rest: Math.max(15, prev.rest - 15),
                  })),
                disabled: isPaused,
                className:
                  "w-7 h-7 sm:w-8 sm:h-8 bg-neutral-800 hover:bg-neutral-700 rounded flex items-center justify-center text-white text-xs sm:text-sm disabled:opacity-50",
              },
              "-",
            ),
            /*#__PURE__*/ React.createElement("input", {
              type: "number",
              value: currentSet.rest,
              onChange: (e) =>
                setCurrentSet((prev) => ({
                  ...prev,
                  rest: parseInt(e.target.value) || 60,
                })),
              className:
                "flex-1 p-2.5 sm:p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center text-xs sm:text-sm",
              min: "15",
              max: "900",
              placeholder: "60",
              disabled: isPaused,
            }),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  setCurrentSet((prev) => ({
                    ...prev,
                    rest: prev.rest + 15,
                  })),
                disabled: isPaused,
                className:
                  "w-7 h-7 sm:w-8 sm:h-8 bg-neutral-800 hover:bg-neutral-700 rounded flex items-center justify-center text-white text-xs sm:text-sm disabled:opacity-50",
              },
              "+",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex gap-0.5 sm:gap-1 mt-1.5 sm:mt-2",
            },
            [30, 60, 90, 120, 180].map((time) =>
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  key: time,
                  onClick: () =>
                    setCurrentSet((prev) => ({
                      ...prev,
                      rest: time,
                    })),
                  disabled: isPaused,
                  className: `px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[9px] sm:text-[10px] md:text-xs transition-colors disabled:opacity-50 ${currentSet.rest === time ? "bg-red-700 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`,
                },
                time >= 60 ? `${Math.floor(time / 60)}m` : `${time}s`,
              ),
            ),
          ),
        ),
      ),
      workoutStarted &&
        /*#__PURE__*/ React.createElement(
          React.Fragment,
          null,
          workoutData.sets.length > 0 &&
            !isResting &&
            !showRestChoice &&
            !showWorkoutComplete &&
            !currentSetStarted &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "bg-gradient-to-r from-green-600/20 to-red-700/20 border border-red-600/30 rounded-lg p-6 mb-6 text-center",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-2xl font-bold text-white mb-2",
                },
                "Ready for Set ",
                workoutData.sets.length + 1,
                "?",
              ),
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className: "text-neutral-300 mb-2",
                },
                "Target: ",
                workoutData.targetSets,
                " ",
                workoutData.targetSets === 1 ? "set" : "sets",
              ),
              /*#__PURE__*/ React.createElement(
                "p",
                {
                  className: "text-neutral-400 mb-4 text-sm",
                },
                "Enter your reps and weight before starting this set.",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-w-md mx-auto",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "label",
                    {
                      className:
                        "block text-sm font-medium text-neutral-300 mb-2",
                    },
                    "Reps",
                  ),
                  /*#__PURE__*/ React.createElement("input", {
                    type: "number",
                    value: currentSet.reps,
                    onChange: (e) =>
                      setCurrentSet((prev) => ({
                        ...prev,
                        reps: e.target.value,
                      })),
                    className:
                      "w-full p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center",
                    placeholder: "12",
                    min: "1",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  null,
                  /*#__PURE__*/ React.createElement(
                    "label",
                    {
                      className:
                        "block text-sm font-medium text-neutral-300 mb-2",
                    },
                    "Weight (kg)",
                  ),
                  /*#__PURE__*/ React.createElement("input", {
                    type: "number",
                    step: "0.5",
                    value: currentSet.weight,
                    onChange: (e) =>
                      setCurrentSet((prev) => ({
                        ...prev,
                        weight: e.target.value,
                      })),
                    className:
                      "w-full p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center",
                    placeholder: "20",
                    min: "0",
                  }),
                ),
              ),
              (!currentSet.reps || !currentSet.weight) &&
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 mb-4 text-yellow-300 text-sm",
                  },
                  /*#__PURE__*/ React.createElement(AlertTriangle, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Please enter both reps and weight to start Set ",
                  workoutData.sets.length + 1,
                ),
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => {
                    if (!currentSet.reps || !currentSet.weight) {
                      alert(
                        `Please enter both reps and weight before starting Set ${workoutData.sets.length + 1}!`,
                      );
                      return;
                    }
                    setCurrentSetStarted(true);
                  },
                  disabled: !currentSet.reps || !currentSet.weight,
                  className:
                    "btn bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
                },
                /*#__PURE__*/ React.createElement(Rocket, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Start Set ",
                workoutData.sets.length + 1,
              ),
            ),
          currentSetStarted &&
            !showWorkoutComplete &&
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: finishSet,
                disabled:
                  !currentSet.reps ||
                  !currentSet.weight ||
                  isResting ||
                  isPaused ||
                  showRestChoice,
                className:
                  "btn bg-red-700 hover:bg-blue-700 text-white w-full mb-6 disabled:opacity-50",
              },
              isPaused
                ? "Workout Paused"
                : isResting
                  ? "Resting..."
                  : showRestChoice
                    ? "Choose Rest Option Above"
                    : `✅ Finish Set ${workoutData.sets.length + 1}`,
            ),
          workoutPlan &&
            workoutData.sets.length > 0 &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "bg-red-700/20 border border-red-600/30 rounded-lg p-4 mb-6 text-center",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-blue-300 text-sm mb-2",
                },
                /*#__PURE__*/ React.createElement(Dumbbell, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Workout Plan Progress",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-white font-bold",
                },
                planExercisesCompleted.length,
                " of ",
                workoutPlan.exercises.length,
                " exercises completed",
              ),
              currentExerciseIndex < workoutPlan.exercises.length - 1 &&
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-red-500 text-sm mt-2",
                  },
                  /*#__PURE__*/ React.createElement(ArrowRight, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Next: ",
                  workoutPlan.exercises[currentExerciseIndex + 1].name,
                ),
            ),
        ),
      workoutPlan &&
        planExercisesCompleted.length > 0 &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mb-6",
          },
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className:
                "text-lg font-semibold text-white mb-4 flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              null,
              /*#__PURE__*/ React.createElement(CheckCircle2, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              null,
              "Completed Exercises (",
              planExercisesCompleted.length,
              "/",
              workoutPlan.exercises.length,
              ")",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "space-y-3",
            },
            planExercisesCompleted.map((completedEx, idx) =>
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  key: idx,
                  className:
                    "bg-green-900/20 border border-red-600/30 rounded-lg p-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center justify-between mb-3",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center gap-3",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold",
                      },
                      "\u2713",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      null,
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "font-bold text-white",
                        },
                        completedEx.exerciseName,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-sm text-green-300",
                        },
                        "Exercise ",
                        idx + 1,
                        " - Completed",
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-right",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-red-500 font-bold",
                      },
                      formatTime(completedEx.duration),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xs text-neutral-400",
                      },
                      "Duration",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "grid grid-cols-3 gap-3 mb-3",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "bg-neutral-900/50 rounded-lg p-2 text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-lg font-bold text-red-500",
                      },
                      completedEx.sets,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xs text-neutral-400",
                      },
                      "Sets",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "bg-neutral-900/50 rounded-lg p-2 text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-lg font-bold text-red-600",
                      },
                      completedEx.reps,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xs text-neutral-400",
                      },
                      "Total Reps",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "bg-neutral-900/50 rounded-lg p-2 text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-lg font-bold text-orange-400",
                      },
                      completedEx.totalWeight.toFixed(1),
                      "kg",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "text-xs text-neutral-400",
                      },
                      "Total Weight",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "space-y-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs text-neutral-400 mb-1",
                    },
                    "Set Details:",
                  ),
                  completedEx.setsData.map((set, setIdx) =>
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        key: setIdx,
                        className:
                          "flex items-center justify-between bg-neutral-900/30 rounded p-2",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-neutral-300 text-sm",
                        },
                        "Set ",
                        setIdx + 1,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-white text-sm font-medium",
                        },
                        set.reps,
                        " reps \xD7 ",
                        set.weight,
                        "kg",
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      workoutData.sets.length > 0 &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mb-6",
          },
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-lg font-semibold text-white mb-4",
            },
            "Completed Sets (Current Exercise)",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "space-y-2",
            },
            workoutData.sets.map((set, index) =>
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  key: index,
                  className: `rounded-lg p-3 transition-all duration-200 ${editingSetIndex === index ? "bg-red-700/20 border-2 border-red-500" : "bg-neutral-900/30 hover:bg-neutral-800/40 cursor-pointer"}`,
                },
                editingSetIndex === index
                  ? /*#__PURE__*/
                    // Edit Mode
                    React.createElement(
                      "div",
                      {
                        className: "space-y-3",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex items-center justify-between mb-2",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-blue-300 font-medium",
                          },
                          /*#__PURE__*/ React.createElement(Pencil, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Editing Set ",
                          index + 1,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-xs text-neutral-400",
                          },
                          /*#__PURE__*/ React.createElement(Timer, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " ",
                          formatTime(set.duration || 0),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "grid grid-cols-2 gap-3",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "label",
                            {
                              className: "block text-xs text-neutral-300 mb-1",
                            },
                            "Reps",
                          ),
                          /*#__PURE__*/ React.createElement("input", {
                            type: "number",
                            value: editSetData.reps,
                            onChange: (e) =>
                              setEditSetData((prev) => ({
                                ...prev,
                                reps: e.target.value,
                              })),
                            className:
                              "w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white text-center",
                            min: "1",
                          }),
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          null,
                          /*#__PURE__*/ React.createElement(
                            "label",
                            {
                              className: "block text-xs text-neutral-300 mb-1",
                            },
                            "Weight (kg)",
                          ),
                          /*#__PURE__*/ React.createElement("input", {
                            type: "number",
                            step: "0.5",
                            value: editSetData.weight,
                            onChange: (e) =>
                              setEditSetData((prev) => ({
                                ...prev,
                                weight: e.target.value,
                              })),
                            className:
                              "w-full p-2 rounded bg-neutral-800 border border-neutral-700 text-white text-center",
                            min: "0",
                          }),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex gap-2 justify-end",
                        },
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => {
                              setEditingSetIndex(null);
                              setEditSetData({
                                reps: "",
                                weight: "",
                              });
                            },
                            className:
                              "px-3 py-1 text-xs bg-neutral-700 hover:bg-neutral-800 text-white rounded",
                          },
                          "Cancel",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "button",
                          {
                            onClick: () => {
                              if (editSetData.reps && editSetData.weight) {
                                const updatedSets = [...workoutData.sets];
                                updatedSets[index] = {
                                  ...updatedSets[index],
                                  reps: parseInt(editSetData.reps),
                                  weight: parseFloat(editSetData.weight),
                                };
                                setWorkoutData((prev) => ({
                                  ...prev,
                                  sets: updatedSets,
                                }));
                                setEditingSetIndex(null);
                                setEditSetData({
                                  reps: "",
                                  weight: "",
                                });
                              }
                            },
                            disabled: !editSetData.reps || !editSetData.weight,
                            className:
                              "px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50",
                          },
                          /*#__PURE__*/ React.createElement(CheckCircle2, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " Save",
                        ),
                      ),
                    )
                  : /*#__PURE__*/
                    // View Mode
                    React.createElement(
                      "div",
                      {
                        onClick: () => {
                          setEditingSetIndex(index);
                          setEditSetData({
                            reps: set.reps.toString(),
                            weight: set.weight.toString(),
                          });
                        },
                        className: "flex items-center justify-between",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex flex-col",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-white font-medium",
                          },
                          "Set ",
                          index + 1,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-xs text-neutral-400",
                          },
                          /*#__PURE__*/ React.createElement(Timer, {
                            className: "w-[1em] h-[1em] inline-block",
                          }),
                          " ",
                          formatTime(set.duration || 0),
                        ),
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex items-center gap-3",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className: "text-neutral-300",
                          },
                          set.reps,
                          " reps \xD7 ",
                          set.weight,
                          "kg",
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "flex items-center gap-1",
                          },
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className: "text-red-500",
                            },
                            "\u2713",
                          ),
                          /*#__PURE__*/ React.createElement(
                            "span",
                            {
                              className:
                                "text-xs text-neutral-500 hover:text-red-500",
                            },
                            /*#__PURE__*/ React.createElement(Pencil, {
                              className: "w-[1em] h-[1em] inline-block",
                            }),
                          ),
                        ),
                      ),
                    ),
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-xs text-neutral-500 mt-2 text-center",
            },
            /*#__PURE__*/ React.createElement(Lightbulb, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Click any completed set to edit it",
          ),
        ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mb-4 sm:mb-5 md:mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "label",
          {
            className:
              "block text-[10px] sm:text-xs md:text-sm font-medium text-neutral-300 mb-1.5 sm:mb-2",
          },
          "Notes",
        ),
        /*#__PURE__*/ React.createElement("textarea", {
          value: workoutData.notes,
          onChange: (e) =>
            setWorkoutData((prev) => ({
              ...prev,
              notes: e.target.value,
            })),
          className:
            "w-full p-2.5 sm:p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-xs sm:text-sm",
          rows: 3,
          placeholder: "How did this exercise feel? Any observations...",
          disabled: isPaused,
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4",
        },
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: () => navigate("/library"),
            className: "btn-secondary flex-1 text-xs sm:text-sm py-2 sm:py-2.5",
          },
          "Cancel",
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: finishWorkout,
            disabled: workoutData.sets.length === 0 || isPaused,
            className:
              "btn bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50 font-semibold text-xs sm:text-sm py-2 sm:py-2.5",
          },
          isPaused
            ? <><Play className="w-[1em] h-[1em] inline-block"/> Resume to Finish</>
            : workoutPlan &&
                currentExerciseIndex < workoutPlan.exercises.length - 1
              ? <><ArrowRight className="w-[1em] h-[1em] inline-block"/> Next Exercise ({workoutData.sets.length}/{workoutData.targetSets})</>
              : <><CheckCircle2 className="w-[1em] h-[1em] inline-block"/> Finish Workout ({workoutData.sets.length}/{workoutData.targetSets})</>,
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-700/20 via-blue-700/20 to-blue-800/20 border border-red-600/30 p-3 sm:p-4 md:p-6 text-center backdrop-blur-sm ${isPaused ? "opacity-60" : ""}`,
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent",
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "relative",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-2xl sm:text-3xl md:text-4xl font-black text-red-500 mb-1 sm:mb-1.5 md:mb-2",
              },
              workoutData.sets.length,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-[10px] sm:text-xs md:text-sm font-bold text-blue-300 uppercase tracking-wider",
              },
              /*#__PURE__*/ React.createElement(Trophy, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " SETS COMPLETED",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-600/20 via-green-700/20 to-green-800/20 border border-red-600/30 p-3 sm:p-4 md:p-6 text-center backdrop-blur-sm ${isPaused ? "opacity-60" : ""}`,
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent",
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "relative",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-2xl sm:text-3xl md:text-4xl font-black text-red-500 mb-1 sm:mb-1.5 md:mb-2",
              },
              workoutData.sets.reduce((total, set) => total + set.reps, 0),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-[10px] sm:text-xs md:text-sm font-bold text-green-300 uppercase tracking-wider",
              },
              /*#__PURE__*/ React.createElement(Bomb, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " TOTAL REPS",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-800/20 via-purple-700/20 to-purple-800/20 border border-red-700/30 p-3 sm:p-4 md:p-6 text-center backdrop-blur-sm ${isPaused ? "opacity-60" : ""}`,
          },
          /*#__PURE__*/ React.createElement("div", {
            className:
              "absolute inset-0 bg-gradient-to-br from-red-700/10 to-transparent",
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "relative",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-2xl sm:text-3xl md:text-4xl font-black text-red-600 mb-1 sm:mb-1.5 md:mb-2",
              },
              showWorkoutComplete
                ? formatTime(totalWorkoutTime)
                : formatTime(totalWorkoutTime + currentSetTimer),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "text-[10px] sm:text-xs md:text-sm font-bold text-purple-300 uppercase tracking-wider",
              },
              /*#__PURE__*/ React.createElement(Zap, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " ",
              showWorkoutComplete ? "FINAL ACTIVE TIME" : "ACTIVE TIME",
            ),
            isPaused &&
              !showWorkoutComplete &&
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-[9px] sm:text-[10px] md:text-xs text-yellow-400 mt-1.5 sm:mt-2 font-bold animate-pulse",
                },
                /*#__PURE__*/ React.createElement(Pause, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " PAUSED",
              ),
            showWorkoutComplete &&
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-[9px] sm:text-[10px] md:text-xs text-red-500 mt-1.5 sm:mt-2 font-bold",
                },
                /*#__PURE__*/ React.createElement(CheckCircle2, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " COMPLETED",
              ),
          ),
        ),
      ),
    ),
  );
}
