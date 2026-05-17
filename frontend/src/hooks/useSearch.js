// frontend/src/hooks/useSearch.js
import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "./useDebounce";

export function useSearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Real-time search data matching your existing pages
  const mockData = {
    exercises: [
      {
        id: 1,
        type: "exercise",
        title: "Push-ups",
        description: "Chest, Triceps, Core - Bodyweight exercise",
        icon: "💪",
      },
      {
        id: 2,
        type: "exercise",
        title: "Bench Press",
        description: "Chest, Triceps, Shoulders - Compound movement",
        icon: "🏋️",
      },
      {
        id: 3,
        type: "exercise",
        title: "Squats",
        description: "Legs, Glutes, Core - Lower body foundation",
        icon: "🦵",
      },
      {
        id: 4,
        type: "exercise",
        title: "Deadlift",
        description: "Full body compound movement",
        icon: "💪",
      },
      {
        id: 5,
        type: "exercise",
        title: "Pull-ups",
        description: "Back, Biceps - Upper body pulling",
        icon: "🔄",
      },
      {
        id: 6,
        type: "exercise",
        title: "Overhead Press",
        description: "Shoulders, Triceps - Vertical push",
        icon: "🏋️",
      },
      {
        id: 7,
        type: "exercise",
        title: "Barbell Rows",
        description: "Back, Biceps - Horizontal pull",
        icon: "↔️",
      },
      {
        id: 8,
        type: "exercise",
        title: "Dips",
        description: "Chest, Triceps - Bodyweight exercise",
        icon: "💪",
      },
      {
        id: 9,
        type: "exercise",
        title: "Lunges",
        description: "Legs, Glutes - Unilateral movement",
        icon: "🚶",
      },
      {
        id: 10,
        type: "exercise",
        title: "Plank",
        description: "Core stability and strength",
        icon: "🎯",
      },
    ],
    meals: [
      {
        id: 11,
        type: "meal",
        title: "Chicken Breast",
        description: "Lean protein - 165 cal, 31g protein",
        icon: "🍗",
      },
      {
        id: 12,
        type: "meal",
        title: "Greek Yogurt",
        description: "High protein snack - 130 cal, 23g protein",
        icon: "🥛",
      },
      {
        id: 13,
        type: "meal",
        title: "Oatmeal",
        description: "Complex carbs - 307 cal, 10g protein",
        icon: "🥣",
      },
      {
        id: 14,
        type: "meal",
        title: "Salmon",
        description: "Omega-3 rich - 208 cal, 25g protein",
        icon: "🐟",
      },
      {
        id: 15,
        type: "meal",
        title: "Avocado",
        description: "Healthy fats - 322 cal, 4g protein",
        icon: "🥑",
      },
      {
        id: 16,
        type: "meal",
        title: "Eggs",
        description: "Complete protein - 155 cal, 13g protein",
        icon: "🥚",
      },
      {
        id: 17,
        type: "meal",
        title: "Brown Rice",
        description: "Complex carbs - 216 cal, 5g protein",
        icon: "🍚",
      },
      {
        id: 18,
        type: "meal",
        title: "Broccoli",
        description: "Nutrient dense - 55 cal, 4g protein",
        icon: "🥦",
      },
    ],
    plans: [
      {
        id: 19,
        type: "plan",
        title: "Beginner Strength",
        description: "4-week strength building program",
        icon: "📋",
      },
      {
        id: 20,
        type: "plan",
        title: "Weight Loss",
        description: "Fat loss with cardio and strength",
        icon: "📉",
      },
      {
        id: 21,
        type: "plan",
        title: "Muscle Building",
        description: "Hypertrophy focused program",
        icon: "💪",
      },
      {
        id: 22,
        type: "plan",
        title: "Home Workout",
        description: "No equipment needed",
        icon: "🏠",
      },
      {
        id: 23,
        type: "plan",
        title: "Push Pull Legs",
        description: "6-day split routine",
        icon: "🏋️",
      },
      {
        id: 24,
        type: "plan",
        title: "Full Body",
        description: "3-day full body routine",
        icon: "⚡",
      },
    ],
  };

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allItems = [
      ...mockData.exercises,
      ...mockData.meals,
      ...mockData.plans,
    ];

    const filtered = allItems.filter((item) => {
      const searchTerm = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm)
      );
    });

    // Sort results by relevance (exact matches first, then partial matches)
    const sorted = filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const searchTerm = query.toLowerCase();

      // Exact title matches first
      if (aTitle === searchTerm && bTitle !== searchTerm) return -1;
      if (bTitle === searchTerm && aTitle !== searchTerm) return 1;

      // Title starts with search term
      if (aTitle.startsWith(searchTerm) && !bTitle.startsWith(searchTerm))
        return -1;
      if (bTitle.startsWith(searchTerm) && !aTitle.startsWith(searchTerm))
        return 1;

      // Alphabetical order for same relevance
      return aTitle.localeCompare(bTitle);
    });

    setSearchResults(sorted.slice(0, 10)); // Limit to 10 results for better UX
    setIsSearching(false);
  }, []);

  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    clearSearch,
  };
}
