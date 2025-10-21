import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: [true, 'Device ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Device name is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farm: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['sensor', 'controller', 'gateway'],
    default: 'sensor'
  },
  status: {
    type: String,
    enum: ['online', 'offline', 'maintenance', 'error'],
    default: 'offline'
  },
  battery: {
    level: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    status: {
      type: String,
      enum: ['charging', 'discharging', 'full', 'low'],
      default: 'discharging'
    }
  },
  signalStrength: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor', 'none'],
    default: 'none'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  location: {
    lat: Number,
    lng: Number,
    zone: String
  },
  sensors: [{
    type: {
      type: String,
      enum: ['soil_moisture', 'temperature', 'humidity', 'rainfall', 'ph', 'nutrient'],
      required: true
    },
    value: Number,
    unit: String,
    lastRead: Date
  }],
  configuration: {
    irrigationDuration: {
      type: Number,
      min: 1,
      max: 120,
      default: 30
    },
    moistureThreshold: {
      type: Number,
      min: 20,
      max: 80,
      default: 60
    },
    automation: {
      type: Boolean,
      default: true
    },
    cropType: {
      type: String,
      enum: ['wheat', 'corn', 'rice', 'cotton', 'soybean', 'vegetables', 'fruits', 'flowers', 'other'],
      default: 'vegetables'
    },
    soilType: {
      type: String,
      enum: ['sand', 'loam', 'clay', 'silt'],
      default: 'loam'
    }
  },
  lastSensorData: {
    soilMoisture: { type: Number, default: 0 },
    temperature: { type: Number, default: 0 },
    humidity: { type: Number, default: 0 },
    rainfall: { type: Number, default: 0 },
    evaporation: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Update last seen and status
deviceSchema.methods.updateStatus = function(status, battery = null, signal = null) {
  this.status = status;
  this.lastSeen = new Date();

  if (battery !== null) this.battery.level = battery;
  if (signal !== null) this.signalStrength = signal;

  return this.save();
};

// Update sensor data (including rainfall and evaporation)
deviceSchema.methods.updateSensorData = function(sensorData) {
  this.lastSensorData = {
    soilMoisture: sensorData.soilMoisture || 0,
    temperature: sensorData.temperature || 0,
    humidity: sensorData.humidity || 0,
    rainfall: sensorData.rainfall || 0,
    evaporation: sensorData.evaporation || 0,
    timestamp: new Date()
  };

  // Update individual sensor readings array
  if (sensorData.soilMoisture !== undefined) {
    this.updateSensorReading('soil_moisture', sensorData.soilMoisture, '%');
  }
  if (sensorData.temperature !== undefined) {
    this.updateSensorReading('temperature', sensorData.temperature, '°C');
  }
  if (sensorData.humidity !== undefined) {
    this.updateSensorReading('humidity', sensorData.humidity, '%');
  }
  if (sensorData.rainfall !== undefined) {
    this.updateSensorReading('rainfall', sensorData.rainfall, 'mm');
  }
  if (sensorData.evaporation !== undefined) {
    this.updateSensorReading('evaporation', sensorData.evaporation, 'mm');
  }

  return this.save();
};

// Update or add a single sensor reading in sensors array
deviceSchema.methods.updateSensorReading = function(type, value, unit) {
  const sensorIndex = this.sensors.findIndex(sensor => sensor.type === type);

  if (sensorIndex !== -1) {
    this.sensors[sensorIndex].value = value;
    this.sensors[sensorIndex].unit = unit;
    this.sensors[sensorIndex].lastRead = new Date();
  } else {
    this.sensors.push({
      type,
      value,
      unit,
      lastRead: new Date()
    });
  }
};

export default mongoose.model('Device', deviceSchema);
