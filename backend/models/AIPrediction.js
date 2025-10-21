import mongoose from 'mongoose';

const AIPredictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fieldId: {
    type: String,
    required: true
  },
  predictionType: {
    type: String,
    enum: ['irrigation_recommendation', 'quick_analysis', 'sensor_analysis'],
    required: true
  },
  recommendation: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  waterRequirement: {
    type: Number,
    required: true
  },
  optimalIrrigationTime: {
    type: String,
    required: true
  },
  soilMoisturePrediction: {
    type: String,
    required: true
  },
  cropHealth: {
    type: String,
    required: true
  },
  riskAlerts: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
  sensorData: {
    soilMoisture: Number,
    temperature: Number,
    humidity: Number
  },
  shouldIrrigate: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('AIPrediction', AIPredictionSchema);