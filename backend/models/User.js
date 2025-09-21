// backend/models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  profileImage: { type: String, default: null },
  bio: { type: String, default: 'Passionate about fitness and achieving my goals!' },
  
  // Nutrition Goals & Targets
  baselineCalories: { type: Number, default: 2000 },
  goalType: { 
    type: String, 
    enum: ['cut', 'maintain', 'bulk', 'recomp'], 
    default: 'maintain' 
  },
  proteinPerKg: { type: Number, default: 2.2 }, // g per kg body weight
  macroPercents: {
    protein: { type: Number, default: 30 }, // % of calories
    carbs: { type: Number, default: 40 },
    fat: { type: Number, default: 30 }
  },
  
  // Physical Stats
  height: { type: Number, default: 170 }, // cm
  weight: { type: Number, default: 70 }, // kg
  age: { type: Number, default: 25 },
  sex: { type: String, enum: ['male', 'female'], default: 'male' },
  
  // User Statistics
  stats: {
    bodyFat: { type: Number, default: 0 },
    xp: { type: Number, default: 0 },
    streak: { type: Number, default: 0 }
  },
  
  // Account Status & Activity Tracking
  isActive: { type: Boolean, default: true },
  accountStatus: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  
  // Login Tracking
  lastLogin: { type: Date, default: Date.now },
  loginCount: { type: Number, default: 0 },
  registrationDate: { type: Date, default: Date.now },
  
  // Technical Tracking
  ipAddress: { type: String },
  lastLoginIP: { type: String },
  userAgent: { type: String },
  lastUserAgent: { type: String },
  
  // Profile Activity
  profileUpdates: { type: Number, default: 0 },
  imageUploads: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'users'
});

// Index for better query performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });

// Virtual for daily protein target
UserSchema.virtual('dailyProteinTarget').get(function() {
  return Math.round(this.weight * this.proteinPerKg);
});

// Virtual for macro targets in grams
UserSchema.virtual('macroTargets').get(function() {
  const proteinCals = (this.baselineCalories * this.macroPercents.protein) / 100;
  const carbsCals = (this.baselineCalories * this.macroPercents.carbs) / 100;
  const fatCals = (this.baselineCalories * this.macroPercents.fat) / 100;
  
  return {
    protein: Math.round(proteinCals / 4), // 4 cal per g
    carbs: Math.round(carbsCals / 4), // 4 cal per g
    fat: Math.round(fatCals / 9) // 9 cal per g
  };
});

export default mongoose.model('User', UserSchema);