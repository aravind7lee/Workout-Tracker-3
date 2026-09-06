import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Dumbbell, ArrowLeft, CheckCircle2, Clock, Flame, 
  Layers, Award, Info, TrendingUp, Sparkles, Hash
} from 'lucide-react';
import api from '../utils/api';
import { getMuscleGroup, getPrimaryMuscleGroup, getMuscleGroupTheme, getExerciseDisplayName } from '../utils/muscleGroupHelper';
import ExerciseProgressionChart from '../components/ExerciseProgressionChart';
import WorkoutShareCard from '../components/WorkoutShareCard';
import { exportSingleWorkoutPDF } from '../utils/exportWorkouts';

export default function WorkoutDetails() {
  const { workoutId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      setLoading(true);

      // Check if workout was passed via navigation state first for instant display
      if (location.state?.workout) {
        const passedWorkout = location.state.workout;
        if (passedWorkout._id === workoutId || passedWorkout.id === workoutId) {
          setWorkout(normalizeWorkoutData(passedWorkout));
          setLoading(false);
          return;
        }
      }

      try {
        if (workoutId) {
          // Attempt API fetch from MongoDB Atlas
          try {
            const res = await api.get(`/workouts/${workoutId}`);
            if (res.data) {
              const data = res.data.workout || res.data;
              setWorkout(normalizeWorkoutData(data));
              setLoading(false);
              return;
            }
          } catch (apiError) {
            console.warn('API fetch for workout detail failed, trying local storage:', apiError.message);
          }

          // Fallback to localStorage
          let workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
          if (workouts.length === 0) {
            workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
          }
          const found = workouts.find((w) => (w._id || w.id)?.toString() === workoutId);
          if (found) {
            setWorkout(normalizeWorkoutData(found));
          } else {
            setWorkout(null);
          }
        }
      } catch (err) {
        console.error('Error in WorkoutDetails:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [workoutId, location.state]);

  const normalizeWorkoutData = (data) => {
    if (!data) return null;

    const rawExercises = Array.isArray(data.exercises) ? data.exercises : [];

    // Clean and normalize exercises
    const exercises = rawExercises.map((ex, idx) => {
      const rawExerciseName = ex.exerciseName || ex.name || (ex.exercise && ex.exercise.name) || (typeof ex.exercise === 'string' ? ex.exercise : '') || `Exercise ${idx + 1}`;
      const exerciseName = getExerciseDisplayName(rawExerciseName);
      const exerciseCategory = ex.category || ex.muscle || (ex.exercise && (ex.exercise.category || (ex.exercise.muscles && ex.exercise.muscles[0]))) || getMuscleGroup(exerciseName);
      
      const rawSets = Array.isArray(ex.sets) ? ex.sets : (Array.isArray(ex.setsData) ? ex.setsData : []);
      const sets = rawSets.map((s, sIdx) => ({
        setNumber: s.setNumber || sIdx + 1,
        weight: Number(s.weight) || 0,
        reps: Number(s.reps) || 0,
        rest: Number(s.rest) || 60,
        completed: s.completed !== undefined ? Boolean(s.completed) : true
      }));

      const exSetsCount = sets.length;
      const exTotalReps = sets.reduce((sum, s) => sum + s.reps, 0);
      const exTotalVolume = sets.reduce((sum, s) => sum + (s.weight * s.reps), 0);

      return {
        ...ex,
        exerciseName,
        category: exerciseCategory,
        muscle: exerciseCategory,
        sets,
        setsCount: exSetsCount,
        totalReps: exTotalReps,
        totalVolume: exTotalVolume,
        notes: ex.notes || ''
      };
    });

    const totalSets = exercises.reduce((sum, ex) => sum + ex.setsCount, 0);
    const totalReps = exercises.reduce((sum, ex) => sum + ex.totalReps, 0);
    const totalVolume = data.totalVolume || exercises.reduce((sum, ex) => sum + ex.totalVolume, 0);

    const primaryCategory = data.category || data.muscle || getPrimaryMuscleGroup(exercises) || getMuscleGroup(data.title || data.name);

    return {
      ...data,
      id: data._id || data.id,
      title: data.title || data.name || data.exercise || 'Workout Session',
      category: primaryCategory,
      muscle: primaryCategory,
      completedAt: data.completedAt || data.date || data.createdAt || new Date().toISOString(),
      duration: data.durationMinutes ? data.durationMinutes * 60 : (data.duration || 0),
      caloriesBurned: data.calories || data.caloriesBurned || 0,
      exercises,
      sets: totalSets,
      reps: totalReps,
      totalVolume,
      status: data.status || 'completed'
    };
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 animate-pulse">
          <div className="w-16 h-16 bg-neutral-800 rounded-2xl mx-auto flex items-center justify-center text-orange-500">
            <Dumbbell className="w-8 h-8 animate-spin" />
          </div>
          <p className="text-sm font-bold text-neutral-400">Loading workout details...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl mx-auto flex items-center justify-center text-neutral-500">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Workout Not Found</h2>
          <p className="text-xs text-neutral-400">This workout could not be located or may have been removed.</p>
          <button
            onClick={() => navigate('/workouts')}
            className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  const theme = getMuscleGroupTheme(workout.category || workout.muscle);

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Top Header Navigation */}
      <div className="sticky top-0 z-30 bg-black/90 border-b border-neutral-800/80 backdrop-blur-md px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate('/workouts')}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 hover:text-white text-xs font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            <span>BACK TO WORKOUTS</span>
          </button>
          <span className="text-[11px] font-mono font-bold text-neutral-400">
            ID: {workout.id?.toString().slice(-8) || 'N/A'}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        <div className="flex justify-end"><button onClick={() => exportSingleWorkoutPDF(workout)} className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-black text-white">Export workout PDF</button></div>
        
        {/* =========================================================
            1. HERO WORKOUT CARD: Title, Muscle Group Badge, Date
           ========================================================= */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl sm:rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Prominent Muscle Group Badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider ${theme.bg} ${theme.border} ${theme.text} border shadow-sm`}>
                    <span>{theme.icon}</span> {theme.name}
                  </span>

                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    ✓ Completed
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight break-words">
                  {workout.title}
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-neutral-400 text-xs pt-3 border-t border-neutral-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Completed on {formatDate(workout.completedAt)}</span>
          </div>
        </div>

        {/* =========================================================
            2. BENTO METRICS BAR: Sets, Reps, Duration, Calories
           ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-center shadow-lg space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
              <Layers className="w-3.5 h-3.5 text-red-400" /> Total Sets
            </span>
            <p className="text-2xl font-black text-white font-mono">{workout.sets}</p>
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-center shadow-lg space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Total Reps
            </span>
            <p className="text-2xl font-black text-white font-mono">{workout.reps}</p>
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-center shadow-lg space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Duration
            </span>
            <p className="text-2xl font-black text-white font-mono">{formatDuration(workout.duration)}</p>
          </div>

          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl text-center shadow-lg space-y-1">
            <span className="text-[10px] text-neutral-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Calories
            </span>
            <p className="text-2xl font-black text-white font-mono">{workout.caloriesBurned}</p>
          </div>
        </div>

        {/* =========================================================
            3. EXERCISES COMPLETED SECTION WITH MUSCLE GROUPS & SETS
           ========================================================= */}
        {workout.exercises && workout.exercises.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-orange-500" />
                <span>Exercises Completed</span>
                <span className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded-full text-xs font-mono">
                  {workout.exercises.length}
                </span>
              </h2>
              {workout.totalVolume > 0 && (
                <span className="text-xs font-bold text-orange-400 font-mono">
                  Total Volume: {workout.totalVolume.toLocaleString()} kg
                </span>
              )}
            </div>

            <div className="space-y-4">
              {workout.exercises.map((ex, idx) => {
                const exTheme = getMuscleGroupTheme(ex.category || ex.muscle);

                return (
                  <div 
                    key={idx} 
                    className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg transition-all hover:border-neutral-700"
                  >
                    {/* Exercise Card Header */}
                    <div className="p-4 bg-neutral-900/90 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                            {ex.exerciseName}
                          </h3>
                          {/* Muscle Group Tag */}
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide ${exTheme.bg} ${exTheme.border} ${exTheme.text} border`}>
                            {exTheme.icon} {exTheme.name}
                          </span>
                        </div>
                      </div>

                      {/* Exercise Summary Stats */}
                      <div className="flex items-center gap-3 text-xs text-neutral-400 self-start sm:self-auto pt-1 sm:pt-0 font-mono">
                        <span><strong>{ex.setsCount}</strong> Sets</span>
                        <span>•</span>
                        <span><strong>{ex.totalReps}</strong> Reps</span>
                        {ex.totalVolume > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-orange-400"><strong>{ex.totalVolume.toFixed(1)}</strong> kg</span>
                          </>
                        )}
                      </div>
                    </div>

                    <ExerciseProgressionChart exerciseName={ex.exerciseName} compact />

                    {/* Set-by-Set Detailed Breakdown Table */}
                    {ex.sets && ex.sets.length > 0 && (
                      <div className="p-4">
                        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-orange-500" /> Set Log
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {ex.sets.map((set, sIdx) => (
                            <div 
                              key={sIdx}
                              className="p-3 bg-neutral-950/80 border border-neutral-800/80 rounded-xl flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-lg bg-neutral-800 text-neutral-300 text-xs font-bold font-mono flex items-center justify-center">
                                  {set.setNumber || sIdx + 1}
                                </span>
                                <span className="text-xs font-bold text-white font-mono">
                                  {set.weight} kg × {set.reps} reps
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                                ✓ Done
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {ex.notes && (
                      <div className="px-4 pb-4 pt-1 text-xs text-neutral-400 italic">
                        Notes: "{ex.notes}"
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Empty Exercises Fallback / Info Card */
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Freestyle Session Record</h3>
            <p className="text-xs text-neutral-400 max-w-md mx-auto">
              This workout session was completed with {workout.sets || 0} logged sets and a duration of {formatDuration(workout.duration)}.
            </p>
          </div>
        )}

        <WorkoutShareCard workout={workout} />

        {/* =========================================================
            4. ADDITIONAL METADATA CARD
           ========================================================= */}
        <div className="p-4 sm:p-5 bg-neutral-900/60 border border-neutral-800 rounded-2xl space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
            <Info className="w-4 h-4" /> Additional Information
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-neutral-950/60 rounded-xl flex items-center justify-between border border-neutral-800/60">
              <span className="text-neutral-400">Status</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                ✓ Completed
              </span>
            </div>

            <div className="p-3 bg-neutral-950/60 rounded-xl flex items-center justify-between border border-neutral-800/60">
              <span className="text-neutral-400">Primary Muscle Group</span>
              <span className="font-bold text-white">
                {workout.category || workout.muscle || 'General'}
              </span>
            </div>

            {workout.totalVolume > 0 && (
              <div className="p-3 bg-neutral-950/60 rounded-xl flex items-center justify-between border border-neutral-800/60">
                <span className="text-neutral-400">Total Volume</span>
                <span className="font-bold text-orange-400 font-mono">
                  {workout.totalVolume.toLocaleString()} kg
                </span>
              </div>
            )}

            <div className="p-3 bg-neutral-950/60 rounded-xl flex items-center justify-between border border-neutral-800/60">
              <span className="text-neutral-400">Workout ID</span>
              <span className="font-mono text-neutral-300 text-[11px] truncate max-w-[150px]">
                {workout.id || workout._id || 'N/A'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
