// frontend/src/components/AddToExistingPlanModal.jsx
import React, { useState, useEffect } from 'react';
import { planService } from '../services/planService';

export default function AddToExistingPlanModal({ exercise, onClose, onSave }) {
  const [existingPlans, setExistingPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const plans = planService.getAllPlans();
    setExistingPlans(plans);
    if (plans.length > 0) {
      setSelectedPlanId(plans[0].id);
    }
  }, []);

  const handleAddToExisting = async () => {
    if (!selectedPlanId) return;
    
    setSaving(true);
    try {
      const plan = planService.getPlanById(selectedPlanId);
      if (!plan) {
        throw new Error('Plan not found');
      }
      
      // Check if exercise already exists in plan
      const exerciseExists = plan.exercises.some(ex => ex.name === exercise.name);
      if (exerciseExists) {
        alert(`"${exercise.name}" is already in "${plan.name}"`);
        setSaving(false);
        return;
      }
      
      const newExercise = {
        id: `${exercise.id}-${Date.now()}`,
        name: exercise.name,
        category: exercise.category,
        sets: exercise.sets,
        type: exercise.type,
        difficulty: exercise.difficulty
      };
      
      const updatedPlan = {
        ...plan,
        exercises: [...plan.exercises, newExercise],
        updatedAt: new Date().toISOString()
      };
      
      const savedPlan = planService.updatePlan(selectedPlanId, updatedPlan);
      
      // Show success message with exercise and plan names
      alert(`✅ "${exercise.name}" added to "${plan.name}" successfully!`);
      
      onSave(savedPlan);
      onClose();
    } catch (error) {
      console.error('Error adding to plan:', error);
      alert('❌ Failed to add exercise to plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (existingPlans.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
        <div className="card max-w-md w-full" onClick={e => e.stopPropagation()}>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-white mb-2">No Plans Found</h3>
            <p className="text-slate-400 mb-6">You don't have any workout plans yet. Create your first plan to add exercises.</p>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button 
                onClick={() => {
                  onClose();
                  // This will trigger the QuickPlanModal instead
                  window.dispatchEvent(new CustomEvent('createNewPlan', { detail: exercise }));
                }}
                className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                Create New Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50" onClick={onClose}>
      <div className="card max-w-xs sm:max-w-md w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Choose Your Plan</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        
        <div className="space-y-4 overflow-y-auto">
          <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-slate-700/30 rounded-lg">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 ${exercise.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <span className="text-lg sm:text-xl">{exercise.icon}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium text-white text-sm sm:text-base truncate">{exercise.name}</div>
              <div className="text-xs sm:text-sm text-slate-400">{exercise.sets}</div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-3">Select Plan to Add Exercise</label>
            <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
              {existingPlans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-2 sm:p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPlanId === plan.id
                      ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-400/50'
                      : 'bg-slate-700/30 border-slate-600 hover:bg-slate-600/30 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">{plan.name}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        {plan.exercises.length} {plan.exercises.length === 1 ? 'exercise' : 'exercises'} • {plan.category}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2 ${
                      selectedPlanId === plan.id
                        ? 'border-blue-400 bg-blue-400'
                        : 'border-slate-500'
                    }`}>
                      {selectedPlanId === plan.id && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={onClose} className="btn-secondary flex-1 text-sm sm:text-base">Cancel</button>
            <button
              onClick={handleAddToExisting}
              disabled={saving || !selectedPlanId}
              className="btn bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? 'Adding...' : '✓ Add to Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}