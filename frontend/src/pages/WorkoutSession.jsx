import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Dumbbell, Play, Pause, Square, Plus, Trash2, ChevronUp, ChevronDown, 
  Check, Clock, Award, History, AlertCircle, Save, ArrowLeft, RefreshCw,
  Info, CheckCircle2, Flame, Layers, Sparkles, AlertTriangle, FastForward,
  Scale, Copy, Sliders, X
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
  const [swappingExerciseId, setSwappingExerciseId] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showAbandonModal, setShowAbandonModal] = useState(false);

  // Plate Calculator Modal State: { isOpen: boolean, weight: number, exerciseName: string }
  const [plateCalcModal, setPlateCalcModal] = useState({ isOpen: false, weight: 60, barWeight: 20 });

  // Cache for previous performance: { [exerciseName]: { date, sets: [] } }
  const [previousPerformanceMap, setPreviousPerformanceMap] = useState({});
  const [setupValidationError, setSetupValidationError] = useState('');

  // ---------------------------------------------------------
  // 1. Session Initialization (Setup Mode vs Active Recovery)
  // ---------------------------------------------------------
  useEffect(() => {
    const initSession = async () => {
      // Check for saved active session in localStorage first
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
            type: s.type || 'normal',
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
              type: 'normal',
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
                  type: 'normal',
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
            console.error('Failed to load plan for workout-session:', err);
          }
        }
      }

      // Pre-configured Routine / Quick-Start Exercises
      if (state.exercises && Array.isArray(state.exercises) && state.exercises.length > 0) {
        setWorkoutTitle(state.defaultTitle || state.title || 'Targeted workout-session');
        const formattedExercises = state.exercises.map((ex, exIdx) => {
          const setsCount = parseInt(ex.sets, 10) || 3;
          return {
            id: `ex_${Date.now()}_${exIdx}`,
            exerciseId: ex._id || ex.id || null,
            exerciseName: ex.name || ex.exerciseName || 'Exercise',
            category: ex.category || ex.muscle || 'General',
            notes: ex.notes || '',
            sets: Array.from({ length: setsCount }).map((_, sIdx) => ({
              id: `set_${Date.now()}_${exIdx}_${sIdx}`,
              setNumber: sIdx + 1,
              type: sIdx === 0 && ex.isWarmup ? 'warmup' : 'normal',
              weight: parseFloat(ex.weight) || 0,
              reps: parseInt(ex.reps, 10) || 10,
              completed: false
            }))
          };
        });
        setExercises(formattedExercises);
        setSessionState(formattedExercises.length > 0 ? 'READY_TO_START' : 'WORKOUT_SETUP');
        formattedExercises.forEach(ex => fetchPreviousPerformance(ex.exerciseName));
        return;
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

  useEffect(() => {
    if (!restTimer?.isFinished) return;
    navigator.vibrate?.([180, 80, 180]);
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.connect(audioContext.destination);
      oscillator.frequency.value = 740;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.18);
    } catch { /* audio permission */ }
  }, [restTimer?.isFinished]);

  // ---------------------------------------------------------
  // 4. Persistence Effect
  // ---------------------------------------------------------
  useEffect(() => {
    if (['ACTIVE', 'RESTING', 'SET_COMPLETED'].includes(sessionState)) {
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
  // Derived Session Metrics
  // ---------------------------------------------------------
  const completedSetsCount = exercises.reduce((sum, ex) => {
    return sum + ex.sets.filter(s => s.completed).length;
  }, 0);

  const totalSetsCount = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

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

  const suggestedRestFor = (exercise, reps) => {
    const name = `${exercise?.exerciseName || ''} ${exercise?.category || ''}`.toLowerCase();
    const compound = ['bench', 'squat', 'deadlift', 'press', 'row', 'pull-up', 'pulldown'].some((term) => name.includes(term));
    if (compound && reps <= 5) return 180;
    if (compound && reps <= 10) return 120;
    if (reps >= 15) return 45;
    return 60;
  };

  // 1RM Calculation using Epley sports-science formula
  const calculate1RM = (weight, reps) => {
    const w = Number(weight) || 0;
    const r = Number(reps) || 0;
    if (w <= 0 || r <= 0) return 0;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30));
  };

  // Dynamic Personal Record (PR) Checker against previous performance
  const isNewPR = (exerciseName, weight, reps) => {
    const prev = previousPerformanceMap[exerciseName];
    if (!prev || !Array.isArray(prev.sets) || prev.sets.length === 0) return false;
    const current1RM = calculate1RM(weight, reps);
    if (current1RM <= 0) return false;
    const prevMax1RM = Math.max(...prev.sets.map(s => calculate1RM(s.weight, s.reps)));
    return current1RM > prevMax1RM && prevMax1RM > 0;
  };

  // ---------------------------------------------------------
  // Setup Actions & Set Management
  // ---------------------------------------------------------
  const handleAddExerciseFromPicker = (selectedEx) => {
    if (swappingExerciseId) {
      // Swap existing exercise
      setExercises(prev => prev.map(ex => {
        if (ex.id !== swappingExerciseId) return ex;
        const exCategory = getMuscleGroup(selectedEx.name, selectedEx.categoryName || selectedEx.category);
        return {
          ...ex,
          exerciseName: selectedEx.name,
          category: exCategory,
          muscle: exCategory,
          exerciseId: selectedEx._id || selectedEx.id || null
        };
      }));
      setSwappingExerciseId(null);
      setIsPickerOpen(false);
      fetchPreviousPerformance(selectedEx.name);
      return;
    }

    const exCategory = getMuscleGroup(selectedEx.name, selectedEx.categoryName || selectedEx.category);
    const newEx = {
      id: `ex_${Date.now()}_${exercises.length}`,
      exerciseId: selectedEx._id || selectedEx.id || null,
      exerciseName: selectedEx.name,
      category: exCategory,
      muscle: exCategory,
      notes: '',
      sets: [
        { id: `set_${Date.now()}_0`, setNumber: 1, type: 'normal', weight: 0, reps: 10, completed: false },
        { id: `set_${Date.now()}_1`, setNumber: 2, type: 'normal', weight: 0, reps: 10, completed: false },
        { id: `set_${Date.now()}_2`, setNumber: 3, type: 'normal', weight: 0, reps: 10, completed: false }
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
          type: 'normal',
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

  const handleAddSet = (exId) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet = {
        id: `set_${Date.now()}_${ex.sets.length}`,
        setNumber: ex.sets.length + 1,
        type: 'normal',
        weight: lastSet ? (lastSet.weight || 0) : 0,
        reps: lastSet ? (lastSet.reps || 10) : 10,
        completed: false
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    }));
  };

  const handleRemoveSet = (exId, setIdx) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId || ex.sets.length <= 1) return ex;
      const filtered = ex.sets.filter((_, idx) => idx !== setIdx);
      const renumbered = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...ex, sets: renumbered };
    }));
  };

  const handleDuplicateSet = (exId, setIdx) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const target = ex.sets[setIdx];
      const newSet = {
        id: `set_${Date.now()}_${ex.sets.length}`,
        setNumber: ex.sets.length + 1,
        type: target.type || 'normal',
        weight: target.weight || 0,
        reps: target.reps || 10,
        completed: false
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    }));
  };

  const handleToggleSetType = (exId, setIdx) => {
    const cycle = ['normal', 'warmup', 'dropset', 'failure'];
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const updatedSets = [...ex.sets];
      const current = updatedSets[setIdx].type || 'normal';
      const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
      updatedSets[setIdx] = { ...updatedSets[setIdx], type: next };
      return { ...ex, sets: updatedSets };
    }));
  };

  const handleUpdateSet = (exId, setIdx, field, value) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exId) return ex;
      const updatedSets = [...ex.sets];
      
      let parsedVal;
      if (value === '') {
        parsedVal = '';
      } else if (field === 'weight') {
        const num = parseFloat(value);
        parsedVal = isNaN(num) ? '' : num;
      } else {
        const num = parseInt(value, 10);
        parsedVal = isNaN(num) ? '' : num;
      }

      updatedSets[setIdx] = {
        ...updatedSets[setIdx],
        [field]: parsedVal
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

  // ---------------------------------------------------------
  // Explicit Workout Start Action (Transitions SETUP -> ACTIVE)
  // ---------------------------------------------------------
  const handleExplicitStartWorkout = () => {
    setSetupValidationError('');

    if (exercises.length === 0) {
      setSetupValidationError('Please select at least 1 exercise before starting your workout-session.');
      return;
    }

    const hasUnconfiguredSet = exercises.some(ex => {
      return ex.sets.some(s => Number(s.reps) <= 0);
    });

    if (hasUnconfiguredSet) {
      setSetupValidationError('Please configure target reps (at least 1 rep) for all sets.');
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
  // Explicit Set Completion Action & Smart Auto-Rest
  // ---------------------------------------------------------
  const handleCompleteSet = (exIdx, setIdx) => {
    const targetEx = exercises[exIdx];
    if (!targetEx) return;

    const targetSet = targetEx.sets[setIdx];
    if (!targetSet) return;

    const newCompletedStatus = !targetSet.completed;

    setExercises(prev => prev.map((ex, eI) => {
      if (eI !== exIdx) return ex;
      const updatedSets = [...ex.sets];
      updatedSets[setIdx] = {
        ...updatedSets[setIdx],
        completed: newCompletedStatus,
        completedAt: newCompletedStatus ? new Date().toISOString() : null
      };

      // Real-World Gym QoL: Forward-fill weight to subsequent uncompleted sets if they are empty or 0
      if (newCompletedStatus) {
        const loggedWeight = Number(updatedSets[setIdx].weight) || 0;
        const loggedReps = Number(updatedSets[setIdx].reps) || 0;
        for (let i = setIdx + 1; i < updatedSets.length; i++) {
          if (!updatedSets[i].completed && (!updatedSets[i].weight || updatedSets[i].weight === 0)) {
            updatedSets[i] = {
              ...updatedSets[i],
              weight: loggedWeight,
              reps: updatedSets[i].reps || loggedReps
            };
          }
        }
      }

      return { ...ex, sets: updatedSets };
    }));

    if (newCompletedStatus) {
      // Auto-start sports-science rest countdown
      const suggestedRest = suggestedRestFor(targetEx, Number(targetSet.reps) || 0);
      setRestTimer({
        secondsRemaining: suggestedRest,
        initialDuration: suggestedRest,
        isFinished: false
      });

      // Advance active focus to next incomplete set across exercises
      let nextFocus = null;
      let allSetsDone = true;

      for (let eI = 0; eI < exercises.length; eI++) {
        const curEx = exercises[eI];
        for (let sI = 0; sI < curEx.sets.length; sI++) {
          const isThisSet = eI === exIdx && sI === setIdx;
          if (!curEx.sets[sI].completed && !isThisSet) {
            allSetsDone = false;
            if (!nextFocus) {
              nextFocus = { exIdx: eI, setIdx: sI };
            }
          }
        }
      }

      if (nextFocus) {
        setActiveSetFocus(nextFocus);
      } else if (allSetsDone) {
        // All sets in workout completed! Trigger final summary review
        setShowSummaryModal(true);
      }
    }
  };

  // Rest & Transition Actions
  const handleTakeRest = (seconds = 60) => {
    setRestTimer({
      secondsRemaining: seconds,
      initialDuration: seconds,
      isFinished: false
    });
  };

  const handleNextSetNow = () => {
    setRestTimer(null);
    setLastCompletedSetInfo(null);

    let found = false;
    for (let eI = 0; eI < exercises.length; eI++) {
      for (let sI = 0; sI < exercises[eI].sets.length; sI++) {
        if (!exercises[eI].sets[sI].completed) {
          setActiveSetFocus({ exIdx: eI, setIdx: sI });
          found = true;
          break;
        }
      }
      if (found) break;
    }
  };

  // Submit Workout Completion to MongoDB Atlas (With Offline Network Fallback)
  const handleFinishWorkout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
      const estimatedCalories = Math.round(durationMinutes * 7 + completedSetsCount * 5);
      const primaryMuscle = getPrimaryMuscleGroup(exercises);

      const formattedExercises = exercises
        .map(ex => {
          const exMuscle = ex.category || ex.muscle || getMuscleGroup(ex.exerciseName);
          const completedSets = ex.sets.filter(s => s.completed);
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
              type: s.type || 'normal',
              rest: 60
            }))
          };
        })
        .filter(ex => ex.sets.length > 0);

      const payload = {
        title: workoutTitle.trim() || 'workout-session',
        category: primaryMuscle,
        muscle: primaryMuscle,
        status: 'completed',
        durationMinutes,
        calories: estimatedCalories,
        isPublic,
        startedAt: startedAt ? startedAt.toISOString() : new Date().toISOString(),
        exercises: formattedExercises
      };

      try {
        const res = await api.post('/workouts', payload);

        if (res.data?.success || res.status === 201) {
          if (res.data?.achievements?.length) window.dispatchEvent(new CustomEvent('achievementUnlocked', { detail: res.data.achievements }));
          localStorage.removeItem(ACTIVE_SESSION_KEY);
          setSessionState('COMPLETED');

          const savedWorkout = res.data?.workout || payload;

          window.dispatchEvent(new CustomEvent('workoutCompleted', { detail: savedWorkout }));
          if (typeof refreshStats === 'function') refreshStats();
          else if (typeof fetchRealTimeStats === 'function') fetchRealTimeStats();
          else if (typeof triggerUpdate === 'function') triggerUpdate();

          const createdId = savedWorkout._id || savedWorkout.id;
          setShowSummaryModal(false);

          if (createdId) {
            navigate(`/workout-details/${createdId}`, {
              state: { workout: savedWorkout, message: '🎉 workout-session logged successfully!' }
            });
          } else {
            navigate('/workouts', { state: { workoutCompleted: true } });
          }
        } else {
          throw new Error(res.data?.message || 'Failed to save workout-session');
        }
      } catch (cloudErr) {
        console.warn('Direct cloud sync delayed, saving offline backup locally:', cloudErr);
        // Offline resilience fallback
        const offlineQueue = JSON.parse(localStorage.getItem('offline_workouts_queue') || '[]');
        offlineQueue.push({ ...payload, offlineLoggedAt: new Date().toISOString() });
        localStorage.setItem('offline_workouts_queue', JSON.stringify(offlineQueue));
        localStorage.removeItem(ACTIVE_SESSION_KEY);
        setSessionState('COMPLETED');
        setShowSummaryModal(false);
        navigate('/workouts', {
          state: {
            workoutCompleted: true,
            message: 'Workout logged! Saved locally and queued for cloud sync.'
          }
        });
      }
    } catch (err) {
      console.error('Failed to process workout submission:', err);
      alert(`Error saving workout: ${err.message || 'Error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAbandon = () => {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setSessionState('ABANDONED');
    navigate('/dashboard');
  };

  // Plate Calculator Computation
  const plateBreakdown = useMemo(() => {
    const total = Number(plateCalcModal.weight) || 0;
    const bar = Number(plateCalcModal.barWeight) || 20;
    const net = Math.max(0, total - bar);
    const perSide = net / 2;

    const denominations = [25, 20, 15, 10, 5, 2.5, 1.25];
    const plates = [];
    let rem = perSide;

    denominations.forEach(den => {
      const count = Math.floor(rem / den);
      if (count > 0) {
        plates.push({ weight: den, count });
        rem = Math.round((rem - count * den) * 100) / 100;
      }
    });

    return { total, bar, perSide, plates };
  }, [plateCalcModal.weight, plateCalcModal.barWeight]);

  return (
    <div className="min-h-screen bg-black text-white pb-32 workout-session-page">
      
      {/* =========================================================
          1. STICKY TOP HEADER NAVIGATION (FIXED LIGHT/DARK CONTRAST)
         ========================================================= */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800/80 backdrop-blur-md px-3 sm:px-4 py-3 session-header-nav">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2.5">
          
          <button
            onClick={() => {
              if (['ACTIVE', 'RESTING', 'SET_COMPLETED'].includes(sessionState)) {
                setShowAbandonModal(true);
              } else {
                navigate('/dashboard');
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0 header-back-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> <span>Back to Dashboard</span>
          </button>

          {/* Header Title & Status Badge */}
          <div className="text-center min-w-0 flex-1 px-1">
            <h1 className="text-sm sm:text-base font-black text-white tracking-wide truncate max-w-[200px] sm:max-w-xs mx-auto session-title-text">
              {workoutTitle}
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-0.5">
              <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider session-status-badge ${
                ['ACTIVE', 'RESTING', 'SET_COMPLETED'].includes(sessionState)
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                  : 'bg-neutral-800/90 text-neutral-300 border border-neutral-700/60'
              }`}>
                {sessionState === 'WORKOUT_SETUP' && 'Setup Mode'}
                {sessionState === 'READY_TO_START' && 'Ready to Start'}
                {sessionState === 'ACTIVE' && 'Session Active'}
                {sessionState === 'RESTING' && 'Resting'}
                {sessionState === 'SET_COMPLETED' && 'Set Completed'}
              </span>

              {['ACTIVE', 'RESTING', 'SET_COMPLETED'].includes(sessionState) && (
                <span className="text-xs font-mono font-bold text-red-400 flex items-center gap-1 ml-1 session-live-timer">
                  <Clock className="w-3 h-3 text-red-500" /> {formatTimer(elapsedSeconds)}
                </span>
              )}
            </div>
          </div>

          {/* Action / Finish Button */}
          {['ACTIVE', 'RESTING', 'SET_COMPLETED'].includes(sessionState) ? (
            <button
              onClick={() => setShowSummaryModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1 shrink-0"
            >
              <span>Finish</span> <Check className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          ) : (
            <div className="w-16 shrink-0" />
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
        
        {/* =========================================================
            STAGE 1 & 2: WORKOUT SETUP / READY TO START SCREEN
           ========================================================= */}
        {['WORKOUT_SETUP', 'READY_TO_START'].includes(sessionState) && (
          <div className="space-y-4 sm:space-y-6">
            
            {/* Title & Metadata Card */}
            <div className="p-3.5 sm:p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-3 shadow-lg session-card">
              <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-wider">
                <Dumbbell className="w-4 h-4" /> Prepare Your workout-session
              </div>

              <div>
                <label className="text-[10px] sm:text-[11px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">
                  workout-session Name
                </label>
                <input
                  type="text"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder="e.g. Push Heavy, Leg Day Blast..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base font-black text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 pt-2 border-t border-neutral-800/80">
                <span className="font-bold text-white">{exercises.length} Exercises Configured</span>
                <span className="font-mono">Target: {totalSetsCount} Sets Total</span>
              </div>
            </div>

            {/* Exercises List Configuration */}
            {exercises.length === 0 ? (
              <div className="p-6 sm:p-8 bg-neutral-900/60 border border-neutral-800 border-dashed rounded-2xl text-center space-y-3 shadow-inner session-card">
                <div className="w-12 h-12 bg-neutral-800 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No Exercises Added Yet</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto mt-1">
                    Select exercises to configure target weights, reps, and warm-ups before training.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSwappingExerciseId(null);
                    setIsPickerOpen(true);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20 inline-flex items-center gap-2 start-session-btn"
                >
                  <Plus className="w-4 h-4" /> Select Exercise
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {exercises.map((ex, exIdx) => {
                  const prevPerf = previousPerformanceMap[ex.exerciseName];

                  return (
                    <div key={ex.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg session-card">
                      
                      {/* Exercise Header */}
                      <div className="p-3 sm:p-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-xs shrink-0">
                            {exIdx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-black text-white truncate">{ex.exerciseName}</h4>
                            <span className="text-[10px] text-red-400 font-bold uppercase">{ex.category}</span>
                          </div>
                        </div>

                        {/* Exercise Actions: Sets Counter [-] 3 [+], Swap, Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Set Count Adjuster */}
                          <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-xl px-1.5 py-0.5">
                            <span className="text-[10px] font-bold text-neutral-400 mr-1">Sets:</span>
                            <button
                              onClick={() => handleUpdateTargetSetsCount(ex.id, -1)}
                              className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-white font-mono">{ex.sets.length}</span>
                            <button
                              onClick={() => handleUpdateTargetSetsCount(ex.id, 1)}
                              className="w-5 h-5 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center text-xs font-bold"
                            >
                              +
                            </button>
                          </div>

                          {/* Swap Movement Button */}
                          <button
                            onClick={() => {
                              setSwappingExerciseId(ex.id);
                              setIsPickerOpen(true);
                            }}
                            className="p-1.5 text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 rounded-xl"
                            title="Swap Exercise Movement"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Exercise Button */}
                          <button
                            onClick={() => handleRemoveExercise(ex.id)}
                            className="p-1.5 text-neutral-500 hover:text-red-400 bg-neutral-950 border border-neutral-800 rounded-xl"
                            title="Remove Exercise"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Previous Performance Real Badge */}
                      {prevPerf && (
                        <div className="px-3 py-1.5 bg-neutral-950/70 border-b border-neutral-800/60 flex items-center gap-2 text-xs text-neutral-400">
                          <History className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                          <span className="font-semibold text-neutral-300">Last ({new Date(prevPerf.date).toLocaleDateString()}):</span>
                          <span className="truncate text-neutral-400 font-mono text-[11px]">
                            {prevPerf.sets.map(s => `${s.weight}kg × ${s.reps}`).join(' | ')}
                          </span>
                        </div>
                      )}

                      {/* Target Set Configuration Table */}
                      <div className="p-3 sm:p-4 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-800/80">
                              <th className="pb-2 pl-2 w-14">Set Type</th>
                              <th className="pb-2">Target Weight (kg)</th>
                              <th className="pb-2">Target Reps</th>
                              <th className="pb-2 text-right pr-2">Quick Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800/40">
                            {ex.sets.map((set, setIdx) => {
                              const typeBadge = {
                                normal: { label: set.setNumber, color: 'bg-neutral-800 text-neutral-300' },
                                warmup: { label: 'W', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
                                dropset: { label: 'D', color: 'bg-purple-500/20 text-purple-400 border border-purple-500/40' },
                                failure: { label: 'F', color: 'bg-red-500/20 text-red-400 border border-red-500/40' }
                              }[set.type || 'normal'];

                              return (
                                <tr key={set.id}>
                                  {/* Set Type Pill Button (Normal, Warmup, Drop, Failure) */}
                                  <td className="py-2.5 pl-2 font-mono">
                                    <button
                                      onClick={() => handleToggleSetType(ex.id, setIdx)}
                                      className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center ${typeBadge.color}`}
                                      title="Toggle Set Type (Normal -> Warmup -> Drop -> Failure)"
                                    >
                                      {typeBadge.label}
                                    </button>
                                  </td>

                                  {/* Weight Input & Plate Calc Button */}
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
                                        value={set.weight !== undefined && set.weight !== null ? set.weight : ''}
                                        onChange={(e) => handleUpdateSet(ex.id, setIdx, 'weight', e.target.value)}
                                        className="w-14 sm:w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-1.5 py-1 text-center font-bold text-white font-mono text-[11px] sm:text-xs"
                                        placeholder="0"
                                      />
                                      <button
                                        onClick={() => adjustSetField(ex.id, setIdx, 'weight', 2.5)}
                                        className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                                      >
                                        +
                                      </button>

                                      {/* 1-Tap Plate Breakdown Helper */}
                                      <button
                                        onClick={() => setPlateCalcModal({ isOpen: true, weight: Number(set.weight) || 60, barWeight: 20 })}
                                        className="p-1 rounded bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-amber-400"
                                        title="Plate Loading Breakdown"
                                      >
                                        <Scale className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>

                                  {/* Reps Input */}
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
                                        className="w-12 sm:w-14 bg-neutral-950 border border-neutral-800 rounded-lg px-1.5 py-1 text-center font-bold text-white font-mono text-[11px] sm:text-xs"
                                        placeholder="10"
                                      />
                                      <button
                                        onClick={() => adjustSetField(ex.id, setIdx, 'reps', 1)}
                                        className="w-7 h-7 rounded bg-neutral-800 hover:bg-neutral-700 text-white flex items-center justify-center font-bold"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>

                                  {/* Quick Action: Duplicate Set */}
                                  <td className="py-2.5 text-right pr-2">
                                    <button
                                      onClick={() => handleDuplicateSet(ex.id, setIdx)}
                                      className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white inline-flex items-center gap-1 text-[10px]"
                                      title="Copy set values to new set"
                                    >
                                      <Copy className="w-3 h-3" />
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

                <button
                  onClick={() => {
                    setSwappingExerciseId(null);
                    setIsPickerOpen(true);
                  }}
                  className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 border-dashed rounded-xl text-xs font-bold text-red-400 flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Another Exercise
                </button>
              </div>
            )}

            {/* =========================================================
                READY TO START SECTION (CLEAN, MODERN, BALANCED PROPORTIONS)
                (REPLACES THE OVERSIZED CLUNKY BUTTON IN IMAGE 4)
               ========================================================= */}
            {exercises.length > 0 && (
              <div className="p-3.5 sm:p-5 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-red-500/30 rounded-2xl space-y-3.5 shadow-xl session-card ready-to-start-card">
                
                {setupValidationError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-300 text-xs font-bold shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{setupValidationError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-red-500 text-[10px] sm:text-xs font-black uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Setup Complete
                    </div>
                    <h3 className="text-xs sm:text-sm font-black text-white">
                      {exercises.length} Exercises Configured • {totalSetsCount} Target Sets
                    </h3>
                    <p className="text-[10px] text-neutral-400">
                      Reps and starting weights are ready. Begin your live session to track sets and rest times.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setSwappingExerciseId(null);
                        setIsPickerOpen(true);
                      }}
                      className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> <span>Add More</span>
                    </button>

                    {/* REFINED, PROPORTIONAL START WORKOUT BUTTON */}
                    <button
                      onClick={handleExplicitStartWorkout}
                      className="px-5 py-2.5 sm:px-6 sm:py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 uppercase tracking-wider transition-all start-session-btn"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>START WORKOUT</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            STAGE 3: ACTIVE WORKOUT MODE
           ========================================================= */}
        {['ACTIVE', 'SET_COMPLETED', 'RESTING'].includes(sessionState) && (
          <div className="space-y-4 sm:space-y-6">

            {/* Real Live Session Metrics Bar */}
            <div className="p-3.5 sm:p-4 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-lg space-y-2.5 session-card">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Completed Volume</span>
                  <p className="text-base sm:text-lg font-black text-red-400 font-mono mt-0.5">{completedVolume.toLocaleString()} kg</p>
                </div>
                <div className="border-x border-neutral-800">
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Sets Done</span>
                  <p className="text-base sm:text-lg font-black text-white font-mono mt-0.5">{completedSetsCount} / {totalSetsCount}</p>
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 uppercase font-bold tracking-wider">Elapsed Time</span>
                  <p className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-0.5">{formatTimer(elapsedSeconds)}</p>
                </div>
              </div>

              {/* Progress Visualization Bar */}
              <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${totalSetsCount > 0 ? Math.min(100, Math.round((completedSetsCount / totalSetsCount) * 100)) : 0}%` }}
                />
              </div>
            </div>

            {/* Floating / Active Rest Countdown Bar (Non-Blocking) */}
            {restTimer && restTimer.secondsRemaining > 0 && (
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-blue-900/40 via-neutral-900 to-neutral-950 border border-blue-500/40 rounded-2xl shadow-xl flex items-center justify-between gap-3 session-card">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Rest Countdown</span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-white">
                      {formatTimer(restTimer.secondsRemaining)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRestTimer(prev => prev ? { ...prev, secondsRemaining: prev.secondsRemaining + 30 } : null)}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold font-mono transition-colors"
                  >
                    +30s
                  </button>
                  <button
                    onClick={() => setRestTimer(prev => prev ? { ...prev, secondsRemaining: Math.max(0, prev.secondsRemaining - 15) } : null)}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-bold font-mono transition-colors"
                  >
                    -15s
                  </button>
                  <button
                    onClick={() => setRestTimer(null)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* Rest Complete Feedback Toast */}
            {restTimer && restTimer.isFinished && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-300 font-bold shadow-md session-card animate-bounce">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Rest Complete! Ready for your next set.</span>
                </div>
                <button
                  onClick={() => setRestTimer(null)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Active Exercises List & Set Entry Table */}
            <div className="space-y-3 sm:space-y-4">
              {exercises.map((ex, exIdx) => {
                const prevPerf = previousPerformanceMap[ex.exerciseName];

                return (
                  <div key={ex.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg session-card">
                    <div className="p-3 sm:p-4 bg-neutral-900/90 border-b border-neutral-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-bold text-xs">
                          {exIdx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white">{ex.exerciseName}</h4>
                          <span className="text-[10px] text-red-400 font-bold uppercase">{ex.category}</span>
                        </div>
                      </div>

                      {/* Plate Calculator Button */}
                      <button
                        onClick={() => setPlateCalcModal({ isOpen: true, weight: Number(ex.sets[0]?.weight) || 60, barWeight: 20 })}
                        className="px-2.5 py-1 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-300 hover:text-amber-400 text-[10px] font-bold flex items-center gap-1"
                      >
                        <Scale className="w-3.5 h-3.5" /> <span>Plate Calc</span>
                      </button>
                    </div>

                    {/* Previous Performance Real Badge */}
                    {prevPerf && (
                      <div className="px-3 py-1.5 bg-neutral-950/70 border-b border-neutral-800/60 flex items-center gap-2 text-xs text-neutral-400">
                        <History className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                        <span className="font-semibold text-neutral-300">Last:</span>
                        <span className="truncate text-neutral-400 font-mono text-[11px]">
                          {prevPerf.sets.map(s => `${s.weight}kg × ${s.reps}`).join(' | ')}
                        </span>
                      </div>
                    )}

                    {/* Sets Logging Table */}
                    <div className="p-3 sm:p-4 overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="text-neutral-500 uppercase tracking-wider font-semibold border-b border-neutral-800/80">
                            <th className="pb-2 pl-2 w-12">Set</th>
                            <th className="pb-2">Weight (kg)</th>
                            <th className="pb-2">Reps</th>
                            <th className="pb-2 text-center">1RM Est</th>
                            <th className="pb-2 text-right pr-2">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/40">
                          {ex.sets.map((set, setIdx) => {
                            const isFocused = activeSetFocus.exIdx === exIdx && activeSetFocus.setIdx === setIdx;
                            const typeBadge = {
                              normal: { label: set.setNumber, color: 'bg-neutral-800 text-neutral-300' },
                              warmup: { label: 'W', color: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
                              dropset: { label: 'D', color: 'bg-purple-500/20 text-purple-400 border border-purple-500/40' },
                              failure: { label: 'F', color: 'bg-red-500/20 text-red-400 border border-red-500/40' }
                            }[set.type || 'normal'];

                            const est1RM = calculate1RM(set.weight, set.reps);
                            const isPR = isNewPR(ex.exerciseName, set.weight, set.reps);

                            return (
                              <tr 
                                key={set.id} 
                                className={`transition-colors ${
                                  set.completed 
                                    ? 'bg-emerald-500/10' 
                                    : isFocused 
                                    ? 'bg-red-500/10 border-l-4 border-red-500' 
                                    : 'hover:bg-neutral-800/30'
                                }`}
                              >
                                <td className="py-2.5 pl-2 font-mono">
                                  <button
                                    onClick={() => handleToggleSetType(ex.id, setIdx)}
                                    className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center ${typeBadge.color}`}
                                    title="Toggle Set Type (Normal / Warmup / Dropset / Failure)"
                                  >
                                    {typeBadge.label}
                                  </button>
                                </td>

                                {/* Weight Input */}
                                <td className="py-2.5 pr-2">
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'weight', -2.5)}
                                      className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      inputMode="decimal"
                                      step="0.5"
                                      value={set.weight !== undefined && set.weight !== null ? set.weight : ''}
                                      onChange={(e) => handleUpdateSet(ex.id, setIdx, 'weight', e.target.value)}
                                      className="w-14 sm:w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-center text-xs font-bold text-white font-mono focus:outline-none focus:border-red-500"
                                      placeholder="0"
                                    />
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'weight', 2.5)}
                                      className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
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
                                      className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      inputMode="numeric"
                                      value={set.reps || ''}
                                      onChange={(e) => handleUpdateSet(ex.id, setIdx, 'reps', e.target.value)}
                                      className="w-12 sm:w-14 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-center text-xs font-bold text-white font-mono focus:outline-none focus:border-red-500"
                                      placeholder="10"
                                    />
                                    <button
                                      onClick={() => adjustSetField(ex.id, setIdx, 'reps', 1)}
                                      className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs"
                                    >
                                      +
                                    </button>
                                  </div>
                                </td>

                                {/* 1RM Estimate & PR Badge */}
                                <td className="py-2.5 px-2 text-center font-mono">
                                  {est1RM > 0 ? (
                                    <div className="inline-flex flex-col items-center">
                                      <span className="font-bold text-neutral-300 text-[11px]">{est1RM} kg</span>
                                      {isPR && (
                                        <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-1 py-0.5 rounded border border-amber-500/30 flex items-center gap-0.5">
                                          <Sparkles className="w-2.5 h-2.5" /> PR
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-neutral-600">-</span>
                                  )}
                                </td>

                                {/* Complete Set Action Button */}
                                <td className="py-2.5 text-right pr-2">
                                  <div className="inline-flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleDuplicateSet(ex.id, setIdx)}
                                      className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
                                      title="Duplicate this set"
                                    >
                                      <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    {ex.sets.length > 1 && (
                                      <button
                                        onClick={() => handleRemoveSet(ex.id, setIdx)}
                                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                                        title="Delete this set"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleCompleteSet(exIdx, setIdx)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 ${
                                        set.completed
                                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                          : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 start-session-btn'
                                      }`}
                                    >
                                      {set.completed ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Done
                                        </>
                                      ) : (
                                        <>
                                          <Check className="w-3.5 h-3.5 stroke-[3]" /> Log Set
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Card Footer: Add Set & Progress */}
                    <div className="px-3 sm:px-4 py-2.5 bg-neutral-950/40 border-t border-neutral-800/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAddSet(ex.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5 text-red-400" />
                          <span>Add Set</span>
                        </button>
                        <button
                          onClick={() => {
                            setSwappingExerciseId(ex.id);
                            setIsPickerOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-medium text-xs transition-colors"
                          title="Replace this exercise"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span className="hidden sm:inline">Swap</span>
                        </button>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-medium">
                        <span className="text-white font-bold">{ex.sets.filter(s => s.completed).length}</span> / {ex.sets.length} sets completed
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Exercise to Workout (On-the-fly during active session) */}
            <div className="pt-2 pb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => {
                  setSwappingExerciseId(null);
                  setIsPickerOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white font-bold text-sm shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 text-red-500" />
                <span>Add Exercise to Workout</span>
              </button>

              <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Real-time sync &bull; 1RM calculations &bull; Local storage protected</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================
          PLATE CALCULATOR MODAL (REAL-WORLD GYM UTILITY)
         ========================================================= */}
      {plateCalcModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl session-card">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-black text-white">Barbell Plate Loading Helper</h3>
              </div>
              <button
                onClick={() => setPlateCalcModal(prev => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Total Weight:</span>
                <span className="font-black text-white font-mono text-sm">{plateBreakdown.total} kg</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Barbell:</span>
                <span className="font-bold text-neutral-300 font-mono">{plateBreakdown.bar} kg (Olympic)</span>
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Plates Needed Per Side: ({plateBreakdown.perSide} kg)
                </span>
                {plateBreakdown.plates.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No plates needed (weight ≤ barbell).</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {plateBreakdown.plates.map((p, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-lg text-xs font-mono font-bold">
                        {p.count} × {p.weight} kg
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setPlateCalcModal(prev => ({ ...prev, isOpen: false }))}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Exercise Picker Modal */}
      <ExercisePickerModal
        isOpen={isPickerOpen}
        onClose={() => {
          setIsPickerOpen(false);
          setSwappingExerciseId(null);
        }}
        onSelectExercise={handleAddExerciseFromPicker}
        selectedExerciseNames={exercises.map(ex => ex.exerciseName)}
      />

      {/* Workout Completion Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-5 shadow-2xl session-card">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">Workout Complete!</h3>
              <p className="text-xs text-neutral-400">Great work. Here is your session summary.</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-center">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Duration</span>
                <p className="text-base font-black text-white font-mono mt-0.5">{formatTimer(elapsedSeconds)}</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Total Volume</span>
                <p className="text-base font-black text-red-400 font-mono mt-0.5">{completedVolume.toLocaleString()} kg</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Exercises</span>
                <p className="text-base font-black text-white font-mono mt-0.5">{exercises.length}</p>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase font-bold">Sets Done</span>
                <p className="text-base font-black text-emerald-400 font-mono mt-0.5">{completedSetsCount} / {totalSetsCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl"
              >
                Keep Editing
              </button>
              <button
                onClick={handleFinishWorkout}
                disabled={isSubmitting}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Saving...' : 'Save Workout'} <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abandon Confirmation Modal */}
      {showAbandonModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 sm:p-6 max-w-md w-full space-y-4 shadow-2xl session-card">
            <div className="flex items-center gap-2.5 text-amber-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-base font-black text-white">Leave Active Workout?</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Your workout-session is active. If you leave now without saving, this session draft will be discarded.
            </p>
            <div className="flex items-center gap-2.5 pt-2">
              <button
                onClick={() => setShowAbandonModal(false)}
                className="flex-1 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-xl"
              >
                Keep Training
              </button>
              <button
                onClick={handleConfirmAbandon}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-red-600/20"
              >
                Discard Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
