import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from '../routes/auth.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Failed:', err.message));
}

// Routes
app.use('/api/auth', authRoutes);

// Root route
app.get('/api', (req, res) => {
  res.json({
    message: '🏋️ GymTracker API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      register: '/api/auth/register',
      login: '/api/auth/login'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ 
    status: 'OK', 
    message: 'GymTracker API Ready', 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

export default app;