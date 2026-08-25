// frontend/src/utils/muscleGroupHelper.js
import { exerciseLibrary } from '../data/exerciseLibrary';

/**
 * Resolves exercise display name if an ID like 'chest-3' was stored instead of the full name
 */
export function getExerciseDisplayName(identifier = '') {
  if (!identifier) return 'Workout Exercise';
  
  const idStr = String(identifier).trim();

  // If identifier matches an exercise ID in exerciseLibrary (like 'chest-3')
  if (exerciseLibrary) {
    for (const catObj of Object.values(exerciseLibrary)) {
      if (catObj && Array.isArray(catObj.exercises)) {
        const found = catObj.exercises.find(
          ex => ex.id && ex.id.toLowerCase() === idStr.toLowerCase()
        );
        if (found && found.name) {
          return found.name;
        }
      }
    }
  }

  // If it's already a full name like "Decline Bench Press", return it!
  return idStr;
}

/**
 * Common exercise name to muscle group mapping dictionary
 */
const EXERCISE_MUSCLE_MAP = {
  // Chest
  'barbell bench press': 'Chest',
  'incline dumbbell press': 'Chest',
  'decline bench press': 'Chest',
  'cable crossover': 'Chest',
  'pec-deck machine': 'Chest',
  'pec deck': 'Chest',
  'weighted dips': 'Chest',
  'push-ups': 'Chest',
  'pushups': 'Chest',
  'incline cable fly': 'Chest',
  'dumbbell bench press': 'Chest',
  'incline barbell press': 'Chest',
  'decline dumbbell press': 'Chest',
  'dumbbell flyes': 'Chest',
  'incline dumbbell flyes': 'Chest',
  'decline cable fly': 'Chest',
  'chest press machine': 'Chest',
  'chest press': 'Chest',
  'bench press': 'Chest',
  'dumbbell fly': 'Chest',

  // Back
  'deadlift': 'Back',
  'barbell deadlift': 'Back',
  'lat pulldown': 'Back',
  'pull-ups': 'Back',
  'pullups': 'Back',
  'chin-ups': 'Back',
  'barbell bent-over row': 'Back',
  'barbell row': 'Back',
  'seated cable row': 'Back',
  'cable row': 'Back',
  't-bar row': 'Back',
  'single-arm dumbbell row': 'Back',
  'dumbbell row': 'Back',
  'chest-supported row': 'Back',
  'straight-arm pulldown': 'Back',
  'hyperextensions': 'Back',
  'back extension': 'Back',

  // Shoulders
  'overhead press': 'Shoulders',
  'military press': 'Shoulders',
  'barbell overhead press': 'Shoulders',
  'dumbbell shoulder press': 'Shoulders',
  'shoulder press': 'Shoulders',
  'lateral raise': 'Shoulders',
  'dumbbell lateral raise': 'Shoulders',
  'front raise': 'Shoulders',
  'rear delt fly': 'Shoulders',
  'face pull': 'Shoulders',
  'face pulls': 'Shoulders',
  'arnold press': 'Shoulders',
  'upright row': 'Shoulders',
  'shrugs': 'Shoulders',
  'dumbbell shrugs': 'Shoulders',

  // Biceps
  'barbell curl': 'Biceps',
  'dumbbell bicep curl': 'Biceps',
  'bicep curl': 'Biceps',
  'hammer curl': 'Biceps',
  'preacher curl': 'Biceps',
  'concentration curl': 'Biceps',
  'incline dumbbell curl': 'Biceps',
  'cable curl': 'Biceps',
  'spider curl': 'Biceps',

  // Triceps
  'tricep pushdown': 'Triceps',
  'rope pushdown': 'Triceps',
  'skull crusher': 'Triceps',
  'skull crushers': 'Triceps',
  'close-grip bench press': 'Triceps',
  'overhead tricep extension': 'Triceps',
  'tricep extension': 'Triceps',
  'tricep dips': 'Triceps',
  'diamond push-ups': 'Triceps',
  'tricep kickback': 'Triceps',

  // Legs / Glutes / Calves
  'barbell squat': 'Legs',
  'squat': 'Legs',
  'back squat': 'Legs',
  'front squat': 'Legs',
  'leg press': 'Legs',
  'romanian deadlift': 'Legs',
  'rdl': 'Legs',
  'lunges': 'Legs',
  'walking lunges': 'Legs',
  'bulgarian split squat': 'Legs',
  'leg extension': 'Legs',
  'hamstring curl': 'Legs',
  'lying leg curl': 'Legs',
  'seated leg curl': 'Legs',
  'calf raise': 'Legs',
  'standing calf raise': 'Legs',
  'seated calf raise': 'Legs',
  'hip thrust': 'Legs',
  'glute bridge': 'Legs',
  'hack squat': 'Legs',
  'goblet squat': 'Legs',

  // Core / Abs
  'plank': 'Core',
  'crunches': 'Core',
  'hanging leg raise': 'Core',
  'leg raise': 'Core',
  'cable crunch': 'Core',
  'ab rollout': 'Core',
  'russian twists': 'Core',
  'bicycle crunches': 'Core',
  'woodchopper': 'Core'
};

/**
 * Resolves the muscle group for a given exercise name or existing category
 */
