import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { exerciseLibrary } from '../data/exerciseLibrary';
import { useAuth } from '../context/AuthContext';
import { 
  Dumbbell, 
  Save, 
  ArrowLeft, 
  Target, 
  ChevronUp,
  ChevronDown,
  Trash2
} from 'lucide-react';

const EditSplit = () => {
  const navigate = useNavigate();
  const { splitId } = useParams();
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
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverArea, setDragOverArea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('live');
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const currentMuscleGroup = exerciseLibrary[selectedMuscleGroup];
  const exercises = currentMuscleGroup.exercises;

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

  // Load split data for editing
  useEffect(() => {
    if (!splitId) {
      navigate('/your-workout-splits');
      return;
    }

    try {
      const customSplits = JSON.parse(localStorage.getItem('custom_workout_splits') || '[]');
      const splitToEdit = customSplits.find(split => split.id.toString() === splitId);
      
      if (!splitToEdit) {
        alert('Split not found!');
        navigate('/your-workout-splits');
        return;
      }

      // Load split data
      setSplitName(splitToEdit.name);
      setSplitDescription(splitToEdit.description || '');
      
      // Load weekly schedule if available
      if (splitToEdit.weeklySchedule) {
        const newWeeklyPlan = { ...weeklyPlan };
        Object.keys(splitToEdit.weeklySchedule).forEach(day => {
          if (newWeeklyPlan[day]) {
            const dayWorkout = splitToEdit.weeklySchedule[day];
            if (dayWorkout === 'Rest Day') {
              newWeeklyPlan[day] = { exercises: [], isRestDay: true };
            } else {
              // Parse exercises from the day's workout
              const exercises = splitToEdit.exercises?.filter(ex => ex.day === day) || [];
              const mappedExercises = exercises.map((ex, index) => ({
                id: ex.id || `edit-${index}`,
                name: ex.name,
                category: ex.category || ex.muscle || 'General',
                sets: ex.sets || '3x10-12',
                type: ex.type || 'compound',
                difficulty: ex.difficulty || 'intermediate',
                planId: `edit-${Date.now()}-${index}`,
                originalId: ex.id || `edit-${index}`,
                day: day
              }));
              newWeeklyPlan[day] = { exercises: mappedExercises, isRestDay: false };
            }
          }
        });
        setWeeklyPlan(newWeeklyPlan);
      } else {
        // Fallback for old format - distribute exercises across days
        const mappedExercises = splitToEdit.exercises?.map((ex, index) => ({
          id: ex.id || `edit-${index}`,
          name: ex.name,
          category: ex.category || ex.muscle || 'General',
          sets: ex.sets || '3x10-12',
          type: ex.type || 'compound',
          difficulty: ex.difficulty || 'intermediate',
          planId: `edit-${Date.now()}-${index}`,
          originalId: ex.id || `edit-${index}`,
          day: ex.day || 'Monday'
        })) || [];
        
        const newWeeklyPlan = { ...weeklyPlan };
        mappedExercises.forEach(exercise => {
          const day = exercise.day || 'Monday';
          if (newWeeklyPlan[day]) {
            newWeeklyPlan[day].exercises.push(exercise);
          }
        });
        setWeeklyPlan(newWeeklyPlan);
      }
      
      setLoading(false);
      console.log('✅ Split loaded for editing:', splitToEdit.name);
    } catch (error) {
      console.error('Error loading split:', error);
      alert('Error loading split for editing');
      navigate('/your-workout-splits');
    }
  }, [splitId, navigate]);

  const handleDragStart = useCallback((e, item, source) => {
    setDraggedItem({ item, source });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, source }));
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
  }, [draggedItem, selectedDay]);

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

  const updateSplit = async () => {
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
      const updatedSplit = {
        id: parseInt(splitId),
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
        updatedAt: new Date().toISOString()
      };
      
      // Update in localStorage
      const existingCustomSplits = JSON.parse(localStorage.getItem('custom_workout_splits') || '[]');
      const updatedSplits = existingCustomSplits.map(split => 
        split.id.toString() === splitId ? { ...split, ...updatedSplit } : split
      );
      localStorage.setItem('custom_workout_splits', JSON.stringify(updatedSplits));
      
      setSyncStatus('synced');
      
      // Dispatch real-time event
      window.dispatchEvent(new CustomEvent('customSplitCreated', {
        detail: { split: updatedSplit }
      }));
      
      alert(`🚀 SPLIT UPDATED!\n\n✅ "${splitName}" updated successfully\n💪 ${getTotalExercises()} exercises included\n⚡ Changes saved!`);
      
      // Navigate back to Your WorkoutSplits
      navigate('/your-workout-splits');
      
    } catch (error) {
      console.error('Error updating split:', error);
      setSyncStatus('error');
      alert('Failed to update split. Please try again.');
    } finally {
      setSaving(false);
      setTimeout(() => setSyncStatus('live'), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div>Loading Split...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-950 via-black to-gray-950 border-b border-orange-500/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => navigate('/your-workout-splits')}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base truncate">Back to Your WorkoutSplits</span>
              </button>
              <div className="h-4 sm:h-6 w-px bg-gray-700"></div>
              <h1 className="text-base sm:text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent truncate">
                Edit Workout Split
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Form Controls */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-semibold mb-3 sm:mb-4 text-white">🔄 EDITING WORKOUT SPLIT 🏋️</h2>
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
            <p className="text-blue-300 text-xs sm:text-sm">✅ Edit mode active - You are editing an existing split</p>
          </div>
          
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
                onClick={updateSplit}
                disabled={saving || !splitName.trim() || getTotalExercises() === 0}
                className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50 rounded-lg font-medium text-sm sm:text-base"
              >
                {saving ? '🔄 Updating...' : '💾 Update Split'}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-6">
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
            
            {/* Day Selection Tabs */}
            <div className="mb-3 sm:mb-4">
              <h4 className="text-xs sm:text-sm font-medium text-white mb-2">📅 Select Day</h4>
              <div className="grid grid-cols-7 gap-1">
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`p-1 sm:p-2 rounded-lg text-xs font-medium transition-all ${
                      selectedDay === day
                        ? 'bg-orange-600 text-white shadow-lg'
                        : weeklyPlan[day]?.isRestDay
                        ? 'bg-gray-600 text-gray-300'
                        : (weeklyPlan[day]?.exercises?.length || 0) > 0
                        ? 'bg-green-600/30 text-green-300 border border-green-500/50'
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <div className="truncate text-xs">{day.slice(0, 3)}</div>
                    <div className="text-xs mt-1">
                      {weeklyPlan[day]?.isRestDay ? '😴' : (weeklyPlan[day]?.exercises?.length || 0) > 0 ? '💪' : '⚪'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Rest Day Toggle */}
            <div className="mb-3 sm:mb-4">
              <button
                onClick={toggleRestDay}
                className={`w-full p-2 sm:p-3 rounded-lg font-medium transition-all text-sm sm:text-base ${
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
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-2 mb-3 sm:mb-4">
                {Object.entries(exerciseLibrary).map(([key, group]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedMuscleGroup(key)}
                    className={`p-2 sm:p-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      selectedMuscleGroup === key
                        ? `${group.color} text-white shadow-lg`
                        : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                    }`}
                  >
                    <div className="text-lg sm:text-xl mb-1">{group.icon}</div>
                    <div className="truncate text-xs">{group.name}</div>
                  </button>
                ))}
              </div>
            )}
            
            {/* Exercise List */}
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
                      className={`p-3 sm:p-4 rounded-lg border cursor-grab active:cursor-grabbing transition-all duration-200 select-none transform hover:scale-[1.01] sm:hover:scale-[1.02] ${
                        isInSplit 
                          ? 'bg-green-900/30 border-green-700 shadow-green-900/20 shadow-lg' 
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 hover:border-slate-600 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-white text-sm sm:text-base truncate">{exercise.name}</div>
                            {isInSplit && (
                              <span className="text-green-400 text-xs bg-green-900/30 px-2 py-1 rounded-full border border-green-700 flex-shrink-0">
                                ✓ Added
                              </span>
                            )}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                            <span className="flex items-center gap-1">
                              <span>🏋️</span>
                              <span>{exercise.sets}</span>
                            </span>
                            <span className={`px-1 sm:px-2 py-1 rounded text-xs border ${
                              exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300 border-green-700' :
                              exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700' :
                              'bg-red-900/30 text-red-300 border-red-700'
                            }`}>
                              {exercise.difficulty}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => addToSplit({ ...exercise, category: currentMuscleGroup.name })}
                          disabled={isInSplit}
                          className={`text-base sm:text-lg font-bold w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0 ${
                            isInSplit 
                              ? 'text-green-400 bg-green-900/30 border border-green-700 cursor-not-allowed' 
                              : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 border border-transparent hover:border-blue-700'
                          }`}
                        >
                          {isInSplit ? '✓' : '+'}
                        </button>
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

          {/* Split Plan */}
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
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl animate-pulse">🎯</span> 
                <span className="bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                  Editing Your Split
                </span>
              </h3>
              <span className="text-sm font-medium text-slate-300 bg-slate-700/60 px-3 py-2 rounded-full border border-slate-600 shadow-sm">
                <span className="text-blue-400 mr-1">📊</span>
                {getCurrentDayExercises().length} {getCurrentDayExercises().length === 1 ? 'exercise' : 'exercises'} today
              </span>
            </div>
            
            {getCurrentDayExercises().length === 0 ? (
              <div className="flex items-center justify-center min-h-[300px] border-2 border-dashed border-slate-600 rounded-xl">
                <div className="text-center px-6 py-8">
                  <div className="text-6xl mb-4 animate-bounce">🎯</div>
                  <h4 className="text-slate-300 text-xl font-semibold mb-2">
                    {weeklyPlan[selectedDay]?.isRestDay ? `${selectedDay} - Rest Day` : `Plan ${selectedDay} Workout`}
                  </h4>
                  <p className="text-slate-400 text-base mb-3">
                    {weeklyPlan[selectedDay]?.isRestDay ? 'This is a rest day - no exercises planned' : 'Drag exercises here or tap the + button to add them'}
                  </p>
                  <div className="space-y-3">
                    <p className="text-slate-500 text-sm">
                      Edit Your Custom Workout Split
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-sm mx-auto">
                      {Object.entries(muscleGroupMapping).map(([name, config]) => (
                        <div key={name} className="text-center p-2 bg-slate-800/30 rounded-lg border border-slate-700">
                          <div className="text-base sm:text-lg mb-1">{config.icon}</div>
                          <div className="text-xs text-slate-400">{name}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 max-h-[500px] sm:max-h-[600px] overflow-y-auto">
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
                              <span className="text-xl sm:text-2xl">{config.icon}</span>
                              <div>
                                <h4 className="text-white font-semibold text-base sm:text-lg">{muscleGroup}</h4>
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
                                className="group p-3 sm:p-4 rounded-lg bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60 border border-slate-600/50 transition-all duration-300 hover:shadow-lg select-none"
                              >
                                <div className="flex items-center gap-2 sm:gap-4">
                                  <div className="flex-shrink-0">
                                    <span className={`text-white font-bold text-xs sm:text-sm ${config.color} bg-opacity-80 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border border-slate-600`}>
                                      {exerciseIndex + 1}
                                    </span>
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h5 className="font-medium text-white text-sm sm:text-base truncate">
                                        {exercise.name}
                                      </h5>
                                      <span className="text-xs bg-slate-700/60 text-slate-300 px-2 py-1 rounded-md border border-slate-600 flex-shrink-0">
                                        ✓ In Split
                                      </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-400">
                                      <span className="flex items-center gap-1 bg-slate-700/40 px-1 sm:px-2 py-1 rounded border border-slate-600">
                                        <span>🏋️</span>
                                        <span>{exercise.sets}</span>
                                      </span>
                                      {exercise.difficulty && (
                                        <span className={`px-1 sm:px-2 py-1 rounded text-xs border ${
                                          exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300 border-green-700/50' :
                                          exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50' :
                                          'bg-red-900/30 text-red-300 border-red-700/50'
                                        }`}>
                                          {exercise.difficulty}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => moveUp(globalIndex)}
                                      disabled={globalIndex === 0}
                                      className="text-slate-400 hover:text-white disabled:opacity-30 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-slate-600/50 transition-all"
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => moveDown(globalIndex)}
                                      disabled={globalIndex === getCurrentDayExercises().length - 1}
                                      className="text-slate-400 hover:text-white disabled:opacity-30 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-slate-600/50 transition-all"
                                    >
                                      <ChevronDown className="w-3 h-3" />
                                    </button>
                                    <button
                                      onClick={() => removeFromSplit(exercise.planId)}
                                      className="text-red-400 hover:text-red-300 w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded hover:bg-red-900/30 transition-all"
                                    >
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </button>
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

export default EditSplit;