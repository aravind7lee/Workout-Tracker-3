// frontend/src/pages/ExerciseDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  PlayIcon,
  HeartIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import ReviewSystem from "../components/ReviewSystem";

export default function ExerciseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  const fallbackExercises = {
    1: {
      id: 1,
      name: "Push-ups",
      category: "Chest",
      difficulty: "Beginner",
      duration: "10-15 minutes",
      calories: "50-80",
      equipment: "None",
      description:
        "A classic bodyweight exercise that targets the chest, shoulders, and triceps.",
      instructions: [
        "Start in a plank position with hands slightly wider than shoulders",
        "Lower your body until chest nearly touches the floor",
        "Push back up to starting position",
        "Keep your core tight throughout the movement",
      ],
      tips: [
        "Keep your body in a straight line",
        "Don't let your hips sag or pike up",
        "Control the movement - don't rush",
        "Breathe out as you push up",
      ],
      muscles: ["Chest", "Shoulders", "Triceps", "Core"],
      sets: "3 sets of 10-15 reps",
    },
    16: {
      id: 16,
      name: "Bench Press",
      category: "Chest",
      difficulty: "Intermediate",
      duration: "15-20 minutes",
      calories: "80-120",
      equipment: "Barbell",
      description:
        "A compound exercise that targets the chest, shoulders, and triceps.",
      instructions: [
        "Lie on bench with feet flat on floor",
        "Grip barbell slightly wider than shoulders",
        "Lower bar to chest with control",
        "Press up to full arm extension",
      ],
      tips: [
        "Keep your back flat on the bench",
        "Control the weight on the way down",
        "Focus on squeezing chest muscles",
        "Use a spotter for heavy weights",
      ],
      muscles: ["Chest", "Shoulders", "Triceps"],
      sets: "3 sets of 8-12 reps",
    },
  };

  const formatExerciseData = (data) => {
    if (!data) return null;

    // If it's from the database, format it
    if (data.instructions && typeof data.instructions === "string") {
      return {
        ...data,
        duration: "15-20 minutes",
        calories: "60-100",
        equipment: data.category === "Cardio" ? "None" : "Varies",
        instructions: data.instructions.split(". ").filter(Boolean),
        tips: [
          "Focus on proper form",
          "Control the movement",
          "Breathe properly throughout",
          "Start with lighter weights",
        ],
        sets:
          data.difficulty === "Beginner"
            ? "3 sets of 8-12 reps"
            : data.difficulty === "Advanced"
              ? "4 sets of 6-10 reps"
              : "3 sets of 10-15 reps",
      };
    }

    return data;
  };

  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true);
      try {
        // Try to fetch from API first
        const response = await fetch(`/api/exercises/${id}`);
        if (response.ok) {
          const data = await response.json();
          setExercise(formatExerciseData(data));
        } else {
          // Fallback to local data
          const exerciseData = fallbackExercises[id] || fallbackExercises[1];
          setExercise(exerciseData);
        }
      } catch (error) {
        // Fallback to local data on error
        const exerciseData = fallbackExercises[id] || fallbackExercises[1];
        setExercise(exerciseData);
      }
      setLoading(false);
    };

    fetchExercise();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Exercise not found
        </h2>
        <button
          onClick={() => navigate("/library")}
          className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isFavorite ? (
              <HeartSolidIcon className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            <ShareIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Exercise Info */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {exercise.name}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                {exercise.category}
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                {exercise.difficulty}
              </span>
            </div>
          </div>
          <button className="flex items-center px-6 py-3 bg-red-700 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <PlayIcon className="h-5 w-5 mr-2" />
            Start Exercise
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {exercise.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-red-700 mb-1">
              {exercise.duration}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Duration
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {exercise.calories}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Calories
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-red-800 mb-1">
              {exercise.equipment}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Equipment
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {exercise.sets}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Recommended
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Instructions
          </h2>
          <ol className="space-y-3">
            {exercise.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {instruction}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-6">
          {/* Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Tips
            </h2>
            <ul className="space-y-2">
              {exercise.tips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span className="text-gray-600 dark:text-gray-400">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Muscles */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Target Muscles
            </h2>
            <div className="flex flex-wrap gap-2">
              {exercise.muscles.map((muscle, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Review System */}
      <ReviewSystem
        exerciseId={exercise.id || exercise._id || id}
        exerciseName={exercise.name}
      />
    </div>
  );
}
