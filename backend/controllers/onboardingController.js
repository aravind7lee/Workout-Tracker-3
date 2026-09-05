import User from '../models/User.js';
import Plan from '../models/Plan.js';
import NutritionGoal from '../models/NutritionGoal.js';
import { recommendSplit } from '../services/splitRecommendationEngine.js';
import { calculateMacros, calculateTDEE } from '../services/tdeeCalculator.js';

const GOALS = ['deficit', 'maintenance', 'bulk', 'strength', 'recomposition'];
const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'very', 'extra'];
const EXPERIENCE_LEVELS = ['beginner', 'intermediate', 'advanced'];

const goalAliases = {
  lose: 'deficit',
  maintain: 'maintenance',
  gain: 'bulk',
  muscle: 'bulk'
};

const normalizeGoal = (goal) => goalAliases[goal] || goal;

const numberInRange = (value, min, max, field, optional = false) => {
  if ((value === undefined || value === null || value === '') && optional) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    const error = new Error(`${field} must be between ${min} and ${max}`);
    error.statusCode = 400;
    throw error;
  }
  return parsed;
};

const enumValue = (value, supported, field) => {
  const normalized = String(value || '').toLowerCase();
  if (!supported.includes(normalized)) {
    const error = new Error(`${field} is not supported`);
    error.statusCode = 400;
    throw error;
  }
  return normalized;
};

const buildProfile = (body) => {
  const metrics = body.metrics || {};
  const fitnessGoals = typeof body.fitnessGoals === 'object' && body.fitnessGoals
    ? body.fitnessGoals
    : { goal: body.fitnessGoals };
  const goal = enumValue(
    normalizeGoal(String(fitnessGoals.goal || body.goal || '').toLowerCase()),
    GOALS,
    'goal'
  );
  const activityLevel = enumValue(
    body.activityLevel || fitnessGoals.activityLevel,
    ACTIVITY_LEVELS,
    'activityLevel'
  );
  const experienceLevel = enumValue(
    fitnessGoals.experienceLevel || body.experienceLevel || 'beginner',
    EXPERIENCE_LEVELS,
    'experienceLevel'
  );
  const trainingFrequency = numberInRange(
    body.trainingFrequency ?? fitnessGoals.trainingFrequency,
    1,
    7,
    'trainingFrequency'
  );
  if (!Number.isInteger(trainingFrequency)) {
    const error = new Error('trainingFrequency must be a whole number');
    error.statusCode = 400;
    throw error;
  }

  const age = numberInRange(metrics.age, 13, 100, 'age');
  const gender = enumValue(metrics.gender, ['male', 'female', 'other'], 'gender');
  const height = numberInRange(metrics.height, 100, 250, 'height');
  const currentWeight = numberInRange(metrics.currentWeight, 30, 350, 'currentWeight');
  const targetWeight = numberInRange(metrics.targetWeight, 30, 350, 'targetWeight', true);
  const bodyFatPercentage = numberInRange(
    metrics.bodyFatPercentage,
    2,
    70,
    'bodyFatPercentage',
    true
  );
  const bmi = Number((currentWeight / ((height / 100) ** 2)).toFixed(1));

  return {
    metrics: { age, gender, height, currentWeight, targetWeight, bodyFatPercentage, bmi },
    goal,
    activityLevel,
    experienceLevel,
    trainingFrequency
  };
};

const flattenExercises = (recommendation) => {
  const uniqueExercises = new Map();
  recommendation.days.forEach((day) => {
    day.exercises.forEach((exercise) => {
      if (!uniqueExercises.has(exercise.name)) {
        uniqueExercises.set(exercise.name, {
          ...exercise,
          notes: `${exercise.notes}; scheduled on ${day.dayName}`
        });
      }
    });
  });
  return [...uniqueExercises.values()];
};

