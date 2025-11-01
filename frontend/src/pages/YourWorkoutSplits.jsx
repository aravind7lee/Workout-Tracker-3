import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getUserSplits, deleteUserSplit, saveUserSplit } from '../utils/userSpecificSplits';
import { 
  Dumbbell, 
  Plus, 
  Search, 
  Trash2, 
  Play, 
  Edit,
  Copy,
  Target,
  Calendar,
  Clock,
  Users
} from 'lucide-react';

const YourWorkoutSplits = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const navbarSearch = searchParams.get('search') || '';

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
  const [customSplits, setCustomSplits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(navbarSearch);
  const [syncStatus, setSyncStatus] = useState('live');
  const [lastSync, setLastSync] = useState(null);
  const [realTimeStats, setRealTimeStats] = useState({ totalSplits: 0 });
  const [selectedSplit, setSelectedSplit] = useState(null);

  // Filter splits based on search
  const filteredSplits = useMemo(() => {
    if (!searchQuery) return customSplits;
    return customSplits.filter(split => 
      split.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      split.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (split.exercises && split.exercises.some(exercise => 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
  }, [customSplits, searchQuery]);

  // Update search when navbar search parameter changes
  useEffect(() => {
    if (navbarSearch && navbarSearch !== searchQuery) {
      setSearchQuery(navbarSearch);
    }
  }, [navbarSearch]);

  // Load custom splits on mount and when user changes
  useEffect(() => {
    loadCustomSplits();
    
    // Listen for real-time split creation events
    const handleSplitCreated = () => {
      console.log('🚀 Your WorkoutSplits - Split Created, reloading...');
      loadCustomSplits();
    };

    window.addEventListener('customSplitCreated', handleSplitCreated);
    
    return () => {
      window.removeEventListener('customSplitCreated', handleSplitCreated);
    };
  }, [user]);

  const loadCustomSplits = async () => {
    setLoading(true);
    setSyncStatus('syncing');
    
    try {
      if (!isAuthenticated()) {
        // If not authenticated, show empty splits
        setCustomSplits([]);
        setRealTimeStats({ totalSplits: 0 });
        setLastSync(new Date());
        setSyncStatus('synced');
        console.log('🔒 User not authenticated - showing empty splits list');
        setTimeout(() => setSyncStatus('live'), 2000);
        return;
      }
      
      // Use utility function to get user-specific splits
      const userSplits = getUserSplits(user);
      
      setCustomSplits(userSplits);
      setRealTimeStats({ totalSplits: userSplits.length });
      setLastSync(new Date());
      setSyncStatus('synced');
      
      console.log(`✅ Loaded ${userSplits.length} user-specific custom splits for user ${currentUserId}`);
      
      // Auto-hide sync status
      setTimeout(() => setSyncStatus('live'), 2000);
    } catch (error) {
      console.error('❌ Failed to load custom splits:', error);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('live'), 3000);
    } finally {
      setLoading(false);
    }
  };

  const deleteSplit = async (splitId) => {
    if (window.confirm('Are you sure you want to delete this custom split?')) {
      try {
        console.log('🗑️ Deleting custom split:', splitId);
        
        if (!isAuthenticated()) {
          alert('Please login to delete splits.');
          return;
        }
        
        // Use utility function to delete split
        deleteUserSplit(user, splitId);
        
        // Update state
        setCustomSplits(prev => prev.filter(split => split.id !== splitId));
        setRealTimeStats(prev => ({ ...prev, totalSplits: prev.totalSplits - 1 }));
        
        console.log('✅ Custom split deleted successfully from user-specific storage');
      } catch (error) {
        console.error('❌ Error deleting custom split:', error);
        alert('Failed to delete split. Please try again.');
      }
    }
  };

  const duplicateSplit = async (split) => {
    try {
      console.log('📋 Duplicating custom split:', split.name);
      
      if (!isAuthenticated()) {
        alert('Please login to duplicate splits.');
        return;
      }
      
      const duplicatedSplit = {
        ...split,
        id: Date.now(),
        name: `${split.name} (Copy)`,
        createdAt: new Date().toISOString()
      };
      
      // Use utility function to save split
      saveUserSplit(user, duplicatedSplit);
      
      // Update state
      setCustomSplits(prev => [duplicatedSplit, ...prev]);
      setRealTimeStats(prev => ({ ...prev, totalSplits: prev.totalSplits + 1 }));
      
      console.log('✅ Custom split duplicated successfully in user-specific storage');
    } catch (error) {
      console.error('❌ Error duplicating custom split:', error);
      alert('Failed to duplicate split. Please try again.');
    }
  };

  const editSplit = (split) => {
    // Navigate to edit split page with split ID
    navigate(`/edit-split/${split.id}`);
  };

  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'synced': return { icon: '✅', text: 'Synced', color: 'text-green-400' };
      case 'syncing': return { icon: '🔄', text: 'Loading...', color: 'text-blue-400' };
      case 'error': return { icon: '❌', text: 'Error', color: 'text-red-500' };
      default: return { icon: '🌐', text: 'Live', color: 'text-blue-400' };
    }
  };

  const statusDisplay = getSyncStatusDisplay();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div>Loading Your WorkoutSplits...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-950 via-black to-gray-950 border-b border-purple-500/20 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Title and Status Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Your WorkoutSplits
                </h1>
                
                {/* Real-time Status Indicator */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400 font-medium">REAL-TIME</span>
                  
                  {/* Sync Status */}
                  <div className="flex items-center gap-1 text-xs">
                    <span className={`${statusDisplay.color} font-medium hidden sm:inline-flex items-center gap-1`}>
                      {statusDisplay.icon} {statusDisplay.text}
                    </span>
                    <span className={`${statusDisplay.color} font-medium sm:hidden`}>
                      {statusDisplay.icon}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Refresh Button - Mobile Only */}
              <div className="sm:hidden">
                <button
                  onClick={loadCustomSplits}
                  disabled={syncStatus === 'syncing'}
                  className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  {syncStatus === 'syncing' ? '🔄' : '🔄 Refresh'}
                </button>
              </div>
            </div>
            
            {/* Action Buttons Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2 sm:justify-end">
              {/* Desktop Refresh Button */}
              <button
                onClick={loadCustomSplits}
                disabled={syncStatus === 'syncing'}
                className="hidden sm:block text-sm px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 transition-colors"
              >
                {syncStatus === 'syncing' ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
              
              <Link
                to="/custom-split-builder"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-base"
              >
                <Dumbbell className="w-4 h-4" />
                <span className="truncate">Your Own Workout Split</span>
              </Link>
              <Link
                to="/custom-split-builder"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span className="truncate">Create New Split</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        {(customSplits.length > 0 || searchQuery) && (
          <div className="relative mb-6">
            <input 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full p-3 pl-10 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50" 
              placeholder="Search your custom splits..." 
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {searchQuery && filteredSplits.length === 0 && customSplits.length > 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Splits Found</h3>
            <p className="text-slate-400 mb-6">
              No custom splits match "{searchQuery}". Try a different search term.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>
        ) : customSplits.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {isAuthenticated() ? 'No Custom Splits Yet' : 'Login Required'}
            </h3>
            <p className="text-slate-400 mb-6">
              {isAuthenticated() 
                ? 'You haven\'t created any custom workout splits yet. Start building your first split!' 
                : 'Please login to view and create your personal workout splits.'
              }
            </p>
            {isAuthenticated() ? (
              <Link
                to="/custom-split-builder"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Create Your First Split
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
              >
                🔑 Login to View Splits
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchQuery && (
              <div className="col-span-full mb-4">
                <p className="text-slate-400 text-sm">
                  Showing {filteredSplits.length} of {customSplits.length} splits for "{searchQuery}"
                </p>
              </div>
            )}
            {filteredSplits.map((split) => (
              <motion.div 
                key={split.id} 
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-purple-400" />
                      <span className="text-xs font-semibold text-purple-400 tracking-wider">
                        CUSTOM SPLIT
                      </span>
                      <span className="text-xs bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30">
                        ⚡ YOUR CREATION
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{split.name}</h3>
                    <p className="text-sm text-slate-400">
                      {split.exercises?.length || 0} {(split.exercises?.length || 0) === 1 ? 'exercise' : 'exercises'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => duplicateSplit(split)}
                      className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-900/20 transition-colors"
                      title="Duplicate split"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteSplit(split.id)}
                      className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                      title="Delete split"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-2 mb-4">
                  {split.exercises?.slice(0, 3).map((exercise, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-purple-400 font-medium">{index + 1}.</span>
                      <span className="text-white">{exercise.name}</span>
                      <span className="text-slate-400">• {exercise.sets}</span>
                    </div>
                  ))}
                  {(split.exercises?.length || 0) > 3 && (
                    <div className="text-sm text-purple-400">
                      +{(split.exercises?.length || 0) - 3} more exercises
                    </div>
                  )}
                </div>

                {/* Split Info */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <Calendar className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">Frequency</div>
                    <div className="text-blue-400 font-semibold text-xs">{split.frequency}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <Target className="w-4 h-4 text-green-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">Difficulty</div>
                    <div className="text-green-400 font-semibold text-xs">{split.difficulty}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-2 text-center">
                    <Clock className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">Duration</div>
                    <div className="text-purple-400 font-semibold text-xs">{split.duration}</div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                  <div className="flex flex-col gap-1">
                    <span>Created: {new Date(split.createdAt).toLocaleDateString()}</span>
                    {lastSync && (
                      <span>Last sync: {lastSync.toLocaleTimeString()}</span>
                    )}
                  </div>
                  <span className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded">Custom</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedSplit(split)}
                    className="flex-1 bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-300 border border-purple-500/30 hover:border-purple-400/50 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    View Split
                  </button>
                  <button
                    onClick={() => editSplit(split)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Split
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {customSplits.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 rounded-lg p-4">
            <h4 className="text-purple-300 font-medium mb-2">🚀 REAL-TIME Custom Split Features:</h4>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• 🔥 INSTANT split creation and updates</li>
              <li>• ⚡ INSTANT dashboard updates when splits are created/deleted</li>
              <li>• 💾 Professional-grade data persistence</li>
              <li>• 📊 Real-time progress tracking</li>
              <li>• 🏋️ Professional gym-level experience</li>
              <li>• {user ? `👤 Account: ${realTimeStats.totalSplits} custom splits` : '🔒 Login to sync across devices'}</li>
            </ul>
            <div className="mt-3 text-xs text-purple-400">
              📈 Stats: {realTimeStats.totalSplits} total custom splits
            </div>
          </div>
        )}
      </div>

      {/* Split Details Modal */}
      {selectedSplit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedSplit(null)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedSplit.name}</h2>
                  <p className="text-slate-300">{selectedSplit.description}</p>
                </div>
                <button onClick={() => setSelectedSplit(null)} className="text-slate-400 hover:text-white text-2xl">
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-sm text-slate-400">Frequency</div>
                  <div className="text-white font-medium">{selectedSplit.frequency}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <Target className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-sm text-slate-400">Difficulty</div>
                  <div className="text-white font-medium">{selectedSplit.difficulty}</div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-sm text-slate-400">Duration</div>
                  <div className="text-white font-medium">{selectedSplit.duration}</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">📅 Weekly Schedule</h3>
                <div className="space-y-3">
                  {selectedSplit.weeklySchedule ? (
                    Object.entries(selectedSplit.weeklySchedule).map(([day, dayContent]) => {
                      const isRestDay = dayContent === 'Rest Day' || dayContent === 'No exercises planned';
                      const groupedExercises = isRestDay ? {} : groupExercisesByMuscleGroup(dayContent);
                      
                      return (
                        <div key={day} className="bg-slate-700/20 rounded-lg border border-slate-600/30 overflow-hidden">
                          <div className="flex items-center justify-between p-3 border-b border-slate-600/30">
                            <span className="font-semibold text-white text-lg">{day}</span>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              isRestDay 
                                ? 'bg-gray-600 text-gray-300' 
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {isRestDay ? '😴 Rest' : '💪 Workout'}
                            </div>
                          </div>
                          
                          {isRestDay ? (
                            <div className="p-3">
                              <div className="text-slate-400 text-sm flex items-center gap-2">
                                <span className="text-lg">😴</span>
                                <span>{dayContent}</span>
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
                              <div className="text-white text-sm">{dayContent}</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    // Fallback for old format splits
                    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                      const dayExercises = selectedSplit.exercises?.filter(ex => ex.day === day) || [];
                      const exerciseNames = dayExercises.map(ex => ex.name).join(', ');
                      const groupedExercises = dayExercises.length > 0 ? groupExercisesByMuscleGroup(exerciseNames) : {};
                      
                      return (
                        <div key={day} className="bg-slate-700/20 rounded-lg border border-slate-600/30 overflow-hidden">
                          <div className="flex items-center justify-between p-3 border-b border-slate-600/30">
                            <span className="font-semibold text-white text-lg">{day}</span>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              dayExercises.length === 0 
                                ? 'bg-gray-600 text-gray-300' 
                                : 'bg-purple-500/20 text-purple-300'
                            }`}>
                              {dayExercises.length === 0 ? '😴 Rest' : '💪 Workout'}
                            </div>
                          </div>
                          
                          {dayExercises.length === 0 ? (
                            <div className="p-3">
                              <div className="text-slate-400 text-sm flex items-center gap-2">
                                <span className="text-lg">😴</span>
                                <span>No exercises planned</span>
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
                              <div className="space-y-1">
                                {dayExercises.map((exercise, idx) => (
                                  <div key={idx} className="text-white text-sm">{exercise.name}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedSplit(null);
                    editSplit(selectedSplit);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Split
                </button>
                <button
                  onClick={() => {
                    setSelectedSplit(null);
                    duplicateSplit(selectedSplit);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourWorkoutSplits;