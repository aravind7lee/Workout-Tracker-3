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
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
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
    }
  },
  fitnessGoals: {
    goal: {
      type: String,
      enum: ['lose', 'maintain', 'gain', 'muscle', 'strength'],
      default: 'maintain'
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'very', 'extra'],
      default: 'moderate'
    },
    targetWeight: {
      type: Number,
      default: null
    },
    weeklyGoal: {
      type: Number,
      default: 3,
      min: 1,
      max: 7
    }
  },
  notifications: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    workoutReminders: {
      type: Boolean,
      default: true
    },
    mealReminders: {
      type: Boolean,
      default: false
    },

  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    dataSharing: {
      type: Boolean,
      default: false
    },
    analyticsOptOut: {
      type: Boolean,
      default: false
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'auto'],
      default: 'dark'
    },
    language: {
      type: String,
      enum: ['en', 'es', 'fr', 'de'],
      default: 'en'
    },
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'MM/DD/YYYY'
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h'
    }
  },
  dataSettings: {
    autoBackup: {
      type: Boolean,
      default: true
    },
    syncAcrossDevices: {
      type: Boolean,
      default: true
    },
    dataRetention: {
      type: String,
      enum: ['6months', '1year', '2years', 'forever'],
      default: '1year'
    }
  },
  // Real-time tracking metadata
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  lastSyncDate: {
    type: Date,
    default: Date.now
  },
  lastGlobalSync: {
    type: Date,
    default: null
  },
  lastAutoSave: {
    type: Date,
    default: null
  },
  // Real-time sync metadata
  syncMetadata: {
    deviceId: {
      type: String,
      default: null
    },
    lastSyncTimestamp: {
      type: Number,
      default: null
    },
    syncCount: {
      type: Number,
      default: 0
    },
    autoSaveEnabled: {
      type: Boolean,
      default: true
    }
  },
  // Favorite workout splits for persistence
  favoriteWorkoutSplits: {
    type: [Number],
    default: []
  }
}, {
  timestamps: true
});

// Index for faster queries
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ isActive: 1 });

export default mongoose.model('User', userSchema);