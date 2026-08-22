import { Target, BarChart3, RefreshCw, BicepsFlexed, Dumbbell } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";
import CompletedWorkouts from "../components/CompletedWorkouts";
import RealTimeNotification from "../components/RealTimeNotification";
import YourWorkoutsImg from "../assets/Yourworkouts.jpg";


export default function Workouts() {
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

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = YourWorkoutsImg;
    img.loading = "eager";
    img.fetchPriority = "high";
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

  // Listen for workout completion events and real-time sync
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
        // The RealTimeContext will handle the stats update
      }
    };
    const handleRealTimeSync = (event) => {
      console.log("🔄 Workouts page: Real-time sync received:", event.detail);
      // Stats are automatically updated via RealTimeContext
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
        className: "relative w-full h-[520px] sm:h-screen sm:min-h-screen overflow-hidden",
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
          // Skeleton loader with shimmer
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
        : imageError
          ? /*#__PURE__*/
            // Fallback content if image fails
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
                  className: "text-center text-white px-3 xs:px-4",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-4xl xs:text-5xl sm:text-6xl mb-3 xs:mb-4",
                  },
                  /*#__PURE__*/ React.createElement(BicepsFlexed, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "h1",
                  {
                    className:
                      "text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-2 xs:mb-3 sm:mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight",
                  },
                  "YOUR WORKOUTS",
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl opacity-90 max-w-2xl mx-auto leading-relaxed",
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
                fetchPriority: "high",
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
                    "absolute inset-0 flex items-center sm:items-end justify-center pb-4 sm:pb-8 pt-8 sm:pt-0",
                },
                /*#__PURE__*/ React.createElement(
                  motion.div,
                  {
                    className:
                      "text-center text-white px-3 sm:px-4 max-w-4xl mx-auto w-full space-y-2.5 sm:space-y-3",
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
                    motion.h1,
                    {
                      className:
                        "text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-2xl text-center leading-tight tracking-tight",
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
                  /*#__PURE__*/ React.createElement(
                    motion.p,
                    {
                      className:
                        "text-xs sm:text-sm md:text-base text-white/90 max-w-xl mx-auto drop-shadow-lg leading-snug",
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
                    "Track your personal completed workouts and progress in real-time",
                  ),
                  /*#__PURE__*/ React.createElement(
                    motion.div,
                    {
                      className:
                        "flex flex-row flex-wrap gap-2 justify-center items-center mb-3 max-w-md mx-auto px-2",
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
                          "bg-red-700 hover:bg-blue-700 active:bg-blue-800 text-white px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 rounded-lg font-semibold text-[10px] xs:text-xs sm:text-sm shadow-lg transition-all duration-200 active:scale-95",
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
                        onClick: () => navigate("/your-workout-splits"),
                        className:
                          "bg-red-800 hover:bg-purple-700 active:bg-purple-800 text-white px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-2 rounded-lg font-semibold text-[10px] xs:text-xs sm:text-sm shadow-lg transition-all duration-200 active:scale-95",
                        whileHover: {
                          scale: 1.05,
                        },
                        whileTap: {
                          scale: 0.95,
                        },
                      },
                      /*#__PURE__*/ React.createElement(Target, {
                        className: "w-[1em] h-[1em] inline-block",
                      }),
                      " Your WorkoutSplits",
                    ),
                    /*#__PURE__*/ React.createElement(
                      motion.button,
                      {
                        onClick: () => window.location.reload(),
                        className:
                          "bg-neutral-700 hover:bg-neutral-800 active:bg-neutral-900 text-white px-2.5 xs:px-3 py-1.5 xs:py-2 rounded-lg text-[10px] xs:text-xs sm:text-sm shadow-lg transition-all duration-200 active:scale-95 flex-shrink-0",
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
                      className:
                        "flex items-center justify-center gap-1.5 xs:gap-2 mb-2 xs:mb-2.5 sm:mb-3",
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
                          "flex items-center gap-1 xs:gap-1.5 bg-black/30 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full backdrop-blur-sm",
                      },
                      /*#__PURE__*/ React.createElement("div", {
                        className: `w-1 h-1 xs:w-1.5 xs:h-1.5 rounded-full ${isOnline ? "bg-red-500 animate-pulse shadow-lg shadow-red-500/50" : "bg-red-400"}`,
                      }),
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "text-[9px] xs:text-[10px] sm:text-xs font-bold text-white tracking-wide",
                        },
                        isOnline ? "LIVE" : "OFFLINE",
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "text-[9px] xs:text-[10px] sm:text-xs text-white/80 font-mono bg-black/30 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded-full backdrop-blur-sm",
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
                        "grid grid-cols-2 sm:grid-cols-4 gap-1.5 xs:gap-2 max-w-2xl mx-auto",
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
                          "bg-black/30 backdrop-blur-sm rounded-lg p-1.5 xs:p-2 relative shadow-lg",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-base xs:text-lg sm:text-xl font-black text-red-500",
                        },
                        stats?.todayWorkouts || 0,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-[9px] xs:text-[10px] sm:text-xs text-white/80 leading-tight",
                        },
                        "Your Today",
                      ),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-black/30 backdrop-blur-sm rounded-lg p-1.5 xs:p-2 relative shadow-lg",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-base xs:text-lg sm:text-xl font-black text-red-500",
                        },
                        stats?.totalWorkouts || 0,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-[9px] xs:text-[10px] sm:text-xs text-white/80 leading-tight",
                        },
                        "Your Total",
                      ),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-black/30 backdrop-blur-sm rounded-lg p-1.5 xs:p-2 relative shadow-lg",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-base xs:text-lg sm:text-xl font-black text-red-600",
                        },
                        stats?.weeklyWorkouts || 0,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-[9px] xs:text-[10px] sm:text-xs text-white/80 leading-tight",
                        },
                        "Your Week",
                      ),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
                      }),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className:
                          "bg-black/30 backdrop-blur-sm rounded-lg p-1.5 xs:p-2 relative shadow-lg",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-base xs:text-lg sm:text-xl font-black text-orange-400",
                        },
                        stats?.totalCalories || 0,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className:
                            "text-[9px] xs:text-[10px] sm:text-xs text-white/80 leading-tight",
                        },
                        "Your Calories",
                      ),
                      /*#__PURE__*/ React.createElement("div", {
                        className:
                          "absolute top-0.5 right-0.5 xs:top-1 xs:right-1 w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50",
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
        className:
          "container mx-auto px-2 xs:px-3 sm:px-4 py-3 xs:py-4 sm:py-6 md:py-8",
      },
      /*#__PURE__*/ React.createElement(CompletedWorkouts, null),
    ),
    notification &&
      /*#__PURE__*/ React.createElement(RealTimeNotification, {
        message: notification.message,
        type: notification.type,
        onClose: () => setNotification(null),
      }),
  );
}
