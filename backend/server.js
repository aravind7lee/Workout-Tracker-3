// backend/server.js - Updated server with user routes
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import exerciseRoutes from './routes/exercises.js';
import planRoutes from './routes/plans.js';
import workoutRoutes from './routes/workouts.js';
import mealRoutes from './routes/meals.js';
import nutritionRoutes from './routes/nutrition.js';
import analyticsRoutes from './routes/analytics.js';
import dashboardRoutes from './routes/dashboard.js';
import reviewRoutes from './routes/reviews.js';
import syncRoutes from './routes/sync.js';
import workoutSplitsRoutes from './routes/workoutSplits.js';

// Import rate limiters
import { generalLimiter, settingsLimiter, authLimiter } from './middleware/rateLimiter.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3007', 
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:5000',
      'https://grindx-workout-tracker.onrender.com',
      'https://workout-tracker-frontend.onrender.com',
      'https://gymtracker-app.onrender.com',
      'https://grind-x-workout-tracker.netlify.app'
    ];
    
    // Allow localhost with any port
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow .onrender.com and .netlify.app domains
    if (origin.endsWith('.onrender.com') || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    
    // Check allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all origins in production for now
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply minimal rate limiting for production
app.use('/api/', (req, res, next) => {
  // Skip rate limiting for health checks and essential endpoints
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }
  return generalLimiter(req, res, next);
});

// Create auth rate limiter at app initialization
const lightAuthLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: { success: false, message: 'Too many auth requests' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS'
});

// Routes with relaxed rate limiting
app.use('/api/auth', lightAuthLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/workout-splits', workoutSplitsRoutes);

// Enhanced preflight handling
app.use((req, res, next) => {
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control');
  res.header('Access-Control-Expose-Headers', 'X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Health check (no rate limiting)
app.get('/api/health', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.json({ 
    status: 'OK', 
    message: 'Workout Tracker API is running',
    timestamp: new Date().toISOString(),
    cors: {
      origin: req.headers.origin,
      allowed: true
    },
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
    },
    rateLimit: {
      enabled: true,
      message: 'Rate limiting is active'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  // Handle file size limit (5MB)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB.',
      maxSize: '5MB'
    });
  }
  
  // Handle file type errors
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({
      success: false,
      message: 'Only image files are allowed.'
    });
  }
  
  // Handle custom file size error
  if (error.message === 'File size must be less than 5MB') {
    return res.status(400).json({
      success: false,
      message: 'File size must be less than 5MB.',
      maxSize: '5MB'
    });
  }
  
  // Handle multer errors
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected file field.'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('🔧 Cloudinary configured:', !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY));
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API Health: http://localhost:${PORT}/api/health`);
    });
    
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${PORT} is already in use!`);
        console.log('💡 Please stop any other processes using port 5000 and try again.');
        console.log('🔧 You can run: netstat -ano | findstr :5000 to find the process');
        process.exit(1);
      } else {
        console.error('❌ Server error:', err);
        process.exit(1);
      }
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;