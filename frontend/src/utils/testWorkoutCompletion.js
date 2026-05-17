// Test Workout Completion - For Testing Real-Time Updates
// This utility helps test the real-time sync functionality

export const testWorkoutCompletion = () => {
  const sampleWorkouts = [
    {
      id: `test_${Date.now()}_1`,
      exercise: "Push-ups",
      category: "Chest",
      difficulty: "Beginner",
      duration: 300, // 5 minutes
      sets: 3,
      reps: 15,
      caloriesBurned: 50,
      notes: "Great workout session!",
      completed: true,
      completedAt: new Date().toISOString(),
      savedOffline: false,
      synced: true,
    },
    {
      id: `test_${Date.now()}_2`,
      exercise: "Squats",
      category: "Legs",
      difficulty: "Beginner",
      duration: 420, // 7 minutes
      sets: 4,
      reps: 20,
      caloriesBurned: 75,
      notes: "Felt the burn!",
      completed: true,
      completedAt: new Date().toISOString(),
      savedOffline: false,
      synced: true,
    },
    {
      id: `test_${Date.now()}_3`,
      exercise: "Plank",
      category: "Core",
      difficulty: "Intermediate",
      duration: 180, // 3 minutes
      sets: 3,
      reps: 1,
      caloriesBurned: 30,
      notes: "Core strength building",
      completed: true,
      completedAt: new Date().toISOString(),
      savedOffline: false,
      synced: true,
    },
  ];

  // Pick a random workout
  const randomWorkout =
    sampleWorkouts[Math.floor(Math.random() * sampleWorkouts.length)];

  console.log("🧪 Testing workout completion with:", randomWorkout);

  // Dispatch workout completion event
  window.dispatchEvent(
    new CustomEvent("workoutCompleted", {
      detail: randomWorkout,
    }),
  );

  console.log("✅ Test workout completion event dispatched");

  return randomWorkout;
};

// Test multiple workouts
export const testMultipleWorkouts = (count = 3) => {
  const completedWorkouts = [];

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const workout = testWorkoutCompletion();
      completedWorkouts.push(workout);
      console.log(`🧪 Test workout ${i + 1}/${count} completed`);
    }, i * 1000); // 1 second delay between each
  }

  return completedWorkouts;
};

// Test today's workouts
export const testTodaysWorkouts = () => {
  const todayWorkouts = [
    {
      id: `today_${Date.now()}_1`,
      exercise: "Morning Run",
      category: "Cardio",
      difficulty: "Intermediate",
      duration: 1800, // 30 minutes
      sets: 1,
      reps: 1,
      caloriesBurned: 300,
      notes: "Great morning cardio session",
      completed: true,
      completedAt: new Date().toISOString(),
      savedOffline: false,
      synced: true,
    },
    {
      id: `today_${Date.now()}_2`,
      exercise: "Afternoon Strength Training",
      category: "Strength",
      difficulty: "Advanced",
      duration: 2700, // 45 minutes
      sets: 5,
      reps: 12,
      caloriesBurned: 400,
      notes: "Intense strength session",
      completed: true,
      completedAt: new Date().toISOString(),
      savedOffline: false,
      synced: true,
    },
  ];

  todayWorkouts.forEach((workout, index) => {
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("workoutCompleted", {
          detail: workout,
        }),
      );
      console.log(
        `🧪 Today's workout ${index + 1} completed:`,
        workout.exercise,
      );
    }, index * 500);
  });

  return todayWorkouts;
};

// Clear test data
export const clearTestWorkouts = () => {
  // Clear from localStorage
  const keys = Object.keys(localStorage);
  keys.forEach((key) => {
    if (key.includes("test_") || key.includes("today_")) {
      localStorage.removeItem(key);
    }
  });

  // Clear from workoutSync storage
  try {
    const workouts = JSON.parse(
      localStorage.getItem("workoutSync_workouts") || "[]",
    );
    const filtered = workouts.filter(
      (w) => !w.id.includes("test_") && !w.id.includes("today_"),
    );
    localStorage.setItem("workoutSync_workouts", JSON.stringify(filtered));
    console.log("🧹 Test workouts cleared from storage");
  } catch (error) {
    console.warn("⚠️ Error clearing test workouts:", error);
  }

  // Dispatch refresh event
  window.dispatchEvent(new CustomEvent("realTimeStatsUpdate"));
};

// Make functions available globally for testing in console
if (typeof window !== "undefined") {
  window.testWorkoutCompletion = testWorkoutCompletion;
  window.testMultipleWorkouts = testMultipleWorkouts;
  window.testTodaysWorkouts = testTodaysWorkouts;
  window.clearTestWorkouts = clearTestWorkouts;

  console.log("🧪 Test functions available globally:");
  console.log("- testWorkoutCompletion()");
  console.log("- testMultipleWorkouts(count)");
  console.log("- testTodaysWorkouts()");
  console.log("- clearTestWorkouts()");
}
