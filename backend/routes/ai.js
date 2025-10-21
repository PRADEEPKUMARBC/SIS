import express from 'express';
import AIPrediction from '../models/AIPrediction.js';
import AITraining from '../models/AITraining.js';

const router = express.Router();

// Get AI recommendations
router.get('/recommendations', async (req, res) => {
  try {
    // Simulate AI analysis (replace with actual ML model)
    const soilMoisture = Math.random() * 30 + 50; // 50-80%
    const temperature = Math.random() * 10 + 22; // 22-32°C
    const humidity = Math.random() * 30 + 50; // 50-80%
    
    const shouldIrrigate = soilMoisture < 60;
    const confidence = Math.random() * 15 + 80; // 80-95%
    
    const recommendation = {
      recommendation: shouldIrrigate 
        ? "Irrigation recommended. Soil moisture is below optimal level." 
        : "No irrigation needed. Soil moisture levels are optimal.",
      confidence: Math.round(confidence),
      waterRequirement: shouldIrrigate ? Math.round(Math.random() * 100 + 400) : 0, // 400-500L
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

// Train AI model
router.post('/train', async (req, res) => {
  try {
    const { epochs, userId } = req.body;
    
    // Simulate training process
    console.log(`🤖 Training AI model with ${epochs} epochs...`);
    
    // Simulate training progress
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const trainingResult = {
      success: true,
      accuracy: 0.92,
      loss: 0.08,
      epochs: epochs,
      duration: '2m 30s',
      modelVersion: 'v2.1.0',
      message: 'AI model trained successfully'
    };

    // Save training session to database
    const trainingSession = new AITraining({
      userId,
      epochs,
      accuracy: trainingResult.accuracy,
      loss: trainingResult.loss,
      duration: trainingResult.duration,
      modelVersion: trainingResult.modelVersion,
      timestamp: new Date()
    });
    
    await trainingSession.save();

    console.log('✅ AI training session saved to database');

    res.json(trainingResult);
  } catch (error) {
    console.error('❌ AI training error:', error);
    res.status(500).json({
      success: false,
      message: "AI training failed"
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
      userId: sessionData.userId,
      epochs: sessionData.epochs,
      accuracy: sessionData.accuracy,
      loss: sessionData.loss,
      duration: sessionData.duration,
      modelVersion: sessionData.modelVersion,
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
    
    // You can create an IrrigationEvent model or use AIPrediction
    const irrigationEvent = new AIPrediction({
      userId: eventData.userId,
      fieldId: 'irrigation-event',
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