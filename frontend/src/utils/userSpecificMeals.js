// User-Specific Meals Migration and Management
export const migrateToUserSpecificMeals = () => {
  try {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    if (!currentUser) {
      console.log('🔒 No user logged in - skipping meal migration');
      return;
    }

    const userId = currentUser.id || currentUser._id;
    const userMealKey = `recentMeals_${userId}`;
    
    // Check if user-specific meals already exist
    const existingUserMeals = localStorage.getItem(userMealKey);
    if (existingUserMeals) {
      console.log('✅ User-specific meals already exist for user:', userId);
      return;
    }

    // Get old global meals
    const oldMeals = JSON.parse(localStorage.getItem('recentMeals') || '[]');
    
    if (oldMeals.length > 0) {
      // Migrate to user-specific key
      localStorage.setItem(userMealKey, JSON.stringify(oldMeals));
      console.log(`📦 Migrated ${oldMeals.length} meals to user-specific storage for user:`, userId);
      
      // Clear old global meals
      localStorage.removeItem('recentMeals');
      console.log('🧹 Cleared old global meal storage');
    } else {
      // Initialize empty user-specific meals
      localStorage.setItem(userMealKey, JSON.stringify([]));
      console.log('🆕 Initialized empty meal storage for user:', userId);
    }
  } catch (error) {
    console.error('❌ Error migrating meals to user-specific storage:', error);
  }
};

export const clearUserMealData = (userId) => {
  try {
    if (!userId) {
      console.warn('⚠️ No user ID provided for meal data cleanup');
      return;
    }
    
    const userMealKey = `recentMeals_${userId}`;
    localStorage.removeItem(userMealKey);
    console.log('🧹 Cleared meal data for user:', userId);
  } catch (error) {
    console.error('❌ Error clearing user meal data:', error);
  }
};

export const getUserMeals = (userId) => {
  try {
    if (!userId) {
      console.warn('⚠️ No user ID provided for getting meals');
      return [];
    }
    
    const userMealKey = `recentMeals_${userId}`;
    const meals = JSON.parse(localStorage.getItem(userMealKey) || '[]');
    console.log(`📊 Retrieved ${meals.length} meals for user:`, userId);
    return meals;
  } catch (error) {
    console.error('❌ Error getting user meals:', error);
    return [];
  }
};

export const setUserMeals = (userId, meals) => {
  try {
    if (!userId) {
      console.warn('⚠️ No user ID provided for setting meals');
      return false;
    }
    
    const userMealKey = `recentMeals_${userId}`;
    localStorage.setItem(userMealKey, JSON.stringify(meals || []));
    console.log(`💾 Saved ${(meals || []).length} meals for user:`, userId);
    return true;
  } catch (error) {
    console.error('❌ Error setting user meals:', error);
    return false;
  }
};

export const cleanupAllUserMealData = () => {
  try {
    const keys = Object.keys(localStorage);
    let cleanedCount = 0;
    
    keys.forEach(key => {
      if (key.startsWith('recentMeals_')) {
        localStorage.removeItem(key);
        cleanedCount++;
      }
    });
    
    // Also remove old global meals
    localStorage.removeItem('recentMeals');
    
    console.log(`🧹 Cleaned up ${cleanedCount} user-specific meal storage keys`);
    return cleanedCount;
  } catch (error) {
    console.error('❌ Error cleaning up meal data:', error);
    return 0;
  }
};