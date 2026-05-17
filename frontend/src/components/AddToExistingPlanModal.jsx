// Add to Existing Plan Modal Component
import React, { useState, useEffect } from 'react';

const AddToExistingPlanModal = ({ exercise, onClose, onSave }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load existing plans
    const savedPlans = JSON.parse(localStorage.getItem('userPlans') || '[]');
    setPlans(savedPlans);
  }, []);

  const handleAddToPlan = async () => {
    if (!selectedPlan) return;
    
    setLoading(true);
    try {
      const savedPlans = JSON.parse(localStorage.getItem('userPlans') || '[]');
      const planIndex = savedPlans.findIndex(p => p.id.toString() === selectedPlan);
      
      if (planIndex !== -1) {
        // Check if exercise already exists in plan
        const exerciseExists = savedPlans[planIndex].exercises.some(ex => ex.id === exercise.id);
        
        if (!exerciseExists) {
          savedPlans[planIndex].exercises.push(exercise);
          savedPlans[planIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('userPlans', JSON.stringify(savedPlans));
          
          onSave(savedPlans[planIndex]);
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to add exercise to plan:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="card max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Add to Existing Plan</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-2xl">×</button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-neutral-900/50 rounded-lg">
            <div className={`w-10 h-10 ${exercise.color} rounded-lg flex items-center justify-center`}>
              <span className="text-xl">{exercise.icon}</span>
            </div>
            <div>
              <div className="font-medium text-white">{exercise.name}</div>
              <div className="text-sm text-neutral-400">{exercise.category}</div>
            </div>
          </div>
          
          {plans.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-neutral-400 mb-4">No existing plans found</div>
              <button
                onClick={onClose}
                className="btn bg-red-700 hover:bg-blue-700 text-white"
              >
                Create New Plan Instead
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Select Plan</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 text-white"
                >
                  <option value="">Choose a plan...</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} ({plan.exercises?.length || 0} exercises)
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="btn-secondary flex-1"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToPlan}
                  disabled={loading || !selectedPlan}
                  className="btn bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add to Plan'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddToExistingPlanModal;