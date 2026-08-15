import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Dumbbell, Play, Pause, Square, Plus, Trash2, ChevronUp, ChevronDown, 
  Check, Clock, Award, History, AlertCircle, Save, ArrowLeft, RefreshCw,
  Info, CheckCircle2, Flame, Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import api from '../utils/api';
import ExercisePickerModal from '../components/ExercisePickerModal';
import RestTimerFloatingBar from '../components/RestTimerFloatingBar';

const ACTIVE_DRAFT_KEY = 'active_workout_draft';

export default function WorkoutSession() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { triggerUpdate } = useRealTime();

  // Session state
  const [workoutTitle, setWorkoutTitle] = useState('Workout Session');
  const [exercises, setExercises] = useState([]);
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Timer & Controls
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UI Modals & Widgets
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [activeRestTimer, setActiveRestTimer] = useState(null); // { seconds: number }

  // Previous performance cache per exercise: { [exerciseName]: { date, sets: [] } }
  const [previousPerformanceMap, setPreviousPerformanceMap] = useState({});

  // 1. Initialize Workout Session (Draft recovery, Plan, Repeat, or Freestyle)
  useEffect(() => {
    const initSession = async () => {
      // Check for saved active draft in localStorage first
      const savedDraft = localStorage.getItem(ACTIVE_DRAFT_KEY);
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed && Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
            setWorkoutTitle(parsed.title || 'Workout Session');
            setExercises(parsed.exercises);
            setNotes(parsed.notes || '');
            setIsPublic(Boolean(parsed.isPublic));
            setStartedAt(parsed.startedAt ? new Date(parsed.startedAt) : new Date());
            
            // Calculate elapsed seconds since start
            const startMs = parsed.startedAt ? new Date(parsed.startedAt).getTime() : Date.now();
            const nowMs = Date.now();
            const durationSoFar = Math.max(0, Math.floor((nowMs - startMs) / 1000));
            setElapsedSeconds(parsed.elapsedSeconds ? Math.max(parsed.elapsedSeconds, durationSoFar) : durationSoFar);
            
            // Fetch previous performance for restored exercises
            parsed.exercises.forEach(ex => fetchPreviousPerformance(ex.exerciseName));
            return;
          }
        } catch (e) {
          console.warn('Failed to parse active draft, clearing invalid data');
          localStorage.removeItem(ACTIVE_DRAFT_KEY);
        }
      }

      // Check if location state passed a workout or plan
      const state = location.state || {};

      if (state.repeatWorkout) {
        const rw = state.repeatWorkout;
        setWorkoutTitle(rw.title ? `${rw.title} (Repeat)` : 'Repeated Workout');
        const resetExercises = (rw.exercises || []).map((ex, exIdx) => ({
          id: `ex_${Date.now()}_${exIdx}`,
          exerciseId: ex.exercise?._id || ex.exercise || null,
          exerciseName: ex.exerciseName || ex.name || 'Exercise',
          notes: ex.notes || '',
          sets: (ex.sets || []).map((s, sIdx) => ({
            id: `set_${Date.now()}_${exIdx}_${sIdx}`,
            setNumber: sIdx + 1,
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 0,
            completed: false
          }))
        }));
        setExercises(resetExercises);
        setStartedAt(new Date());
        resetExercises.forEach(ex => fetchPreviousPerformance(ex.exerciseName));
        return;
      }

      if (state.workoutPlan || planId) {
        const planObj = state.workoutPlan;
        if (planObj) {
          setWorkoutTitle(planObj.name || 'Plan Workout');
          const planExercises = (planObj.exercises || []).map((ex, exIdx) => ({
            id: `ex_${Date.now()}_${exIdx}`,
            exerciseId: ex._id || ex.id || null,
            exerciseName: ex.name || 'Exercise',
            notes: ex.notes || '',
            sets: Array.from({ length: parseInt(ex.sets, 10) || 3 }).map((_, sIdx) => ({
              id: `set_${Date.now()}_${exIdx}_${sIdx}`,
              setNumber: sIdx + 1,
              weight: parseFloat(ex.weight) || 0,
              reps: parseInt(ex.reps, 10) || 10,
              completed: false
            }))
          }));
          setExercises(planExercises);
          setStartedAt(new Date());
          planExercises.forEach(ex => fetchPreviousPerformance(ex.exerciseName));
          return;
        } else if (planId) {
          try {
            const res = await api.get(`/plans/${planId}`);
            if (res.data?.success && res.data?.plan) {
              const p = res.data.plan;
              setWorkoutTitle(p.name);
              const pExercises = (p.exercises || []).map((ex, exIdx) => ({
                id: `ex_${Date.now()}_${exIdx}`,
                exerciseId: ex._id || null,
                exerciseName: ex.name,
                notes: ex.notes || '',
                sets: Array.from({ length: parseInt(ex.sets, 10) || 3 }).map((_, sIdx) => ({
                  id: `set_${Date.now()}_${exIdx}_${sIdx}`,
                  setNumber: sIdx + 1,
                  weight: parseFloat(ex.weight) || 0,
                  reps: parseInt(ex.reps, 10) || 10,
                  completed: false
                }))
              }));
              setExercises(pExercises);
              setStartedAt(new Date());
              pExercises.forEach(ex => fetchPreviousPerformance(ex.exerciseName));
              return;
            }
          } catch (err) {
            console.error('Failed to load plan for workout session:', err);
          }
        }
      }

      // Default Freestyle Workout
      setWorkoutTitle(state.defaultTitle || 'Freestyle Workout');
      setStartedAt(new Date());
    };

    initSession();
  }, [planId, location.state]);

  // 2. Active Session Timer Effect
  useEffect(() => {
    if (isPaused || !startedAt) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, startedAt]);

  // 3. Auto-save session draft to localStorage
  useEffect(() => {
    if (exercises.length === 0 && !notes) return;

    const draft = {
      title: workoutTitle,
      exercises,
      notes,
      isPublic,
      startedAt: startedAt ? startedAt.toISOString() : new Date().toISOString(),
      elapsedSeconds
    };

    try {
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(draft));
    } catch (e) {
      console.warn('Failed to save draft to localStorage:', e);
    }
  }, [workoutTitle, exercises, notes, isPublic, startedAt, elapsedSeconds]);

  // Fetch real previous performance from MongoDB API
  const fetchPreviousPerformance = async (exerciseName) => {
    if (!exerciseName || previousPerformanceMap[exerciseName]) return;
    try {
      const res = await api.get(`/workouts/previous-performance/${encodeURIComponent(exerciseName)}`);
      if (res.data?.success && res.data?.performance) {
        setPreviousPerformanceMap(prev => ({
          ...prev,
          [exerciseName]: res.data.performance
        }));
      }
    } catch (err) {
      console.warn(`Could not fetch previous performance for ${exerciseName}:`, err.message);
    }
  };

  // Add Exercise from Picker Modal
  const handleAddExercise = (selectedEx) => {
    const newEx = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: selectedEx.id || null,
      exerciseName: selectedEx.name,
      category: selectedEx.categoryName || selectedEx.category,
      notes: '',
      sets: [
        { id: `set_${Date.now()}_1`, setNumber: 1, weight: 0, reps: 10, completed: false },
        { id: `set_${Date.now()}_2`, setNumber: 2, weight: 0, reps: 10, completed: false },
        { id: `set_${Date.now()}_3`, setNumber: 3, weight: 0, reps: 10, completed: false }
      ]
    };

    setExercises(prev => [...prev, newEx]);
    setIsPickerOpen(false);
    fetchPreviousPerformance(selectedEx.name);
  };

  // Exercise manipulation handlers
  const handleRemoveExercise = (exId) => {
    setExercises(prev => prev.filter(ex => ex.id !== exId));
  };

  const handleMoveExercise = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= exercises.length) return;
    setExercises(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
  };

  // Sets manipulation handlers
  const handleAddSet = (exId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSetNumber = ex.sets.length + 1;
      const newSet = {
        id: `set_${Date.now()}_${newSetNumber}`,
        setNumber: newSetNumber,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 10,
        completed: false
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    }));
  };

  const handleRemoveSet = (exId, setIdx) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const updatedSets = ex.sets.filter((_, idx) => idx !== setIdx).map((s, idx) => ({
        ...s,
        setNumber: idx + 1
      }));
      return { ...ex, sets: updatedSets };
    }));
  };

  const handleUpdateSet = (exId, setIdx, field, value) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const updatedSets = ex.sets.map((s, idx) => {
        if (idx !== setIdx) return s;
        return {
          ...s,
          [field]: Math.max(0, field === 'weight' ? parseFloat(value) || 0 : parseInt(value, 10) || 0)
        };
      });
      return { ...ex, sets: updatedSets };
    }));
  };

  const handleToggleSetComplete = (exId, setIdx) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const updatedSets = ex.sets.map((s, idx) => {
        if (idx !== setIdx) return s;
        const nowCompleted = !s.completed;
        // Trigger rest timer if set was completed
        if (nowCompleted) {
          setActiveRestTimer({ seconds: s.rest || 60 });
        }
        return { ...s, completed: nowCompleted };
      });
      return { ...ex, sets: updatedSets };
    }));
  };

  // Quick weight/rep adjustments
  const adjustSetField = (exId, setIdx, field, delta) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const updatedSets = ex.sets.map((s, idx) => {
        if (idx !== setIdx) return s;
        const currentVal = Number(s[field]) || 0;
        return { ...s, [field]: Math.max(0, Math.round((currentVal + delta) * 100) / 100) };
      });
      return { ...ex, sets: updatedSets };
    }));
  };

  // Derived metrics
  const totalVolume = exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((exSum, set) => {
      return set.completed ? exSum + (set.weight * set.reps) : exSum;
    }, 0);
  }, 0);

  const completedSetsCount = exercises.reduce((sum, ex) => {
    return sum + ex.sets.filter(s => s.completed).length;
  }, 0);

  const totalSetsCount = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Submit Workout Completion to MongoDB
  const handleCompleteWorkout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      // Estimate calories burned (~7 calories per minute of weight training + bonus per set)
      const estimatedCalories = Math.round(durationMinutes * 7 + completedSetsCount * 5);

      const payload = {
        title: workoutTitle.trim() || 'Workout Session',
        status: 'completed',
        durationMinutes,
        calories: estimatedCalories,
        isPublic,
        startedAt: startedAt ? startedAt.toISOString() : new Date().toISOString(),
        exercises: exercises.map(ex => ({
          exercise: ex.exerciseId,
          exerciseName: ex.exerciseName,
          notes: ex.notes || '',
          sets: ex.sets.map(s => ({
            reps: s.reps,
            weight: s.weight,
            rest: 60
          }))
        }))
      };

      console.log('💾 Persisting completed workout to MongoDB Atlas:', payload);
      const res = await api.post('/workouts', payload);

      if (res.data?.success || res.status === 201) {
        // Clear active draft from localStorage
        localStorage.removeItem(ACTIVE_DRAFT_KEY);

        // Dispatch completion event for app-wide UI sync
        window.dispatchEvent(new CustomEvent('workoutCompleted', {
          detail: res.data?.workout || payload
        }));

        triggerUpdate();

        const createdWorkoutId = res.data?.workout?._id || res.data?.workout?.id;
        setShowSummaryModal(false);

        if (createdWorkoutId) {
          navigate(`/workout-details/${createdWorkoutId}`, {
            state: { message: '🎉 Workout completed and saved to MongoDB!' }
          });
        } else {
          navigate('/workouts', {
            state: { workoutCompleted: true, exercise: workoutTitle }
          });
        }
      } else {
        throw new Error(res.data?.message || 'Failed to save workout');
      }
    } catch (err) {
      console.error('❌ Failed to save workout:', err);
      alert(`Could not save workout: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Abandon Session
  const handleAbandonConfirm = () => {
    localStorage.removeItem(ACTIVE_DRAFT_KEY);
    setShowAbandonModal(false);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Sticky Header Bar */}
      <header className="sticky top-16 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 py-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-800/60 rounded-xl transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <input
                type="text"
                value={workoutTitle}
                onChange={(e) => setWorkoutTitle(e.target.value)}
                className="bg-transparent font-black text-lg sm:text-xl text-white focus:outline-none focus:border-b border-orange-500 max-w-[200px] sm:max-w-xs"
                placeholder="Workout Title"
              />
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                <span className="flex items-center gap-1 font-mono text-orange-400 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {formatTimer(elapsedSeconds)}
                </span>
                <span>• {exercises.length} Exercises</span>
                <span>• {completedSetsCount}/{totalSetsCount} Sets</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isPaused 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
            </button>

            <button
              onClick={() => setShowSummaryModal(true)}
              disabled={exercises.length === 0}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Session Content */}
      <main className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        {/* Session Stats Banner */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-900/60 border border-neutral-800 rounded-2xl text-center">
          <div>
            <span className="text-xs text-neutral-500 uppercase tracking-wider block font-medium">Volume</span>
            <span className="text-lg sm:text-xl font-extrabold text-orange-400 font-mono">{totalVolume.toLocaleString()} kg</span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 uppercase tracking-wider block font-medium">Sets Done</span>
            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">{completedSetsCount} / {totalSetsCount}</span>
          </div>
          <div>
            <span className="text-xs text-neutral-500 uppercase tracking-wider block font-medium">Time</span>
            <span className="text-lg sm:text-xl font-extrabold text-white font-mono">{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>

        {/* Exercises List */}
        {exercises.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-neutral-800 rounded-3xl p-8 space-y-4">
            <div className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
              <Dumbbell className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Exercises in Session</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mt-1">
                Add exercises from the library or choose a workout plan to begin logging sets.
              </p>
            </div>
            <button
              onClick={() => setIsPickerOpen(true)}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/20 inline-flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" /> Add First Exercise
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {exercises.map((ex, exIdx) => {
              const prevPerf = previousPerformanceMap[ex.exerciseName];

              return (
                <div 
                  key={ex.id} 
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg transition-all"
                >
                  {/* Exercise Card Header */}
                  <div className="p-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-sm">
                        {exIdx + 1}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{ex.exerciseName}</h3>
                        {ex.category && (
                          <span className="text-xs text-orange-400 font-medium">{ex.category}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveExercise(exIdx, -1)}
                        disabled={exIdx === 0}
                        className="p-1.5 text-neutral-500 hover:text-white disabled:opacity-30 rounded"
                        title="Move Up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveExercise(exIdx, 1)}
                        disabled={exIdx === exercises.length - 1}
                        className="p-1.5 text-neutral-500 hover:text-white disabled:opacity-30 rounded"
                        title="Move Down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveExercise(ex.id)}
                        className="p-1.5 text-neutral-500 hover:text-red-400 rounded transition-colors"
                        title="Remove Exercise"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Previous Performance Real Data Badge */}
                  {prevPerf && (
                    <div className="px-4 py-2 bg-neutral-950/70 border-b border-neutral-800/60 flex items-center gap-2 text-xs text-neutral-400">
                      <History className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                      <span className="font-semibold text-neutral-300">Last Session ({new Date(prevPerf.date).toLocaleDateString()}):</span>
                      <span className="truncate text-neutral-400 font-mono">
                        {prevPerf.sets.map(s => `${s.weight}kg × ${s.reps}`).join(' | ')}
                      </span>
                    </div>
                  )}

                  {/* Sets Table */}
                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-800/80">
                          <th className="pb-2 pl-2 w-12">Set</th>
                          <th className="pb-2">Weight (kg)</th>
                          <th className="pb-2">Reps</th>
                          <th className="pb-2 text-right pr-2">Done</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-800/40">
                        {ex.sets.map((set, setIdx) => {
                          const prevSetLog = prevPerf?.sets[setIdx];

                          return (
                            <tr 
                              key={set.id} 
                              className={`transition-colors ${set.completed ? 'bg-orange-500/5' : 'hover:bg-neutral-800/30'}`}
                            >
                              {/* Set Number */}
                              <td className="py-2.5 pl-2 font-bold font-mono text-neutral-400">
                                {set.setNumber}
                              </td>

                              {/* Weight Input */}
                              <td className="py-2.5 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => adjustSetField(ex.id, setIdx, 'weight', -2.5)}
                                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-base transition-colors"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    inputMode="decimal"
                                    step="0.5"
                                    value={set.weight || ''}
                                    onChange={(e) => handleUpdateSet(ex.id, setIdx, 'weight', e.target.value)}
                                    placeholder={prevSetLog ? `${prevSetLog.weight}` : '0'}
                                    className="w-16 sm:w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-center text-sm font-bold text-white font-mono focus:outline-none focus:border-orange-500"
                                  />
                                  <button
                                    onClick={() => adjustSetField(ex.id, setIdx, 'weight', 2.5)}
                                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-base transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Reps Input */}
                              <td className="py-2.5 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => adjustSetField(ex.id, setIdx, 'reps', -1)}
                                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-base transition-colors"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    value={set.reps || ''}
                                    onChange={(e) => handleUpdateSet(ex.id, setIdx, 'reps', e.target.value)}
                                    placeholder={prevSetLog ? `${prevSetLog.reps}` : '10'}
                                    className="w-14 sm:w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-center text-sm font-bold text-white font-mono focus:outline-none focus:border-orange-500"
                                  />
                                  <button
                                    onClick={() => adjustSetField(ex.id, setIdx, 'reps', 1)}
                                    className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-neutral-300 hover:text-white flex items-center justify-center font-bold text-base transition-colors"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>

                              {/* Completion Checkbox */}
                              <td className="py-2.5 text-right pr-2">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handleToggleSetComplete(ex.id, setIdx)}
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                      set.completed
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                                    }`}
                                    title={set.completed ? 'Mark incomplete' : 'Mark complete'}
                                  >
                                    <Check className="w-5 h-5 stroke-[3]" />
                                  </button>

                                  {ex.sets.length > 1 && (
                                    <button
                                      onClick={() => handleRemoveSet(ex.id, setIdx)}
                                      className="text-neutral-600 hover:text-red-400 p-1"
                                      title="Delete set"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    <button
                      onClick={() => handleAddSet(ex.id)}
                      className="mt-3 w-full py-2 bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-neutral-800 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Set
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add Exercise Button */}
            <button
              onClick={() => setIsPickerOpen(true)}
              className="w-full py-4 border-2 border-dashed border-neutral-800 hover:border-orange-500/50 bg-neutral-900/30 hover:bg-neutral-900/80 rounded-2xl text-orange-400 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" /> Add Exercise to Session
            </button>
          </div>
        )}

        {/* Abandon Workout Action */}
        <div className="pt-6 border-t border-neutral-800/80 text-center">
          <button
            onClick={() => setShowAbandonModal(true)}
            className="text-xs text-neutral-500 hover:text-red-400 transition-colors font-medium"
          >
            Abandon Workout Session
          </button>
        </div>
      </main>

      {/* Floating Rest Timer Widget */}
      {activeRestTimer && (
        <RestTimerFloatingBar
          restTimeSeconds={activeRestTimer.seconds}
          onFinished={() => setActiveRestTimer(null)}
          onClose={() => setActiveRestTimer(null)}
        />
      )}

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectExercise={handleAddExercise}
        selectedExerciseNames={exercises.map(ex => ex.exerciseName)}
      />

      {/* Workout Summary / Completion Confirmation Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Workout Summary</h2>
              <p className="text-xs text-neutral-400">Review your workout before saving to MongoDB</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-950 border border-neutral-800/80 rounded-2xl text-center">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Total Time</span>
                <span className="text-lg font-black text-white font-mono">{formatTimer(elapsedSeconds)}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Total Volume</span>
                <span className="text-lg font-black text-orange-400 font-mono">{totalVolume.toLocaleString()} kg</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Exercises</span>
                <span className="text-lg font-black text-white font-mono">{exercises.length}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block font-semibold">Completed Sets</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{completedSetsCount} / {totalSetsCount}</span>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
              <div>
                <span className="text-xs font-bold text-white block">Public Workout</span>
                <span className="text-[10px] text-neutral-500">Allow other users to see this workout</span>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5 rounded border-neutral-700 text-orange-500 focus:ring-orange-500 bg-neutral-900 cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-colors"
              >
                Continue Editing
              </button>
              <button
                onClick={handleCompleteWorkout}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Workout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon Modal */}
      {showAbandonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Abandon Workout?</h3>
            <p className="text-xs text-neutral-400">
              Are you sure? All logged sets for this session will be discarded.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowAbandonModal(false)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAbandonConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Abandon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
