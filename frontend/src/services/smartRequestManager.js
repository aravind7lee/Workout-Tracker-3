// Smart Request Manager - Handles rate limiting and CORS issues
import api from "../utils/api";

class SmartRequestManager {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.rateLimitDelay = 1000; // 1 second between requests
    this.maxRetries = 3;
    this.backoffMultiplier = 2;
  }

  async makeRequest(config, retryCount = 0) {
    try {
      // Add delay to prevent rate limiting
      if (retryCount > 0) {
        const delay =
          this.rateLimitDelay *
          Math.pow(this.backoffMultiplier, retryCount - 1);
        await this.sleep(delay);
      }

      const response = await api(config);
      return response;
    } catch (error) {
      // Handle rate limiting (429)
      if (error.response?.status === 429 && retryCount < this.maxRetries) {
        console.log(
          `Rate limited, retrying in ${this.rateLimitDelay * Math.pow(this.backoffMultiplier, retryCount)}ms...`,
        );
        return this.makeRequest(config, retryCount + 1);
      }

      // Handle CORS errors by switching to offline mode
      if (error.code === "ERR_NETWORK" || error.message?.includes("CORS")) {
        console.log("Network/CORS error, switching to offline mode");
        throw { ...error, offline: true };
      }

      throw error;
    }
  }

  async queueRequest(config) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ config, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const { config, resolve, reject } = this.requestQueue.shift();

      try {
        const response = await this.makeRequest(config);
        resolve(response);
      } catch (error) {
        reject(error);
      }

      // Small delay between requests to prevent rate limiting
      await this.sleep(200);
    }

    this.isProcessing = false;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Specific methods for common requests
  async get(url, config = {}) {
    return this.queueRequest({
      method: "GET",
      url,
      ...config,
    });
  }

  async post(url, data, config = {}) {
    return this.queueRequest({
      method: "POST",
      url,
      data,
      ...config,
    });
  }

  async put(url, data, config = {}) {
    return this.queueRequest({
      method: "PUT",
      url,
      data,
      ...config,
    });
  }

  async delete(url, config = {}) {
    return this.queueRequest({
      method: "DELETE",
      url,
      ...config,
    });
  }
}

// Create singleton instance
export const smartRequest = new SmartRequestManager();

// Enhanced API wrapper with offline fallback
export const safeApiCall = async (requestFn, fallbackData = null) => {
  try {
    const result = await requestFn();
    return { success: true, data: result.data, online: true };
  } catch (error) {
    console.warn("API call failed, using fallback:", error.message);

    if (error.offline || error.code === "ERR_NETWORK") {
      return {
        success: false,
        data: fallbackData,
        online: false,
        error: "Offline mode",
      };
    }

    if (error.response?.status === 429) {
      return {
        success: false,
        data: fallbackData,
        online: true,
        error: "Rate limited",
      };
    }

    throw error;
  }
};

export default smartRequest;
