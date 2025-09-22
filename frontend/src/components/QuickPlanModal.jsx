// frontend/src/components/QuickPlanModal.jsx
import React, { useState } from 'react';
import { planService } from '../services/planService';

export default function QuickPlanModal({ exercise, onClose, onSave }) {
  const [planName, setPlanName] = useState(`${exercise.category} Workout`);
  const [planCategory, setPlanCategory] = useState(exercise.category);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!planName.trim()) {
      alert('Please enter a plan name');
      return;
    }
    
    setSaving(true);
    try {
      const planData = {
        name: planName.trim(),
        exercises: [{
          id: `${exercise.id}-${Date.now()}`,
          name: exercise.name,
          category: exercise.category,
          sets: exercise.sets,
          type: exercise.type,
          difficulty: exercise.difficulty
        }],
        category: planCategory
      };
      
      const savedPlan = planService.savePlan(planData);
      
      // Show success message
      alert(`✅ Plan "${savedPlan.name}" created successfully with "${exercise.name}"!`);
      
      onSave(savedPlan);
      onClose();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('❌ Failed to save plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="card max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Create Quick Plan</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">×</button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
            <div className={`w-10 h-10 ${exercise.color} rounded-lg flex items-center justify-center`}>
              <span className="text-xl">{exercise.icon}</span>
            </div>
            <div>
              <div className="font-medium text-white">{exercise.name}</div>
              <div className="text-sm text-slate-400">{exercise.sets}</div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Plan Name</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white"
              placeholder="Enter plan name..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-slate-300 mb-2">Category</label>
            <select
              value={planCategory}
              onChange={(e) => setPlanCategory(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white"
            >
              <option value="Chest">Chest</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Back">Back</option>
              <option value="Arms">Arms</option>
              <option value="Legs">Legs</option>
              <option value="Abdominals">Abdominals</option>
              <option value="General">General</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleSave}
              disabled={saving || !planName.trim()}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}