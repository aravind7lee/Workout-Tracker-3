// Utility to clean up fake plans and ensure user-specific data

export const cleanUserPlans = (currentUser) => {
  if (!currentUser) {
    console.log('🔒 No user provided - cannot clean plans');
    return { success: false, message: 'No user provided' };
  }

  try {
    console.log(`🧹 Cleaning plans for user: ${currentUser.id || currentUser._id}`);
    
    // Get all plans from localStorage
    const allPlans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
    console.log(`📊 Found ${allPlans.length} total plans in storage`);
    
    // Filter for real plans belonging to current user
    const userRealPlans = allPlans.filter(plan => {
      // Check if plan is real (not fake/test)
      const isRealPlan = plan.name && 
                        plan.name !== 'Test Plan' &&
                        plan.name !== 'Demo Plan' &&
                        plan.exercises &&
                        Array.isArray(plan.exercises) &&
                        plan.exercises.length > 0 &&
                        !plan.id?.includes('test_') &&
                        !plan.id?.includes('fake_') &&
                        !plan.id?.includes('demo_') &&
                        !plan.id?.includes('sample_');
      
      // Check if plan belongs to current user
      const belongsToUser = plan.userId === currentUser.id || 
                           plan.userId === currentUser._id ||
                           (!plan.userId && plan.synced === false); // Backward compatibility
      
      return isRealPlan && belongsToUser;
    });
    
    // Keep plans from other users
    const otherUsersPlans = allPlans.filter(plan => {
      const hasUserId = plan.userId && 
                       plan.userId !== currentUser.id && 
                       plan.userId !== currentUser._id;
      return hasUserId;
    });
    
    // Ensure current user's plans have userId set
    const cleanUserPlans = userRealPlans.map(plan => ({
      ...plan,
      userId: plan.userId || currentUser.id || currentUser._id
    }));
    
    // Remove duplicates for current user
    const uniqueUserPlans = [];
    const seen = new Set();
    
    for (const plan of cleanUserPlans) {
      const key = `${currentUser.id}_${plan.name}_${plan.exercises?.length || 0}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueUserPlans.push(plan);
      }
    }
    
    // Combine all plans
    const finalPlans = [...otherUsersPlans, ...uniqueUserPlans];
    
    // Save back to localStorage
    localStorage.setItem('workoutPlans', JSON.stringify(finalPlans));
    
    const result = {
      success: true,
      message: `Cleaned plans for user ${currentUser.id}`,
      stats: {
        totalBefore: allPlans.length,
        userPlansAfter: uniqueUserPlans.length,
        otherUsersPlans: otherUsersPlans.length,
        totalAfter: finalPlans.length,
        removed: allPlans.length - finalPlans.length
      }
    };
    
    console.log('✅ Plan cleanup completed:', result.stats);
    return result;
    
  } catch (error) {
    console.error('❌ Error cleaning user plans:', error);
    return {
      success: false,
      message: `Error cleaning plans: ${error.message}`,
      error: error.message
    };
  }
};

// Clear all fake/demo plan data from localStorage
export const clearAllFakePlans = () => {
  try {
    console.log('🧹 Clearing all fake/demo plan data...');
    
    // Clear fake plans
    const plans = JSON.parse(localStorage.getItem('workoutPlans') || '[]');
    const realPlans = plans.filter(plan => {
      return plan.name && 
             plan.name !== 'Test Plan' &&
             plan.name !== 'Demo Plan' &&
             plan.exercises &&
             Array.isArray(plan.exercises) &&
             plan.exercises.length > 0 &&
             !plan.id?.includes('test_') &&
             !plan.id?.includes('fake_') &&
             !plan.id?.includes('demo_') &&
             !plan.id?.includes('sample_');
    });
    
    localStorage.setItem('workoutPlans', JSON.stringify(realPlans));
    
    console.log(`✅ Fake plan data cleanup completed. Kept ${realPlans.length} real plans`);
    return {
      success: true,
      message: 'Fake plan data cleared successfully',
      realPlansKept: realPlans.length
    };
    
  } catch (error) {
    console.error('❌ Error clearing fake plan data:', error);
    return {
      success: false,
      message: `Error clearing fake plan data: ${error.message}`,
      error: error.message
    };
  }
};

// Initialize user-specific plan data on login
export const initializeUserPlanData = (user) => {
  if (!user) {
    console.log('🔒 No user provided for plan initialization');
    return { success: false, message: 'No user provided' };
  }
  
  try {
    console.log(`🚀 Initializing plan data for user: ${user.id || user._id}`);
    
    // Clean plans first
    const cleanupResult = cleanUserPlans(user);
    
    // Refresh plan service if available
    if (window.realTimePlanService) {
      window.realTimePlanService.getPlans(true);
    }
    
    // Dispatch event to refresh all components
    window.dispatchEvent(new CustomEvent('userPlanDataInitialized', {
      detail: {
        user,
        cleanupResult
      }
    }));
    
    console.log('✅ User plan data initialization completed');
    return {
      success: true,
      message: `User plan data initialized for ${user.id}`,
      cleanupResult
    };
    
  } catch (error) {
    console.error('❌ Error initializing user plan data:', error);
    return {
      success: false,
      message: `Error initializing user plan data: ${error.message}`,
      error: error.message
    };
  }
};

export default {
  cleanUserPlans,
  clearAllFakePlans,
  initializeUserPlanData
};