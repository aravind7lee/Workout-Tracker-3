// frontend/src/pages/EditPlan.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { planService } from '../services/planService';
import { exerciseLibrary } from '../data/exerciseLibrary';

export default function EditPlan() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [planName, setPlanName] = useState('');
  const [planCategory, setPlanCategory] = useState('General');
  const [exercises, setExercises] = useState([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('chest');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverArea, setDragOverArea] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const currentMuscleGroup = exerciseLibrary[selectedMuscleGroup];
  const availableExercises = currentMuscleGroup.exercises;

  useEffect(() => {
    if (planId) {
      const loadedPlan = planService.getPlanById(planId);
      if (loadedPlan) {
        setPlan(loadedPlan);
        setPlanName(loadedPlan.name);
        setPlanCategory(loadedPlan.category);
        setExercises(loadedPlan.exercises.map((ex, index) => ({
          ...ex,
          planId: `plan-${index}-${Date.now()}`,
          originalId: ex.id || `ex-${index}`
        })));
      } else {
        navigate('/my-plans');
      }
    }
    setLoading(false);
  }, [planId, navigate]);

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

    if (source === 'library' && targetArea === 'plan') {
      const newPlanItem = {
        ...item,
        planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalId: item.id,
        category: currentMuscleGroup.name
      };
      setExercises(prev => [...prev, newPlanItem]);
    } else if (source === 'plan' && targetArea === 'library') {
      setExercises(prev => prev.filter(planItem => planItem.planId !== item.planId));
    }

    setDraggedItem(null);
  }, [draggedItem, currentMuscleGroup]);

  const addToPlan = useCallback((exercise) => {
    const newPlanItem = {
      ...exercise,
      planId: `plan-${Date.now()}-${Math.random()}`,
      originalId: exercise.id,
      category: currentMuscleGroup.name
    };
    setExercises(prev => [...prev, newPlanItem]);
  }, [currentMuscleGroup]);

  const removeFromPlan = useCallback((planId) => {
    setExercises(prev => prev.filter(item => item.planId !== planId));
  }, []);

  const moveUp = useCallback((index) => {
    if (index === 0) return;
    setExercises(prev => {
      const newExercises = [...prev];
      [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
      return newExercises;
    });
  }, []);

  const moveDown = useCallback((index) => {
    setExercises(prev => {
      if (index === prev.length - 1) return prev;
      const newExercises = [...prev];
      [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
      return newExercises;
    });
  }, []);

  const savePlan = async () => {
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }
    if (exercises.length === 0) {
      alert('Please add exercises to your plan');
      return;
    }
    
    setSaving(true);
    try {
      const updatedPlanData = {
        name: planName.trim(),
        exercises: exercises.map(exercise => ({
          name: exercise.name,
          category: exercise.category,
          sets: exercise.sets,
          type: exercise.type,
          difficulty: exercise.difficulty
        })),
        category: planCategory
      };
      
      planService.updatePlan(planId, updatedPlanData);
      alert(`Plan "${planName}" updated successfully!`);
      navigate('/my-plans');
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Failed to update plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading plan...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-white mb-4">Plan Not Found</h2>
        <p className="text-slate-400 mb-6">The plan you're trying to edit doesn't exist.</p>
        <button 
          onClick={() => navigate('/my-plans')}
          className="btn bg-blue-600 hover:bg-blue-700 text-white"
        >
          Back to My Plans
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">Edit Workout Plan</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="Enter plan name..."
            className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 text-sm sm:text-base"
          />
          <select
            value={planCategory}
            onChange={(e) => setPlanCategory(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-white text-sm sm:text-base"
          >
            <option value="General">General</option>
            <option value="Strength">Strength</option>
            <option value="Cardio">Cardio</option>
            <option value="Flexibility">Flexibility</option>
            <option value="HIIT">HIIT</option>
          </select>
          <button
            onClick={savePlan}
            disabled={saving}
            className="btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={() => navigate('/my-plans')}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 sm:p-4">
        <p className="text-blue-300 text-sm sm:text-base">
          ✏️ <strong>Editing:</strong> Add new exercises from the library or remove/reorder existing ones. Changes are saved when you click "Save Changes".
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Exercise Library */}
        <div 
          className={`card min-h-[300px] sm:min-h-[500px] transition-all duration-200 ${
            dragOverArea === 'library' ? 'bg-slate-700/50 border-slate-500 shadow-lg' : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, 'library')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'library')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <span>📚</span> Exercise Library
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${currentMuscleGroup.color}`}>
              {currentMuscleGroup.name}
            </span>
          </div>
          
          {/* Muscle Group Tabs */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
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
                <div className="truncate">{group.name}</div>
              </button>
            ))}
          </div>
          
          {/* Exercise List */}
          <div className="space-y-2 sm:space-y-3 max-h-80 overflow-y-auto exercise-scroll">
            {availableExercises.map((exercise) => (
              <div 
                key={exercise.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, { ...exercise, category: currentMuscleGroup.name }, 'library')}
                onDragEnd={handleDragEnd}
                className="p-3 sm:p-4 rounded-lg bg-slate-800/60 border border-slate-700 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-slate-700/60 hover:border-slate-600 hover:shadow-md select-none"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm sm:text-base">
                      {exercise.name}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                      <span>{exercise.sets}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        exercise.difficulty === 'beginner' ? 'bg-green-900/30 text-green-300' :
                        exercise.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-300' :
                        'bg-red-900/30 text-red-300'
                      }`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addToPlan({ ...exercise, category: currentMuscleGroup.name })}
                    className="text-blue-400 hover:text-blue-300 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-blue-900/20 transition-colors"
                    title="Add to plan"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Plan */}
        <div 
          className={`card min-h-[300px] sm:min-h-[500px] transition-all duration-200 ${
            dragOverArea === 'plan' 
              ? 'bg-green-900/30 border-green-400 shadow-xl ring-2 ring-green-400/50' 
              : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, 'plan')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'plan')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <span>✏️</span> Editing Plan
            </h3>
            <span className="text-xs sm:text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
              {exercises.length} {exercises.length === 1 ? 'exercise' : 'exercises'}
            </span>
          </div>
          
          {exercises.length === 0 ? (
            <div className="flex items-center justify-center h-32 sm:h-48 border-2 border-dashed border-slate-600 rounded-lg">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3">✏️</div>
                <p className="text-slate-400 text-sm sm:text-base font-medium">
                  Add exercises to edit your plan
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3 max-h-96 overflow-y-auto">
              {exercises.map((exercise, index) => (
                <div 
                  key={exercise.planId}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, exercise, 'plan')}
                  onDragEnd={handleDragEnd}
                  className="p-3 sm:p-4 rounded-lg bg-green-900/20 border border-green-700/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-green-800/20 hover:border-green-600/50 select-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-green-400 font-bold text-sm sm:text-base bg-green-900/30 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs sm:text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-white text-sm sm:text-base">
                          {exercise.name}
                        </div>
                        <div className="text-xs sm:text-sm text-slate-400">
                          {exercise.category} • {exercise.sets}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700/50 transition-colors"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === exercises.length - 1}
                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700/50 transition-colors"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeFromPlan(exercise.planId)}
                        className="text-red-400 hover:text-red-300 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-red-900/20 transition-colors ml-1"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}