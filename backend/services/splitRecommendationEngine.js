const EXERCISES = {
  bench: ['Barbell Bench Press', 'Chest', 'Chest', 'compound'],
  inclinePress: ['Incline Dumbbell Press', 'Chest', 'Chest', 'compound'],
  shoulderPress: ['Seated Dumbbell Shoulder Press', 'Shoulders', 'Shoulders', 'compound'],
  lateralRaise: ['Dumbbell Lateral Raises', 'Shoulders', 'Shoulders', 'isolation'],
  tricepsPushdown: ['Tricep Pushdowns', 'Arms', 'Triceps', 'isolation'],
  pulldown: ['Lat Pulldown', 'Back', 'Lats', 'compound'],
  row: ['Barbell Rows', 'Back', 'Back', 'compound'],
  cableRow: ['Seated Cable Rows', 'Back', 'Back', 'compound'],
  facePull: ['Face Pulls', 'Shoulders', 'Rear Delts', 'isolation'],
  curl: ['Barbell Curls', 'Arms', 'Biceps', 'isolation'],
  squat: ['Barbell Back Squat', 'Legs', 'Quadriceps', 'compound'],
  deadlift: ['Deadlift', 'Back', 'Posterior Chain', 'compound'],
  romanianDeadlift: ['Romanian Deadlift', 'Legs', 'Hamstrings', 'compound'],
  legPress: ['Leg Press', 'Legs', 'Quadriceps', 'compound'],
  legCurl: ['Lying Leg Curl', 'Legs', 'Hamstrings', 'isolation'],
  calfRaise: ['Standing Calf Raises', 'Legs', 'Calves', 'isolation'],
  pushup: ['Push-ups', 'Chest', 'Chest', 'compound'],
  pullup: ['Pull-ups', 'Back', 'Lats', 'compound'],
  plank: ['Plank', 'Core', 'Core', 'isolation'],
  walking: ['Brisk Walking', 'Recovery', 'Full Body', 'cardio'],
  mobility: ['Full Body Mobility', 'Recovery', 'Full Body', 'mobility']
};

const RAW_DAYS = {
  push: ['bench', 'inclinePress', 'shoulderPress', 'lateralRaise', 'tricepsPushdown'],
  pull: ['deadlift', 'pulldown', 'row', 'facePull', 'curl'],
  legs: ['squat', 'romanianDeadlift', 'legPress', 'legCurl', 'calfRaise'],
  upperA: ['bench', 'row', 'shoulderPress', 'pulldown', 'tricepsPushdown', 'curl'],
  lowerA: ['squat', 'romanianDeadlift', 'legPress', 'calfRaise', 'plank'],
  upperB: ['inclinePress', 'pullup', 'cableRow', 'lateralRaise', 'curl', 'tricepsPushdown'],
  lowerB: ['deadlift', 'legPress', 'legCurl', 'calfRaise', 'plank'],
  fullA: ['squat', 'bench', 'row', 'shoulderPress', 'plank'],
  fullB: ['deadlift', 'inclinePress', 'pulldown', 'legPress', 'curl'],
  fullC: ['romanianDeadlift', 'pushup', 'pullup', 'lateralRaise', 'plank'],
  chest: ['bench', 'inclinePress', 'pushup', 'tricepsPushdown'],
  back: ['deadlift', 'pulldown', 'row', 'cableRow', 'facePull'],
  shoulders: ['shoulderPress', 'lateralRaise', 'facePull', 'tricepsPushdown'],
  arms: ['curl', 'tricepsPushdown', 'lateralRaise', 'pushup'],
  recovery: ['walking', 'mobility', 'plank']
};

