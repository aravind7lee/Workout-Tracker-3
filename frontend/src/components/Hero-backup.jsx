// frontend/src/components/Hero-backup.jsx
import { Star } from 'lucide-react';
import React from "react";
import { Link } from "react-router-dom";


export default function HeroSimple() {
  return /*#__PURE__*/ React.createElement(
    "section",
    {
      className:
        "relative rounded-lg overflow-hidden bg-neutral-900/40 border border-neutral-800 p-8 mb-8",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "relative z-10 grid md:grid-cols-2 gap-6 items-center",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        null,
        /*#__PURE__*/ React.createElement(
          "h1",
          {
            className:
              "text-4xl md:text-5xl font-extrabold leading-tight text-white",
          },
          "Track. Improve. Conquer.",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "mt-4 text-neutral-300 max-w-xl",
          },
          "Build consistent habits, measure gains, and gamify your progress with streaks, badges, and jaw-dropping animations.",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mt-6 flex gap-3",
          },
          /*#__PURE__*/ React.createElement(
            Link,
            {
              to: "/dashboard",
              className:
                "px-6 py-3 rounded-md bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all",
            },
            "Start Tracking Now",
          ),
          /*#__PURE__*/ React.createElement(
            Link,
            {
              to: "/library",
              className:
                "px-6 py-3 rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-all",
            },
            "Explore Library",
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex justify-center",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "w-64 h-64 bg-gradient-to-br from-neutral-900 to-black rounded-xl border border-neutral-700 flex items-center justify-center",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-center",
            },
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-sm text-neutral-400",
              },
              "Weekly PR",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-3xl mt-2 font-bold text-white",
              },
              "Bench +10kg",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "mt-2 text-neutral-300",
              },
              "Streak: 7 days ",
              /*#__PURE__*/ React.createElement(Star, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
