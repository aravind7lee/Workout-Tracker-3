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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://grindx-workout-tracker.onrender.com',
    'https://workout-tracker-frontend.onrender.com',
    'https://gymtracker-app.onrender.com',
    /\.onrender\.com$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Workout Tracker API is running',
    timestamp: new Date().toISOString(),
    cloudinary: {
      configured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
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
        console.log(`❌ Port ${PORT} is busy, trying port ${PORT + 1}`);
        const newPort = PORT + 1;
        app.listen(newPort, () => {
          console.log(`🚀 Server running on port ${newPort}`);
          console.log(`📡 API Health: http://localhost:${newPort}/api/health`);
        });
      } else {
        console.error('❌ Server error:', err);
      }
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

export default app;