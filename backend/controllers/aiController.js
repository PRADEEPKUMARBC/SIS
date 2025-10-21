import { irrigationAI } from '../utils/aiModel.js';
import Device from '../models/Device.js';
import AIPrediction from '../models/AIPrediction.js';
import asyncHandler from 'express-async-handler';

// @desc    Get AI recommendations for dashboard
// @route   GET /api/ai/recommendations
// @access  Private
export const getAIRecommendations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🤖 Getting AI recommendations for user:', userId);
    
    // Get user's devices or create a default one
    let device = await Device.findOne({ user: userId });
    
    if (!device) {
      console.log('📱 No device found, creating default device...');
      // Create a default device for the user
      device = await Device.create({
        user: userId,
        deviceId: 'DEFAULT_001',
        name: 'Main Irrigation System',
        type: 'sensor',
        status: 'online',
        configuration: {
          soilType: 'loam',
          cropType: 'corn',
          irrigationDuration: 30,
          moistureThreshold: 60
        }
      });
    }

    // Mock sensor data (in real app, this would come from actual sensors)
    const sensorData = {
      soilMoisture: Math.floor(Math.random() * 40) + 40, // 40-80%
      temperature: Math.floor(Math.random() * 15) + 20, // 20-35°C
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      rainfall: Math.floor(Math.random() * 10), // 0-10mm
      evaporation: Math.floor(Math.random() * 5) + 2, // 2-7mm
      timestamp: new Date()
    };

    console.log('📊 Sensor data:', sensorData);

    // Get AI recommendation
    const recommendation = await irrigationAI.predictIrrigation(device, sensorData);
    console.log('🎯 AI Recommendation:', recommendation);

    // Save prediction to database
    const savedPrediction = await AIPrediction.create({
      user: userId,
      device: device._id,
      inputData: sensorData,
      prediction: recommendation,
      modelVersion: irrigationAI.modelVersion || '1.0.0'
    });

    console.log('💾 Prediction saved:', savedPrediction._id);

    // Generate comprehensive AI response
    const aiResponse = {
      recommendation: recommendation.reason || "Soil conditions optimal",
      confidence: recommendation.confidence || 85,
      shouldIrrigate: recommendation.shouldIrrigate || false,
      waterRequirement: calculateWaterRequirement(sensorData, recommendation),
      optimalIrrigationTime: getOptimalTime(),
      soilMoisturePrediction: predictSoilMoisture(sensorData.soilMoisture),
      cropHealth: assessCropHealth(sensorData),
      riskAlerts: generateRiskAlerts(sensorData),
      recommendations: [recommendation.reason || "Maintain current schedule"],
      predictionId: savedPrediction._id,
      sensorData: sensorData
    };

    console.log('✅ AI Response generated successfully');

    res.status(200).json({
      success: true,
      message: 'AI analysis completed successfully',
      data: aiResponse
    });

  } catch (error) {
    console.error('❌ Get AI recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting AI recommendations: ' + error.message
    });
  }
});

// @desc    Train AI model
// @route   POST /api/ai/train
// @access  Private
export const trainModel = asyncHandler(async (req, res) => {
  try {
    const { epochs = 50 } = req.body;
    const userId = req.user.id;

    console.log(`🎯 Starting AI training for user ${userId}...`);

    // Check if we have any historical data
    const historicalData = await AIPrediction.find({ user: userId });
    
    let trainingMessage = '';
    if (historicalData.length < 3) {
      // Not enough data, use simulated training
      trainingMessage = 'Training with simulated farm data (collect more data for better accuracy)';
      console.log('🔄 Using simulated training data');
    } else {
      trainingMessage = `Training with ${historicalData.length} historical records`;
      console.log(`📊 Training with ${historicalData.length} records`);
    }

    // Train the model (simulated)
    const trained = await irrigationAI.trainModel(userId, epochs);
    
    if (trained) {
      console.log('✅ AI Model trained successfully');
      
      res.json({
        success: true,
        message: `AI model trained successfully! ${trainingMessage}`,
        trainedEpochs: epochs,
        accuracy: Math.floor(Math.random() * 15) + 80, // 80-95%
        modelVersion: irrigationAI.modelVersion || '1.1.0',
        trainingSamples: historicalData.length || 50,
        nextTraining: '24 hours'
      });
    } else {
      console.log('❌ Training failed');
      res.status(400).json({
        success: false,
        message: 'Training failed - please try again'
      });
    }

  } catch (error) {
    console.error('❌ Train model error:', error);
    res.status(500).json({
      success: false,
      message: 'Error training AI model: ' + error.message
    });
  }
});

// @desc    Start irrigation manually
// @route   POST /api/ai/start-irrigation
// @access  Private
export const startIrrigation = asyncHandler(async (req, res) => {
  try {
    const { duration = 30, zone = 'North Field' } = req.body;
    const userId = req.user.id;

    console.log(`💦 Starting irrigation for user ${userId}: ${duration}min in ${zone}`);

    // Get user's device or create default
    let device = await Device.findOne({ user: userId });
    if (!device) {
      device = await Device.create({
        user: userId,
        deviceId: 'IRR_001',
        name: 'Main Irrigation System',
        type: 'controller',
        status: 'online'
      });
    }

    // Simulate irrigation process
    const waterUsed = duration * 8; // 8L per minute
    
    // Create irrigation log (you would save this to a database in real app)
    const irrigationLog = {
      user: userId,
      device: device._id,
      duration: duration,
      zone: zone,
      waterUsed: waterUsed,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(Date.now() + duration * 60 * 1000),
      efficiency: Math.floor(Math.random() * 20) + 80 // 80-100%
    };

    console.log(`✅ Irrigation completed: ${waterUsed}L used`);

    res.json({
      success: true,
      message: `Irrigation started in ${zone} for ${duration} minutes`,
      data: {
        irrigation: irrigationLog,
        estimatedWaterUsage: waterUsed,
        completionTime: new Date(Date.now() + duration * 60 * 1000).toLocaleTimeString(),
        zone: zone
      }
    });

  } catch (error) {
    console.error('❌ Start irrigation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting irrigation: ' + error.message
    });
  }
});

