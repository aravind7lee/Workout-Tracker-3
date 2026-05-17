// Authentication check utility
export const isUserAuthenticated = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || token === "null" || token === "undefined") {
    return false;
  }

  if (!user || user === "null" || user === "undefined") {
    return false;
  }

  try {
    // Validate token format (JWT has 3 parts)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return false;
    }

    // Validate user data
    const userData = JSON.parse(user);
    if (!userData || (!userData.id && !userData._id)) {
      return false;
    }

    return true;
  } catch (e) {
    return false;
  }
};

// Safe API call wrapper - only makes request if authenticated
export const safeAuthenticatedCall = async (
  apiCallFn,
  fallbackValue = null,
) => {
  if (!isUserAuthenticated()) {
    console.warn("⚠️ Skipping API call - user not authenticated");
    return fallbackValue;
  }

  try {
    return await apiCallFn();
  } catch (error) {
    if (
      error.message?.includes("authentication") ||
      error.message?.includes("token")
    ) {
      console.warn("⚠️ Authentication error, skipping request");
      return fallbackValue;
    }
    throw error;
  }
};
