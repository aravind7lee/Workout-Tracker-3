// backend/models/User.js - User model with profile image
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileImage: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  stats: {
    totalWorkouts: {
      type: Number,
      default: 0
    },
    totalMeals: {
      type: Number,
      default: 0
    },
    streak: {
      type: Number,
      default: 0
    },
    xp: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isActive: 1 });

export default mongoose.model('User', userSchema);