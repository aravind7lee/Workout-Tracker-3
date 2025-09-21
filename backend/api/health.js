import mongoose from 'mongoose';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB if not connected
    if (!mongoose.connections[0].readyState) {
      const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://aravvvvc1:aravvvvc1@cluster0.ipujo7u.mongodb.net/gym-tracker?retryWrites=true&w=majority';
      await mongoose.connect(MONGO_URI);
    }

    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.json({ 
      status: 'OK', 
      message: 'GymTracker API Ready', 
      database: dbStatus,
      mongodb: process.env.MONGO_URI ? 'Configured' : 'Not configured',
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}