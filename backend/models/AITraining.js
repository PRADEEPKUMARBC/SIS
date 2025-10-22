import mongoose from 'mongoose';

const AITrainingSchema = new mongoose.Schema({
  userId: {
    type: String,  // CHANGED: ObjectId → String
    required: true,
    default: 'default-user'
  },
  epochs: {
    type: Number,
    required: true
  },
  accuracy: {
    type: Number,
    required: true
  },
  loss: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  modelVersion: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['completed', 'failed', 'in_progress'],
    default: 'completed'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('AITraining', AITrainingSchema);