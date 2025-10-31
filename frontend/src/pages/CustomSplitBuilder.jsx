import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { useAuth } from '../context/AuthContext';
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
      
      // Save to localStorage
      const existingCustomSplits = JSON.parse(localStorage.getItem('custom_workout_splits') || '[]');
      
      if (editMode) {
        const updatedSplits = existingCustomSplits.map(split => 
          split.id === editingSplitId ? { ...split, ...customSplit } : split
        );
        localStorage.setItem('custom_workout_splits', JSON.stringify(updatedSplits));
      } else {
        existingCustomSplits.push(customSplit);
        localStorage.setItem('custom_workout_splits', JSON.stringify(existingCustomSplits));
      }
      
      // Also save to the main workout splits storage for integration
      const allSplits = JSON.parse(localStorage.getItem('workout_splits') || '[]');
      allSplits.push(customSplit);
      localStorage.setItem('workout_splits', JSON.stringify(allSplits));
      
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
      <div className="bg-gradient-to-r from-gray-950 via-black to-gray-950 border-b border-orange-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/workout-splits')}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Splits</span>
              </button>
              <div className="h-6 w-px bg-gray-700"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {editMode ? 'Edit Your Workout Split' : 'Create Your Own Workout Split'}
              </h1>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <span className={`${statusDisplay.color} font-medium`}>
                  {statusDisplay.icon} {statusDisplay.text}
                </span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-blue-400 font-medium">🌐 Live</span>
                </div>
                <button
                  onClick={() => setAutoSave(!autoSave)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    autoSave 
                      ? 'bg-blue-900/30 text-blue-300 border border-blue-700' 
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                  }`}
                >
                  {autoSave ? '💾 Auto-Save ON' : '💾 Auto-Save OFF'}
                </button>
                <button
                  onClick={loadDraft}
                  className="text-xs px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 border border-purple-700"
                >
                  📝 Load Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Form Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-white">
            {editMode ? '🔄 EDITING WORKOUT SPLIT 🏋️' : 'Custom Workout Split Builder 🏋️'}
          </h2>
          {editMode && (
            <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
              <p className="text-blue-300 text-sm">
                ✅ Edit mode active - You are editing an existing split
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={splitName}
                onChange={(e) => setSplitName(e.target.value)}
                placeholder="Enter split name..."
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400"
              />
            </div>
            <div>
              <textarea
                value={splitDescription}
                onChange={(e) => setSplitDescription(e.target.value)}
                placeholder="Describe your custom split (optional)..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 resize-none"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/your-workout-splits')}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-medium inline-flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Your WorkoutSplits
              </button>
              <button
                onClick={saveSplit}
                disabled={saving || !splitName.trim() || getTotalExercises() === 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 rounded-lg font-medium"
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exercise Library */}
          <div 
            className={`bg-slate-800/60 border border-slate-700 rounded-lg p-4 min-h-[500px] transition-all duration-200 ${
              dragOverArea === 'library' ? 'bg-slate-700/50 border-slate-500 shadow-lg' : ''
            }`}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'library')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'library')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <span className="animate-pulse">📚</span> 
                <span>Exercise Library</span>
                <span className="text-sm text-slate-400">({exercises.length})</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${currentMuscleGroup.color} shadow-lg`}>
                  {currentMuscleGroup.name}
                </span>
                <span className="px-2 py-1 rounded-full text-xs bg-green-900/30 text-green-300 border border-green-700">
                  ☁️ Live
                </span>
              </div>
            </div>
            
            {/* Day Selection Tabs */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white mb-2">📅 Select Day</h4>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`p-2 rounded-lg text-xs font-medium transition-all ${
                      selectedDay === day
                        ? 'bg-orange-600 text-white shadow-lg'
                        : weeklyPlan[day]?.isRestDay
                        ? 'bg-gray-600 text-gray-300'
                        : (weeklyPlan[day]?.exercises?.length || 0) > 0
                        ? 'bg-green-600/30 text-green-300 border border-green-500/50'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <div className="truncate">{day.slice(0, 3)}</div>
                    <div className="text-xs mt-1">
                      {weeklyPlan[day]?.isRestDay ? '😴' : (weeklyPlan[day]?.exercises?.length || 0) > 0 ? '💪' : '⚪'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rest Day Toggle */}
            <div className="mb-4">
              <button
                onClick={toggleRestDay}
                className={`w-full p-3 rounded-lg font-medium transition-all ${
                  weeklyPlan[selectedDay]?.isRestDay
                    ? 'bg-gray-600 text-white border border-gray-500'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-gray-600/50 border border-slate-600'
                }`}
              >
                {weeklyPlan[selectedDay]?.isRestDay ? '😴 Rest Day Active' : '😴 Mark as Rest Day'}
              </button>
            </div>

            {/* Muscle Group Tabs */}
            {!weeklyPlan[selectedDay]?.isRestDay && (
              <div className="grid grid-cols-6 gap-2 mb-4">
                {Object.entries(exerciseLibrary).map(([key, group]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMuscleGroup(key)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedMuscleGroup === key
                        ? `${group.color} text-white shadow-lg`
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <div className="text-xl mb-1">{group.icon}</div>
                    <div className="truncate text-xs">{group.name}</div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Exercise List */}
            {!weeklyPlan[selectedDay]?.isRestDay ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {exercises.map((exercise, index) => {
                  const isInSplit = getCurrentDayExercises().some(p => p.originalId === exercise.id);
                return (
                  <div 
                    key={exercise.id}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, { ...exercise, category: currentMuscleGroup.name }, 'library')}
                    onDragEnd={handleDragEnd}
                    className={`p-4 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200 select-none transform hover:scale-[1.02] ${
                      isInSplit 
                        ? 'bg-green-900/30 border-green-700 shadow-green-900/20 shadow-lg' 
                        : 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 hover:border-slate-600 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-white text-base">
                            {exercise.name}
                          </div>
                          {isInSplit && (
                            <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded-full border border-green-700">
                              ✓ Added
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <span>🏋️</span>
                            <span>{exercise.sets}</span>
                          </span>
                          <span className={`px-2 py-1 rounded text-xs border ${
                            exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300 border-green-700' :
                            exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' :
                            'bg-red-900/30 text-red-300 border-red-700'
                          }`}>
                            {exercise.difficulty}
                          </span>
                          <span className="text-slate-500 flex items-center gap-1">
                            <span>🏅</span>
                            <span>{exercise.type}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToSplit({ ...exercise, category: currentMuscleGroup.name })}
                          disabled={isInSplit}
                          className={`text-lg font-bold w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 ${
                            isInSplit 
                              ? 'text-green-400 bg-green-900/30 border border-green-700 cursor-not-allowed' 
                              : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border border-transparent hover:border-blue-700'
                          }`}
                        >
                          {isInSplit ? '✓' : '+'}
                        </button>
                        <div className="text-slate-500 text-xl ml-1 cursor-grab">
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

          {/* Your Custom Split */}
          <div 
            className={`bg-slate-800/60 border border-slate-700 rounded-xl p-6 min-h-[500px] transition-all duration-300 ${
              dragOverArea === 'split' 
                ? 'bg-green-900/30 border-green-400 shadow-xl ring-2 ring-green-400/50 scale-[1.02]' 
                : 'hover:bg-slate-800/80 hover:border-slate-600'
            }`}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, 'split')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, 'split')}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="text-3xl animate-pulse">🎯</span> 
                  <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                    {editMode ? 'Editing Your Split' : 'Your Custom Split'}
                  </span>
                </h3>
                {getTotalExercises() > 0 && (
                  <span className="text-sm text-green-400 font-medium flex items-center gap-1 ml-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span>Ready to save!</span>
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300 bg-slate-700/60 px-3 py-2 rounded-full border border-slate-600 shadow-sm">
                  <span className="text-blue-400 mr-1">📊</span>
                  {getCurrentDayExercises().length} {getCurrentDayExercises().length === 1 ? 'exercise' : 'exercises'} today
                </span>
                <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">
                  <span className="mr-1">☁️</span>
                  Live Sync
                </span>
              </div>
            </div>
            
            {getCurrentDayExercises().length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px] border-2 border-dashed border-slate-600 rounded-xl transition-all duration-300 hover:border-slate-500 hover:bg-slate-800/30 mx-1">
                <div className="text-center px-6 py-8">
                  <div className="text-6xl mb-4 animate-bounce">🎯</div>
                  <h4 className="text-slate-300 text-xl font-semibold mb-2">
                    {weeklyPlan[selectedDay]?.isRestDay ? `${selectedDay} - Rest Day` : `Plan ${selectedDay} Workout`}
                  </h4>
                  <p className="text-slate-400 text-base mb-3 max-w-xs mx-auto leading-relaxed">
                    {weeklyPlan[selectedDay]?.isRestDay ? 'This is a rest day - no exercises planned' : 'Drag exercises here or tap the + button to add them'}
                  </p>
                  <div className="space-y-2">
                    <p className="text-slate-500 text-sm">
                      Build your Own Custom Workout Split
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                      <span className="text-base">💪</span>
                      <span className="font-medium">Professional</span>
                      <span className="text-base">💪</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {getCurrentDayExercises().map((exercise, index) => (
                  <div 
                    key={exercise.planId}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, exercise, 'split')}
                    onDragEnd={handleDragEnd}
                    className="group p-5 rounded-xl bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 border border-purple-700/50 cursor-grab active:cursor-grabbing transition-all duration-300 hover:from-purple-800/30 hover:via-blue-800/30 hover:to-indigo-800/30 hover:border-purple-600/70 hover:shadow-xl hover:shadow-purple-900/20 select-none transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <span className="text-purple-400 font-bold text-lg bg-gradient-to-r from-purple-900/60 to-blue-900/60 w-12 h-12 rounded-full flex items-center justify-center border border-purple-700/50 shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                          {index + 1}
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-white text-lg">
                            {exercise.name}
                          </h4>
                          <span className="text-xs bg-gradient-to-r from-purple-900/40 to-blue-900/40 text-purple-300 px-3 py-1 rounded-full border border-purple-700/50">
                            ✓ Added to Split
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700">
                            <span>🏅</span>
                            <span className="font-medium">{exercise.category}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-md border border-slate-700">
                            <span>🏋️</span>
                            <span className="font-medium">{exercise.sets}</span>
                          </span>
                          {exercise.difficulty && (
                            <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                              exercise.difficulty === 'beginner' ? 'bg-green-900/40 text-green-300 border-green-700/50' :
                              exercise.difficulty === 'intermediate' ? 'bg-yellow-900/40 text-yellow-300 border-yellow-700/50' :
                              'bg-red-900/40 text-red-300 border-red-700/50'
                            }`}>
                              {exercise.difficulty}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                            className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-base w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-transparent hover:border-slate-600 active:scale-95"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === getCurrentDayExercises().length - 1}
                            className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-base w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-700/50 transition-all duration-200 border border-transparent hover:border-slate-600 active:scale-95"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => removeFromSplit(exercise.planId)}
                          className="text-red-400 hover:text-red-300 text-xl font-bold w-9 h-9 flex items-center justify-center rounded-lg hover:bg-red-900/30 transition-all duration-200 border border-transparent hover:border-red-700/50 active:scale-95"
                        >
                          ×
                        </button>
                        <div className="text-slate-500 text-xl cursor-grab">
                          ⋮⋮
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomSplitBuilder;