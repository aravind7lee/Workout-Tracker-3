import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  chest: { type: Number, min: 0, default: null },
  waist: { type: Number, min: 0, default: null },
  hips: { type: Number, min: 0, default: null },
  biceps: { type: Number, min: 0, default: null },
  thighs: { type: Number, min: 0, default: null },
  neck: { type: Number, min: 0, default: null }
}, { _id: false });

const bodyMetricSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  weight: { type: Number, required: true, min: 1, max: 1000 },
  bodyFatPercentage: { type: Number, min: 0, max: 100, default: null },
  measurements: { type: measurementSchema, default: () => ({}) },
  notes: { type: String, trim: true, maxlength: 500, default: '' },
  source: { type: String, enum: ['manual', 'smart_scale', 'onboarding'], default: 'manual' }
}, { timestamps: true });

bodyMetricSchema.index({ user: 1, date: -1 });

export default mongoose.model('BodyMetric', bodyMetricSchema);
