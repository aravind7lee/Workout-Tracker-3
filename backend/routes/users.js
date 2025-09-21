// backend/routes/users.js
import express from 'express';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Real-time profile updates to MongoDB Atlas with tracking
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, bio } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use by another user' });
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name, 
        email, 
        bio,
        $inc: { profileUpdates: 1 },
        updatedAt: new Date(),
        lastProfileUpdate: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    console.log(`✅ PROFILE UPDATED IN MONGODB ATLAS:`);
    console.log(`   User: ${updatedUser.name} (${updatedUser.email})`);
    console.log(`   Total Profile Updates: ${updatedUser.profileUpdates}`);
    console.log(`   Database: gym-tracker collection: users`);
    
    res.json({
      success: true,
      message: 'Profile updated successfully in MongoDB Atlas',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
        bio: updatedUser.bio,
        profileUpdates: updatedUser.profileUpdates,
        lastProfileUpdate: updatedUser.lastProfileUpdate
      }
    });
  } catch (error) {
    console.error('❌ MongoDB Atlas Profile Update Error:', error);
    res.status(500).json({ message: 'Failed to update profile in MongoDB Atlas', error: error.message });
  }
});

// Real-time Cloudinary image upload (5MB, all formats)
router.post('/upload-avatar', auth, (req, res) => {
  console.log('🚀 Starting Cloudinary upload process...');
  
  upload.single('profileImage')(req, res, async (err) => {
    if (err) {
      console.error('❌ Multer/Cloudinary Error:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false,
          message: 'File too large. Maximum size is 5MB.' 
        });
      }
      
      return res.status(400).json({ 
        success: false,
        message: 'Upload failed: ' + err.message 
      });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          message: 'No image file provided' 
        });
      }
      
      console.log('📁 File uploaded to Cloudinary:', req.file.path);
      
      // Cloudinary URL from upload
      const cloudinaryUrl = req.file.path;
      const publicId = req.file.filename;
      
      // Update user in MongoDB Atlas with comprehensive tracking
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { 
          profileImage: cloudinaryUrl,
          $inc: { 
            imageUploads: 1,
            profileUpdates: 1
          },
          updatedAt: new Date(),
          lastImageUpload: new Date()
        },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        return res.status(404).json({ 
          success: false,
          message: 'User not found in MongoDB Atlas' 
        });
      }
      
      console.log(`✅ PROFILE IMAGE UPLOADED TO CLOUDINARY & MONGODB ATLAS:`);
      console.log(`   User: ${updatedUser.name} (${updatedUser.email})`);
      console.log(`   Cloudinary URL: ${cloudinaryUrl}`);
      console.log(`   Public ID: ${publicId}`);
      console.log(`   Total Image Uploads: ${updatedUser.imageUploads}`);
      console.log(`   Database: gym-tracker collection: users`);
      
      res.json({ 
        success: true,
        message: 'Profile image uploaded to Cloudinary and tracked in MongoDB Atlas',
        profileImage: updatedUser.profileImage,
        cloudinaryUrl: cloudinaryUrl,
        publicId: publicId,
        imageUploads: updatedUser.imageUploads,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          bio: updatedUser.bio,
          imageUploads: updatedUser.imageUploads
        }
      });
    } catch (error) {
      console.error('❌ MongoDB Atlas/Cloudinary Error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to save image data to MongoDB Atlas', 
        error: error.message 
      });
    }
  });
});

export default router;