import { Target, BarChart3, RefreshCw, CheckCircle2, AlertTriangle, Trash2, XCircle, BicepsFlexed, Dumbbell } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";
import { workoutSync } from "../services/workoutSync";
import { realTimeWorkoutSync } from "../services/realTimeWorkoutSync";
import api from "../utils/api";



export default function CompletedWorkouts() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline } = useRealTime();
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, today, week, month
  const [sortBy, setSortBy] = useState("recent"); // recent, duration, calories
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load completed workouts
  useEffect(() => {
    // Clean up fake workouts first
    if (typeof window.cleanupFakeWorkouts === "function") {
      window.cleanupFakeWorkouts();
    }
    loadCompletedWorkouts();
  }, [user, isOnline]);

  // Listen for real-time workout completions and sync events
  useEffect(() => {
    const handleWorkoutCompleted = (event) => {
      if (event.detail) {
        console.log(
          "🎯 CompletedWorkouts: Received workout completion event:",
          event.detail,
        );

        // Reload workouts from real-time sync service to ensure consistency
        setTimeout(() => {
          loadCompletedWorkouts();
        }, 100);
      }
    };
    const handleStatsUpdate = () => {
      // Reload workouts when stats are updated
      console.log("📊 Stats updated, refreshing workout list");
      loadCompletedWorkouts();
    };
    const handleRefreshWorkouts = () => {
      console.log("🔄 Refresh workouts event received");
      loadCompletedWorkouts();
    };
    const handleRealTimeSync = (event) => {
      console.log(
        "🔄 CompletedWorkouts: Real-time sync received:",
        event.detail,
      );
      // Refresh workouts to sync with latest data
      loadCompletedWorkouts();
    };
    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    window.addEventListener("realTimeStatsUpdate", handleStatsUpdate);
    window.addEventListener("refreshCompletedWorkouts", handleRefreshWorkouts);
    window.addEventListener("realTimeStatsSync", handleRealTimeSync);
    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
      window.removeEventListener("realTimeStatsUpdate", handleStatsUpdate);
      window.removeEventListener(
        "refreshCompletedWorkouts",
        handleRefreshWorkouts,
      );
      window.removeEventListener("realTimeStatsSync", handleRealTimeSync);
    };
  }, [user]);
  const loadCompletedWorkouts = async () => {
    try {
      setLoading(true);

      // Attempt to load from MongoDB Atlas API
      try {
        const res = await api.get('/workouts');
        const dbWorkouts = Array.isArray(res.data) ? res.data : (res.data?.workouts || []);
        
        if (dbWorkouts && dbWorkouts.length > 0) {
          const normalized = dbWorkouts.map(w => ({
            ...w,
            id: w._id || w.id,
            exercise: w.title || w.name || 'Workout Session',
            name: w.title || w.name || 'Workout Session',
            completedAt: w.completedAt || w.date || w.createdAt,
            duration: w.durationMinutes ? w.durationMinutes * 60 : (w.duration || 0),
            caloriesBurned: w.calories || w.caloriesBurned || 0,
            sets: w.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) || 0,
            totalVolume: w.totalVolume || 0
          }));

          setCompletedWorkouts(normalized);
          console.log("✅ Loaded real workouts from MongoDB API:", normalized.length);
          return;
        }
      } catch (apiError) {
        console.warn("API fetch failed, trying local sync service fallback:", apiError.message);
      }

      // Fallback to local sync service
      const workouts = realTimeWorkoutSync.getWorkoutHistory(365);
      setCompletedWorkouts(workouts);
    } catch (error) {
      console.error("Error loading workouts:", error);
      setCompletedWorkouts([]);
    } finally {
      setLoading(false);
    }
  };
  const filteredWorkouts = completedWorkouts.filter((workout) => {
    const workoutDate = new Date(workout.completedAt);
    const now = new Date();
    switch (filter) {
      case "today":
        return workoutDate.toDateString() === now.toDateString();
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return workoutDate >= weekAgo;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return workoutDate >= monthAgo;
      default:
        return true;
    }
  });
  const sortedWorkouts = [...filteredWorkouts].sort((a, b) => {
    switch (sortBy) {
      case "duration":
        return (b.duration || 0) - (a.duration || 0);
      case "calories":
        return (b.caloriesBurned || 0) - (a.caloriesBurned || 0);
      default:
        return new Date(b.completedAt) - new Date(a.completedAt);
    }
  });
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };
  const deleteWorkout = async (workoutId) => {
    try {
      if (workoutId) {
        try {
          await api.delete(`/workouts/${workoutId}`);
          console.log("✅ Workout deleted from MongoDB Atlas");
        } catch (apiError) {
          console.warn("MongoDB delete API call:", apiError.message);
        }
      }

      setCompletedWorkouts(prev => prev.filter(w => (w._id || w.id) !== workoutId));
      setDeleteConfirm(null);

      // Refresh real-time stats
      window.dispatchEvent(new CustomEvent("realTimeStatsUpdate"));
    } catch (error) {
      console.error("Error deleting workout:", error);
    }
  };
  if (loading) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "space-y-4",
      },
      [...Array(3)].map((_, i) =>
        /*#__PURE__*/ React.createElement(
          "div",
          {
            key: i,
            className: "bg-neutral-900/50 rounded-xl p-6 animate-pulse",
          },
          /*#__PURE__*/ React.createElement("div", {
            className: "h-4 bg-neutral-800 rounded w-1/4 mb-2",
          }),
          /*#__PURE__*/ React.createElement("div", {
            className: "h-3 bg-neutral-800 rounded w-1/2 mb-4",
          }),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex gap-4",
            },
            /*#__PURE__*/ React.createElement("div", {
              className: "h-8 bg-neutral-800 rounded w-16",
            }),
            /*#__PURE__*/ React.createElement("div", {
              className: "h-8 bg-neutral-800 rounded w-16",
            }),
            /*#__PURE__*/ React.createElement("div", {
              className: "h-8 bg-neutral-800 rounded w-16",
            }),
          ),
        ),
      ),
    );
  }
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "space-y-6",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "flex flex-col sm:flex-row gap-2 sm:gap-4 items-start sm:items-center justify-between",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex gap-1.5 sm:gap-2 w-full sm:w-auto",
        },
        ["all", "today", "week", "month"].map((filterOption) =>
          /*#__PURE__*/ React.createElement(
            "button",
            {
              key: filterOption,
              onClick: () => setFilter(filterOption),
              className: `px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-sm font-medium transition-all duration-200 flex-1 sm:flex-none ${filter === filterOption ? "bg-red-700 text-white" : "bg-neutral-900/50 text-neutral-300 hover:bg-neutral-800/50"}`,
            },
            filterOption.charAt(0).toUpperCase() + filterOption.slice(1),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "select",
        {
          value: sortBy,
          onChange: (e) => setSortBy(e.target.value),
          className:
            "px-2.5 py-1.5 sm:px-4 sm:py-2 bg-neutral-900/50 border border-neutral-700/30 rounded-lg text-white text-[10px] sm:text-sm w-full sm:w-auto",
        },
        /*#__PURE__*/ React.createElement(
          "option",
          {
            value: "recent",
          },
          "Most Recent",
        ),
        /*#__PURE__*/ React.createElement(
          "option",
          {
            value: "duration",
          },
          "Longest Duration",
        ),
        /*#__PURE__*/ React.createElement(
          "option",
          {
            value: "calories",
          },
          "Most Calories",
        ),
      ),
    ),
    sortedWorkouts.length === 0
      ? /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center py-8 sm:py-12",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-4xl sm:text-6xl mb-3 sm:mb-4",
            },
            /*#__PURE__*/ React.createElement(BicepsFlexed, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-base sm:text-xl font-bold text-white mb-2",
            },
            filter === "all"
              ? "No workouts yet"
              : `No workouts ${filter === "today" ? "today" : `this ${filter}`}`,
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className:
                "text-xs sm:text-sm text-neutral-400 mb-4 sm:mb-6 px-4",
            },
            filter === "all"
              ? "Complete your first workout to see it here!"
              : `Try a different filter or complete a workout!`,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-4",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => (window.location.href = "/library"),
                className:
                  "px-4 py-2 sm:px-6 sm:py-3 bg-red-700 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium",
              },
              /*#__PURE__*/ React.createElement(Dumbbell, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Browse Exercises",
            ),
            filter !== "all" &&
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  onClick: () => setFilter("all"),
                  className:
                    "px-4 py-2 sm:px-6 sm:py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors text-xs sm:text-sm font-medium",
                },
                /*#__PURE__*/ React.createElement(BarChart3, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " View All Workouts",
              ),
          ),
        )
      : /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-3 sm:space-y-4",
          },
          sortedWorkouts.map((workout, index) =>
            /*#__PURE__*/ React.createElement(
              "div",
              {
                key: workout.id || index,
                className:
                  "group bg-gradient-to-br from-neutral-900/60 via-neutral-800/40 to-neutral-900/60 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-3 sm:p-6 hover:border-red-500/40 transition-all duration-300 hover:scale-[1.02]",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-start justify-between mb-3 sm:mb-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex-1 min-w-0",
                  },
                  /*#__PURE__*/ React.createElement(
                    "h3",
                    {
                      className:
                        "text-sm sm:text-xl font-bold text-white mb-1 truncate",
                    },
                    workout.exercise || workout.name || "Workout",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className:
                        "text-neutral-400 text-[10px] sm:text-sm truncate",
                    },
                    formatDate(workout.completedAt),
                    " \u2022 ",
                    workout.category || "General",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-1 sm:gap-2 ml-2",
                  },
                  /*#__PURE__*/ React.createElement("div", {
                    className: `w-1.5 h-1.5 sm:w-3 sm:h-3 rounded-full ${workout.savedOffline ? "bg-yellow-400" : isOnline ? "bg-red-500 animate-pulse" : "bg-red-500"}`,
                  }),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "text-[9px] sm:text-xs text-neutral-400",
                    },
                    workout.savedOffline
                      ? "Offline"
                      : isOnline
                        ? "Live"
                        : "Local",
                  ),
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "bg-black/50 rounded-lg p-2 sm:p-3 text-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm sm:text-lg font-bold text-red-500",
                    },
                    formatDuration(workout.duration),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-[9px] sm:text-xs text-neutral-400",
                    },
                    "Duration",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "bg-black/50 rounded-lg p-2 sm:p-3 text-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm sm:text-lg font-bold text-red-500",
                    },
                    workout.caloriesBurned || 0,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-[9px] sm:text-xs text-neutral-400",
                    },
                    "Calories",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "bg-black/50 rounded-lg p-2 sm:p-3 text-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm sm:text-lg font-bold text-red-600",
                    },
                    workout.sets || 0,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-[9px] sm:text-xs text-neutral-400",
                    },
                    "Sets",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "bg-black/50 rounded-lg p-2 sm:p-3 text-center",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-sm sm:text-lg font-bold text-orange-400",
                    },
                    workout.reps || 0,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-[9px] sm:text-xs text-neutral-400",
                    },
                    "Reps",
                  ),
                ),
              ),
              workout.notes &&
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "bg-black/30 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4",
                  },
                  /*#__PURE__*/ React.createElement(
                    "p",
                    {
                      className:
                        "text-neutral-300 text-[10px] sm:text-sm italic line-clamp-2",
                    },
                    '"',
                    workout.notes,
                    '"',
                  ),
                ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-1.5 sm:gap-2 flex-wrap",
                  },
                  workout.difficulty &&
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: `px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[9px] sm:text-xs font-medium ${workout.difficulty === "Beginner" ? "bg-green-900/50 text-green-300" : workout.difficulty === "Intermediate" ? "bg-yellow-900/50 text-yellow-300" : "bg-red-900/50 text-red-300"}`,
                      },
                      workout.difficulty,
                    ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-[9px] sm:text-xs text-neutral-500 hidden sm:inline",
                    },
                    "ID: ",
                    workout.id?.toString().slice(-6) || "N/A",
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex items-center gap-1.5 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity",
                  },
                  /*#__PURE__*/ React.createElement(
                    "button",
                    {
                      onClick: () => navigate(`/workout-details/${workout.id}`),
                      className:
                        "flex-1 sm:flex-none text-red-500 hover:text-blue-300 text-[10px] sm:text-sm px-3 py-1.5 bg-blue-900/20 sm:bg-transparent rounded-lg sm:rounded-none border border-red-600/30 sm:border-0",
                    },
                    "View Details \u2192",
                  ),
                  /*#__PURE__*/ React.createElement(
                    "button",
                    {
                      onClick: () => setDeleteConfirm(workout.id),
                      className:
                        "text-red-400 hover:text-red-300 text-[10px] sm:text-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded hover:bg-red-900/20 transition-colors",
                    },
                    /*#__PURE__*/ React.createElement(Trash2, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                    " ",
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "hidden sm:inline",
                      },
                      "Delete",
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
    deleteConfirm &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "bg-neutral-900 rounded-xl p-6 max-w-md w-full",
          },
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-xl font-bold text-white mb-4",
            },
            "Delete Workout?",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-300 mb-6",
            },
            "Are you sure you want to delete this workout? This action cannot be undone.",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex gap-3",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => setDeleteConfirm(null),
                className: "btn-secondary flex-1",
              },
              "Cancel",
            ),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () => deleteWorkout(deleteConfirm),
                className: "btn bg-red-600 hover:bg-red-700 text-white flex-1",
              },
              /*#__PURE__*/ React.createElement(Trash2, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Delete",
            ),
          ),
        ),
      ),
    sortedWorkouts.length > 0 &&
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "bg-gradient-to-r from-neutral-900/50 via-neutral-800/30 to-neutral-900/50 backdrop-blur-sm border border-neutral-700/30 rounded-xl p-3 sm:p-6 mt-6 sm:mt-8",
        },
        /*#__PURE__*/ React.createElement(
          "h3",
          {
            className: "text-sm sm:text-lg font-bold text-white mb-3 sm:mb-4",
          },
          "Summary",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-lg sm:text-2xl font-bold text-red-500",
              },
              sortedWorkouts.length,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-[9px] sm:text-xs text-neutral-400",
              },
              "Total Workouts",
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
                className: "text-lg sm:text-2xl font-bold text-red-500",
              },
              Math.round(
                sortedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) /
                  60,
              ),
              "m",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-[9px] sm:text-xs text-neutral-400",
              },
              "Total Time",
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
                className: "text-lg sm:text-2xl font-bold text-red-600",
              },
              sortedWorkouts.reduce(
                (sum, w) => sum + (w.caloriesBurned || 0),
                0,
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-[9px] sm:text-xs text-neutral-400",
              },
              "Total Calories",
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
                className: "text-lg sm:text-2xl font-bold text-orange-400",
              },
              Math.round(
                sortedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) /
                  sortedWorkouts.length /
                  60,
              ) || 0,
              "m",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-[9px] sm:text-xs text-neutral-400",
              },
              "Avg Duration",
            ),
          ),
        ),
      ),
  );
}
