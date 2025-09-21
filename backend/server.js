// backend/server.js
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
import nutritionRoutes from './routes/nutrition.js';
import cloudinaryTestRoutes from './routes/cloudinaryTest.js';
import workoutRoutes from './routes/workouts.js';
import exerciseRoutes from './routes/exercises.js';
import mealRoutes from './routes/meals.js';
import planRoutes from './routes/plans.js';
import achievementRoutes from './routes/achievements.js';
import postRoutes from './routes/posts.js';
import reviewRoutes from './routes/reviews.js';
import analyticsRoutes from './routes/analytics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

const app = express();

// Increase payload limits for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('dev'));

// CORS configuration for multiple origins
app.use(cors({ 
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175', 
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:5175',
    // Add your Vercel frontend URL here after deployment
    'https://your-frontend-app.vercel.app',
    // Allow any Vercel preview deployments
    /\.vercel\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api', cloudinaryTestRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🏋️ GymTracker API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      workouts: '/api/workouts',
      nutrition: '/api/nutrition',
      plans: '/api/plans'
    },
    timestamp: new Date().toISOString()
  });
});

// API root route
app.get('/api', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({
    message: '🏋️ GymTracker API',
    status: 'Active',
    database: dbStatus,
    version: '1.0.0',
    availableRoutes: [
      'GET /api/health - Health check',
      'POST /api/auth/register - User registration',
      'POST /api/auth/login - User login',
      'GET /api/users/profile - User profile',
      'GET /api/workouts - Get workouts',
      'GET /api/nutrition - Get nutrition data',
      'GET /api/plans - Get workout plans'
    ],
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'OK', 
    message: 'Professional GymTracker MERN Stack', 
    database: dbStatus,
    mongodb: dbStatus === 'Connected' ? 'Atlas Cloud Database' : 'Fallback Mode',
    cloudinary: 'Configured',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      success: false,
      message: 'File too large. Maximum size is 5MB.' 
    });
  }
  
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

async function start() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    
    console.log('🔄 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGO_URI);

    console.log('✅ DB Connected');
    console.log('🎯 Professional GymTracker MERN Stack Ready');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API URL: http://localhost:${PORT}/api`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log('🎯 Ready for development!');
    });
    
  } catch (err) {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1);
  }
}

start();