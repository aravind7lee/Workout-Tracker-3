// Cleanup Fake Workouts - Remove duplicates and fake data
export const cleanupFakeWorkouts = () => {
  try {
    // Get all workouts from storage
    const workouts = JSON.parse(
      localStorage.getItem("workoutSync_workouts") || "[]",
    );

    // Filter out fake/duplicate workouts - keep only real completed workouts
    const realWorkouts = workouts.filter((workout) => {
      // Keep workouts that have actual data (not default/fake values)
      return (
        workout.exercise &&
        workout.exercise !== "Workout" &&
        workout.duration > 0 &&
        workout.caloriesBurned > 0 &&
        workout.completedAt &&
        !workout.id.includes("test_") &&
        !workout.id.includes("fake_")
      );
    });

    console.log(
      `🧹 Cleaned up workouts: ${workouts.length} → ${realWorkouts.length}`,
    );

    // Save cleaned workouts
    localStorage.setItem("workoutSync_workouts", JSON.stringify(realWorkouts));

    // Clear other fake data sources
    localStorage.removeItem("completedWorkouts");
    localStorage.removeItem("workouts");
    localStorage.removeItem("workoutHistory");
    localStorage.removeItem("recentWorkouts");

    // Dispatch update event
    window.dispatchEvent(new CustomEvent("realTimeStatsUpdate"));

    return realWorkouts;
  } catch (error) {
    console.error("Error cleaning up workouts:", error);
    return [];
  }
};

// Make available globally
if (typeof window !== "undefined") {
  window.cleanupFakeWorkouts = cleanupFakeWorkouts;
}
