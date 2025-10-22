import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import SensorCard from "../components/SensorCard";
import AIAdviceCard from "../components/AIAdviceCard";
import ChartComponent from "../components/ChartComponent";
import IrrigationControl from "../components/IrrigationControl";
import WeatherForecast from "../components/WeatherForecast";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return { ref, inView };
};

function Dashboard() {
  const { axios, user } = useAppContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [irrigationSchedule, setIrrigationSchedule] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [irrigationLoading, setIrrigationLoading] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

  const headerSection = useScrollAnimation();
  const sensorSection = useScrollAnimation();
  const mainSection = useScrollAnimation();

  useEffect(() => {
    fetchDashboardData();
    fetchAIRecommendations();
    fetchChartData();
    loadAIPredictions();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData({
        totalDevices: 3,
        totalWaterUsed: 450,
        totalIrrigationTime: 120,
        totalIrrigations: 15,
        deviceStatus: { active: 2, inactive: 1, maintenance: 0 },
        recentActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAIRecommendations = async () => {
    try {
      setAiLoading(true);
      const response = await axios.get('/api/ai/recommendations');
      
      if (response.data.success) {
        const aiData = response.data.data;
        setAiRecommendations(aiData);
        updateSensorData(aiData.sensorData);
        
        // Save AI prediction to MongoDB
        await saveAIPrediction(aiData);
        
        toast.success("AI analysis completed!");
      }
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      toast.error("Failed to get AI analysis");
      
      const fallbackData = {
        recommendation: "No irrigation needed today. Soil moisture levels are optimal.",
        confidence: 85,
        waterRequirement: 450,
        optimalIrrigationTime: "06:00 AM",
        soilMoisturePrediction: "65% in 24h",
        cropHealth: "Excellent",
        riskAlerts: ["No immediate risks"],
        recommendations: ["Continue current schedule"],
        sensorData: {
          soilMoisture: 65,
          temperature: 28,
          humidity: 70
        },
        timestamp: new Date().toISOString()
      };
      
      setAiRecommendations(fallbackData);
      updateSensorData(fallbackData.sensorData);
      await saveAIPrediction(fallbackData);
    } finally {
      setAiLoading(false);
    }
  };

  const saveAIPrediction = async (predictionData) => {
    try {
      const response = await axios.post('/api/ai/predictions', {
        ...predictionData,
        userId: user?._id,
        fieldId: 'north-field', // You can make this dynamic
        predictionType: 'irrigation_recommendation',
        timestamp: new Date().toISOString()
      });
      
      if (response.data.success) {
        console.log('✅ AI prediction saved to MongoDB');
      }
    } catch (error) {
      console.error('❌ Error saving AI prediction:', error);
    }
  };

  const loadAIPredictions = async () => {
    try {
      const response = await axios.get('/api/ai/predictions');
      if (response.data.success) {
        console.log('📊 Loaded AI predictions:', response.data.data);
        // You can use this data for historical analysis
      }
    } catch (error) {
      console.error('Error loading AI predictions:', error);
    }
  };

  const fetchChartData = async () => {
    try {
      const moistureData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Soil Moisture %',
            data: [65, 62, 58, 70, 68, 72, 65],
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            tension: 0.4
          }
        ]
      };

      const waterData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Water Usage (L)',
            data: [450, 420, 380, 500, 480, 520, 450],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2
          }
        ]
      };

      setChartData({ moisture: moistureData, water: waterData });
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const updateSensorData = (sensorData) => {
    const updatedSensorData = [
      { 
        title: "Soil Moisture", 
        value: `${sensorData?.soilMoisture || 65}%`, 
        optimal: "60-80%", 
        status: getMoistureStatus(sensorData?.soilMoisture), 
        icon: "💧",
        aiPrediction: getMoisturePrediction(sensorData?.soilMoisture)
      },
      { 
        title: "Temperature", 
        value: `${sensorData?.temperature || 28}°C`, 
        optimal: "25-30°C", 
        status: getTemperatureStatus(sensorData?.temperature), 
        icon: "🌡️",
        aiPrediction: getTemperaturePrediction(sensorData?.temperature)
      },
      { 
        title: "Humidity", 
        value: `${sensorData?.humidity || 70}%`, 
        optimal: "60-80%", 
        status: getHumidityStatus(sensorData?.humidity), 
        icon: "💨",
        aiPrediction: getHumidityPrediction(sensorData?.humidity)
      }
    ];
    setSensorData(updatedSensorData);
  };

  // Helper functions for sensor status
  const getMoistureStatus = (moisture) => {
    if (!moisture) return "optimal";
    if (moisture < 40) return "critical";
    if (moisture < 60) return "warning";
    if (moisture > 85) return "warning";
    return "optimal";
  };

  const getMoisturePrediction = (moisture) => {
    if (!moisture) return "Optimal";
    if (moisture < 40) return "Irrigation needed";
    if (moisture < 60) return "Monitor closely";
    return "Optimal";
  };

  const getTemperatureStatus = (temp) => {
    if (!temp) return "optimal";
    if (temp < 15) return "warning";
    if (temp > 35) return "warning";
    return "optimal";
  };

  const getTemperaturePrediction = (temp) => {
    if (!temp) return "Normal";
    if (temp > 30) return "High evaporation";
    return "Normal";
  };

  const getHumidityStatus = (humidity) => {
    if (!humidity) return "optimal";
    if (humidity < 40) return "warning";
    if (humidity > 85) return "warning";
    return "optimal";
  };

  const getHumidityPrediction = (humidity) => {
    if (!humidity) return "Optimal";
    if (humidity < 50) return "Low humidity";
    return "Optimal";
  };

  const handleAITraining = async () => {
    try {
      setAiLoading(true);
      setTrainingProgress(0);
      
      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const response = await axios.post('/api/ai/train', { 
        epochs: 50,
        userId: user?._id 
      });
      
      clearInterval(progressInterval);
      setTrainingProgress(100);

      if (response.data.success) {
        toast.success("AI model trained successfully!");
        
        // Save training session to MongoDB
        await axios.post('/api/ai/training-sessions', {
          userId: user?._id,
          epochs: 50,
          accuracy: response.data.accuracy || 0.85,
          loss: response.data.loss || 0.15,
          duration: response.data.duration || '2m 30s',
          timestamp: new Date().toISOString()
        });

        // Refresh recommendations after training
        setTimeout(() => {
          fetchAIRecommendations();
          setTrainingProgress(0);
        }, 1000);
      }
    } catch (error) {
      console.error('AI training error:', error);
      toast.error(error.response?.data?.message || "Failed to train AI model");
      setTrainingProgress(0);
    } finally {
      setAiLoading(false);
    }
  };

  const handleStartIrrigation = async () => {
    try {
      setIrrigationLoading(true);
      const response = await axios.post('/api/ai/start-irrigation', {
        duration: 30,
        zone: 'North Field',
        waterAmount: aiRecommendations?.waterRequirement || 450,
        optimalTime: aiRecommendations?.optimalIrrigationTime,
        aiConfidence: aiRecommendations?.confidence
      });
      
      if (response.data.success) {
        toast.success("Irrigation started with AI optimization!");
        
        // Log irrigation event to MongoDB
        await axios.post('/api/ai/irrigation-events', {
          userId: user?._id,
          zone: 'North Field',
          duration: 30,
          waterUsed: aiRecommendations?.waterRequirement || 450,
          aiRecommended: true,
          aiConfidence: aiRecommendations?.confidence,
          timestamp: new Date().toISOString()
        });

        fetchDashboardData();
      }
    } catch (error) {
      console.error('Start irrigation error:', error);
      toast.error("Failed to start irrigation");
    } finally {
      setIrrigationLoading(false);
    }
  };

  const handleGetSettings = async () => {
    try {
      const response = await axios.get('/api/ai/settings');
      if (response.data.success) {
        toast.success("AI Settings loaded");
        console.log("AI Settings:", response.data.data);
        
        // You can display this in a modal
        const settings = response.data.data;
        alert(`AI Model Settings:\n\nLearning Rate: ${settings.learningRate}\nEpochs: ${settings.epochs}\nBatch Size: ${settings.batchSize}\nModel Version: ${settings.modelVersion}\nLast Trained: ${new Date(settings.lastTrained).toLocaleDateString()}`);
      }
    } catch (error) {
      console.error('Get settings error:', error);
      toast.error("Failed to load AI settings");
    }
  };

  const handleQuickAIAnalysis = async () => {
    try {
      setAiLoading(true);
      toast.loading("Running quick AI analysis...");
      
      const response = await axios.post('/api/ai/quick-analysis', {
        sensorData: {
          soilMoisture: 65,
          temperature: 28,
          humidity: 70
        },
        weatherForecast: "sunny",
        cropType: "corn"
      });
      
      if (response.data.success) {
        toast.dismiss();
        toast.success("Quick analysis completed!");
        
        const quickAnalysis = response.data.data;
        setAiRecommendations(prev => ({ ...prev, ...quickAnalysis }));
        
        // Save quick analysis to MongoDB
        await saveAIPrediction({
          ...quickAnalysis,
          analysisType: 'quick_analysis',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Quick analysis error:', error);
      toast.error("Quick analysis failed");
    } finally {
      setAiLoading(false);
    }
  };

  // Default sensor data (fallback)
  const defaultSensorData = [
    { title: "Soil Moisture", value: "65%", optimal: "60-80%", status: "optimal", icon: "💧", aiPrediction: "Optimal" },
    { title: "Temperature", value: "28°C", optimal: "25-30°C", status: "optimal", icon: "🌡️", aiPrediction: "Normal" },
    { title: "Humidity", value: "70%", optimal: "60-80%", status: "optimal", icon: "💨", aiPrediction: "Optimal" }
  ];

  const displaySensorData = sensorData.length > 0 ? sensorData : defaultSensorData;

  const weatherData = [
    { day: "Today", temp: "28°C", condition: "Sunny", rain: "0%", icon: "☀️" },
    { day: "Tomorrow", temp: "26°C", condition: "Cloudy", rain: "30%", icon: "⛅" },
    { day: "Wed", temp: "24°C", condition: "Rain", rain: "80%", icon: "🌧️" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold text-green-700">Loading Dashboard...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50"
    >
      {/* Header Section */}
      <motion.section
        ref={headerSection.ref}
        variants={containerVariants}
        className="bg-white shadow-sm border-b"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <motion.div variants={itemVariants}>
              <h1 className="text-3xl lg:text-4xl font-bold text-green-700 playfair-headline">
                Farm Dashboard
              </h1>
              <p className="text-gray-600 mt-2 outfit-content">
                AI-Powered Smart Irrigation System
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants} className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500 outfit-content">Current Field</p>
                <p className="font-semibold text-green-700 montserrat-subhead">North Field - Corn</p>
                {aiRecommendations && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span>🤖</span> AI Model Active ({aiRecommendations.confidence}% confidence)
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌽</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick AI Actions Bar */}
        <motion.section
          variants={containerVariants}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span>⚡</span>
                Quick AI Actions
              </h3>
              <div className="flex flex-wrap gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQuickAIAnalysis}
                  disabled={aiLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {aiLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      Quick Analysis
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchAIRecommendations}
                  disabled={aiLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {aiLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      Refresh AI Data
                    </>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGetSettings}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
                >
                  <span>⚙️</span>
                  AI Settings
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Key Sensors Section */}
        <motion.section
          ref={sensorSection.ref}
          variants={containerVariants}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-8">
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-bold text-green-800 montserrat-subhead"
            >
              Current Field Conditions
            </motion.h2>
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAITraining}
              disabled={aiLoading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2 relative overflow-hidden"
            >
              {aiLoading && (
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-purple-300"
                  initial={{ width: "0%" }}
                  animate={{ width: `${trainingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              )}
              {aiLoading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  Training AI... {trainingProgress}%
                </>
              ) : (
                <>
                  <span>🤖</span>
                  Train AI Model
                </>
              )}
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displaySensorData.map((sensor, index) => (
              <motion.div
                key={sensor.title}
                variants={itemVariants}
                custom={index}
              >
                <SensorCard 
                  title={sensor.title}
                  value={sensor.value}
                  optimal={sensor.optimal}
                  status={sensor.status}
                  icon={sensor.icon}
                  aiPrediction={sensor.aiPrediction}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Main Dashboard Grid */}
        <motion.section
          ref={mainSection.ref}
          variants={containerVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {/* Left Column - AI Advice & Control */}
          <motion.div variants={itemVariants} className="space-y-8">
            <AIAdviceCard 
              advice={aiRecommendations?.recommendation || "No irrigation needed today. Soil moisture levels are optimal for corn growth."}
              confidence={aiRecommendations?.confidence ? `${aiRecommendations.confidence}%` : "85%"}
              priority={aiRecommendations?.shouldIrrigate ? "medium" : "low"}
              aiPowered={true}
              onGetRecommendation={fetchAIRecommendations}
              loading={aiLoading}
            />
            
            <IrrigationControl 
              status="auto"
              nextSchedule={aiRecommendations?.optimalIrrigationTime || "Tomorrow 06:00 AM"}
              duration="45 minutes"
              zone="North Field"
              waterAmount={aiRecommendations?.waterRequirement ? `${aiRecommendations.waterRequirement}L` : "450L"}
              efficiency="85%"
              aiEnabled={true}
              onStartNow={handleStartIrrigation}
              onSettings={handleGetSettings}
              loading={irrigationLoading}
            />
          </motion.div>

          {/* Right Column - Weather & Quick Stats */}
          <motion.div variants={itemVariants} className="space-y-8">
            <WeatherForecast data={weatherData} />
            
            {/* Quick Stats with AI Insights */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span>
                AI Insights & Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {aiRecommendations?.waterRequirement || 450}L
                  </div>
                  <div className="text-sm text-blue-800">AI Water Prediction</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">35%</div>
                  <div className="text-sm text-green-800">Water Saved</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {aiRecommendations?.confidence || 85}%
                  </div>
                  <div className="text-sm text-yellow-800">AI Confidence</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {aiLoading ? "Training" : "Active"}
                  </div>
                  <div className="text-sm text-purple-800">AI Model</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* AI Predictions Section */}
        {aiRecommendations && (
          <motion.section
            variants={containerVariants}
            className="mb-12"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-bold text-green-800 mb-8 montserrat-subhead flex items-center gap-2"
            >
              <span>🤖</span>
              AI Predictions & Analytics
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Water Requirements</h3>
                <p className="text-3xl font-bold text-blue-600">{aiRecommendations.waterRequirement || 450}L</p>
                <p className="text-sm text-gray-600 mt-2">Predicted daily water need</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Optimal Irrigation</h3>
                <p className="text-xl font-bold text-green-600">{aiRecommendations.optimalIrrigationTime || "06:00 AM"}</p>
                <p className="text-sm text-gray-600 mt-2">AI recommended time</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Soil Moisture Forecast</h3>
                <p className="text-xl font-bold text-purple-600">{aiRecommendations.soilMoisturePrediction || "65% in 24h"}</p>
                <p className="text-sm text-gray-600 mt-2">24-hour prediction</p>
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* Charts Section */}
        {chartData && (
          <motion.section
            variants={containerVariants}
            className="mb-12"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-bold text-green-800 mb-8 montserrat-subhead"
            >
              Field Analytics
            </motion.h2>
            <div className="grid grid-cols-1 gap-8">
              <motion.div variants={itemVariants}>
                <ChartComponent 
                  title="Soil Moisture Trends (Last 7 Days)"
                  type="line"
                  data={chartData.moisture}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <ChartComponent 
                  title="Water Usage Overview"
                  type="bar"
                  data={chartData.water}
                />
              </motion.div>
            </div>
          </motion.section>
        )}

        {/* System Status Section */}
        <motion.section
          variants={containerVariants}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <motion.h2 
            variants={itemVariants}
            className="text-2xl font-bold text-green-800 mb-6 montserrat-subhead"
          >
            System Overview
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div variants={itemVariants} className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-3xl text-green-600 mb-3">🌱</div>
              <h3 className="font-semibold text-gray-800 mb-2">Crop Stage</h3>
              <p className="text-green-600 font-medium">Vegetative Growth</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl text-blue-600 mb-3">💧</div>
              <h3 className="font-semibold text-gray-800 mb-2">Last Watering</h3>
              <p className="text-blue-600 font-medium">24 hours ago</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center p-6 bg-yellow-50 rounded-xl">
              <div className="text-3xl text-yellow-600 mb-3">📈</div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Accuracy</h3>
              <p className="text-yellow-600 font-medium">{aiRecommendations?.confidence || 85}%</p>
            </motion.div>
            <motion.div variants={itemVariants} className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-3xl text-purple-600 mb-3">✅</div>
              <h3 className="font-semibold text-gray-800 mb-2">AI Status</h3>
              <p className="text-purple-600 font-medium">{aiLoading ? "Training" : "Active"}</p>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

export default Dashboard;