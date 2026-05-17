// Simple Dashboard for demo mode
import { Dumbbell, BarChart3, Apple, Activity, Target } from 'lucide-react';
import React from "react";
import { useAuth } from "../context/AuthContext";


export default function DashboardSimple() {
  const { user } = useAuth();
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "min-h-screen bg-black text-white p-6",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "max-w-7xl mx-auto",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mb-8",
        },
        /*#__PURE__*/ React.createElement(
          "h1",
          {
            className: "text-3xl font-bold mb-2",
          },
          "Welcome back, ",
          user?.name || "User",
          "!",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-neutral-400",
          },
          "Ready to crush your fitness goals today?",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "grid grid-cols-1 md:grid-cols-4 gap-6 mb-8",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "bg-neutral-900 p-6 rounded-lg",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-2xl font-bold text-red-500",
            },
            "7",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-neutral-400",
            },
            "Day Streak",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "bg-neutral-900 p-6 rounded-lg",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-2xl font-bold text-red-500",
            },
            "12",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-neutral-400",
            },
            "Workouts This Month",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "bg-neutral-900 p-6 rounded-lg",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-2xl font-bold text-red-600",
            },
            "2.5kg",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-neutral-400",
            },
            "Weight Progress",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "bg-neutral-900 p-6 rounded-lg",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-2xl font-bold text-yellow-400",
            },
            "85%",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-neutral-400",
            },
            "Goal Completion",
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-neutral-900 p-6 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-3xl mb-4",
            },
            /*#__PURE__*/ React.createElement(Dumbbell, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-xl font-bold mb-2",
            },
            "Start Workout",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-400",
            },
            "Begin your training session",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-neutral-900 p-6 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-3xl mb-4",
            },
            /*#__PURE__*/ React.createElement(BarChart3, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-xl font-bold mb-2",
            },
            "View Progress",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-400",
            },
            "Check your fitness analytics",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "bg-neutral-900 p-6 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-3xl mb-4",
            },
            /*#__PURE__*/ React.createElement(Apple, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-xl font-bold mb-2",
            },
            "Log Nutrition",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-400",
            },
            "Track your daily meals",
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "bg-neutral-900 p-6 rounded-lg",
        },
        /*#__PURE__*/ React.createElement(
          "h3",
          {
            className: "text-xl font-bold mb-4",
          },
          "Recent Activity",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-4",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center justify-between p-4 bg-neutral-800 rounded-lg",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "font-semibold",
                },
                "Push Day Workout",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-neutral-400 text-sm",
                },
                "Completed 45 minutes ago",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-red-500 font-bold",
              },
              "\u2713 Completed",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center justify-between p-4 bg-neutral-800 rounded-lg",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "font-semibold",
                },
                "Protein Shake",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-neutral-400 text-sm",
                },
                "Logged 2 hours ago",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-red-500 font-bold",
              },
              /*#__PURE__*/ React.createElement(BarChart3, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Nutrition",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className:
                "flex items-center justify-between p-4 bg-neutral-800 rounded-lg",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              null,
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "font-semibold",
                },
                "Morning Run",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-neutral-400 text-sm",
                },
                "Completed yesterday",
              ),
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-red-600 font-bold",
              },
              /*#__PURE__*/ React.createElement(Activity, {
                className: "w-[1em] h-[1em] inline-block",
              }),
              " Cardio",
            ),
          ),
        ),
      ),
      user?.bio?.includes("Demo") &&
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "mt-8 bg-blue-900/20 border border-red-600 rounded-lg p-4",
          },
          /*#__PURE__*/ React.createElement(
            "h4",
            {
              className: "font-bold text-blue-300 mb-2",
            },
            /*#__PURE__*/ React.createElement(Target, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Demo Mode Active",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-blue-200 text-sm",
            },
            "You're using the demo version. All data is simulated and stored locally. Connect to a live backend for full functionality.",
          ),
        ),
    ),
  );
}
