import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { useAuth } from '../context/AuthContext';
import { saveUserSplit } from '../utils/userSpecificSplits';
import { 
  Dumbbell, 
  Plus, 
  Save, 
  ArrowLeft, 
  Target, 
  Calendar, 
  Clock, 
  Users,
  Trash2,
  ChevronUp,
  ChevronDown,
  Play
} from 'lucide-react';

const CustomSplitBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('chest');
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [weeklyPlan, setWeeklyPlan] = useState({
    Monday: { exercises: [], isRestDay: false },
    Tuesday: { exercises: [], isRestDay: false },
    Wednesday: { exercises: [], isRestDay: false },
    Thursday: { exercises: [], isRestDay: false },
    Friday: { exercises: [], isRestDay: false },
    Saturday: { exercises: [], isRestDay: false },
    Sunday: { exercises: [], isRestDay: false }
  });
  const [splitName, setSplitName] = useState('');
  const [splitDescription, setSplitDescription] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editingSplitId, setEditingSplitId] = useState(null);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverArea, setDragOverArea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState('live');
  const [autoSave, setAutoSave] = useState(false);
  const autoSaveTimer = useRef(null);

  const currentMuscleGroup = exerciseLibrary[selectedMuscleGroup];
  const exercises = currentMuscleGroup.exercises;

  // Load editing split if in edit mode
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const mode = urlParams.get('mode');
    
    if (mode === 'edit') {
      const editingSplit = localStorage.getItem('editingSplit');
      if (editingSplit) {
        try {
          const split = JSON.parse(editingSplit);
          console.log('🔄 Loading split for editing:', split);
          
          setSplitName(split.name);
          setSplitDescription(split.description || '');
          
          // Load weekly schedule if available
          if (split.weeklySchedule) {
            const newWeeklyPlan = { ...weeklyPlan };
            Object.keys(split.weeklySchedule).forEach(day => {
              if (newWeeklyPlan[day]) {
                const dayWorkout = split.weeklySchedule[day];
                if (dayWorkout === 'Rest Day') {
                  newWeeklyPlan[day] = { exercises: [], isRestDay: true };
                } else {
                  // Parse exercises from the day's workout
                  const exercises = split.exercises?.filter(ex => ex.day === day) || [];
                  newWeeklyPlan[day] = { exercises, isRestDay: false };
                }
              }
            });
            setWeeklyPlan(newWeeklyPlan);
          }
          setEditMode(true);
          setEditingSplitId(split.id);
          localStorage.removeItem('editingSplit');
          
          console.log('✅ Edit mode loaded successfully:', {
            splitName: split.name,
            editMode: true,
            splitId: split.id
          });
        } catch (error) {
          console.error('❌ Error loading split for editing:', error);
        }
      } else {
        console.warn('⚠️ Edit mode requested but no split data found');
      }
    }
  }, [location.search]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && splitName.trim() && getTotalExercises() > 0) {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = setTimeout(() => {
        saveSplitDraft();
      }, 3000);
    }
  }, [splitName, weeklyPlan, autoSave]);

  const saveSplitDraft = async () => {
    const totalExercises = getTotalExercises();
    if (!splitName.trim() || totalExercises === 0) return;
    
    try {
      const draftData = {
        name: splitName.trim() + ' (Draft)',
        description: splitDescription,
        weeklyPlan,
        isDraft: true
      };
      
      localStorage.setItem('customSplitBuilderDraft', JSON.stringify(draftData));
      setSyncStatus('draft-saved');
      
      setTimeout(() => setSyncStatus('live'), 2000);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem('customSplitBuilderDraft');
      if (draft) {
        const draftData = JSON.parse(draft);
        setSplitName(draftData.name.replace(' (Draft)', ''));
        setSplitDescription(draftData.description || '');
        if (draftData.weeklyPlan) {
          setWeeklyPlan(draftData.weeklyPlan);
        }
        localStorage.removeItem('customSplitBuilderDraft');
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const handleDragStart = useCallback((e, item, source) => {
    setDraggedItem({ item, source });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, source }));
    
    setTimeout(() => {
      e.target.style.opacity = '0.5';
      e.target.style.transform = 'rotate(5deg)';
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
    e.target.style.transform = 'rotate(0deg)';
    setDraggedItem(null);
    setDragOverArea(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e, area) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverArea(area);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverArea(null);
    }
  }, []);

  const handleDrop = useCallback((e, targetArea) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragOverArea(null);

    let dragData;
    try {
      dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch (error) {
      dragData = draggedItem;
    }

    if (!dragData) return;

    const { item, source } = dragData;

    if (source === 'library' && targetArea === 'split') {
      const newSplitItem = {
        ...item,
        planId: `split-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalId: item.id,
        day: selectedDay
      };
      setWeeklyPlan(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          exercises: [...prev[selectedDay].exercises, newSplitItem],
          isRestDay: false
        }
      }));
    } else if (source === 'split' && targetArea === 'library') {
      setWeeklyPlan(prev => ({
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          exercises: prev[selectedDay].exercises.filter(ex => ex.planId !== item.planId)
        }
      }));
    }

    setDraggedItem(null);
  }, [draggedItem]);

  const addToSplit = useCallback((exercise) => {
    const newSplitItem = {
      ...exercise,
      planId: `split-${Date.now()}-${Math.random()}`,
      originalId: exercise.id,
      day: selectedDay
    };
    setWeeklyPlan(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        exercises: [...prev[selectedDay].exercises, newSplitItem],
        isRestDay: false
      }
    }));
  }, [selectedDay]);

  const removeFromSplit = useCallback((planId) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        exercises: prev[selectedDay].exercises.filter(item => item.planId !== planId)
      }
    }));
  }, [selectedDay]);

  const moveUp = useCallback((index) => {
    if (index === 0) return;
    setWeeklyPlan(prev => {
      const exercises = [...prev[selectedDay].exercises];
      [exercises[index - 1], exercises[index]] = [exercises[index], exercises[index - 1]];
      return {
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          exercises
        }
      };
    });
  }, [selectedDay]);

  const moveDown = useCallback((index) => {
    setWeeklyPlan(prev => {
      const exercises = [...prev[selectedDay].exercises];
      if (index === exercises.length - 1) return prev;
      [exercises[index], exercises[index + 1]] = [exercises[index + 1], exercises[index]];
      return {
        ...prev,
        [selectedDay]: {
          ...prev[selectedDay],
          exercises
        }
      };
    });
  }, [selectedDay]);

  const toggleRestDay = useCallback(() => {
    setWeeklyPlan(prev => {
      if (!prev[selectedDay]) return prev;
      return {
        ...prev,
        [selectedDay]: {
          exercises: prev[selectedDay].isRestDay ? prev[selectedDay].exercises : [],
          isRestDay: !prev[selectedDay].isRestDay
        }
      };
    });
  }, [selectedDay]);

  const getTotalExercises = () => {
    try {
      return Object.values(weeklyPlan).reduce((total, day) => total + (day.exercises?.length || 0), 0);
    } catch (error) {
      console.error('Error calculating total exercises:', error);
      return 0;
    }
  };

  const getCurrentDayExercises = () => {
    try {
      return weeklyPlan[selectedDay]?.exercises || [];
    } catch (error) {
      console.error('Error getting current day exercises:', error);
      return [];
    }
  };

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
    return category;
  };

  const groupExercisesByMuscleGroup = (exercises) => {
    const grouped = {};
    exercises.forEach(exercise => {
      const muscleGroup = getMuscleGroupFromCategory(exercise.category);
      if (!grouped[muscleGroup]) {
        grouped[muscleGroup] = [];
      }
      grouped[muscleGroup].push(exercise);
    });
    return grouped;
  };

  const saveSplit = async () => {
    if (!splitName.trim()) {
      alert('Please enter a split name');
      return;
    }
    if (getTotalExercises() === 0) {
      alert('Please add exercises to your split');
      return;
    }
    
    setSaving(true);
    setSyncStatus('saving');
    
    try {
      const customSplit = {
        id: editMode ? editingSplitId : Date.now(),
        name: splitName.trim(),
        description: splitDescription || `Custom workout split with ${getTotalExercises()} exercises`,
        category: ['custom'],
        frequency: `${Object.values(weeklyPlan).filter(day => !day.isRestDay && day.exercises.length > 0).length} days/week`,
        difficulty: 'Custom',
        duration: `${getTotalExercises() * 3}-${getTotalExercises() * 4} min`,
        weeklySchedule: Object.keys(weeklyPlan).reduce((schedule, day) => {
          if (weeklyPlan[day].isRestDay) {
            schedule[day] = 'Rest Day';
          } else if (weeklyPlan[day].exercises.length > 0) {
            schedule[day] = weeklyPlan[day].exercises.map(ex => ex.name).join(', ');
          } else {
            schedule[day] = 'No exercises planned';
          }
          return schedule;
        }, {}),
        muscles: Object.keys(weeklyPlan).reduce((muscles, day) => {
          if (!weeklyPlan[day].isRestDay && weeklyPlan[day].exercises.length > 0) {
            muscles[day] = weeklyPlan[day].exercises.map(ex => ex.category || ex.name).join(', ');
          }
          return muscles;
        }, {}),
        benefits: ['Custom designed', 'Personalized training', 'Your exercise selection'],
        bestFor: 'Custom workout based on your preferences',
        isCustom: true,
        createdBy: user?.name || 'User',
        userId: user?._id || user?.id,
        exercises: Object.keys(weeklyPlan).reduce((allExercises, day) => {
          if (!weeklyPlan[day].isRestDay) {
            const dayExercises = weeklyPlan[day].exercises.map(exercise => ({
              name: exercise.name,
              category: exercise.category,
              sets: exercise.sets,
              muscle: exercise.category,
              difficulty: exercise.difficulty || 'intermediate',
              day: day
            }));
            allExercises.push(...dayExercises);
          }
          return allExercises;
        }, []),
        createdAt: new Date().toISOString()
      };
      
      // Save using utility function
      if (!isAuthenticated()) {
        alert('Please login to save custom splits.');
        return;
      }
      
      // Use utility function to save split
      saveUserSplit(user, customSplit);
      console.log(`✅ Custom split saved using user-specific utility`);
      
      setSyncStatus('synced');
      
      // Clear draft
      localStorage.removeItem('customSplitBuilderDraft');
      
      // Dispatch real-time event for instant updates
      window.dispatchEvent(new CustomEvent('customSplitCreated', {
        detail: { split: customSplit }
      }));
      
      alert(`🚀 CUSTOM SPLIT CREATED!

✅ "${splitName}" saved successfully
💪 ${getTotalExercises()} exercises included
⚡ Available in Your WorkoutSplits
🏋️ Ready for your workout!

Check Your WorkoutSplits page to see your custom split!`);
      
      // Reset form
      setSplitName('');
      setSplitDescription('');
      setWeeklyPlan({
        Monday: { exercises: [], isRestDay: false },
        Tuesday: { exercises: [], isRestDay: false },
        Wednesday: { exercises: [], isRestDay: false },
        Thursday: { exercises: [], isRestDay: false },
        Friday: { exercises: [], isRestDay: false },
        Saturday: { exercises: [], isRestDay: false },
        Sunday: { exercises: [], isRestDay: false }
      });
      
      // Navigate to Your WorkoutSplits page
      setTimeout(() => {
        navigate('/your-workout-splits');
      }, 1500);
      
    } catch (error) {
      console.error('Error saving custom split:', error);
      setSyncStatus('error');
      alert('Failed to save custom split. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => {
        setSyncStatus('live');
      }, 3000);
    }
  };

  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'synced': return { icon: '✅', text: 'Synced', color: 'text-green-400' };
      case 'saving': return { icon: '💾', text: 'Saving...', color: 'text-yellow-400' };
      case 'draft-saved': return { icon: '📝', text: 'Draft Saved', color: 'text-purple-400' };
      case 'error': return { icon: '❌', text: 'Error', color: 'text-red-500' };
      default: return { icon: '🌐', text: 'Live', color: 'text-blue-400' };
    }
  };

  const statusDisplay = getSyncStatusDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-950 via-black to-gray-950 border-b border-orange-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/workout-splits')}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Back to Splits</span>
              </button>
              <div className="h-4 sm:h-6 w-px bg-gray-700"></div>
              <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent truncate">
                {editMode ? 'Edit Your Workout Split' : 'Create Your Own Workout Split'}
              </h1>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center justify-between sm:justify-end">
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
                <span className={`${statusDisplay.color} font-medium hidden sm:inline-flex items-center gap-1`}>
                  {statusDisplay.icon} {statusDisplay.text}
                </span>
                <span className={`${statusDisplay.color} font-medium sm:hidden`}>
                  {statusDisplay.icon}
                </span>

                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`text-xs px-2 sm:px-3 py-1 rounded-full ${
                    autoSave 
                      ? 'bg-blue-900/30 text-blue-300 border border-blue-700' 
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                  }`}
                >
                  <span className="hidden sm:inline">{autoSave ? '💾 Auto-Save ON' : '💾 Auto-Save OFF'}</span>
                  <span className="sm:hidden">{autoSave ? '💾 ON' : '💾 OFF'}</span>
                </button>
                <button
                  onClick={loadDraft}
                  className="text-xs px-2 sm:px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-700"
                >
                  <span className="hidden sm:inline">📝 Load Draft</span>
                  <span className="sm:hidden">📝</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Form Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">
            {editMode ? '🔄 EDITING WORKOUT SPLIT 🏋️' : 'Custom Workout Split Builder 🏋️'}
          </h2>
          {editMode && (
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
              <p className="text-blue-300 text-xs sm:text-sm">
                ✅ Edit mode active - You are editing an existing split
              </p>
            </div>
          )}
          
          <div className="space-y-3 sm:space-y-4">
            <div>
              <input
                type="text"
                value={splitName}
                onChange={(e) => setSplitName(e.target.value)}
                placeholder="Enter split name..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 text-sm sm:text-base"
              />
            </div>
            <div>
              <textarea
                value={splitDescription}
                onChange={(e) => setSplitDescription(e.target.value)}
                placeholder="Describe your custom split (optional)..."
                rows={2}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 resize-none text-sm sm:text-base"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/your-workout-splits')}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-medium inline-flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">Your WorkoutSplits</span>
              </button>
              <button
                onClick={saveSplit}
                disabled={saving || !splitName.trim() || getTotalExercises() === 0}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 rounded-lg font-medium text-sm sm:text-base"
              >
                {saving ? '🔄 Saving...' : editMode ? '💾 Update Split' : '💾 Save Custom Split'}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Muscle Group Info & Progress */}
        <div className={`border rounded-lg p-4 ${currentMuscleGroup.color}/20 border-orange-500/30 transition-all duration-300 mb-6`}>
          <div className="flex flex-col gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl animate-bounce">{currentMuscleGroup.icon}</span>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white">{currentMuscleGroup.name} Workout Tips</h4>
                  <div className="text-xs text-slate-400">
                    {exercises.length} exercises • Real-time guidance
                  </div>
                </div>
              </div>
              
              {getTotalExercises() > 0 && (
                <div className="mt-3 p-2 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                  <div className="text-blue-300 text-sm flex items-center gap-2">
                    <span>📊</span>
                    <span>Split Progress: {getTotalExercises()} exercises added</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-2 ml-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((getTotalExercises() / 10) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs">{Math.min(Math.round((getTotalExercises() / 10) * 100), 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Exercise Library */}
          <div 
            className={`bg-slate-800/60 border border-slate-700 rounded-lg p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] transition-all duration-200 ${
              dragOverArea === 'library' ? 'bg-slate-700/50 border-slate-500 shadow-lg' : ''
            }`}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'library')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'library')}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
              <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <span className="animate-pulse">📚</span> 
                <span>Exercise Library</span>
                <span className="text-xs sm:text-sm text-slate-400">({exercises.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white ${currentMuscleGroup.color} shadow-lg`}>
                  {currentMuscleGroup.name}
                </span>

              </div>
            </div>
            
            {/* Day Selection - Mobile Optimized */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-white flex items-center gap-2">
                  <span>📅</span>
                  <span>Select Day</span>
                </h4>
                <div className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full border border-orange-500/30">
                  {selectedDay}
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all duration-200 border active:scale-95 ${
                      selectedDay === day
                        ? 'bg-orange-600 text-white shadow-lg border-orange-400/50 ring-1 ring-orange-400/50'
                        : weeklyPlan[day]?.isRestDay
                        ? 'bg-gray-600 text-gray-300 border-gray-500/50'
                        : (weeklyPlan[day]?.exercises?.length || 0) > 0
                        ? 'bg-green-600/30 text-green-300 border-green-500/50'
                        : 'bg-slate-700/50 text-slate-300 border-slate-600/50'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">{day.slice(0, 3)}</div>
                    <div className="text-sm mb-1">
                      {selectedDay === day ? '🎯' : weeklyPlan[day]?.isRestDay ? '😴' : (weeklyPlan[day]?.exercises?.length || 0) > 0 ? '💪' : '⚪'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {(weeklyPlan[day]?.exercises?.length || 0)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rest Day Toggle - Mobile Optimized */}
            <div className="mb-3 sm:mb-4">
              <button
                onClick={toggleRestDay}
                className={`w-full p-3 sm:p-4 rounded-xl font-medium transition-all duration-300 text-sm sm:text-base border ${
                  weeklyPlan[selectedDay]?.isRestDay
                    ? 'bg-gray-600 text-white border-gray-500/50 shadow-lg'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-gray-600/50 border-slate-600/50 hover:border-gray-500/50'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">{weeklyPlan[selectedDay]?.isRestDay ? '😴' : '😴'}</span>
                  <span>{weeklyPlan[selectedDay]?.isRestDay ? 'Rest Day Active' : 'Mark as Rest Day'}</span>
                </div>
              </button>
            </div>

            {/* Muscle Group Tabs - Mobile Optimized */}
            {!weeklyPlan[selectedDay]?.isRestDay && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs sm:text-sm font-medium text-white mb-2 flex items-center gap-2">
                  <span>💪</span>
                  <span>Select Muscle Group</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                  {Object.entries(exerciseLibrary).map(([key, group]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedMuscleGroup(key)}
                      className={`p-3 sm:p-4 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 border ${
                        selectedMuscleGroup === key
                          ? `${group.color} text-white shadow-lg border-white/20 scale-105`
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-slate-600/50 hover:border-slate-500/50 hover:scale-102'
                      }`}
                    >
                      <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{group.icon}</div>
                      <div className="text-xs sm:text-sm font-semibold truncate">{group.name}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {group.exercises?.length || 0} exercises
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Exercise List - Mobile Optimized */}
            {!weeklyPlan[selectedDay]?.isRestDay ? (
              <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
                {exercises.map((exercise, index) => {
                  const isInSplit = getCurrentDayExercises().some(p => p.originalId === exercise.id);
                return (
                  <div 
                    key={exercise.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, { ...exercise, category: currentMuscleGroup.name }, 'library')}
                    onDragEnd={handleDragEnd}
                    className={`p-3 sm:p-4 rounded-xl border cursor-grab active:cursor-grabbing transition-all duration-300 select-none transform hover:scale-[1.01] sm:hover:scale-[1.02] ${
                      isInSplit 
                        ? 'bg-green-900/30 border-green-700/50 shadow-green-900/20 shadow-lg' 
                        : 'bg-slate-800/60 border-slate-700/50 hover:bg-slate-700/60 hover:border-slate-600/50 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                          <div className="font-medium text-white text-sm sm:text-base truncate">
                            {exercise.name}
                          </div>
                          {isInSplit && (
                            <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded-full border border-green-700/50 flex-shrink-0 self-start sm:self-auto">
                              ✓ Added
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-400">
                          <span className="flex items-center gap-1 bg-slate-700/40 px-2 py-1 rounded border border-slate-600/50">
                            <span>🏋️</span>
                            <span className="font-medium">{exercise.sets}</span>
                          </span>
                          <span className={`px-2 py-1 rounded text-xs border font-medium ${
                            exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300 border-green-700/50' :
                            exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50' :
                            'bg-red-900/30 text-red-300 border-red-700/50'
                          }`}>
                            {exercise.difficulty}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1 bg-slate-700/30 px-2 py-1 rounded border border-slate-600/50">
                            <span>🏅</span>
                            <span className="truncate text-xs">{exercise.type}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          onClick={() => addToSplit({ ...exercise, category: currentMuscleGroup.name })}
                          disabled={isInSplit}
                          className={`text-base sm:text-lg font-bold w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg transition-all duration-300 border ${
                            isInSplit 
                              ? 'text-green-400 bg-green-900/30 border-green-700/50 cursor-not-allowed' 
                              : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border-blue-700/50 hover:border-blue-600/50 hover:scale-105'
                          }`}
                        >
                          {isInSplit ? '✓' : '+'}
                        </button>
                        <div className="text-slate-500 text-base sm:text-lg cursor-grab hidden sm:block">
                          ⋮⋮
                        </div>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-600 rounded-xl">
                <div className="text-center">
                  <div className="text-6xl mb-4">😴</div>
                  <h4 className="text-gray-300 text-lg font-semibold mb-2">{selectedDay} - Rest Day</h4>
                  <p className="text-gray-400">No exercises planned for this day</p>
                </div>
              </div>
            )}
          </div>

          {/* Your Custom Split - Mobile Optimized */}
          <div 
            className={`bg-slate-800/60 border border-slate-700 rounded-xl p-3 sm:p-4 lg:p-6 min-h-[400px] sm:min-h-[500px] transition-all duration-300 ${
              dragOverArea === 'split' 
                ? 'bg-green-900/30 border-green-400 shadow-xl ring-2 ring-green-400/50 scale-[1.01] sm:scale-[1.02]' 
                : 'hover:bg-slate-800/80 hover:border-slate-600'
            }`}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'split')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'split')}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-5 gap-3 sm:gap-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                  <span className="text-2xl sm:text-3xl animate-pulse">🎯</span> 
                  <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                    <span className="hidden sm:inline">{editMode ? 'Editing Your Split' : 'Your Custom Split'}</span>
                    <span className="sm:hidden">{editMode ? 'Edit Split' : 'Custom Split'}</span>
                  </span>
                </h3>
                {getTotalExercises() > 0 && (
                  <span className="text-xs sm:text-sm text-green-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="hidden sm:inline">Ready to save!</span>
                    <span className="sm:hidden">Ready!</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-slate-300 bg-slate-700/60 px-2 sm:px-3 py-1.5 sm:py-2 rounded-full border border-slate-600 shadow-sm">
                  <span className="text-blue-400 mr-1">📊</span>
                  <span className="hidden sm:inline">{getCurrentDayExercises().length} {getCurrentDayExercises().length === 1 ? 'exercise' : 'exercises'} today</span>
                  <span className="sm:hidden">{getCurrentDayExercises().length} exercises</span>
                </span>
              </div>
            </div>
            
            {getCurrentDayExercises().length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px] border-2 border-dashed border-slate-600 rounded-xl transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/30 mx-1">
                <div className="text-center px-4 sm:px-6 py-6 sm:py-8">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4 animate-bounce">🎯</div>
                  <h4 className="text-slate-300 text-lg sm:text-xl font-semibold mb-2">
                    {weeklyPlan[selectedDay]?.isRestDay ? `${selectedDay} - Rest Day` : `Plan ${selectedDay} Workout`}
                  </h4>
                  <p className="text-slate-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs mx-auto leading-relaxed">
                    {weeklyPlan[selectedDay]?.isRestDay ? 'This is a rest day - no exercises planned' : 'Drag exercises here or tap the + button to add them'}
                  </p>
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg p-3 sm:p-4 border border-purple-500/20">
                      <p className="text-purple-300 text-sm sm:text-base font-semibold mb-2">
                        Build your Own Custom Workout Split
                      </p>
                      <p className="text-slate-400 text-xs sm:text-sm">
                        Select muscle groups and add exercises to create your perfect workout
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-w-sm mx-auto">
                      {Object.entries(muscleGroupMapping).map(([name, config]) => (
                        <div key={name} className="text-center p-2 sm:p-3 bg-slate-800/40 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                          <div className="text-lg sm:text-xl mb-1">{config.icon}</div>
                          <div className="text-xs sm:text-sm text-slate-300 font-medium">{name}</div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-800/30 rounded-full px-4 py-2 border border-slate-700/50">
                      <span className="text-base">💪</span>
                      <span className="font-medium">Professional Level</span>
                      <span className="text-base">💪</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto">
                {(() => {
                  const groupedExercises = groupExercisesByMuscleGroup(getCurrentDayExercises());
                  return Object.entries(groupedExercises).map(([muscleGroup, exercises]) => {
                    const config = muscleGroupMapping[muscleGroup];
                    if (!config || exercises.length === 0) return null;
                    
                    return (
                      <div key={muscleGroup} className="bg-slate-800/40 rounded-xl border border-slate-700/50 overflow-hidden">
                        <div className={`${config.color} bg-opacity-20 border-b border-slate-700/50 px-3 sm:px-4 py-2 sm:py-3`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-lg sm:text-xl lg:text-2xl">{config.icon}</span>
                              <div>
                                <h4 className="text-white font-semibold text-sm sm:text-base lg:text-lg">{muscleGroup}</h4>
                                <p className="text-slate-400 text-xs sm:text-sm">{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}</p>
                              </div>
                            </div>
                            <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-white ${config.color} bg-opacity-80`}>
                              <span className="hidden sm:inline">{muscleGroup} Workout</span>
                              <span className="sm:hidden">{muscleGroup}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                          {exercises.map((exercise, exerciseIndex) => {
                            const globalIndex = getCurrentDayExercises().findIndex(ex => ex.planId === exercise.planId);
                            return (
                              <div 
                                key={exercise.planId}
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, exercise, 'split')}
                                onDragEnd={handleDragEnd}
                                className="group p-3 sm:p-4 rounded-lg bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60 border border-slate-600/50 cursor-grab active:cursor-grabbing transition-all duration-300 hover:from-slate-700/70 hover:via-slate-600/50 hover:to-slate-700/70 hover:border-slate-500/70 hover:shadow-lg select-none transform hover:scale-[1.005] sm:hover:scale-[1.01] active:scale-[0.995] sm:active:scale-[0.99]"
                              >
                                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                  <div className="flex-shrink-0">
                                    <span className={`text-white font-bold text-xs sm:text-sm ${config.color} bg-opacity-80 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center border border-slate-600 shadow-sm group-hover:shadow-md transition-all duration-300`}>
                                      {exerciseIndex + 1}
                                    </span>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                      <h5 className="font-medium text-white text-sm sm:text-base truncate">
                                        {exercise.name}
                                      </h5>
                                      <span className="text-xs bg-slate-700/60 text-slate-300 px-2 py-1 rounded-md border border-slate-600 self-start sm:self-auto">
                                        ✓ In Split
                                      </span>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-400">
                                      <span className="flex items-center gap-1 bg-slate-700/40 px-2 py-1 rounded border border-slate-600">
                                        <span>🏋️</span>
                                        <span className="font-medium">{exercise.sets}</span>
                                      </span>
                                      {exercise.difficulty && (
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${
                                          exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300 border-green-700/50' :
                                          exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50' :
                                          'bg-red-900/30 text-red-300 border-red-700/50'
                                        }`}>
                                          {exercise.difficulty}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex flex-col sm:flex-row items-center gap-1">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => moveUp(globalIndex)}
                                        disabled={globalIndex === 0}
                                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-slate-600/50 transition-all duration-200 active:scale-95"
                                      >
                                        <ChevronUp className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => moveDown(globalIndex)}
                                        disabled={globalIndex === getCurrentDayExercises().length - 1}
                                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-slate-600/50 transition-all duration-200 active:scale-95"
                                      >
                                        <ChevronDown className="w-3 h-3" />
                                      </button>
                                    </div>
                                    
                                    <button
                                      onClick={() => removeFromSplit(exercise.planId)}
                                      className="text-red-400 hover:text-red-300 text-lg font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-red-900/30 transition-all duration-200 active:scale-95"
                                    >
                                      ×
                                    </button>
                                    <div className="text-slate-500 text-base sm:text-lg cursor-grab hidden sm:block">
                                      ⋮⋮
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }).filter(Boolean);
                })()
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSplitBuilder;