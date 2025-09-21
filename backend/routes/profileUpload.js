// backend/routes/profileUpload.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Simple profile image upload without authentication for testing
router.post('/upload-profile-image', async (req, res) => {
  try {
    const { imageData, userId } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }
    
    // For testing, use userId from request or create a demo user
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      // Create or find demo user
      user = await User.findOne({ email: 'demo@workouttracker.com' });
      if (!user) {
        user = new User({
          name: 'Demo User',
          email: 'demo@workouttracker.com',
          password: 'demo123'
        });
        await user.save();
      }
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update profile image
    user.profileImage = imageData;
    await user.save();
    
    res.json({
      message: 'Profile image updated successfully',
      profileImage: user.profileImage,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Profile image upload with localStorage fallback
router.post('/upload-profile-local', async (req, res) => {
  try {
    const { imageData, userEmail } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }
    
    // Store in localStorage format for frontend
    res.json({
      message: 'Profile image updated successfully',
      profileImage: imageData,
      user: {
        email: userEmail || 'demo@workouttracker.com',
        profileImage: imageData
      }
    });
    
  } catch (error) {
    console.error('Local upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;