// backend/models/Workout.js
import mongoose from 'mongoose';

const SetSchema = new mongoose.Schema({
  reps: Number,
  weight: Number,
  rest: Number
});

const ExerciseLogSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  sets: [SetSchema],
  notes: String
});

const WorkoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  title: String,
  exercises: [ExerciseLogSchema],
  durationMinutes: Number,
  calories: Number,
  isPublic: { type: Boolean, default: false },
  reviewStats: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Workout', WorkoutSchema);
