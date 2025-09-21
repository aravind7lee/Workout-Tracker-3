// frontend/src/pages/MyPlans.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PlanDetailsModal from '../components/PlanDetailsModal';

export default function MyPlans() {
  const [savedPlans, setSavedPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    loadSavedPlans();
  }, []);

  const loadSavedPlans = () => {
    try {
      const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
      setSavedPlans(plans);
    } catch (error) {
      console.error('Error loading plans:', error);
      setSavedPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      const updatedPlans = savedPlans.filter(plan => plan.id !== planId);
      localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
      setSavedPlans(updatedPlans);
    }
  };

  const duplicatePlan = (plan) => {
    const newPlan = {
      ...plan,
      id: Date.now().toString(),
      name: `${plan.name} (Copy)`,
      createdAt: new Date().toISOString()
    };
    const updatedPlans = [...savedPlans, newPlan];
    localStorage.setItem('workoutPlans', JSON.stringify(updatedPlans));
    setSavedPlans(updatedPlans);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading your plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl lg:text-3xl font-semibold text-white">My Workout Plans</h2>
        <Link
          to="/plans"
          className="btn bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
        >
          <span>+</span> Create New Plan
        </Link>
      </div>

      {savedPlans.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-white mb-2">No Plans Yet</h3>
          <p className="text-slate-400 mb-6">
            You haven't created any workout plans yet. Start building your first plan!
          </p>
          <Link
            to="/plans"
            className="btn bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2"
          >
            <span>+</span> Create Your First Plan
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPlans.map((plan) => (
            <div key={plan.id} className="card hover:bg-slate-800/60 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
                  <p className="text-sm text-slate-400">
                    {plan.exercises.length} {plan.exercises.length === 1 ? 'exercise' : 'exercises'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => duplicatePlan(plan)}
                    className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-900/20 transition-colors"
                    title="Duplicate plan"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deletePlan(plan.id)}
                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20 transition-colors"
                    title="Delete plan"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {plan.exercises.slice(0, 3).map((exercise, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-blue-400 font-medium">{index + 1}.</span>
                    <span className="text-white">{exercise.name}</span>
                    <span className="text-slate-400">• {exercise.sets}</span>
                  </div>
                ))}
                {plan.exercises.length > 3 && (
                  <button
                    onClick={() => setSelectedPlan(plan)}
                    className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                  >
                    +{plan.exercises.length - 3} more exercises
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>Created: {new Date(plan.createdAt).toLocaleDateString()}</span>
                <span className="bg-slate-700/50 px-2 py-1 rounded">{plan.category || 'General'}</span>
              </div>

              <div className="flex gap-2">
                <Link
                  to={`/workout/${plan.id}`}
                  className="btn-secondary flex-1 text-sm text-center"
                >
                  Start Workout
                </Link>
                <Link
                  to={`/edit-plan/${plan.id}`}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white flex-1 text-sm text-center"
                >
                  Edit Plan
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {savedPlans.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-300 font-medium mb-2">💡 Pro Tips:</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Click "Start Workout" to begin tracking your exercises</li>
            <li>• Use "Edit Plan" to modify exercises and sets</li>
            <li>• Duplicate plans to create variations</li>
            <li>• Plans are saved locally on your device</li>
          </ul>
        </div>
      )}
      
      {/* Plan Details Modal */}
      {selectedPlan && (
        <PlanDetailsModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}