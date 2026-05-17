// Simple Home page fallback
import { Rocket, Dumbbell, BarChart3, Target } from 'lucide-react';
import React from "react";
import { Link, useNavigate } from "react-router-dom";


export default function HomeSimple() {
  const navigate = useNavigate();
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "container mx-auto px-4 py-20",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center mb-16",
        },
        /*#__PURE__*/ React.createElement(
          "h1",
          {
            className: "text-5xl md:text-7xl font-bold text-white mb-6",
          },
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className:
                "bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent",
            },
            "GymTracker",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-xl text-neutral-300 mb-8 max-w-2xl mx-auto",
          },
          "Track your workouts, monitor your progress, and achieve your fitness goals with our comprehensive fitness tracking platform.",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex flex-col sm:flex-row gap-4 justify-center",
          },
          /*#__PURE__*/ React.createElement(
            "button",
            {
              onClick: () => navigate("/register"),
              className:
                "px-8 py-4 bg-red-700 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors",
            },
            /*#__PURE__*/ React.createElement(Rocket, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Get Started",
          ),
          /*#__PURE__*/ React.createElement(
            Link,
            {
              to: "/login",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                className:
                  "px-8 py-4 border-2 border-neutral-700 text-neutral-300 font-bold rounded-lg hover:bg-neutral-800 transition-colors",
              },
              "Sign In",
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "grid md:grid-cols-3 gap-8 mb-16",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center p-6 bg-neutral-900/50 rounded-lg",
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
            "h3",
            {
              className: "text-xl font-bold text-white mb-2",
            },
            "Workout Tracking",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-400",
            },
            "Log your exercises, sets, and reps with ease",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center p-6 bg-neutral-900/50 rounded-lg",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-4xl mb-4",
            },
            /*#__PURE__*/ React.createElement(BarChart3, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-xl font-bold text-white mb-2",
            },
            "Progress Analytics",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-400",
            },
            "Visualize your fitness journey with detailed charts",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-center p-6 bg-neutral-900/50 rounded-lg",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-4xl mb-4",
            },
            /*#__PURE__*/ React.createElement(Target, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-xl font-bold text-white mb-2",
            },
            "Goal Setting",
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-400",
            },
            "Set and achieve your fitness milestones",
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center",
        },
        /*#__PURE__*/ React.createElement(
          "h2",
          {
            className: "text-3xl font-bold text-white mb-4",
          },
          "Ready to Start Your Fitness Journey?",
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: () => navigate("/register"),
            className:
              "px-12 py-4 bg-gradient-to-r from-red-700 to-red-800 text-white font-bold text-lg rounded-lg hover:shadow-lg transition-all",
          },
          "Join Now - It's Free!",
        ),
      ),
    ),
  );
}
