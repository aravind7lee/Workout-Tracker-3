// Test Plan Workout Completion Flow
// This script tests the complete flow from plan workout completion to /workouts page update

console.log('🧪 Testing Plan Workout Completion Flow...');

// Simulate a completed plan workout
const testPlanWorkout = {
  id: `test_plan_workout_${Date.now()}`,
  userId: 'test_user_123',
  planId: 'temp_1759650598402',
  planName: 'Test Chest Workout',
  exercise: 'Test Chest Workout Plan',
  name: 'Test Chest Workout Workout',
  category: 'Plan Workout',
  difficulty: 'Intermediate',
  exercises: [
    { name: 'Push-ups', category: 'Chest', sets: '3x12', completed: true },
    { name: 'Bench Press', category: 'Chest', sets: '3x10', completed: true },
    { name: 'Chest Flyes', category: 'Chest', sets: '3x15', completed: true }
  ],
  duration: 1800, // 30 minutes in seconds
  completedExercises: 3,
  totalExercises: 3,
  completionRate: 100,
  caloriesBurned: 250,
  sets: 3,
  reps: 3,
  completed: true,
  completedAt: new Date().toISOString(),
  notes: 'Completed 3/3 exercises from Test Chest Workout plan',
  savedOffline: false,
  synced: true
};

// Test function to simulate plan workout completion
function testPlanWorkoutCompletion() {
  try {
    console.log('🎯 Simulating plan workout completion...');
    
    // Save to localStorage (simulating WorkoutSession.jsx behavior)
    const existingWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
    const updatedWorkouts = [testPlanWorkout, ...existingWorkouts];
    localStorage.setItem('completedWorkouts', JSON.stringify(updatedWorkouts));
    
    // Import and use real-time workout sync
    if (window.realTimeWorkoutSync) {
      const syncedWorkout = window.realTimeWorkoutSync.addCompletedWorkout(testPlanWorkout);
      
      if (syncedWorkout) {
        console.log('✅ Plan workout added to real-time sync:', syncedWorkout);
        
        // Dispatch events (simulating WorkoutSession.jsx behavior)
        window.dispatchEvent(new CustomEvent('workoutCompleted', { 
          detail: syncedWorkout 
        }));
        
        window.dispatchEvent(new CustomEvent('realTimeStatsUpdate', { 
          detail: {
            todayWorkouts: window.realTimeWorkoutSync.getStats().todayWorkouts,
            totalWorkouts: window.realTimeWorkoutSync.getStats().totalWorkouts,
            weeklyWorkouts: window.realTimeWorkoutSync.getStats().weeklyWorkouts,
            totalCalories: window.realTimeWorkoutSync.getStats().totalCalories,
            lastWorkout: syncedWorkout
          }
        }));
        
        window.dispatchEvent(new CustomEvent('streakUpdated', { 
          detail: { 
            type: 'WORKOUT_COMPLETED',
            workout: syncedWorkout
          }
        }));
        
        console.log('📡 Events dispatched for plan workout completion');
        console.log('📊 Current stats:', window.realTimeWorkoutSync.getStats());
        
        // Notification removed as requested
        
        return true;
      } else {
        console.error('❌ Failed to add plan workout to real-time sync');
        return false;
      }
    } else {
      console.error('❌ realTimeWorkoutSync not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing plan workout completion:', error);
    return false;
  }
}

// Test function to verify /workouts page data
function testWorkoutsPageData() {
  try {
    console.log('📋 Testing /workouts page data...');
    
    const completedWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
    const planWorkouts = completedWorkouts.filter(w => w.planId && w.planName);
    
    console.log(`📊 Total completed workouts: ${completedWorkouts.length}`);
    console.log(`🏋️ Plan workouts: ${planWorkouts.length}`);
    
    if (planWorkouts.length > 0) {
      console.log('✅ Plan workouts found in /workouts data:');
      planWorkouts.slice(0, 3).forEach((workout, index) => {
        console.log(`  ${index + 1}. ${workout.planName} - ${workout.completedExercises}/${workout.totalExercises} exercises`);
      });
      return true;
    } else {
      console.log('⚠️ No plan workouts found in /workouts data');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing /workouts page data:', error);
    return false;
  }
}

// Test function to verify stats updates
function testStatsUpdates() {
  try {
    console.log('📈 Testing stats updates...');
    
    if (window.realTimeWorkoutSync) {
      const stats = window.realTimeWorkoutSync.getStats();
      console.log('📊 Current real-time stats:', stats);
      
      if (stats.totalWorkouts > 0) {
        console.log('✅ Stats are updating correctly');
        console.log(`  - Today: ${stats.todayWorkouts} workouts`);
        console.log(`  - Total: ${stats.totalWorkouts} workouts`);
        console.log(`  - Weekly: ${stats.weeklyWorkouts} workouts`);
        console.log(`  - Calories: ${stats.totalCalories} burned`);
        return true;
      } else {
        console.log('⚠️ No workouts in stats');
        return false;
      }
    } else {
      console.error('❌ realTimeWorkoutSync not available for stats test');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing stats updates:', error);
    return false;
  }
}

// Main test function
function runPlanWorkoutCompletionTests() {
  console.log('🚀 Running Plan Workout Completion Tests...');
  
  const tests = [
    { name: 'Plan Workout Completion', fn: testPlanWorkoutCompletion },
    { name: 'Workouts Page Data', fn: testWorkoutsPageData },
    { name: 'Stats Updates', fn: testStatsUpdates }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    console.log(`\n🧪 Running test: ${test.name}`);
    try {
      const result = test.fn();
      if (result) {
        console.log(`✅ ${test.name} - PASSED`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - FAILED`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${test.name} - ERROR:`, error);
      failed++;
    }
  });
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All plan workout completion tests passed!');
    console.log('✅ The Mark Complete button should now update /workouts page and stats correctly');
  } else {
    console.log('⚠️ Some tests failed. Check the implementation.');
  }
}

// Auto-run tests when script loads
if (typeof window !== 'undefined') {
  // Wait for real-time services to be available
  setTimeout(() => {
    runPlanWorkoutCompletionTests();
  }, 1000);
  
  // Make test functions available globally for manual testing
  window.testPlanWorkoutCompletion = testPlanWorkoutCompletion;
  window.testWorkoutsPageData = testWorkoutsPageData;
  window.testStatsUpdates = testStatsUpdates;
  window.runPlanWorkoutCompletionTests = runPlanWorkoutCompletionTests;
}

export { testPlanWorkoutCompletion, testWorkoutsPageData, testStatsUpdates, runPlanWorkoutCompletionTests };