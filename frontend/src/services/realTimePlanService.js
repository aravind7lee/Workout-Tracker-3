// Real-Time Plan Service for MongoDB Integration
import { onlineService } from './onlineService';
import { planService } from './planService';

class RealTimePlanService {
  constructor() {
    this.isActive = false;
    this.syncInterval = null;
    this.eventListeners = new Map();
    this.syncQueue = [];
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.lastSyncTime = null;
    
    // Initialize real-time features
    this.initializeRealTimeFeatures();
  }

  initializeRealTimeFeatures() {
    // Listen for network changes only
    if (typeof window !== 'undefined') {
      this.onlineHandler = () => this.handleOnlineStatus(true);
      this.offlineHandler = () => this.handleOnlineStatus(false);
      
      window.addEventListener('online', this.onlineHandler);
      window.addEventListener('offline', this.offlineHandler);
    }
  }

  // Start real-time sync
  startRealTimeSync(intervalMs = 30000) {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔄 Starting real-time plan sync...');
    
    // Initial sync
    this.performSync();
    
    // Set up interval sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMs);
    
    // Emit sync started event
    this.emitEvent('syncStarted', { timestamp: new Date().toISOString() });
  }

  // Stop real-time sync
  stopRealTimeSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.isActive = false;
    console.log('⏹️ Real-time plan sync stopped');
    
