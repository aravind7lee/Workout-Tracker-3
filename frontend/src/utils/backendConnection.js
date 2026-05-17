// Backend Connection Utility
export const backendConnection = {
  baseUrl: "https://workout-tracker-backend-wga7.onrender.com",

  async testConnection() {
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 5000,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Backend connected:", data);
        return true;
      } else {
        console.warn("⚠️ Backend responded with error:", response.status);
        return false;
      }
    } catch (error) {
      console.warn("❌ Backend connection failed:", error.message);
      return false;
    }
  },

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      } else {
        throw new Error("Response is not JSON");
      }
    } catch (error) {
      console.warn(`API request failed for ${endpoint}:`, error.message);
      throw error;
    }
  },
};

export default backendConnection;
