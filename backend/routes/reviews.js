// backend/routes/reviews.js - Review system routes
import express from 'express';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Submit review
router.post('/', auth, async (req, res) => {
  try {
    const { exerciseId, rating, comment } = req.body;
    
    const review = new Review({
      userId: req.user.id,
      exerciseId,
      rating,
      comment,
      author: req.user.name || 'Anonymous',
      helpful: 0
    });
    
    await review.save();
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get reviews for exercise
router.get('/:exerciseId', async (req, res) => {
  try {
    const reviews = await Review.find({ exerciseId: req.params.exerciseId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark review as helpful
router.post('/:reviewId/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    
    res.json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;