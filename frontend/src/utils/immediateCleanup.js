// Immediate cleanup of fake workouts on app load
(() => {
  try {
    const workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
    const realWorkouts = workouts.filter(workout => {
      return workout.exercise && 
             workout.exercise !== 'Workout' && 
             (workout.duration > 0 || workout.caloriesBurned > 0) &&
             workout.completedAt &&
             !workout.id.includes('test_') &&
             !workout.id.includes('fake_');
    });
    
    // Remove duplicates
    const uniqueWorkouts = [];
    const seen = new Set();
    
    for (const workout of realWorkouts) {
      const key = `${workout.exercise}_${workout.completedAt}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueWorkouts.push(workout);
      }
    }
    
    if (uniqueWorkouts.length !== workouts.length) {
      localStorage.setItem('workoutSync_workouts', JSON.stringify(uniqueWorkouts));
      console.log(`🧹 Immediate cleanup: ${workouts.length} → ${uniqueWorkouts.length} workouts`);
    }
    
    // Clear other fake data
    localStorage.removeItem('completedWorkouts');
    localStorage.removeItem('workouts');
    localStorage.removeItem('workoutHistory');
    localStorage.removeItem('recentWorkouts');
    
  } catch (error) {
    console.warn('⚠️ Immediate cleanup failed:', error);
  }
})();