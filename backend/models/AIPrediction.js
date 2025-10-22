import mongoose from 'mongoose';

const AIPredictionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    default: 'default-user'
  },
  fieldId: {
    type: String,
    required: true
  },
  predictionType: {
    type: String,
    enum: [
      'irrigation_recommendation', 
      'quick_analysis', 
      'sensor_analysis', 
      'irrigation_execution',
      'irrigation_start',  // ADD THIS
      'irrigation_stop'    // ADD THIS
    ],
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