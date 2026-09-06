import Achievement from '../models/Achievement.js';
import BodyMetric from '../models/BodyMetric.js';
import Meal from '../models/Meal.js';
import NutritionGoal from '../models/NutritionGoal.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';

const dayKey = (date) => new Date(date).toISOString().slice(0, 10);
const consecutiveDays = (dates) => {
  const unique = [...new Set(dates.map(dayKey))].sort().reverse();
  if (!unique.length) return 0;
  let streak = 1;
  for (let i = 1; i < unique.length; i += 1) {
    const previous = new Date(`${unique[i - 1]}T12:00:00Z`);
    const current = new Date(`${unique[i]}T12:00:00Z`);
    if (Math.round((previous - current) / 86400000) !== 1) break;
    streak += 1;
  }
  return streak;
};

export const achievementDefinitions = [
  { title: 'First Blood', description: 'Complete your first workout', badgeIcon: '🏋️', category: 'Workout', target: 1, metric: 'workouts' },
  { title: 'Consistency King', description: 'Reach a 7-day streak', badgeIcon: '🔥', category: 'Consistency', target: 7, metric: 'streak' },
  { title: 'Two Weeks Strong', description: 'Reach a 14-day streak', badgeIcon: '⚡', category: 'Consistency', target: 14, metric: 'streak' },
  { title: 'Iron Will', description: 'Reach a 30-day streak', badgeIcon: '💪', category: 'Consistency', target: 30, metric: 'streak' },
  { title: 'Century Club', description: 'Complete 100 workouts', badgeIcon: '🏆', category: 'Workout', target: 100, metric: 'workouts' },
  { title: 'Data Nerd', description: 'Log meals for 7 consecutive days', badgeIcon: '📊', category: 'Nutrition', target: 7, metric: 'mealStreak' },
  { title: 'Goal Setter', description: 'Complete your fitness setup', badgeIcon: '🎯', category: 'Workout', target: 1, metric: 'onboarding' },
  { title: 'PR Hunter', description: 'Break 5 personal records', badgeIcon: '🚀', category: 'Workout', target: 5, metric: 'prs' },
  { title: 'Weight Tracker', description: 'Log weight 10 times', badgeIcon: '⚖️', category: 'Consistency', target: 10, metric: 'weights' },
  { title: 'Nutrition Master', description: 'Hit macro targets 7 days in a row', badgeIcon: '🍎', category: 'Nutrition', target: 7, metric: 'macroStreak' },
  { title: 'Split Master', description: 'Complete every day in your workout split', badgeIcon: '🏅', category: 'Workout', target: 1, metric: 'split' },
  { title: 'Elite', description: 'Reach a 365-day streak', badgeIcon: '👑', category: 'Consistency', target: 365, metric: 'streak' }
];

const buildStats = async (userId) => {
  const [user, workouts, meals, weights, nutritionGoal, planCount] = await Promise.all([
    User.findById(userId).lean(),
    Workout.find({ user: userId, completed: true }).select('date exercises').sort({ date: 1 }).lean(),
    Meal.find({ userId }).select('consumedAt calories protein carbs fat').sort({ consumedAt: 1 }).lean(),
    BodyMetric.countDocuments({ user: userId }),
    NutritionGoal.findOne({ userId }).lean(),
    Plan.countDocuments({ user: userId })
  ]);
  if (!user) throw new Error('User not found');

  const records = new Map();
  let prs = 0;
  workouts.forEach((workout) => workout.exercises?.forEach((exercise) => exercise.sets?.forEach((set) => {
    const key = String(exercise.exerciseName || '').toLowerCase();
    const score = Number(set.weight || 0) * Number(set.reps || 0);
    if (key && score > (records.get(key) || 0)) { if (records.has(key)) prs += 1; records.set(key, score); }
  })));

  const mealGroups = new Map();
  meals.forEach((meal) => {
    const key = dayKey(meal.consumedAt);
    const totals = mealGroups.get(key) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    ['calories', 'protein', 'carbs', 'fat'].forEach((field) => { totals[field] += Number(meal[field] || 0); });
    mealGroups.set(key, totals);
  });
  const macroDays = nutritionGoal ? [...mealGroups.entries()].filter(([, totals]) => {
    const within = (actual, target) => target > 0 && actual >= target * .9 && actual <= target * 1.1;
    return within(totals.calories, nutritionGoal.dailyCalories) && totals.protein >= nutritionGoal.dailyProtein * .9;
  }).map(([date]) => date) : [];

  const frequency = user.fitnessGoals?.trainingFrequency || 0;
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const recentWorkoutCount = workouts.filter((workout) => new Date(workout.date) >= weekAgo).length;
  return {
    workouts: workouts.length,
    streak: Math.max(user.currentStreak || 0, user.longestStreak || 0),
    mealStreak: consecutiveDays(meals.map((meal) => meal.consumedAt)),
    onboarding: user.onboardingCompleted ? 1 : 0,
    prs,
    weights,
    macroStreak: consecutiveDays(macroDays),
    split: frequency > 0 && recentWorkoutCount >= frequency && planCount > 0 ? 1 : 0
  };
};

export const getAchievementProgress = async (userId) => {
  const [stats, unlocked] = await Promise.all([buildStats(userId), Achievement.find({ user: userId }).lean()]);
  const byTitle = new Map(unlocked.map((item) => [item.title, item]));
  return achievementDefinitions.map((definition) => {
    const current = Math.min(definition.target, Number(stats[definition.metric] || 0));
    const record = byTitle.get(definition.title);
    return { ...definition, unlocked: Boolean(record), unlockedAt: record?.achievedAt || null, progress: current, percentage: Math.round((current / definition.target) * 100) };
  });
};

export async function check(userId) {
  const progress = await getAchievementProgress(userId);
  const unlocked = [];
  for (const item of progress.filter((entry) => !entry.unlocked && entry.progress >= entry.target)) {
    try {
      const achievement = await Achievement.create({ user: userId, title: item.title, description: item.description, badgeIcon: item.badgeIcon });
      unlocked.push(achievement);
    } catch (error) {
      if (error.code !== 11000) throw error;
    }
  }
  return unlocked;
}

export default { check, getAchievementProgress, achievementDefinitions };
