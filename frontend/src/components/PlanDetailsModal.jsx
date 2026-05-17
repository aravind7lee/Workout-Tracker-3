// frontend/src/components/PlanDetailsModal.jsx
import { Dumbbell, Pencil } from 'lucide-react';
import React from "react";
import { Link } from "react-router-dom";


export default function PlanDetailsModal({ plan, onClose }) {
  if (!plan) return null;
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50",
      onClick: onClose,
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "card w-full max-w-xs sm:max-w-md lg:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden",
        onClick: (e) => e.stopPropagation(),
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex items-center justify-between mb-3 sm:mb-4",
        },
        /*#__PURE__*/ React.createElement(
          "h3",
          {
            className:
              "text-lg sm:text-xl font-semibold text-white truncate pr-2",
          },
          plan.name,
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: onClose,
            className:
              "text-neutral-400 hover:text-white text-xl sm:text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center",
          },
          "\xD7",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "span",
          {
            className:
              "text-xs text-neutral-400 bg-neutral-700/50 px-2 py-1 rounded w-fit",
          },
          plan.category,
        ),
        /*#__PURE__*/ React.createElement(
          "span",
          {
            className: "text-sm text-neutral-400",
          },
          plan.exercises.length,
          " ",
          plan.exercises.length === 1 ? "exercise" : "exercises",
        ),
        /*#__PURE__*/ React.createElement(
          "span",
          {
            className: "text-xs text-neutral-500",
          },
          "Created: ",
          new Date(plan.createdAt).toLocaleDateString(),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mb-4 sm:mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "h4",
          {
            className: "text-base sm:text-lg font-medium text-white mb-3",
          },
          "All Exercises",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "space-y-2 sm:space-y-3 max-h-60 sm:max-h-80 lg:max-h-96 overflow-y-auto exercise-scroll",
          },
          plan.exercises.map((exercise, index) =>
            /*#__PURE__*/ React.createElement(
              "div",
              {
                key: index,
                className:
                  "flex items-start sm:items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-neutral-800/30 rounded-lg",
              },
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "text-red-500 font-bold text-xs sm:text-sm bg-blue-900/30 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0",
                },
                index + 1,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex-1 min-w-0",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "font-medium text-white text-sm sm:text-base truncate",
                  },
                  exercise.name,
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className:
                      "text-xs text-neutral-400 flex flex-wrap items-center gap-1 sm:gap-2 mt-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "bg-neutral-700/50 px-1 sm:px-2 py-1 rounded",
                    },
                    exercise.sets,
                  ),
                  exercise.difficulty &&
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: `px-1 sm:px-2 py-1 rounded text-xs ${exercise.difficulty === "beginner" ? "bg-green-900/30 text-green-300" : exercise.difficulty === "intermediate" ? "bg-yellow-900/30 text-yellow-300" : "bg-red-900/30 text-red-300"}`,
                      },
                      exercise.difficulty,
                    ),
                  exercise.type &&
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: "text-neutral-500 hidden sm:inline",
                      },
                      exercise.type,
                    ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-xs text-neutral-500 mt-1 sm:hidden",
                  },
                  exercise.category,
                ),
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className:
                    "text-xs sm:text-sm text-neutral-400 hidden sm:block flex-shrink-0",
                },
                exercise.category,
              ),
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex flex-col sm:flex-row gap-2 sm:gap-3",
        },
        /*#__PURE__*/ React.createElement(
          Link,
          {
            to: `/workout/${plan.id}`,
            className:
              "btn bg-green-600 hover:bg-green-700 text-white flex-1 text-center text-sm sm:text-base",
            onClick: onClose,
          },
          /*#__PURE__*/ React.createElement(Dumbbell, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          " Start Workout",
        ),
        /*#__PURE__*/ React.createElement(
          Link,
          {
            to: `/edit-plan/${plan.id}`,
            className:
              "btn bg-red-700 hover:bg-blue-700 text-white flex-1 text-center text-sm sm:text-base",
            onClick: onClose,
          },
          /*#__PURE__*/ React.createElement(Pencil, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          " Edit Plan",
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: onClose,
            className: "btn-secondary flex-1 text-sm sm:text-base",
          },
          "Close",
        ),
      ),
    ),
  );
}
