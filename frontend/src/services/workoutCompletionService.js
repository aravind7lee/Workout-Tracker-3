// Simple fallback configuration
const API_CONFIG = {
  BASE_URL: 'https://workout-tracker-backend-wga7.onrender.com'
};

class WorkoutCompletionService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL + '/api';
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncOfflineWorkouts();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  // Complete a workout and save to MongoDB
  async completeWorkout(workoutData) {
    const workout = {
      id: Date.now(),
      userId: workoutData.userId,
      exercise: workoutData.exercise,
      category: workoutData.category,
      duration: workoutData.duration,
      sets: workoutData.sets,
      reps: workoutData.reps,
      weight: workoutData.weight,
      caloriesBurned: workoutData.caloriesBurned,
      difficulty: workoutData.difficulty,
      notes: workoutData.notes,
      completedAt: new Date().toISOString(),
      savedOffline: !this.isOnline
    };

    try {
      if (this.isOnline) {
        // Save to MongoDB via backend
        const response = await fetch(`${this.baseURL}/workouts/complete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(workout)
        });

        if (response.ok) {
          const savedWorkout = await response.json();
          
          // Update local storage
          this.saveToLocalStorage(savedWorkout);
          
          // Trigger real-time updates
          this.triggerRealTimeUpdates(savedWorkout);
          
          return savedWorkout;
        } else {
          throw new Error('Failed to save workout online');
        }
      } else {
        // Save offline
        this.saveToLocalStorage(workout);
        this.addToOfflineQueue(workout);
        this.triggerRealTimeUpdates(workout);
        return workout;
      }
    } catch (error) {
      console.error('Error completing workout:', error);
      // Fallback to offline storage
      workout.savedOffline = true;
      this.saveToLocalStorage(workout);
      this.addToOfflineQueue(workout);
      this.triggerRealTimeUpdates(workout);
      return workout;
    }
  }

  // Get completed workouts
  async getCompletedWorkouts(userId) {
    try {
      if (this.isOnline) {
        const response = await fetch(`${this.baseURL}/workouts/completed/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const workouts = await response.json();
          // Update local storage with server data
          localStorage.setItem('completedWorkouts', JSON.stringify(workouts));
          return workouts;
        }
      }
      
      // Fallback to local storage
      const localWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      return localWorkouts.filter(w => w.userId === userId);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      const localWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      return localWorkouts.filter(w => w.userId === userId);
    }
  }

  // Save to local storage
  saveToLocalStorage(workout) {
    try {
      const existingWorkouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      const updatedWorkouts = [workout, ...existingWorkouts.filter(w => w.id !== workout.id)];
      localStorage.setItem('completedWorkouts', JSON.stringify(updatedWorkouts));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // Add to offline sync queue
  addToOfflineQueue(workout) {
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('offlineWorkoutQueue') || '[]');
      offlineQueue.push(workout);
      localStorage.setItem('offlineWorkoutQueue', JSON.stringify(offlineQueue));
    } catch (error) {
      console.error('Error adding to offline queue:', error);
    }
  }

  // Sync offline workouts when back online
  async syncOfflineWorkouts() {
    try {
      const offlineQueue = JSON.parse(localStorage.getItem('offlineWorkoutQueue') || '[]');
      
      if (offlineQueue.length === 0) return;

      console.log(`🔄 Syncing ${offlineQueue.length} offline workouts...`);

      for (const workout of offlineQueue) {
        try {
          const response = await fetch(`${this.baseURL}/workouts/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ ...workout, savedOffline: false })
          });

          if (response.ok) {
            console.log(`✅ Synced workout: ${workout.exercise}`);
          }
        } catch (error) {
          console.error(`❌ Failed to sync workout: ${workout.exercise}`, error);
        }
      }

      // Clear offline queue after successful sync
      localStorage.setItem('offlineWorkoutQueue', JSON.stringify([]));
      
      // Trigger refresh of workout data
      window.dispatchEvent(new CustomEvent('workoutsSynced'));
      
    } catch (error) {
      console.error('Error syncing offline workouts:', error);
    }
  }

  // Trigger real-time updates across the app
  triggerRealTimeUpdates(workout) {
    // Update stats
    this.updateStats();
    
    // Dispatch events for different pages
    window.dispatchEvent(new CustomEvent('workoutCompleted', { 
      detail: workout 
    }));
    
    window.dispatchEvent(new CustomEvent('statsUpdated', { 
      detail: { 
        type: 'workout_completed',
        workout: workout
      }
    }));

    // Update streak if applicable
    window.dispatchEvent(new CustomEvent('streakUpdated', {
      detail: {
        type: 'WORKOUT_COMPLETED',
        workout: workout
      }
    }));

    // Update achievements
    window.dispatchEvent(new CustomEvent('achievementCheck', {
      detail: {
        type: 'workout_completed',
        data: workout
      }
    }));
  }

  // Update real-time stats
  updateStats() {
    try {
      const workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      const today = new Date().toDateString();
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const stats = {
        todayWorkouts: workouts.filter(w => new Date(w.completedAt).toDateString() === today).length,
        totalWorkouts: workouts.length,
        weeklyWorkouts: workouts.filter(w => new Date(w.completedAt) >= thisWeek).length,
        totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        lastUpdated: new Date().toISOString()
      };

      // Update localStorage stats
      localStorage.setItem('workoutStats', JSON.stringify(stats));
      
      // Dispatch stats update event
      window.dispatchEvent(new CustomEvent('realTimeStatsUpdate', { 
        detail: stats 
      }));
      
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  // Get workout statistics
  getWorkoutStats(userId) {
    try {
      const workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]')
        .filter(w => w.userId === userId);
      
      const today = new Date().toDateString();
      const thisWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      return {
        todayWorkouts: workouts.filter(w => new Date(w.completedAt).toDateString() === today).length,
        totalWorkouts: workouts.length,
        weeklyWorkouts: workouts.filter(w => new Date(w.completedAt) >= thisWeek).length,
        monthlyWorkouts: workouts.filter(w => new Date(w.completedAt) >= thisMonth).length,
        totalCalories: workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        totalDuration: workouts.reduce((sum, w) => sum + (w.duration || 0), 0),
        averageDuration: workouts.length > 0 ? Math.round(workouts.reduce((sum, w) => sum + (w.duration || 0), 0) / workouts.length) : 0,
        favoriteExercise: this.getFavoriteExercise(workouts),
        lastWorkout: workouts.length > 0 ? workouts[0] : null
      };
    } catch (error) {
      console.error('Error getting workout stats:', error);
      return {
        todayWorkouts: 0,
        totalWorkouts: 0,
        weeklyWorkouts: 0,
        monthlyWorkouts: 0,
        totalCalories: 0,
        totalDuration: 0,
        averageDuration: 0,
        favoriteExercise: null,
        lastWorkout: null
      };
    }
  }

  getFavoriteExercise(workouts) {
    if (workouts.length === 0) return null;
    
    const exerciseCounts = {};
    workouts.forEach(workout => {
      const exercise = workout.exercise || 'Unknown';
      exerciseCounts[exercise] = (exerciseCounts[exercise] || 0) + 1;
    });
    
    return Object.keys(exerciseCounts).reduce((a, b) => 
      exerciseCounts[a] > exerciseCounts[b] ? a : b
    );
  }

  // Delete a workout
  async deleteWorkout(workoutId, userId) {
    try {
      if (this.isOnline) {
        const response = await fetch(`${this.baseURL}/workouts/${workoutId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete workout online');
        }
      }

      // Remove from local storage
      const workouts = JSON.parse(localStorage.getItem('completedWorkouts') || '[]');
      const updatedWorkouts = workouts.filter(w => w.id !== workoutId);
      localStorage.setItem('completedWorkouts', JSON.stringify(updatedWorkouts));
      
      // Update stats
      this.updateStats();
      
      return true;
    } catch (error) {
      console.error('Error deleting workout:', error);
      return false;
    }
  }
}

export const workoutCompletionService = new WorkoutCompletionService();