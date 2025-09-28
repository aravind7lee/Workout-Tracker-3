// Workout Completion Handler - Triggers Real-Time Updates
import { useEffect } from 'react';
import { realTimeWorkoutSync } from '../services/realTimeWorkoutSync';

const WorkoutCompletionHandler = () => {
  useEffect(() => {
    // Listen for workout completion from various sources
    const handleWorkoutComplete = (event) => {
      if (event.detail) {
        const workoutData = event.detail;
        console.log('🎯 WorkoutCompletionHandler: Processing workout completion:', workoutData);
        
        // Add workout to real-time sync service
        const addedWorkout = realTimeWorkoutSync.addCompletedWorkout(workoutData);
        
        if (addedWorkout) {
          console.log('✅ WorkoutCompletionHandler: Workout added and synced across all pages');
          
          // Dispatch additional events for specific page updates
          const updateEvents = [
            'homeStatsUpdate',
            'dashboardStatsUpdate', 
            'analyticsStatsUpdate',
            'workoutsPageUpdate'
          ];
          
          updateEvents.forEach(eventName => {
            window.dispatchEvent(new CustomEvent(eventName, {
              detail: {
                workout: addedWorkout,
                stats: realTimeWorkoutSync.getStats(),
                timestamp: new Date().toISOString()
              }
            }));
          });
        }
      }
    };

    // Listen for various workout completion events
    const events = [
      'workoutCompleted',
      'exerciseCompleted',
      'workoutFinished',
      'workoutSessionComplete'
    ];

    events.forEach(eventName => {
      window.addEventListener(eventName, handleWorkoutComplete);
    });

    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleWorkoutComplete);
      });
    };
  }, []);

  // This component doesn't render anything
  return null;
};

export default WorkoutCompletionHandler;