const upsertNutritionGoals = async (userId, profile, macros) => NutritionGoal.findOneAndUpdate(
  { userId },
  {
    $set: {
      dailyCalories: macros.calories,
      dailyProtein: macros.protein,
      dailyCarbs: macros.carbs,
      dailyFat: macros.fat,
      goal: profile.goal,
      weight: profile.metrics.currentWeight,
      height: profile.metrics.height,
      age: profile.metrics.age,
      gender: profile.metrics.gender,
      activityLevel: profile.activityLevel,
      updatedAt: new Date()
    }
  },
  { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
);

export const completeOnboarding = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profile = buildProfile(req.body);
    const recommendedSplit = recommendSplit({
      trainingFrequency: profile.trainingFrequency,
      goal: profile.goal,
      experienceLevel: profile.experienceLevel
    });
    const { bmr, tdee } = calculateTDEE({
      weight: profile.metrics.currentWeight,
      height: profile.metrics.height,
      age: profile.metrics.age,
      gender: profile.metrics.gender,
      activityLevel: profile.activityLevel
    });
    const macros = calculateMacros({
      tdee,
      goal: profile.goal,
      weight: profile.metrics.currentWeight
    });

    const schedule = recommendedSplit.days.map((day) => day.dayName).join(' ? ');
    const plan = await Plan.findOneAndUpdate(
      { user: user._id, localId: 'onboarding-recommended-plan' },
      {
        $set: {
          name: recommendedSplit.splitName,
          description: `${recommendedSplit.summary} Weekly schedule: ${schedule}.`,
          category: 'Recommended',
          exercises: flattenExercises(recommendedSplit),
          tags: ['recommended', recommendedSplit.splitType, profile.goal],
          isPublic: false,
          metadata: {
            difficulty: profile.experienceLevel,
            estimatedDuration: Math.max(30, recommendedSplit.days[0].exercises.length * 8),
            targetMuscleGroups: [...new Set(recommendedSplit.days.flatMap((day) => day.focusMuscles))],
            goals: [profile.goal],
            createdBy: 'System',
            version: '1.0'
          },
          updatedAt: new Date()
        },
        $setOnInsert: {
          user: user._id,
          localId: 'onboarding-recommended-plan',
          createdAt: new Date()
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const nutritionGoals = await upsertNutritionGoals(user._id, profile, macros);

    user.metrics = profile.metrics;
    user.fitnessGoals = {
      ...(user.fitnessGoals?.toObject?.() || user.fitnessGoals || {}),
      goal: profile.goal,
      activityLevel: profile.activityLevel,
      targetWeight: profile.metrics.targetWeight,
      weeklyGoal: profile.trainingFrequency,
      trainingFrequency: profile.trainingFrequency,
      recommendedSplit: recommendedSplit.splitType,
      experienceLevel: profile.experienceLevel
    };
    user.onboardingCompleted = true;
    user.onboardingCompletedAt = new Date();
    await user.save();

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.json({
      success: true,
      user: safeUser,
      recommendedSplit,
      plan,
      nutritionGoals: { ...nutritionGoals.toObject(), bmr, tdee }
    });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to complete onboarding'
    });
  }
};

export const resetOnboarding = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          metrics: {
            age: null,
            gender: null,
            height: null,
            currentWeight: null,
            targetWeight: null,
            bodyFatPercentage: null,
            bmi: null
          },
          'fitnessGoals.goal': 'maintenance',
          'fitnessGoals.activityLevel': 'moderate',
          'fitnessGoals.targetWeight': null,
          'fitnessGoals.weeklyGoal': 3,
          'fitnessGoals.trainingFrequency': 4,
          'fitnessGoals.recommendedSplit': null,
          'fitnessGoals.experienceLevel': 'beginner',
          onboardingCompleted: false,
          onboardingCompletedAt: null
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({
      success: true,
      user,
      message: 'Fitness profile setup was reset. Existing workout history and plans were preserved.'
    });
  } catch (error) {
    console.error('Onboarding reset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset fitness profile setup' });
  }
};

export const recalculateTDEE = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user?.metrics?.currentWeight || !user.metrics.height || !user.metrics.age || !user.metrics.gender) {
      return res.status(400).json({ success: false, message: 'Complete body metrics before recalculating TDEE' });
    }

    const activityLevel = req.body.activityLevel || user.fitnessGoals?.activityLevel;
    const goal = normalizeGoal(req.body.goal || user.fitnessGoals?.goal || 'maintenance');
    const weight = req.body.weight
      ? numberInRange(req.body.weight, 30, 350, 'weight')
      : user.metrics.currentWeight;
    const profile = {
      metrics: { ...user.metrics.toObject(), currentWeight: weight },
      activityLevel: enumValue(activityLevel, ACTIVITY_LEVELS, 'activityLevel'),
      goal: enumValue(goal, GOALS, 'goal')
    };
    const { bmr, tdee } = calculateTDEE({
      weight,
      height: profile.metrics.height,
      age: profile.metrics.age,
      gender: profile.metrics.gender,
      activityLevel: profile.activityLevel
    });
    const macros = calculateMacros({ tdee, goal: profile.goal, weight });
    const nutritionGoals = await upsertNutritionGoals(user._id, profile, macros);

    user.metrics.currentWeight = weight;
    user.metrics.bmi = Number((weight / ((profile.metrics.height / 100) ** 2)).toFixed(1));
    user.fitnessGoals.activityLevel = profile.activityLevel;
    user.fitnessGoals.goal = profile.goal;
    await user.save();

    return res.json({ success: true, bmr, tdee, macros, nutritionGoals });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
};
