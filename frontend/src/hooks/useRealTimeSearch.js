// frontend/src/hooks/useRealTimeSearch.js
import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { exerciseLibrary } from '../data/exerciseLibrary';

export function useRealTimeSearch() {
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Get real data from your existing sources
  const getRealData = useCallback(() => {
    const exercises = [];
    const plans = [];
    const meals = [];

    // Extract exercises from exerciseLibrary
    Object.entries(exerciseLibrary).forEach(([muscleKey, muscleGroup]) => {
      muscleGroup.exercises.forEach(exercise => {
        exercises.push({
          id: exercise.id,
          type: 'exercise',
          title: exercise.name,
          description: `${muscleGroup.name} • ${exercise.sets} • ${exercise.difficulty}`,
          icon: muscleGroup.icon,
          category: muscleGroup.name,
          difficulty: exercise.difficulty,
          sets: exercise.sets
        });
      });
    });

    // Get saved plans from localStorage
    try {
      const savedPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      savedPlans.forEach(plan => {
        plans.push({
          id: plan.id,
          type: 'plan',
          title: plan.name,
          description: `${plan.exercises.length} exercises • ${plan.category || 'Custom'}`,
          icon: '📋',
          category: plan.category || 'Custom',
          exerciseCount: plan.exercises.length
        });
      });
    } catch (error) {
      console.error('Error loading plans:', error);
    }

    // Get recent meals from localStorage
    try {
      const recentMeals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
      recentMeals.forEach(meal => {
        meals.push({
          id: meal._id || meal.id,
          type: 'meal',
          title: meal.parsedName || meal.name,
          description: `${Math.round(meal.calories || 0)} cal • ${Math.round(meal.protein || 0)}g protein`,
          icon: '🍽️',
          calories: meal.calories,
          protein: meal.protein
        });
      });
    } catch (error) {
      console.error('Error loading meals:', error);
    }

    return [...exercises, ...plans, ...meals];
  }, []);

  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulate realistic search delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allItems = getRealData();
    
    const filtered = allItems.filter(item => {
      const searchTerm = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm) ||
        item.type.toLowerCase().includes(searchTerm)
      );
    });
    
    // Sort by relevance
    const sorted = filtered.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const searchTerm = query.toLowerCase();
      
      // Exact matches first
      if (aTitle === searchTerm && bTitle !== searchTerm) return -1;
      if (bTitle === searchTerm && aTitle !== searchTerm) return 1;
      
      // Title starts with search term
      if (aTitle.startsWith(searchTerm) && !bTitle.startsWith(searchTerm)) return -1;
      if (bTitle.startsWith(searchTerm) && !aTitle.startsWith(searchTerm)) return 1;
      
      return aTitle.localeCompare(bTitle);
    });
    
    setSearchResults(sorted.slice(0, 8));
    setIsSearching(false);
  }, [getRealData]);

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