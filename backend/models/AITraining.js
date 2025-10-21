import mongoose from 'mongoose';

const AITrainingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('AITraining', AITrainingSchema);