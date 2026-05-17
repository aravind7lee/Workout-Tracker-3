// Workout Validation - Prevent fake/duplicate workouts
export const isValidWorkout = (workout) => {
  if (!workout) return false;

  // Must have a real exercise name
  if (!workout.exercise || workout.exercise === "Workout") return false;

  // Must have some activity (duration or calories)
  if (
    (!workout.duration || workout.duration === 0) &&
    (!workout.caloriesBurned || workout.caloriesBurned === 0)
  )
    return false;

  // Must have completion time
  if (!workout.completedAt) return false;

  // Reject test/fake IDs
  if (
    workout.id &&
    (workout.id.includes("test_") || workout.id.includes("fake_"))
  )
    return false;

  return true;
};

export const isDuplicateWorkout = (newWorkout, existingWorkouts) => {
  return existingWorkouts.some((existing) => {
    // Same ID
    if (existing.id === newWorkout.id) return true;

    // Same exercise within 5 seconds
    if (existing.exercise === newWorkout.exercise) {
      const timeDiff = Math.abs(
        new Date(existing.completedAt) - new Date(newWorkout.completedAt),
      );
      if (timeDiff < 5000) return true;
    }

    return false;
  });
};
