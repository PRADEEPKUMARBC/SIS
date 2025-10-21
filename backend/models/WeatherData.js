import mongoose from 'mongoose';

const weatherDataSchema = new mongoose.Schema({
  location: {
    city: String,
    country: String,
    coordinates: { lat: Number, lng: Number }
  },
  current: Object,
  forecast: Array,
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

weatherDataSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model('WeatherData', weatherDataSchema);
