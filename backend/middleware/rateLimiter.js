// Optimized Rate Limiter for Production
import rateLimit from 'express-rate-limit';

// Relaxed general API rate limiter for production
export const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200, // Allow 200 requests per minute
  message: {
    success: false,
    message: 'Rate limit exceeded. Please wait a moment.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for essential endpoints
    const skipPaths = ['/api/health', '/api/auth/verify', '/api/sync'];
    return skipPaths.some(path => req.path.includes(path));
  }
});

// Relaxed auth rate limiter
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Allow 20 auth attempts per 5 minutes
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 5 minutes.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Relaxed settings limiter
export const settingsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 50, // Allow 50 settings requests per minute
  message: {
    success: false,
    message: 'Settings rate limit exceeded.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Relaxed upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // Allow 30 uploads per 5 minutes
  message: {
    success: false,
    message: 'Upload rate limit exceeded.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  generalLimiter,
  settingsLimiter,
  authLimiter,
  uploadLimiter
};