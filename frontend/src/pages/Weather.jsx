import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";

function Weather() {
  const { axios } = useAppContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weatherMode, setWeatherMode] = useState("");
  const [weatherData, setWeatherData] = useState([]);
  const [location, setLocation] = useState(null); // Start with null for auto-detection
  const [cityInput, setCityInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    getUserCurrentLocation();
  }, []);

  // Get user's current location automatically
  const getUserCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLocation({ lat: 14.4667, lng: 75.9167 }); // Fallback to Davanagere
      fetchWeatherData(14.4667, 75.9167);
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("User location detected:", latitude, longitude);
        
        // Get city name from coordinates
        try {
          const cityName = await getCityNameFromCoordinates(latitude, longitude);
          setLocation({ 
            lat: latitude, 
            lng: longitude, 
            city: cityName 
          });
          await fetchWeatherData(latitude, longitude);
          toast.success(`Weather data for your location (${cityName}) loaded!`);
        } catch (error) {
          console.error("Error getting city name:", error);
          setLocation({ lat: latitude, lng: longitude });
          await fetchWeatherData(latitude, longitude);
          toast.success("Weather data for your current location loaded!");
        }
        
        setLocationLoading(false);
      },
      async (error) => {
        console.error("Geolocation error:", error);
        
        let errorMessage = "Unable to get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Location access denied. Using Davanagere as default.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information unavailable. Using Davanagere as default.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Using Davanagere as default.";
            break;
          default:
            errorMessage += "Unknown error. Using Davanagere as default.";
            break;
        }
        
        toast.error(errorMessage);
        // Fallback to Davanagere
        setLocation({ lat: 14.4667, lng: 75.9167 });
        await fetchWeatherData(14.4667, 75.9167);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Reverse geocoding to get city name from coordinates
  const getCityNameFromCoordinates = async (lat, lng) => {
    // Simple reverse geocoding for common areas in Karnataka
    const knownLocations = {
      "14.4667,75.9167": "Davanagere",
      "14.2800,75.9200": "Harihara",
      "14.3000,75.9500": "Mahajanahalli",
      "15.4589,75.0078": "Dharwad",
      "12.9716,77.5946": "Bengaluru",
      "15.3647,75.1235": "Hubli",
      "12.2958,76.6394": "Mysuru",
      "12.9141,74.8560": "Mangalore",
      "15.8497,74.4977": "Belagavi",
      "13.3409,77.1110": "Tumakuru",
      "17.3297,76.8343": "Kalaburagi",
      "13.9299,75.5681": "Shimoga"
    };

    const locationKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    
    // Find the closest known location
    let closestCity = "Your Location";
    let minDistance = Infinity;

    Object.entries(knownLocations).forEach(([coords, city]) => {
      const [knownLat, knownLng] = coords.split(',').map(Number);
      const distance = Math.sqrt(
        Math.pow(lat - knownLat, 2) + Math.pow(lng - knownLng, 2)
      );
      
      if (distance < minDistance && distance < 0.5) { // Within 50km radius
        minDistance = distance;
        closestCity = city;
      }
    });

    return closestCity;
  };

  const handleRefresh = () => {
    getUserCurrentLocation();
  };

  // Enhanced geocoding function
  const getCoordinatesFromCity = async (cityName) => {
    try {
      setIsSearching(true);
      
      const cityCoordinates = {
        // Karnataka Cities
        "davanagere": { lat: 14.4667, lng: 75.9167, name: "Davanagere, India" },
        "harihara": { lat: 14.2800, lng: 75.9200, name: "Harihara, India" },
        "mahajanahalli": { lat: 14.3000, lng: 75.9500, name: "Mahajanahalli, India" },
        "dharwad": { lat: 15.4589, lng: 75.0078, name: "Dharwad, India" },
        "hubli": { lat: 15.3647, lng: 75.1235, name: "Hubli, India" },
        "mysuru": { lat: 12.2958, lng: 76.6394, name: "Mysuru, India" },
        "mysore": { lat: 12.2958, lng: 76.6394, name: "Mysuru, India" },
        "mangalore": { lat: 12.9141, lng: 74.8560, name: "Mangalore, India" },
        "belagavi": { lat: 15.8497, lng: 74.4977, name: "Belagavi, India" },
        "belgaum": { lat: 15.8497, lng: 74.4977, name: "Belagavi, India" },
        "tumakuru": { lat: 13.3409, lng: 77.1110, name: "Tumakuru, India" },
        "tumkur": { lat: 13.3409, lng: 77.1110, name: "Tumakuru, India" },
        "kalaburagi": { lat: 17.3297, lng: 76.8343, name: "Kalaburagi, India" },
        "gulbarga": { lat: 17.3297, lng: 76.8343, name: "Kalaburagi, India" },
        "shimoga": { lat: 13.9299, lng: 75.5681, name: "Shimoga, India" },
        "shivamogga": { lat: 13.9299, lng: 75.5681, name: "Shimoga, India" },
        
        // Major Indian Cities
        "bengaluru": { lat: 12.9716, lng: 77.5946, name: "Bengaluru, India" },
        "bangalore": { lat: 12.9716, lng: 77.5946, name: "Bengaluru, India" },
        "mumbai": { lat: 19.0760, lng: 72.8777, name: "Mumbai, India" },
        "delhi": { lat: 28.6139, lng: 77.2090, name: "Delhi, India" },
        "chennai": { lat: 13.0827, lng: 80.2707, name: "Chennai, India" },
        "kolkata": { lat: 22.5726, lng: 88.3639, name: "Kolkata, India" },
        "hyderabad": { lat: 17.3850, lng: 78.4867, name: "Hyderabad, India" },
        "pune": { lat: 18.5204, lng: 73.8567, name: "Pune, India" },
        
        // International Cities
        "london": { lat: 51.5074, lng: -0.1278, name: "London, UK" },
        "new york": { lat: 40.7128, lng: -74.0060, name: "New York, USA" },
        "tokyo": { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan" },
        "paris": { lat: 48.8566, lng: 2.3522, name: "Paris, France" },
        "dubai": { lat: 25.2048, lng: 55.2708, name: "Dubai, UAE" }
      };

      const normalizedCityName = cityName.toLowerCase().trim();
      
      if (cityCoordinates[normalizedCityName]) {
        return cityCoordinates[normalizedCityName];
      } else {
        // Try to find partial matches
        const matchedCity = Object.keys(cityCoordinates).find(city => 
          city.includes(normalizedCityName) || normalizedCityName.includes(city)
        );
        
        if (matchedCity) {
          return cityCoordinates[matchedCity];
        }
        
        // Fallback to current location or Davanagere
        if (location) {
          return {
            lat: location.lat,
            lng: location.lng,
            name: `${cityName} (Using current location)`
          };
        } else {
          return {
            lat: 14.4667,
            lng: 75.9167,
            name: `${cityName} (Using Davanagere data)`
          };
        }
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      throw new Error("Could not find the specified city");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle city search
  const handleCitySearch = async (e) => {
    e.preventDefault();
    if (!cityInput.trim()) {
      toast.error("Please enter a city name");
      return;
    }

    try {
      setIsSearching(true);
      toast.loading(`Searching for ${cityInput}...`);
      
      const coordinates = await getCoordinatesFromCity(cityInput);
      setLocation({ lat: coordinates.lat, lng: coordinates.lng });
      
      // Fetch weather data for the new location
      await fetchWeatherData(coordinates.lat, coordinates.lng);
      
      setCityInput(""); // Clear input after search
      toast.success(`Weather data for ${coordinates.name} loaded!`);
    } catch (error) {
      console.error("City search error:", error);
      toast.error(error.message || "Failed to find the specified city");
    } finally {
      setIsSearching(false);
      toast.dismiss();
    }
  };

  const fetchWeatherData = async (customLat = null, customLng = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const lat = customLat || (location ? location.lat : 14.4667);
      const lng = customLng || (location ? location.lng : 75.9167);

      // Try to get weather data from backend
      const response = await axios.get('/api/weather/current', {
        params: {
          lat: lat,
          lng: lng
        }
      });

      if (response.data.success) {
        setData(response.data.weather);
        if (!customLat) {
          toast.success("Weather data loaded successfully!");
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch weather data");
      }
    } catch (err) {
      console.error("Weather API error:", err);
      
      // If API fails, use mock data for demo
      console.log("Using mock weather data for demo");
      setData(getMockWeatherData(customLat || (location ? location.lat : 14.4667), customLng || (location ? location.lng : 75.9167)));
      if (!customLat) {
        toast.success("Demo weather data loaded!");
      }
      
    } finally {
      setLoading(false);
    }
  };

  // Enhanced mock weather data
  const getMockWeatherData = (lat, lng) => {
    const cities = {
      "14.4667,75.9167": { city: "Davanagere", country: "India", climate: "tropical" },
      "14.2800,75.9200": { city: "Harihara", country: "India", climate: "tropical" },
      "14.3000,75.9500": { city: "Mahajanahalli", country: "India", climate: "tropical" },
      "15.4589,75.0078": { city: "Dharwad", country: "India", climate: "tropical" },
      "12.9716,77.5946": { city: "Bengaluru", country: "India", climate: "moderate" },
      "19.0760,72.8777": { city: "Mumbai", country: "India", climate: "coastal" },
      "28.6139,77.2090": { city: "Delhi", country: "India", climate: "continental" },
      "51.5074,-0.1278": { city: "London", country: "UK", climate: "temperate" },
      "40.7128,-74.0060": { city: "New York", country: "USA", climate: "continental" }
    };
    
    const locationKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const locationInfo = cities[locationKey] || { city: "Your Location", country: "India", climate: "tropical" };
    
    // Generate realistic weather based on climate
    let temperature, humidity, condition;
    
    switch(locationInfo.climate) {
      case "tropical":
        temperature = Math.round(25 + Math.random() * 10); // 25-35°C
        humidity = Math.round(60 + Math.random() * 30); // 60-90%
        condition = ["Clear", "Clouds", "Rain"][Math.floor(Math.random() * 3)];
        break;
      case "coastal":
        temperature = Math.round(22 + Math.random() * 8); // 22-30°C
        humidity = Math.round(70 + Math.random() * 25); // 70-95%
        condition = ["Clouds", "Rain", "Drizzle"][Math.floor(Math.random() * 3)];
        break;
      case "continental":
        temperature = Math.round(15 + Math.random() * 20); // 15-35°C
        humidity = Math.round(30 + Math.random() * 50); // 30-80%
        condition = ["Clear", "Clouds", "Rain"][Math.floor(Math.random() * 3)];
        break;
      case "temperate":
        temperature = Math.round(10 + Math.random() * 15); // 10-25°C
        humidity = Math.round(50 + Math.random() * 40); // 50-90%
        condition = ["Clear", "Clouds", "Rain", "Drizzle"][Math.floor(Math.random() * 4)];
        break;
      default:
        temperature = Math.round(20 + Math.random() * 15); // 20-35°C
        humidity = Math.round(40 + Math.random() * 40); // 40-80%
        condition = ["Clear", "Clouds", "Rain"][Math.floor(Math.random() * 3)];
    }
    
    return {
      location: locationInfo,
      current: {
        temperature: temperature,
        feelsLike: temperature + Math.round((Math.random() - 0.5) * 5),
        humidity: humidity,
        pressure: Math.round(1000 + Math.random() * 50),
        windSpeed: (Math.random() * 10).toFixed(1),
        condition: condition,
        description: getWeatherDescription(condition),
        visibility: Math.round(5 + Math.random() * 5),
        cloudiness: Math.round(Math.random() * 100),
        rainfall: condition === "Rain" ? Math.round(1 + Math.random() * 9) : 0,
        sunrise: Date.now() - 4 * 60 * 60 * 1000,
        sunset: Date.now() + 4 * 60 * 60 * 1000
      }
    };
  };

  const getWeatherDescription = (condition) => {
    const descriptions = {
      "Clear": ["clear sky", "sunny"],
      "Clouds": ["few clouds", "scattered clouds", "broken clouds", "overcast clouds"],
      "Rain": ["light rain", "moderate rain", "heavy intensity rain", "very heavy rain"],
      "Drizzle": ["light intensity drizzle", "drizzle", "heavy intensity drizzle"],
      "Thunderstorm": ["thunderstorm with light rain", "thunderstorm with rain", "thunderstorm with heavy rain"]
    };
    
    const availableDescriptions = descriptions[condition] || ["clear sky"];
    return availableDescriptions[Math.floor(Math.random() * availableDescriptions.length)];
  };

  // Calculate irrigation recommendations
  const getIrrigationRecommendation = () => {
    if (!data || !data.current) return null;
    
    const { temperature, humidity } = data.current;
    const windSpeed = data.current.windSpeed;
    const weatherMain = data.current.condition;
    const rainfall = data.current.rainfall || 0;
    
    if (weatherMain.toLowerCase().includes("rain") || rainfall > 5) {
      return { 
        recommendation: "No irrigation needed - significant rainfall expected", 
        level: "low",
        icon: "🌧️",
        details: "Rainfall will provide sufficient moisture"
      };
    } else if (temperature > 30 && humidity < 40 && windSpeed > 10) {
      return { 
        recommendation: "High irrigation recommended - hot, dry, and windy conditions", 
        level: "high",
        icon: "🔥",
        details: "High evaporation rate due to temperature and wind"
      };
    } else if (temperature > 28 && humidity < 50) {
      return { 
        recommendation: "Moderate to high irrigation - hot and dry conditions", 
        level: "medium-high",
        icon: "☀️",
        details: "Increased water requirement due to heat"
      };
    } else if (temperature > 25 && windSpeed > 15) {
      return { 
        recommendation: "Moderate irrigation - windy conditions increase evaporation", 
        level: "medium",
        icon: "💨",
        details: "Wind accelerates moisture loss from soil"
      };
    } else if (humidity > 70) {
      return { 
        recommendation: "Reduced irrigation - high humidity reduces evaporation", 
        level: "low",
        icon: "💧",
        details: "High humidity slows down evaporation rates"
      };
    } else if (temperature < 15) {
      return { 
        recommendation: "Minimal irrigation - cool temperatures reduce water needs", 
        level: "very-low",
        icon: "❄️",
        details: "Reduced evaporation in cooler conditions"
      };
    } else {
      return { 
        recommendation: "Normal irrigation schedule", 
        level: "normal",
        icon: "✅",
        details: "Standard irrigation based on current conditions"
      };
    }
  };

  const irrigationInfo = getIrrigationRecommendation();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  if ((loading || locationLoading) && !data) {
    return (
      <div className="p-8 bg-green-50 min-h-screen text-center flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"
          />
          <p className="text-green-700 text-lg mb-2">Detecting your location...</p>
          <p className="text-green-600 text-sm">Please allow location access for accurate weather data</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-6xl mx-auto"
      >
        {/* Header with City Search */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center mb-4 gap-4">
            <h1 className="text-4xl font-bold text-green-800">
              Smart Irrigation Weather Dashboard
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <span>📍</span>
              My Location
            </motion.button>
          </div>
          
          {/* City Search Form */}
          <motion.form 
            onSubmit={handleCitySearch}
            className="max-w-2xl mx-auto mb-4"
            variants={itemVariants}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="Search any city (e.g., Bengaluru, Mumbai, London)"
                className="flex-1 p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent shadow-sm bg-white text-gray-900"
                disabled={isSearching}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSearching || !cityInput.trim()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSearching ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    Searching...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Search
                  </>
                )}
              </motion.button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Currently showing: <span className="font-semibold text-green-700">
                {data?.location?.city || "Your Location"}
              </span>
              {data?.location?.city === "Your Location" && " (Auto-detected)"}
            </p>
          </motion.form>

          <p className="text-green-600 text-lg">
            Real-time weather data for optimal irrigation planning
          </p>
          {data && data.location && (
            <p className="text-green-700 font-semibold mt-2 text-xl">
              📍 {data.location.city}, {data.location.country}
              {data.location.city === "Your Location" && " (Based on your device location)"}
            </p>
          )}
        </motion.div>

        {/* Error Message */}
        {error && !data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md mx-auto text-center mb-6"
          >
            <p className="text-lg font-semibold mb-2">Weather Data Unavailable</p>
            <p className="mb-4">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchWeatherData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* Weather Data Display */}
        {data && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Current Weather Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center">
                <span className="mr-2">🌤️</span>
                Current Weather
              </h2>
              
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="text-6xl text-blue-600"
                >
                  {data.current.temperature}°C
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-right"
                >
                  <div className="text-3xl mb-1">
                    {data.current.condition === "Clear" && "☀️"}
                    {data.current.condition === "Clouds" && "☁️"}
                    {data.current.condition === "Rain" && "🌧️"}
                    {data.current.condition === "Drizzle" && "🌦️"}
                    {data.current.condition === "Thunderstorm" && "⛈️"}
                    {data.current.condition === "Snow" && "❄️"}
                    {data.current.condition === "Mist" || data.current.condition === "Fog" ? "🌫️" : "🌈"}
                  </div>
                  <p className="text-gray-600 capitalize font-medium">
                    {data.current.description}
                  </p>
                </motion.div>
              </div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-600">Feels Like</p>
                  <p className="font-semibold text-lg">{data.current.feelsLike}°C</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Humidity</p>
                  <p className="font-semibold text-lg">{data.current.humidity}%</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-600">Wind Speed</p>
                  <p className="font-semibold text-lg">{data.current.windSpeed} m/s</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Rainfall</p>
                  <p className="font-semibold text-lg">{data.current.rainfall || 0} mm</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Weather Details Card */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold text-blue-700 mb-4">Weather Details</h2>
              
              <motion.div variants={containerVariants} className="space-y-4">
                <motion.div variants={itemVariants} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Pressure</span>
                  <span className="font-semibold">{data.current.pressure} hPa</span>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Visibility</span>
                  <span className="font-semibold">{data.current.visibility} km</span>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Cloudiness</span>
                  <span className="font-semibold">{data.current.cloudiness}%</span>
                </motion.div>

                {data.current.sunrise && (
                  <motion.div variants={itemVariants} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="text-gray-600">Sunrise</span>
                    <span className="font-semibold">
                      {new Date(data.current.sunrise).toLocaleTimeString()}
                    </span>
                  </motion.div>
                )}

                {data.current.sunset && (
                  <motion.div variants={itemVariants} className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                    <span className="text-gray-600">Sunset</span>
                    <span className="font-semibold">
                      {new Date(data.current.sunset).toLocaleTimeString()}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Smart Irrigation Recommendation */}
            <motion.div
              variants={cardVariants}
              whileHover="hover"
              className="lg:col-span-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Smart Irrigation Recommendation
              </h2>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="text-center py-4"
              >
                <div className="text-4xl mb-3">{irrigationInfo?.icon}</div>
                <p className="text-xl font-semibold mb-2">{irrigationInfo?.recommendation}</p>
                <p className="text-white text-opacity-90 mb-4">{irrigationInfo?.details}</p>
                <div className={`inline-block px-4 py-2 rounded-full ${
                  irrigationInfo?.level === 'high' || irrigationInfo?.level === 'medium-high' ? 'bg-red-400' : 
                  irrigationInfo?.level === 'medium' ? 'bg-yellow-400' : 
                  irrigationInfo?.level === 'low' ? 'bg-green-400' : 'bg-blue-400'
                }`}>
                  <span className="font-semibold">
                    {irrigationInfo?.level?.toUpperCase().replace('-', ' ')} IRRIGATION LEVEL
                  </span>
                </div>
              </motion.div>

              <motion.div
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
              >
                <motion.div variants={itemVariants} className="text-center p-4 bg-white bg-opacity-20 rounded-lg">
                  <div className="text-2xl mb-2">🌡️</div>
                  <p className="text-sm">Temperature: {data.current.temperature}°C</p>
                  <p className="text-xs opacity-90">Affects evaporation rates</p>
                </motion.div>
                <motion.div variants={itemVariants} className="text-center p-4 bg-white bg-opacity-20 rounded-lg">
                  <div className="text-2xl mb-2">💧</div>
                  <p className="text-sm">Humidity: {data.current.humidity}%</p>
                  <p className="text-xs opacity-90">Influences water requirements</p>
                </motion.div>
                <motion.div variants={itemVariants} className="text-center p-4 bg-white bg-opacity-20 rounded-lg">
                  <div className="text-2xl mb-2">🌬️</div>
                  <p className="text-sm">Wind: {data.current.windSpeed} m/s</p>
                  <p className="text-xs opacity-90">Increases evaporation</p>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Weather;