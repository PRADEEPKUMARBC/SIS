import express from 'express';
import AIPrediction from '../models/AIPrediction.js';
import AITraining from '../models/AITraining.js';

const router = express.Router();

// ==================== AI SETTINGS ROUTES ====================

// Get AI settings
router.get('/settings', async (req, res) => {
  try {
    const aiSettings = {
      modelVersion: 'v2.1.0',
      irrigationThreshold: 60,
      temperatureThreshold: 35,
      humidityThreshold: 30,
      predictionInterval: 30,
      dataRetentionDays: 90,
      autoTraining: true,
      confidenceThreshold: 75,
      weatherIntegration: true,
      sensorCalibration: {
        soilMoisture: 1.0,
        temperature: 1.0,
        humidity: 1.0
      },
      notificationSettings: {
        emailAlerts: true,
        pushNotifications: true,
        smsAlerts: false
      }
    };

    console.log('🔧 AI settings requested');

    res.json({
      success: true,
      data: aiSettings,
      message: "AI settings loaded successfully"
    });
  } catch (error) {
    console.error('❌ Get AI settings error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load AI settings"
    });
  }
});

// Update AI settings
router.put('/settings', async (req, res) => {
  try {
    const updatedSettings = req.body;
    
    console.log('🔧 Updating AI settings:', updatedSettings);

    res.json({
      success: true,
      message: "AI settings updated successfully",
      data: updatedSettings
    });
  } catch (error) {
    console.error('❌ Update AI settings error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update AI settings"
    });
  }
});

// Reset AI settings to default
router.post('/settings/reset', async (req, res) => {
  try {
    console.log('🔧 Resetting AI settings to default');

    const defaultSettings = {
      modelVersion: 'v2.1.0',
      irrigationThreshold: 60,
      temperatureThreshold: 35,
      humidityThreshold: 30,
      predictionInterval: 30,
      dataRetentionDays: 90,
      autoTraining: true,
      confidenceThreshold: 75
    };

    res.json({
      success: true,
      data: defaultSettings,
      message: "AI settings reset to default"
    });
  } catch (error) {
    console.error('❌ Reset AI settings error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to reset AI settings"
    });
  }
});

// ==================== PROFILE ROUTES ====================

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userProfile = {
      success: true,
      data: {
        userId: "user-123",
        name: "John Doe",
        email: "john@example.com",
        farmName: "Green Valley Farm",
        location: "California, USA",
        crops: ["Wheat", "Corn", "Soybean"],
        irrigationSystems: 3,
        totalArea: "50 acres",
        joinedDate: "2024-01-15",
        subscription: "Premium",
        settings: {
          notifications: true,
          autoIrrigation: false,
          units: "metric"
        },
        stats: {
          predictions: 45,
          irrigations: 23,
          waterSaved: "12,500L",
          efficiency: "92%"
        }
      },
      message: "Profile loaded successfully"
    };

    console.log('👤 User profile requested');
    
    res.json(userProfile);
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load profile"
    });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const updates = req.body;
    
    console.log('👤 Updating user profile:', updates);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updates
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile"
    });
  }
});

// Get user settings
router.get('/profile/settings', async (req, res) => {
  try {
    const userSettings = {
      success: true,
      data: {
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        irrigation: {
          autoMode: false,
          threshold: 60,
          schedule: "06:00 AM"
        },
        units: {
          temperature: "celsius",
          distance: "metric",
          volume: "liters"
        },
        privacy: {
          dataSharing: true,
          analytics: true
        }
      },
      message: "Settings loaded successfully"
    };

    res.json(userSettings);
  } catch (error) {
    console.error('❌ Get settings error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load settings"
    });
  }
});

// Update user settings
router.put('/profile/settings', async (req, res) => {
  try {
    const settings = req.body;
    
    console.log('👤 Updating user settings:', settings);

    res.json({
      success: true,
      message: "Settings updated successfully",
      data: settings
    });
  } catch (error) {
    console.error('❌ Update settings error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to update settings"
    });
  }
});

// ==================== IRRIGATION CONTROL ROUTES ====================

