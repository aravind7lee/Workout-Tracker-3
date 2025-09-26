// Rate Limiter Middleware - Prevents API spam and 500 errors
import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/api/health';
  }
});

// Settings API rate limiter (more restrictive)
export const settingsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Limit each IP to 20 settings requests per 5 minutes
  message: {
    success: false,
    message: 'Too many settings requests. Please wait before trying again.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth rate limiter (most restrictive)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Upload rate limiter
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 uploads per 10 minutes
  message: {
    success: false,
    message: 'Too many upload requests. Please wait before uploading again.',
    retryAfter: '10 minutes'
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