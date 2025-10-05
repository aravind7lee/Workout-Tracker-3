// Test script to verify user-specific workout tracking
// Run this in browser console to test the functionality

export const testUserWorkoutTracking = () => {
  console.log('🧪 Testing User-Specific Workout Tracking...');
  
  // Mock users for testing
  const user1 = { id: 'user_123', name: 'John Doe', email: 'john@example.com' };
  const user2 = { id: 'user_456', name: 'Jane Smith', email: 'jane@example.com' };
  
  // Clear existing data
  localStorage.removeItem('workoutSync_workouts');
  console.log('🧹 Cleared existing workout data');
  
  // Create test workouts for different users
  const testWorkouts = [
    {
      id: 'workout_1',
      userId: user1.id,
      exercise: 'Push-ups',
      completed: true,
      completedAt: new Date().toISOString(),
      duration: 300,
      caloriesBurned: 50,
      sets: 3,
      reps: 15
    },
    {
      id: 'workout_2',
      userId: user1.id,
      exercise: 'Squats',
      completed: true,
      completedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      duration: 240,
      caloriesBurned: 40,
      sets: 3,
      reps: 20
    },
    {
      id: 'workout_3',
      userId: user2.id,
      exercise: 'Bench Press',
      completed: true,
      completedAt: new Date().toISOString(),
      duration: 600,
      caloriesBurned: 100,
      sets: 4,
      reps: 10
    },
    {
      id: 'fake_workout',
      exercise: 'Workout', // This should be filtered out
      completed: true,
      completedAt: new Date().toISOString(),
      duration: 0,
      caloriesBurned: 0
    }
  ];
  
  // Save test workouts
  localStorage.setItem('workoutSync_workouts', JSON.stringify(testWorkouts));
  console.log('💾 Saved test workouts:', testWorkouts.length);
  
  // Test realTimeWorkoutSync with different users
  if (window.realTimeWorkoutSync) {
    console.log('📊 Testing with User 1 (John)...');
    
    // Mock current user as user1
    localStorage.setItem('user', JSON.stringify(user1));
    
    // Get stats for user1
    const user1Stats = window.realTimeWorkoutSync.getStats();
    console.log('User 1 Stats:', user1Stats);
    
    // Expected: 2 workouts for user1, 1 today, 1 yesterday
    const expectedUser1 = {
      totalWorkouts: 2,
      todayWorkouts: 1,
      weeklyWorkouts: 2
    };
    
    console.log('Expected User 1:', expectedUser1);
    console.log('✅ User 1 Test:', \n      user1Stats.totalWorkouts === expectedUser1.totalWorkouts ? 'PASS' : 'FAIL',\n      '- Total Workouts:',\n      user1Stats.todayWorkouts === expectedUser1.todayWorkouts ? 'PASS' : 'FAIL',\n      '- Today Workouts:',\n      user1Stats.weeklyWorkouts === expectedUser1.weeklyWorkouts ? 'PASS' : 'FAIL',\n      '- Weekly Workouts'\n    );\n    \n    console.log('📊 Testing with User 2 (Jane)...');\n    \n    // Mock current user as user2\n    localStorage.setItem('user', JSON.stringify(user2));\n    \n    // Force refresh stats\n    window.realTimeWorkoutSync.refreshStats();\n    const user2Stats = window.realTimeWorkoutSync.getStats();\n    console.log('User 2 Stats:', user2Stats);\n    \n    // Expected: 1 workout for user2, 1 today\n    const expectedUser2 = {\n      totalWorkouts: 1,\n      todayWorkouts: 1,\n      weeklyWorkouts: 1\n    };\n    \n    console.log('Expected User 2:', expectedUser2);\n    console.log('✅ User 2 Test:',\n      user2Stats.totalWorkouts === expectedUser2.totalWorkouts ? 'PASS' : 'FAIL',\n      '- Total Workouts:',\n      user2Stats.todayWorkouts === expectedUser2.todayWorkouts ? 'PASS' : 'FAIL',\n      '- Today Workouts:',\n      user2Stats.weeklyWorkouts === expectedUser2.weeklyWorkouts ? 'PASS' : 'FAIL',\n      '- Weekly Workouts'\n    );\n    \n    // Test adding a new workout for user2\n    console.log('➕ Testing adding workout for User 2...');\n    const newWorkout = {\n      exercise: 'Deadlifts',\n      duration: 480,\n      caloriesBurned: 80,\n      sets: 3,\n      reps: 8\n    };\n    \n    const addedWorkout = window.realTimeWorkoutSync.addCompletedWorkout(newWorkout);\n    console.log('Added workout:', addedWorkout);\n    \n    if (addedWorkout) {\n      const updatedUser2Stats = window.realTimeWorkoutSync.getStats();\n      console.log('Updated User 2 Stats:', updatedUser2Stats);\n      \n      console.log('✅ Add Workout Test:',\n        updatedUser2Stats.totalWorkouts === 2 ? 'PASS' : 'FAIL',\n        '- Total should be 2:',\n        updatedUser2Stats.todayWorkouts === 2 ? 'PASS' : 'FAIL',\n        '- Today should be 2'\n      );\n    }\n    \n  } else {\n    console.error('❌ realTimeWorkoutSync not available');\n  }\n  \n  // Test cleanup function\n  console.log('🧹 Testing cleanup function...');\n  if (window.cleanUserWorkouts) {\n    const cleanupResult = window.cleanUserWorkouts(user1);\n    console.log('Cleanup result:', cleanupResult);\n  }\n  \n  console.log('🏁 User-Specific Workout Tracking Test Complete!');\n  \n  return {\n    success: true,\n    message: 'Test completed - check console for results'\n  };\n};\n\n// Make available globally for testing\nif (typeof window !== 'undefined') {\n  window.testUserWorkoutTracking = testUserWorkoutTracking;\n}\n\nexport default testUserWorkoutTracking;