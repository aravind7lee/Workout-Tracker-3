// Hybrid Service - Online/Offline Data Management
import { onlineService } from './onlineService';
import { planService } from './planService';
import { workoutService } from './workoutService';

class HybridService {
  constructor() {
    this.syncQueue = [];
    this.isOnline = false;
  }

  async checkStatus() {
    this.isOnline = await onlineService.checkBackendStatus();
    return this.isOnline;
  }

  // Workout Plans
  async getWorkoutPlans() {
    if (this.isOnline) {
      try {
        const onlinePlans = await onlineService.getWorkoutPlans();
        // Cache locally
        onlinePlans.forEach(plan => planService.savePlan(plan));
        return onlinePlans;
      } catch (error) {
        console.error('Online plans failed, using local:', error);
      }
    }
    return planService.getAllPlans();
  }

  async saveWorkoutPlan(planData) {
    // Always save locally first
    const localPlan = planService.savePlan(planData);
    
    if (this.isOnline) {
      try {
        const onlinePlan = await onlineService.saveWorkoutPlan(planData);
        if (onlinePlan) {
          // Update local with server ID
          planService.updatePlan(localPlan.id, { serverId: onlinePlan._id });
          return onlinePlan;
        }
      } catch (error) {
        // Queue for sync later
        this.queueForSync('plan', planData);
      }
    } else {
      this.queueForSync('plan', planData);
    }
    
    return localPlan;
  }

  // Workouts
  async getWorkouts() {
    if (this.isOnline) {
      try {
        const onlineWorkouts = await onlineService.getWorkoutHistory();
        // Cache locally
        onlineWorkouts.forEach(workout => workoutService.saveWorkout(workout));
        return onlineWorkouts;
      } catch (error) {
        console.error('Online workouts failed, using local:', error);
      }
    }
    return workoutService.getAllWorkouts();
  }

  async saveWorkout(workoutData) {
    // Always save locally first
    const localWorkout = workoutService.saveWorkout(workoutData);
    
    if (this.isOnline) {
      try {
        const onlineWorkout = await onlineService.saveWorkout(workoutData);
        if (onlineWorkout) {
          workoutService.updateWorkout(localWorkout.id, { serverId: onlineWorkout._id });
          return onlineWorkout;
        }
      } catch (error) {
        this.queueForSync('workout', workoutData);
      }
    } else {
      this.queueForSync('workout', workoutData);
    }
    
    return localWorkout;
  }

  // Sync queue management
  queueForSync(type, data) {
    this.syncQueue.push({ type, data, timestamp: Date.now() });
    localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
  }

  async syncPendingData() {
    if (!this.isOnline) return false;
    
    const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
    const synced = [];
    
    for (const item of queue) {
      try {
        if (item.type === 'plan') {
          await onlineService.saveWorkoutPlan(item.data);
        } else if (item.type === 'workout') {
          await onlineService.saveWorkout(item.data);
        }
        synced.push(item);
      } catch (error) {
        console.error('Sync failed for item:', item, error);
      }
    }
    
    // Remove synced items
    const remaining = queue.filter(item => !synced.includes(item));
    localStorage.setItem('syncQueue', JSON.stringify(remaining));
    this.syncQueue = remaining;
    
    return synced.length > 0;
  }

  // Auto-sync when coming online
  async handleOnlineStatus() {
    const wasOffline = !this.isOnline;
    this.isOnline = await onlineService.checkBackendStatus();
    
    if (wasOffline && this.isOnline) {
      // Just came online, sync pending data
      await this.syncPendingData();
    }
    
    return this.isOnline;
  }
}

export const hybridService = new HybridService();
export default hybridService;