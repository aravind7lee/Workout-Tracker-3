// backend/models/Plan.js
import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: String,
  reps: String,
  weight: String,
  duration: String,
  rest: String,
  notes: String,
  category: String,
  muscle: String,
  difficulty: String
});

const PlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  category: { type: String, default: 'General' },
  exercises: [ExerciseSchema],
  days: [{
    name: String,
    exercises: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exercise' }]
  }],
  stats: {
    totalWorkouts: { type: Number, default: 0 },
    lastUsed: Date,
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    totalTime: { type: Number, default: 0 }, // Total time spent on this plan
    completionRate: { type: Number, default: 0 }, // Percentage of completed workouts
    favoriteCount: { type: Number, default: 0 }
  },
  isPublic: { type: Boolean, default: false },
  tags: [String],
  
  // Real-time sync fields
  localId: String, // Original local ID for sync tracking
  syncStatus: {
    synced: { type: Boolean, default: true },
    lastSynced: { type: Date, default: Date.now },
    syncVersion: { type: Number, default: 1 },
    conflictResolved: { type: Boolean, default: false }
  },
  
  // User engagement tracking
  engagement: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      createdAt: { type: Date, default: Date.now }
    }]
  },
  
  // Plan metadata
  metadata: {
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    estimatedDuration: Number, // in minutes
    targetMuscleGroups: [String],
    equipment: [String],
    goals: [String], // e.g., 'strength', 'endurance', 'weight_loss'
    createdBy: String, // User name or 'System'
    version: { type: String, default: '1.0' }
  },
  
  // Performance tracking
  performance: {
    bestTime: Number,
    averageTime: Number,
    totalCaloriesBurned: Number,
    progressNotes: [{
      date: { type: Date, default: Date.now },
      note: String,
      metrics: {
        weight: Number,
        reps: Number,
        sets: Number,
        duration: Number
      }
    }]
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Real-time middleware
PlanSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update sync status
  if (this.isModified() && !this.isNew) {
    this.syncStatus.lastSynced = new Date();
    this.syncStatus.syncVersion += 1;
  }
  
  // Calculate estimated duration based on exercises
  if (this.exercises && this.exercises.length > 0) {
    this.metadata.estimatedDuration = this.exercises.length * 3; // 3 minutes per exercise average
  }
  
  // Extract target muscle groups from exercises
  if (this.exercises && this.exercises.length > 0) {
    const muscleGroups = [...new Set(this.exercises.map(ex => ex.muscle || ex.category).filter(Boolean))];
    this.metadata.targetMuscleGroups = muscleGroups;
  }
  
  next();
});

// Post-save middleware for real-time updates
PlanSchema.post('save', function(doc) {
  // Emit real-time update event (if using Socket.IO)
  if (global.io) {
    global.io.to(`user_${doc.user}`).emit('planUpdated', {
      planId: doc._id,
      action: 'updated',
      timestamp: new Date().toISOString()
    });
  }
});

// Post-remove middleware
PlanSchema.post('remove', function(doc) {
  if (global.io) {
    global.io.to(`user_${doc.user}`).emit('planUpdated', {
      planId: doc._id,
      action: 'deleted',
      timestamp: new Date().toISOString()
    });
  }
});

// Instance methods
PlanSchema.methods.updateStats = function(workoutData) {
  this.stats.totalWorkouts += 1;
  this.stats.lastUsed = new Date();
  
  if (workoutData.duration) {
    this.stats.totalTime += workoutData.duration;
    this.performance.averageTime = this.stats.totalTime / this.stats.totalWorkouts;
    
    if (!this.performance.bestTime || workoutData.duration < this.performance.bestTime) {
      this.performance.bestTime = workoutData.duration;
    }
  }
  
  if (workoutData.caloriesBurned) {
    this.performance.totalCaloriesBurned += workoutData.caloriesBurned;
  }
  
  if (workoutData.rating && workoutData.rating >= 1 && workoutData.rating <= 5) {
    const currentTotal = this.stats.averageRating * this.stats.totalRatings;
    this.stats.totalRatings += 1;
    this.stats.averageRating = (currentTotal + workoutData.rating) / this.stats.totalRatings;
  }
  
  return this.save();
};

PlanSchema.methods.addProgressNote = function(note, metrics = {}) {
  this.performance.progressNotes.push({
    note,
    metrics,
    date: new Date()
  });
  
  return this.save();
};

PlanSchema.methods.incrementEngagement = function(type) {
  if (this.engagement[type] !== undefined) {
    this.engagement[type] += 1;
    return this.save();
  }
  return Promise.resolve(this);
};

// Static methods
PlanSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.category) {
    query.category = options.category;
  }
  
  if (options.tags && options.tags.length > 0) {
    query.tags = { $in: options.tags };
  }
  
  return this.find(query)
    .sort(options.sort || { updatedAt: -1 })
    .limit(options.limit || 50);
};

PlanSchema.statics.getPopularPlans = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ 
      'stats.totalWorkouts': -1, 
      'engagement.likes': -1,
      'stats.averageRating': -1 
    })
    .limit(limit)
    .populate('user', 'name profilePicture');
};

PlanSchema.statics.getUserAnalytics = function(userId) {
  return this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalPlans: { $sum: 1 },
        totalWorkouts: { $sum: '$stats.totalWorkouts' },
        totalTime: { $sum: '$stats.totalTime' },
        averageRating: { $avg: '$stats.averageRating' },
        categories: { $addToSet: '$category' },
        mostUsedPlan: { $max: { plan: '$$ROOT', workouts: '$stats.totalWorkouts' } }
      }
    }
  ]);
};

// Indexes for performance
PlanSchema.index({ user: 1, updatedAt: -1 });
PlanSchema.index({ user: 1, category: 1 });
PlanSchema.index({ isPublic: 1, 'stats.totalWorkouts': -1 });
PlanSchema.index({ tags: 1 });
PlanSchema.index({ 'syncStatus.synced': 1, 'syncStatus.lastSynced': 1 });

export default mongoose.model('Plan', PlanSchema);

