import { Dumbbell, ClipboardList, CheckCircle2, BicepsFlexed, Edit, Info } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


export default function WorkoutDetails() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  useEffect(() => {
    // Try both localStorage keys
    let workouts = JSON.parse(
      localStorage.getItem("workoutSync_workouts") || "[]",
    );
    if (workouts.length === 0) {
      workouts = JSON.parse(localStorage.getItem("completedWorkouts") || "[]");
    }
    const found = workouts.find((w) => w.id.toString() === workoutId);
    setWorkout(found);
  }, [workoutId]);
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  if (!workout) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-white text-center",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-4xl mb-4",
          },
          /*#__PURE__*/ React.createElement(Dumbbell, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-xl",
          },
          "Workout not found",
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: () => navigate("/workouts"),
            className: "mt-4 btn bg-red-700 hover:bg-blue-700 text-white",
          },
          "Back to Workouts",
        ),
      ),
    );
  }
  const isWorkoutPlan = workout.planId || workout.exercises?.length > 0;
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-gradient-to-br from-black via-gray-900 to-black",
    },
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
          "button",
          {
            onClick: () => navigate("/workouts"),
            className:
              "flex items-center gap-1.5 sm:gap-2 md:gap-3 px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 bg-neutral-900/50 hover:bg-neutral-800/50 rounded-lg sm:rounded-xl border border-neutral-700/50 text-neutral-300 hover:text-white transition-all duration-300",
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
            "BACK TO WORKOUTS",
          ),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-5 md:space-y-6",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "bg-gradient-to-br from-neutral-900/90 via-gray-800/90 to-black/90 border border-orange-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-2xl",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "flex items-center gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-2xl sm:text-2xl md:text-3xl",
              },
              /*#__PURE__*/ React.createElement(Dumbbell, {
                className: "w-[1em] h-[1em] inline-block",
              }),
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
                  "text-base sm:text-xl md:text-2xl lg:text-3xl font-black text-white mb-1.5 sm:mb-2 truncate",
              },
              workout.name || workout.exercise,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "px-2 py-0.5 sm:px-2.5 sm:py-1 md:px-3 md:py-1 bg-orange-600/20 text-orange-400 rounded-lg text-[10px] sm:text-xs md:text-sm font-bold border border-orange-500/30",
                },
                workout.category || workout.muscle,
              ),
              workout.difficulty &&
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "px-2.5 py-1 bg-red-950/40 text-red-400 rounded-md text-[10px] sm:text-xs font-bold border border-red-800/40",
                  },
                  workout.difficulty,
                ),
              isWorkoutPlan &&
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className:
                      "px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-md text-[10px] sm:text-xs font-bold border border-zinc-700",
                  },
                  /*#__PURE__*/ React.createElement(ClipboardList, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                  " Workout Plan",
                ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-neutral-400 text-[10px] sm:text-xs md:text-sm",
          },
          /*#__PURE__*/ React.createElement(
            "span",
            null,
            /*#__PURE__*/ React.createElement(CheckCircle2, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Completed on ",
            formatDate(workout.completedAt),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-br from-red-700/20 to-blue-800/20 border border-red-600/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-xl sm:text-2xl md:text-3xl font-black text-red-500 mb-0.5 sm:mb-1",
            },
            workout.sets,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-[10px] sm:text-xs md:text-sm text-blue-300 font-medium",
            },
            "Total Sets",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-br from-green-600/20 to-green-800/20 border border-red-600/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-xl sm:text-2xl md:text-3xl font-black text-red-500 mb-0.5 sm:mb-1",
            },
            workout.reps,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-[10px] sm:text-xs md:text-sm text-green-300 font-medium",
            },
            "Total Reps",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-br from-red-800/20 to-purple-800/20 border border-red-700/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-xl sm:text-2xl md:text-3xl font-black text-red-600 mb-0.5 sm:mb-1",
            },
            formatTime(workout.duration),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-[10px] sm:text-xs md:text-sm text-purple-300 font-medium",
            },
            "Duration",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 text-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-xl sm:text-2xl md:text-3xl font-black text-orange-400 mb-0.5 sm:mb-1",
            },
            workout.caloriesBurned,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-[10px] sm:text-xs md:text-sm text-orange-300 font-medium",
            },
            "Calories",
          ),
        ),
      ),
      isWorkoutPlan &&
        workout.exercises &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3 sm:p-4 md:p-6",
          },
          /*#__PURE__*/ React.createElement(
            "h2",
            {
              className:
                "text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              null,
              /*#__PURE__*/ React.createElement(ClipboardList, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              null,
              "Exercises Completed (",
              workout.exercises.length,
              ")",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "space-y-3 sm:space-y-4",
            },
            workout.exercises.map((ex, idx) =>
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  key: idx,
                  className:
                    "bg-black/50 border border-neutral-700/30 rounded-lg p-2.5 sm:p-3 md:p-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "flex items-center justify-between mb-2 sm:mb-2.5 md:mb-3",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm flex-shrink-0",
                      },
                      idx + 1,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "min-w-0 flex-1",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "font-bold text-white text-xs sm:text-sm md:text-base lg:text-lg truncate",
                        },
                        ex.exerciseName,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-[10px] sm:text-xs md:text-sm text-neutral-400",
                        },
                        "Exercise ",
                        idx + 1,
                      ),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-right flex-shrink-0 ml-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-red-500 font-bold text-xs sm:text-sm md:text-base",
                      },
                      formatTime(ex.duration),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[9px] sm:text-[10px] md:text-xs text-neutral-400",
                      },
                      "Duration",
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 mb-2 sm:mb-2.5 md:mb-3",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "bg-neutral-900/50 rounded-lg p-2 sm:p-2.5 md:p-3 text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-base sm:text-lg md:text-xl font-bold text-red-500",
                      },
                      ex.sets,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[9px] sm:text-[10px] md:text-xs text-neutral-400",
                      },
                      "Sets",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "bg-neutral-900/50 rounded-lg p-2 sm:p-2.5 md:p-3 text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-base sm:text-lg md:text-xl font-bold text-red-600",
                      },
                      ex.reps,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[9px] sm:text-[10px] md:text-xs text-neutral-400",
                      },
                      "Total Reps",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "bg-neutral-900/50 rounded-lg p-2 sm:p-2.5 md:p-3 text-center",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-base sm:text-lg md:text-xl font-bold text-orange-400",
                      },
                      ex.totalWeight.toFixed(1),
                      "kg",
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[9px] sm:text-[10px] md:text-xs text-neutral-400",
                      },
                      "Volume",
                    ),
                  ),
                ),
                ex.setsData &&
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "space-y-1.5 sm:space-y-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[10px] sm:text-xs text-neutral-400 font-medium mb-1.5 sm:mb-2",
                      },
                      "Set Details:",
                    ),
                    ex.setsData.map((set, setIdx) =>
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          key: setIdx,
                          className:
                            "flex items-center justify-between bg-neutral-900/30 rounded-lg p-2 sm:p-2.5 md:p-3",
                        },
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className:
                              "text-neutral-300 font-medium text-[10px] sm:text-xs md:text-sm",
                          },
                          "Set ",
                          setIdx + 1,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "span",
                          {
                            className:
                              "text-white font-bold text-xs sm:text-sm md:text-base",
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
      !isWorkoutPlan &&
        workout.setsData &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3 sm:p-4 md:p-6",
          },
          /*#__PURE__*/ React.createElement(
            "h2",
            {
              className:
                "text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              null,
              /*#__PURE__*/ React.createElement(BicepsFlexed, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              null,
              "Sets Completed (",
              workout.setsData.length,
              ")",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "space-y-1.5 sm:space-y-2",
            },
            workout.setsData.map((set, idx) =>
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  key: idx,
                  className:
                    "flex items-center justify-between bg-black/50 border border-neutral-700/30 rounded-lg p-2.5 sm:p-3 md:p-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex items-center gap-2 sm:gap-2.5 md:gap-3",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className:
                        "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm",
                    },
                    idx + 1,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className:
                        "text-white font-medium text-xs sm:text-sm md:text-base",
                    },
                    "Set ",
                    idx + 1,
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
                      className:
                        "text-white font-bold text-sm sm:text-base md:text-lg",
                    },
                    set.reps,
                    " reps \xD7 ",
                    set.weight,
                    "kg",
                  ),
                  set.duration &&
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[9px] sm:text-[10px] md:text-xs text-neutral-400",
                      },
                      "Duration: ",
                      formatTime(set.duration),
                    ),
                ),
              ),
            ),
          ),
        ),
      workout.notes &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3 sm:p-4 md:p-6",
          },
          /*#__PURE__*/ React.createElement(
            "h2",
            {
              className:
                "text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              null,
              /*#__PURE__*/ React.createElement(Edit, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            /*#__PURE__*/ React.createElement("span", null, "Notes"),
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-300 text-xs sm:text-sm md:text-base",
            },
            workout.notes,
          ),
        ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "bg-neutral-900/60 border border-neutral-800/50 rounded-xl p-3 sm:p-4 md:p-6",
        },
        /*#__PURE__*/ React.createElement(
          "h2",
          {
            className:
              "text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2",
          },
          /*#__PURE__*/ React.createElement(
            "span",
            null,
            /*#__PURE__*/ React.createElement(Info, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "span",
            null,
            "Additional Information",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4",
          },
          workout.totalWeight &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-black/50 rounded-lg",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "text-neutral-400 text-[10px] sm:text-xs md:text-sm",
                },
                "Total Volume",
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "text-white font-bold text-xs sm:text-sm md:text-base",
                },
                workout.totalWeight.toFixed(1),
                "kg",
              ),
            ),
          workout.activeTime &&
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-black/50 rounded-lg",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "text-neutral-400 text-[10px] sm:text-xs md:text-sm",
                },
                "Active Time",
              ),
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "text-white font-bold text-xs sm:text-sm md:text-base",
                },
                formatTime(workout.activeTime),
              ),
            ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-black/50 rounded-lg",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-neutral-400 text-[10px] sm:text-xs md:text-sm",
              },
              "Status",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className:
                  "text-red-500 font-bold text-xs sm:text-sm md:text-base",
              },
              /*#__PURE__*/ React.createElement(CheckCircle2, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Completed",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center justify-between p-2 sm:p-2.5 md:p-3 bg-black/50 rounded-lg",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-neutral-400 text-[10px] sm:text-xs md:text-sm",
              },
              "Workout ID",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className:
                  "text-neutral-300 font-mono text-[10px] sm:text-xs md:text-sm truncate",
              },
              workout.id,
            ),
          ),
        ),
      ),
    ),
  );
}
