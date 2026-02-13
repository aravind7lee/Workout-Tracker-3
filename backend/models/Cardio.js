// backend/models/Cardio.js - Cardio Session Model
import mongoose from 'mongoose';

const CardioSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  activityType: { 
    type: String, 
    required: true,
    enum: ['walking', 'running', 'cycling', 'swimming', 'hiking']
  },
  steps: {
    type: Number,
    default: 0
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  duration: { 
    type: Number, 
    required: true // in minutes
  },
  distance: { 
    type: Number, 
    default: 0 // in kilometers
  },
  pace: { 
    type: Number, 
    default: 0 // min/km - calculated
  },
  speed: { 
    type: Number, 
    default: 0 // km/h - calculated
  },
  heartRate: {
    average: { type: Number, default: 0 },
    max: { type: Number, default: 0 },
    min: { type: Number, default: 0 }
  },
  calories: { 
    type: Number, 
    default: 0 // calculated using MET values
  },
  intensity: { 
    type: String, 
    enum: ['low', 'moderate', 'high', 'interval'],
    default: 'moderate'
  },
  notes: { 
    type: String, 
    default: '' 
  },
  linkedWorkout: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Workout' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Calculate pace and speed before saving
CardioSchema.pre('save', function(next) {
  if (this.duration > 0 && this.distance > 0) {
    // Pace: minutes per kilometer
    this.pace = this.duration / this.distance;
    // Speed: kilometers per hour
    this.speed = (this.distance / this.duration) * 60;
  }
  
  // Calculate calories if not provided using MET values
  if (this.calories === 0 && this.duration > 0) {
    const metValues = {
      walking: 3.5,
      running: 9.8,
      cycling: 7.5,
      swimming: 8.0,
      hiking: 6.0
    };
    
    const intensityMultiplier = {
      low: 0.7,
      moderate: 1.0,
      high: 1.3,
      interval: 1.5
    };
    
    const met = metValues[this.activityType] || 5.0;
    const multiplier = intensityMultiplier[this.intensity] || 1.0;
    const weight = 70; // Default weight in kg (can be enhanced with user weight)
    
    // Calories = MET × weight(kg) × duration(hours) × intensity multiplier
    this.calories = Math.round(met * weight * (this.duration / 60) * multiplier);
  }
  
  next();
});

export default mongoose.model('Cardio', CardioSchema);