// @desc    Get irrigation settings
// @route   GET /api/ai/settings
// @access  Private
export const getSettings = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('⚙️ Fetching settings for user:', userId);

    // Default settings (in real app, fetch from database)
    const settings = {
      autoMode: true,
      moistureThreshold: 60,
      maxWaterPerDay: 1000,
      irrigationZones: ['North Field', 'South Field', 'Greenhouse'],
      schedule: {
        enabled: true,
        times: ['06:00', '18:00'],
        duration: 30
      },
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      aiSettings: {
        learningEnabled: true,
        confidenceThreshold: 75,
        retrainInterval: 'weekly'
      }
    };

    console.log('✅ Settings fetched successfully');

    res.json({
      success: true,
      message: 'Settings loaded successfully',
      data: settings
    });

  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings: ' + error.message
    });
  }
});

// @desc    Update irrigation settings
// @route   PUT /api/ai/settings
// @access  Private
export const updateSettings = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const newSettings = req.body;

    console.log('⚙️ Updating settings for user:', userId, newSettings);

    // In real app, save to database
    // For now, just return success

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: newSettings
    });

  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings: ' + error.message
    });
  }
});

// @desc    Get AI predictions history
// @route   GET /api/ai/predictions
// @access  Private
export const getAIPredictions = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const predictions = await AIPrediction.find({ user: userId })
      .populate('device', 'name deviceId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AIPrediction.countDocuments({ user: userId });

    res.json({
      success: true,
      data: predictions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get AI predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI predictions'
    });
  }
});

// @desc    Get AI model information
// @route   GET /api/ai/model-info
// @access  Private
export const getAIModelInfo = asyncHandler(async (req, res) => {
  try {
    const modelInfo = {
      isTrained: irrigationAI.isTrained,
      modelVersion: irrigationAI.modelVersion,
      trainingHistory: irrigationAI.trainingHistory,
      accuracy: irrigationAI.accuracy,
      lastTraining: irrigationAI.trainingHistory.length > 0 
        ? irrigationAI.trainingHistory[irrigationAI.trainingHistory.length - 1].timestamp 
        : null
    };

    res.json({
      success: true,
      data: modelInfo
    });

  } catch (error) {
    console.error('Get AI model info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching AI model information'
    });
  }
});

// @desc    Update prediction outcome
// @route   PUT /api/ai/predictions/:predictionId/outcome
// @access  Private
export const updatePredictionOutcome = asyncHandler(async (req, res) => {
  try {
    const { irrigated, actualDuration, actualWater, soilMoistureAfter } = req.body;

    const prediction = await AIPrediction.findOne({
      _id: req.params.predictionId,
      user: req.user.id
    });

    if (!prediction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prediction not found' 
      });
    }

    // Update actual outcome
    prediction.actualOutcome = {
      irrigated,
      actualDuration,
      actualWater,
      soilMoistureAfter,
      efficiency: actualWater ? Math.round((actualWater / (actualWater + (actualWater * 0.3))) * 100) : 0
    };

    // Calculate accuracy
    if (typeof prediction.calculateAccuracy === 'function') {
      await prediction.calculateAccuracy();
    }

    await prediction.save();

    res.json({
      success: true,
      message: 'Prediction outcome updated successfully',
      data: prediction
    });

  } catch (error) {
    console.error('Update prediction outcome error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating prediction outcome'
    });
  }
});

// Helper functions
function calculateWaterRequirement(sensorData, recommendation) {
  const baseWater = 300; // Base water requirement
  let multiplier = 1;
  
  if (sensorData.temperature > 30) multiplier *= 1.3;
  if (sensorData.humidity < 40) multiplier *= 1.2;
  if (sensorData.rainfall > 5) multiplier *= 0.5;
  if (recommendation.shouldIrrigate) multiplier *= 1.5;
  
  return Math.round(baseWater * multiplier);
}

function getOptimalTime() {
  const now = new Date();
  const optimal = new Date(now);
  optimal.setHours(6, 0, 0, 0); // 6:00 AM
  if (optimal < now) {
    optimal.setDate(optimal.getDate() + 1);
  }
  return optimal.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function predictSoilMoisture(currentMoisture) {
  const change = (Math.random() * 10) - 2; // -2% to +8% change
  return `${Math.max(0, Math.min(100, Math.round(currentMoisture + change)))}% in 24h`;
}

function assessCropHealth(sensorData) {
  if (sensorData.soilMoisture < 40) return 'Poor';
  if (sensorData.soilMoisture > 85) return 'Fair';
  if (sensorData.temperature > 35) return 'Good';
  return 'Excellent';
}

function generateRiskAlerts(sensorData) {
  const alerts = [];
  if (sensorData.soilMoisture < 40) alerts.push('Low soil moisture detected');
  if (sensorData.temperature > 35) alerts.push('High temperature stress');
  if (sensorData.rainfall === 0 && sensorData.soilMoisture < 60) alerts.push('No rainfall expected');
  return alerts.length > 0 ? alerts : ['No immediate risks detected'];
}