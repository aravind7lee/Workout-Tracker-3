// frontend/src/pages/PlansBuilder.jsx
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { planService } from '../services/planService';
import { exerciseLibrary } from '../data/exerciseLibrary';

export default function PlansBuilder() {
  const navigate = useNavigate();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('chest');
  const [plan, setPlan] = useState([]);
  const [planName, setPlanName] = useState('');
  const [planCategory, setPlanCategory] = useState('General');
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverArea, setDragOverArea] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const currentMuscleGroup = exerciseLibrary[selectedMuscleGroup];
  const exercises = currentMuscleGroup.exercises;

  const handleDragStart = useCallback((e, item, source) => {
    console.log('Drag started:', item.name, 'from', source);
    setDraggedItem({ item, source });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ item, source }));
    
    // Add visual feedback
    setTimeout(() => {
      e.target.style.opacity = '0.5';
      e.target.style.transform = 'rotate(5deg)';
    }, 0);
  }, []);

  const handleDragEnd = useCallback((e) => {
    console.log('Drag ended');
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
    console.log('Drag enter:', area);
    setDragOverArea(area);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    // Only clear if we're leaving the drop zone completely
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
    console.log('Drop in:', targetArea);
    
    setDragOverArea(null);

    let dragData;
    try {
      dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    } catch (error) {
      dragData = draggedItem;
    }

    if (!dragData) {
      console.log('No drag data available');
      return;
    }

    const { item, source } = dragData;
    console.log('Processing drop:', item.name, 'from', source, 'to', targetArea);

    if (source === 'library' && targetArea === 'plan') {
      const newPlanItem = {
        ...item,
        planId: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        originalId: item.id
      };
      setPlan(prev => {
        console.log('Adding to plan:', newPlanItem.name);
        return [...prev, newPlanItem];
      });
    } else if (source === 'plan' && targetArea === 'library') {
      setPlan(prev => {
        console.log('Removing from plan:', item.name);
        return prev.filter(planItem => planItem.planId !== item.planId);
      });
    } else if (source === 'plan' && targetArea === 'plan') {
      // Reordering within plan - for now just keep it in place
      console.log('Reordering within plan');
    }

    setDraggedItem(null);
  }, [draggedItem]);

  const addToPlan = useCallback((exercise) => {
    const newPlanItem = {
      ...exercise,
      planId: `plan-${Date.now()}-${Math.random()}`,
      originalId: exercise.id
    };
    setPlan(prev => [...prev, newPlanItem]);
  }, []);

  const removeFromPlan = useCallback((planId) => {
    setPlan(prev => prev.filter(item => item.planId !== planId));
  }, []);

  const moveUp = useCallback((index) => {
    if (index === 0) return;
    setPlan(prev => {
      const newPlan = [...prev];
      [newPlan[index - 1], newPlan[index]] = [newPlan[index], newPlan[index - 1]];
      return newPlan;
    });
  }, []);

  const moveDown = useCallback((index) => {
    setPlan(prev => {
      if (index === prev.length - 1) return prev;
      const newPlan = [...prev];
      [newPlan[index], newPlan[index + 1]] = [newPlan[index + 1], newPlan[index]];
      return newPlan;
    });
  }, []);

  const savePlan = async () => {
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }
    if (plan.length === 0) {
      alert('Please add exercises to your plan');
      return;
    }
    
    setSaving(true);
    try {
      const planData = {
        name: planName.trim(),
        exercises: plan.map(exercise => ({
          name: exercise.name,
          category: exercise.category,
          sets: exercise.sets
        })),
        category: planCategory
      };
      
      const savedPlan = planService.savePlan(planData);
      console.log('Plan saved successfully:', savedPlan);
      
      // Show success message and redirect
      alert(`Plan "${planName}" saved successfully!`);
      
      // Reset form
      setPlanName('');
      setPlan([]);
      setPlanCategory('General');
      
      // Navigate to My Plans page
      navigate('/my-plans');
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-white">Workout Plan Builder</h2>
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
            className="btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Plan'}
          </button>
        </div>
      </div>

      {/* Muscle Group Info */}
      <div className={`border rounded-lg p-3 sm:p-4 ${currentMuscleGroup.color}/20 border-${currentMuscleGroup.color.split('-')[1]}-500/30`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{currentMuscleGroup.icon}</span>
              <h4 className="text-lg font-semibold text-white">{currentMuscleGroup.name} Workout Tips</h4>
            </div>
            <div className="text-sm text-slate-300 space-y-1">
              {selectedMuscleGroup === 'chest' && (
                <>
                  <p>• Start with compound movements (Bench Press, Dips)</p>
                  <p>• Focus on full range of motion for better muscle activation</p>
                  <p>• Include both incline and decline angles for complete development</p>
                </>
              )}
              {selectedMuscleGroup === 'shoulders' && (
                <>
                  <p>• Warm up thoroughly - shoulders are injury-prone</p>
                  <p>• Train all three heads: anterior, medial, posterior</p>
                  <p>• Use lighter weights with perfect form</p>
                </>
              )}
              {selectedMuscleGroup === 'back' && (
                <>
                  <p>• Focus on pulling with your back, not your arms</p>
                  <p>• Include both vertical and horizontal pulling movements</p>
                  <p>• Squeeze shoulder blades together at the top</p>
                </>
              )}
              {selectedMuscleGroup === 'arms' && (
                <>
                  <p>• Train biceps and triceps with equal volume</p>
                  <p>• Use full range of motion for maximum growth</p>
                  <p>• Don't neglect compound movements</p>
                </>
              )}
              {selectedMuscleGroup === 'legs' && (
                <>
                  <p>• Squat and deadlift are essential compound movements</p>
                  <p>• Don't skip leg day - legs are your largest muscle group</p>
                  <p>• Include unilateral exercises for balance</p>
                </>
              )}
              {selectedMuscleGroup === 'abs' && (
                <>
                  <p>• Quality over quantity - focus on controlled movements</p>
                  <p>• Train abs 2-3 times per week for best results</p>
                  <p>• Include isometric holds like planks</p>
                </>
              )}
            </div>
            {draggedItem && (
              <div className="mt-3 text-green-300 text-sm animate-pulse">
                🎯 Dragging: <strong>{draggedItem.item.name}</strong> - Drop in the plan area!
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/my-plans')}
            className="btn-secondary text-sm whitespace-nowrap"
          >
            📋 View My Plans
          </button>
        </div>
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
          data-drop-zone="library"
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
            {exercises.map((exercise) => (
              <div 
                key={exercise.id}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, { ...exercise, category: currentMuscleGroup.name }, 'library')}
                onDragEnd={handleDragEnd}
                className="p-3 sm:p-4 rounded-lg bg-slate-800/60 border border-slate-700 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-slate-700/60 hover:border-slate-600 hover:shadow-md select-none"
                data-exercise-id={exercise.id}
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
                      <span className="text-slate-500">{exercise.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToPlan({ ...exercise, category: currentMuscleGroup.name })}
                      className="text-blue-400 hover:text-blue-300 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-blue-900/20 transition-colors"
                      title="Add to plan"
                    >
                      +
                    </button>
                    <div className="text-slate-500 text-lg sm:text-xl ml-2">
                      ⋮⋮
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Workout Plan */}
        <div 
          className={`card min-h-[300px] sm:min-h-[400px] transition-all duration-200 ${
            dragOverArea === 'plan' 
              ? 'bg-green-900/30 border-green-400 shadow-xl ring-2 ring-green-400/50' 
              : ''
          }`}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, 'plan')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'plan')}
          data-drop-zone="plan"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <span>🎯</span> Your Workout Plan
            </h3>
            <span className="text-xs sm:text-sm text-slate-400 bg-slate-700/50 px-3 py-1 rounded-full">
              {plan.length} {plan.length === 1 ? 'exercise' : 'exercises'}
            </span>
          </div>
          
          {plan.length === 0 ? (
            <div className="flex items-center justify-center h-32 sm:h-48 border-2 border-dashed border-slate-600 rounded-lg transition-colors hover:border-slate-500">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl mb-3">🎯</div>
                <p className="text-slate-400 text-sm sm:text-base font-medium">
                  Drag exercises here or use + button
                </p>
                <p className="text-slate-500 text-xs sm:text-sm mt-1">
                  Build your custom workout plan
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-3">
              {plan.map((exercise, index) => (
                <div 
                  key={exercise.planId}
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, exercise, 'plan')}
                  onDragEnd={handleDragEnd}
                  className="p-3 sm:p-4 rounded-lg bg-green-900/20 border border-green-700/50 cursor-grab active:cursor-grabbing transition-all duration-200 hover:bg-green-800/20 hover:border-green-600/50 hover:shadow-md select-none"
                  data-plan-id={exercise.planId}
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
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === plan.length - 1}
                        className="text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed text-sm w-6 h-6 flex items-center justify-center rounded hover:bg-slate-700/50 transition-colors"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeFromPlan(exercise.planId)}
                        className="text-red-400 hover:text-red-300 text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-red-900/20 transition-colors ml-1"
                        title="Remove from plan"
                      >
                        ×
                      </button>
                      <div className="text-slate-500 text-lg sm:text-xl ml-2">
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
  );
}
