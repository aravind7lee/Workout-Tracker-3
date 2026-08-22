// Workout Completion Handler - DISABLED
// This component previously listened for 'workoutCompleted' events and re-saved
// workouts via realTimeWorkoutSync.addCompletedWorkout(), causing duplicate entries.
// The actual save is now handled exclusively by WorkoutSession.jsx (for session workouts)
// and WorkoutCompletionContext.jsx (for quick-complete workouts).

const WorkoutCompletionHandler = () => {
  return null;
};

export default WorkoutCompletionHandler;

