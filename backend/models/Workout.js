// backend/models/Workout.js
import mongoose from 'mongoose';

const SetSchema = new mongoose.Schema({
  reps: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  rest: { type: Number, default: 60 }
});

const ExerciseLogSchema = new mongoose.Schema({
  exercise: { type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' },
  exerciseName: { type: String, default: 'Unknown Exercise' },
  category: { type: String, default: 'General' },
  muscle: { type: String, default: 'General' },
  sets: [SetSchema],
  notes: { type: String, default: '' }
});

const WorkoutSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'General' },
  muscle: { type: String, default: 'General' },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'completed'
  },
  completed: {
    type: Boolean,
    default: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  exercises: [ExerciseLogSchema],
  durationMinutes: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
  totalVolume: { type: Number, default: 0 },
  isPublic: { type: Boolean, default: false },
  reviewStats: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to calculate total volume and sync completed flag
WorkoutSchema.pre('save', function(next) {
  // Sync completed boolean with status
  if (this.isModified('status')) {
    this.completed = this.status === 'completed';
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    }
  }

  // Calculate total volume across all exercises and sets
  if (this.isModified('exercises')) {
    let volume = 0;
    if (Array.isArray(this.exercises)) {
      this.exercises.forEach(ex => {
        if (Array.isArray(ex.sets)) {
          ex.sets.forEach(set => {
            const reps = Number(set.reps) || 0;
            const weight = Number(set.weight) || 0;
            volume += (reps * weight);
          });
        }
      });
    }
    this.totalVolume = volume;
  }
  
  next();
});

// Index for query optimization & performance
WorkoutSchema.index({ user: 1, date: -1 });
WorkoutSchema.index({ user: 1, completed: 1 });
WorkoutSchema.index({ user: 1, status: 1 });
WorkoutSchema.index({ user: 1, completed: 1, date: -1 });
WorkoutSchema.index({ user: 1, completed: 1, 'exercises.exerciseName': 1, date: -1 });

export default mongoose.model('Workout', WorkoutSchema);

