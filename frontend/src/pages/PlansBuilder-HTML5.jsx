// frontend/src/pages/PlansBuilder-HTML5.jsx
// React 19 Compatible HTML5 Drag & Drop Version
import { Lightbulb, Book, Target } from 'lucide-react';
import React, { useState, useCallback } from "react";


const initialExercises = [
  {
    id: "exercise-1",
    name: "Bench Press",
    category: "Chest",
    sets: "3x8-12",
  },
  {
    id: "exercise-2",
    name: "Squat",
    category: "Legs",
    sets: "3x8-12",
  },
  {
    id: "exercise-3",
    name: "Deadlift",
    category: "Back",
    sets: "3x5-8",
  },
  {
    id: "exercise-4",
    name: "Pull-up",
    category: "Back",
    sets: "3x6-10",
  },
  {
    id: "exercise-5",
    name: "Push-up",
    category: "Chest",
    sets: "3x10-15",
  },
  {
    id: "exercise-6",
    name: "Plank",
    category: "Core",
    sets: "3x30-60s",
  },
];
export default function PlansBuilderHTML5() {
  const [exercises] = useState(initialExercises);
  const [plan, setPlan] = useState([]);
  const [planName, setPlanName] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverArea, setDragOverArea] = useState(null);
  const handleDragStart = useCallback((e, item, source) => {
    setDraggedItem({
      item,
      source,
    });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target.outerHTML);
    e.target.style.opacity = "0.5";
  }, []);
  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = "1";
    setDraggedItem(null);
    setDragOverArea(null);
  }, []);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);
  const handleDragEnter = useCallback((e, area) => {
    e.preventDefault();
    setDragOverArea(area);
  }, []);
  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverArea(null);
    }
  }, []);
  const handleDrop = useCallback(
    (e, targetArea) => {
      e.preventDefault();
      setDragOverArea(null);
      if (!draggedItem) return;
      const { item, source } = draggedItem;
      if (source === "library" && targetArea === "plan") {
        const newPlanItem = {
          ...item,
          planId: `plan-${Date.now()}-${Math.random()}`,
          originalId: item.id,
        };
        setPlan((prev) => [...prev, newPlanItem]);
      } else if (source === "plan" && targetArea === "library") {
        setPlan((prev) =>
          prev.filter((planItem) => planItem.planId !== item.planId),
        );
      }
      setDraggedItem(null);
    },
    [draggedItem],
  );
  const removeFromPlan = useCallback((planId) => {
    setPlan((prev) => prev.filter((item) => item.planId !== planId));
  }, []);
  const savePlan = useCallback(() => {
    if (!planName.trim()) {
      alert("Please enter a plan name");
      return;
    }
    if (plan.length === 0) {
      alert("Please add exercises to your plan");
      return;
    }
    console.log("Saving plan:", {
      name: planName,
      exercises: plan,
    });
    alert("Plan saved successfully!");
    setPlanName("");
    setPlan([]);
  }, [planName, plan]);
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className: "space-y-4 sm:space-y-6",
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
      },
      /*#__PURE__*/ React.createElement(
        "h2",
        {
          className: "text-xl sm:text-2xl lg:text-3xl font-semibold text-white",
        },
        "Workout Plan Builder",
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex flex-col sm:flex-row gap-3",
        },
        /*#__PURE__*/ React.createElement("input", {
          type: "text",
          value: planName,
          onChange: (e) => setPlanName(e.target.value),
          placeholder: "Enter plan name...",
          className:
            "px-3 py-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base",
        }),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: savePlan,
            className: "btn bg-red-700 hover:bg-blue-700 text-white",
          },
          "Save Plan",
        ),
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className:
          "bg-blue-900/20 border border-red-600/30 rounded-lg p-3 sm:p-4",
      },
      /*#__PURE__*/ React.createElement(
        "p",
        {
          className: "text-blue-300 text-sm sm:text-base",
        },
        /*#__PURE__*/ React.createElement(Lightbulb, {
          className: "w-[1em] h-[1em] inline-block",
        }),
        " ",
        /*#__PURE__*/ React.createElement("strong", null, "How to use:"),
        " Drag exercises from the library to your plan. Click the \xD7 button to remove exercises from your plan.",
      ),
    ),
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `card min-h-[300px] sm:min-h-[400px] transition-all duration-200 ${dragOverArea === "library" ? "bg-neutral-800/50 border-neutral-500" : ""}`,
          onDragOver: handleDragOver,
          onDragEnter: (e) => handleDragEnter(e, "library"),
          onDragLeave: handleDragLeave,
          onDrop: (e) => handleDrop(e, "library"),
        },
        /*#__PURE__*/ React.createElement(
          "h3",
          {
            className:
              "text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2",
          },
          /*#__PURE__*/ React.createElement(
            "span",
            null,
            /*#__PURE__*/ React.createElement(Book, {
              className: "w-[1em] h-[1em] inline-block",
            }),
          ),
          " Exercise Library",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "space-y-2 sm:space-y-3",
          },
          exercises.map((exercise) =>
            /*#__PURE__*/ React.createElement(
              "div",
              {
                key: exercise.id,
                draggable: true,
                onDragStart: (e) => handleDragStart(e, exercise, "library"),
                onDragEnd: handleDragEnd,
                className:
                  "p-3 sm:p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-neutral-800/60 hover:border-neutral-700",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "flex items-center justify-between",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "flex-1",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "font-medium text-white text-sm sm:text-base",
                    },
                    exercise.name,
                  ),
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "text-xs sm:text-sm text-neutral-400",
                    },
                    exercise.category,
                    " \u2022 ",
                    exercise.sets,
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-neutral-500 text-lg sm:text-xl ml-2",
                  },
                  "\u22EE\u22EE",
                ),
              ),
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `card min-h-[300px] sm:min-h-[400px] transition-all duration-200 ${dragOverArea === "plan" ? "bg-green-900/20 border-red-600/50 shadow-lg" : ""}`,
          onDragOver: handleDragOver,
          onDragEnter: (e) => handleDragEnter(e, "plan"),
          onDragLeave: handleDragLeave,
          onDrop: (e) => handleDrop(e, "plan"),
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "flex items-center justify-between mb-4",
          },
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className:
                "text-lg sm:text-xl font-semibold text-white flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              null,
              /*#__PURE__*/ React.createElement(Target, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            " Your Workout Plan",
          ),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className:
                "text-xs sm:text-sm text-neutral-400 bg-neutral-800/50 px-3 py-1 rounded-full",
            },
            plan.length,
            " ",
            plan.length === 1 ? "exercise" : "exercises",
          ),
        ),
        plan.length === 0
          ? /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-center h-32 sm:h-48 border-2 border-dashed border-neutral-700 rounded-lg transition-colors hover:border-neutral-500",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-center",
                },
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    className: "text-3xl sm:text-4xl mb-3",
                  },
                  /*#__PURE__*/ React.createElement(Target, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-neutral-400 text-sm sm:text-base font-medium",
                  },
                  "Drag exercises here to build your plan",
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className: "text-neutral-500 text-xs sm:text-sm mt-1",
                  },
                  "Start by dragging from the library",
                ),
              ),
            )
          : /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2 sm:space-y-3",
              },
              plan.map((exercise, index) =>
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    key: exercise.planId,
                    draggable: true,
                    onDragStart: (e) => handleDragStart(e, exercise, "plan"),
                    onDragEnd: handleDragEnd,
                    className:
                      "p-3 sm:p-4 rounded-lg bg-green-900/20 border border-green-700/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-green-800/20 hover:border-green-600/50",
                  },
                  /*#__PURE__*/ React.createElement(
                    "div",
                    {
                      className: "flex items-center justify-between",
                    },
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex items-center gap-3 flex-1",
                      },
                      /*#__PURE__*/ React.createElement(
                        "span",
                        {
                          className:
                            "text-red-500 font-bold text-sm sm:text-base bg-green-900/30 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm",
                        },
                        index + 1,
                      ),
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "flex-1",
                        },
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className:
                              "font-medium text-white text-sm sm:text-base",
                          },
                          exercise.name,
                        ),
                        /*#__PURE__*/ React.createElement(
                          "div",
                          {
                            className: "text-xs sm:text-sm text-neutral-400",
                          },
                          exercise.category,
                          " \u2022 ",
                          exercise.sets,
                        ),
                      ),
                    ),
                    /*#__PURE__*/ React.createElement(
                      "div",
                      {
                        className: "flex items-center gap-2",
                      },
                      /*#__PURE__*/ React.createElement(
                        "div",
                        {
                          className: "text-neutral-500 text-lg sm:text-xl",
                        },
                        "\u22EE\u22EE",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => removeFromPlan(exercise.planId),
                          className:
                            "text-red-400 hover:text-red-300 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-red-900/20 transition-colors",
                          title: "Remove from plan",
                        },
                        "\xD7",
                      ),
                    ),
                  ),
                ),
              ),
            ),
      ),
    ),
  );
}
