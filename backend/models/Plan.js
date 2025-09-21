// backend/models/Plan.js
import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  description: String,
  days: [{
    name: String,
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }]
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Plan', PlanSchema);
