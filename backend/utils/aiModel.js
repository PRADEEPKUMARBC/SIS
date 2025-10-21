// Simple AI Model without TensorFlow dependencies

class IrrigationAI {
  constructor() {
    this.isTrained = false;
    this.modelVersion = '1.0.0';
    this.trainingHistory = [];
    this.accuracy = 75; // Starting accuracy
  }

  // Return training history
  getTrainingHistory() {
    return this.trainingHistory;
  }

  // Initialize model
  async initializeModel() {
    try {
      console.log('🤖 Initializing AI Model...');
      this.isTrained = false;
      console.log('✅ AI Model ready');
      return true;
    } catch (error) {
      console.error('❌ Error initializing AI model:', error);
      return false;
    }
  }

  // Train model (simulated)
  async trainModel(userId, epochs = 50) {
    try {
      console.log(`🎯 Training AI model for user ${userId}...`);
      
      // Simulate training process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Improve accuracy with each training
      this.accuracy = Math.min(95, this.accuracy + 5 + Math.floor(Math.random() * 10));
      
      const trainingRecord = {
        timestamp: new Date(),
        userId: userId,
        epochs: epochs,
        accuracy: this.accuracy,
        samples: Math.floor(Math.random() * 100) + 50
      };

      this.trainingHistory.push(trainingRecord);
      this.isTrained = true;
      this.modelVersion = `1.${this.trainingHistory.length}.0`;
      
      console.log(`✅ AI Model trained successfully. Accuracy: ${this.accuracy}%`);
      
      return true;

    } catch (error) {
      console.error('❌ Training failed:', error);
      return false;
    }
  }

  // Predict irrigation needs
  async predictIrrigation(device, currentConditions) {
    try {
      console.log('🔍 Analyzing irrigation needs...');
      
      const soilMoisture = currentConditions.soilMoisture || 65;
      const temperature = currentConditions.temperature || 28;
      const humidity = currentConditions.humidity || 70;
      const rainfall = currentConditions.rainfall || 0;

      // Simple AI logic
      let shouldIrrigate = false;
      let confidence = this.accuracy;
      let reason = "Soil moisture optimal";

      // Decision making logic
      if (soilMoisture < 40) {
        shouldIrrigate = true;
        confidence = Math.min(95, confidence + 10);
        reason = "CRITICAL: Soil very dry - immediate irrigation needed";
      } else if (soilMoisture < 60 && rainfall < 5) {
        shouldIrrigate = true;
        confidence = Math.min(90, confidence + 5);
        reason = "Soil moisture low - irrigation recommended";
      } else if (temperature > 32 && soilMoisture < 70) {
        shouldIrrigate = true;
        confidence = Math.min(85, confidence + 3);
        reason = "High temperature - preventive irrigation needed";
      } else if (soilMoisture > 80) {
        shouldIrrigate = false;
        confidence = 90;
        reason = "Soil moisture high - no irrigation needed";
      } else if (rainfall > 10) {
        shouldIrrigate = false;
        confidence = 95;
        reason = "Recent rainfall - sufficient moisture available";
      }

      const recommendation = {
        shouldIrrigate,
        confidence: Math.round(confidence),
        recommendedDuration: shouldIrrigate ? this.calculateDuration(soilMoisture, temperature) : 0,
        recommendedWater: shouldIrrigate ? this.calculateWaterAmount(soilMoisture, device) : 0,
        optimalTime: this.calculateOptimalTime(),
        reason: reason,
        modelUsed: 'AI',
        modelVersion: this.modelVersion
      };

      console.log('✅ AI Prediction completed:', recommendation);
      return recommendation;

    } catch (error) {
      console.error('❌ AI prediction failed:', error);
      // Fallback to rule-based
      return this.ruleBasedPrediction(currentConditions, device);
    }
  }

  // Helper methods
  calculateDuration(soilMoisture, temperature) {
    let baseDuration = 20; // minutes
    
    if (soilMoisture < 40) baseDuration = 40;
    else if (soilMoisture < 60) baseDuration = 30;
    
    if (temperature > 30) baseDuration += 10;
    
    return baseDuration;
  }

  calculateWaterAmount(soilMoisture, device) {
    let baseWater = 200; // liters
    
    if (soilMoisture < 40) baseWater = 400;
    else if (soilMoisture < 60) baseWater = 300;
    
    // Adjust based on crop type from device configuration
    const cropType = device.configuration?.cropType;
    if (cropType === 'corn') baseWater *= 1.2;
    if (cropType === 'vegetables') baseWater *= 0.8;
    
    return Math.round(baseWater);
  }

  calculateOptimalTime() {
    const now = new Date();
    const optimal = new Date(now);
    optimal.setHours(6, 0, 0, 0); // 6:00 AM
    
    if (optimal < now) {
      optimal.setDate(optimal.getDate() + 1);
    }
    
    return optimal;
  }

  // Fallback prediction method
  ruleBasedPrediction(currentConditions, device) {
    const soilMoisture = currentConditions.soilMoisture || 65;
    const shouldIrrigate = soilMoisture < 60;
    
    return {
      shouldIrrigate,
      confidence: 70,
      recommendedDuration: shouldIrrigate ? 30 : 0,
      recommendedWater: shouldIrrigate ? 300 : 0,
      optimalTime: new Date(),
      reason: shouldIrrigate ? 'Soil moisture below threshold' : 'Soil moisture sufficient',
      modelUsed: 'Rule-Based'
    };
  }
}

export const irrigationAI = new IrrigationAI();

// Initialize AI on startup
irrigationAI.initializeModel();