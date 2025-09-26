// Simple Exercise Library - Fallback Version
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { onlineService } from '../services/onlineService';
import QuickPlanModal from '../components/QuickPlanModal';
import AddToExistingPlanModal from '../components/AddToExistingPlanModal';
import WorkoutSuccessNotification from '../components/WorkoutSuccessNotification';
import LibraryHeaderImg from '../assets/Libraryheader.jpg';

export default function LibrarySimple() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    muscle: ''
  });
  
  // Basic states
  const [isOnline, setIsOnline] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(null);
  
  // Hero image states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // LQIP (Low Quality Image Placeholder)
  const LIBRARY_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  
  // Framer Motion variants for text animation
  const textVariants = {
    hidden: {
      opacity: 0,
      y: 12
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.06,
        delayChildren: 0.1
      }
    }
  };
  
  const childVariants = {
    hidden: {
      opacity: 0,
      y: 12
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.42,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };
  
  // Update search when navbar search parameter changes
  useEffect(() => {
    if (navbarSearch && navbarSearch !== searchQuery) {
      setSearchQuery(navbarSearch);
    }
  }, [navbarSearch]);
  
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showQuickPlan, setShowQuickPlan] = useState(null);
  const [showAddToExisting, setShowAddToExisting] = useState(null);
  
  // Preload hero image with optimization and performance monitoring
  useEffect(() => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      console.log(`🖼️ Library hero image loaded in ${loadTime.toFixed(2)}ms`);
      
      setImageLoaded(true);
      
      // Remove will-change properties after all animations complete
      setTimeout(() => {
        const heroContainer = document.querySelector('.hero-image-container');
        if (heroContainer) {
          heroContainer.classList.add('hero-animation-complete');
        }
      }, 1200);
    };
    
    img.onerror = (error) => {
      console.error('❌ Library hero image failed to load:', error);
      setImageError(true);
    };
    
    img.src = LibraryHeaderImg;
    img.loading = 'eager';
    img.fetchPriority = 'high';
    
    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);
  
  // Simple data fetching
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        // Check backend status
        const online = await onlineService.checkBackendStatus();
        setIsOnline(online);
        
        if (online && user) {
          // Fetch basic user progress
          const analytics = await onlineService.getAnalytics();
          if (analytics) {
            setUserProgress(analytics);
          }
          setLastSync(new Date());
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [user]);
  
  // Handle workout completion message
  useEffect(() => {
    const workoutState = location.state;
    if (workoutState?.workoutCompleted) {
      // Show success message
      const message = workoutState.savedOffline 
        ? `${workoutState.exercise} completed! (Saved offline)`
        : `${workoutState.exercise} completed in ${workoutState.duration}!`;
      
      setShowSuccessNotification(message);
      
      // Clear the state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);
  
  // Flatten all exercises from all muscle groups
  const allExercises = useMemo(() => {
    const exercises = [];
    Object.entries(exerciseLibrary).forEach(([muscleKey, muscleGroup]) => {
      muscleGroup.exercises.forEach(exercise => {
        exercises.push({
          ...exercise,
          category: muscleGroup.name,
          muscle: muscleGroup.name,
          icon: muscleGroup.icon,
          color: muscleGroup.color
        });
      });
    });
    return exercises;
  }, []);

  // Filter exercises based on search and filters
  const filteredExercises = useMemo(() => {
    return allExercises.filter(exercise => {
      const matchesSearch = !searchQuery || 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !filters.category || exercise.category === filters.category;
      const matchesDifficulty = !filters.difficulty || exercise.difficulty === filters.difficulty;
      const matchesMuscle = !filters.muscle || exercise.muscle === filters.muscle;
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesMuscle;
    });
  }, [allExercises, searchQuery, filters]);

  // Get unique values for filters
  const categories = [...new Set(allExercises.map(ex => ex.category))];
  const difficulties = ['beginner', 'intermediate', 'advanced'];
  const muscles = [...new Set(allExercises.map(ex => ex.muscle))];
  
  const handleQuickPlan = (exercise) => {
    setShowQuickPlan(exercise);
  };
  
  const handlePlanSaved = (savedPlan) => {
    setTimeout(() => {
      navigate('/my-plans?highlight=' + savedPlan.id);
    }, 500);
  };
  
  const handleAddToExisting = (exercise) => {
    setShowAddToExisting(exercise);
  };
  
  // Simple exercise tracking
  const trackExerciseView = (exercise) => {
    // Navigate directly to StartWorkout component
    navigate('/start-workout', { 
      state: { 
        selectedExercise: exercise,
        fromLibrary: true 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Premium Exercise Library Hero Section - Full Viewport */}
      <motion.div 
        className="relative w-full h-screen min-h-screen overflow-hidden hero-image-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        role="banner"
        aria-label="Exercise Library Hero Section"
      >
        {!imageLoaded && !imageError ? (
          // Skeleton placeholder with shimmer - no text animation during loading
          <motion.div 
            className="w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-700/50 relative overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
            {/* Mobile loading indicator */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/70 text-sm">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white/70 rounded-full animate-spin"></div>
              <span className="hidden sm:inline">Loading...</span>
            </div>
          </motion.div>
        ) : imageError ? (
          // Fallback content if image fails to load
          <motion.div 
            className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center text-white px-4">
              <motion.div 
                className="text-6xl mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                🏋️
              </motion.div>
              <motion.h1 
                className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Exercise Library
              </motion.h1>
              <motion.p 
                className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto drop-shadow-lg"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Browse, track, and customize your exercises with ease.
              </motion.p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* LQIP Placeholder - shows instantly */}
            <img
              src={LIBRARY_LQIP}
              alt=""
              className="w-full h-full object-cover blur-sm transition-opacity duration-300"
              style={{ opacity: imageLoaded ? 0 : 1 }}
            />
            
            {/* Main optimized image with mobile-responsive positioning */}
            <motion.img
              src={LibraryHeaderImg}
              srcSet={`
                ${LibraryHeaderImg} 1440w,
                ${LibraryHeaderImg} 1024w,
                ${LibraryHeaderImg} 768w,
                ${LibraryHeaderImg} 480w
              `}
              sizes="
                (max-width: 480px) 480px,
                (max-width: 768px) 768px,
                (max-width: 1024px) 1024px,
                1440px
              "
              alt="Exercise Library header – gym workout background"
              className="w-full h-full object-cover absolute inset-0"
              style={{
                objectPosition: window.innerWidth <= 640 ? 'center center' : 
                               window.innerWidth <= 768 ? 'center center' : 'center center'
              }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              width="1440"
              height="480"
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ 
                opacity: imageLoaded ? 1 : 0, 
                scale: imageLoaded ? 1 : 0.995 
              }}
              transition={{ 
                duration: 0.4, 
                ease: "easeOut"
              }}
            />
            
            {/* Adaptive gradient overlay for WCAG contrast compliance */}
            <div className="absolute inset-0 hero-overlay-dark dark:hero-overlay-dark light:hero-overlay-light" />
            
            {/* Hero content with precise Framer Motion sequencing */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="text-center text-white px-4 sm:px-6 max-w-4xl mx-auto"
                initial="hidden"
                animate={imageLoaded ? "visible" : "hidden"}
                variants={textVariants}
              >
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 hero-text-contrast leading-tight"
                  variants={{
                    hidden: { opacity: 0, y: 12 },
                    visible: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.6,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    }
                  }}
                  role="banner"
                  aria-label="Exercise Library - Main heading"
                >
                  Exercise Library
                </motion.h1>
                
                <motion.p 
                  className="text-sm sm:text-base md:text-lg lg:text-xl hero-text-contrast max-w-2xl mx-auto font-medium leading-relaxed px-2"
                  variants={childVariants}
                  aria-describedby="library-description"
                >
                  Browse, track, and customize your exercises with ease.
                </motion.p>
                
                {/* Mobile-friendly CTA buttons with stagger */}
                <motion.div
                  className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
                  variants={childVariants}
                >
                  <motion.button 
                    onClick={() => {
                      const exerciseGrid = document.getElementById('exercise-grid');
                      if (exerciseGrid) {
                        exerciseGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 text-base sm:text-lg cta-button border-2 border-blue-500"
                    aria-label="Scroll to exercise library"
                    variants={childVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    💪 EXPLORE EXERCISES
                  </motion.button>
                  <motion.button 
                    onClick={() => {
                      const searchFilters = document.getElementById('search-filters');
                      if (searchFilters) {
                        searchFilters.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="btn bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 text-base sm:text-lg cta-button border-2 border-orange-500"
                    aria-label="Scroll to search and filters"
                    variants={childVariants}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🔥 START TRAINING
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>
            

          </>
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className="relative bg-slate-900 pt-12 pb-12">
        <div className="container mx-auto px-4 max-w-7xl space-y-6 sm:space-y-8">
      {/* Status Bar - positioned below hero */}
      <div className="mb-8">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
              <span className="text-white font-medium">
                {isOnline ? '🟢 Online Mode' : '🟡 Offline Mode'}
              </span>
            </div>
            {lastSync && (
              <div className="text-xs text-slate-400">
                Last sync: {lastSync.toLocaleTimeString()}
              </div>
            )}
          </div>
          
          {user && userProgress && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{userProgress.workouts || 0}</div>
                <div className="text-xs text-slate-400">Total Workouts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{userProgress.streak || 0}</div>
                <div className="text-xs text-slate-400">Day Streak</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{userProgress.xpPoints || 0}</div>
                <div className="text-xs text-slate-400">XP Points</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-400">
                  {userProgress.weeklyGoal?.completed || 0}/{userProgress.weeklyGoal?.target || 4}
                </div>
                <div className="text-xs text-slate-400">Weekly Goal</div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Search and Filters */}
      <div id="search-filters" className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="relative">
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full p-3 sm:p-4 pl-12 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 text-sm sm:text-base" 
            placeholder="Search exercises by name, type, or muscle group..." 
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
            🔍
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <select 
            value={filters.category} 
            onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-sm sm:text-base"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          
          <select 
            value={filters.difficulty} 
            onChange={e => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-sm sm:text-base"
          >
            <option value="">All Difficulties</option>
            {difficulties.map(diff => (
              <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
            ))}
          </select>
          
          <select 
            value={filters.muscle} 
            onChange={e => setFilters(prev => ({ ...prev, muscle: e.target.value }))}
            className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-sm sm:text-base sm:col-span-2 lg:col-span-1"
          >
            <option value="">All Muscles</option>
            {muscles.map(muscle => (
              <option key={muscle} value={muscle}>{muscle}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-blue-400">{allExercises.length}</div>
          <div className="text-sm text-slate-400">Total Exercises</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-green-400">{categories.length}</div>
          <div className="text-sm text-slate-400">Muscle Groups</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-purple-400">{filteredExercises.length}</div>
          <div className="text-sm text-slate-400">Filtered Results</div>
        </div>
        <div className="card text-center py-4">
          <div className="text-2xl font-bold text-orange-400">{difficulties.length}</div>
          <div className="text-sm text-slate-400">Difficulty Levels</div>
        </div>
      </div>
      
      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-400 text-sm sm:text-base">
          Showing {filteredExercises.length} of {allExercises.length} exercises
        </div>
        <button
          onClick={() => {
            setSearchQuery('');
            setFilters({ category: '', difficulty: '', muscle: '' });
          }}
          className="btn-secondary text-sm"
        >
          Clear Filters
        </button>
      </div>

      {/* Exercise Grid */}
      <div id="exercise-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredExercises.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <div className="text-xl font-semibold text-white mb-2">No exercises found</div>
            <div className="text-slate-400 mb-6">Try adjusting your search or filters</div>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ category: '', difficulty: '', muscle: '' });
              }}
              className="btn bg-blue-600 hover:bg-blue-700 text-white"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          filteredExercises.map(exercise => (
            <div key={exercise.id} className="card hover:scale-105 transition-all duration-200 plan-card">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-12 h-12 ${exercise.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <span className="text-2xl">{exercise.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-base mb-1">{exercise.name}</div>
                  <div className="text-sm text-slate-400">{exercise.category}</div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Sets/Reps:</span>
                  <span className="text-sm font-medium text-white">{exercise.sets}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Type:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    exercise.type === 'compound' ? 'bg-blue-900/30 text-blue-300' :
                    exercise.type === 'isolation' ? 'bg-purple-900/30 text-purple-300' :
                    'bg-green-900/30 text-green-300'
                  }`}>
                    {exercise.type}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Difficulty:</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300' :
                    exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {exercise.difficulty}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedExercise(exercise)}
                  className="btn-secondary w-full text-sm"
                >
                  View Details
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickPlan(exercise)}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 text-sm"
                  >
                    + New Plan
                  </button>
                  <button
                    onClick={() => handleAddToExisting(exercise)}
                    className="btn bg-green-600 hover:bg-green-700 text-white flex-1 text-sm"
                  >
                    + Add to Plan
                  </button>
                </div>
                <button
                  onClick={() => trackExerciseView(exercise)}
                  className="btn bg-purple-600 hover:bg-purple-700 text-white w-full text-sm"
                >
                  🎯 Start Workout
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedExercise(null)}>
          <div className="card max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">{selectedExercise.name}</h3>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 ${selectedExercise.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-2xl">{selectedExercise.icon}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{selectedExercise.category}</div>
                  <div className="text-sm text-slate-400">{selectedExercise.sets}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-400 mb-1">Type</div>
                  <div className={`text-xs px-2 py-1 rounded inline-block ${
                    selectedExercise.type === 'compound' ? 'bg-blue-900/30 text-blue-300' :
                    selectedExercise.type === 'isolation' ? 'bg-purple-900/30 text-purple-300' :
                    'bg-green-900/30 text-green-300'
                  }`}>
                    {selectedExercise.type}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400 mb-1">Difficulty</div>
                  <div className={`text-xs px-2 py-1 rounded inline-block ${
                    selectedExercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300' :
                    selectedExercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300' :
                    'bg-red-900/30 text-red-300'
                  }`}>
                    {selectedExercise.difficulty}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedExercise(null);
                      handleQuickPlan(selectedExercise);
                    }}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    New Plan
                  </button>
                  <button
                    onClick={() => {
                      const exerciseToAdd = selectedExercise;
                      setSelectedExercise(null);
                      handleAddToExisting(exerciseToAdd);
                    }}
                    className="btn bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    Add to Plan
                  </button>
                </div>
                <button
                  onClick={() => {
                    trackExerciseView(selectedExercise);
                    setSelectedExercise(null);
                  }}
                  className="btn bg-purple-600 hover:bg-purple-700 text-white w-full"
                >
                  🎯 Start Workout Session
                </button>
                <button
                  onClick={() => setSelectedExercise(null)}
                  className="btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Quick Plan Modal */}
      {showQuickPlan && (
        <QuickPlanModal
          exercise={showQuickPlan}
          onClose={() => setShowQuickPlan(null)}
          onSave={handlePlanSaved}
        />
      )}
      
      {/* Add to Existing Plan Modal */}
      {showAddToExisting && (
        <AddToExistingPlanModal
          exercise={showAddToExisting}
          onClose={() => setShowAddToExisting(null)}
          onSave={handlePlanSaved}
        />
      )}
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-white">Loading...</div>
          </div>
        </div>
      )}
      
      {/* Success Notification */}
      {showSuccessNotification && (
        <WorkoutSuccessNotification
          message={showSuccessNotification}
          onClose={() => setShowSuccessNotification(null)}
        />
      )}
        </div>
      </div>
      

    </div>
  );
}