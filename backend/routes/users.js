// backend/routes/users.js - COMPLETE CLOUDINARY BACKEND
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dtqahgnzn',
  api_key: process.env.CLOUDINARY_API_KEY || '871169168893627',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'cE3w6nxyv5URjHlh55sgekfyZas'
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
      'image/bmp', 'image/tiff', 'image/tif', 'image/svg+xml', 'image/avif',
      'image/heic', 'image/heif', 'image/ico', 'image/jfif'
    ];
    
    if (file.mimetype.startsWith('image/') && allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Image format not supported. Please use JPG, PNG, WebP, GIF, BMP, TIFF, SVG, AVIF, HEIC, or ICO'), false);
    }
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Upload avatar to Cloudinary
router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    console.log('📸 Avatar upload request received');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    console.log('📁 File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Check file size (5MB limit)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        success: false,
        message: 'File size too large. Maximum 5MB allowed.' 
      });
    }

    console.log('☁️ Starting Cloudinary upload...');

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'workout-tracker/avatars',
          public_id: `avatar_${req.user.id}_${Date.now()}`,
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ],
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    // Find user and update profile image
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Delete old image from Cloudinary if exists
    if (user.profileImage && user.profileImage.includes('cloudinary.com')) {
      try {
        const urlParts = user.profileImage.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `workout-tracker/avatars/${publicIdWithExtension.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
        console.log('🗑️ Old image deleted from Cloudinary');
      } catch (deleteError) {
        console.warn('⚠️ Failed to delete old image:', deleteError);
      }
    }

    // Update user profile with new image URL
    user.profileImage = uploadResult.secure_url;
    await user.save();

    console.log('💾 User profile updated with new image URL');

    res.json({
      success: true,
      message: 'Avatar uploaded successfully to Cloudinary',
      profileImage: uploadResult.secure_url,
      cloudinaryData: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format
      },
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload avatar to Cloudinary',
      error: error.message 
    });
  }
});

// Delete avatar from Cloudinary
router.delete('/avatar', auth, async (req, res) => {
  try {
    console.log('🗑️ Avatar delete request received');
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Delete from Cloudinary if exists
    if (user.profileImage && user.profileImage.includes('cloudinary.com')) {
      try {
        const urlParts = user.profileImage.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const publicId = `workout-tracker/avatars/${publicIdWithExtension.split('.')[0]}`;
        
        const deleteResult = await cloudinary.uploader.destroy(publicId);
        console.log('☁️ Cloudinary delete result:', deleteResult);
      } catch (deleteError) {
        console.warn('⚠️ Failed to delete image from Cloudinary:', deleteError);
      }
    }

    // Update user profile
    user.profileImage = null;
    await user.save();

    console.log('💾 User profile updated - image removed');

    res.json({
      success: true,
      message: 'Avatar deleted successfully from Cloudinary',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: null
      }
    });
  } catch (error) {
    console.error('❌ Avatar delete error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete avatar from Cloudinary',
      error: error.message 
    });
  }
});

// Remove profile picture
router.delete('/profile-picture', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update user profile image to null
    user.profileImage = null;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture removed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: null
      }
    });
  } catch (error) {
    console.error('Profile picture removal error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to remove profile picture',
      error: error.message 
    });
  }
});

// Update profile picture URL (for direct Cloudinary uploads)
router.put('/profile-picture', auth, async (req, res) => {
  try {
    const { profileImage } = req.body;
    
    if (!profileImage) {
      return res.status(400).json({ 
        success: false,
        message: 'Profile image URL is required' 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Update user profile image
    user.profileImage = profileImage;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error('Profile picture update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update profile picture',
      error: error.message 
    });
  }
});

// Test Cloudinary connection
router.get('/test-cloudinary', auth, async (req, res) => {
  try {
    // Test Cloudinary connection by getting account details
    const result = await cloudinary.api.ping();
    
    res.json({
      success: true,
      message: 'Cloudinary connection successful',
      cloudinary: {
        status: result.status,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME
      }
    });
  } catch (error) {
    console.error('❌ Cloudinary test error:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudinary connection failed',
      error: error.message
    });
  }
});

export default router;