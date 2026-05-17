import { Target, BarChart3, RefreshCw, BicepsFlexed, Dumbbell } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";


// Safe import with error handling
let CompletedWorkouts;
let RealTimeNotification;
let YourWorkoutsImg;
try {
  CompletedWorkouts = require("../components/CompletedWorkouts").default;
} catch (error) {
  console.warn("CompletedWorkouts component not available:", error.message);
  CompletedWorkouts = () =>
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "text-center py-8 text-white",
      },
      /*#__PURE__*/ React.createElement(
        "p",
        null,
        "Workout history will be displayed here.",
      ),
    );
}
try {
  RealTimeNotification = require("../components/RealTimeNotification").default;
} catch (error) {
  console.warn("RealTimeNotification component not available:", error.message);
  RealTimeNotification = () => null;
}
try {
  YourWorkoutsImg = require("../assets/Yourworkouts.jpg").default;
} catch (error) {
  console.warn("Yourworkouts.jpg image not available:", error.message);
  YourWorkoutsImg = null;
}
export default function WorkoutsComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();
  const { stats, isOnline } = useRealTime();
  const [notification, setNotification] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, loading, navigate]);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Preload hero image with error handling
  useEffect(() => {
    if (!YourWorkoutsImg) {
      setImageError(true);
      return;
    }
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = YourWorkoutsImg;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  // Handle navigation from StartWorkout
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted) {
      const message = workoutState.sets
        ? `🎉 ${workoutState.exercise} completed! ${workoutState.sets} sets, ${workoutState.duration}, +${workoutState.calories} calories!`
        : `🎉 ${workoutState.exercise} completed!`;
      setNotification({
        message,
        type: "workout",
      });
      navigate(location.pathname, {
        replace: true,
      });
      setTimeout(() => setNotification(null), 6000);
    }
  }, [location.state, navigate, location.pathname]);

  // Listen for workout completion events
  useEffect(() => {
    const handleWorkoutCompleted = (event) => {
      if (event.detail) {
        const workout = event.detail;
        console.log("🎯 Workouts page: Received workout completion:", workout);
        setNotification({
          message: `🎉 ${workout.exercise || workout.name} completed! +${workout.caloriesBurned || 0} calories burned!`,
          type: "workout",
        });
        setTimeout(() => setNotification(null), 5000);

        // Force refresh of CompletedWorkouts component
        window.dispatchEvent(new CustomEvent("refreshCompletedWorkouts"));
      }
    };
    const handleStatsUpdate = (event) => {
      if (event.detail) {
        console.log("📊 Workouts page: Stats updated:", event.detail);
      }
    };
    const handleRealTimeSync = (event) => {
      console.log("🔄 Workouts page: Real-time sync received:", event.detail);
    };
    window.addEventListener("workoutCompleted", handleWorkoutCompleted);
    window.addEventListener("realTimeStatsUpdate", handleStatsUpdate);
    window.addEventListener("realTimeStatsSync", handleRealTimeSync);
    return () => {
      window.removeEventListener("workoutCompleted", handleWorkoutCompleted);
      window.removeEventListener("realTimeStatsUpdate", handleStatsUpdate);
      window.removeEventListener("realTimeStatsSync", handleRealTimeSync);
    };
  }, []);
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
            "animate-spin w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full mx-auto mb-4",
        }),
        /*#__PURE__*/ React.createElement("div", null, "Loading..."),
      ),
    );
  }
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "min-h-screen bg-black",
    },
    /*#__PURE__*/ React.createElement(
      motion.div,
      {
        className: "relative w-full h-screen min-h-screen overflow-hidden",
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
        "aria-label": "Your Workouts Hero Section",
      },
      !imageLoaded && !imageError
        ? /*#__PURE__*/
          // Skeleton loader
          React.createElement(
            motion.div,
            {
              className:
                "w-full h-full bg-gradient-to-br from-neutral-900/50 to-neutral-800/50 relative overflow-hidden",
              initial: {
                opacity: 1,
              },
              exit: {
                opacity: 0,
              },
              transition: {
                duration: 0.3,
              },
            },
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse",
            }),
          )
        : imageError || !YourWorkoutsImg
          ? /*#__PURE__*/
            // Fallback content if image fails or not available
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
                  "div",
                  {
                    className: "text-6xl mb-4",
                  },
                  /*#__PURE__*/ React.createElement(BicepsFlexed, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "h1",
                  {
                    className:
                      "text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent",
                  },
                  "YOUR WORKOUTS",
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-lg md:text-xl opacity-90 max-w-2xl mx-auto",
                  },
                  "Track your completed workouts and progress in real-time",
                ),
              ),
            )
          : /*#__PURE__*/ React.createElement(
              React.Fragment,
              null,
              /*#__PURE__*/ React.createElement(motion.img, {
                src: YourWorkoutsImg,
                alt: "Your Workouts - Professional gym training background",
                className:
                  "w-full h-full object-cover sm:object-contain bg-black",
                style: {
                  objectPosition:
                    window.innerWidth <= 640 ? "65% center" : "center center",
                },
                loading: "eager",
                decoding: "async",
                initial: {
                  opacity: 0,
                  scale: 0.98,
                },
                animate: {
                  opacity: imageLoaded ? 1 : 0,
                  scale: imageLoaded ? 1 : 0.98,
                },
                transition: {
                  duration: 0.6,
                  ease: "easeOut",
                },
              }),
              /*#__PURE__*/ React.createElement("div", {
                className:
                  "absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60",
              }),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute inset-0 flex items-center justify-center",
                },
                /*#__PURE__*/ React.createElement(
                  motion.h1,
                  {
                    className:
                      "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl",
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
                      duration: 0.6,
                      delay: 0.4,
                    },
                  },
                  "YOUR WORKOUTS",
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "absolute inset-0 flex items-end justify-center pb-8 sm:pb-12",
                },
                /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    className: "text-center text-white px-4 max-w-6xl mx-auto",
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
                      delay: 0.3,
                    },
                  },
                  /*#__PURE__*/ React.createElement(
                    motion.p,
                    {
                      className:
                        "text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-4 drop-shadow-lg",
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
                        duration: 0.6,
                        delay: 0.5,
                      },
                    },
                    "Track your completed workouts and progress in real-time",
                  ),
                  /*#__PURE__*/ React.createElement(
                    motion.div,
                    {
                      className:
                        "flex flex-col sm:flex-row gap-2 justify-center items-center mb-4",
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
                        duration: 0.6,
                        delay: 0.6,
                      },
                    },
                    /*#__PURE__*/ React.createElement(
                      motion.button,
                      {
                        onClick: () => navigate("/library"),
                        className:
                          "bg-red-700 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow-lg transition-all duration-200",
                        whileHover: {
                          scale: 1.05,
                        },
                        whileTap: {
                          scale: 0.95,
                        },
                      },
                      /*#__PURE__*/ React.createElement(Dumbbell, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " Start New Workout",
                    ),
                    /*#__PURE__*/ React.createElement(
                      motion.button,
                      {
                        onClick: () => window.location.reload(),
                        className:
                          "bg-neutral-700 hover:bg-neutral-800 text-white px-3 py-2 rounded-lg text-sm shadow-lg transition-all duration-200",
                        whileHover: {
                          scale: 1.05,
                        },
                        whileTap: {
                          scale: 0.95,
                        },
                      },
                      /*#__PURE__*/ React.createElement(RefreshCw, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " Refresh",
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    motion.div,
                    {
                      className: "flex items-center justify-center gap-3 mb-4",
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
                        duration: 0.6,
                        delay: 0.7,
                      },
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm",
                      },
                      /*#__PURE__*/ React.createElement("div", {
                        className: `w-1.5 h-1.5 rounded-full ${isOnline ? "bg-red-500 animate-pulse" : "bg-red-400"}`,
                      }),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className: "text-xs font-bold text-white",
                        },
                        isOnline ? "LIVE" : "OFFLINE",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-xs text-white/80 font-mono bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm",
                      },
                      currentTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    ),
                  ),
                  /*#__PURE__*/ React.createElement(
                    motion.div,
                    {
                      className:
                        "grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto",
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
                        duration: 0.6,
                        delay: 0.8,
                      },
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-black/30 backdrop-blur-sm rounded-lg p-2 relative",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-lg font-black text-red-500",
                        },
                        stats?.todayWorkouts || 0,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-xs text-white/80",
                        },
                        "Today",
                      ),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-black/30 backdrop-blur-sm rounded-lg p-2 relative",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-lg font-black text-red-500",
                        },
                        stats?.totalWorkouts || 0,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-xs text-white/80",
                        },
                        "Total",
                      ),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-black/30 backdrop-blur-sm rounded-lg p-2 relative",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-lg font-black text-red-600",
                        },
                        stats?.weeklyWorkouts || 0,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-xs text-white/80",
                        },
                        "Week",
                      ),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-black/30 backdrop-blur-sm rounded-lg p-2 relative",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-lg font-black text-orange-400",
                        },
                        stats?.totalCalories || 0,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-xs text-white/80",
                        },
                        "Calories",
                      ),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute top-1 right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse",
                      }),
                    ),
                  ),
                ),
              ),
            ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "container mx-auto px-4 py-8",
      },
      /*#__PURE__*/ React.createElement(CompletedWorkouts, null),
    ),
    notification &&
      RealTimeNotification &&
      /*#__PURE__*/ React.createElement(RealTimeNotification, {
        message: notification.message,
        type: notification.type,
        onClose: () => setNotification(null),
      }),
  );
}
