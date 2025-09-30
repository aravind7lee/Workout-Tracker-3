import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { exerciseLibrary } from '../data/exerciseLibrary';
import nutritionApi from '../services/nutritionApi';
import foodCategoriesService from '../services/foodCategoriesService';

export default function SearchBar({ isMobile = false, onClose = () => {} }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Get all searchable data
  const getAllData = async () => {
    const exercises = [];
    const plans = [];
    const meals = [];

    // Get exercises from library
    Object.entries(exerciseLibrary).forEach(([muscleKey, muscleGroup]) => {
      muscleGroup.exercises.forEach(exercise => {
        exercises.push({
          id: exercise.id,
          type: 'exercise',
          title: exercise.name,
          description: `${muscleGroup.name} • ${exercise.sets} • ${exercise.difficulty}`,
          icon: muscleGroup.icon,
          category: muscleGroup.name
        });
      });
    });

    // Get plans from localStorage
    try {
      const savedPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      savedPlans.forEach(plan => {
        plans.push({
          id: plan.id,
          type: 'plan',
          title: plan.name,
          description: `${plan.exercises?.length || 0} exercises • ${plan.category || 'Custom'}`,
          icon: '📋',
          category: plan.category || 'Custom'
        });
      });
    } catch (error) {
      console.error('Error loading plans:', error);
    }

    // Get comprehensive food items from food categories service
    try {
      const foodCategories = await foodCategoriesService.getFoodCategories();
      Object.values(foodCategories).forEach(category => {
        if (category.foods) {
          category.foods.forEach((food, index) => {
            meals.push({
              id: `${category.title.toLowerCase().replace(/\s+/g, '-')}-${index}`,
              type: 'meal',
              title: food.name,
              description: `${food.calories} cal • ${food.protein}g protein • ${food.carbs}g carbs • ${food.fat}g fat`,
              icon: '🍽️',
              foodData: food
            });
          });
        }
      });
    } catch (error) {
      console.log('Failed to load food categories, using fallback');
    }

    return [...exercises, ...plans, ...meals];
  };
  
  // Wrapper to handle async getAllData
  const getAllDataSync = () => {
    const [data, setData] = useState([]);
    
    useEffect(() => {
      getAllData().then(setData);
    }, []);
    
    return data;
  };

  // Enhanced search function with comprehensive food database
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchTerm = searchQuery.toLowerCase();
      let allResults = [];
      
      // Search in local data (exercises, plans, food database)
      const allItems = await getAllData();
      const localResults = allItems.filter(item => {
        return (
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category?.toLowerCase().includes(searchTerm)
        );
      });
      
      allResults = [...localResults];
      
      // Skip API lookup for search to maintain consistency
      // All food results come from static database only
      
      // Sort by relevance
      const sorted = allResults.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        
        // Exact matches first
        if (aTitle === searchTerm && bTitle !== searchTerm) return -1;
        if (bTitle === searchTerm && aTitle !== searchTerm) return 1;
        
        // Starts with matches next
        if (aTitle.startsWith(searchTerm) && !bTitle.startsWith(searchTerm)) return -1;
        if (bTitle.startsWith(searchTerm) && !aTitle.startsWith(searchTerm)) return 1;
        
        // API results (more accurate) before database results
        if (a.nutritionData && !b.nutritionData) return -1;
        if (b.nutritionData && !a.nutritionData) return 1;
        
        return aTitle.localeCompare(bTitle);
      });
      
      setResults(sorted.slice(0, 20));
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }
    
    setIsSearching(false);
  };

  // Handle input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query);
    }, 200); // Faster response for better UX
    
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle result click
  const handleResultClick = (result) => {
    let targetUrl;
    
    if (result.type === 'exercise') {
      // Navigate to library with the specific exercise search
      targetUrl = `/library?search=${encodeURIComponent(result.title)}`;
    } else if (result.type === 'meal') {
      targetUrl = `/nutrition?search=${encodeURIComponent(result.title)}`;
    } else if (result.type === 'plan') {
      targetUrl = result.id ? `/my-plans?highlight=${result.id}` : `/my-plans?search=${encodeURIComponent(result.title)}`;
    } else {
      targetUrl = `/library?search=${encodeURIComponent(result.title)}`;
    }
    
    // Clear search and close
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClose();
    
    // Navigate
    window.location.href = targetUrl;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setQuery('');
      setResults([]);
      setIsOpen(false);
      onClose();
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  // Handle close
  const handleClose = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClose();
  };

  // Desktop version
  if (!isMobile) {
    return (
      <div ref={searchRef} className="relative">
        <AnimatePresence>
          {isOpen ? (
            <motion.div
              initial={{ width: 40, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <form onSubmit={handleSubmit}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" size={16} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search all foods, workouts, plans..."
                    className="w-full pl-10 pr-10 py-2 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
              
              {/* Results dropdown */}
              <AnimatePresence>
                {query && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-xl border border-slate-600/50 rounded-xl shadow-2xl py-2 max-h-80 overflow-y-auto z-50"
                  >
                    {results.length > 0 ? (
                      <>
                        <div className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-slate-400 border-b border-slate-600/50">
                          Results ({results.length})
                        </div>
                        {results.map((result) => (
                          <button
                            key={result.id}
                            onClick={() => handleResultClick(result)}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-slate-700/50 transition-colors"
                          >
                            <div className="text-2xl">{result.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-white">{result.title}</div>
                              <div className="text-sm truncate text-slate-400">{result.description}</div>
                            </div>
                            <div className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300 capitalize">
                              {result.type}
                            </div>
                          </button>
                        ))}
                      </>
                    ) : !isSearching ? (
                      <div className="px-4 py-8 text-center text-slate-400">
                        <div className="mb-2">No results found</div>
                        <div className="text-sm">Try different keywords</div>
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                        <div className="text-xs mt-2 text-slate-400">Searching...</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(true)}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            >
              <Search size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile version
  return (
    <>
      {/* Mobile search trigger */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
      >
        <Search size={20} />
      </motion.button>

      {/* Mobile search modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              style={{ touchAction: 'none' }}
            />
            
            {/* Search container */}
            <motion.div
              initial={{ y: '-100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 right-0 z-50 p-4 bg-slate-900/95 backdrop-blur-xl border-b border-slate-600/50"
            >
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" size={18} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search all foods, workouts, plans..."
                    className="w-full pl-10 pr-10 py-3 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                    autoFocus
                  />
                  {isSearching && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </form>
              
              {/* Mobile results */}
              {query && (
                <div className="rounded-xl p-2 max-h-60 overflow-y-auto bg-slate-800/60 backdrop-blur-sm border border-slate-600/50">
                  {results.length > 0 ? (
                    <>
                      <div className="text-xs font-medium uppercase tracking-wide px-2 py-1 mb-2 text-slate-400">
                        Results ({results.length})
                      </div>
                      {results.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleResultClick(result)}
                          className="w-full flex items-center space-x-3 px-3 py-3 text-left rounded-lg transition-colors hover:bg-slate-700/50 active:bg-slate-600/50"
                          style={{ minHeight: '48px', touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
                        >
                          <div className="text-lg">{result.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate text-white">{result.title}</div>
                            <div className="text-xs truncate text-slate-400">{result.description}</div>
                          </div>
                          <div className="text-xs px-2 py-1 rounded-full bg-slate-700/50 text-slate-300 capitalize">
                            {result.type}
                          </div>
                        </button>
                      ))}
                    </>
                  ) : !isSearching ? (
                    <div className="px-2 py-4 text-center">
                      <div className="text-sm text-slate-400">No results found</div>
                      <div className="text-xs mt-1 text-slate-500">Try different keywords</div>
                    </div>
                  ) : (
                    <div className="px-2 py-4 text-center">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <div className="text-xs mt-2 text-slate-400">Searching...</div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}