// backend/models/Review.js
import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['workout', 'exercise', 'meal', 'plan'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ReviewSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.model('Review', ReviewSchema);