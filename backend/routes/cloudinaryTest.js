// backend/routes/cloudinaryTest.js - Test Cloudinary integration
import express from 'express';
import upload from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

// Test Cloudinary upload endpoint
router.post('/test-cloudinary', upload.single('testImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      success: true,
      message: 'Image uploaded to Cloudinary successfully',
      cloudinaryUrl: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format
    });
  } catch (error) {
    console.error('Cloudinary test error:', error);
    res.status(500).json({ message: 'Cloudinary upload failed', error: error.message });
  }
});

// Get Cloudinary stats
router.get('/cloudinary-stats', async (req, res) => {
  try {
    const stats = await cloudinary.api.usage();
    res.json({
      success: true,
      stats: {
        credits: stats.credits,
        used_percent: stats.used_percent,
        limit: stats.limit,
        resources: stats.resources,
        transformations: stats.transformations
      }
    });
  } catch (error) {
    console.error('Cloudinary stats error:', error);
    res.status(500).json({ message: 'Failed to get Cloudinary stats', error: error.message });
  }
});

export default router;