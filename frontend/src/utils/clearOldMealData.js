// Clear all old meal data to fix fake dummy results
export const clearAllOldMealData = () => {
  try {
    console.log("🧹 Clearing all old meal data...");

    // Remove old global meals
    localStorage.removeItem("recentMeals");

    // Remove all user-specific meal keys
    const keys = Object.keys(localStorage);
    let clearedCount = 0;

    keys.forEach((key) => {
      if (key.startsWith("recentMeals_")) {
        localStorage.removeItem(key);
        clearedCount++;
        console.log("🗑️ Removed:", key);
      }
    });

    console.log(`✅ Cleared ${clearedCount} user-specific meal storage keys`);
    console.log("✅ Cleared old global meal storage");

    return true;
  } catch (error) {
    console.error("❌ Error clearing old meal data:", error);
    return false;
  }
};

export const initializeEmptyUserMeals = (userId) => {
  try {
    if (!userId) {
      console.warn("⚠️ No user ID provided for initialization");
      return false;
    }

    const userMealKey = `recentMeals_${userId}`;
    localStorage.setItem(userMealKey, JSON.stringify([]));
    console.log("🆕 Initialized empty meal storage for user:", userId);

    return true;
  } catch (error) {
    console.error("❌ Error initializing user meals:", error);
    return false;
  }
};
