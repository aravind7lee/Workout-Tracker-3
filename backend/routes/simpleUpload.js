// backend/routes/simpleUpload.js
import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Simple base64 image upload
router.post('/upload-profile-image', auth, async (req, res) => {
  try {
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }
    
    // Validate base64 image
    if (!imageData.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Invalid image format' });
    }
    
    // Update user profile image
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageData },
      { new: true }
    ).select('-password');
    
    res.json({
      message: 'Profile image updated successfully',
      profileImage: updatedUser.profileImage,
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;