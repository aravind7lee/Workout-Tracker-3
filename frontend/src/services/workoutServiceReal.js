// Real-time workout service with backend integration
import api from '../utils/api';
import { realTimeService } from './realTimeService';

class WorkoutServiceReal {
  constructor() {
    this.cache = new Map();
  }

  // Get all workouts from backend
  async getWorkouts() {
    try {
      const response = await api.get('/workouts');
      const workouts = response.data;
      localStorage.setItem('workouts', JSON.stringify(workouts));
      return workouts;
    } catch (error) {
      return JSON.parse(localStorage.getItem('workouts') || '[]');
    }
  }

  // Get workout by ID
  async getWorkout(id) {
    try {
      const response = await api.get(`/workouts/${id}`);
      return response.data;
    } catch (error) {
      const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      return workouts.find(w => w.id === id || w._id === id);
    }
  }

  // Create new workout
  async createWorkout(workoutData) {
    return realTimeService.createWorkout(workoutData);
  }

  // Update workout
  async updateWorkout(id, workoutData) {
    return realTimeService.updateWorkout(id, workoutData);
  }

  // Delete workout
  async deleteWorkout(id) {
    try {
      await api.delete(`/workouts/${id}`);
      const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const filtered = workouts.filter(w => w.id !== id && w._id !== id);
      localStorage.setItem('workouts', JSON.stringify(filtered));
      return true;
    } catch (error) {
      const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const filtered = workouts.filter(w => w.id !== id && w._id !== id);
      localStorage.setItem('workouts', JSON.stringify(filtered));
      return true;
    }
  }

  // Start workout session
  async startWorkoutSession(workoutId) {
    const sessionData = {
      workoutId,
      startTime: new Date().toISOString(),
      status: 'active'
    };

    try {
      const response = await api.post('/workouts/sessions', sessionData);
      localStorage.setItem('activeSession', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      const session = { ...sessionData, id: Date.now() };
      localStorage.setItem('activeSession', JSON.stringify(session));
      return session;
    }
  }

  // Complete workout session
  async completeWorkoutSession(sessionId, sessionData) {
    try {
      const response = await api.put(`/workouts/sessions/${sessionId}/complete`, sessionData);
      localStorage.removeItem('activeSession');
      
      // Update workout history
      const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      history.unshift(response.data);
      localStorage.setItem('workoutHistory', JSON.stringify(history));
      
      return response.data;
    } catch (error) {
      const completedSession = {
        ...sessionData,
        id: sessionId,
        completedAt: new Date().toISOString()
      };
      
      localStorage.removeItem('activeSession');
      const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      history.unshift(completedSession);
      localStorage.setItem('workoutHistory', JSON.stringify(history));
      
      return completedSession;
    }
  }

  // Get workout history
  async getWorkoutHistory() {
    try {
      const response = await api.get('/workouts/history');
      const history = response.data;
      localStorage.setItem('workoutHistory', JSON.stringify(history));
      return history;
    } catch (error) {
      return JSON.parse(localStorage.getItem('workoutHistory') || '[]');
    }
  }

  // Get active session
  getActiveSession() {
    try {
      return JSON.parse(localStorage.getItem('activeSession'));
    } catch (error) {
      return null;
    }
  }

  // Get workout statistics
  async getWorkoutStats() {
    try {
      const response = await api.get('/workouts/stats');
      return response.data;
    } catch (error) {
      const workouts = JSON.parse(localStorage.getItem('workouts') || '[]');
      const history = JSON.parse(localStorage.getItem('workoutHistory') || '[]');
      
      return {
        totalWorkouts: history.length,
        totalPlans: workouts.length,
        averageDuration: this.calculateAverageDuration(history),
        totalCaloriesBurned: this.calculateTotalCalories(history),
        currentStreak: realTimeService.calculateStreak(history)
      };
    }
  }

  calculateAverageDuration(history) {
    if (!history.length) return 0;
    
    const totalDuration = history.reduce((sum, workout) => {
      return sum + (workout.duration || 0);
    }, 0);
    
    return Math.round(totalDuration / history.length);
  }

  calculateTotalCalories(history) {
    return history.reduce((sum, workout) => {
      return sum + (workout.caloriesBurned || 0);
    }, 0);
  }

  // Subscribe to real-time workout updates
  subscribeToUpdates(callback) {
    return realTimeService.subscribe('workouts', callback);
  }
}

export const workoutServiceReal = new WorkoutServiceReal();
export default workoutServiceReal;