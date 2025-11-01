// Simple Exercise Library - Fallback Version
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { onlineService } from '../services/onlineService';
import { getFormTips } from '../data/exerciseFormTips';
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
import '../styles/library-header.css';
import '../styles/exercise-gallery.css';

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
  const [expandedFormTips, setExpandedFormTips] = useState({});
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent"></div>
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
              className="library-hero-image absolute inset-0"
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
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 hero-text-contrast leading-tight"
                  style={{ color: '#f59e0b' }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Exercise Library
                </motion.h1>
                
                <motion.p 
                  className="text-sm sm:text-base md:text-lg lg:text-xl hero-text-contrast max-w-2xl mx-auto font-medium leading-relaxed px-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Browse, track, and customize your exercises with ease.
                </motion.p>
                
                <motion.div 
                  className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={imageLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
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
                </motion.div>
              </motion.div>
            </div>
            

          </>
        )}
      </motion.div>

      {/* Exercise Categories Gallery Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Exercise Categories
            </motion.h2>
            
            <motion.p 
              className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover powerful features designed to transform your fitness journey with precision tracking, 
              smart insights, and personalized recommendations.
            </motion.p>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { image: Library1, title: "Strength Training", subtitle: "Build Raw Power", description: "Compound movements for maximum strength gains", category: "strength" },
              { image: Library2, title: "Muscle Building", subtitle: "Mass & Definition", description: "Hypertrophy training for maximum muscle growth", category: "muscle" },
              { image: Library4, title: "Functional Fitness", subtitle: "Real-World Movement", description: "Practical exercises for daily performance", category: "functional" },
              { image: Library5, title: "Flexibility & Mobility", subtitle: "Recovery & Movement", description: "Enhance range of motion and recovery", category: "flexibility" },
              { image: Library6, title: "Heavy Lifting", subtitle: "Elite Technique", description: "Advanced lifting techniques and form", category: "lifting" },
              { image: Library7, title: "Bodyweight Training", subtitle: "No Equipment Needed", description: "Master your bodyweight movements", category: "bodyweight" },
              { image: Library8, title: "Sports Performance", subtitle: "Athletic Excellence", description: "Sport-specific training protocols", category: "sports" },
              { image: Library11, title: "Power Training", subtitle: "Explosive Movement", description: "Develop explosive power and athletic performance", category: "power" }
            ].map((item, index) => (
              <ExerciseCard
                key={index}
                image={item.image}
                title={item.title}
                subtitle={item.subtitle}
                description={item.description}
                category={item.category}
                index={index}
              />
            ))}
          </div>

          {/* Call to Action */}
          <motion.div 
            className="text-center mt-12 sm:mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              onClick={() => {
                const exerciseGrid = document.getElementById('exercise-grid');
                if (exerciseGrid) {
                  exerciseGrid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  setTimeout(() => {
                    const searchInput = document.querySelector('input[placeholder*="Search exercises"]');
                    if (searchInput) searchInput.focus();
                  }, 500);
                }
              }}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Exercise Journey
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Premium Main Content Area */}
      <div className="relative z-10 pt-12 pb-12">
        <div className="container mx-auto px-4 max-w-7xl space-y-8 sm:space-y-12">
          {/* Floating Gym Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-orange-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>

      
      {/* Enhanced Search and Filters Section */}
      <motion.div 
        id="search-filters" 
        className="mb-8 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Search Bar with Premium Design */}
        <div className="relative max-w-3xl mx-auto">
          <div className="relative group">
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full p-5 pl-16 pr-12 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-2 border-slate-600/50 text-white placeholder-slate-300 text-lg font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300 shadow-2xl backdrop-blur-sm group-hover:shadow-orange-500/10" 
              placeholder="Search exercises by name, type, or muscle group..." 
            />
            <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-orange-400 text-xl">
              🔍
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">⚡</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Premium Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <div className="relative group">
            <select 
              value={filters.category} 
              onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full p-4 pl-12 rounded-xl bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-2 border-slate-600/50 text-white text-base font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 shadow-lg appearance-none cursor-pointer hover:shadow-blue-500/10"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 text-lg pointer-events-none">
              🏷️
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              ▼
            </div>
          </div>
          
          <div className="relative group">
            <select 
              value={filters.difficulty} 
              onChange={e => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full p-4 pl-12 rounded-xl bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-2 border-slate-600/50 text-white text-base font-medium focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 shadow-lg appearance-none cursor-pointer hover:shadow-purple-500/10"
            >
              <option value="">All Difficulties</option>
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 text-lg pointer-events-none">
              ⚡
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              ▼
            </div>
          </div>
          
          <div className="relative group sm:col-span-2 lg:col-span-1">
            <select 
              value={filters.muscle} 
              onChange={e => setFilters(prev => ({ ...prev, muscle: e.target.value }))}
              className="w-full p-4 pl-12 rounded-xl bg-gradient-to-r from-slate-800/90 to-slate-700/90 border-2 border-slate-600/50 text-white text-base font-medium focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 shadow-lg appearance-none cursor-pointer hover:shadow-green-500/10"
            >
              <option value="">All Muscles</option>
              {muscles.map(muscle => (
                <option key={muscle} value={muscle}>{muscle}</option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 text-lg pointer-events-none">
              💪
            </div>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              ▼
            </div>
          </div>
        </div>
      </motion.div>

      {/* Premium Real-Time Stats Dashboard */}
      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 backdrop-blur-sm p-6 text-center group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
          whileHover={{ y: -5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-blue-400 mb-1">{allExercises.length}</div>
            <div className="text-sm font-semibold text-slate-300">Total Exercises</div>
            <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <div className="mt-2 text-xs text-blue-300 font-medium">💪 READY TO TRAIN</div>
          </div>
        </motion.div>
        
        <motion.div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 backdrop-blur-sm p-6 text-center group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/20"
          whileHover={{ y: -5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-green-400 mb-1">{categories.length}</div>
            <div className="text-sm font-semibold text-slate-300">Muscle Groups</div>
            <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <div className="mt-2 text-xs text-green-300 font-medium">🎯 TARGET ZONES</div>
          </div>
        </motion.div>
        
        <motion.div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 backdrop-blur-sm p-6 text-center group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/20"
          whileHover={{ y: -5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-purple-400 mb-1">{filteredExercises.length}</div>
            <div className="text-sm font-semibold text-slate-300">Filtered Results</div>
            <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <div className="mt-2 text-xs text-purple-300 font-medium">🔥 ACTIVE FILTER</div>
          </div>
        </motion.div>
        
        <motion.div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 backdrop-blur-sm p-6 text-center group hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/20"
          whileHover={{ y: -5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <div className="text-3xl font-black text-orange-400 mb-1">{difficulties.length}</div>
            <div className="text-sm font-semibold text-slate-300">Difficulty Levels</div>
            <div className="absolute top-3 right-3 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <div className="mt-2 text-xs text-orange-300 font-medium">⚡ CHALLENGE MODES</div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Premium Results Header */}
      <motion.div 
        className="flex items-center justify-between mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-700/60 border border-slate-600/50 backdrop-blur-sm"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">📊</span>
          </div>
          <div>
            <div className="text-white font-semibold text-base sm:text-lg">
              Showing {filteredExercises.length} of {allExercises.length} exercises
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="text-green-400 font-medium">LIVE RESULTS</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">Real-time filtering</span>
            </div>
          </div>
        </div>
        
        <motion.button
          onClick={() => {
            setSearchQuery('');
            setFilters({ category: '', difficulty: '', muscle: '' });
          }}
          className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/20 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🗑️ Clear Filters
        </motion.button>
      </motion.div>

      {/* Exercise Grid */}
      <div id="exercise-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredExercises.length === 0 ? (
          <motion.div 
            className="col-span-full text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="max-w-md mx-auto">
              <motion.div 
                className="text-8xl mb-6"
                animate={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              >
                🔍
              </motion.div>
              
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/80 rounded-2xl p-8 border border-slate-600/50 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white mb-3">No exercises found</h3>
                <p className="text-slate-300 mb-6 leading-relaxed">
                  We couldn't find any exercises matching your criteria. 
                  Try adjusting your search terms or filters to discover more workouts.
                </p>
                
                <div className="space-y-3">
                  <motion.button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({ category: '', difficulty: '', muscle: '' });
                    }}
                    className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg hover:shadow-blue-500/20"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🗑️ Clear All Filters
                  </motion.button>
                  
                  <div className="text-sm text-slate-400">
                    Or try searching for: <span className="text-blue-300 font-medium">"push ups"</span>, <span className="text-green-300 font-medium">"chest"</span>, <span className="text-purple-300 font-medium">"beginner"</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          filteredExercises.map(exercise => (
            <motion.div 
              key={exercise.id} 
              className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-700/90 border-2 border-slate-600/50 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: Math.min(filteredExercises.indexOf(exercise) * 0.05, 1) }}
              whileHover={{ 
                y: -8, 
                scale: 1.02,
                transition: { duration: 0.3, ease: "easeOut" }
              }}
            >
              {/* Premium Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-14 h-14 ${exercise.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{exercise.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-lg mb-2 group-hover:text-orange-300 transition-colors duration-300">{exercise.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-300">{exercise.category}</span>
                      <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                      <span className="text-xs text-slate-400 uppercase tracking-wide">Exercise</span>
                    </div>
                  </div>
                </div>
              
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-400 text-sm">🎯</span>
                      <span className="text-sm font-medium text-slate-300">Sets/Reps:</span>
                    </div>
                    <span className="text-sm font-bold text-white bg-orange-500/20 px-3 py-1 rounded-lg">{exercise.sets}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 text-sm">⚡</span>
                      <span className="text-sm font-medium text-slate-300">Type:</span>
                    </div>
                    <span className={`text-xs px-3 py-2 rounded-lg font-semibold uppercase tracking-wide ${
                      exercise.type === 'compound' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/30' :
                      exercise.type === 'isolation' ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30' :
                      'bg-green-600/30 text-green-300 border border-green-500/30'
                    }`}>
                      {exercise.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 text-sm">🔥</span>
                      <span className="text-sm font-medium text-slate-300">Difficulty:</span>
                    </div>
                    <span className={`text-xs px-3 py-2 rounded-lg font-semibold uppercase tracking-wide ${
                      exercise.difficulty === 'beginner' ? 'bg-green-600/30 text-green-300 border border-green-500/30' :
                      exercise.difficulty === 'intermediate' ? 'bg-yellow-600/30 text-yellow-300 border border-yellow-500/30' :
                      'bg-red-600/30 text-red-300 border border-red-500/30'
                    }`}>
                      {exercise.difficulty}
                    </span>
                  </div>
                </div>
              
                {/* Premium Form Tips Section */}
                <div className="mb-6">
                  <motion.button
                    onClick={() => setExpandedFormTips(prev => ({
                      ...prev,
                      [exercise.id]: !prev[exercise.id]
                    }))}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 rounded-xl border border-blue-500/30 transition-all duration-300 group/tips"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm font-semibold text-blue-300 flex items-center gap-3">
                      <span className="text-lg">📋</span>
                      <span>Form Tips & Technique</span>
                    </span>
                    <motion.span 
                      className="text-blue-300 text-lg"
                      animate={{ rotate: expandedFormTips[exercise.id] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      ▼
                    </motion.span>
                  </motion.button>
                
                {expandedFormTips[exercise.id] && (
                  <div className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    {(() => {
                      const tips = getFormTips(exercise.name);
                      return (
                        <>
                          <div>
                            <h4 className="text-xs font-semibold text-green-300 mb-2 flex items-center gap-1">
                              ✅ Proper Form
                            </h4>
                            <ul className="space-y-1">
                              {tips.formTips.slice(0, 3).map((tip, index) => (
                                <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                                  <span className="text-green-400 mt-0.5">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-semibold text-red-300 mb-2 flex items-center gap-1">
                              ⚠️ Avoid These
                            </h4>
                            <ul className="space-y-1">
                              {tips.commonMistakes.slice(0, 2).map((mistake, index) => (
                                <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                                  <span className="text-red-400 mt-0.5">•</span>
                                  <span>{mistake}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="pt-2 border-t border-slate-600/50">
                            <p className="text-xs text-blue-300 font-medium flex items-center gap-1">
                              💨 {tips.breathingTip}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
              
                <div className="space-y-3">
                  <motion.button
                    onClick={() => setSelectedExercise(exercise)}
                    className="w-full p-3 bg-gradient-to-r from-slate-700/50 to-slate-600/50 hover:from-slate-600/60 hover:to-slate-500/60 text-white font-semibold rounded-xl border border-slate-500/30 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    👁️ View Details
                  </motion.button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      onClick={() => handleQuickPlan(exercise)}
                      className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg hover:shadow-blue-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ➕ New Plan
                    </motion.button>
                    <motion.button
                      onClick={() => handleAddToExisting(exercise)}
                      className="p-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-lg hover:shadow-green-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📝 Add to Plan
                    </motion.button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      onClick={() => trackExerciseView(exercise)}
                      className="p-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/30 shadow-lg hover:shadow-purple-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🎯 Start Workout
                    </motion.button>
                    <motion.button
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
                      className="p-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 shadow-lg hover:shadow-emerald-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ✅ Complete
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {/* Premium Exercise Detail Modal */}
      {selectedExercise && (
        <motion.div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50" 
          onClick={() => setSelectedExercise(null)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-gradient-to-br from-slate-800/95 to-slate-700/95 backdrop-blur-md rounded-3xl border-2 border-slate-600/50 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600/50">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${selectedExercise.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{selectedExercise.icon}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{selectedExercise.name}</h3>
                  <p className="text-slate-300 font-medium">{selectedExercise.category} Exercise</p>
                </div>
              </div>
              <motion.button
                onClick={() => setSelectedExercise(null)}
                className="w-10 h-10 bg-slate-700/50 hover:bg-red-600/50 text-slate-400 hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center text-xl font-bold"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
            
            <div className="p-6">
            
              <div className="space-y-6">
                {/* Exercise Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="text-orange-400 text-sm font-semibold mb-1 flex items-center gap-2">
                      <span>🎯</span> Sets/Reps
                    </div>
                    <div className="text-white font-bold text-lg">{selectedExercise.sets}</div>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="text-blue-400 text-sm font-semibold mb-1 flex items-center gap-2">
                      <span>⚡</span> Type
                    </div>
                    <div className={`text-sm font-bold uppercase tracking-wide ${
                      selectedExercise.type === 'compound' ? 'text-blue-300' :
                      selectedExercise.type === 'isolation' ? 'text-purple-300' :
                      'text-green-300'
                    }`}>
                      {selectedExercise.type}
                    </div>
                  </div>
                  
                  <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                    <div className="text-purple-400 text-sm font-semibold mb-1 flex items-center gap-2">
                      <span>🔥</span> Difficulty
                    </div>
                    <div className={`text-sm font-bold uppercase tracking-wide ${
                      selectedExercise.difficulty === 'beginner' ? 'text-green-300' :
                      selectedExercise.difficulty === 'intermediate' ? 'text-yellow-300' :
                      'text-red-300'
                    }`}>
                      {selectedExercise.difficulty}
                    </div>
                  </div>
                </div>
              
                {/* Premium Detailed Form Tips */}
                <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-2xl p-6 border border-slate-600/50">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <span>Complete Form Guide</span>
                  </h4>
                {(() => {
                  const tips = getFormTips(selectedExercise.name);
                  return (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-xs font-semibold text-green-300 mb-2 flex items-center gap-1">
                          ✅ Proper Form Checklist
                        </h5>
                        <ul className="space-y-1">
                          {tips.formTips.map((tip, index) => (
                            <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-green-400 mt-0.5">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-semibold text-red-300 mb-2 flex items-center gap-1">
                          ⚠️ Common Mistakes to Avoid
                        </h5>
                        <ul className="space-y-1">
                          {tips.commonMistakes.map((mistake, index) => (
                            <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                              <span className="text-red-400 mt-0.5">•</span>
                              <span>{mistake}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3 pt-3 border-t border-slate-600/50">
                        <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-xs text-blue-300 font-medium flex items-center gap-1">
                            💨 <span className="font-semibold">Breathing:</span> {tips.breathingTip}
                          </p>
                        </div>
                        <div className="bg-orange-600/10 border border-orange-500/20 rounded-lg p-3">
                          <p className="text-xs text-orange-300 font-medium flex items-center gap-1">
                            🧘 <span className="font-semibold">Rest Focus:</span> {tips.restPeriodTip}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              

              
                {/* Premium Action Buttons */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button
                      onClick={() => {
                        setSelectedExercise(null);
                        handleQuickPlan(selectedExercise);
                      }}
                      className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-lg hover:shadow-blue-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ➕ New Plan
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        const exerciseToAdd = selectedExercise;
                        setSelectedExercise(null);
                        handleAddToExisting(exerciseToAdd);
                      }}
                      className="p-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/30 shadow-lg hover:shadow-green-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      📝 Add to Plan
                    </motion.button>
                  </div>
                  
                  <motion.button
                    onClick={() => {
                      trackExerciseView(selectedExercise);
                      setSelectedExercise(null);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/30 shadow-lg hover:shadow-purple-500/20 text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    🎯 Start Workout Session
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setSelectedExercise(null)}
                    className="w-full p-3 bg-slate-700/50 hover:bg-slate-600/60 text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-500/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
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
      
      {/* Premium Footer Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-900/20 to-transparent pointer-events-none"></div>
    </div>
  );
}

// Exercise Card with Nutrition Gallery Performance
const ExerciseCard = ({ image, title, subtitle, description, category, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.onerror = () => setImageError(true);
    img.src = image;
  }, [image]);

  const categoryColors = {
    strength: 'from-red-500 to-orange-500', muscle: 'from-blue-500 to-cyan-500',
    functional: 'from-green-500 to-emerald-500', flexibility: 'from-purple-500 to-pink-500',
    lifting: 'from-yellow-500 to-orange-500', bodyweight: 'from-indigo-500 to-blue-500',
    sports: 'from-teal-500 to-green-500', power: 'from-violet-500 to-purple-500'
  };
  
  const categoryIcons = {
    strength: '💪', muscle: '🔥', functional: '⚡', flexibility: '🧘',
    lifting: '🏋️', bodyweight: '🤸', sports: '🏆', power: '💥'
  };
  
  const gradientClass = categoryColors[category] || 'from-blue-500 to-cyan-500';
  const icon = categoryIcons[category] || '💪';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className="exercise-card group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 backdrop-blur-sm"
    >
      <div className="relative h-64 sm:h-72 lg:h-80 overflow-hidden">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0">
            <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded-2xl" />
          </div>
        )}
        
        {!imageError && (
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            loading="lazy"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        
        {imageError && (
          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
            <div className="text-white text-6xl">{icon}</div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6">
          <motion.h3 
            className="text-xl sm:text-2xl font-bold mb-2 text-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.3 }}
          >
            {title}
          </motion.h3>
          
          <motion.p 
            className={`text-sm sm:text-base font-medium mb-3 bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.4 }}
          >
            {subtitle}
          </motion.p>
          
          <motion.p 
            className="text-xs sm:text-sm text-gray-300 opacity-90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 + 0.5 }}
          >
            {description}
          </motion.p>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </motion.div>
  );
};