// backend/routes/reviews.js
import express from 'express';
import mongoose from 'mongoose';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';
import { updateReviewStats } from '../middleware/reviewStats.js';

const router = express.Router();

// Get reviews for a specific target
router.get('/:targetType/:targetId', async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10, sort = 'createdAt' } = req.query;
    
    const reviews = await Review.find({ targetType, targetId })
      .populate('user', 'name profileImage')
      .sort({ [sort]: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Review.countDocuments({ targetType, targetId });
    const avgRating = await Review.aggregate([
      { $match: { targetType, targetId: new mongoose.Types.ObjectId(targetId) } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    
    res.json({
      reviews,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      },
      stats: avgRating[0] || { avg: 0, count: 0 }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a review
router.post('/', auth, async (req, res) => {
  try {
    const { targetType, targetId, rating, title, content } = req.body;
    
    // Check if user already reviewed this item
    const existing = await Review.findOne({
      user: req.user._id,
      targetType,
      targetId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this item' });
    }
    
    const review = new Review({
      user: req.user._id,
      targetType,
      targetId,
      rating,
      title,
      content
    });
    
    await review.save();
    await review.populate('user', 'name profileImage');
    
    // Update review statistics
    await updateReviewStats(targetType, targetId);
    
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a review
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { rating, title, content } = req.body;
    review.rating = rating || review.rating;
    review.title = title || review.title;
    review.content = content || review.content;
    review.updatedAt = new Date();
    
    await review.save();
    await review.populate('user', 'name profileImage');
    
    // Update review statistics
    await updateReviewStats(review.targetType, review.targetId);
    
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a review
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await Review.findByIdAndDelete(req.params.id);
    
    // Update review statistics
    await updateReviewStats(review.targetType, review.targetId);
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark review as helpful
router.post('/:id/helpful', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    const isHelpful = review.helpful.includes(req.user._id);
    
    if (isHelpful) {
      review.helpful = review.helpful.filter(id => id.toString() !== req.user._id.toString());
    } else {
      review.helpful.push(req.user._id);
    }
    
    await review.save();
    res.json({ helpful: review.helpful.length, isHelpful: !isHelpful });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's reviews
router.get('/user/me', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;