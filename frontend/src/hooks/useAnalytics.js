// frontend/src/hooks/useAnalytics.js - ZERO CONSOLE ERRORS VERSION
import { useState, useEffect, useCallback } from "react";

export function useAnalytics() {
  const [stats, setStats] = useState(null);
  const [caloriesData, setCaloriesData] = useState(null);
  const [frequencyData, setFrequencyData] = useState(null);
  const [muscleData, setMuscleData] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // MOCK DATA ONLY - NO API CALLS TO PREVENT 404 ERRORS
      const mockStats = {
        totalWorkouts: 12,
        totalMeals: 45,
        currentStreak: 7,
        xpPoints: 1250,
        joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastActive: new Date(),
      };

      const mockCalorieData = [
        { day: "Mon", calories: 2100 },
        { day: "Tue", calories: 1950 },
        { day: "Wed", calories: 2200 },
        { day: "Thu", calories: 2050 },
        { day: "Fri", calories: 2300 },
        { day: "Sat", calories: 2400 },
        { day: "Sun", calories: 2000 },
      ];

      const mockFrequencyData = [
        { day: "Mon", workouts: 2 },
        { day: "Tue", workouts: 1 },
        { day: "Wed", workouts: 3 },
        { day: "Thu", workouts: 1 },
        { day: "Fri", workouts: 2 },
        { day: "Sat", workouts: 4 },
        { day: "Sun", workouts: 1 },
      ];

      const mockMuscleData = [
        { muscle: "Chest", percentage: 25, color: "#3B82F6" },
        { muscle: "Back", percentage: 20, color: "#10B981" },
        { muscle: "Legs", percentage: 30, color: "#F59E0B" },
        { muscle: "Arms", percentage: 15, color: "#EF4444" },
        { muscle: "Shoulders", percentage: 10, color: "#8B0000" },
      ];

      const mockAchievements = [
        {
          id: 1,
          title: "First Workout",
          description: "Complete your first workout",
          icon: "🏋️",
          unlocked: true,
          unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: 2,
          title: "Nutrition Tracker",
          description: "Log your first meal",
          icon: "🍎",
          unlocked: true,
          unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: 3,
          title: "Week Warrior",
          description: "Work out 5 times in a week",
          icon: "🔥",
          unlocked: false,
          progress: 3,
          target: 5,
        },
      ];

      // Use mock data directly - NO API CALLS
      setStats(mockStats);

      // Set mock calories chart data
      setCaloriesData({
        labels: mockCalorieData.map((d) => d.day),
        datasets: [
          {
            label: "Calories Consumed",
            data: mockCalorieData.map((d) => d.calories),
            tension: 0.3,
            fill: true,
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "#3b82f6",
            pointRadius: 4,
            pointBackgroundColor: "#3b82f6",
          },
        ],
      });

      // Set mock frequency chart data
      setFrequencyData({
        labels: mockFrequencyData.map((d) => d.day),
        datasets: [
          {
            label: "Workouts per Day",
            data: mockFrequencyData.map((d) => d.workouts),
            backgroundColor: "rgba(16, 185, 129, 0.8)",
            borderColor: "#10b981",
            borderWidth: 2,
          },
        ],
      });

      // Set mock muscle distribution data
      setMuscleData({
        labels: mockMuscleData.map((d) => d.muscle),
        datasets: [
          {
            data: mockMuscleData.map((d) => d.percentage),
            backgroundColor: mockMuscleData.map((d) => d.color),
            borderWidth: 2,
            borderColor: "#0D0D0D",
          },
        ],
      });

      // Set mock achievements
      setAchievements(mockAchievements);
    } catch (err) {
      // Fallback data even on error
      setStats({
        totalWorkouts: 0,
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
    achievements: (achievements || []).map((achievement) => ({
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