export function getMuscleGroup(exerciseName = '', existingCategory = '') {
  if (existingCategory && existingCategory !== 'General' && existingCategory !== 'Workout') {
    return existingCategory.charAt(0).toUpperCase() + existingCategory.slice(1);
  }

  if (!exerciseName) return 'General';

  const normalized = exerciseName.toLowerCase().trim();

  // 1. Direct dictionary lookup
  if (EXERCISE_MUSCLE_MAP[normalized]) {
    return EXERCISE_MUSCLE_MAP[normalized];
  }

  // 2. Search exerciseLibrary data
  if (exerciseLibrary) {
    for (const [catKey, catObj] of Object.entries(exerciseLibrary)) {
      if (catObj && Array.isArray(catObj.exercises)) {
        const found = catObj.exercises.some(
          ex => ex.name && ex.name.toLowerCase().trim() === normalized
        );
        if (found) {
          return catObj.name || catKey.charAt(0).toUpperCase() + catKey.slice(1);
        }
      }
    }
  }

  // 3. Substring / Keyword Heuristic Matching
  if (
    normalized.includes('bench') ||
    normalized.includes('chest') ||
    normalized.includes('pec') ||
    normalized.includes('push-up') ||
    normalized.includes('pushup') ||
    (normalized.includes('fly') && !normalized.includes('rear delt'))
  ) {
    return 'Chest';
  }

  if (
    normalized.includes('row') ||
    normalized.includes('lat') ||
    normalized.includes('pull-up') ||
    normalized.includes('pullup') ||
    normalized.includes('chin-up') ||
    normalized.includes('pulldown') ||
    (normalized.includes('deadlift') && !normalized.includes('romanian') && !normalized.includes('rdl'))
  ) {
    return 'Back';
  }

  if (
    normalized.includes('shoulder') ||
    normalized.includes('military') ||
    normalized.includes('overhead') ||
    normalized.includes('lateral raise') ||
    normalized.includes('front raise') ||
    normalized.includes('rear delt') ||
    normalized.includes('face pull') ||
    normalized.includes('shrug') ||
    normalized.includes('arnold')
  ) {
    return 'Shoulders';
  }

  if (
    normalized.includes('bicep') ||
    (normalized.includes('curl') && !normalized.includes('leg') && !normalized.includes('hamstring')) ||
    normalized.includes('preacher') ||
    normalized.includes('hammer')
  ) {
    return 'Biceps';
  }

  if (
    normalized.includes('tricep') ||
    normalized.includes('pushdown') ||
    normalized.includes('skull crusher') ||
    normalized.includes('kickback') ||
    normalized.includes('dip')
  ) {
    return 'Triceps';
  }

  if (
    normalized.includes('squat') ||
    normalized.includes('leg') ||
    normalized.includes('lunge') ||
    normalized.includes('calf') ||
    normalized.includes('calves') ||
    normalized.includes('hamstring') ||
    normalized.includes('quad') ||
    normalized.includes('glute') ||
    normalized.includes('thrust') ||
    normalized.includes('rdl') ||
    normalized.includes('romanian')
  ) {
    return 'Legs';
  }

  if (
    normalized.includes('abs') ||
    normalized.includes('core') ||
    normalized.includes('plank') ||
    normalized.includes('crunch') ||
    normalized.includes('twist') ||
    normalized.includes('rollout')
  ) {
    return 'Core';
  }

  return 'General';
}

/**
 * Determines primary muscle group across a list of exercises
 */
export function getPrimaryMuscleGroup(exercises = []) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return 'General';
  }

  const counts = {};
  exercises.forEach(ex => {
    const name = ex.exerciseName || ex.name || (ex.exercise && ex.exercise.name) || '';
    const cat = ex.category || ex.muscle || (ex.exercise && (ex.exercise.category || (ex.exercise.muscles && ex.exercise.muscles[0]))) || '';
    const muscle = getMuscleGroup(name, cat);
    counts[muscle] = (counts[muscle] || 0) + 1;
  });

  // Sort by frequency
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0] ? sorted[0][0] : 'General';
}

/**
 * Returns color classes and icons for muscle group pills
 */
export function getMuscleGroupTheme(muscle = 'General') {
  const normalized = String(muscle).toLowerCase();

  if (normalized.includes('chest')) {
    return {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      badgeBg: 'bg-red-600',
      icon: '🏋️',
      name: 'Chest'
    };
  }

  if (normalized.includes('back')) {
    return {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
      text: 'text-blue-400',
      badgeBg: 'bg-blue-600',
      icon: '💪',
      name: 'Back'
    };
  }

  if (normalized.includes('shoulder')) {
    return {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
      text: 'text-purple-400',
      badgeBg: 'bg-purple-600',
      icon: '🎯',
      name: 'Shoulders'
    };
  }

  if (normalized.includes('bicep')) {
    return {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-600',
      icon: '💪',
      name: 'Biceps'
    };
  }

  if (normalized.includes('tricep')) {
    return {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
      badgeBg: 'bg-yellow-600',
      icon: '⚡',
      name: 'Triceps'
    };
  }

  if (normalized.includes('leg')) {
    return {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-600',
      icon: '🦵',
      name: 'Legs'
    };
  }

  if (normalized.includes('core') || normalized.includes('ab')) {
    return {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
      text: 'text-pink-400',
      badgeBg: 'bg-pink-600',
      icon: '🔥',
      name: 'Core'
    };
  }

  return {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    badgeBg: 'bg-orange-600',
    icon: '⚡',
    name: muscle || 'General'
  };
}
