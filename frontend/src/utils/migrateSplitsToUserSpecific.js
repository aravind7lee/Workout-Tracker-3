/**
 * One-time migration script to move global splits to user-specific storage
 * This should be run once when the user-specific system is first deployed
 */

/**
 * Migrate all existing global splits to user-specific storage
 * This is a one-time operation that should be run when users first log in
 */
export const migrateGlobalSplitsToUserSpecific = () => {
  try {
    console.log(
      "🔄 Starting migration of global splits to user-specific storage...",
    );

    // Get existing global splits
    const globalSplits = JSON.parse(
      localStorage.getItem("custom_workout_splits") || "[]",
    );

    if (globalSplits.length === 0) {
      console.log("📝 No global splits found to migrate");
      return { success: true, migratedCount: 0 };
    }

    console.log(`📊 Found ${globalSplits.length} global splits to migrate`);

    // Group splits by user
    const splitsByUser = {};
    let orphanedSplits = [];

    globalSplits.forEach((split) => {
      if (split.userId) {
        if (!splitsByUser[split.userId]) {
          splitsByUser[split.userId] = [];
        }
        splitsByUser[split.userId].push(split);
      } else if (split.createdBy && split.createdBy !== "User") {
        // Try to group by creator name (less reliable but better than nothing)
        const creatorKey = `creator_${split.createdBy}`;
        if (!splitsByUser[creatorKey]) {
          splitsByUser[creatorKey] = [];
        }
        splitsByUser[creatorKey].push(split);
      } else {
        orphanedSplits.push(split);
      }
    });

    // Migrate splits to user-specific storage
    let totalMigrated = 0;

    Object.keys(splitsByUser).forEach((userKey) => {
      const userSplits = splitsByUser[userKey];
      const userSpecificKey = userKey.startsWith("creator_")
        ? `custom_workout_splits_${userKey}`
        : `custom_workout_splits_${userKey}`;

      // Check if user-specific storage already exists
      const existingUserSplits = JSON.parse(
        localStorage.getItem(userSpecificKey) || "[]",
      );

      // Merge with existing splits (avoid duplicates)
      const existingIds = new Set(existingUserSplits.map((split) => split.id));
      const newSplits = userSplits.filter(
        (split) => !existingIds.has(split.id),
      );

      if (newSplits.length > 0) {
        const mergedSplits = [...existingUserSplits, ...newSplits];
        localStorage.setItem(userSpecificKey, JSON.stringify(mergedSplits));
        console.log(
          `✅ Migrated ${newSplits.length} splits for user ${userKey}`,
        );
        totalMigrated += newSplits.length;
      }
    });

    // Handle orphaned splits (create a backup)
    if (orphanedSplits.length > 0) {
      const orphanedKey = "custom_workout_splits_orphaned";
      localStorage.setItem(orphanedKey, JSON.stringify(orphanedSplits));
      console.log(
        `📦 Backed up ${orphanedSplits.length} orphaned splits to ${orphanedKey}`,
      );
    }

    // Mark migration as complete
    localStorage.setItem(
      "splits_migration_completed",
      new Date().toISOString(),
    );

    console.log(
      `🎉 Migration completed! Migrated ${totalMigrated} splits to user-specific storage`,
    );

    return {
      success: true,
      migratedCount: totalMigrated,
      orphanedCount: orphanedSplits.length,
      userCount: Object.keys(splitsByUser).length,
    };
  } catch (error) {
    console.error("❌ Migration failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if migration has been completed
 */
export const isMigrationCompleted = () => {
  return localStorage.getItem("splits_migration_completed") !== null;
};

/**
 * Clean up global splits storage after successful migration
 * WARNING: This will permanently delete the global storage
 */
export const cleanupGlobalSplitsAfterMigration = () => {
  try {
    if (!isMigrationCompleted()) {
      console.warn("⚠️ Migration not completed yet, skipping cleanup");
      return false;
    }

    const globalSplits = localStorage.getItem("custom_workout_splits");
    if (globalSplits) {
      // Create a backup before deletion
      const backupKey = `custom_workout_splits_backup_${Date.now()}`;
      localStorage.setItem(backupKey, globalSplits);

      // Remove global storage
      localStorage.removeItem("custom_workout_splits");

      console.log("🧹 Global splits storage cleaned up (backup created)");
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Error cleaning up global splits:", error);
    return false;
  }
};

/**
 * Get migration status and statistics
 */
export const getMigrationStatus = () => {
  try {
    const isCompleted = isMigrationCompleted();
    const completedAt = localStorage.getItem("splits_migration_completed");

    // Count user-specific storage keys
    const userStorageKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith("custom_workout_splits_") &&
        key !== "custom_workout_splits"
      ) {
        userStorageKeys.push(key);
      }
    }

    // Check for global splits
    const globalSplits = JSON.parse(
      localStorage.getItem("custom_workout_splits") || "[]",
    );

    return {
      migrationCompleted: isCompleted,
      completedAt,
      userStorageCount: userStorageKeys.length,
      globalSplitsRemaining: globalSplits.length,
      userStorageKeys,
    };
  } catch (error) {
    console.error("❌ Error getting migration status:", error);
    return {
      migrationCompleted: false,
      error: error.message,
    };
  }
};

/**
 * Force re-migration (for testing or fixing issues)
 */
export const forceMigration = () => {
  try {
    console.log("🔄 Forcing re-migration...");
    localStorage.removeItem("splits_migration_completed");
    return migrateGlobalSplitsToUserSpecific();
  } catch (error) {
    console.error("❌ Force migration failed:", error);
    return { success: false, error: error.message };
  }
};
