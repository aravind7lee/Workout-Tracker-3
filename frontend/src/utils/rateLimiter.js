// Rate limiter to prevent excessive API calls
class RateLimiter {
  constructor() {
    this.requests = new Map();
    this.limits = {
      "/api/health": { maxRequests: 1, windowMs: 60000 }, // 1 per minute
      "/api/users/stats": { maxRequests: 1, windowMs: 30000 }, // 1 per 30 seconds
      "/api/analytics": { maxRequests: 1, windowMs: 30000 },
      "/api/users/activity": { maxRequests: 1, windowMs: 60000 },
      "/api/users/achievements": { maxRequests: 1, windowMs: 60000 },
      "/api/analytics/hero-stats": { maxRequests: 1, windowMs: 60000 },
    };
  }

  canMakeRequest(endpoint) {
    const now = Date.now();
    const limit = this.limits[endpoint];

    if (!limit) return true;

    const requestHistory = this.requests.get(endpoint) || [];
    const validRequests = requestHistory.filter(
      (time) => now - time < limit.windowMs,
    );

    if (validRequests.length >= limit.maxRequests) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(endpoint, validRequests);
    return true;
  }

  getEndpointFromUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {
      return url;
    }
  }
}

export const rateLimiter = new RateLimiter();
