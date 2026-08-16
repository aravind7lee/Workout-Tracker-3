import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dumbbell, Play, RefreshCw, Zap, Layers, Plus, Calendar, 
  ChevronRight, Award, Trash2, ArrowRight, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ACTIVE_SESSION_KEY = 'active_workout_session';

export default function StartWorkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeDraft, setActiveDraft] = useState(null);
  const [lastWorkout, setLastWorkout] = useState(null);
  const [plans, setPlans] = useState([]);
  const [freestyleTitle, setFreestyleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [repeatLoading, setRepeatLoading] = useState(false);

  useEffect(() => {
    // Check for active draft in localStorage
    const savedDraft = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed && Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
          setActiveDraft(parsed);
        }
      } catch (e) {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    }

    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch user's last workout for "Repeat Last Workout"
      try {
        const lastRes = await api.get('/workouts/last');
        if (lastRes.data?.success && lastRes.data?.workout) {
          setLastWorkout(lastRes.data.workout);
        }
      } catch (err) {
        // No previous workout found - expected for new users
      }

      // Fetch user's plans
      try {
        const plansRes = await api.get('/plans');
        if (plansRes.data?.success && Array.isArray(plansRes.data.plans)) {
          setPlans(plansRes.data.plans);
        }
      } catch (err) {
        console.warn('Failed to load plans:', err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResumeDraft = () => {
    navigate('/workout-session');
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setActiveDraft(null);
  };

  const handleStartFreestyle = () => {
    const title = freestyleTitle.trim() || 'Freestyle Workout';
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', { state: { defaultTitle: title } });
  };

  const handleRepeatLastWorkout = () => {
    if (!lastWorkout) return;
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', { state: { repeatWorkout: lastWorkout } });
  };

  const handleStartPlan = (plan) => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    navigate('/workout-session', { state: { workoutPlan: plan } });
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 pt-4">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-orange-500 font-semibold text-xs uppercase tracking-wider">
            <Zap className="w-4 h-4" /> Start Training
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Workout Session Launchpad</h1>
          <p className="text-sm text-neutral-400">
            Choose how you want to train today or resume your active workout session.
          </p>
        </div>

        {/* Active Draft Banner */}
        {activeDraft && (
          <div className="p-5 bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/40 rounded-3xl shadow-xl space-y-4 animate-slideDown">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-lg shadow-orange-500/30">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Active Session Draft</span>
                  <h3 className="text-lg font-black text-white">{activeDraft.title || 'In-Progress Workout'}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiscardDraft}
                  className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-xl transition-colors"
                  title="Discard Draft"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-300 pt-2 border-t border-orange-500/20">
              <span>{activeDraft.exercises?.length || 0} Exercises Logged</span>
              <button
                onClick={handleResumeDraft}
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all"
              >
                Resume Session <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Repeat Last Workout Quick Card */}
        {lastWorkout && (
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 hover:border-neutral-700 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neutral-800 text-orange-500 rounded-2xl">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-neutral-500 font-medium">Repeat Previous Workout</span>
                  <h3 className="text-xl font-bold text-white">{lastWorkout.title}</h3>
                  <span className="text-xs text-neutral-400">
                    Last completed: {new Date(lastWorkout.date || lastWorkout.createdAt).toLocaleDateString()} • {lastWorkout.exercises?.length || 0} Exercises
                  </span>
                </div>
              </div>

              <button
                onClick={handleRepeatLastWorkout}
                className="px-5 py-3 bg-neutral-800 hover:bg-orange-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 transition-all shadow-lg"
              >
                Repeat Workout <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Start Freestyle Workout Section */}
        <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-2xl">
              <Dumbbell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Freestyle Workout</h2>
              <p className="text-xs text-neutral-400">Start an empty session and add exercises on the fly.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              placeholder="e.g. Upper Body Blast, Leg Day, Chest & Arms..."
              value={freestyleTitle}
              onChange={(e) => setFreestyleTitle(e.target.value)}
              className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              onClick={handleStartFreestyle}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all"
            >
              Start Session <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>

        {/* Start Plan-Based Workout Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-bold text-white">Your Workout Plans</h2>
            </div>
            <button
              onClick={() => navigate('/plans')}
              className="text-xs text-orange-400 hover:underline font-semibold"
            >
              Manage Plans →
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-neutral-500">Loading your plans...</div>
          ) : plans.length === 0 ? (
            <div className="p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl text-center space-y-3">
              <p className="text-sm font-semibold text-neutral-400">No workout plans created yet</p>
              <button
                onClick={() => navigate('/plans')}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create First Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan._id || plan.id}
                  className="p-5 bg-neutral-900 border border-neutral-800 rounded-3xl flex flex-col justify-between space-y-4 hover:border-orange-500/40 transition-all shadow-lg"
                >
                  <div>
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
                      {plan.category || 'Workout Plan'}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{plan.name}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 mt-1">
                      {plan.description || `${plan.exercises?.length || 0} prescribed exercises`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80 text-xs">
                    <span className="text-neutral-500">{plan.exercises?.length || 0} Exercises</span>
                    <button
                      onClick={() => handleStartPlan(plan)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-md shadow-orange-500/20"
                    >
                      Start Plan <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
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
