// Demo API Service - Mock API responses for demo mode
import { demoService } from './demoService';

class DemoApiService {
  constructor() {
    this.baseDelay = 300;
  }

  // Mock API delay
  delay(ms = this.baseDelay) {
    return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));
  }

  // Mock workout data endpoints
  async getWorkouts() {
    await this.delay();
    const workouts = JSON.parse(sessionStorage.getItem('workoutHistory') || '[]');
    return { success: true, data: workouts };
  }

  async getWorkoutPlans() {
    await this.delay();
    const plans = JSON.parse(sessionStorage.getItem('workoutPlans') || '[]');
    return { success: true, data: plans };
  }

  async createWorkoutPlan(planData) {
    await this.delay();
    const plans = JSON.parse(sessionStorage.getItem('workoutPlans') || '[]');
    const newPlan = {
      ...planData,
      id: `demo_plan_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    plans.push(newPlan);
    sessionStorage.setItem('workoutPlans', JSON.stringify(plans));
    return { success: true, data: newPlan };
  }

  async logWorkout(workoutData) {
    await this.delay();
    const history = JSON.parse(sessionStorage.getItem('workoutHistory') || '[]');
    const newWorkout = {
      ...workoutData,
      id: `demo_workout_${Date.now()}`,
      date: new Date().toISOString(),
      completed: true
    };
    history.unshift(newWorkout);
    sessionStorage.setItem('workoutHistory', JSON.stringify(history.slice(0, 50)));
    return { success: true, data: newWorkout };
  }

  // Mock nutrition endpoints
  async getMeals() {
    await this.delay();
    const meals = JSON.parse(sessionStorage.getItem('recentMeals') || '[]');
    return { success: true, data: meals };
  }

  async logMeal(mealData) {
    await this.delay();
    const meals = JSON.parse(sessionStorage.getItem('recentMeals') || '[]');
    const newMeal = {
      ...mealData,
      id: `demo_meal_${Date.now()}`,
      date: new Date().toISOString()
    };
    meals.unshift(newMeal);
    sessionStorage.setItem('recentMeals', JSON.stringify(meals.slice(0, 20)));
    return { success: true, data: newMeal };
  }

  // Mock analytics endpoints
  async getAnalytics() {
    await this.delay();
    const progressData = JSON.parse(sessionStorage.getItem('progressData') || '[]');
    return {
      success: true,
      data: {
        workoutTrends: progressData,
        weeklyStats: {
          totalWorkouts: 5,
          totalCalories: 1420,
          avgDuration: 38,
          improvement: 15
        },
        achievements: JSON.parse(sessionStorage.getItem('achievements') || '[]')
      }
    };
  }

  // Mock user profile endpoints
  async updateProfile(profileData) {
    await this.delay();
    const session = demoService.getDemoSession();
    if (session) {
      session.user = { ...session.user, ...profileData };
      sessionStorage.setItem(demoService.DEMO_KEY, JSON.stringify(session));
    }
    return { success: true, data: session?.user };
  }

  // Mock exercise library
  async getExercises(category = null) {
    await this.delay();
    const exercises = [
      { id: 1, name: 'Push-ups', category: 'Chest', difficulty: 'Beginner', description: 'Classic bodyweight exercise' },
      { id: 2, name: 'Squats', category: 'Legs', difficulty: 'Beginner', description: 'Fundamental leg exercise' },
      { id: 3, name: 'Pull-ups', category: 'Back', difficulty: 'Intermediate', description: 'Upper body pulling exercise' },
      { id: 4, name: 'Deadlifts', category: 'Back', difficulty: 'Advanced', description: 'Compound lifting movement' },
      { id: 5, name: 'Bench Press', category: 'Chest', difficulty: 'Intermediate', description: 'Chest pressing exercise' },
      { id: 6, name: 'Lunges', category: 'Legs', difficulty: 'Beginner', description: 'Single leg strength exercise' },
      { id: 7, name: 'Plank', category: 'Core', difficulty: 'Beginner', description: 'Core stability exercise' },
      { id: 8, name: 'Burpees', category: 'Cardio', difficulty: 'Advanced', description: 'Full body cardio exercise' }
    ];

    const filtered = category ? exercises.filter(ex => ex.category === category) : exercises;
    return { success: true, data: filtered };
  }

  // Check if in demo mode and should use mock responses
  shouldUseMockApi() {
    return demoService.isDemoMode();
  }
}

export const demoApiService = new DemoApiService();
export default demoApiService;