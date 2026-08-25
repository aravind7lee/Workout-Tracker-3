import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Dumbbell, Play, Pause, Square, Plus, Trash2, ChevronUp, ChevronDown, 
  Check, Clock, Award, History, AlertCircle, Save, ArrowLeft, RefreshCw,
  Info, CheckCircle2, Flame, Layers, Sparkles, AlertTriangle, FastForward
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRealTime } from '../context/RealTimeContext';
import api from '../utils/api';
import ExercisePickerModal from '../components/ExercisePickerModal';
import { getMuscleGroup, getPrimaryMuscleGroup } from '../utils/muscleGroupHelper';

const ACTIVE_SESSION_KEY = 'active_workout_session';

export default function WorkoutSession() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { refreshStats, fetchRealTimeStats, triggerUpdate } = useRealTime();

  /**
   * Session Lifecycle State Machine:
   * 'WORKOUT_SETUP'    -> Configuring workout title, exercises, target set count, weights/reps (Timer NOT running)
   * 'READY_TO_START'   -> Session configuration complete, displaying "READY TO START?" banner (Timer NOT running)
   * 'ACTIVE'           -> User pressed START WORKOUT. Session timer running, active set focused
   * 'PAUSED'           -> Session timer paused by user
   * 'SET_COMPLETED'    -> Just completed a set, displaying set confirmation dialog
   * 'RESTING'          -> Rest timer running between sets
   * 'COMPLETING'       -> Final workout summary screen
   * 'COMPLETED'        -> Workout saved to MongoDB Atlas
   * 'ABANDONED'        -> User exited active session without saving
   */
  const [sessionState, setSessionState] = useState('WORKOUT_SETUP');

  // Workout Metadata
  const [workoutTitle, setWorkoutTitle] = useState('Freestyle Workout');
  const [exercises, setExercises] = useState([]);
  const [notes, setNotes] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  // Active Set Focus: { exIdx: number, setIdx: number }
  const [activeSetFocus, setActiveSetFocus] = useState({ exIdx: 0, setIdx: 0 });
  const [lastCompletedSetInfo, setLastCompletedSetInfo] = useState(null);

  // Timers & Metrics
  const [startedAt, setStartedAt] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rest Timer State: { secondsRemaining: number, initialDuration: number, isFinished: boolean }
  const [restTimer, setRestTimer] = useState(null);

  // UI Modals
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  // Cache for previous performance: { [exerciseName]: { date, sets: [] } }
  const [previousPerformanceMap, setPreviousPerformanceMap] = useState({});

  // ---------------------------------------------------------
  // 1. Session Initialization (Setup Mode vs Active Recovery)
  // ---------------------------------------------------------
  useEffect(() => {
    const initSession = async () => {
      // Check for saved active session in localStorage first (Recovery path)
      const savedSession = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed && Array.isArray(parsed.exercises) && parsed.exercises.length > 0 && parsed.sessionState === 'ACTIVE') {
            setWorkoutTitle(parsed.title || 'Freestyle Workout');
            setExercises(parsed.exercises);
            setNotes(parsed.notes || '');
            setIsPublic(Boolean(parsed.isPublic));
            setSessionState('ACTIVE');
            
            const restoredStartedAt = parsed.startedAt ? new Date(parsed.startedAt) : new Date();
            setStartedAt(restoredStartedAt);
            
            const nowMs = Date.now();
            const durationSoFar = Math.max(0, Math.floor((nowMs - restoredStartedAt.getTime()) / 1000));
            setElapsedSeconds(parsed.elapsedSeconds ? Math.max(parsed.elapsedSeconds, durationSoFar) : durationSoFar);
            setActiveSetFocus(parsed.activeSetFocus || { exIdx: 0, setIdx: 0 });

            parsed.exercises.forEach(ex => fetchPreviousPerformance(ex.exerciseName));
            return;
          }
        } catch (e) {
          console.warn('Failed to restore active session, clearing invalid state:', e);
          localStorage.removeItem(ACTIVE_SESSION_KEY);
        }
      }

      // Fresh Setup Path
      const state = location.state || {};

      if (state.repeatWorkout) {
        const rw = state.repeatWorkout;
        setWorkoutTitle(rw.title ? `${rw.title} (Repeat)` : 'Repeated Workout');
        const resetExercises = (rw.exercises || []).map((ex, exIdx) => ({
          id: `ex_${Date.now()}_${exIdx}`,
          exerciseId: ex.exercise?._id || ex.exercise || null,
          exerciseName: ex.exerciseName || ex.name || 'Exercise',
          category: ex.category || 'General',
          notes: ex.notes || '',
          sets: (ex.sets || []).map((s, sIdx) => ({
            id: `set_${Date.now()}_${exIdx}_${sIdx}`,
            setNumber: sIdx + 1,
            weight: Number(s.weight) || 0,
            reps: Number(s.reps) || 10,
            completed: false
          }))
        }));
        setExercises(resetExercises);
        setSessionState(resetExercises.length > 0 ? 'READY_TO_START' : 'WORKOUT_SETUP');
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
            category: ex.category || 'General',
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
          setSessionState(planExercises.length > 0 ? 'READY_TO_START' : 'WORKOUT_SETUP');
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
                category: ex.category || 'General',
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
              setSessionState(pExercises.length > 0 ? 'READY_TO_START' : 'WORKOUT_SETUP');
              pExercises.forEach(ex => fetchPreviousPerformance(ex.exerciseName));
              return;
            }
          } catch (err) {
            console.error('Failed to load plan for workout session:', err);
          }
        }
      }

      // Default Freestyle Workout Setup
      setWorkoutTitle(state.defaultTitle || 'Freestyle Workout');
      setSessionState('WORKOUT_SETUP');
    };

    initSession();
  }, [planId, location.state]);

  // ---------------------------------------------------------
  // 2. Session Timer Effect (Runs ONLY during ACTIVE states)
  // ---------------------------------------------------------
  useEffect(() => {
    const isSessionTimerRunning = ['ACTIVE', 'SET_COMPLETED', 'RESTING'].includes(sessionState);
    if (!isSessionTimerRunning || isPaused || !startedAt) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState, isPaused, startedAt]);

  // ---------------------------------------------------------
  // 3. Rest Timer Countdown Effect
  // ---------------------------------------------------------
  useEffect(() => {
    if (!restTimer || restTimer.secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setRestTimer(prev => {
        if (!prev) return null;
        if (prev.secondsRemaining <= 1) {
          return { ...prev, secondsRemaining: 0, isFinished: true };
        }
        return { ...prev, secondsRemaining: prev.secondsRemaining - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer]);

  // ---------------------------------------------------------
  // 4. Persistence Effect (Active recovery state only)
  // ---------------------------------------------------------
  useEffect(() => {
    if (sessionState === 'ACTIVE' || sessionState === 'RESTING' || sessionState === 'SET_COMPLETED') {
      const activeSessionPayload = {
        sessionState: 'ACTIVE',
        title: workoutTitle,
        exercises,
        notes,
        isPublic,
        startedAt: startedAt ? startedAt.toISOString() : new Date().toISOString(),
        elapsedSeconds,
        activeSetFocus
      };
      try {
        localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(activeSessionPayload));
      } catch (e) {
        console.warn('Failed to persist active session to localStorage:', e);
      }
    } else if (sessionState === 'COMPLETED' || sessionState === 'ABANDONED') {
      localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  }, [sessionState, workoutTitle, exercises, notes, isPublic, startedAt, elapsedSeconds, activeSetFocus]);

  // ---------------------------------------------------------
  // Helper: Fetch Real Previous Performance from MongoDB
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // Derived Session Metrics (Strict Calculations)
  // ---------------------------------------------------------
  const completedSetsCount = exercises.reduce((sum, ex) => {
    return sum + ex.sets.filter(s => s.completed).length;
  }, 0);

  const totalSetsCount = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

  // Volume derived STRICTLY from completed sets (set.completed === true)
  const completedVolume = exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((exSum, set) => {
      if (set.completed) {
        const w = Number(set.weight) || 0;
        const r = Number(set.reps) || 0;
        return exSum + (w * r);
      }
      return exSum;
    }, 0);
  }, 0);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ---------------------------------------------------------
  // Setup Actions
  // ---------------------------------------------------------
  const handleAddExerciseFromPicker = (selectedEx) => {
    const exCategory = getMuscleGroup(selectedEx.name, selectedEx.categoryName || selectedEx.category);
    const newEx = {
      id: `ex_${Date.now()}_${exercises.length}`,
      exerciseId: selectedEx._id || selectedEx.id || null,
      exerciseName: selectedEx.name,
      category: exCategory,
      muscle: exCategory,
      notes: '',
      sets: [
        { id: `set_${Date.now()}_0`, setNumber: 1, weight: 0, reps: 10, completed: false },
        { id: `set_${Date.now()}_1`, setNumber: 2, weight: 0, reps: 10, completed: false },
        { id: `set_${Date.now()}_2`, setNumber: 3, weight: 0, reps: 10, completed: false }
      ]
    };
    const updated = [...exercises, newEx];
    setExercises(updated);
    if (sessionState === 'WORKOUT_SETUP') {
      setSessionState('READY_TO_START');
    }
    setIsPickerOpen(false);
    fetchPreviousPerformance(selectedEx.name);
  };

  const handleUpdateTargetSetsCount = (exId, delta) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const currentSets = ex.sets;
      if (delta > 0) {
        const lastSet = currentSets[currentSets.length - 1] || { weight: 0, reps: 10 };
        const newSet = {
          id: `set_${Date.now()}_${currentSets.length}`,
          setNumber: currentSets.length + 1,
          weight: lastSet.weight || 0,
          reps: lastSet.reps || 10,
          completed: false
        };
        return { ...ex, sets: [...currentSets, newSet] };
      } else if (delta < 0 && currentSets.length > 1) {
        return { ...ex, sets: currentSets.slice(0, -1) };
      }
      return ex;
    }));
  };

  const handleUpdateSet = (exId, setIdx, field, value) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const updatedSets = [...ex.sets];
      updatedSets[setIdx] = {
        ...updatedSets[setIdx],
        [field]: field === 'weight' ? parseFloat(value) || 0 : parseInt(value, 10) || 0
      };
      return { ...ex, sets: updatedSets };
    }));
  };

  const adjustSetField = (exId, setIdx, field, delta) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const updatedSets = [...ex.sets];
      const currentVal = Number(updatedSets[setIdx][field]) || 0;
      const newVal = Math.max(0, currentVal + delta);
      updatedSets[setIdx] = {
        ...updatedSets[setIdx],
        [field]: field === 'weight' ? Number(newVal.toFixed(1)) : newVal
      };
      return { ...ex, sets: updatedSets };
    }));
  };

  const handleRemoveExercise = (exId) => {
    const updated = exercises.filter(ex => ex.id !== exId);
    setExercises(updated);
    if (updated.length === 0 && sessionState === 'READY_TO_START') {
      setSessionState('WORKOUT_SETUP');
    }
  };

  const [setupValidationError, setSetupValidationError] = useState('');

  // ---------------------------------------------------------
  // Explicit Workout Start Action (Transitions SETUP -> ACTIVE)
  // ---------------------------------------------------------
  const handleExplicitStartWorkout = () => {
    setSetupValidationError('');

    if (exercises.length === 0) {
      setSetupValidationError('Please select at least 1 exercise before starting your workout session.');
      return;
    }

    // Validate that reps are configured (> 0)
    const hasUnconfiguredSet = exercises.some(ex => {
      return ex.sets.some(s => Number(s.reps) <= 0);
    });

    if (hasUnconfiguredSet) {
      setSetupValidationError('Please configure your target reps and weight for all sets before starting the workout.');
      return;
    }

    const now = new Date();
    setStartedAt(now);
    setElapsedSeconds(0);
    setActiveSetFocus({ exIdx: 0, setIdx: 0 });
    setSessionState('ACTIVE');
  };

  // ---------------------------------------------------------
  // Explicit Set Completion Action
  // ---------------------------------------------------------
  const handleCompleteSet = (exIdx, setIdx) => {
    const targetEx = exercises[exIdx];
    if (!targetEx) return;

    const targetSet = targetEx.sets[setIdx];
    if (!targetSet) return;

    // Toggle set completion
    const newCompletedStatus = !targetSet.completed;

    setExercises(prev => prev.map((ex, eI) => {
      if (eI !== exIdx) return ex;
      const updatedSets = [...ex.sets];
      updatedSets[setIdx] = {
        ...updatedSets[setIdx],
        completed: newCompletedStatus,
        completedAt: newCompletedStatus ? new Date().toISOString() : null
      };
      return { ...ex, sets: updatedSets };
    }));

    if (newCompletedStatus) {
      setLastCompletedSetInfo({
        exerciseName: targetEx.exerciseName,
        setNumber: targetSet.setNumber,
        weight: targetSet.weight,
        reps: targetSet.reps
      });
      setSessionState('SET_COMPLETED');
    }
  };

  // Rest & Transition Actions
  const handleTakeRest = (seconds = 60) => {
    setRestTimer({
      secondsRemaining: seconds,
      initialDuration: seconds,
      isFinished: false
    });
    setSessionState('RESTING');
  };

  const handleNextSetNow = () => {
    setRestTimer(null);
    // Find next pending set
    let found = false;
    for (let eI = activeSetFocus.exIdx; eI < exercises.length; eI++) {
      const startS = eI === activeSetFocus.exIdx ? activeSetFocus.setIdx + 1 : 0;
      for (let sI = startS; sI < exercises[eI].sets.length; sI++) {
        if (!exercises[eI].sets[sI].completed) {
          setActiveSetFocus({ exIdx: eI, setIdx: sI });
          found = true;
          break;
        }
      }
      if (found) break;
    }
    setSessionState('ACTIVE');
  };

  // Submit Workout Completion to MongoDB
  const handleFinishWorkout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      const estimatedCalories = Math.round(durationMinutes * 7 + completedSetsCount * 5);

      // Determine primary muscle group
      const primaryMuscle = getPrimaryMuscleGroup(exercises);

      // Format exercises cleanly ensuring no sets or exercises are dropped
      const formattedExercises = exercises
        .map(ex => {
          const exMuscle = ex.category || ex.muscle || getMuscleGroup(ex.exerciseName);
          
          // Check if any sets are marked completed
          const completedSets = ex.sets.filter(s => s.completed);
          
          // If user completed sets, take those. Otherwise take all sets configured with reps > 0
          const setsToSave = completedSets.length > 0
            ? completedSets
            : ex.sets.filter(s => Number(s.reps) > 0);

          return {
            exercise: ex.exerciseId,
            exerciseName: ex.exerciseName,
            category: exMuscle,
            muscle: exMuscle,
            notes: ex.notes || '',
            sets: (setsToSave.length > 0 ? setsToSave : ex.sets).map(s => ({
              reps: Number(s.reps) || 0,
              weight: Number(s.weight) || 0,
              rest: 60
            }))
          };
        })
        .filter(ex => ex.sets.length > 0);

      const payload = {
        title: workoutTitle.trim() || 'Workout Session',
        category: primaryMuscle,
        muscle: primaryMuscle,
        status: 'completed',
        durationMinutes,
        calories: estimatedCalories,
        isPublic,
        startedAt: startedAt ? startedAt.toISOString() : new Date().toISOString(),
        exercises: formattedExercises
      };

      console.log('💾 Saving completed workout session to MongoDB Atlas:', payload);
      const res = await api.post('/workouts', payload);

      if (res.data?.success || res.status === 201) {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        setSessionState('COMPLETED');

        const savedWorkout = res.data?.workout || payload;

        window.dispatchEvent(new CustomEvent('workoutCompleted', {
          detail: savedWorkout
        }));
        if (typeof refreshStats === 'function') {
          refreshStats();
        } else if (typeof fetchRealTimeStats === 'function') {
          fetchRealTimeStats();
        } else if (typeof triggerUpdate === 'function') {
          triggerUpdate();
        }

        const createdId = savedWorkout._id || savedWorkout.id;
        setShowSummaryModal(false);

        if (createdId) {
          navigate(`/workout-details/${createdId}`, {
            state: { 
              workout: savedWorkout,
              message: '🎉 Workout saved to MongoDB Atlas successfully!' 
            }
          });
        } else {
          navigate('/workouts', { state: { workoutCompleted: true } });
        }
      } else {
        throw new Error(res.data?.message || 'Failed to save workout session');
      }
    } catch (err) {
      console.error('❌ Failed to save workout:', err);
      alert(`Error saving workout: ${err.message || 'Server error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAbandon = () => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setSessionState('ABANDONED');
    navigate('/start-workout');
  };

  // ---------------------------------------------------------
  // RENDER UI BY STATE MACHINE
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Top Header Navigation */}
      <div className="sticky top-0 z-30 bg-black/90 border-b border-neutral-800/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (['ACTIVE', 'RESTING', 'SET_COMPLETED'].includes(sessionState)) {
                setShowAbandonModal(true);
              } else {
                navigate('/start-workout');
              }
            }}
            className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-900 transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Header Title & Status Badge */}
          <div className="text-center">
            <h1 className="text-base font-extrabold text-white tracking-wide truncate max-w-[200px] sm:max-w-xs">
              {workoutTitle}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-0.5">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                ['ACTIVE', 'RESTING', 'SET_COMPLETED'].includes(sessionState)
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {sessionState === 'WORKOUT_SETUP' && 'Setup Mode'}
                {sessionState === 'READY_TO_START' && 'Ready to Start'}
                {sessionState === 'ACTIVE' && 'Session Active'}
                {sessionState === 'RESTING' && 'Resting'}
                {sessionState === 'SET_COMPLETED' && 'Set Completed'}
              </span>

              {['ACTIVE', 'RESTING', 'SET_COMPLETED'].includes(sessionState) && (
                <span className="text-xs font-mono font-bold text-orange-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-500" /> {formatTimer(elapsedSeconds)}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          {['ACTIVE', 'RESTING', 'SET_COMPLETED'].includes(sessionState) ? (
            <button
              onClick={() => setShowSummaryModal(true)}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1"
            >
              Finish <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          ) : (
            <div className="w-16" />
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* =========================================================
            STAGE 1 & 2: WORKOUT SETUP / READY TO START SCREEN
            (Timer is NOT running, Set count = 0/0, No DB record)
           ========================================================= */}
        {['WORKOUT_SETUP', 'READY_TO_START'].includes(sessionState) && (
          <div className="space-y-6">
            
            {/* Title & Description Box */}
            <div className="p-4 sm:p-5 bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                <Dumbbell className="w-4 h-4" /> Prepare Your Workout
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                  Workout Session Name
                </label>
                <input
                  type="text"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder="e.g. Push Heavy, Leg Day Blast..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-base sm:text-lg font-black text-white focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
                <span>{exercises.length} Exercises Selected</span>
                <span>Target: {totalSetsCount} Sets Total</span>
              </div>
            </div>

            {/* Exercises List Configuration */}
            {exercises.length === 0 ? (
              <div className="p-5 sm:p-8 bg-neutral-900/60 border border-neutral-800 border-dashed rounded-2xl sm:rounded-3xl text-center space-y-3 sm:space-y-4 shadow-inner">
                <div className="w-12 h-12 bg-neutral-800 text-orange-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No Exercises Added Yet</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1">
                    Add exercises to configure your target sets, reps, and starting weights before starting.
                  </p>
                </div>
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Select Exercise
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {exercises.map((ex, exIdx) => {
                  const prevPerf = previousPerformanceMap[ex.exerciseName];

                  return (
                    <div key={ex.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
                      <div className="p-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs">
                            {exIdx + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{ex.exerciseName}</h4>
                            <span className="text-[11px] text-orange-400 font-medium">{ex.category}</span>
                          </div>
                        </div>

                        {/* Set Count Adjuster: [-] 3 Sets [+] */}
                        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-2 py-1">
                          <span className="text-[11px] font-bold text-neutral-400 mr-1">Sets:</span>
                          <button
                            onClick={() => handleUpdateTargetSetsCount(ex.id, -1)}
                            className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white font-mono">{ex.sets.length}</span>
                          <button
                            onClick={() => handleUpdateTargetSetsCount(ex.id, 1)}
                            className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                          <button
                            onClick={() => handleRemoveExercise(ex.id)}
                            className="p-1 text-neutral-500 hover:text-red-400 ml-2"
                            title="Remove Exercise"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Real Previous Performance Badge */}
                      {prevPerf && (
                        <div className="px-4 py-2 bg-neutral-950/70 border-b border-neutral-800/60 flex items-center gap-2 text-xs text-neutral-400">
                          <History className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                          <span className="font-semibold text-neutral-300">Last Session ({new Date(prevPerf.date).toLocaleDateString()}):</span>
                          <span className="truncate text-neutral-400 font-mono">
                            {prevPerf.sets.map(s => `${s.weight}kg × ${s.reps}`).join(' | ')}
                          </span>
                        </div>
                      )}

                      {/* Target Set Configuration Table */}
                      <div className="p-4">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-800/80">
                              <th className="pb-2 pl-2 w-12">Set</th>
                              <th className="pb-2">Target Weight (kg)</th>
                              <th className="pb-2">Target Reps</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800/40">
                            {ex.sets.map((set, setIdx) => (
                              <tr key={set.id}>
                                <td className="py-2.5 pl-2 font-bold text-neutral-400 font-mono">{set.setNumber}</td>
                                <td className="py-2.5 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'weight', -2.5)}
                                      className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      step="0.5"
                                      value={set.weight || ''}
                                      onChange={(e) => handleUpdateSet(ex.id, setIdx, 'weight', e.target.value)}
                                      className="w-12 sm:w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-1 sm:px-2 py-1 text-center font-bold text-white font-mono text-[11px] sm:text-xs"
                                    />
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'weight', 2.5)}
                                      className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                                <td className="py-2.5 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'reps', -1)}
                                      className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      inputMode="numeric"
                                      value={set.reps || ''}
                                      onChange={(e) => handleUpdateSet(ex.id, setIdx, 'reps', e.target.value)}
                                      className="w-10 sm:w-14 bg-neutral-950 border border-neutral-800 rounded-lg px-1 sm:px-2 py-1 text-center font-bold text-white font-mono text-[11px] sm:text-xs"
                                    />
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'reps', 1)}
                                      className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="w-full py-2.5 sm:py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 border-dashed rounded-xl sm:rounded-2xl text-xs font-bold text-orange-400 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Another Exercise
                </button>
              </div>
            )}

            {/* READY TO START BANNER & EXPLICIT START BUTTON */}
            {exercises.length > 0 && (
              <div className="p-4 sm:p-6 bg-gradient-to-r from-orange-500/20 via-neutral-900 to-neutral-900 border border-orange-500/40 rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" /> Ready To Start?
                  </div>
                  <span className="text-[10px] sm:text-xs text-neutral-400 font-mono">Target: {totalSetsCount} Sets</span>
                </div>

                <div>
                  <h3 className="text-base sm:text-xl font-black text-white">Configured {exercises.length} Exercises</h3>
                  <p className="text-[10px] sm:text-xs text-neutral-300 mt-1 leading-relaxed">
                    Enter your target reps and weight above, then press <strong>START WORKOUT</strong> to begin your session timer.
                  </p>
                </div>

                {setupValidationError && (
                  <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-2xl flex items-center gap-3 text-red-300 text-xs font-bold shadow-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span>{setupValidationError}</span>
                  </div>
                )}

                <button
                  onClick={handleExplicitStartWorkout}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black text-base uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01]"
                >
                  <Play className="w-5 h-5 fill-current" /> START WORKOUT NOW
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            STAGE 3: ACTIVE WORKOUT MODE
            (Timer is RUNNING, Real Live Metrics, Touch-Optimized Set Entry)
           ========================================================= */}
        {['ACTIVE', 'SET_COMPLETED', 'RESTING'].includes(sessionState) && (
          <div className="space-y-6">

            {/* Real Live Session Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 p-4 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg text-center">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Completed Volume</span>
                <p className="text-lg font-black text-orange-400 font-mono mt-0.5">{completedVolume.toLocaleString()} kg</p>
              </div>
              <div className="border-x border-neutral-800">
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Sets Done</span>
                <p className="text-lg font-black text-white font-mono mt-0.5">{completedSetsCount} / {totalSetsCount}</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Elapsed Time</span>
                <p className="text-lg font-black text-emerald-400 font-mono mt-0.5">{formatTimer(elapsedSeconds)}</p>
              </div>
            </div>

            {/* Active Rest Floating Card */}
            {sessionState === 'RESTING' && restTimer && (
              <div className="p-5 bg-gradient-to-r from-blue-500/20 via-neutral-900 to-neutral-900 border border-blue-500/40 rounded-3xl space-y-3 shadow-xl animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-4 h-4" /> Rest Countdown
                  </div>
                  <button
                    onClick={handleNextSetNow}
                    className="text-xs text-neutral-400 hover:text-white underline font-bold"
                  >
                    Skip Rest
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-3xl font-black font-mono text-blue-400">
                    {formatTimer(restTimer.secondsRemaining)}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRestTimer(prev => prev ? { ...prev, secondsRemaining: prev.secondsRemaining + 30 } : null)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg"
                    >
                      +30s
                    </button>
                    <button
                      onClick={() => setRestTimer(prev => prev ? { ...prev, secondsRemaining: Math.max(0, prev.secondsRemaining - 15) } : null)}
                      className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg"
                    >
                      -15s
                    </button>
                  </div>
                </div>

                {restTimer.isFinished && (
                  <div className="pt-2 flex items-center justify-between border-t border-neutral-800">
                    <span className="text-xs text-emerald-400 font-bold">🎉 Rest Complete! Ready for your next set?</span>
                    <button
                      onClick={handleNextSetNow}
                      className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1"
                    >
                      Next Set <FastForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Set Completed Feedback Banner */}
            {sessionState === 'SET_COMPLETED' && lastCompletedSetInfo && (
              <div className="p-5 bg-gradient-to-r from-emerald-500/20 via-neutral-900 to-neutral-900 border border-emerald-500/40 rounded-3xl space-y-3 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Set Completed!
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-black text-white">
                    {lastCompletedSetInfo.exerciseName} — Set {lastCompletedSetInfo.setNumber}
                  </h4>
                  <p className="text-xs text-neutral-300 mt-0.5 font-mono">
                    Logged: <strong>{lastCompletedSetInfo.weight} kg × {lastCompletedSetInfo.reps} reps</strong>
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleTakeRest(60)}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20"
                  >
                    <Clock className="w-3.5 h-3.5" /> TAKE REST (1:00)
                  </button>
                  <button
                    onClick={handleNextSetNow}
                    className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <FastForward className="w-3.5 h-3.5" /> NEXT SET NOW
                  </button>
                </div>
              </div>
            )}

            {/* Active Exercises List & Touch-Optimized Set Entry Table */}
            <div className="space-y-4">
              {exercises.map((ex, exIdx) => {
                const prevPerf = previousPerformanceMap[ex.exerciseName];

                return (
                  <div key={ex.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg">
                    <div className="p-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-bold text-xs">
                          {exIdx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{ex.exerciseName}</h4>
                          <span className="text-[11px] text-orange-400 font-medium">{ex.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Previous Performance Real Badge */}
                    {prevPerf && (
                      <div className="px-4 py-2 bg-neutral-950/70 border-b border-neutral-800/60 flex items-center gap-2 text-xs text-neutral-400">
                        <History className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                        <span className="font-semibold text-neutral-300">Last Session ({new Date(prevPerf.date).toLocaleDateString()}):</span>
                        <span className="truncate text-neutral-400 font-mono">
                          {prevPerf.sets.map(s => `${s.weight}kg × ${s.reps}`).join(' | ')}
                        </span>
                      </div>
                    )}

                    {/* Sets Logging Table */}
                    <div className="p-4 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-800/80">
                            <th className="pb-2 pl-2 w-12">Set</th>
                            <th className="pb-2">Weight (kg)</th>
                            <th className="pb-2">Reps</th>
                            <th className="pb-2 text-right pr-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/40">
                          {ex.sets.map((set, setIdx) => {
                            const isFocused = activeSetFocus.exIdx === exIdx && activeSetFocus.setIdx === setIdx;

                            return (
                              <tr 
                                key={set.id} 
                                className={`transition-colors ${
                                  set.completed 
                                    ? 'bg-emerald-500/10' 
                                    : isFocused 
                                    ? 'bg-orange-500/10 border-l-4 border-orange-500' 
                                    : 'hover:bg-neutral-800/30'
                                }`}
                              >
                                <td className="py-3 pl-2 font-bold font-mono text-neutral-300">
                                  {set.setNumber}
                                </td>

                                {/* Weight Input */}
                                <td className="py-3 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'weight', -2.5)}
                                      className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white font-bold text-sm"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      step="0.5"
                                      value={set.weight || ''}
                                      onChange={(e) => handleUpdateSet(ex.id, setIdx, 'weight', e.target.value)}
                                      className="w-16 sm:w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-center text-sm font-bold text-white font-mono focus:outline-none focus:border-orange-500"
                                    />
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'weight', 2.5)}
                                      className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white font-bold text-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>

                                {/* Reps Input */}
                                <td className="py-3 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'reps', -1)}
                                      className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white font-bold text-sm"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      inputMode="numeric"
                                      value={set.reps || ''}
                                      onChange={(e) => handleUpdateSet(ex.id, setIdx, 'reps', e.target.value)}
                                      className="w-14 sm:w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1.5 text-center text-sm font-bold text-white font-mono focus:outline-none focus:border-orange-500"
                                    />
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'reps', 1)}
                                      className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 text-white font-bold text-sm"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>

                                {/* Complete Set Prominent Button */}
                                <td className="py-3 text-right pr-2">
                                  <button
                                    onClick={() => handleCompleteSet(exIdx, setIdx)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ml-auto ${
                                      set.completed
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
                                    }`}
                                  >
                                    {set.completed ? (
                                      <>
                                        <Check className="w-4 h-4 stroke-[3]" /> Done
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4 stroke-[3]" /> Complete Set
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectExercise={handleAddExerciseFromPicker}
        selectedExerciseNames={exercises.map(ex => ex.exerciseName)}
      />

      {/* Workout Completion Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white">Workout Complete!</h3>
              <p className="text-xs text-neutral-400">Great work. Here is your session summary.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Duration</span>
                <p className="text-base font-black text-white font-mono mt-0.5">{formatTimer(elapsedSeconds)}</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Total Volume</span>
                <p className="text-base font-black text-orange-400 font-mono mt-0.5">{completedVolume.toLocaleString()} kg</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Exercises</span>
                <p className="text-base font-black text-white font-mono mt-0.5">{exercises.length}</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Sets Completed</span>
                <p className="text-base font-black text-emerald-400 font-mono mt-0.5">{completedSetsCount} / {totalSetsCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl"
              >
                Keep Editing
              </button>
              <button
                onClick={handleFinishWorkout}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Saving...' : 'Save to History'} <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon Confirmation Modal */}
      {showAbandonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-lg font-black text-white">Leave Active Workout?</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Your workout session is currently active. If you leave now without saving, your session draft will be discarded and will not count as a completed workout.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowAbandonModal(false)}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl"
              >
                Keep Working Out
              </button>
              <button
                onClick={handleConfirmAbandon}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20"
              >
                Abandon Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
