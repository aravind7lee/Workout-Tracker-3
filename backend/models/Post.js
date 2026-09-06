// backend/models/Post.js
import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true, maxlength: 1000 },
  category: { type: String, enum: ['General', 'PRs', 'Tips', 'Motivation', 'Nutrition', 'Progress'], default: 'General' },
  image: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }],
  attachedWorkout: { type: mongoose.Schema.Types.ObjectId, ref: 'Workout', default: null },
  attachedPR: {
    exerciseName: { type: String, trim: true },
    weight: Number,
    reps: Number
  },
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });

PostSchema.index({ isPublic: 1, createdAt: -1 });

export default mongoose.model('Post', PostSchema);
