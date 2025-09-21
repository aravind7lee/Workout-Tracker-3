// backend/models/Achievement.js
import mongoose from 'mongoose';

const AchievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  description: String,
  badgeIcon: String,
  achievedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Achievement', AchievementSchema);
