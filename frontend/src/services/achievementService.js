import api from '../utils/api';

class AchievementService {
  async getAchievements() {
    try {
      const response = await api.get('/achievements');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to load achievements');
    }
  }

  async checkAchievements(workoutData) {
    try {
      const response = await api.post('/achievements/check', workoutData);
      return response.data;
    } catch (error) {
      console.error('Achievement check failed:', error);
      return { newAchievements: [] };
    }
  }

  generateLocalAchievements() {
    const workouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
    const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
    const meals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
    
    const achievements = [];
    
    // Workout achievements
    if (workouts.length >= 1) {
      achievements.push({
        id: 'first_workout',
        title: 'First Steps',
        description: 'Completed your first workout',
        icon: '🎯',
        category: 'workout',
        timeAgo: 'Recently',
        xpReward: 100
      });
    }
    
    if (workouts.length >= 5) {
      achievements.push({
        id: 'workout_streak_5',
        title: 'Getting Strong',
        description: 'Completed 5 workouts',
        icon: '💪',
        category: 'workout',
        timeAgo: 'This week',
        xpReward: 250
      });
    }
    
    if (workouts.length >= 10) {
      achievements.push({
        id: 'workout_streak_10',
        title: 'Fitness Enthusiast',
        description: 'Completed 10 workouts',
        icon: '🔥',
        category: 'workout',
        timeAgo: 'This month',
        xpReward: 500
      });
    }
    
    // Plan achievements
    if (plans.length >= 1) {
      achievements.push({
        id: 'first_plan',
        title: 'Plan Creator',
        description: 'Created your first workout plan',
        icon: '📋',
        category: 'planning',
        timeAgo: 'Recently',
        xpReward: 150
      });
    }
    
    // Nutrition achievements
    if (meals.length >= 3) {
      achievements.push({
        id: 'nutrition_tracker',
        title: 'Nutrition Tracker',
        description: 'Logged 3 meals',
        icon: '🥗',
        category: 'nutrition',
        timeAgo: 'Today',
        xpReward: 100
      });
    }
    
    return {
      achievements,
      total: achievements.length,
      recent: Math.min(achievements.length, 3),
      totalXP: achievements.reduce((sum, a) => sum + a.xpReward, 0)
    };
  }
}

export const achievementService = new AchievementService();
export default achievementService;