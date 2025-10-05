// Run this in browser console to clear all fake workout data
// This will help fix the fake stats issue immediately

console.log('🧹 Clearing all fake workout data...');

try {
  // Get current workouts
  const workouts = JSON.parse(localStorage.getItem('workoutSync_workouts') || '[]');
  console.log(`📊 Found ${workouts.length} total workouts`);
  
  // Filter out fake workouts
  const realWorkouts = workouts.filter(workout => {
    const isReal = workout.exercise && 
                   workout.exercise !== 'Workout' && 
                   workout.exercise !== 'Test Workout' &&
                   workout.exercise !== 'Demo Workout' &&
                   (workout.duration > 0 || workout.caloriesBurned > 0) &&
                   workout.completedAt &&
                   !workout.id?.includes('test_') &&
                   !workout.id?.includes('fake_') &&
                   !workout.id?.includes('demo_') &&
                   !workout.id?.includes('sample_');
    
    if (!isReal) {
      console.log('🗑️ Removing fake workout:', workout.exercise || workout.id);
    }
    
    return isReal;
  });
  
  // Save cleaned workouts
  localStorage.setItem('workoutSync_workouts', JSON.stringify(realWorkouts));
  
  // Clear other fake data
  localStorage.removeItem('mongodb_workouts_cache');
  localStorage.removeItem('demo_workouts');
  localStorage.removeItem('test_workouts');
  localStorage.removeItem('fake_workouts');
  
  console.log(`✅ Cleanup complete: ${workouts.length} → ${realWorkouts.length} workouts`);
  console.log(`🗑️ Removed ${workouts.length - realWorkouts.length} fake workouts`);
  
  // Force refresh all stats
  if (window.realTimeWorkoutSync) {
    window.realTimeWorkoutSync.refreshStats();
    console.log('🔄 Stats refreshed');
  }
  
  // Dispatch events to refresh UI
  const events = [
    'realTimeStatsUpdate',
    'realTimeStatsSync', 
    'refreshCompletedWorkouts'
  ];
  
  events.forEach(eventName => {
    window.dispatchEvent(new CustomEvent(eventName, {
      detail: { cleaned: true, timestamp: new Date().toISOString() }
    }));
  });
  
  console.log('🎉 All fake data cleared! Refresh the page to see clean stats.');
  
  // Show alert
  alert(`✅ Fake data cleared!\n\nRemoved ${workouts.length - realWorkouts.length} fake workouts.\nKept ${realWorkouts.length} real workouts.\n\nRefresh the page to see clean stats.`);
  
} catch (error) {
  console.error('❌ Error clearing fake data:', error);
  alert('❌ Error clearing fake data. Check console for details.');
}