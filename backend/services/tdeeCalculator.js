const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very: 1.725,
  very_active: 1.725,
  extra: 1.9
};

const GOAL_ADJUSTMENTS = {
  lose: -500,
  deficit: -500,
  maintain: 0,
  maintenance: 0,
  strength: 0,
  recomposition: 0,
  muscle: 300,
  gain: 500,
  lean_bulk: 300,
  bulk: 500
};

const requirePositiveNumber = (value, field) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    throw new TypeError(`${field} must be a positive number`);
  }
  return number;
};

export function calculateTDEE({ weight, height, age, gender, activityLevel }) {
  const weightKg = requirePositiveNumber(weight, 'weight');
  const heightCm = requirePositiveNumber(height, 'height');
  const ageYears = requirePositiveNumber(age, 'age');
  const normalizedGender = String(gender || '').toLowerCase();
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];

  if (!['male', 'female', 'other'].includes(normalizedGender)) {
    throw new TypeError('gender must be male, female, or other');
  }
  if (!multiplier) {
    throw new TypeError('activityLevel is not supported');
  }

  const genderConstant = normalizedGender === 'male'
    ? 5
    : normalizedGender === 'female'
      ? -161
      : -78;
  const bmr = Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + genderConstant);

  return {
    bmr,
    tdee: Math.round(bmr * multiplier)
  };
}

export function calculateMacros({ tdee, goal, weight }) {
  const baseTdee = requirePositiveNumber(tdee, 'tdee');
  const weightKg = requirePositiveNumber(weight, 'weight');
  const normalizedGoal = String(goal || 'maintenance').toLowerCase();

  if (!(normalizedGoal in GOAL_ADJUSTMENTS)) {
    throw new TypeError('goal is not supported');
  }

  const calories = Math.max(1200, Math.round(baseTdee + GOAL_ADJUSTMENTS[normalizedGoal]));
  const protein = Math.round(weightKg * 2);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - (protein * 4) - (fat * 9)) / 4));

  return { calories, protein, carbs, fat };
}

export { ACTIVITY_MULTIPLIERS };
