import { Dumbbell, RefreshCw, BicepsFlexed, BarChart3 } from 'lucide-react';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useRealTime } from "../context/RealTimeContext";


export default function WorkoutsFixed() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { stats, isOnline } = useRealTime();
  const [currentTime, setCurrentTime] = useState(new Date());
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
        className:
          "relative w-full h-screen min-h-screen overflow-hidden bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center",
        initial: {
          opacity: 0,
        },
        animate: {
          opacity: 1,
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
          motion.h1,
          {
            className:
              "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-2xl mb-8",
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
              delay: 0.2,
            },
          },
          "YOUR WORKOUTS",
        ),
        /*#__PURE__*/ React.createElement(
          motion.p,
          {
            className:
              "text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-6",
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
              delay: 0.4,
            },
          },
          "Track your completed workouts and progress in real-time",
        ),
        /*#__PURE__*/ React.createElement(
          motion.div,
          {
            className:
              "flex flex-col sm:flex-row gap-4 justify-center items-center mb-6",
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
              delay: 0.6,
            },
          },
          /*#__PURE__*/ React.createElement(
            motion.button,
            {
              onClick: () => navigate("/library"),
              className:
                "bg-red-700 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200",
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
                "bg-neutral-700 hover:bg-neutral-800 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200",
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
            className: "flex items-center justify-center gap-4 mb-6",
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
              delay: 0.8,
            },
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center gap-2 bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm",
            },
            /*#__PURE__*/ React.createElement("div", {
              className: `w-2 h-2 rounded-full ${isOnline ? "bg-red-500 animate-pulse" : "bg-red-400"}`,
            }),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-sm font-bold text-white",
              },
              isOnline ? "LIVE" : "OFFLINE",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "text-sm text-white/80 font-mono bg-black/30 px-3 py-2 rounded-full backdrop-blur-sm",
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
              "grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto",
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
              delay: 1.0,
            },
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "bg-black/30 backdrop-blur-sm rounded-lg p-4 relative",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-2xl font-black text-red-500",
              },
              stats?.todayWorkouts || 0,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-sm text-white/80",
              },
              "Today",
            ),
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "bg-black/30 backdrop-blur-sm rounded-lg p-4 relative",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-2xl font-black text-red-500",
              },
              stats?.totalWorkouts || 0,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-sm text-white/80",
              },
              "Total",
            ),
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "bg-black/30 backdrop-blur-sm rounded-lg p-4 relative",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-2xl font-black text-red-600",
              },
              stats?.weeklyWorkouts || 0,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-sm text-white/80",
              },
              "Week",
            ),
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "bg-black/30 backdrop-blur-sm rounded-lg p-4 relative",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-2xl font-black text-orange-400",
              },
              stats?.totalCalories || 0,
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-sm text-white/80",
              },
              "Calories",
            ),
            /*#__PURE__*/ React.createElement("div", {
              className:
                "absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse",
            }),
          ),
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "container mx-auto px-4 py-8",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center py-12",
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
          "h3",
          {
            className: "text-xl font-bold text-white mb-2",
          },
          "Workout tracking is working!",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-neutral-400 mb-6",
          },
          "This is a simplified version of the workouts page that should work without errors.",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex gap-3 justify-center",
          },
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => navigate("/library"),
              className:
                "px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-blue-700 transition-colors",
            },
            /*#__PURE__*/ React.createElement(Dumbbell, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Browse Exercises",
          ),
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => navigate("/workouts-original"),
              className:
                "px-6 py-3 bg-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors",
            },
            /*#__PURE__*/ React.createElement(BarChart3, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Try Original Page",
          ),
        ),
      ),
    ),
  );
}
