// Utility to clean up fake workouts and ensure user-specific data
// This script should be run when users login to ensure clean data

export const cleanUserWorkouts = (currentUser) => {
  if (!currentUser) {
    console.log("🔒 No user provided - cannot clean workouts");
    return { success: false, message: "No user provided" };
  }

  try {
    console.log(
      `🧹 Cleaning workouts for user: ${currentUser.id || currentUser._id}`,
    );

    // Get all workouts from localStorage
    const allWorkouts = JSON.parse(
      localStorage.getItem("workoutSync_workouts") || "[]",
    );
    console.log(`📊 Found ${allWorkouts.length} total workouts in storage`);

    // Filter for real workouts belonging to current user
    const userRealWorkouts = allWorkouts.filter((workout) => {
      // Check if workout is real (not fake/test)
      const isRealWorkout =
        workout.exercise &&
        workout.exercise !== "Workout" &&
        workout.exercise !== "Test Workout" &&
        workout.exercise !== "Demo Workout" &&
        (workout.duration > 0 || workout.caloriesBurned > 0) &&
        workout.completedAt &&
        !workout.id?.includes("test_") &&
        !workout.id?.includes("fake_") &&
        !workout.id?.includes("demo_") &&
        !workout.id?.includes("sample_");

      // Check if workout belongs to current user
      const belongsToUser =
        workout.userId === currentUser.id ||
        workout.userId === currentUser._id ||
        (!workout.userId && isRealWorkout); // Backward compatibility

      return isRealWorkout && belongsToUser;
    });

    // Keep workouts from other users
    const otherUsersWorkouts = allWorkouts.filter((workout) => {
      const hasUserId =
        workout.userId &&
        workout.userId !== currentUser.id &&
        workout.userId !== currentUser._id;
      return hasUserId;
    });

    // Ensure current user's workouts have userId set
    const cleanUserWorkouts = userRealWorkouts.map((workout) => ({
      ...workout,
      userId: workout.userId || currentUser.id || currentUser._id,
    }));

    // Remove duplicates for current user
    const uniqueUserWorkouts = [];
    const seen = new Set();

    for (const workout of cleanUserWorkouts) {
      const key = `${currentUser.id}_${workout.exercise}_${new Date(workout.completedAt).toDateString()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueUserWorkouts.push(workout);
      }
    }

    // Combine all workouts
    const finalWorkouts = [...otherUsersWorkouts, ...uniqueUserWorkouts];

    // Save back to localStorage
    localStorage.setItem("workoutSync_workouts", JSON.stringify(finalWorkouts));

    const result = {
      success: true,
      message: `Cleaned workouts for user ${currentUser.id}`,
      stats: {
        totalBefore: allWorkouts.length,
        userWorkoutsAfter: uniqueUserWorkouts.length,
        otherUsersWorkouts: otherUsersWorkouts.length,
        totalAfter: finalWorkouts.length,
        removed: allWorkouts.length - finalWorkouts.length,
      },
    };

    console.log("✅ Workout cleanup completed:", result.stats);
    return result;
  } catch (error) {
    console.error("❌ Error cleaning user workouts:", error);
    return {
      success: false,
      message: `Error cleaning workouts: ${error.message}`,
      error: error.message,
    };
  }
};

// Clear all fake/demo data from localStorage
export const clearAllFakeData = () => {
  try {
    console.log("🧹 Clearing all fake/demo data...");

    // Clear fake workouts
    const workouts = JSON.parse(
      localStorage.getItem("workoutSync_workouts") || "[]",
    );
    const realWorkouts = workouts.filter((workout) => {
      return (
        workout.exercise &&
        workout.exercise !== "Workout" &&
        workout.exercise !== "Test Workout" &&
        workout.exercise !== "Demo Workout" &&
        (workout.duration > 0 || workout.caloriesBurned > 0) &&
        workout.completedAt &&
        !workout.id?.includes("test_") &&
        !workout.id?.includes("fake_") &&
        !workout.id?.includes("demo_") &&
        !workout.id?.includes("sample_")
      );
    });

    localStorage.setItem("workoutSync_workouts", JSON.stringify(realWorkouts));

    // Clear other fake data
    const keysToCheck = [
      "demo_workouts",
      "test_workouts",
      "fake_workouts",
      "sample_data",
      "demo_plans",
      "test_plans",
    ];

    keysToCheck.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed ${key}`);
      }
    });

    console.log(
      `✅ Fake data cleanup completed. Kept ${realWorkouts.length} real workouts`,
    );
    return {
      success: true,
      message: "Fake data cleared successfully",
      realWorkoutsKept: realWorkouts.length,
    };
  } catch (error) {
    console.error("❌ Error clearing fake data:", error);
    return {
      success: false,
      message: `Error clearing fake data: ${error.message}`,
      error: error.message,
    };
  }
};

// Initialize user-specific data on login
export const initializeUserData = (user) => {
  if (!user) {
    console.log("🔒 No user provided for initialization");
    return { success: false, message: "No user provided" };
  }

  try {
    console.log(`🚀 Initializing data for user: ${user.id || user._id}`);

    // Clean workouts first
    const cleanupResult = cleanUserWorkouts(user);

    // Clear any cached data that might be global
    localStorage.removeItem("mongodb_workouts_cache");

    // Dispatch event to refresh all components
    window.dispatchEvent(
      new CustomEvent("userDataInitialized", {
        detail: {
          user,
          cleanupResult,
        },
      }),
    );

    console.log("✅ User data initialization completed");
    return {
      success: true,
      message: `User data initialized for ${user.id}`,
      cleanupResult,
    };
  } catch (error) {
    console.error("❌ Error initializing user data:", error);
    return {
      success: false,
      message: `Error initializing user data: ${error.message}`,
      error: error.message,
    };
  }
};

export default {
  cleanUserWorkouts,
  clearAllFakeData,
  initializeUserData,
};