const SPLITS = {
  full_body_1: {
    splitName: 'Full Body (1x)',
    splitType: 'full_body',
    days: [['Full Body', 'fullA']]
  },
  full_body_2: {
    splitName: 'Full Body (2x)',
    splitType: 'full_body',
    days: [['Full Body A', 'fullA'], ['Full Body B', 'fullB']]
  },
  full_body_3: {
    splitName: 'Full Body (3x)',
    splitType: 'full_body',
    days: [['Full Body A', 'fullA'], ['Full Body B', 'fullB'], ['Full Body C', 'fullC']]
  },
  ppl_3: {
    splitName: 'Push / Pull / Legs (1x)',
    splitType: 'ppl',
    days: [['Push', 'push'], ['Pull', 'pull'], ['Legs', 'legs']]
  },
  upper_lower: {
    splitName: 'Upper / Lower (2x)',
    splitType: 'upper_lower',
    days: [['Upper A', 'upperA'], ['Lower A', 'lowerA'], ['Upper B', 'upperB'], ['Lower B', 'lowerB']]
  },
  upper_lower_full: {
    splitName: 'Upper / Lower + Full Body',
    splitType: 'upper_lower_full',
    days: [['Upper A', 'upperA'], ['Lower A', 'lowerA'], ['Upper B', 'upperB'], ['Lower B', 'lowerB'], ['Full Body', 'fullC']]
  },
  bro_split: {
    splitName: 'Bro Split (5-Day)',
    splitType: 'bro_split',
    days: [['Chest', 'chest'], ['Back', 'back'], ['Shoulders', 'shoulders'], ['Legs', 'legs'], ['Arms', 'arms']]
  },
  ppl_6: {
    splitName: 'Push / Pull / Legs (2x)',
    splitType: 'ppl',
    days: [['Push A', 'push'], ['Pull A', 'pull'], ['Legs A', 'legs'], ['Push B', 'push'], ['Pull B', 'pull'], ['Legs B', 'legs']]
  },
  ppl_recovery: {
    splitName: 'PPL (2x) + Active Recovery',
    splitType: 'ppl_recovery',
    days: [['Push A', 'push'], ['Pull A', 'pull'], ['Legs A', 'legs'], ['Push B', 'push'], ['Pull B', 'pull'], ['Legs B', 'legs'], ['Active Recovery', 'recovery']]
  }
};

const normalizeGoal = (goal) => ({
  lose: 'deficit',
  maintain: 'maintenance',
  gain: 'bulk',
  muscle: 'bulk'
}[goal] || goal || 'maintenance');

const chooseSplit = (frequency, experienceLevel) => {
  if (frequency === 1) return SPLITS.full_body_1;
  if (frequency === 2) return SPLITS.full_body_2;
  if (frequency === 3) return experienceLevel === 'beginner' ? SPLITS.full_body_3 : SPLITS.ppl_3;
  if (frequency === 4) return SPLITS.upper_lower;
  if (frequency === 5) return experienceLevel === 'advanced' ? SPLITS.bro_split : SPLITS.upper_lower_full;
  if (frequency === 6) return SPLITS.ppl_6;
  return SPLITS.ppl_recovery;
};

const prescriptionFor = (goal, type) => {
  if (type === 'cardio') return { sets: '1', reps: '10-15 min', rest: '0 sec' };
  if (type === 'mobility') return { sets: '1', reps: '10 min', rest: '0 sec' };

  if (goal === 'deficit') {
    return { sets: '4', reps: '12-15', rest: type === 'compound' ? '60 sec' : '45 sec' };
  }
  if (goal === 'strength') {
    return type === 'compound'
      ? { sets: '4', reps: '3-6', rest: '180 sec' }
      : { sets: '3', reps: '8-12', rest: '90 sec' };
  }

  return {
    sets: '3',
    reps: type === 'compound' ? '8-12' : '10-15',
    rest: type === 'compound' ? '90 sec' : '60 sec'
  };
};

const buildExercise = (key, goal, dayName) => {
  const [name, category, muscle, type] = EXERCISES[key];
  const prescription = prescriptionFor(goal, type);
  return {
    name,
    ...prescription,
    category,
    muscle,
    notes: `${dayName} ? ${type === 'compound' ? 'compound focus' : type}`
  };
};

export function recommendSplit({ trainingFrequency, goal, experienceLevel = 'beginner' }) {
  const frequency = Number(trainingFrequency);
  const experience = String(experienceLevel).toLowerCase();
  const normalizedGoal = normalizeGoal(String(goal || '').toLowerCase());

  if (!Number.isInteger(frequency) || frequency < 1 || frequency > 7) {
    throw new TypeError('trainingFrequency must be an integer from 1 to 7');
  }
  if (!['beginner', 'intermediate', 'advanced'].includes(experience)) {
    throw new TypeError('experienceLevel is not supported');
  }
  if (!['deficit', 'maintenance', 'bulk', 'strength', 'recomposition'].includes(normalizedGoal)) {
    throw new TypeError('goal is not supported');
  }

  const split = chooseSplit(frequency, experience);
  const days = split.days.map(([dayName, template]) => {
    const exerciseKeys = [...RAW_DAYS[template]];
    if (normalizedGoal === 'deficit' && template !== 'recovery') exerciseKeys.push('walking');
    return {
      dayName,
      focusMuscles: [...new Set(exerciseKeys.map((key) => EXERCISES[key][2]))],
      exercises: exerciseKeys.map((key) => buildExercise(key, normalizedGoal, dayName))
    };
  });

  return {
    splitName: split.splitName,
    splitType: split.splitType,
    trainingFrequency: frequency,
    goal: normalizedGoal,
    experienceLevel: experience,
    summary: `${split.splitName} tailored for ${normalizedGoal.replace('_', ' ')} training.`,
    days
  };
}

export default recommendSplit;
