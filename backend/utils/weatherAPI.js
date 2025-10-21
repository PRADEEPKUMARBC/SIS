import axios from 'axios';
import WeatherData from '../models/WeatherData.js';
import dotenv from 'dotenv';
dotenv.config();

class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseURL = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(location) {
    try {
      if (!location.coordinates) throw new Error('Coordinates are required');

      const response = await axios.get(`${this.baseURL}/weather`, {
        params: {
          lat: location.coordinates.lat,
          lon: location.coordinates.lng,
          appid: this.apiKey,
          units: 'metric',
          lang: 'en'
        }
      });

      return this.formatCurrentWeather(response.data);
    } catch (error) {
      console.error('Weather API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch weather data');
    }
  }

  async getWeatherForecast(location) {
    try {
      if (!location.coordinates) throw new Error('Coordinates are required');

      const response = await axios.get(`${this.baseURL}/forecast`, {
        params: {
          lat: location.coordinates.lat,
          lon: location.coordinates.lng,
          appid: this.apiKey,
          units: 'metric',
          lang: 'en'
        }
      });

      return this.formatForecast(response.data);
    } catch (error) {
      console.error('Weather Forecast API Error:', error.response?.data || error.message);
      throw new Error('Failed to fetch weather forecast');
    }
  }

  formatCurrentWeather(data) {
    return {
      location: {
        city: data.name,
        country: data.sys.country,
        coordinates: { lat: data.coord.lat, lng: data.coord.lon }
      },
      current: {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        visibility: data.visibility / 1000,
        condition: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        rainfall: data.rain?.['1h'] || 0,
        cloudiness: data.clouds.all,
        sunrise: new Date(data.sys.sunrise * 1000),
        sunset: new Date(data.sys.sunset * 1000)
      },
      lastUpdated: new Date()
    };
  }

  formatForecast(data) {
    return data.list.slice(0, 5).map(item => ({
      date: new Date(item.dt * 1000),
      temperature: {
        min: item.main.temp_min,
        max: item.main.temp_max,
        day: item.main.temp,
        night: item.main.feels_like
      },
      humidity: item.main.humidity,
      pressure: item.main.pressure,
      windSpeed: item.wind.speed,
      condition: item.weather[0].main,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      rainfall: item.rain?.['3h'] || 0,
      probability: item.pop * 100
    }));
  }

  // ✅ Always save a new document for history
  async saveWeatherData(weatherData) {
    try {
      const newData = new WeatherData(weatherData);
      await newData.save();
      return newData;
    } catch (err) {
      console.error('Error saving weather data:', err);
      throw err;
    }
  }

  async getWeatherForIrrigation(location) {
    try {
      const [currentWeather, forecast] = await Promise.all([
        this.getCurrentWeather(location),
        this.getWeatherForecast(location)
      ]);

      const weatherData = { ...currentWeather, forecast };
      await this.saveWeatherData(weatherData); // new record each time

      return weatherData;
    } catch (error) {
      console.error('Error getting weather for irrigation:', error);
      // fallback: cached latest record
      const cached = await WeatherData.findOne({
        'location.coordinates.lat': location.coordinates?.lat,
        'location.coordinates.lng': location.coordinates?.lng
      }).sort({ lastUpdated: -1 });

      if (cached) return cached;
      throw new Error('Failed to fetch weather forecast');
    }
  }
}

export const weatherService = new WeatherService();
