import mongoose from 'mongoose';

const irrigationLogSchema = new mongoose.Schema({
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['manual', 'scheduled', 'smart', 'emergency'],
    default: 'smart'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  duration: {
    planned: Number, // minutes
    actual: Number   // minutes
  },
  waterUsed: {
    type: Number, // liters
    default: 0
  },
  waterSaved: {
    type: Number, // liters compared to traditional irrigation
    default: 0
  },
  sensorData: {
    soilMoisture: Number,
    temperature: Number,
    humidity: Number,
    rainfall: Number
  },
  weatherData: {
    temperature: Number,
    humidity: Number,
    rainfall: Number,
    windSpeed: Number,
    condition: String
  },
  aiRecommendation: {
    shouldIrrigate: Boolean,
    confidence: Number,
    recommendedDuration: Number,
    reason: String
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  efficiency: {
    type: Number, // percentage
    min: 0,
    max: 100,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

// Calculate efficiency before saving
irrigationLogSchema.pre('save', function(next) {
  if (this.waterUsed > 0 && this.waterSaved > 0) {
    this.efficiency = Math.round((this.waterSaved / (this.waterUsed + this.waterSaved)) * 100);
  }
  next();
});

// Virtual for irrigation duration in minutes
irrigationLogSchema.virtual('totalDuration').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  return 0;
});

export default mongoose.model('IrrigationLog', irrigationLogSchema);