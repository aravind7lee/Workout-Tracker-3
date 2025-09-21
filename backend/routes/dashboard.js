// backend/routes/dashboard.js - Real-time dashboard data
import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Get real-time user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments();
    
    // Get active users (logged in within last 24 hours)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Get recent registrations (last 7 days)
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    // Get users with profile images
    const usersWithImages = await User.countDocuments({
      profileImage: { $ne: null, $exists: true }
    });
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        recentUsers,
        usersWithImages,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// Get all users (admin view)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        hasProfileImage: !!user.profileImage,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      })),
      count: users.length
    });
  } catch (error) {
    console.error('Users list error:', error);
    res.status(500).json({ message: 'Error fetching users list' });
  }
});

export default router;