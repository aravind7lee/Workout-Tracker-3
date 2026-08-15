// backend/models/Achievement.js
import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  badgeIcon: {
    type: String,
    default: '🏆'
  },
  achievedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

achievementSchema.index({ user: 1, title: 1 }, { unique: true });

export default mongoose.model('Achievement', achievementSchema);
