// models/Farm.js
import mongoose from 'mongoose';

const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true,
    maxlength: [100, 'Farm name cannot exceed 100 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: {
      type: String,
      required: [true, 'Farm address is required'],
      trim: true
    },
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    },
    size: {
      type: Number,
      min: 0,
      max: 10000
    },
    zone: {
      type: String,
      trim: true
    }
  },
  crops: [{
    type: String,
    enum: [
      'wheat', 'corn', 'rice', 'cotton', 'soybean', 
      'vegetables', 'fruits', 'flowers', 'pasture', 'other'
    ]
  }],
  soilType: {
    type: String,
    enum: ['sand', 'loam', 'clay', 'silt'],
    default: 'loam'
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  irrigationSchedule: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    duration: {
      type: Number,
      min: 1,
      max: 120,
      default: 30
    },
    days: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }]
  }
}, {
  timestamps: true
});

// Compound index to ensure unique farm names per user
farmSchema.index({ name: 1, user: 1 }, { unique: true });

// Virtual for total devices in this farm
farmSchema.virtual('deviceCount', {
  ref: 'Device',
  localField: '_id',
  foreignField: 'farm',
  count: true
});

// Instance method to check if farm has devices
farmSchema.methods.hasDevices = async function() {
  const deviceCount = await mongoose.model('Device').countDocuments({ 
    farm: this._id,
    user: this.user 
  });
  return deviceCount > 0;
};

// Static method to get farms by crop type
farmSchema.statics.findByCrop = function(cropType, userId) {
  return this.find({ 
    user: userId,
    crops: cropType 
  });
};

// Middleware to update related devices when farm is deleted
farmSchema.pre('findOneAndDelete', async function(next) {
  const farmId = this.getQuery()._id;
  
  // Remove farm reference from all devices
  await mongoose.model('Device').updateMany(
    { farm: farmId },
    { $unset: { farm: "" } }
  );
  
  next();
});

export default mongoose.model('Farm', farmSchema);