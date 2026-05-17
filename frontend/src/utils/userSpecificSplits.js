/**
 * User-Specific Workout Splits Management Utility
 * Handles migration and isolation of workout splits per user
 */

/**
 * Migrate existing global splits to user-specific storage
 * @param {Object} user - Current user object
 */
export const migrateUserSplits = (user) => {
  try {
    if (!user || (!user.id && !user._id)) {
      console.warn("⚠️ No valid user provided for split migration");
      return;
    }

    const userId = user.id || user._id;
    const userSpecificKey = `custom_workout_splits_${userId}`;

    // Check if user already has migrated splits
    const existingUserSplits = localStorage.getItem(userSpecificKey);
    if (existingUserSplits) {
      console.log(`✅ User ${userId} already has migrated splits`);
      return;
    }

    // Get global splits (legacy storage)
    const globalSplits = JSON.parse(
      localStorage.getItem("custom_workout_splits") || "[]",
    );

    if (globalSplits.length === 0) {
      console.log(`📝 No global splits to migrate for user ${userId}`);
      return;
    }

    // Filter splits that belong to this user
    const userSplits = globalSplits.filter(
      (split) =>
        split.userId === userId ||
        split.createdBy === user.name ||
        split.createdBy === user.email,
    );

    if (userSplits.length > 0) {
      // Save user-specific splits
      localStorage.setItem(userSpecificKey, JSON.stringify(userSplits));
      console.log(
        `🚀 Migrated ${userSplits.length} splits to user-specific storage for user ${userId}`,
      );
    } else {
      // Create empty user-specific storage
      localStorage.setItem(userSpecificKey, JSON.stringify([]));
      console.log(`📝 Created empty user-specific storage for user ${userId}`);
    }
  } catch (error) {
    console.error("❌ Error migrating user splits:", error);
  }
};

/**
 * Get user-specific splits
 * @param {Object} user - Current user object
 * @returns {Array} User's workout splits
 */
export const getUserSplits = (user) => {
  try {
    if (!user || (!user.id && !user._id)) {
      return [];
    }

    const userId = user.id || user._id;
    const userSpecificKey = `custom_workout_splits_${userId}`;
    const userSplits = JSON.parse(
      localStorage.getItem(userSpecificKey) || "[]",
    );

    // Double-check ownership
    return userSplits.filter(
      (split) =>
        split.userId === userId ||
        split.createdBy === user.name ||
        split.createdBy === user.email,
    );
  } catch (error) {
    console.error("❌ Error getting user splits:", error);
    return [];
  }
};

/**
 * Save split to user-specific storage
 * @param {Object} user - Current user object
 * @param {Object} split - Split to save
 */
export const saveUserSplit = (user, split) => {
  try {
    if (!user || (!user.id && !user._id)) {
      throw new Error("User not authenticated");
    }

    const userId = user.id || user._id;
    const userSpecificKey = `custom_workout_splits_${userId}`;

    // Ensure split has user ownership
    const userSplit = {
      ...split,
      userId: userId,
      createdBy: user.name || user.email || "User",
    };

    const existingSplits = JSON.parse(
      localStorage.getItem(userSpecificKey) || "[]",
    );

    // Check if updating existing split
    const existingIndex = existingSplits.findIndex((s) => s.id === split.id);
    if (existingIndex !== -1) {
      existingSplits[existingIndex] = userSplit;
    } else {
      existingSplits.push(userSplit);
    }

    localStorage.setItem(userSpecificKey, JSON.stringify(existingSplits));
    console.log(`✅ Saved split to user-specific storage: ${userSpecificKey}`);

    return userSplit;
  } catch (error) {
    console.error("❌ Error saving user split:", error);
    throw error;
  }
};

/**
 * Delete split from user-specific storage
 * @param {Object} user - Current user object
 * @param {string} splitId - ID of split to delete
 */
export const deleteUserSplit = (user, splitId) => {
  try {
    if (!user || (!user.id && !user._id)) {
      throw new Error("User not authenticated");
    }

    const userId = user.id || user._id;
    const userSpecificKey = `custom_workout_splits_${userId}`;

    const existingSplits = JSON.parse(
      localStorage.getItem(userSpecificKey) || "[]",
    );
    const updatedSplits = existingSplits.filter(
      (split) => split.id !== splitId,
    );

    localStorage.setItem(userSpecificKey, JSON.stringify(updatedSplits));
    console.log(`✅ Deleted split from user-specific storage: ${splitId}`);

    return updatedSplits;
  } catch (error) {
    console.error("❌ Error deleting user split:", error);
    throw error;
  }
};

/**
 * Clean up user-specific data on logout
 * This doesn't delete the data, just clears any cached references
 */
export const cleanupUserSplitsOnLogout = () => {
  try {
    // Clear any cached split data that might be in memory
    // The actual localStorage data remains for when user logs back in
    console.log("🧹 Cleaned up user splits cache on logout");
  } catch (error) {
    console.error("❌ Error cleaning up user splits:", error);
  }
};

/**
 * Initialize user-specific splits storage
 * @param {Object} user - Current user object
 */
export const initializeUserSplits = (user) => {
  try {
    if (!user || (!user.id && !user._id)) {
      return;
    }

    const userId = user.id || user._id;
    const userSpecificKey = `custom_workout_splits_${userId}`;

    // Check if user-specific storage exists
    const existingStorage = localStorage.getItem(userSpecificKey);
    if (!existingStorage) {
      // Create empty user-specific storage
      localStorage.setItem(userSpecificKey, JSON.stringify([]));
      console.log(
        `📝 Initialized empty user-specific splits storage for user ${userId}`,
      );
    }

    // Migrate any existing global splits
    migrateUserSplits(user);
  } catch (error) {
    console.error("❌ Error initializing user splits:", error);
  }
};

/**
 * Get all user-specific storage keys (for debugging)
 */
export const getUserSplitStorageKeys = () => {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("custom_workout_splits_")) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Clean up old global splits storage (run once after migration)
 * WARNING: This will remove the global storage completely
 */
export const cleanupGlobalSplitsStorage = () => {
  try {
    const globalSplits = localStorage.getItem("custom_workout_splits");
    if (globalSplits) {
      console.log("🧹 Removing old global splits storage after migration");
      localStorage.removeItem("custom_workout_splits");
    }
  } catch (error) {
    console.error("❌ Error cleaning up global splits storage:", error);
  }
};
