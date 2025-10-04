// Simple Exercise Library - Fallback Version
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { onlineService } from '../services/onlineService';
import QuickPlanModal from '../components/QuickPlanModal';
import AddToExistingPlanModal from '../components/AddToExistingPlanModal';
import WorkoutSuccessNotification from '../components/WorkoutSuccessNotification';
import LibraryHeaderImg from '../assets/Libraryheader.jpg';
import Library1 from '../assets/Library1.jpg';
import Library2 from '../assets/Library2.jpg';
import Library4 from '../assets/Library4.jpg';
import Library5 from '../assets/Library5.jpg';
import Library6 from '../assets/Library6.jpg';
import Library7 from '../assets/Library7.jpg';
import Library8 from '../assets/Library8.jpg';
import Library11 from '../assets/Library11.jpg';
import '../styles/shimmer.css';

export default function LibrarySimple() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isOnline: realTimeOnline } = useRealTime();
  const [searchParams] = useSearchParams();
  const navbarSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    muscle: ''
  });
  
  // Basic states
  const [isOnline, setIsOnline] = useState(realTimeOnline);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(null);
  
  // Hero image states
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  

  
  // LQIP (Low Quality Image Placeholder)
  const LIBRARY_LQIP = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  
  // Simplified animation for better performance
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
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
  
  // Optimized image preloading
  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = LibraryHeaderImg;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);
  
  // Update online status from real-time context
  useEffect(() => {
    setIsOnline(realTimeOnline);
  }, [realTimeOnline]);
  
  // Simple data fetching
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        console.log('🚀 Exercise Library initialized in', isOnline ? 'ONLINE' : 'OFFLINE', 'MODE');
        
        if (isOnline && user) {
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
  }, [user, isOnline]);
  
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
          // Optimized skeleton
          <div className="w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-700/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          </div>
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
                objectPosition: window.innerWidth <= 480 ? '60% center' : 
                               window.innerWidth <= 768 ? '55% center' : 'center center'
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
            
            {/* Optimized hero content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div 
                className="text-center text-white px-4 sm:px-6 max-w-4xl mx-auto"
                initial="hidden"
                animate={imageLoaded ? "visible" : "hidden"}
                variants={fadeIn}
              >
                <h1 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 hero-text-contrast leading-tight"
                  style={{ color: '#f59e0b' }}
                >
                  Exercise Library
                </h1>
                
                <p className="text-sm sm:text-base md:text-lg lg:text-xl hero-text-contrast max-w-2xl mx-auto font-medium leading-relaxed px-2">
                  Browse, track, and customize your exercises with ease.
                </p>
                
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                  <button 
                    onClick={() => document.getElementById('exercise-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-colors duration-200 text-base sm:text-lg"
                  >
                    💪 EXPLORE EXERCISES
                  </button>
                  <button 
                    onClick={() => document.getElementById('search-filters')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="btn bg-orange-600 hover:bg-orange-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold transition-colors duration-200 text-base sm:text-lg"
                  >
                    🔥 START TRAINING
                  </button>
                </div>
              </motion.div>
            </div>
            

          </>
        )}
      </motion.div>

      {/* Exercise Categories Gallery Section */}
      <section className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 py-16 sm:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              <span className="text-xs font-bold tracking-[0.3em] text-blue-400 uppercase">Exercise Categories</span>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-cyan-200">
                PREMIUM TRAINING
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300">
                COLLECTION
              </span>
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Discover our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-semibold">elite exercise library</span> with professional-grade workouts
            </p>
          </div>

          {/* Exercise Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Strength Training */}
            <ExerciseCard
              image={Library1}
              title="Strength Training"
              subtitle="Build Raw Power"
              description="Compound movements for maximum strength gains"
              category="strength"
              delay={0.1}
            />
            
            {/* Muscle Building */}
            <ExerciseCard
              image={Library2}
              title="Muscle Building"
              subtitle="Mass & Definition"
              description="Hypertrophy training for maximum muscle growth"
              category="muscle"
              delay={0.2}
            />
            
            {/* Functional Fitness */}
            <ExerciseCard
              image={Library4}
              title="Functional Fitness"
              subtitle="Real-World Movement"
              description="Practical exercises for daily performance"
              category="functional"
              delay={0.3}
            />
            
            {/* Flexibility & Mobility */}
            <ExerciseCard
              image={Library5}
              title="Flexibility & Mobility"
              subtitle="Recovery & Movement"
              description="Enhance range of motion and recovery"
              category="flexibility"
              delay={0.4}
            />
            
            {/* Olympic Lifting */}
            <ExerciseCard
              image={Library6}
              title="Heavy Lifting"
              subtitle="Elite Technique"
              description="Advanced lifting techniques and form"
              category="lifting"
              delay={0.5}
            />
            
            {/* Bodyweight Training */}
            <ExerciseCard
              image={Library7}
              title="Bodyweight Training"
              subtitle="No Equipment Needed"
              description="Master your bodyweight movements"
              category="bodyweight"
              delay={0.6}
            />
            
            {/* Sports Performance */}
            <ExerciseCard
              image={Library8}
              title="Sports Performance"
              subtitle="Athletic Excellence"
              description="Sport-specific training protocols"
              category="sports"
              delay={0.7}
            />
            
            {/* Power Training */}
            <ExerciseCard
              image={Library11}
              title="Power Training"
              subtitle="Explosive Movement"
              description="Develop explosive power and athletic performance"
              category="power"
              delay={0.8}
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="relative bg-slate-900 pt-12 pb-12">
        <div className="container mx-auto px-4 max-w-7xl space-y-6 sm:space-y-8">

      
      {/* Search and Filters */}
      <div id="search-filters" className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <input 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            className="w-full p-4 pl-14 pr-6 rounded-xl bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-lg" 
            placeholder="Search exercises by name, type, or muscle group..." 
          />
          <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">
            🔍
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-4xl mx-auto">
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

      {/* Real-Time Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card text-center py-4 relative">
          <div className="text-2xl font-bold text-blue-400">{allExercises.length}</div>
          <div className="text-sm text-slate-400">Total Exercises</div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="card text-center py-4 relative">
          <div className="text-2xl font-bold text-green-400">{categories.length}</div>
          <div className="text-sm text-slate-400">Muscle Groups</div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="card text-center py-4 relative">
          <div className="text-2xl font-bold text-purple-400">{filteredExercises.length}</div>
          <div className="text-sm text-slate-400">Filtered Results</div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div className="card text-center py-4 relative">
          <div className="text-2xl font-bold text-orange-400">{difficulties.length}</div>
          <div className="text-sm text-slate-400">Difficulty Levels</div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      {/* Results Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-slate-400 text-sm sm:text-base flex items-center gap-2">
          <span>Showing {filteredExercises.length} of {allExercises.length} exercises</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-400">LIVE</span>
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
            <div key={exercise.id} className="card hover:scale-[1.02] transition-transform duration-150 plan-card">
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
                <div className="flex gap-2">
                  <button
                    onClick={() => trackExerciseView(exercise)}
                    className="btn bg-purple-600 hover:bg-purple-700 text-white flex-1 text-sm"
                  >
                    🎯 Start Workout
                  </button>
                  <button
                    onClick={() => {
                      // Enhanced workout completion with real-time sync
                      const workout = {
                        id: Date.now(),
                        exercise: exercise.name,
                        name: exercise.name,
                        category: exercise.category,
                        difficulty: exercise.difficulty,
                        completedAt: new Date().toISOString(),
                        duration: Math.floor(Math.random() * 120) + 60, // 1-3 minutes
                        caloriesBurned: Math.floor(Math.random() * 100) + 50, // 50-150 calories
                        sets: exercise.sets ? parseInt(exercise.sets.split(' ')[0]) || 3 : 3,
                        reps: exercise.sets ? parseInt(exercise.sets.split('/')[1]) || 12 : 12,
                        userId: user?.id,
                        savedOffline: !isOnline,
                        notes: `Completed from Exercise Library`
                      };
                      
                      // Save to localStorage with proper structure
                      const existing = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
                      const updatedWorkouts = [workout, ...existing];
                      localStorage.setItem('completedWorkouts', JSON.stringify(updatedWorkouts));
                      
                      // Show success message
                      setShowSuccessNotification(`✅ ${exercise.name} completed! +${workout.caloriesBurned} calories`);
                      
                      // Trigger comprehensive real-time events
                      window.dispatchEvent(new CustomEvent('workoutCompleted', { detail: workout }));
                      
                      // Update real-time stats
                      const todayWorkouts = updatedWorkouts.filter(w => 
                        new Date(w.completedAt).toDateString() === new Date().toDateString()
                      ).length;
                      
                      const weeklyWorkouts = updatedWorkouts.filter(w => {
                        const workoutDate = new Date(w.completedAt);
                        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        return workoutDate >= weekAgo;
                      }).length;
                      
                      window.dispatchEvent(new CustomEvent('realTimeStatsUpdate', { 
                        detail: { 
                          todayWorkouts,
                          totalWorkouts: updatedWorkouts.length,
                          weeklyWorkouts,
                          totalCalories: updatedWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
                        }
                      }));
                      
                      // Trigger streak update if applicable
                      window.dispatchEvent(new CustomEvent('streakUpdated', { 
                        detail: { 
                          type: 'WORKOUT_COMPLETED',
                          currentStreak: todayWorkouts,
                          exercise: exercise.name
                        }
                      }));
                      
                      console.log('🎯 Workout completed from Library:', workout);
                    }}
                    className="btn bg-green-600 hover:bg-green-700 text-white flex-1 text-sm"
                  >
                    ✅ Complete
                  </button>
                </div>
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

// Optimized Exercise Card Component
const ExerciseCard = ({ image, title, subtitle, description, category, delay = 0 }) => {
  // Category color mapping
  const categoryColors = {
    strength: 'from-red-500 to-orange-500',
    muscle: 'from-blue-500 to-cyan-500',
    functional: 'from-green-500 to-emerald-500',
    flexibility: 'from-purple-500 to-pink-500',
    lifting: 'from-yellow-500 to-orange-500',
    bodyweight: 'from-indigo-500 to-blue-500',
    sports: 'from-teal-500 to-green-500',
    power: 'from-violet-500 to-purple-500'
  };
  
  const categoryIcons = {
    strength: '💪',
    muscle: '🔥',
    functional: '⚡',
    flexibility: '🧘',
    lifting: '🏋️',
    bodyweight: '🤸',
    sports: '🏆',
    power: '💥'
  };
  
  const gradientClass = categoryColors[category] || 'from-blue-500 to-cyan-500';
  const icon = categoryIcons[category] || '💪';
  
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
      {/* Premium Glow Effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradientClass} rounded-2xl blur-lg opacity-0 group-hover:opacity-25 transition-all duration-500`} />
      
      {/* Image Container */}
      <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
        {/* Main Image */}
        <img
          src={image}
          alt={`${title} - ${subtitle}`}
          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
          loading="lazy"
          decoding="async"
        />
        
        {/* Dark Mode Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent dark:from-black/90 dark:via-black/40" />
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${gradientClass} rounded-full text-white text-xs font-bold shadow-lg`}>
            <span>{icon}</span>
            <span className="uppercase tracking-wider">{category}</span>
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 leading-tight drop-shadow-lg">
              {title}
            </h3>
            <p className={`text-sm sm:text-base font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent mb-3 drop-shadow-sm`}>
              {subtitle}
            </p>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed opacity-95 drop-shadow-sm">
              {description}
            </p>
          </div>
        </div>
      </div>
      
      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};