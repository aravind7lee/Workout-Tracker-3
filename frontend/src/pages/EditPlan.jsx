// frontend/src/pages/EditPlan.jsx
import { XCircle, Hourglass, Save, Pencil, Book, Star } from 'lucide-react';
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { planService } from "../services/planService";
import { exerciseLibrary } from "../data/exerciseLibrary";


export default function EditPlan() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [planName, setPlanName] = useState("");
  const [planCategory, setPlanCategory] = useState("General");
  const [exercises, setExercises] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState("chest");
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverArea, setDragOverArea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const currentMuscleGroup = exerciseLibrary[selectedMuscleGroup];
  const availableExercises = currentMuscleGroup.exercises;
  useEffect(() => {
    if (planId) {
      const loadedPlan = planService.getPlanById(planId);
      if (loadedPlan) {
        setPlan(loadedPlan);
        setPlanName(loadedPlan.name);
        setPlanCategory(loadedPlan.category);
        setExercises(
          loadedPlan.exercises.map((ex, index) => ({
            ...ex,
            planId: `plan-${index}-${Date.now()}`,
            originalId: ex.id || `ex-${index}`,
          })),
        );
      } else {
        navigate("/my-plans");
      }
    }
    setLoading(false);
  }, [planId, navigate]);
  const handleDragStart = useCallback((e, item, source) => {
    setDraggedItem({
      item,
      source,
    });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        item,
        source,
      }),
    );
    setTimeout(() => {
      e.target.style.opacity = "0.5";
      e.target.style.transform = "rotate(5deg)";
    }, 0);
  }, []);
  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = "1";
    e.target.style.transform = "rotate(0deg)";
    setDraggedItem(null);
    setDragOverArea(null);
  }, []);
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  }, []);
  const handleDragEnter = useCallback((e, area) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverArea(area);
  }, []);
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverArea(null);
    }
  }, []);
  const handleDrop = useCallback(
    (e, targetArea) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOverArea(null);
      let dragData;
      try {
        dragData = JSON.parse(e.dataTransfer.getData("text/plain"));
      } catch (error) {
        dragData = draggedItem;
      }
      if (!dragData) return;
      const { item, source } = dragData;
      if (source === "library" && targetArea === "plan") {
        const newPlanItem = {
          ...item,
          planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          originalId: item.id,
          category: currentMuscleGroup.name,
        };
        setExercises((prev) => [...prev, newPlanItem]);
      } else if (source === "plan" && targetArea === "library") {
        setExercises((prev) =>
          prev.filter((planItem) => planItem.planId !== item.planId),
        );
      }
      setDraggedItem(null);
    },
    [draggedItem, currentMuscleGroup],
  );
  const addToPlan = useCallback(
    (exercise) => {
      const newPlanItem = {
        ...exercise,
        planId: `plan-${Date.now()}-${Math.random()}`,
        originalId: exercise.id,
        category: currentMuscleGroup.name,
      };
      setExercises((prev) => [...prev, newPlanItem]);
      setHasUnsavedChanges(true);
    },
    [currentMuscleGroup],
  );
  const removeFromPlan = useCallback((planId) => {
    setExercises((prev) => prev.filter((item) => item.planId !== planId));
    setHasUnsavedChanges(true);
  }, []);
  const moveUp = useCallback((index) => {
    if (index === 0) return;
    setExercises((prev) => {
      const newExercises = [...prev];
      [newExercises[index - 1], newExercises[index]] = [
        newExercises[index],
        newExercises[index - 1],
      ];
      return newExercises;
    });
    setHasUnsavedChanges(true);
  }, []);
  const moveDown = useCallback((index) => {
    setExercises((prev) => {
      if (index === prev.length - 1) return prev;
      const newExercises = [...prev];
      [newExercises[index], newExercises[index + 1]] = [
        newExercises[index + 1],
        newExercises[index],
      ];
      return newExercises;
    });
    setHasUnsavedChanges(true);
  }, []);
  const savePlan = async () => {
    if (!planName.trim()) {
      alert("Please enter a plan name");
      return;
    }
    if (exercises.length === 0) {
      alert("Please add exercises to your plan");
      return;
    }
    setSaving(true);
    try {
      const updatedPlanData = {
        name: planName.trim(),
        exercises: exercises.map((exercise) => ({
          name: exercise.name,
          category: exercise.category,
          sets: exercise.sets,
          type: exercise.type,
          difficulty: exercise.difficulty,
        })),
        category: planCategory,
      };
      const updatedPlan = planService.updatePlan(planId, updatedPlanData);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());

      // Show success message with details
      alert(
        `✅ Plan "${planName}" updated successfully!\n\n📊 Summary:\n• ${exercises.length} exercises\n• Category: ${planCategory}\n• Last updated: ${new Date().toLocaleString()}`,
      );

      // Navigate back with the updated plan highlighted
      navigate(`/my-plans?highlight=${planId}`);
    } catch (error) {
      console.error("Error updating plan:", error);
      alert("Failed to update plan. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "flex items-center justify-center min-h-[400px]",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center",
        },
        /*#__PURE__*/ React.createElement("div", {
          className:
            "animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4",
        }),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-neutral-400",
          },
          "Loading plan...",
        ),
      ),
    );
  }
  if (!plan) {
    return /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "text-center py-12",
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-6xl mb-4",
        },
        /*#__PURE__*/ React.createElement(XCircle, {
          className: "w-[1em] h-[1em] inline-block",
        }),
      ),
      /*#__PURE__*/ React.createElement(
        "h2",
        {
          className: "text-2xl font-bold text-white mb-4",
        },
        "Plan Not Found",
      ),
      /*#__PURE__*/ React.createElement(
        "p",
        {
          className: "text-neutral-400 mb-6",
        },
        "The plan you're trying to edit doesn't exist.",
      ),
      /*#__PURE__*/ React.createElement(
        "button",
        {
          onClick: () => navigate("/my-plans"),
          className: "btn bg-red-700 hover:bg-blue-700 text-white",
        },
        "Back to My Plans",
      ),
    );
  }
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
        "Edit Workout Plan",
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex flex-col sm:flex-row gap-3",
        },
        /*#__PURE__*/ React.createElement("input", {
          type: "text",
          value: planName,
          onChange: (e) => {
            setPlanName(e.target.value);
            setHasUnsavedChanges(true);
          },
          placeholder: "Enter plan name...",
          className:
            "px-3 py-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white placeholder-neutral-400 text-sm sm:text-base",
        }),
        /*#__PURE__*/ React.createElement(
          "select",
          {
            value: planCategory,
            onChange: (e) => {
              setPlanCategory(e.target.value);
              setHasUnsavedChanges(true);
            },
            className:
              "px-3 py-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-sm sm:text-base",
          },
          /*#__PURE__*/ React.createElement(
            "option",
            {
              value: "General",
            },
            "General",
          ),
          /*#__PURE__*/ React.createElement(
            "option",
            {
              value: "Strength",
            },
            "Strength",
          ),
          /*#__PURE__*/ React.createElement(
            "option",
            {
              value: "Cardio",
            },
            "Cardio",
          ),
          /*#__PURE__*/ React.createElement(
            "option",
            {
              value: "Flexibility",
            },
            "Flexibility",
          ),
          /*#__PURE__*/ React.createElement(
            "option",
            {
              value: "HIIT",
            },
            "HIIT",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: savePlan,
            disabled: saving || !hasUnsavedChanges,
            className: `btn text-white disabled:opacity-50 disabled:cursor-not-allowed ${hasUnsavedChanges ? "bg-green-600 hover:bg-green-700 ring-2 ring-red-500/50" : "bg-neutral-700"}`,
          },
          saving
            ? /*#__PURE__*/ React.createElement(
                React.Fragment,
                null,
                /*#__PURE__*/ React.createElement(
                  "span",
                  {
                    className: "animate-spin mr-2",
                  },
                  /*#__PURE__*/ React.createElement(Hourglass, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                "Saving...",
              )
            : hasUnsavedChanges
              ? /*#__PURE__*/ React.createElement(
                  React.Fragment,
                  null,
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mr-2",
                    },
                    /*#__PURE__*/ React.createElement(Save, {
                      className: "w-[1em] h-[1em] inline-block",
                    }),
                  ),
                  "Save Changes",
                )
              : /*#__PURE__*/ React.createElement(
                  React.Fragment,
                  null,
                  /*#__PURE__*/ React.createElement(
                    "span",
                    {
                      className: "mr-2",
                    },
                    "\u2713",
                  ),
                  "Saved",
                ),
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: () => navigate("/my-plans"),
            className: "btn-secondary",
          },
          "Cancel",
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
        "div",
        {
          className: "flex items-start gap-3",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "text-2xl",
          },
          /*#__PURE__*/ React.createElement(Pencil, {
            className: "w-[1em] h-[1em] inline-block",
          }),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-blue-300 text-sm sm:text-base font-medium mb-2",
            },
            /*#__PURE__*/ React.createElement("strong", null, "Editing Plan:"),
            " ",
            plan.name,
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-blue-200 text-xs sm:text-sm space-y-1",
            },
            /*#__PURE__*/ React.createElement(
              "p",
              null,
              "\u2022 Drag & drop exercises between library and plan",
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              null,
              "\u2022 Use + and \xD7 buttons for quick add/remove",
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              null,
              "\u2022 Reorder exercises with \u2191 \u2193 arrows",
            ),
            /*#__PURE__*/ React.createElement(
              "p",
              null,
              '\u2022 Changes are saved when you click "Save Changes"',
            ),
          ),
        ),
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
          className: `card min-h-[300px] sm:min-h-[500px] transition-all duration-200 ${dragOverArea === "library" ? "bg-neutral-800/50 border-neutral-500 shadow-lg" : ""}`,
          onDragOver: handleDragOver,
          onDragEnter: (e) => handleDragEnter(e, "library"),
          onDragLeave: handleDragLeave,
          onDrop: (e) => handleDrop(e, "library"),
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
              /*#__PURE__*/ React.createElement(Book, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            " Exercise Library",
          ),
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: `px-3 py-1 rounded-full text-xs font-medium text-white ${currentMuscleGroup.color}`,
            },
            currentMuscleGroup.name,
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4",
          },
          Object.entries(exerciseLibrary).map(([key, group]) =>
            /*#__PURE__*/ React.createElement(
              "button",
              {
                key: key,
                onClick: () => setSelectedMuscleGroup(key),
                className: `p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedMuscleGroup === key ? `${group.color} text-white shadow-lg` : "bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50"}`,
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-lg sm:text-xl mb-1",
                },
                group.icon,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "truncate",
                },
                group.name,
              ),
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className:
              "space-y-2 sm:space-y-3 max-h-80 overflow-y-auto exercise-scroll",
          },
          availableExercises.map((exercise) =>
            /*#__PURE__*/ React.createElement(
              "div",
              {
                key: exercise.id,
                draggable: true,
                onDragStart: (e) =>
                  handleDragStart(
                    e,
                    {
                      ...exercise,
                      category: currentMuscleGroup.name,
                    },
                    "library",
                  ),
                onDragEnd: handleDragEnd,
                className:
                  "p-3 sm:p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-neutral-800/60 hover:border-neutral-700 hover:shadow-md select-none",
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
                      className:
                        "text-xs sm:text-sm text-neutral-400 flex items-center gap-2",
                    },
                    /*#__PURE__*/ React.createElement(
                      "span",
                      null,
                      exercise.sets,
                    ),
                    /*#__PURE__*/ React.createElement(
                      "span",
                      {
                        className: `px-2 py-1 rounded text-xs ${exercise.difficulty === "beginner" ? "bg-green-900/30 text-green-300" : exercise.difficulty === "intermediate" ? "bg-yellow-900/30 text-yellow-300" : "bg-red-900/30 text-red-300"}`,
                      },
                      exercise.difficulty,
                    ),
                  ),
                ),
                /*#__PURE__*/ React.createElement(
                  "button",
                  {
                    onClick: () =>
                      addToPlan({
                        ...exercise,
                        category: currentMuscleGroup.name,
                      }),
                    className:
                      "text-red-500 hover:text-blue-300 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-blue-900/20 transition-colors",
                    title: "Add to plan",
                  },
                  "+",
                ),
              ),
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: `card min-h-[300px] sm:min-h-[500px] transition-all duration-200 ${dragOverArea === "plan" ? "bg-green-900/30 border-red-500 shadow-xl ring-2 ring-red-500/50" : ""}`,
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
              /*#__PURE__*/ React.createElement(Pencil, {
                className: "w-[1em] h-[1em] inline-block",
              }),
            ),
            " Editing Plan",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center gap-2",
            },
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className:
                  "text-xs sm:text-sm text-neutral-400 bg-neutral-800/50 px-3 py-1 rounded-full",
              },
              exercises.length,
              " ",
              exercises.length === 1 ? "exercise" : "exercises",
            ),
            hasUnsavedChanges &&
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded-full animate-pulse",
                },
                /*#__PURE__*/ React.createElement(Star, {
                  className: "w-[1em] h-[1em] inline-block",
                }),
                " Unsaved",
              ),
            lastSaved &&
              !hasUnsavedChanges &&
              /*#__PURE__*/ React.createElement(
                "span",
                {
                  className:
                    "text-xs text-red-500 bg-green-900/30 px-2 py-1 rounded-full",
                },
                "\u2713 Saved ",
                lastSaved.toLocaleTimeString(),
              ),
          ),
        ),
        exercises.length === 0
          ? /*#__PURE__*/ React.createElement(
              "div",
              {
                className:
                  "flex items-center justify-center h-32 sm:h-48 border-2 border-dashed border-neutral-700 rounded-lg",
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
                  /*#__PURE__*/ React.createElement(Pencil, {
                    className: "w-[1em] h-[1em] inline-block",
                  }),
                ),
                /*#__PURE__*/ React.createElement(
                  "p",
                  {
                    className:
                      "text-neutral-400 text-sm sm:text-base font-medium",
                  },
                  "Add exercises to edit your plan",
                ),
              ),
            )
          : /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "space-y-2 sm:space-y-3 max-h-96 overflow-y-auto",
              },
              exercises.map((exercise, index) =>
                /*#__PURE__*/ React.createElement(
                  "div",
                  {
                    key: exercise.planId,
                    draggable: true,
                    onDragStart: (e) => handleDragStart(e, exercise, "plan"),
                    onDragEnd: handleDragEnd,
                    className:
                      "p-3 sm:p-4 rounded-lg bg-green-900/20 border border-green-700/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-green-800/20 hover:border-green-600/50 select-none",
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
                        className: "flex items-center gap-1",
                      },
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => moveUp(index),
                          disabled: index === 0,
                          className:
                            "text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-800/50 transition-colors",
                        },
                        "\u2191",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => moveDown(index),
                          disabled: index === exercises.length - 1,
                          className:
                            "text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-800/50 transition-colors",
                        },
                        "\u2193",
                      ),
                      /*#__PURE__*/ React.createElement(
                        "button",
                        {
                          onClick: () => removeFromPlan(exercise.planId),
                          className:
                            "text-red-400 hover:text-red-300 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-red-900/20 transition-colors ml-1",
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
