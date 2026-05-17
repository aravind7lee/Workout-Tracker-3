// frontend/src/utils/healthCheck.js
import api from "./api.js";

export const checkBackendHealth = async () => {
  try {
    const response = await api.get("/health");
    console.log("✅ Backend Health Check:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Backend Health Check Failed:", error.message);
    return {
      success: false,
      error: error.message,
      suggestion:
        "Please ensure your backend is deployed and running at the correct URL",
    };
  }
};

export const testBackendConnection = async () => {
  try {
    const response = await api.get("/");
    console.log("✅ Backend Connection Test:", response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("❌ Backend Connection Failed:", error.message);
    return {
      success: false,
      error: error.message,
      suggestion: "Check if backend URL is correct in .env file",
    };
  }
};
