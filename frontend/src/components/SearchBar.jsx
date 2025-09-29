import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { exerciseLibrary } from '../data/exerciseLibrary';
import nutritionApi from '../services/nutritionApi';

export default function SearchBar({ isMobile = false, onClose = () => {} }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Get all searchable data
  const getAllData = () => {
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

    // Get comprehensive food items from nutrition database
    const comprehensiveFoodItems = [
      // Animal Proteins
      'Chicken Breast', 'Chicken Thigh', 'Turkey Breast', 'Salmon Atlantic', 'Tuna Canned Water', 'Sardines Canned', 'Mackerel Cooked',
      'Beef Steak Lean', 'Ground Beef Lean', 'Pork Loin Roasted', 'Egg Large Whole', 'Egg Whites', 'Greek Yogurt Plain Nonfat',
      'Cottage Cheese Low Fat', 'Whey Protein Isolate',
      
      // Plant Proteins
      'Lentils Cooked', 'Chickpeas Cooked', 'Black Beans Cooked', 'Kidney Beans Cooked', 'Tofu Firm', 'Tempeh',
      'Edamame Shelled', 'Quinoa Cooked', 'Oats Rolled Raw', 'Almonds', 'Peanut Butter', 'Chia Seeds', 'Hemp Seeds', 'Seitan Cooked',
      
      // Carbohydrates
      'White Rice Cooked', 'Brown Rice Cooked', 'Oats Cooked', 'Whole Wheat Bread', 'White Bread', 'Pasta Cooked',
      'Roti Chapati', 'Potato Boiled', 'Sweet Potato Baked', 'Corn Kernels Cooked', 'Banana Medium', 'Apple Medium', 'Pineapple Chunks',
      
      // Dairy & Alternatives
      'Greek Yogurt', 'Skimmed Milk', 'Whole Milk', 'Cottage Cheese', 'Cheese Slice', 'Whey Protein', 'Soy Milk', 'Almond Milk',
      
      // Vegetables
      'Broccoli', 'Spinach', 'Kale', 'Carrots', 'Bell Pepper', 'Tomatoes', 'Onions', 'Cauliflower',
      
      // Fruits
      'Apple', 'Banana', 'Orange', 'Blueberries', 'Strawberries', 'Grapes', 'Mango', 'Pineapple', 'Papaya', 'Watermelon',
      
      // Nuts & Seeds
      'Almonds', 'Walnuts', 'Cashews', 'Peanuts', 'Chia Seeds', 'Flax Seeds', 'Pumpkin Seeds', 'Sunflower Seeds',
      
      // Snacks & Condiments
      'Almond Butter', 'Dark Chocolate', 'Protein Bar', 'Honey', 'Olive Oil', 'Coconut Oil', 'Butter',
      
      // Beverages
      'Black Coffee', 'Green Tea', 'Black Tea', 'Fresh Orange Juice', 'Smoothie', 'Sports Drink',
      
      // Common Foods
      'Rice', 'Chicken', 'Eggs', 'Milk', 'Bread', 'Pasta', 'Oats', 'Salmon', 'Tuna', 'Beef', 'Pork', 'Turkey',
      'Yogurt', 'Cheese', 'Nuts', 'Seeds', 'Vegetables', 'Fruits', 'Beans', 'Lentils', 'Tofu', 'Fish', 'Meat'
    ];
    
    comprehensiveFoodItems.forEach((food, index) => {
      meals.push({
        id: `food-${index}`,
        type: 'meal',
        title: food,
        description: `Nutritional information available`,
        icon: '🍽️'
      });
    });

    return [...exercises, ...plans, ...meals];
  };

  // Enhanced search function with real-time nutrition data
  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const allItems = getAllData();
      const searchTerm = searchQuery.toLowerCase();
      
      // Enhanced search terms
      const searchTerms = [
        'workout', 'exercise', 'training', 'fitness',
        'meal', 'food', 'nutrition', 'diet', 'recipe',
        'plan', 'routine', 'program', 'schedule'
      ];
      
      const isGeneralSearch = searchTerms.some(term => searchTerm.includes(term));
      
      // Filter all items
      const filtered = allItems.filter(item => {
        return (
          item.title.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm) ||
          item.category?.toLowerCase().includes(searchTerm) ||
          item.type.toLowerCase().includes(searchTerm) ||
          (isGeneralSearch && (
            (searchTerm.includes('workout') || searchTerm.includes('exercise') || searchTerm.includes('training')) && item.type === 'exercise' ||
            (searchTerm.includes('meal') || searchTerm.includes('food') || searchTerm.includes('nutrition')) && item.type === 'meal' ||
            (searchTerm.includes('plan') || searchTerm.includes('routine') || searchTerm.includes('program')) && item.type === 'plan'
          ))
        );
      });
      
      // For food searches, also try to get real-time nutrition data
      if (searchTerm.length > 2 && (isGeneralSearch && searchTerm.includes('food') || searchTerm.includes('nutrition') || !isGeneralSearch)) {
        try {
          const nutritionResult = await nutritionApi.lookupFood(searchQuery);
          if (nutritionResult.success && nutritionResult.data) {
            // Add real-time nutrition result at the top
            filtered.unshift({
              id: `nutrition-${Date.now()}`,
              type: 'meal',
              title: nutritionResult.data.parsedName || nutritionResult.data.name,
              description: `${nutritionResult.data.calories} cal • ${nutritionResult.data.protein}g protein • Real-time data`,
              icon: '🍽️',
              nutritionData: nutritionResult.data
            });
          }
        } catch (error) {
          console.log('Real-time nutrition lookup failed, using database results');
        }
      }
      
      // Sort by relevance
      const sorted = filtered.sort((a, b) => {
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        
        // Prioritize exact matches
        if (aTitle === searchTerm && bTitle !== searchTerm) return -1;
        if (bTitle === searchTerm && aTitle !== searchTerm) return 1;
        
        // Prioritize starts with
        if (aTitle.startsWith(searchTerm) && !bTitle.startsWith(searchTerm)) return -1;
        if (bTitle.startsWith(searchTerm) && !aTitle.startsWith(searchTerm)) return 1;
        
        // Prioritize nutrition data (real-time results)
        if (a.nutritionData && !b.nutritionData) return -1;
        if (b.nutritionData && !a.nutritionData) return 1;
        
        return aTitle.localeCompare(bTitle);
      });
      
      setResults(sorted.slice(0, 25)); // Show more results
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to basic search
      const allItems = getAllData();
      const filtered = allItems.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered.slice(0, 20));
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