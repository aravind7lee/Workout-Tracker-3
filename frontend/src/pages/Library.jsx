// Real-time Exercise Library with User Progress Tracking
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { onlineService } from '../services/onlineService';
import { realTimeSyncService } from '../services/realTimeSyncService';
import { offlineStorageService } from '../services/offlineStorageService';
import QuickPlanModal from '../components/QuickPlanModal';
import AddToExistingPlanModal from '../components/AddToExistingPlanModal';
import SuccessNotification from '../components/SuccessNotification';
import WorkoutSetupModal from '../components/WorkoutSetupModal';
import SkeletonLoader from '../components/SkeletonLoader';
import LibraryHeaderImg from '../assets/Libraryheader.jpg';

export default function Library() {
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
  
  // Real-time data states
  const [isOnline, setIsOnline] = useState(false);
  const [userProgress, setUserProgress] = useState(null);
  const [exerciseStats, setExerciseStats] = useState({});
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  
  // Update search when navbar search parameter changes
  useEffect(() => {
    if (navbarSearch && navbarSearch !== searchQuery) {
      setSearchQuery(navbarSearch);
    }
  }, [navbarSearch]);
  
  // Check for workout completion from navigation state
  useEffect(() => {
    const state = location.state;
    if (state?.workoutCompleted) {
      let message = `${state.exercise} completed in ${state.duration}`;
      
      if (state.savedOnline) {
        message += ' ✅ Saved online!';
      } else if (state.savedOffline) {
        message += ' 📱 Saved offline';
      }
      
      if (state.error) {
        message += ` (Error: ${state.error})`;
      }
      
      setShowSuccessNotification(message);
      
      // Clear the state to prevent showing notification on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  // Debug: Track modal state changes
  useEffect(() => {
    if (showWorkoutSetup) {
      console.log('🔍 WorkoutSetupModal opened for:', showWorkoutSetup.name);
    } else {
      console.log('🔍 WorkoutSetupModal closed');
    }
  }, [showWorkoutSetup]);
  
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showQuickPlan, setShowQuickPlan] = useState(null);
  const [showAddToExisting, setShowAddToExisting] = useState(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(null);
  const [showWorkoutSetup, setShowWorkoutSetup] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Load header image
  useEffect(() => {
    console.log('🖼️ Attempting to load image:', LibraryHeaderImg);
    const img = new Image();
    img.onload = () => {
      setImageLoaded(true);
      console.log('✅ Library header image loaded successfully');
    };
    img.onerror = (e) => {
      setImageError(true);
      console.error('❌ Failed to load library header image:', LibraryHeaderImg, e);
    };
    img.src = LibraryHeaderImg;
    
    // Fallback: set loaded to true after 2 seconds regardless
    const fallbackTimer = setTimeout(() => {
      if (!imageLoaded && !imageError) {
        console.log('⏰ Image loading timeout, showing anyway');
        setImageLoaded(true);
      }
    }, 2000);
    
    return () => clearTimeout(fallbackTimer);
  }, []);
  
  // Real-time data fetching with sync service
  useEffect(() => {
    const initializeRealTimeData = async () => {
      setLoading(true);
      try {
        // Check backend status
        const online = await onlineService.checkBackendStatus();
        setIsOnline(online);
        
        if (user) {
          try {
            // Get real-time data (online or cached)
            const data = await realTimeSyncService.getRealTimeData();
            
            if (data && data.userProgress) {
              setUserProgress(data.userProgress);
            }
            
            if (data && data.workoutHistory && Array.isArray(data.workoutHistory)) {
              setRecentWorkouts(data.workoutHistory.slice(0, 5));
              
              // Calculate exercise-specific stats
              const stats = calculateExerciseStats(data.workoutHistory);
              setExerciseStats(stats);
            }
            
            if (data && data.exerciseStats) {
              setExerciseStats(prev => ({ ...prev, ...data.exerciseStats }));
            }
            
            setLastSync(new Date());
            
            // Start real-time sync if online
            if (online) {
              realTimeSyncService.startRealTimeSync(1); // Sync every minute
            }
          } catch (syncError) {
            console.error('Real-time sync error:', syncError);
            // Continue with cached data
          }
        }
      } catch (error) {
        console.error('Failed to load real-time data:', error);
        // Load cached data as fallback
        try {
          const cachedProgress = offlineStorageService.getCachedUserProgress();
          const cachedStats = offlineStorageService.getCachedExerciseStats();
          const cachedHistory = offlineStorageService.getCachedWorkoutHistory();
          
          if (cachedProgress) setUserProgress(cachedProgress);
          if (cachedStats && typeof cachedStats === 'object') setExerciseStats(cachedStats);
          if (cachedHistory && cachedHistory.workouts && Array.isArray(cachedHistory.workouts)) {
            setRecentWorkouts(cachedHistory.workouts.slice(0, 5));
          }
        } catch (cacheError) {
          console.error('Failed to load cached data:', cacheError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    initializeRealTimeData();
    
    // Set up sync callbacks
    const handleSyncUpdate = (event, data) => {
      try {
        if (event === 'progress_updated' || event === 'incremental_sync_complete') {
          if (data && data.userProgress) {
            setUserProgress(data.userProgress);
          }
          setLastSync(new Date());
        } else if (event === 'full_sync_complete') {
          if (data && data.userProgress) setUserProgress(data.userProgress);
          if (data && data.workoutHistory && Array.isArray(data.workoutHistory)) {
            setRecentWorkouts(data.workoutHistory.slice(0, 5));
            const stats = calculateExerciseStats(data.workoutHistory);
            setExerciseStats(stats);
          }
          if (data && data.exerciseStats) {
            setExerciseStats(prev => ({ ...prev, ...data.exerciseStats }));
          }
          setLastSync(data.timestamp || new Date());
        }
      } catch (error) {
        console.error('Sync callback error:', error);
      }
    };
    
    realTimeSyncService.onSync(handleSyncUpdate);
    
    return () => {
      realTimeSyncService.offSync(handleSyncUpdate);
      realTimeSyncService.stopAutoSync();
    };
  }, [user]);
  
  // Calculate exercise-specific statistics
  const calculateExerciseStats = (workouts) => {
    if (!Array.isArray(workouts)) return {};
    
    const stats = {};
    try {
      workouts.forEach(workout => {
        if (!workout || !workout.exercises) return;
        
        workout.exercises.forEach(exercise => {
          const exerciseName = exercise.exercise?.name || exercise.name || 'Unknown Exercise';
          if (!stats[exerciseName]) {
            stats[exerciseName] = {
              totalSessions: 0,
              totalSets: 0,
              totalReps: 0,
              maxWeight: 0,
              lastPerformed: null,
              personalBest: 0
            };
          }
          
          stats[exerciseName].totalSessions++;
          stats[exerciseName].totalSets += exercise.sets?.length || 0;
          
          if (Array.isArray(exercise.sets)) {
            exercise.sets.forEach(set => {
              stats[exerciseName].totalReps += set.reps || 0;
              if (set.weight && set.weight > stats[exerciseName].maxWeight) {
                stats[exerciseName].maxWeight = set.weight;
                stats[exerciseName].personalBest = set.weight;
              }
            });
          }
          
          const workoutDate = new Date(workout.date || workout.createdAt);
          if (!stats[exerciseName].lastPerformed || workoutDate > stats[exerciseName].lastPerformed) {
            stats[exerciseName].lastPerformed = workoutDate;
          }
        });
      });
    } catch (error) {
      console.error('Error calculating exercise stats:', error);
    }
    return stats;
  };
  
  // Flatten all exercises from all muscle groups with real-time data
  const allExercises = useMemo(() => {
    const exercises = [];
    Object.entries(exerciseLibrary).forEach(([muscleKey, muscleGroup]) => {
      muscleGroup.exercises.forEach(exercise => {
        const exerciseStatsData = exerciseStats[exercise.name] || {};
        exercises.push({
          ...exercise,
          category: muscleGroup.name,
          muscle: muscleGroup.name,
          icon: muscleGroup.icon,
          color: muscleGroup.color,
          // Real-time progress data
          userStats: exerciseStatsData,
          hasProgress: Object.keys(exerciseStatsData).length > 0,
          lastPerformed: exerciseStatsData.lastPerformed,
          totalSessions: exerciseStatsData.totalSessions || 0,
          personalBest: exerciseStatsData.maxWeight || 0
        });
      });
    });
    return exercises;
  }, [exerciseStats]);

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
    // Show success message and navigate immediately for better UX
    setTimeout(() => {
      navigate('/my-plans?highlight=' + savedPlan.id);
    }, 500);
  };
  
  const handleAddToExisting = (exercise) => {
    setShowAddToExisting(exercise);
  };
  
  // Show workout setup modal - this opens the modal on the same page
  const handleStartWorkout = (exercise) => {
    console.log('🎯 Opening workout setup modal for:', exercise.name);
    console.log('👤 User type:', user ? (user.isDemo ? 'Demo User' : 'Real User') : 'Not logged in');
    setShowWorkoutSetup(exercise);
  };
  
  // Handle workout setup completion - this navigates to StartWorkout with config
  const handleWorkoutSetupComplete = async ({ exercise, config }) => {
    console.log('✅ Workout setup completed:', { exercise: exercise.name, config });
    console.log('👤 User info:', user ? { id: user.id, email: user.email, isDemo: user.isDemo } : 'Not logged in');
    
    try {
      // Track the interaction for all users (works online and offline)
      if (user) {
        await realTimeSyncService.trackExerciseInteraction(exercise.id, 'workout_start');
        
        // Update local stats immediately for better UX
        if (!isOnline) {
          const updatedStats = offlineStorageService.simulateRealTimeUpdate(exercise.name, 'workout_start');
          setExerciseStats(prev => ({
            ...prev,
            [exercise.name]: updatedStats
          }));
        }
      }
      
      // Close the setup modal
      setShowWorkoutSetup(null);
      
      // Navigate to workout session with exercise and configuration
      console.log('🚀 Navigating to StartWorkout with config:', config);
      navigate('/start-workout', { 
        state: { 
          selectedExercise: exercise,
          workoutConfig: config,
          fromLibrary: true,
          user: user // Pass user info to StartWorkout
        } 
      });
    } catch (error) {
      console.error('Failed to start workout session:', error);
      // Close modal and still navigate even if tracking fails
      setShowWorkoutSetup(null);
      navigate('/start-workout', { 
        state: { 
          selectedExercise: exercise,
          workoutConfig: config,
          fromLibrary: true,
          user: user
        } 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Premium Exercise Library Hero Section */}
      <motion.div 
        className="relative w-full h-56 md:h-96 lg:h-[480px] overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {!imageLoaded && !imageError ? (
          <SkeletonLoader className="w-full h-full bg-gradient-to-br from-slate-800/50 to-slate-700/50" />
        ) : imageError ? (
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
            <img
              src={LibraryHeaderImg}
              alt="Exercise Library header – gym workout background"
              className="w-full h-full object-cover object-center"
              loading="lazy"
              onLoad={() => {
                setImageLoaded(true);
                console.log('🖼️ Library header image loaded successfully');
              }}
              onError={() => {
                setImageError(true);
                console.error('🚫 Library header image failed to load');
              }}
            />
            {/* Premium gradient overlay for optimal text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
            
            {/* Hero content with animations */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white px-4 max-w-4xl mx-auto">
                <motion.h1 
                  className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl leading-tight"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  Exercise Library
                </motion.h1>
                <motion.p 
                  className="text-lg md:text-xl lg:text-2xl opacity-95 max-w-2xl mx-auto drop-shadow-lg font-medium leading-relaxed"
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                >
                  Browse, track, and customize your exercises with ease.
                </motion.p>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Main Content Area */}
      <div className="relative bg-slate-900 pt-8 pb-12">
        {/* Stats Panel - Now properly positioned below the header */}
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="card p-6 mb-8 relative z-10 transform -translate-y-8">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                <span className="text-white font-medium text-sm sm:text-base">
                  {isOnline ? '🟢 Online Mode - Real-time Progress Tracking' : '🟡 Offline Mode - Limited Features'}
                </span>
              </div>
              {lastSync && (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                  {(() => {
                    try {
                      const syncStatus = realTimeSyncService.getSyncStatus();
                      return syncStatus && syncStatus.pendingOfflineItems > 0 && (
                        <span className="bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded text-xs">
                          {syncStatus.pendingOfflineItems} pending
                        </span>
                      );
                    } catch (error) {
                      return null;
                    }
                  })()}
                </div>
              )}
            </div>
            
            {user && userProgress ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-blue-400">{userProgress.workouts || 0}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Total Workouts</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-green-400">{userProgress.streak || 0}</div>
                  <div className="text-xs sm:text-sm text-slate-400">Day Streak</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-purple-400">{userProgress.xpPoints || 0}</div>
                  <div className="text-xs sm:text-sm text-slate-400">XP Points</div>
                </div>
                <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                  <div className="text-xl sm:text-2xl font-bold text-orange-400">
                    {userProgress.weeklyGoal?.completed || 0}/{userProgress.weeklyGoal?.target || 4}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-400">Weekly Goal</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-slate-400 text-sm">
                  {user ? 'Loading your progress...' : 'Sign in to track your progress'}
                </div>
              </div>
            )}
          </div>

          {/* Search and Filters Section */}
          <div className="space-y-6 mb-8">
            {/* Search and Filters */}
            <div id="search-filters" className="space-y-4">
              <div className="relative">
                <input 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)} 
                  className="w-full p-4 pl-12 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                  placeholder="Search exercises by name, type, or muscle group..." 
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg">
                  🔍
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select 
                  value={filters.category} 
                  onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <select 
                  value={filters.difficulty} 
                  onChange={e => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Difficulties</option>
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                  ))}
                </select>
                
                <select 
                  value={filters.muscle} 
                  onChange={e => setFilters(prev => ({ ...prev, muscle: e.target.value }))}
                  className="p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Muscles</option>
                  {muscles.map(muscle => (
                    <option key={muscle} value={muscle}>{muscle}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="card text-center py-4 bg-blue-900/20 border border-blue-800/30">
                <div className="text-2xl font-bold text-blue-400">{allExercises.length}</div>
                <div className="text-sm text-slate-400">Total Exercises</div>
              </div>
              <div className="card text-center py-4 bg-green-900/20 border border-green-800/30">
                <div className="text-2xl font-bold text-green-400">{categories.length}</div>
                <div className="text-sm text-slate-400">Muscle Groups</div>
              </div>
              <div className="card text-center py-4 bg-purple-900/20 border border-purple-800/30">
                <div className="text-2xl font-bold text-purple-400">{filteredExercises.length}</div>
                <div className="text-sm text-slate-400">Filtered Results</div>
              </div>
              <div className="card text-center py-4 bg-orange-900/20 border border-orange-800/30">
                <div className="text-2xl font-bold text-orange-400">
                  {allExercises.filter(ex => ex.hasProgress).length}
                </div>
                <div className="text-sm text-slate-400">Exercises Done</div>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div className="text-slate-400 text-base">
              Showing {filteredExercises.length} of {allExercises.length} exercises
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ category: '', difficulty: '', muscle: '' });
              }}
              className="btn-secondary text-sm px-4 py-2"
            >
              Clear All Filters
            </button>
          </div>

          {/* Exercise Grid */}
          <div id="exercise-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredExercises.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <div className="text-xl font-semibold text-white mb-2">No exercises found</div>
                <div className="text-slate-400 mb-6">Try adjusting your search or filters</div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ category: '', difficulty: '', muscle: '' });
                  }}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              filteredExercises.map(exercise => (
                <div key={exercise.id} className={`card hover:scale-105 transition-all duration-300 plan-card ${
                  exercise.hasProgress ? 'ring-2 ring-green-500/30' : 'hover:ring-2 hover:ring-blue-500/30'
                }`}>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`w-12 h-12 ${exercise.color} rounded-lg flex items-center justify-center flex-shrink-0 relative`}>
                      <span className="text-2xl">{exercise.icon}</span>
                      {exercise.hasProgress && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-xs text-white">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-base mb-1 truncate">{exercise.name}</div>
                      <div className="text-sm text-slate-400">{exercise.category}</div>
                      {exercise.hasProgress && (
                        <div className="text-xs text-green-400 mt-1">
                          {exercise.totalSessions} sessions • Best: {exercise.personalBest}kg
                        </div>
                      )}
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
                    
                    {exercise.hasProgress && (
                      <div className="bg-slate-800/50 rounded p-2 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Last performed:</span>
                          <span className="text-green-400">
                            {exercise.lastPerformed ? 
                              new Date(exercise.lastPerformed).toLocaleDateString() : 'Never'
                            }
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Total sets:</span>
                          <span className="text-blue-400">{exercise.userStats.totalSets || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedExercise(exercise)}
                      className="btn-secondary w-full text-sm"
                    >
                      {exercise.hasProgress ? '📊 View Progress' : 'View Details'}
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
                      onClick={() => {
                        console.log('💆 Start Workout button clicked for:', exercise.name);
                        console.log('👤 User type:', user ? (user.isDemo ? 'Demo User' : 'Real User') : 'Not logged in');
                        handleStartWorkout(exercise);
                      }}
                      className={`btn ${isOnline ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-600 hover:bg-slate-700'} text-white w-full text-sm`}
                    >
                      🎯 {isOnline ? 'Start Workout' : 'Start Workout (Offline)'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedExercise(null)}>
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
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
                <div className={`w-12 h-12 ${selectedExercise.color} rounded-lg flex items-center justify-center relative`}>
                  <span className="text-2xl">{selectedExercise.icon}</span>
                  {selectedExercise.hasProgress && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-white">{selectedExercise.category}</div>
                  <div className="text-sm text-slate-400">{selectedExercise.sets}</div>
                  {selectedExercise.hasProgress && (
                    <div className="text-xs text-green-400 mt-1">
                      {selectedExercise.totalSessions} sessions completed
                    </div>
                  )}
                </div>
              </div>
              
              {selectedExercise.hasProgress && (
                <div className="bg-slate-800/50 rounded-lg p-3 space-y-2">
                  <div className="text-sm font-medium text-white mb-2">📊 Your Progress</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">Total Sessions</div>
                      <div className="text-blue-400 font-medium">{selectedExercise.userStats.totalSessions}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Total Sets</div>
                      <div className="text-green-400 font-medium">{selectedExercise.userStats.totalSets}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Total Reps</div>
                      <div className="text-purple-400 font-medium">{selectedExercise.userStats.totalReps}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Max Weight</div>
                      <div className="text-orange-400 font-medium">{selectedExercise.userStats.maxWeight}kg</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Last performed: {selectedExercise.lastPerformed ? 
                      new Date(selectedExercise.lastPerformed).toLocaleDateString() : 'Never'
                    }
                  </div>
                </div>
              )}
              
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
                    console.log('💆 Modal Start Workout button clicked for:', selectedExercise.name);
                    console.log('👤 User type:', user ? (user.isDemo ? 'Demo User' : 'Real User') : 'Not logged in');
                    const exerciseToStart = selectedExercise;
                    setSelectedExercise(null);
                    handleStartWorkout(exerciseToStart);
                  }}
                  className={`btn ${isOnline ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-600 hover:bg-slate-700'} text-white w-full`}
                >
                  🎯 {isOnline ? 'Start Workout Session' : 'Start Workout (Offline)'}
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
            <div className="text-white mb-2">Loading real-time data...</div>
            <div className="text-xs text-slate-400">
              {isOnline ? 'Syncing with server...' : 'Loading cached data...'}
            </div>
          </div>
        </div>
      )}
      
      {/* Sync Status Indicator */}
      {user && (() => {
        try {
          const syncStatus = realTimeSyncService.getSyncStatus();
          return syncStatus && syncStatus.syncInProgress && (
            <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-40">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span className="text-sm">Syncing...</span>
            </div>
          );
        } catch (error) {
          return null;
        }
      })()}
      
      {/* Success Notification */}
      {showSuccessNotification && (
        <SuccessNotification
          message={showSuccessNotification}
          onClose={() => setShowSuccessNotification(null)}
        />
      )}
      
      {/* Workout Setup Modal */}
      {showWorkoutSetup && (
        <WorkoutSetupModal
          exercise={showWorkoutSetup}
          onClose={() => {
            console.log('❌ Closing workout setup modal');
            setShowWorkoutSetup(null);
          }}
          onStartWorkout={handleWorkoutSetupComplete}
        />
      )}
    </div>
  );
}

// Add cleanup on component unmount
Library.displayName = 'Library';