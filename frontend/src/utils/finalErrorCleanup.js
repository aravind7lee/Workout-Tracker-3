// Final Error Cleanup - Stop All Continuous API Calls
console.log("🛑 Final Error Cleanup - Stopping continuous API calls");

// Override fetch to prevent continuous failed requests
const originalFetch = window.fetch;
const failedEndpoints = new Set();
const lastFailTime = new Map();
const COOLDOWN_PERIOD = 60000; // 1 minute cooldown

window.fetch = async function (url, options = {}) {
  // Check if this endpoint recently failed
  if (typeof url === "string") {
    const endpoint = url.split("?")[0]; // Remove query params
    const now = Date.now();
    const lastFail = lastFailTime.get(endpoint);

    // If endpoint failed recently, return cached failure silently
    if (
      failedEndpoints.has(endpoint) &&
      lastFail &&
      now - lastFail < COOLDOWN_PERIOD
    ) {
      return new Response(
        JSON.stringify({ error: "Endpoint temporarily blocked" }),
        {
          status: 503,
          statusText: "Service Temporarily Unavailable",
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  try {
    const response = await originalFetch.apply(this, arguments);

    // If request succeeded, remove from failed list
    if (response.ok && typeof url === "string") {
      const endpoint = url.split("?")[0];
      failedEndpoints.delete(endpoint);
      lastFailTime.delete(endpoint);
    }

    // If request failed with 500, add to failed list
    if (response.status === 500 && typeof url === "string") {
      const endpoint = url.split("?")[0];
      failedEndpoints.add(endpoint);
      lastFailTime.set(endpoint, Date.now());
    }

    return response;
  } catch (error) {
    // Network errors - also block the endpoint
    if (typeof url === "string") {
      const endpoint = url.split("?")[0];
      failedEndpoints.add(endpoint);
      lastFailTime.set(endpoint, Date.now());
    }
    throw error;
  }
};

// Clear all intervals to stop continuous requests
let highestIntervalId = setInterval(() => {}, 0);
for (let i = 1; i <= highestIntervalId; i++) {
  clearInterval(i);
}

console.log("✅ All continuous API calls stopped");

export default {
  stopAllRequests: () => {
    failedEndpoints.clear();
    lastFailTime.clear();
    console.log("🔄 Request blocking cleared");
  },
};
