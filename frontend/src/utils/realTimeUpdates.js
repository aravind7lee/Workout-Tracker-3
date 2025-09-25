// Real-Time Updates Utility
import { realTimeService } from '../services/realTimeService';

// Trigger workout completion
export const triggerWorkoutComplete = async (workoutData = {}) => {
  try {
    // Update analytics immediately
    await realTimeService.completeWorkout(workoutData);
    
    // Store in localStorage for offline access
    const recentWorkouts = JSON.parse(localStorage.getItem('recentWorkouts') || '[]');
    const newWorkout = {
      id: Date.now(),
      title: workoutData.title || 'Workout Session',
      date: new Date().toISOString(),
      exercises: workoutData.exercises || [],
      duration: workoutData.duration || 0,
      calories: workoutData.calories || 0,
      ...workoutData
    };
    
    recentWorkouts.unshift(newWorkout);
    if (recentWorkouts.length > 50) recentWorkouts.pop(); // Keep last 50
    localStorage.setItem('recentWorkouts', JSON.stringify(recentWorkouts));
    
    console.log('💪 Workout completion triggered - Analytics will update in real-time');
    return true;
  } catch (error) {
    console.error('❌ Failed to trigger workout completion:', error);
    return false;
  }
};

// Trigger meal logging
export const triggerMealLogged = async (mealData = {}) => {
  try {
    await realTimeService.logMeal(mealData);
    
    // Store in localStorage
    const recentMeals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
    const newMeal = {
      id: Date.now(),
      name: mealData.name || 'Meal',
      date: new Date().toISOString(),
      calories: mealData.calories || 0,
      ...mealData
    };
    
    recentMeals.unshift(newMeal);
    if (recentMeals.length > 100) recentMeals.pop();
    localStorage.setItem('recentMeals', JSON.stringify(recentMeals));
    
    console.log('🍎 Meal logging triggered - Analytics will update in real-time');
    return true;
  } catch (error) {
    console.error('❌ Failed to trigger meal logging:', error);
    return false;
  }
};

// Trigger plan creation
export const triggerPlanCreated = async (planData = {}) => {
  try {
    await realTimeService.createPlan(planData);
    
    console.log('📋 Plan creation triggered - Analytics will update in real-time');
    return true;
  } catch (error) {
    console.error('❌ Failed to trigger plan creation:', error);
    return false;
  }
};

// Force refresh analytics
export const forceRefreshAnalytics = async () => {
  try {
    await realTimeService.forceRefresh();
    console.log('🔄 Analytics force refresh triggered');
    return true;
  } catch (error) {
    console.error('❌ Failed to force refresh analytics:', error);
    return false;
  }
};

// Quick workout completion (for testing)
export const quickWorkoutComplete = () => {
  return triggerWorkoutComplete({
    title: 'Quick Workout',
    duration: Math.floor(Math.random() * 60) + 15, // 15-75 minutes
    calories: Math.floor(Math.random() * 300) + 100, // 100-400 calories
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 15 },
      { name: 'Squats', sets: 3, reps: 20 }
    ]
  });
};

// Quick meal logging (for testing)
export const quickMealLog = () => {
  const meals = [
    { name: 'Protein Shake', calories: 250 },
    { name: 'Chicken Salad', calories: 350 },
    { name: 'Oatmeal', calories: 200 },
    { name: 'Greek Yogurt', calories: 150 }
  ];
  
  const randomMeal = meals[Math.floor(Math.random() * meals.length)];
  return triggerMealLogged(randomMeal);
};

// Quick plan creation (for testing)
export const quickPlanCreate = () => {
  return triggerPlanCreated({
    name: 'New Workout Plan',
    exercises: [
      { name: 'Push-ups', sets: 3, reps: 15 },
      { name: 'Squats', sets: 3, reps: 20 }
    ],
    category: 'Strength'
  });
};

// Export all functions
export default {
  triggerWorkoutComplete,
  triggerMealLogged,
  triggerPlanCreated,
  forceRefreshAnalytics,
  quickWorkoutComplete,
  quickMealLog,
  quickPlanCreate
};