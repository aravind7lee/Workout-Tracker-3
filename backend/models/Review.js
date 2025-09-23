// backend/models/Review.js - Review model
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseId: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  author: {
    type: String,
    required: true
  },
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

reviewSchema.index({ exerciseId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });

export default mongoose.model('Review', reviewSchema);