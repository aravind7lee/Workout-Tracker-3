// frontend/src/hooks/useSearch.js
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';

export function useSearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Mock data - replace with actual API calls
  const mockData = {
    workouts: [
      { id: 1, type: 'workout', title: 'Push Day Workout', description: 'Chest, Shoulders, Triceps', icon: '💪' },
      { id: 2, type: 'workout', title: 'Pull Day Workout', description: 'Back, Biceps', icon: '🏋️' },
      { id: 3, type: 'workout', title: 'Leg Day Workout', description: 'Quads, Hamstrings, Glutes', icon: '🦵' },
      { id: 4, type: 'workout', title: 'Full Body HIIT', description: 'High Intensity Interval Training', icon: '🔥' },
      { id: 5, type: 'workout', title: 'Cardio Blast', description: 'Fat burning cardio session', icon: '🏃' },
    ],
    meals: [
      { id: 6, type: 'meal', title: 'Chicken Breast', description: '165 cal, 31g protein', icon: '🍗' },
      { id: 7, type: 'meal', title: 'Greek Yogurt', description: '130 cal, 23g protein', icon: '🥛' },
      { id: 8, type: 'meal', title: 'Oatmeal', description: '307 cal, 10g protein', icon: '🥣' },
      { id: 9, type: 'meal', title: 'Salmon', description: '208 cal, 25g protein', icon: '🐟' },
      { id: 10, type: 'meal', title: 'Avocado', description: '322 cal, 4g protein', icon: '🥑' },
    ],
    plans: [
      { id: 11, type: 'plan', title: 'Beginner Strength', description: '4-week strength building program', icon: '📋' },
      { id: 12, type: 'plan', title: 'Weight Loss Plan', description: 'Fat loss with cardio and strength', icon: '📉' },
      { id: 13, type: 'plan', title: 'Muscle Building', description: 'Hypertrophy focused program', icon: '💪' },
      { id: 14, type: 'plan', title: 'Athletic Performance', description: 'Sports performance enhancement', icon: '⚡' },
      { id: 15, type: 'plan', title: 'Home Workout Plan', description: 'No equipment needed', icon: '🏠' },
    ],
    exercises: [
      { id: 16, type: 'exercise', title: 'Bench Press', description: 'Chest, Triceps, Shoulders', icon: '🏋️' },
      { id: 17, type: 'exercise', title: 'Deadlift', description: 'Full body compound movement', icon: '💪' },
      { id: 18, type: 'exercise', title: 'Squats', description: 'Legs, Glutes, Core', icon: '🦵' },
      { id: 19, type: 'exercise', title: 'Pull-ups', description: 'Back, Biceps', icon: '🔄' },
      { id: 20, type: 'exercise', title: 'Push-ups', description: 'Chest, Triceps, Core', icon: '⬆️' },
    ]
  };

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allItems = [
      ...mockData.workouts,
      ...mockData.meals,
      ...mockData.plans,
      ...mockData.exercises
    ];
    
    const filtered = allItems.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.type.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filtered.slice(0, 8)); // Limit to 8 results
    setIsSearching(false);
  }, []);

  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    clearSearch
  };
}