    this.emitEvent('syncStopped', { timestamp: new Date().toISOString() });
  }

  // Perform sync operation
  async performSync() {
    try {
      const isOnline = await onlineService.checkBackendStatus();
      if (!isOnline) {
        this.emitEvent('syncStatus', { status: 'offline', timestamp: new Date().toISOString() });
        return;
      }

      this.emitEvent('syncStatus', { status: 'syncing', timestamp: new Date().toISOString() });

      // Process sync queue
      await this.processSyncQueue();
      
      // Sync local plans with backend
      await this.syncLocalPlans();
      
      // Update last sync time
      this.lastSyncTime = new Date().toISOString();
      this.retryAttempts = 0;
      
      this.emitEvent('syncStatus', { 
        status: 'synced', 
        timestamp: this.lastSyncTime,
        queueSize: this.syncQueue.length 
      });
      
    } catch (error) {
      console.error('Sync failed:', error);
      this.retryAttempts++;
      
      this.emitEvent('syncStatus', { 
        status: 'error', 
        error: error.message,
        retryAttempts: this.retryAttempts,
        timestamp: new Date().toISOString() 
      });
      
      // Retry logic
      if (this.retryAttempts < this.maxRetries) {
        setTimeout(() => this.performSync(), 5000 * this.retryAttempts);
      }
    }
  }

  // Process sync queue
  async processSyncQueue() {
    const queue = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const operation of queue) {
      try {
        await this.processOperation(operation);
      } catch (error) {
        console.error('Failed to process operation:', operation, error);
        // Re-add to queue for retry
        this.syncQueue.push(operation);
      }
    }
  }

  // Process individual operation
  async processOperation(operation) {
    switch (operation.type) {
      case 'create':
        return await onlineService.saveWorkoutPlan(operation.data);
      case 'update':
        return await onlineService.updateWorkoutPlan(operation.id, operation.data);
      case 'delete':
        return await onlineService.deletePlan(operation.id);
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
  }

  // Sync local plans with backend
  async syncLocalPlans() {
    const localPlans = planService.getAllPlans();
    const unsyncedPlans = localPlans.filter(plan => !plan.synced && !plan.backendId);
    
    for (const plan of unsyncedPlans) {
      try {
        const backendPlan = await onlineService.saveWorkoutPlan({
          name: plan.name,
          exercises: plan.exercises,
          category: plan.category,
          description: plan.description,
          localId: plan.id
        });
        
        if (backendPlan) {
          // Update local plan with backend info
          planService.updatePlan(plan.id, {
            backendId: backendPlan._id,
            synced: true,
            lastSynced: new Date().toISOString()
          });
          
          this.emitEvent('planSynced', { 
            localId: plan.id, 
            backendId: backendPlan._id,
            plan: backendPlan 
          });
        }
      } catch (error) {
        console.error('Failed to sync plan:', plan.name, error);
      }
    }
  }

  // Add operation to sync queue
  queueOperation(type, data, id = null) {
    const operation = {
      id: Date.now().toString(),
      type,
      data,
      planId: id,
      timestamp: new Date().toISOString(),
      retries: 0
    };
    
    this.syncQueue.push(operation);
    
    // Trigger immediate sync if online
    if (navigator.onLine) {
      setTimeout(() => this.performSync(), 1000);
    }
    
    return operation.id;
  }

  // Create plan with real-time sync
  async createPlan(planData) {
    try {
      // Save locally first
      const localPlan = planService.savePlan(planData);
      
      // Emit local creation event
      this.emitEvent('planCreatedLocally', { plan: localPlan });
      
      // Try immediate sync if online
      const isOnline = await onlineService.checkBackendStatus();
      if (isOnline) {
        try {
          const backendPlan = await onlineService.saveWorkoutPlan({
            ...planData,
            localId: localPlan.id
          });
          
          if (backendPlan) {
            // Update local plan with backend info
            planService.updatePlan(localPlan.id, {
              backendId: backendPlan._id,
              synced: true,
              lastSynced: new Date().toISOString()
            });
            
            this.emitEvent('planSynced', { 
              localId: localPlan.id, 
              backendId: backendPlan._id,
              plan: backendPlan 
            });
            
            return { success: true, plan: backendPlan, synced: true };
          }
        } catch (error) {
          console.error('Immediate sync failed:', error);
          // Queue for later sync
          this.queueOperation('create', planData, localPlan.id);
        }
      } else {
        // Queue for sync when online
        this.queueOperation('create', planData, localPlan.id);
      }
      
      return { success: true, plan: localPlan, synced: false };
      
    } catch (error) {
      console.error('Failed to create plan:', error);
      throw error;
    }
  }

  // Update plan with real-time sync
  async updatePlan(planId, planData) {
    try {
      // Update locally first
      const updatedPlan = planService.updatePlan(planId, planData);
      
      // Emit local update event
      this.emitEvent('planUpdatedLocally', { plan: updatedPlan });
      
      // Try immediate sync if online and plan has backend ID
      if (updatedPlan.backendId) {
        const isOnline = await onlineService.checkBackendStatus();
        if (isOnline) {
          try {
            const backendPlan = await onlineService.updateWorkoutPlan(updatedPlan.backendId, planData);
            
            if (backendPlan) {
              // Update sync status
              planService.updatePlan(planId, {
                synced: true,
                lastSynced: new Date().toISOString()
              });
              
              this.emitEvent('planSynced', { 
                localId: planId, 
                backendId: updatedPlan.backendId,
                plan: backendPlan 
              });
              
              return { success: true, plan: backendPlan, synced: true };
            }
          } catch (error) {
            console.error('Immediate update sync failed:', error);
            // Queue for later sync
            this.queueOperation('update', planData, updatedPlan.backendId);
          }
        } else {
          // Queue for sync when online
          this.queueOperation('update', planData, updatedPlan.backendId);
        }
      }
      
      return { success: true, plan: updatedPlan, synced: false };
      
    } catch (error) {
      console.error('Failed to update plan:', error);
      throw error;
    }
  }

  // Delete plan with real-time sync
  async deletePlan(planId) {
    try {
      const plan = planService.getPlanById(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }
      
      // Delete locally first
      planService.deletePlan(planId);
      
      // Emit local deletion event
      this.emitEvent('planDeletedLocally', { planId, plan });
      
      // Try immediate sync if online and plan has backend ID
      if (plan.backendId) {
        const isOnline = await onlineService.checkBackendStatus();
        if (isOnline) {
          try {
            await onlineService.deletePlan(plan.backendId);
            
            this.emitEvent('planSynced', { 
              localId: planId, 
              backendId: plan.backendId,
              action: 'deleted' 
            });
            
            return { success: true, synced: true };
          } catch (error) {
            console.error('Immediate delete sync failed:', error);
            // Queue for later sync
            this.queueOperation('delete', null, plan.backendId);
          }
        } else {
          // Queue for sync when online
          this.queueOperation('delete', null, plan.backendId);
        }
      }
      
      return { success: true, synced: false };
      
    } catch (error) {
      console.error('Failed to delete plan:', error);
      throw error;
    }
  }

  // Get real-time analytics
  async getRealTimeAnalytics() {
    try {
      const isOnline = await onlineService.checkBackendStatus();
      if (isOnline) {
        const analytics = await onlineService.getPlanAnalytics();
        if (analytics && !analytics.error) {
          this.emitEvent('analyticsUpdated', analytics);
          return analytics;
        }
      }
      
      // Fallback to local analytics
      const localPlans = planService.getAllPlans();
      const localAnalytics = {
        totalPlans: localPlans.length,
        totalWorkouts: 0,
        syncedPlans: localPlans.filter(p => p.synced).length,
        unsyncedPlans: localPlans.filter(p => !p.synced).length,
        sync: {
          totalPlans: localPlans.length,
          syncedPlans: localPlans.filter(p => p.synced).length,
          unsyncedPlans: localPlans.filter(p => !p.synced).length,
          syncPercentage: localPlans.length > 0 ? Math.round((localPlans.filter(p => p.synced).length / localPlans.length) * 100) : 100
        },
        lastSync: this.lastSyncTime,
        isRealTime: false
      };
      
      return localAnalytics;
      
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return {
        totalPlans: 0,
        totalWorkouts: 0,
        syncedPlans: 0,
        unsyncedPlans: 0,
        sync: { syncPercentage: 0, syncedPlans: 0, unsyncedPlans: 0 },
        isRealTime: false,
        error: true
      };
    }
  }

  // Handle network status changes
  handleOnlineStatus(isOnline) {
    this.emitEvent('networkStatusChanged', { isOnline, timestamp: new Date().toISOString() });
    
    if (isOnline && this.syncQueue.length > 0) {
      console.log('🌐 Back online - processing sync queue...');
      setTimeout(() => this.performSync(), 2000);
    }
  }

  // Handle plan events
  handlePlanEvent(eventType, eventData) {
    console.log(`📋 Plan ${eventType}:`, eventData);
    
    // Trigger analytics update
    setTimeout(() => this.getRealTimeAnalytics(), 1000);
  }

  // Cleanup method
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (typeof window !== 'undefined' && this.onlineHandler && this.offlineHandler) {
      window.removeEventListener('online', this.onlineHandler);
      window.removeEventListener('offline', this.offlineHandler);
    }
    
    this.eventListeners.clear();
    this.syncQueue = [];
    this.isActive = false;
  }

  // Event system
  addEventListener(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emitEvent(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isActive: this.isActive,
      lastSyncTime: this.lastSyncTime,
      queueSize: this.syncQueue.length,
      retryAttempts: this.retryAttempts,
      maxRetries: this.maxRetries
    };
  }

  // Force sync
  async forceSync() {
    console.log('🔄 Force sync triggered...');
    this.retryAttempts = 0;
    await this.performSync();
  }

  // Clear sync queue
  clearSyncQueue() {
    this.syncQueue = [];
    console.log('🗑️ Sync queue cleared');
  }
}

// Create singleton instance
export const realTimePlanService = new RealTimePlanService();
export default realTimePlanService;

// Auto-start real-time sync when service is imported
if (typeof window !== 'undefined') {
  // Start sync after a short delay to allow app initialization
  setTimeout(() => {
    realTimePlanService.startRealTimeSync();
  }, 2000);
}