// Start Irrigation Route
router.post('/start-irrigation', async (req, res) => {
  try {
    const { duration, zone, waterAmount, optimalTime, aiConfidence } = req.body;

    console.log(`🚰 Starting irrigation in ${zone} for ${duration} mins using ${waterAmount}L water.`);

    // You can simulate or connect with IoT pump hardware here
    // For now, we'll simulate success
    const irrigationEvent = {
      zone,
      duration,
      waterAmount,
      optimalTime,
      aiConfidence,
      startedAt: new Date(),
      status: "Irrigation started successfully",
    };

    // Save event to database
    const irrigationRecord = new AIPrediction({
      userId: "system-user",
      fieldId: zone,
      predictionType: "irrigation_start",
      recommendation: `Irrigation started in ${zone} for ${duration} minutes`,
      confidence: aiConfidence || 85,
      waterRequirement: waterAmount,
      optimalIrrigationTime: optimalTime || new Date().toLocaleTimeString(),
      soilMoisturePrediction: "Monitoring in progress",
      cropHealth: "Good",
      riskAlerts: [],
      recommendations: ["Monitor water flow", "Check soil moisture after irrigation"],
      sensorData: {},
      shouldIrrigate: true,
      timestamp: new Date()
    });

    await irrigationRecord.save();

    console.log('✅ Irrigation event saved to database');

    res.json({
      success: true,
      message: `Irrigation started in ${zone}`,
      data: irrigationEvent,
    });
  } catch (error) {
    console.error("❌ Irrigation start error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to start irrigation",
    });
  }
});

// Stop Irrigation Route
router.post('/stop-irrigation', async (req, res) => {
  try {
    const { zone } = req.body;

    console.log(`🛑 Stopping irrigation in ${zone}`);

    const stopEvent = {
      zone,
      stoppedAt: new Date(),
      status: "Irrigation stopped successfully",
    };

    res.json({
      success: true,
      message: `Irrigation stopped in ${zone}`,
      data: stopEvent,
    });
  } catch (error) {
    console.error("❌ Irrigation stop error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to stop irrigation",
    });
  }
});

// Get irrigation status
router.get('/irrigation-status', async (req, res) => {
  try {
    const status = {
      success: true,
      data: {
        zone1: { status: "idle", lastWatered: "2024-01-15T08:00:00Z" },
        zone2: { status: "active", duration: "15 mins", waterUsed: "250L" },
        zone3: { status: "idle", lastWatered: "2024-01-14T18:30:00Z" }
      },
      message: "Irrigation status retrieved successfully"
    };

    res.json(status);
  } catch (error) {
    console.error("❌ Get irrigation status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get irrigation status",
    });
  }
});

// ==================== EXISTING ROUTES ====================

// Get AI recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const soilMoisture = Math.random() * 30 + 50;
    const temperature = Math.random() * 10 + 22;
    const humidity = Math.random() * 30 + 50;
    
    const shouldIrrigate = soilMoisture < 60;
    const confidence = Math.random() * 15 + 80;
    
    const recommendation = {
      recommendation: shouldIrrigate 
        ? "Irrigation recommended. Soil moisture is below optimal level." 
        : "No irrigation needed. Soil moisture levels are optimal.",
      confidence: Math.round(confidence),
      waterRequirement: shouldIrrigate ? Math.round(Math.random() * 100 + 400) : 0,
      optimalIrrigationTime: shouldIrrigate ? "06:00 AM" : "Not needed",
      soilMoisturePrediction: `${Math.round(soilMoisture + 5)}% in 24h`,
      cropHealth: "Excellent",
      riskAlerts: shouldIrrigate ? ["Low soil moisture"] : ["No immediate risks"],
      recommendations: shouldIrrigate 
        ? ["Irrigate in the morning", "Check soil sensors"] 
        : ["Continue monitoring", "Check weather forecast"],
      sensorData: {
        soilMoisture: Math.round(soilMoisture),
        temperature: Math.round(temperature),
        humidity: Math.round(humidity)
      },
      shouldIrrigate,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: recommendation,
      message: "AI analysis completed successfully"
    });
  } catch (error) {
    console.error('❌ AI recommendations error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI recommendations"
    });
  }
});

