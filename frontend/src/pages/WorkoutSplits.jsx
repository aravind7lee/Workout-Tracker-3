import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { getUserSplits } from '../utils/userSpecificSplits';
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
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();

  // Muscle group mapping and categorization functions
  const muscleGroupMapping = {
    'Chest': { icon: '💪', color: 'bg-red-600', key: 'chest' },
    'Shoulders': { icon: '🔥', color: 'bg-orange-600', key: 'shoulders' },
    'Back': { icon: '🎯', color: 'bg-blue-600', key: 'back' },
    'Arms': { icon: '💥', color: 'bg-purple-600', key: 'arms' },
    'Legs': { icon: '🦵', color: 'bg-green-600', key: 'legs' },
    'Core': { icon: '⚡', color: 'bg-yellow-600', key: 'abs' }
  };

  const getMuscleGroupFromCategory = (category) => {
    if (!category) return 'Core';
    const categoryLower = category.toLowerCase();
    if (categoryLower === 'abdominals' || categoryLower === 'abs') return 'Core';
    if (categoryLower.includes('chest')) return 'Chest';
    if (categoryLower.includes('shoulder')) return 'Shoulders';
    if (categoryLower.includes('back') || categoryLower.includes('lat')) return 'Back';
    if (categoryLower.includes('arm') || categoryLower.includes('bicep') || categoryLower.includes('tricep')) return 'Arms';
    if (categoryLower.includes('leg') || categoryLower.includes('quad') || categoryLower.includes('hamstring') || categoryLower.includes('glute') || categoryLower.includes('calf')) return 'Legs';
    return category;
  };

  const groupExercisesByMuscleGroup = (exerciseString) => {
    if (!exerciseString || exerciseString === 'Rest Day' || exerciseString === 'No exercises planned') {
      return {};
    }
    
    // Comprehensive exercise mapping based on exercise library
    const exerciseToMuscleGroup = {
      // Chest exercises
      'Barbell Bench Press': 'Chest',
      'Incline Dumbbell Press': 'Chest',
      'Decline Bench Press': 'Chest',
      'Cable Crossover': 'Chest',
      'Pec-Deck Machine': 'Chest',
      'Weighted Dips': 'Chest',
      'Push-ups': 'Chest',
      'Incline Cable Fly': 'Chest',
      'Dumbbell Bench Press': 'Chest',
      'Incline Barbell Press': 'Chest',
      'Decline Dumbbell Press': 'Chest',
      'Dumbbell Flyes': 'Chest',
      'Incline Dumbbell Flyes': 'Chest',
      'Decline Cable Fly': 'Chest',
      'Chest Press Machine': 'Chest',
      
      // Shoulders exercises
      'Overhead Press': 'Shoulders',
      'Lateral Raises': 'Shoulders',
      'Front Raises': 'Shoulders',
      'Rear Delt Fly': 'Shoulders',
      'Arnold Press': 'Shoulders',
      'Upright Rows': 'Shoulders',
      'Face Pulls': 'Shoulders',
      'Pike Push-ups': 'Shoulders',
      'Dumbbell Shoulder Press': 'Shoulders',
      'Cable Lateral Raises': 'Shoulders',
      'Reverse Pec Deck': 'Shoulders',
      'Seated Dumbbell Press': 'Shoulders',
      'Cable Front Raises': 'Shoulders',
      'Bent-Over Lateral Raises': 'Shoulders',
      'Machine Shoulder Press': 'Shoulders',
      'Handstand Push-ups': 'Shoulders',
      'Single-Arm Lateral Raise': 'Shoulders',
      'Y-Raises': 'Shoulders',
      'Shrugs': 'Shoulders',
      'Cuban Press': 'Shoulders',
      
      // Back exercises
      'Deadlift': 'Back',
      'Pull-ups': 'Back',
      'Barbell Rows': 'Back',
      'Lat Pulldowns': 'Back',
      'Cable Rows': 'Back',
      'T-Bar Rows': 'Back',
      'Single-Arm Dumbbell Row': 'Back',
      'Hyperextensions': 'Back',
      'Chin-ups': 'Back',
      'Wide-Grip Pulldowns': 'Back',
      'Chest-Supported Row': 'Back',
      'Inverted Rows': 'Back',
      'Sumo Deadlift': 'Back',
      'Romanian Deadlift': 'Back',
      'Good Mornings': 'Back',
      'Reverse Fly': 'Back',
      'Rack Pulls': 'Back',
      'Meadows Row': 'Back',
      'Cable Pullovers': 'Back',
      'Pendlay Rows': 'Back',
      
      // Arms exercises
      'Barbell Curls': 'Arms',
      'Close-Grip Bench Press': 'Arms',
      'Hammer Curls': 'Arms',
      'Tricep Dips': 'Arms',
      'Preacher Curls': 'Arms',
      'Overhead Tricep Extension': 'Arms',
      'Cable Curls': 'Arms',
      'Tricep Pushdowns': 'Arms',
      'Dumbbell Curls': 'Arms',
      'Skull Crushers': 'Arms',
      'Concentration Curls': 'Arms',
      'Diamond Push-ups': 'Arms',
      'Cable Hammer Curls': 'Arms',
      'Rope Tricep Extensions': 'Arms',
      '21s Bicep Curls': 'Arms',
      'Reverse Curls': 'Arms',
      'Tricep Kickbacks': 'Arms',
      'Zottman Curls': 'Arms',
      'Overhead Cable Extension': 'Arms',
      'Spider Curls': 'Arms',
      
      // Legs exercises
      'Squats': 'Legs',
      'Romanian Deadlifts': 'Legs',
      'Leg Press': 'Legs',
      'Leg Curls': 'Legs',
      'Leg Extensions': 'Legs',
      'Calf Raises': 'Legs',
      'Bulgarian Split Squats': 'Legs',
      'Walking Lunges': 'Legs',
      'Front Squats': 'Legs',
      'Goblet Squats': 'Legs',
      'Stiff Leg Deadlifts': 'Legs',
      'Hack Squats': 'Legs',
      'Step-ups': 'Legs',
      'Reverse Lunges': 'Legs',
      'Sumo Squats': 'Legs',
      'Single-Leg Deadlifts': 'Legs',
      'Wall Sits': 'Legs',
      'Jump Squats': 'Legs',
      'Seated Calf Raises': 'Legs',
      'Pistol Squats': 'Legs',
      
      // Core exercises
      'Plank': 'Core',
      'Crunches': 'Core',
      'Russian Twists': 'Core',
      'Leg Raises': 'Core',
      'Mountain Climbers': 'Core',
      'Dead Bug': 'Core',
      'Bicycle Crunches': 'Core',
      'Hanging Knee Raises': 'Core',
      'Side Plank': 'Core',
      'Reverse Crunches': 'Core',
      'V-Ups': 'Core',
      'Flutter Kicks': 'Core',
      'Hollow Body Hold': 'Core',
      'Cable Crunches': 'Core',
      'Woodchoppers': 'Core',
      'Ab Wheel Rollouts': 'Core',
      'Hanging Leg Raises': 'Core',
      'Dragon Flags': 'Core',
      'Sit-ups': 'Core',
      'Plank to Push-up': 'Core'
    };
    
    const exercises = exerciseString.split(', ');
    const grouped = {};
    
    exercises.forEach(exerciseName => {
      // Use exact mapping first, then fallback to pattern matching
      let muscleGroup = exerciseToMuscleGroup[exerciseName];
      
      if (!muscleGroup) {
        // Fallback pattern matching for custom exercises
        const nameLower = exerciseName.toLowerCase();
        if (nameLower.includes('tricep') || nameLower.includes('bicep') || nameLower.includes('curl') || nameLower.includes('dip')) {
          muscleGroup = 'Arms';
        } else if (nameLower.includes('lateral') || nameLower.includes('shoulder') || nameLower.includes('press') || nameLower.includes('raise')) {
          muscleGroup = 'Shoulders';
        } else if (nameLower.includes('bench') || nameLower.includes('chest') || nameLower.includes('pec')) {
          muscleGroup = 'Chest';
        } else if (nameLower.includes('pull') || nameLower.includes('row') || nameLower.includes('lat') || nameLower.includes('back')) {
          muscleGroup = 'Back';
        } else if (nameLower.includes('leg') || nameLower.includes('squat') || nameLower.includes('calf')) {
          muscleGroup = 'Legs';
        } else {
          muscleGroup = 'Core';
        }
      }
      
      if (!grouped[muscleGroup]) {
        grouped[muscleGroup] = [];
      }
      grouped[muscleGroup].push(exerciseName);
    });
    
    return grouped;
  };

  // Workout Split Categories
  const categories = [
    { id: 'all', name: 'All Splits', icon: Dumbbell, color: '#00d4ff' },
    { id: 'custom', name: 'Custom', icon: Zap, color: '#ff6b6b' },
    { id: 'bulking', name: 'Bulking', icon: TrendingUp, color: '#00ff88' },
    { id: 'cutting', name: 'Cutting', icon: TrendingDown, color: '#ff6b6b' },
    { id: 'recomp', name: 'Body Recomp', icon: BarChart3, color: '#ffa502' },
    { id: 'beginner', name: 'Beginner', icon: Star, color: '#8b5cf6' },
    { id: 'advanced', name: 'Advanced', icon: Target, color: '#ffd700' }
  ];

  // Load splits data and preload hero image on component mount
  useEffect(() => {
    loadSplits();
    loadFavorites(); // Always call loadFavorites, it handles auth check internally
    
    // Preload hero image
    const img = new Image();
    img.onload = () => setHeroImageLoaded(true);
    img.onerror = () => setHeroImageError(true);
    img.src = splitImg;
    img.loading = 'eager';
  }, []);

  // Reload favorites when authentication state changes
  useEffect(() => {
    loadFavorites();
  }, [isAuthenticated]);

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
      if (!isAuthenticated()) {
        setFavorites([]);
        return;
      }

      const userId = user?.id || user?._id;
      const authToken = token || localStorage.getItem('token');
      
      if (!userId || !authToken) {
        setFavorites([]);
        return;
      }

      // Try to load from backend first
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/favorites/splits`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFavorites(data.favorites || []);
          // Also save to localStorage as backup
          localStorage.setItem(`workout_splits_favorites_${userId}`, JSON.stringify(data.favorites || []));
          return;
        }
      } catch (fetchError) {
        console.log('Backend not available, using localStorage');
      }
      
      // Fallback to localStorage
      const savedFavorites = localStorage.getItem(`workout_splits_favorites_${userId}`);
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

    const userId = user?.id || user?._id;
    const authToken = token || localStorage.getItem('token');
    
    if (!userId || !authToken) {
      alert('Please login again');
      return;
    }

    try {
      const isFavorite = favorites.includes(splitId);
      const newFavorites = isFavorite 
        ? favorites.filter(id => id !== splitId)
        : [...favorites, splitId];
      
      // Update UI immediately
      setFavorites(newFavorites);
      
      // Save to localStorage immediately
      localStorage.setItem(`workout_splits_favorites_${userId}`, JSON.stringify(newFavorites));
      
      // Try to save to backend
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/favorites/splits`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            splitId, 
            action: isFavorite ? 'remove' : 'add' 
          })
        });

        if (!response.ok) {
          console.log('Backend save failed, using localStorage only');
        }
      } catch (fetchError) {
        console.log('Backend not available, saved to localStorage only');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert UI change on error
      setFavorites(favorites);
    }
  };

  // Fallback workout splits data
  const fallbackSplits = [
    {
      id: 12,
      name: '6-Day Split',
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
      name: '5-Day Split',
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

  // Load custom splits and combine with fallback data - USER SPECIFIC
  const loadCustomSplits = () => {
    try {
      if (!isAuthenticated()) {
        // If not authenticated, return empty array (no splits visible)
        console.log('🔒 User not authenticated - no custom splits visible');
        return [];
      }
      
      // Use utility function to get user-specific splits
      const userSplits = getUserSplits(user);
      console.log(`✅ Loaded ${userSplits.length} user-specific splits for user ${user?.id || user?._id}`);
      return userSplits;
    } catch (error) {
      console.error('Error loading custom splits:', error);
      return [];
    }
  };
  
  const customSplits = loadCustomSplits();
  // Show custom splits FIRST, then fallback splits
  const workoutSplits = [...customSplits, ...fallbackSplits];

  // Filter splits based on category and search
  const filteredSplits = workoutSplits.filter(split => {
    const matchesCategory = selectedCategory === 'all' || split.category.includes(selectedCategory);
    const matchesSearch = split.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         split.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Hero Image Container */}
        <div className="relative w-full h-screen min-h-[100vh] max-h-screen">
          {/* Skeleton Loader */}
          {!heroImageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 animate-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent animate-shimmer"></div>
            </div>
          )}

          {/* Background Image */}
          <div className="absolute inset-0">
            {!heroImageError && (
              <motion.img
                src={splitImg}
                alt="Professional workout splits training"
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
              <div className="w-full h-full bg-gradient-to-br from-orange-900 via-red-900 to-black"></div>
            )}

            {/* Modern Gym Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-transparent to-red-500/20"></div>
          </div>

          {/* Enhanced Title Overlay */}
          <div className="relative z-10 h-full flex items-center justify-center" style={{ paddingTop: '8vh' }}>
            <div className="text-center px-3 sm:px-6 lg:px-8 max-w-6xl">
              <motion.div
                className="mb-3 sm:mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md rounded-full border border-orange-500/30 mb-4 sm:mb-6">
                  <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 mr-2" />
                  <span className="text-orange-300 font-semibold text-xs sm:text-sm tracking-wide">PROFESSIONAL GYM TRACKER</span>
                </div>
              </motion.div>
              
              <motion.h1
                className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6"
                style={{ 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(245, 158, 11, 0.5), 0 0 60px rgba(239, 68, 68, 0.3)'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                WORKOUT SPLITS
              </motion.h1>
              
              <motion.p
                className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-200 font-medium mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2"
                style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Choose the perfect workout split for your goals. Whether you're bulking, cutting, or maintaining, 
                we have the ideal training program to maximize your results.
              </motion.p>
              

              
              {/* Action Buttons - Mobile Optimized */}
              <motion.div
                className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-6 sm:mt-8 px-4 sm:px-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/custom-split-builder')}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 text-white font-semibold px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto max-w-xs sm:max-w-none"
                >
                  <div className="relative flex items-center justify-center space-x-2">
                    <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium tracking-wide">CREATE YOUR OWN SPLIT</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/your-workout-splits')}
                  className="group relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-500 hover:from-orange-700 hover:via-red-700 hover:to-pink-600 text-white font-semibold px-3 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg w-full sm:w-auto max-w-xs sm:max-w-none"
                >
                  <div className="relative flex items-center justify-center space-x-2">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium tracking-wide">YOUR WORKOUT SPLITS</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section - Moved Below Header */}
      <div className="bg-gradient-to-r from-gray-950 via-black to-gray-950 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <motion.div
            className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 md:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="group flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-md px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-full border border-orange-500/40 hover:border-orange-400/60 transition-all duration-300">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
              <span className="font-semibold text-white text-xs sm:text-sm md:text-base tracking-wide">13 DIFFERENT SPLITS</span>
            </div>
            <div className="group flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-md px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-full border border-green-500/40 hover:border-green-400/60 transition-all duration-300">
              <Target className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400 group-hover:text-green-300 transition-colors" />
              <span className="font-semibold text-white text-xs sm:text-sm md:text-base tracking-wide">ALL FITNESS GOALS</span>
            </div>
            <div className="group flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-md px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 rounded-full border border-purple-500/40 hover:border-purple-400/60 transition-all duration-300">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
              <span className="font-semibold text-white text-xs sm:text-sm md:text-base tracking-wide">FLEXIBLE SCHEDULES</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modern Control Panel */}
      <div className="bg-gradient-to-r from-gray-950 via-black to-gray-950 border-y border-orange-500/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
            {/* Enhanced Category Filter */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group relative flex items-center space-x-2 sm:space-x-3 px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all duration-200 overflow-hidden hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.95] ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-orange-500/30 to-red-500/30 text-white border border-orange-500/50 shadow-lg shadow-orange-500/25'
                        : 'bg-gray-900/80 text-gray-300 hover:text-white hover:bg-gray-800/90 border border-gray-700/50 hover:border-gray-600/50'
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      selectedCategory === category.id ? 'from-orange-500/20 to-red-500/20' : 'from-gray-700/20 to-gray-600/20'
                    }`}></div>
                    <Icon size={16} className={`relative z-10 transition-colors duration-300 sm:w-[18px] sm:h-[18px] ${
                      selectedCategory === category.id ? 'text-orange-400' : 'text-gray-400 group-hover:text-white'
                    }`} />
                    <span className="relative z-10 text-xs sm:text-sm font-semibold tracking-wide">
                      <span className="hidden sm:inline">{category.name.toUpperCase()}</span>
                      <span className="sm:hidden">{category.name.split(' ')[0].toUpperCase()}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative w-full lg:w-auto">
              <div className="relative flex items-center group">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-orange-400 w-4 h-4 sm:w-5 sm:h-5 z-10 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search workout splits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 bg-gray-900/80 border border-gray-700/50 rounded-xl sm:rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 w-full lg:w-80 shadow-lg backdrop-blur-sm hover:bg-gray-800/90 text-sm sm:text-base"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300 bg-gray-700/50 hover:bg-gray-600/50 rounded-full p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-8 sm:py-12">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8 sm:py-12">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-400"></div>
              <span className="text-gray-300 text-sm sm:text-base">Loading workout splits...</span>
            </div>
          </div>
        )}

        {/* Enhanced Splits Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredSplits.map((split, index) => (
              <div
                key={split.id}
                className="group relative bg-gradient-to-br from-gray-900/90 to-black/90 backdrop-blur-md border border-gray-700/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 hover:border-orange-500/50 transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-2 hover:scale-[1.02]" style={{ contain: 'layout style paint' }}
                onClick={() => setSelectedSplit(split)}
              >
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                        <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                        <span className="text-xs font-semibold text-orange-400 tracking-wider">
                          <span className="hidden sm:inline">{split.isCustom ? 'CUSTOM SPLIT' : 'WORKOUT SPLIT'}</span>
                          <span className="sm:hidden">{split.isCustom ? 'CUSTOM' : 'SPLIT'}</span>
                        </span>
                        {split.isCustom && (
                          <span className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 px-1 sm:px-2 py-1 rounded-full border border-purple-500/30">
                            <span className="hidden sm:inline">⚡ YOUR CREATION</span>
                            <span className="sm:hidden">⚡</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-black text-white mb-1 sm:mb-2 group-hover:text-orange-100 transition-colors duration-300 leading-tight">{split.name}</h3>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      {isAuthenticated() && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(split.id);
                          }}
                          className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-90 ${
                            favorites.includes(split.id)
                              ? 'text-red-400 hover:text-red-300 bg-red-500/20'
                              : 'text-gray-400 hover:text-red-400 hover:bg-red-500/20'
                          }`}
                        >
                          <Heart size={16} className="sm:w-[18px] sm:h-[18px]" fill={favorites.includes(split.id) ? 'currentColor' : 'none'} />
                        </button>
                      )}
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-orange-400 transition-colors duration-300" />
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">{split.description}</p>
                  
                  <div className="grid grid-cols-1 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700/30">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        <span className="text-gray-400 text-xs sm:text-sm font-medium">Frequency</span>
                      </div>
                      <span className="text-blue-400 font-semibold text-xs sm:text-sm">{split.frequency}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700/30">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        <span className="text-gray-400 text-xs sm:text-sm font-medium">Difficulty</span>
                      </div>
                      <span className="text-green-400 font-semibold text-xs sm:text-sm">{split.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-gray-800/50 rounded-lg sm:rounded-xl border border-gray-700/30">
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                        <span className="text-gray-400 text-xs sm:text-sm font-medium">Duration</span>
                      </div>
                      <span className="text-purple-400 font-semibold text-xs sm:text-sm">{split.duration}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {split.category.map((cat) => {
                      const categoryInfo = categories.find(c => c.id === cat);
                      return (
                        <span
                          key={cat}
                          className="px-2 sm:px-3 py-1 bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-gray-300 rounded-full text-xs font-medium border border-gray-600/30 group-hover:border-orange-500/30 transition-all duration-300"
                        >
                          {categoryInfo?.name}
                        </span>
                      );
                    })}
                  </div>
                  
                  {/* Action Button */}
                  <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700/30">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2 text-orange-400 group-hover:text-orange-300 transition-colors duration-300">
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-semibold tracking-wide">VIEW DETAILS</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        )}

        {/* Enhanced No Results */}
        {!loading && filteredSplits.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-md border border-gray-700/50 rounded-3xl p-12 max-w-md mx-auto">
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Filter className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No Workout Splits Found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or search terms to find the perfect split for your goals.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Split Modal */}
        {selectedSplit && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
            onClick={() => setSelectedSplit(null)}
          >
            <div
              className="bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-700/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">{selectedSplit.name}</h2>
                    <p className="text-gray-300 text-sm sm:text-base">{selectedSplit.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedSplit(null)}
                    className="text-gray-400 hover:text-white transition-colors text-lg sm:text-xl p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-400">Frequency</div>
                    <div className="text-white font-medium text-sm sm:text-base">{selectedSplit.frequency}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-400">Difficulty</div>
                    <div className="text-white font-medium text-sm sm:text-base">{selectedSplit.difficulty}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4 text-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mx-auto mb-1 sm:mb-2" />
                    <div className="text-xs sm:text-sm text-gray-400">Duration</div>
                    <div className="text-white font-medium text-sm sm:text-base">{selectedSplit.duration}</div>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">📅 Weekly Schedule</h3>
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {Object.entries(selectedSplit.weeklySchedule).map(([day, workout]) => {
                        const isRestDay = workout.includes('Rest') || workout === 'Rest Day';
                        const groupedExercises = isRestDay ? {} : groupExercisesByMuscleGroup(workout);
                        
                        return (
                          <div key={day} className={`rounded-lg border overflow-hidden ${
                            isRestDay 
                              ? 'bg-gray-700/20 border-gray-600/30' 
                              : 'bg-blue-500/10 border-blue-500/20'
                          }`}>
                            <div className="flex items-center justify-between p-3 border-b border-gray-600/30">
                              <div className="font-medium text-blue-400 text-lg">{day}</div>
                              <div className={`text-xs px-2 py-1 rounded-full ${
                                isRestDay 
                                  ? 'bg-gray-600 text-gray-300' 
                                  : 'bg-blue-500/20 text-blue-300'
                              }`}>
                                {isRestDay ? '😴 Rest' : '💪 Workout'}
                              </div>
                            </div>
                            
                            {isRestDay ? (
                              <div className="p-3">
                                <div className="text-gray-400 text-sm flex items-center gap-2">
                                  <span className="text-lg">😴</span>
                                  <span>Rest Day</span>
                                </div>
                              </div>
                            ) : Object.keys(groupedExercises).length > 0 ? (
                              <div className="p-3 space-y-3">
                                {Object.entries(groupedExercises).map(([muscleGroup, exercises]) => {
                                  const config = muscleGroupMapping[muscleGroup];
                                  if (!config || exercises.length === 0) return null;
                                  
                                  return (
                                    <div key={muscleGroup} className="bg-slate-800/40 rounded-lg border border-slate-700/50 overflow-hidden">
                                      <div className={`${config.color} bg-opacity-20 border-b border-slate-700/50 px-3 py-2`}>
                                        <div className="flex items-center gap-2">
                                          <span className="text-lg">{config.icon}</span>
                                          <div>
                                            <h4 className="text-white font-semibold text-sm">{muscleGroup}</h4>
                                            <p className="text-slate-400 text-xs">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="p-3">
                                        <div className="space-y-1">
                                          {exercises.map((exercise, idx) => (
                                            <div key={idx} className="text-white text-sm flex items-center gap-2">
                                              <span className={`text-white font-bold text-xs ${config.color} bg-opacity-80 w-5 h-5 rounded-full flex items-center justify-center`}>
                                                {idx + 1}
                                              </span>
                                              <span>{exercise}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }).filter(Boolean)}
                              </div>
                            ) : (
                              <div className="p-3">
                                <div className="text-gray-300 text-sm">{workout}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">🎯 Muscle Group Focus</h3>
                    <div className="space-y-3">
                      {Object.entries(selectedSplit.muscles).map(([day, muscles]) => {
                        const groupedMuscles = groupExercisesByMuscleGroup(muscles);
                        
                        return (
                          <div key={day} className="bg-gray-700/30 rounded-lg border border-gray-600/30 overflow-hidden">
                            <div className="bg-gray-800/50 px-3 py-2 border-b border-gray-600/30">
                              <div className="font-medium text-green-400">{day}</div>
                            </div>
                            
                            {Object.keys(groupedMuscles).length > 0 ? (
                              <div className="p-3 space-y-2">
                                {Object.entries(groupedMuscles).map(([muscleGroup, exercises]) => {
                                  const config = muscleGroupMapping[muscleGroup];
                                  if (!config) return null;
                                  
                                  return (
                                    <div key={muscleGroup} className="flex items-center gap-2">
                                      <span className={`${config.color} bg-opacity-80 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center`}>
                                        {config.icon}
                                      </span>
                                      <span className="text-gray-300 text-sm font-medium">{muscleGroup}</span>
                                      <span className="text-gray-400 text-xs">({exercises.length})</span>
                                    </div>
                                  );
                                }).filter(Boolean)}
                              </div>
                            ) : (
                              <div className="p-3">
                                <div className="text-gray-300 text-sm">{muscles}</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Benefits</h3>
                    <ul className="space-y-2">
                      {selectedSplit.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-300">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Best For</h3>
                    <p className="text-gray-300 bg-gray-700/30 rounded-lg p-3">{selectedSplit.bestFor}</p>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700/50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => {
                        setSelectedSplit(null);
                        navigate('/library');
                      }}
                      className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base"
                    >
                      <Play size={14} className="sm:w-4 sm:h-4" />
                      <span>Start Split</span>
                    </button>
                    {isAuthenticated() && (
                      <button
                        onClick={() => handleToggleFavorite(selectedSplit.id)}
                        className={`flex items-center justify-center space-x-2 font-medium py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-colors duration-200 text-sm sm:text-base ${
                          favorites.includes(selectedSplit.id)
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                      >
                        <Heart size={14} className="sm:w-4 sm:h-4" fill={favorites.includes(selectedSplit.id) ? 'currentColor' : 'none'} />
                        <span>{favorites.includes(selectedSplit.id) ? 'Saved' : 'Save'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default WorkoutSplits;