// frontend/src/services/planService.js
const STORAGE_KEY = 'workoutPlans';

export const planService = {
  // Save a new workout plan
  savePlan: (planData) => {
    try {
      console.log('Saving plan:', planData);
      const existingPlans = planService.getAllPlans();
      console.log('Existing plans:', existingPlans);
      
      const newPlan = {
        id: Date.now().toString(),
        name: planData.name,
        exercises: planData.exercises,
        category: planData.category || 'General',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      console.log('New plan created:', newPlan);
      const updatedPlans = [...existingPlans, newPlan];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
      console.log('Plans saved to localStorage:', updatedPlans);
      
      // Verify save
      const savedPlans = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      console.log('Verified saved plans:', savedPlans);
      
      return newPlan;
    } catch (error) {
      console.error('Error saving plan:', error);
      throw new Error('Failed to save plan');
    }
  },

  // Get all saved plans
  getAllPlans: () => {
    try {
      const plans = localStorage.getItem(STORAGE_KEY);
      return plans ? JSON.parse(plans) : [];
    } catch (error) {
      console.error('Error loading plans:', error);
      return [];
    }
  },

  // Get a specific plan by ID
  getPlanById: (id) => {
    const plans = planService.getAllPlans();
    return plans.find(plan => plan.id === id);
  },

  // Update an existing plan
  updatePlan: (id, planData) => {
    try {
      console.log('Updating plan:', id, planData);
      const plans = planService.getAllPlans();
      const planIndex = plans.findIndex(plan => plan.id === id);
      
      if (planIndex === -1) {
        throw new Error('Plan not found');
      }
      
      plans[planIndex] = {
        ...plans[planIndex],
        ...planData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('Updated plan:', plans[planIndex]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      console.log('All plans after update:', plans);
      
      return plans[planIndex];
    } catch (error) {
      console.error('Error updating plan:', error);
      throw new Error('Failed to update plan');
    }
  },

  // Delete a plan
  deletePlan: (id) => {
    try {
      const plans = planService.getAllPlans();
      const filteredPlans = plans.filter(plan => plan.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredPlans));
      return true;
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw new Error('Failed to delete plan');
    }
  },

  // Duplicate a plan
  duplicatePlan: (id) => {
    try {
      const originalPlan = planService.getPlanById(id);
      if (!originalPlan) {
        throw new Error('Plan not found');
      }
      
      const duplicatedPlan = {
        ...originalPlan,
        id: Date.now().toString(),
        name: `${originalPlan.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const plans = planService.getAllPlans();
      const updatedPlans = [...plans, duplicatedPlan];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
      return duplicatedPlan;
    } catch (error) {
      console.error('Error duplicating plan:', error);
      throw new Error('Failed to duplicate plan');
    }
  }
};