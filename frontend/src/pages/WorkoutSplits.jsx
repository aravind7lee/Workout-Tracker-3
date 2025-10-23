import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Dumbbell,
  Calendar,
  Clock,
  Users,
  Star,
  ChevronRight,
  Filter,
  Search,
  Heart,
  Play,
  BookOpen,
  Award,
  Zap
} from 'lucide-react';
import workoutSplitsService from '../services/workoutSplitsService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import splitImg from '../assets/split.jpg';

const WorkoutSplits = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSplit, setSelectedSplit] = useState(null);
  const [splits, setSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [heroImageError, setHeroImageError] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Workout Split Categories
  const categories = [
    { id: 'all', name: 'All Splits', icon: Dumbbell, color: '#00d4ff' },
    { id: 'bulking', name: 'Bulking', icon: TrendingUp, color: '#00ff88' },
    { id: 'cutting', name: 'Cutting', icon: TrendingDown, color: '#ff6b6b' },
    { id: 'recomp', name: 'Body Recomp', icon: BarChart3, color: '#ffa502' },
    { id: 'beginner', name: 'Beginner', icon: Star, color: '#8b5cf6' },
    { id: 'advanced', name: 'Advanced', icon: Target, color: '#ffd700' }
  ];

  // Load splits data and preload hero image on component mount
  useEffect(() => {
    loadSplits();
    if (isAuthenticated()) {
      loadFavorites();
    }
    
    // Preload hero image
    const img = new Image();
    img.onload = () => setHeroImageLoaded(true);
    img.onerror = () => setHeroImageError(true);
    img.src = splitImg;
    img.loading = 'eager';
  }, []);

  const loadSplits = async () => {
    try {
      setLoading(true);
      // Try to load from API, but fallback to local data immediately if it fails
      const response = await workoutSplitsService.getSplitsWithCache();
      setSplits(response.data || fallbackSplits);
      setError(null);
    } catch (err) {
      // Use fallback data instead of showing error
      setSplits(fallbackSplits);
      setError(null);
      console.log('Using fallback workout splits data');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      // Use localStorage for favorites for now
      const savedFavorites = localStorage.getItem('workout_splits_favorites');
      setFavorites(savedFavorites ? JSON.parse(savedFavorites) : []);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setFavorites([]);
    }
  };

  const handleToggleFavorite = async (splitId) => {
    if (!isAuthenticated()) {
      alert('Please login to save favorites');
      return;
    }

    try {
      const isFavorite = favorites.includes(splitId);
      let newFavorites;
      
      if (isFavorite) {
        newFavorites = favorites.filter(id => id !== splitId);
      } else {
        newFavorites = [...favorites, splitId];
      }
      
      setFavorites(newFavorites);
      localStorage.setItem('workout_splits_favorites', JSON.stringify(newFavorites));
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  // Fallback workout splits data
  const fallbackSplits = [
    {
      id: 12,
      name: 'Custom Split A (6-Day)',
      category: ['bulking', 'recomp', 'advanced'],
      frequency: '6 days/week',
      difficulty: 'Intermediate-Advanced',
      duration: '60-75 min',
      description: 'Custom muscle pairing split with legs & biceps, shoulders & triceps, chest & back rotation',
      weeklySchedule: {
        'Monday': 'Legs & Biceps - Quadriceps, Hamstrings, Glutes, Calves, Biceps',
        'Tuesday': 'Shoulders & Triceps - All shoulder muscles, Triceps',
        'Wednesday': 'Chest & Back (Lats) - Chest, Lats, Mid-traps, Abs',
        'Thursday': 'Legs & Biceps - Quadriceps, Hamstrings, Glutes, Calves, Biceps',
        'Friday': 'Shoulders & Triceps - All shoulder muscles, Triceps',
        'Saturday': 'Chest & Back (Lats) - Chest, Lats, Mid-traps, Abs',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Legs & Biceps': 'Quadriceps, Hamstrings, Glutes, Calves, Biceps',
        'Shoulders & Triceps': 'All shoulder muscles, Triceps',
        'Chest & Back': 'Chest, Lats, Mid-traps, Abs'
      },
      benefits: ['Unique muscle pairing', 'High frequency training', 'Balanced upper/lower split'],
      bestFor: 'Intermediate to advanced lifters wanting a unique muscle pairing approach'
    },
    {
      id: 13,
      name: 'Custom Split B (5-Day)',
      category: ['bulking', 'cutting', 'recomp', 'beginner'],
      frequency: '5 days/week',
      difficulty: 'Intermediate',
      duration: '60-75 min',
      description: 'Modified custom split with mid-week rest and combined arm day',
      weeklySchedule: {
        'Monday': 'Legs & Biceps - Quadriceps, Hamstrings, Glutes, Calves, Biceps',
        'Tuesday': 'Shoulders & Triceps - All shoulder muscles, Triceps',
        'Wednesday': 'Chest & Back (Lats) - Chest, Lats, Mid-traps, Abs',
        'Thursday': 'Rest Day',
        'Friday': 'Shoulders & Arms - Shoulders, Biceps, Triceps, Abs',
        'Saturday': 'Chest & Back (Lats) - Chest, Lats, Mid-traps',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Legs & Biceps': 'Quadriceps, Hamstrings, Glutes, Calves, Biceps',
        'Shoulders & Triceps': 'All shoulder muscles, Triceps',
        'Chest & Back': 'Chest, Lats, Mid-traps, Abs',
        'Shoulders & Arms': 'Shoulders, Biceps, Triceps, Abs'
      },
      benefits: ['Mid-week recovery', 'Flexible scheduling', 'Combined arm focus'],
      bestFor: 'Intermediate lifters who prefer more rest days and combined arm training'
    },
    {
      id: 1,
      name: 'Push/Pull/Legs (PPL)',
      category: ['bulking', 'recomp', 'advanced'],
      frequency: '6 days/week',
      difficulty: 'Intermediate-Advanced',
      duration: '60-90 min',
      description: 'Classic 3-day split focusing on movement patterns',
      weeklySchedule: {
        'Monday': 'Push Day - Chest, Shoulders, Triceps, Abs',
        'Tuesday': 'Pull Day - Back, Biceps, Rear Delts',
        'Wednesday': 'Leg Day - Quadriceps, Hamstrings, Glutes, Calves',
        'Thursday': 'Push Day - Chest, Shoulders, Triceps, Abs',
        'Friday': 'Pull Day - Back, Biceps, Rear Delts',
        'Saturday': 'Leg Day - Quadriceps, Hamstrings, Glutes, Calves',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Push Day': 'Chest, Shoulders, Triceps, Abs',
        'Pull Day': 'Back, Biceps, Rear Delts',
        'Leg Day': 'Quadriceps, Hamstrings, Glutes, Calves'
      },
      benefits: ['High frequency training', 'Great for muscle growth', 'Balanced development'],
      bestFor: 'Intermediate to advanced lifters looking for muscle growth'
    },
    {
      id: 2,
      name: 'Upper/Lower Split',
      category: ['bulking', 'cutting', 'recomp'],
      frequency: '4 days/week',
      difficulty: 'Beginner-Intermediate',
      duration: '60-75 min',
      description: 'Simple 2-day split alternating upper and lower body',
      weeklySchedule: {
        'Monday': 'Upper Body - Chest, Back, Shoulders, Arms, Abs',
        'Tuesday': 'Lower Body - Legs, Glutes, Calves',
        'Wednesday': 'Rest Day',
        'Thursday': 'Upper Body - Chest, Back, Shoulders, Arms, Abs',
        'Friday': 'Lower Body - Legs, Glutes, Calves',
        'Saturday': 'Rest Day',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Upper Day': 'Chest, Back, Shoulders, Arms, Abs',
        'Lower Day': 'Legs, Glutes, Calves'
      },
      benefits: ['Good recovery time', 'Simple structure', 'Flexible scheduling'],
      bestFor: 'Beginners to intermediate lifters with limited time'
    },
    {
      id: 3,
      name: 'Body Part Split (Bro Split)',
      category: ['bulking', 'advanced'],
      frequency: '5 days/week',
      difficulty: 'Intermediate-Advanced',
      duration: '45-60 min',
      description: 'Traditional bodybuilding split focusing on one muscle group per day',
      weeklySchedule: {
        'Monday': 'Chest Day - All chest exercises',
        'Tuesday': 'Back Day - All back exercises',
        'Wednesday': 'Shoulder Day - All shoulder exercises',
        'Thursday': 'Arm Day - Biceps & Triceps, Abs',
        'Friday': 'Leg Day - All leg exercises',
        'Saturday': 'Rest Day',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Monday': 'Chest',
        'Tuesday': 'Back',
        'Wednesday': 'Shoulders',
        'Thursday': 'Arms (Biceps/Triceps), Abs',
        'Friday': 'Legs'
      },
      benefits: ['High volume per muscle', 'Great muscle isolation', 'Bodybuilding focused'],
      bestFor: 'Advanced lifters focused on bodybuilding and muscle specialization'
    },
    {
      id: 4,
      name: 'Full Body Split',
      category: ['beginner', 'cutting', 'recomp'],
      frequency: '3 days/week',
      difficulty: 'Beginner-Intermediate',
      duration: '60-90 min',
      description: 'Train all major muscle groups in each session',
      weeklySchedule: {
        'Monday': 'Full Body - All major muscle groups, Abs',
        'Tuesday': 'Rest Day',
        'Wednesday': 'Full Body - All major muscle groups, Abs',
        'Thursday': 'Rest Day',
        'Friday': 'Full Body - All major muscle groups, Abs',
        'Saturday': 'Rest Day',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Each Session': 'All major muscle groups - Chest, Back, Shoulders, Arms, Legs, Abs'
      },
      benefits: ['High frequency', 'Great for beginners', 'Time efficient'],
      bestFor: 'Beginners or those with limited training days'
    },
    {
      id: 5,
      name: 'Push/Pull Split (2-Day)',
      category: ['beginner', 'cutting'],
      frequency: '4 days/week',
      difficulty: 'Beginner-Intermediate',
      duration: '75-90 min',
      description: 'Simple push and pull movement pattern split',
      weeklySchedule: {
        'Monday': 'Push Day - Chest, Shoulders, Triceps, Quads, Abs',
        'Tuesday': 'Pull Day - Back, Biceps, Hamstrings, Glutes',
        'Wednesday': 'Rest Day',
        'Thursday': 'Push Day - Chest, Shoulders, Triceps, Quads, Abs',
        'Friday': 'Pull Day - Back, Biceps, Hamstrings, Glutes',
        'Saturday': 'Rest Day',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Push Day': 'Chest, Shoulders, Triceps, Quads, Abs',
        'Pull Day': 'Back, Biceps, Hamstrings, Glutes'
      },
      benefits: ['Simple to follow', 'Good for strength', 'Balanced approach'],
      bestFor: 'Beginners wanting structure or those cutting weight'
    },
    {
      id: 6,
      name: 'Antagonist Split',
      category: ['bulking', 'recomp'],
      frequency: '4 days/week',
      difficulty: 'Intermediate',
      duration: '60-75 min',
      description: 'Pair opposing muscle groups for efficient training',
      weeklySchedule: {
        'Monday': 'Chest & Back - Opposing muscle groups',
        'Tuesday': 'Biceps & Triceps - Opposing arm muscles',
        'Wednesday': 'Rest Day',
        'Thursday': 'Quads & Hamstrings - Opposing leg muscles',
        'Friday': 'Shoulders & Abs - Stabilizing muscles',
        'Saturday': 'Rest Day',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Day 1': 'Chest & Back',
        'Day 2': 'Biceps & Triceps',
        'Day 3': 'Quads & Hamstrings',
        'Day 4': 'Shoulders & Abs'
      },
      benefits: ['Efficient training', 'Good muscle balance', 'Active recovery'],
      bestFor: 'Intermediate lifters looking for efficient workouts'
    },
    {
      id: 7,
      name: 'Movement Pattern Split',
      category: ['bulking', 'recomp', 'advanced'],
      frequency: '4 days/week',
      difficulty: 'Intermediate-Advanced',
      duration: '60-75 min',
      description: 'Focus on fundamental movement patterns',
      weeklySchedule: {
        'Monday': 'Squat Day - Squats, Lunges, Leg Press',
        'Tuesday': 'Hinge Day - Deadlifts, RDLs, Hip Thrusts',
        'Wednesday': 'Rest Day',
        'Thursday': 'Push Day - Bench Press, Overhead Press, Dips',
        'Friday': 'Pull Day - Rows, Pull-ups, Face Pulls',
        'Saturday': 'Rest Day',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Squat Day': 'Squats, Lunges, Leg Press',
        'Hinge Day': 'Deadlifts, RDLs, Hip Thrusts',
        'Push Day': 'Bench Press, Overhead Press, Dips',
        'Pull Day': 'Rows, Pull-ups, Face Pulls'
      },
      benefits: ['Functional strength', 'Athletic performance', 'Movement quality'],
      bestFor: 'Athletes and advanced lifters focused on performance'
    },
    {
      id: 8,
      name: 'Strength/Hypertrophy Split',
      category: ['bulking', 'recomp', 'advanced'],
      frequency: '6 days/week',
      difficulty: 'Advanced',
      duration: '75-90 min',
      description: 'Combine strength and muscle building phases',
      weeklySchedule: {
        'Monday': 'Strength Upper - Heavy compound movements (3-5 reps)',
        'Tuesday': 'Hypertrophy Lower - Higher volume leg work (8-15 reps)',
        'Wednesday': 'Strength Lower - Heavy squats & deadlifts (3-5 reps)',
        'Thursday': 'Hypertrophy Upper - Higher volume upper work (8-15 reps)',
        'Friday': 'Strength Full Body - Heavy compounds (3-5 reps)',
        'Saturday': 'Hypertrophy Accessories - Isolation work (8-15 reps), Abs',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Strength Days': 'Heavy compound movements (3-5 reps)',
        'Hypertrophy Days': 'Higher volume isolation work (8-15 reps)'
      },
      benefits: ['Best of both worlds', 'Strength and size', 'Periodization'],
      bestFor: 'Advanced lifters wanting both strength and muscle growth'
    },
    {
      id: 9,
      name: 'Compound/Isolation Split',
      category: ['bulking', 'recomp'],
      frequency: '4 days/week',
      difficulty: 'Intermediate',
      duration: '60-75 min',
      description: 'Separate compound and isolation exercises',
      weeklySchedule: {
        'Monday': 'Compound Upper - Bench Press, Rows, Pull-ups',
        'Tuesday': 'Isolation Upper - Curls, Extensions, Flyes, Abs',
        'Wednesday': 'Rest Day',
        'Thursday': 'Compound Lower - Squats, Deadlifts, Hip Thrusts',
        'Friday': 'Isolation Lower - Leg Curls, Extensions, Calf Raises',
        'Saturday': 'Rest Day',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Compound Days': 'Multi-joint exercises (Squats, Deadlifts, Bench)',
        'Isolation Days': 'Single-joint exercises (Curls, Extensions, Flyes)'
      },
      benefits: ['Focus on basics', 'Progressive overload', 'Muscle refinement'],
      bestFor: 'Intermediate lifters building a strong foundation'
    },
    {
      id: 10,
      name: 'High Frequency Split',
      category: ['bulking', 'recomp'],
      frequency: '6 days/week',
      difficulty: 'Advanced',
      duration: '45-60 min',
      description: 'Train each muscle group 3-4 times per week',
      weeklySchedule: {
        'Monday': 'Full Body Light - All muscles, moderate intensity',
        'Tuesday': 'Full Body Medium - All muscles, higher intensity',
        'Wednesday': 'Full Body Light - All muscles, moderate intensity',
        'Thursday': 'Full Body Heavy - All muscles, maximum intensity',
        'Friday': 'Full Body Light - All muscles, moderate intensity',
        'Saturday': 'Full Body Medium - All muscles, higher intensity, Abs',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Daily Focus': 'Same muscles trained 3-4x per week with varying intensity'
      },
      benefits: ['Maximum growth stimulus', 'Skill practice', 'Fast adaptation'],
      bestFor: 'Advanced lifters with excellent recovery'
    },
    {
      id: 11,
      name: 'Specialty Splits',
      category: ['cutting', 'recomp'],
      frequency: '5 days/week',
      difficulty: 'Intermediate',
      duration: '45-60 min',
      description: 'Focus on specific muscle group combinations',
      weeklySchedule: {
        'Monday': 'Arms & Abs - Biceps, Triceps, Core',
        'Tuesday': 'Chest & Arms - Chest, Biceps, Triceps',
        'Wednesday': 'Back & Biceps - Back, Biceps, Rear Delts',
        'Thursday': 'Shoulders & Arms - Shoulders, Arms',
        'Friday': 'Glutes & Hamstrings - Glutes, Hamstrings, Calves',
        'Saturday': 'Rest Day',
        'Sunday': 'Rest Day'
      },
      muscles: {
        'Arms & Abs': 'Biceps, Triceps, Core',
        'Chest & Arms': 'Chest, Biceps, Triceps',
        'Back & Biceps': 'Back, Biceps, Rear Delts',
        'Shoulders & Arms': 'Shoulders, Arms',
        'Glutes & Hamstrings': 'Glutes, Hamstrings, Calves'
      },
      benefits: ['Target weak points', 'Aesthetic focus', 'Customizable'],
      bestFor: 'Those wanting to focus on specific body parts'
    }
  ];

  // Always use fallback data for now to ensure it works
  const workoutSplits = fallbackSplits;

  // Filter splits based on category and search
  const filteredSplits = workoutSplits.filter(split => {
    const matchesCategory = selectedCategory === 'all' || split.category.includes(selectedCategory);
    const matchesSearch = split.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         split.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-slate-700/50">
        {/* Hero Image Container */}
        <div className="relative w-full h-screen min-h-[100vh] max-h-screen">
          {/* Skeleton Loader */}
          {!heroImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
            </div>
          )}

          {/* Background Image */}
          <div className="absolute inset-0">
            {!heroImageError && (
              <motion.img
                src={splitImg}
                alt="Professional workout splits training - Choose your perfect fitness routine"
                className="w-full h-full object-cover object-center"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ 
                  opacity: heroImageLoaded ? 1 : 0,
                  scale: heroImageLoaded ? 1 : 1.05
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}

            {/* Fallback */}
            {heroImageError && (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900"></div>
            )}

            {/* Dark Overlay for Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 drop-shadow-2xl" style={{ color: 'rgb(245, 158, 11)' }}>
                  Workout Splits
                </h1>
                <motion.p
                  className="text-sm sm:text-base lg:text-lg text-slate-200 max-w-3xl mx-auto mb-6 drop-shadow-lg font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Choose the perfect workout split for your goals. Whether you're bulking, cutting, or maintaining, 
                  we have the ideal training program to maximize your results.
                </motion.p>
                <motion.div
                  className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-slate-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">13 Different Splits</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="font-medium">All Fitness Goals</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <span className="font-medium">Flexible Schedules</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
        
        {/* Additional spacing for mobile */}
        <div className="h-4 sm:h-8"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-blue-500/20 text-white border border-blue-500/30'
                        : 'bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon size={16} style={{ color: selectedCategory === category.id ? category.color : '#94a3b8' }} />
                    <span className="text-sm font-medium">{category.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="relative w-full lg:w-auto">
              <div className="relative flex items-center">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                <input
                  type="text"
                  placeholder="Search splits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 w-full lg:w-72 shadow-lg backdrop-blur-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
              <span className="text-slate-300">Loading workout splits...</span>
            </div>
          </div>
        )}

        {/* Splits Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
            {filteredSplits.map((split, index) => (
              <motion.div
                key={split.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedSplit(split)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">{split.name}</h3>
                  <div className="flex items-center space-x-2">
                    {isAuthenticated() && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(split.id);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          favorites.includes(split.id)
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-slate-400 hover:text-red-400'
                        }`}
                      >
                        <Heart size={16} fill={favorites.includes(split.id) ? 'currentColor' : 'none'} />
                      </button>
                    )}
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                
                <p className="text-slate-300 text-sm mb-4">{split.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Frequency:</span>
                    <span className="text-blue-400 font-medium">{split.frequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Difficulty:</span>
                    <span className="text-green-400 font-medium">{split.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Duration:</span>
                    <span className="text-purple-400 font-medium">{split.duration}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="flex flex-wrap gap-1">
                    {split.category.map((cat) => {
                      const categoryInfo = categories.find(c => c.id === cat);
                      return (
                        <span
                          key={cat}
                          className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md text-xs"
                          style={{ color: categoryInfo?.color }}
                        >
                          {categoryInfo?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        )}

        {/* No Results */}
        {!loading && filteredSplits.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-white mb-2">No splits found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Split Modal */}
      <AnimatePresence>
        {selectedSplit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSplit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedSplit.name}</h2>
                    <p className="text-slate-300">{selectedSplit.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSplit(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-400">Frequency</div>
                    <div className="text-white font-medium">{selectedSplit.frequency}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-400">Difficulty</div>
                    <div className="text-white font-medium">{selectedSplit.difficulty}</div>
                  </div>
                  <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                    <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-400">Duration</div>
                    <div className="text-white font-medium">{selectedSplit.duration}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📅 Weekly Schedule</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(selectedSplit.weeklySchedule).map(([day, workout]) => (
                        <div key={day} className={`rounded-lg p-3 border ${
                          workout.includes('Rest') 
                            ? 'bg-slate-700/20 border-slate-600/30' 
                            : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-blue-400">{day}</div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              workout.includes('Rest') 
                                ? 'bg-slate-600 text-slate-300' 
                                : 'bg-blue-500/20 text-blue-300'
                            }`}>
                              {workout.includes('Rest') ? '😴 Rest' : '💪 Workout'}
                            </div>
                          </div>
                          <div className="text-slate-300 text-sm mt-1">{workout}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">🎯 Muscle Group Focus</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedSplit.muscles).map(([day, muscles]) => (
                        <div key={day} className="bg-slate-700/30 rounded-lg p-3">
                          <div className="font-medium text-green-400 mb-1">{day}</div>
                          <div className="text-slate-300 text-sm">{muscles}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Benefits</h3>
                    <ul className="space-y-2">
                      {selectedSplit.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2 text-slate-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Best For</h3>
                    <p className="text-slate-300 bg-slate-700/30 rounded-lg p-3">{selectedSplit.bestFor}</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setSelectedSplit(null);
                        navigate('/library');
                      }}
                      className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors duration-200"
                    >
                      <Play size={16} />
                      <span>Start Split</span>
                    </button>
                    {isAuthenticated() && (
                      <button
                        onClick={() => handleToggleFavorite(selectedSplit.id)}
                        className={`flex items-center justify-center space-x-2 font-medium py-3 rounded-xl transition-colors duration-200 ${
                          favorites.includes(selectedSplit.id)
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                      >
                        <Heart size={16} fill={favorites.includes(selectedSplit.id) ? 'currentColor' : 'none'} />
                        <span>{favorites.includes(selectedSplit.id) ? 'Saved' : 'Save'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutSplits;