import mqtt from 'mqtt';
import Device from '../models/Device.js';
import IrrigationLog from '../models/IrrigationLog.js';
import { irrigationAI } from './aiModel.js';

let mqttClient = null;
const connectedDevices = new Map();

export const connectMQTT = (io) => {
  try {
    const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://localhost:1883';
    
    console.log(`🔗 Connecting to MQTT Broker: ${MQTT_BROKER}`);
    
    mqttClient = mqtt.connect(MQTT_BROKER, {
      clientId: `smart_irrigation_server_${Math.random().toString(16).slice(3)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
    });

    mqttClient.on('connect', () => {
      console.log('✅ Connected to MQTT Broker');
      
      // Subscribe to topics
      mqttClient.subscribe('irrigation/sensor/+/data', { qos: 1 });
      mqttClient.subscribe('irrigation/device/+/status', { qos: 1 });
      mqttClient.subscribe('irrigation/control/+/response', { qos: 1 });
      mqttClient.subscribe('irrigation/+/alert', { qos: 2 });
      
      console.log('📡 Subscribed to MQTT topics');
    });

    mqttClient.on('message', async (topic, message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`📨 MQTT Message received on ${topic}:`, data);

        // Handle different message types
        if (topic.includes('sensor/data')) {
          await handleSensorData(topic, data, io);
        } else if (topic.includes('device/status')) {
          await handleDeviceStatus(topic, data, io);
        } else if (topic.includes('control/response')) {
          await handleControlResponse(topic, data, io);
        } else if (topic.includes('alert')) {
          await handleAlert(topic, data, io);
        }

      } catch (error) {
        console.error('❌ Error processing MQTT message:', error);
      }
    });

    mqttClient.on('error', (error) => {
      console.error('❌ MQTT Error:', error);
    });

    mqttClient.on('close', () => {
      console.log('🔌 MQTT Connection closed');
    });

    mqttClient.on('offline', () => {
      console.log('📴 MQTT Client offline');
    });

    return mqttClient;

  } catch (error) {
    console.error('❌ Failed to connect to MQTT:', error);
    return null;
  }
};

const handleSensorData = async (topic, data, io) => {
  const deviceId = topic.split('/')[2];
  
  try {
    // Update device with sensor data
    const device = await Device.findById(deviceId);
    if (!device) {
      console.log(`❌ Device ${deviceId} not found`);
      return;
    }

    // Update device data
    await device.updateSensorData(data);
    await device.updateStatus('online', data.battery, data.signalStrength);

    // Store connected device
    connectedDevices.set(deviceId, {
      lastUpdate: new Date(),
      data: data
    });

    // Get AI recommendation
    const recommendation = await irrigationAI.predictIrrigation(device, data);

    // Emit real-time data to frontend
    io.to(device.user.toString()).emit('sensor-update', {
      deviceId,
      data,
      recommendation,
      timestamp: new Date()
    });

    // Auto-irrigation based on AI recommendation and automation setting
    if (device.configuration.automation && recommendation.shouldIrrigate) {
      await handleAutoIrrigation(device, data, recommendation);
    }

    console.log(`✅ Sensor data processed for device ${deviceId}`);

  } catch (error) {
    console.error(`❌ Error handling sensor data for ${deviceId}:`, error);
  }
};

const handleAutoIrrigation = async (device, sensorData, recommendation) => {
  try {
    // Check if soil moisture is below threshold
    if (sensorData.soilMoisture < device.configuration.moistureThreshold) {
      console.log(`🚰 Auto-irrigation triggered for device ${device.deviceId}`);
      
      // Send irrigation command
      const command = {
        action: 'start',
        duration: recommendation.recommendedDuration,
        reason: 'auto_irrigation',
        timestamp: new Date().toISOString()
      };

      sendDeviceCommand(device._id, command);

      // Create irrigation log
      const irrigationLog = new IrrigationLog({
        device: device._id,
        user: device.user,
        type: 'smart',
        status: 'in_progress',
        duration: {
          planned: recommendation.recommendedDuration,
          actual: 0
        },
        sensorData: sensorData,
        aiRecommendation: recommendation,
        startTime: new Date()
      });

      await irrigationLog.save();

      // Schedule automatic stop
      setTimeout(async () => {
        try {
          const stopCommand = {
            action: 'stop',
            timestamp: new Date().toISOString()
          };
          
          sendDeviceCommand(device._id, stopCommand);

          irrigationLog.status = 'completed';
          irrigationLog.endTime = new Date();
          irrigationLog.duration.actual = recommendation.recommendedDuration;
          irrigationLog.waterUsed = recommendation.recommendedWater;
          irrigationLog.waterSaved = Math.round(recommendation.recommendedWater * 0.3); // Assume 30% savings
          
          await irrigationLog.save();

          console.log(`✅ Auto-irrigation completed for device ${device.deviceId}`);

        } catch (error) {
          console.error(`❌ Error stopping auto-irrigation:`, error);
        }
      }, recommendation.recommendedDuration * 60 * 1000);
    }

  } catch (error) {
    console.error('❌ Error in auto-irrigation:', error);
  }
};

const handleDeviceStatus = async (topic, data, io) => {
  const deviceId = topic.split('/')[2];
  
  try {
    const device = await Device.findByIdAndUpdate(
      deviceId,
      {
        status: data.status,
        battery: {
          level: data.battery,
          status: data.batteryStatus || 'discharging'
        },
        signalStrength: data.signalStrength || 'good',
        lastSeen: new Date()
      },
      { new: true }
    ).populate('user');

    if (device && device.user) {
      // Emit status update to frontend
      io.to(device.user._id.toString()).emit('device-status', {
        deviceId,
        status: data.status,
        battery: data.battery,
        signalStrength: data.signalStrength,
        timestamp: new Date()
      });

      console.log(`✅ Device status updated: ${deviceId} - ${data.status}`);
    }

  } catch (error) {
    console.error(`❌ Error handling device status for ${deviceId}:`, error);
  }
};

const handleControlResponse = async (topic, data, io) => {
  const deviceId = topic.split('/')[2];
  
  try {
    const device = await Device.findById(deviceId).populate('user');
    if (device && device.user) {
      io.to(device.user._id.toString()).emit('control-response', {
        deviceId,
        ...data,
        timestamp: new Date()
      });

      console.log(`✅ Control response from ${deviceId}:`, data.action);
    }

  } catch (error) {
    console.error(`❌ Error handling control response for ${deviceId}:`, error);
  }
};

const handleAlert = async (topic, data, io) => {
  const deviceId = topic.split('/')[1];
  
  try {
    const device = await Device.findById(deviceId).populate('user');
    if (device && device.user) {
      // Emit alert to frontend
      io.to(device.user._id.toString()).emit('device-alert', {
        deviceId,
        ...data,
        timestamp: new Date()
      });

      console.log(`🚨 Alert from device ${deviceId}:`, data.message);

      // TODO: Send email/notification for critical alerts
      if (data.severity === 'critical') {
        await sendCriticalAlert(device, data);
      }
    }

  } catch (error) {
    console.error(`❌ Error handling alert for ${deviceId}:`, error);
  }
};

const sendCriticalAlert = async (device, alert) => {
  // Implement email/push notification for critical alerts
  console.log(`📧 CRITICAL ALERT - Device: ${device.name}, Message: ${alert.message}`);
};

// Send command to IoT device
export const sendDeviceCommand = (deviceId, command) => {
  if (mqttClient && mqttClient.connected) {
    const topic = `irrigation/control/${deviceId}/command`;
    
    const message = {
      ...command,
      serverTime: new Date().toISOString()
    };

    mqttClient.publish(topic, JSON.stringify(message), { qos: 1 }, (error) => {
      if (error) {
        console.error(`❌ Failed to send command to ${deviceId}:`, error);
        return false;
      }
      console.log(`✅ Command sent to ${deviceId}:`, command.action);
      return true;
    });
    
    return true;
  } else {
    console.error('❌ MQTT client not connected');
    return false;
  }
};

// Get connected devices
export const getConnectedDevices = () => {
  return Array.from(connectedDevices.entries()).map(([deviceId, data]) => ({
    deviceId,
    ...data
  }));
};

// Check device connectivity
export const checkDeviceStatus = async (deviceId) => {
  const deviceData = connectedDevices.get(deviceId);
  if (!deviceData) return 'offline';

  const timeSinceLastUpdate = new Date() - deviceData.lastUpdate;
  return timeSinceLastUpdate < 5 * 60 * 1000 ? 'online' : 'offline'; // 5 minutes threshold
};