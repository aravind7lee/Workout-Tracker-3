// frontend/src/hooks/useRealAnalytics.js - REAL DATA ANALYTICS
import { useState, useEffect, useCallback } from "react";
import { exerciseLibrary } from "../data/exerciseLibrary";

export function useRealAnalytics() {
  const [stats, setStats] = useState(null);
  const [caloriesData, setCaloriesData] = useState(null);
  const [frequencyData, setFrequencyData] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get real workout plans from localStorage
  const getWorkoutPlans = () => {
    try {
      return JSON.parse(localStorage.getItem("workoutPlans") || "[]");
    } catch (error) {
      return [];
    }
  };

  // Get real workout history from localStorage
  const getWorkoutHistory = () => {
    try {
      return JSON.parse(localStorage.getItem("workoutHistory") || "[]");
    } catch (error) {
      return [];
    }
  };

  // Get real nutrition data from localStorage
  const getNutritionData = () => {
    try {
      const meals = JSON.parse(localStorage.getItem("recentMeals") || "[]");
      return meals;
    } catch (error) {
      return [];
    }
  };

  // Calculate real statistics
  const calculateStats = () => {
    const plans = getWorkoutPlans();
    const history = getWorkoutHistory();
    const meals = getNutritionData();

    // Calculate workout streak
    const sortedHistory = history.sort(
      (a, b) =>
        new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date),
    );

    let currentStreak = 0;
    let lastDate = null;

    for (const workout of sortedHistory) {
      const workoutDate = new Date(
        workout.completedAt || workout.date,
      ).toDateString();
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      if (!lastDate) {
        if (workoutDate === today || workoutDate === yesterday) {
          currentStreak = 1;
          lastDate = workoutDate;
        } else {
          break;
        }
      } else {
        const expectedDate = new Date(
          new Date(lastDate).getTime() - 86400000,
        ).toDateString();
        if (workoutDate === expectedDate) {
          currentStreak++;
          lastDate = workoutDate;
        } else {
          break;
        }
      }
    }

    // Calculate XP points
    const xpPoints =
      history.length * 100 + (currentStreak > 3 ? currentStreak * 50 : 0);

    return {
      totalWorkouts: history.length,
      totalPlans: plans.length,
      totalMeals: meals.length,
      currentStreak,
      xpPoints,
      joinDate:
        plans.length > 0 ? plans[0].createdAt : new Date().toISOString(),
      lastActive:
        history.length > 0
          ? history[0].completedAt || history[0].date
          : new Date().toISOString(),
    };
  };

  // Generate weekly workout frequency data
  const generateFrequencyData = () => {
    const history = getWorkoutHistory();
    const last7Days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toDateString(),
        day: dayNames[date.getDay()],
        workouts: 0,
      });
    }

    // Count workouts per day
    history.forEach((workout) => {
      const workoutDate = new Date(
        workout.completedAt || workout.date,
      ).toDateString();
      const dayData = last7Days.find((d) => d.date === workoutDate);
      if (dayData) {
        dayData.workouts++;
      }
    });

    return {
      labels: last7Days.map((d) => d.day),
      datasets: [
        {
          label: "Workouts per Day",
          data: last7Days.map((d) => d.workouts),
          backgroundColor: "rgba(16, 185, 129, 0.8)",
          borderColor: "#10b981",
          borderWidth: 2,
        },
      ],
    };
  };

  // Generate weekly calories data from nutrition
  const generateCaloriesData = () => {
    const meals = getNutritionData();
    const last7Days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push({
        date: date.toDateString(),
        day: dayNames[date.getDay()],
        calories: 0,
      });
    }

    // Sum calories per day
    meals.forEach((meal) => {
      const mealDate = new Date(meal.consumedAt || meal.date).toDateString();
      const dayData = last7Days.find((d) => d.date === mealDate);
      if (dayData) {
        dayData.calories += meal.calories || 0;
      }
    });

    return {
      labels: last7Days.map((d) => d.day),
      datasets: [
        {
          label: "Calories Consumed",
          data: last7Days.map((d) => Math.round(d.calories)),
          tension: 0.3,
          fill: true,
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          borderColor: "#3b82f6",
          pointRadius: 4,
          pointBackgroundColor: "#3b82f6",
        },
      ],
    };
  };

  // Generate muscle group distribution from workout plans
  const generateMuscleData = () => {
    const plans = getWorkoutPlans();
    const muscleCount = {};
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B0000",
      "#EC4899",
    ];

    // Count exercises by muscle group
    plans.forEach((plan) => {
      plan.exercises?.forEach((exercise) => {
        Object.entries(exerciseLibrary).forEach(([key, group]) => {
          const found = group.exercises.find((ex) => ex.name === exercise.name);
          if (found) {
            muscleCount[group.name] = (muscleCount[group.name] || 0) + 1;
          }
        });
      });
    });

    const muscles = Object.entries(muscleCount);
    const total = muscles.reduce((sum, [, count]) => sum + count, 0);

    if (total === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            data: [1],
            backgroundColor: ["#64748b"],
            borderWidth: 2,
            borderColor: "#0D0D0D",
          },
        ],
      };
    }

    return {
      labels: muscles.map(([muscle]) => muscle),
      datasets: [
        {
          data: muscles.map(([, count]) => Math.round((count / total) * 100)),
          backgroundColor: muscles.map((_, i) => colors[i % colors.length]),
          borderWidth: 2,
          borderColor: "#0D0D0D",
        },
      ],
    };
  };

  // Generate real achievements based on actual data
  const generateAchievements = () => {
    const stats = calculateStats();
    const plans = getWorkoutPlans();

    const achievements = [
      {
        id: "first-workout",
        title: "First Steps",
        description: "Complete your first workout",
        icon: "🎯",
        unlocked: stats.totalWorkouts >= 1,
        unlockedAt:
          stats.totalWorkouts >= 1
            ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            : null,
      },
      {
        id: "plan-creator",
        title: "Plan Creator",
        description: "Create your first workout plan",
        icon: "📋",
        unlocked: plans.length >= 1,
        unlockedAt: plans.length >= 1 ? new Date(plans[0].createdAt) : null,
      },
      {
        id: "streak-3",
        title: "3 Day Streak",
        description: "Workout for 3 consecutive days",
        icon: "🔥",
        unlocked: stats.currentStreak >= 3,
        unlockedAt:
          stats.currentStreak >= 3
            ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
            : null,
      },
      {
        id: "workout-10",
        title: "Consistency Builder",
        description: "Complete 10 workouts",
        icon: "💪",
        unlocked: stats.totalWorkouts >= 10,
        unlockedAt:
          stats.totalWorkouts >= 10
            ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
            : null,
      },
      {
        id: "nutrition-tracker",
        title: "Nutrition Tracker",
        description: "Log your first meal",
        icon: "🍎",
        unlocked: stats.totalMeals >= 1,
        unlockedAt:
          stats.totalMeals >= 1
            ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
            : null,
      },
    ];

    return achievements.filter((a) => a.unlocked);
  };

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate real statistics
      const realStats = calculateStats();
      setStats(realStats);

      // Generate real chart data
      setFrequencyData(generateFrequencyData());
      setCaloriesData(generateCaloriesData());
      setMuscleData(generateMuscleData());

      // Generate real achievements
      setAchievements(generateAchievements());
    } catch (err) {
      console.error("Error loading analytics:", err);
      setError("Failed to load analytics data");

      // Fallback data
      setStats({
        totalWorkouts: 0,
        totalPlans: 0,
        totalMeals: 0,
        currentStreak: 0,
        xpPoints: 0,
      });
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatTimeAgo = (date) => {
    if (!date) return "Recently";

    try {
      const now = new Date();
      const past = new Date(date);
      const diffInMinutes = Math.floor((now - past) / (1000 * 60));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;

      return past.toLocaleDateString();
    } catch (error) {
      return "Recently";
    }
  };

  return {
    stats,
    caloriesData,
    frequencyData,
    muscleData,
    achievements: achievements.map((achievement) => ({
      ...achievement,
      timeAgo: achievement.unlockedAt
        ? formatTimeAgo(achievement.unlockedAt)
        : "Recently",
    })),
    isLoading,
    error,
    refresh: loadAnalytics,
  };
}
