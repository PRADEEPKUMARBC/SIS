// backend/utils/aiStatus.js
import { irrigationAI } from './aiModel.js';

export const checkAIIntegration = () => {
  console.log('\n🤖 AI INTEGRATION STATUS REPORT:');
  
  console.log('✅ AI Class: LOADED');
  
  if (irrigationAI.model) {
    console.log('✅ TensorFlow Model: INITIALIZED');
    console.log('📊 Model Layers:', irrigationAI.model.layers.length);
  } else {
    console.log('❌ TensorFlow Model: NOT INITIALIZED');
  }
  
  if (irrigationAI.isTrained) {
    console.log('✅ Model Training: COMPLETED');
    console.log('📈 Training History:', irrigationAI.trainingHistory.length, 'sessions');
  } else {
    console.log('⚠️ Model Training: NOT TRAINED (will train on first prediction)');
  }
  
  console.log('🔢 Model Version:', irrigationAI.modelVersion);
  
  return {
    modelInitialized: !!irrigationAI.model,
    isTrained: irrigationAI.isTrained,
    modelVersion: irrigationAI.modelVersion,
    trainingSessions: irrigationAI.trainingHistory.length
  };
};