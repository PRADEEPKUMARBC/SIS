import { weatherService } from '../utils/weatherAPI.js';
import WeatherData from '../models/WeatherData.js';

export const getCurrentWeather = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coordinates (lat, lng)'
      });
    }

    const location = { coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) } };
    const weatherData = await weatherService.getWeatherForIrrigation(location);

    res.json({ success: true, weather: weatherData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getWeatherForecast = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coordinates (lat, lng)'
      });
    }

    const location = { coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) } };
    const forecast = await weatherService.getWeatherForecast(location);

    res.json({ success: true, forecast });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};


export const getWeatherHistory = async (req, res) => {
  try {
    const { lat, lng, days = 7 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Please provide coordinates (lat, lng)'
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const weatherHistory = await WeatherData.find({
  'location.coordinates.lat': { $gte: parseFloat(lat) - 0.01, $lte: parseFloat(lat) + 0.01 },
  'location.coordinates.lng': { $gte: parseFloat(lng) - 0.01, $lte: parseFloat(lng) + 0.01 },
  lastUpdated: { $gte: startDate }
}).sort({ lastUpdated: -1 });


    res.json({
      success: true,
      weatherHistory
    });

  } catch (error) {
    console.error('Get weather history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weather history'
    });
  }
};