// Train AI model - WORKING VERSION
router.post('/train', async (req, res) => {
  try {
    const { epochs, userId } = req.body;
    
    console.log(`🤖 Training AI model with ${epochs} epochs for user: ${userId}`);
    
    // Validate input
    if (!epochs) {
      return res.status(400).json({
        success: false,
        message: "Epochs parameter is required"
      });
    }

    // Simulate training process
    console.log('🔄 Training in progress...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const trainingResult = {
      success: true,
      accuracy: 0.92,
      loss: 0.08,
      epochs: epochs,
      duration: '2m 30s',
      modelVersion: 'v2.1.0',
      message: 'AI model trained successfully'
    };

    // Save training session to database with proper userId handling
    const trainingSession = new AITraining({
      userId: userId || 'default-user',
      epochs: epochs,
      accuracy: trainingResult.accuracy,
      loss: trainingResult.loss,
      duration: trainingResult.duration,
      modelVersion: trainingResult.modelVersion,
      status: 'completed',
      timestamp: new Date()
    });
    
    await trainingSession.save();

    console.log('✅ AI training session saved to database with ID:', trainingSession._id);

    res.json(trainingResult);
  } catch (error) {
    console.error('❌ AI training error:', error);
    
    // More specific error messages
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: `Training validation error: ${error.message}`,
        error: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: "AI training failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Save AI prediction
router.post('/predictions', async (req, res) => {
  try {
    const predictionData = req.body;
    
    const prediction = new AIPrediction({
      userId: predictionData.userId,
      fieldId: predictionData.fieldId,
      predictionType: predictionData.predictionType,
      recommendation: predictionData.recommendation,
      confidence: predictionData.confidence,
      waterRequirement: predictionData.waterRequirement,
      optimalIrrigationTime: predictionData.optimalIrrigationTime,
      soilMoisturePrediction: predictionData.soilMoisturePrediction,
      cropHealth: predictionData.cropHealth,
      riskAlerts: predictionData.riskAlerts,
      recommendations: predictionData.recommendations,
      sensorData: predictionData.sensorData,
      shouldIrrigate: predictionData.shouldIrrigate,
      timestamp: new Date(predictionData.timestamp)
    });

    await prediction.save();

    console.log('✅ AI prediction saved to database');

    res.json({
      success: true,
      message: "AI prediction saved successfully",
      data: prediction
    });
  } catch (error) {
    console.error('❌ Save prediction error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to save AI prediction"
    });
  }
});

// Get AI predictions history
router.get('/predictions', async (req, res) => {
  try {
    const predictions = await AIPrediction.find()
      .sort({ timestamp: -1 })
      .limit(10);
    
    console.log(`📊 Loaded ${predictions.length} AI predictions from database`);

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('❌ Get predictions error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load predictions"
    });
  }
});

// Quick AI analysis
router.post('/quick-analysis', async (req, res) => {
  try {
    const { sensorData, weatherForecast, cropType } = req.body;
    
    // Simulate quick AI analysis
    const quickAnalysis = {
      recommendation: "Quick analysis: Conditions look favorable. Monitor soil moisture.",
      confidence: 88,
      waterRequirement: 420,
      optimalIrrigationTime: "07:00 AM",
      soilMoisturePrediction: "68% in 12h",
      analysisType: "quick_analysis",
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Quick AI analysis completed');

    res.json({
      success: true,
      data: quickAnalysis,
      message: "Quick analysis completed"
    });
  } catch (error) {
    console.error('❌ Quick analysis error:', error);
    res.status(500).json({
      success: false,
      message: "Quick analysis failed"
    });
  }
});

// Get training sessions history
router.get('/training-sessions', async (req, res) => {
  try {
    const sessions = await AITraining.find()
      .sort({ timestamp: -1 })
      .limit(10);
    
    console.log(`📈 Loaded ${sessions.length} training sessions from database`);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('❌ Get training sessions error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to load training sessions"
    });
  }
});

// Save training session (for external calls)
router.post('/training-sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    
    const trainingSession = new AITraining({
      userId: sessionData.userId || 'default-user',
      epochs: sessionData.epochs,
      accuracy: sessionData.accuracy || 0.85,
      loss: sessionData.loss || 0.15,
      duration: sessionData.duration || '1m 30s',
      modelVersion: sessionData.modelVersion || 'v2.1.0',
      status: 'completed',
      timestamp: new Date(sessionData.timestamp || Date.now())
    });

    await trainingSession.save();

    console.log('✅ Training session saved to database');

    res.json({
      success: true,
      message: "Training session saved successfully",
      data: trainingSession
    });
  } catch (error) {
    console.error('❌ Save training session error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to save training session"
    });
  }
});

// Save irrigation event
router.post('/irrigation-events', async (req, res) => {
  try {
    const eventData = req.body;
    
    const irrigationEvent = new AIPrediction({
      userId: eventData.userId || 'system-user',
      fieldId: eventData.zone || 'irrigation-event',
      predictionType: 'irrigation_execution',
      recommendation: `Irrigation executed in ${eventData.zone}`,
      confidence: eventData.aiConfidence || 85,
      waterRequirement: eventData.waterUsed,
      optimalIrrigationTime: 'Executed',
      soilMoisturePrediction: 'Updated after irrigation',
      cropHealth: 'Good',
      riskAlerts: [],
      recommendations: ['Monitor soil moisture changes'],
      sensorData: {},
      shouldIrrigate: false,
      timestamp: new Date(eventData.timestamp || Date.now())
    });

    await irrigationEvent.save();

    console.log('✅ Irrigation event saved to database');

    res.json({
      success: true,
      message: "Irrigation event saved successfully",
      data: irrigationEvent
    });
  } catch (error) {
    console.error('❌ Save irrigation event error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to save irrigation event"
    });
  }
});

export default router;