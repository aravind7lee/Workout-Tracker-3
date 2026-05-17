// Professional Workout Setup Modal Component
import { Edit, Rocket, Target, Lightbulb } from 'lucide-react';
import React, { useState } from "react";


const WorkoutSetupModal = ({ exercise, onClose, onStartWorkout }) => {
  console.log("📝 WorkoutSetupModal rendered for exercise:", exercise?.name);
  const [workoutConfig, setWorkoutConfig] = useState({
    targetSets: 3,
    targetReps: 12,
    weight: 20,
    restTime: 60,
    notes: "",
  });
  const handleInputChange = (field, value) => {
    setWorkoutConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleStartWorkout = () => {
    console.log("🚀 Starting workout with config:", workoutConfig);

    // Validate required fields
    if (workoutConfig.targetSets < 1 || workoutConfig.targetReps < 1) {
      alert("Please set valid targets for sets and reps");
      return;
    }
    onStartWorkout({
      exercise,
      config: workoutConfig,
    });
  };
  const presetConfigs = [
    {
      name: "Strength",
      sets: 5,
      reps: 5,
      rest: 180,
      weight: 40,
      desc: "3 min rest",
    },
    {
      name: "Hypertrophy",
      sets: 4,
      reps: 10,
      rest: 90,
      weight: 25,
      desc: "1.5 min rest",
    },
    {
      name: "Endurance",
      sets: 3,
      reps: 15,
      rest: 45,
      weight: 15,
      desc: "45s rest",
    },
    {
      name: "Power",
      sets: 6,
      reps: 3,
      rest: 300,
      weight: 50,
      desc: "5 min rest",
    },
    {
      name: "Quick",
      sets: 3,
      reps: 12,
      rest: 30,
      weight: 20,
      desc: "30s rest",
    },
    {
      name: "Heavy",
      sets: 3,
      reps: 6,
      rest: 240,
      weight: 35,
      desc: "4 min rest",
    },
  ];
  const applyPreset = (preset) => {
    setWorkoutConfig((prev) => ({
      ...prev,
      targetSets: preset.sets,
      targetReps: preset.reps,
      restTime: preset.rest,
      weight: preset.weight,
    }));
  };
  return /*#__PURE__*/ React.createElement(
    "div",
    {
      className:
        "fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]",
      onClick: onClose,
    },
    /*#__PURE__*/ React.createElement(
      "div",
      {
        className: "card max-w-lg w-full max-h-[90vh] overflow-y-auto relative",
        onClick: (e) => e.stopPropagation(),
      },
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "text-center mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "h2",
          {
            className: "text-3xl font-bold text-white mb-2",
          },
          /*#__PURE__*/ React.createElement(Target, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          " Setup Your Workout",
        ),
        /*#__PURE__*/ React.createElement(
          "p",
          {
            className: "text-neutral-400",
          },
          "Configure your workout parameters before starting",
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: onClose,
            className:
              "absolute top-4 right-4 text-neutral-400 hover:text-white text-2xl",
          },
          "\xD7",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className:
            "flex items-center gap-4 mb-6 p-4 bg-neutral-900/50 rounded-lg",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: `w-16 h-16 ${exercise.color} rounded-lg flex items-center justify-center`,
          },
          /*#__PURE__*/ React.createElement(
            "span",
            {
              className: "text-3xl",
            },
            exercise.icon,
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "h3",
            {
              className: "text-xl font-semibold text-white",
            },
            exercise.name,
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-neutral-400",
            },
            exercise.category,
            " \u2022 ",
            exercise.difficulty,
          ),
          /*#__PURE__*/ React.createElement(
            "p",
            {
              className: "text-sm text-neutral-500",
            },
            "Recommended: ",
            exercise.sets,
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "h4",
          {
            className: "text-sm font-medium text-neutral-300 mb-3",
          },
          "Quick Presets",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "grid grid-cols-2 gap-2",
          },
          presetConfigs.map((preset) =>
            /*#__PURE__*/ React.createElement(
              "button",
              {
                key: preset.name,
                onClick: () => applyPreset(preset),
                className:
                  "p-3 bg-neutral-900/30 hover:bg-neutral-800/50 rounded-lg text-left transition-colors",
              },
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-sm font-medium text-white",
                },
                preset.name,
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xs text-neutral-400",
                },
                preset.sets,
                " sets \xD7 ",
                preset.reps,
                " reps",
              ),
              /*#__PURE__*/ React.createElement(
                "div",
                {
                  className: "text-xs text-red-500",
                },
                preset.desc,
              ),
            ),
          ),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "space-y-4 mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className: "block text-sm font-medium text-neutral-300 mb-2",
            },
            "Target Sets",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center gap-3",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  handleInputChange(
                    "targetSets",
                    Math.max(1, workoutConfig.targetSets - 1),
                  ),
                className:
                  "w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white",
              },
              "-",
            ),
            /*#__PURE__*/ React.createElement("input", {
              type: "number",
              value: workoutConfig.targetSets,
              onChange: (e) =>
                handleInputChange("targetSets", parseInt(e.target.value) || 1),
              className:
                "flex-1 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center",
              min: "1",
              max: "10",
            }),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  handleInputChange(
                    "targetSets",
                    Math.min(10, workoutConfig.targetSets + 1),
                  ),
                className:
                  "w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white",
              },
              "+",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className: "block text-sm font-medium text-neutral-300 mb-2",
            },
            "Target Reps per Set",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center gap-3",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  handleInputChange(
                    "targetReps",
                    Math.max(1, workoutConfig.targetReps - 1),
                  ),
                className:
                  "w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white",
              },
              "-",
            ),
            /*#__PURE__*/ React.createElement("input", {
              type: "number",
              value: workoutConfig.targetReps,
              onChange: (e) =>
                handleInputChange("targetReps", parseInt(e.target.value) || 1),
              className:
                "flex-1 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center",
              min: "1",
              max: "50",
            }),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  handleInputChange(
                    "targetReps",
                    Math.min(50, workoutConfig.targetReps + 1),
                  ),
                className:
                  "w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white",
              },
              "+",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className: "block text-sm font-medium text-neutral-300 mb-2",
            },
            "Starting Weight (kg)",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center gap-3",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  handleInputChange(
                    "weight",
                    Math.max(0, workoutConfig.weight - 2.5),
                  ),
                className:
                  "w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white",
              },
              "-",
            ),
            /*#__PURE__*/ React.createElement("input", {
              type: "number",
              step: "0.5",
              value: workoutConfig.weight,
              onChange: (e) =>
                handleInputChange("weight", parseFloat(e.target.value) || 0),
              className:
                "flex-1 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center",
              min: "0",
              max: "500",
            }),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  handleInputChange("weight", workoutConfig.weight + 2.5),
                className:
                  "w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white",
              },
              "+",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className: "block text-sm font-medium text-neutral-300 mb-2",
            },
            "Rest Between Sets",
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "flex items-center gap-3 mb-3",
            },
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  handleInputChange(
                    "restTime",
                    Math.max(15, workoutConfig.restTime - 15),
                  ),
                className:
                  "w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white",
              },
              "-",
            ),
            /*#__PURE__*/ React.createElement("input", {
              type: "number",
              value: workoutConfig.restTime,
              onChange: (e) =>
                handleInputChange("restTime", parseInt(e.target.value) || 60),
              className:
                "flex-1 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white text-center",
              min: "15",
              max: "900",
              placeholder: "60",
            }),
            /*#__PURE__*/ React.createElement(
              "button",
              {
                onClick: () =>
                  handleInputChange("restTime", workoutConfig.restTime + 15),
                className:
                  "w-10 h-10 bg-neutral-800 hover:bg-neutral-700 rounded-lg flex items-center justify-center text-white",
              },
              "+",
            ),
            /*#__PURE__*/ React.createElement(
              "div",
              {
                className: "text-sm text-neutral-400 min-w-[60px]",
              },
              Math.floor(workoutConfig.restTime / 60),
              ":",
              (workoutConfig.restTime % 60).toString().padStart(2, "0"),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "grid grid-cols-3 gap-2 mb-2",
            },
            [30, 45, 60, 90, 120, 180].map((time) =>
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  key: time,
                  onClick: () => handleInputChange("restTime", time),
                  className: `px-3 py-2 rounded text-xs transition-colors ${workoutConfig.restTime === time ? "bg-red-700 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`,
                },
                time >= 60
                  ? `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, "0")}`
                  : `${time}s`,
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "grid grid-cols-2 gap-2",
            },
            [240, 300, 360, 480].map((time) =>
              /*#__PURE__*/ React.createElement(
                "button",
                {
                  key: time,
                  onClick: () => handleInputChange("restTime", time),
                  className: `px-3 py-2 rounded text-xs transition-colors ${workoutConfig.restTime === time ? "bg-red-700 text-white" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`,
                },
                Math.floor(time / 60),
                " min",
              ),
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            {
              className: "text-xs text-neutral-500 mt-2",
            },
            /*#__PURE__*/ React.createElement(Lightbulb, {
              className: "w-[1em] h-[1em] inline-block",
            }),
            " Choose your preferred rest time (15 seconds to 15 minutes)",
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          null,
          /*#__PURE__*/ React.createElement(
            "label",
            {
              className: "block text-sm font-medium text-neutral-300 mb-2",
            },
            "Workout Notes (Optional)",
          ),
          /*#__PURE__*/ React.createElement("textarea", {
            value: workoutConfig.notes,
            onChange: (e) => handleInputChange("notes", e.target.value),
            className:
              "w-full p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white",
            rows: 2,
            placeholder: "Any specific goals or notes for this workout...",
          }),
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "bg-neutral-900/30 rounded-lg p-4 mb-6",
        },
        /*#__PURE__*/ React.createElement(
          "h4",
          {
            className: "text-sm font-medium text-white mb-2",
          },
          "Workout Summary",
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "grid grid-cols-2 gap-4 text-sm",
          },
          /*#__PURE__*/ React.createElement(
            "div",
            null,
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-neutral-400",
              },
              "Total Sets:",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-white ml-2",
              },
              workoutConfig.targetSets,
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            null,
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-neutral-400",
              },
              "Reps per Set:",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-white ml-2",
              },
              workoutConfig.targetReps,
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            null,
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-neutral-400",
              },
              "Starting Weight:",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-white ml-2",
              },
              workoutConfig.weight,
              " kg",
            ),
          ),
          /*#__PURE__*/ React.createElement(
            "div",
            null,
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-neutral-400",
              },
              "Rest Time:",
            ),
            /*#__PURE__*/ React.createElement(
              "span",
              {
                className: "text-white ml-2",
              },
              workoutConfig.restTime,
              "s",
            ),
          ),
        ),
        /*#__PURE__*/ React.createElement(
          "div",
          {
            className: "mt-2 text-xs text-neutral-400",
          },
          "Estimated Duration: ~",
          Math.ceil(
            (workoutConfig.targetSets * workoutConfig.restTime + 300) / 60,
          ),
          " minutes",
        ),
      ),
      /*#__PURE__*/ React.createElement(
        "div",
        {
          className: "flex gap-3",
        },
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: onClose,
            className: "btn-secondary flex-1",
          },
          "Cancel",
        ),
        /*#__PURE__*/ React.createElement(
          "button",
          {
            onClick: handleStartWorkout,
            className:
              "btn bg-green-600 hover:bg-green-700 text-white flex-1 font-semibold",
          },
          /*#__PURE__*/ React.createElement(Rocket, {
            className: "w-[1em] h-[1em] inline-block",
          }),
          " Start Workout",
        ),
      ),
    ),
  );
};
export default WorkoutSetupModal;
