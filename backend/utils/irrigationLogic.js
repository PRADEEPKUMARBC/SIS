import Device from '../models/Device.js';
import IrrigationLog from '../models/IrrigationLog.js';
import { sendDeviceCommand } from './mqttHandler.js';

class IrrigationLogic {
  constructor() {
    this.activeIrrigations = new Map();
  }

  async startIrrigation(deviceId, duration, type = 'manual', userId) {
    try {
      const device = await Device.findById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      // Check if device is already irrigating
      if (this.activeIrrigations.has(deviceId)) {
        throw new Error('Device is already irrigating');
      }

      // Create irrigation log
      const irrigationLog = new IrrigationLog({
        device: deviceId,
        user: userId,
        type,
        status: 'in_progress',
        duration: {
          planned: duration,
          actual: 0
        },
        startTime: new Date(),
        sensorData: device.lastSensorData || {}
      });

      await irrigationLog.save();

      // Send command to IoT device
      const command = {
        action: 'start',
        duration: duration,
        logId: irrigationLog._id.toString(),
        timestamp: new Date().toISOString()
      };

      const commandSent = sendDeviceCommand(deviceId, command);

      if (!commandSent) {
        irrigationLog.status = 'failed';
        await irrigationLog.save();
        throw new Error('Failed to send command to device');
      }

      // Track active irrigation
      this.activeIrrigations.set(deviceId, {
        logId: irrigationLog._id,
        startTime: new Date(),
        plannedDuration: duration,
        timeout: setTimeout(() => {
          this.stopIrrigation(deviceId, 'completed');
        }, duration * 60 * 1000) // Convert minutes to milliseconds
      });

      return {
        success: true,
        message: 'Irrigation started successfully',
        logId: irrigationLog._id,
        estimatedEnd: new Date(Date.now() + duration * 60 * 1000)
      };

    } catch (error) {
      console.error('Error starting irrigation:', error);
      throw error;
    }
  }

  async stopIrrigation(deviceId, status = 'completed') {
    try {
      const irrigationData = this.activeIrrigations.get(deviceId);
      if (!irrigationData) {
        throw new Error('No active irrigation found for this device');
      }

      // Clear timeout
      clearTimeout(irrigationData.timeout);

      // Calculate actual duration
      const actualDuration = Math.round(
        (new Date() - irrigationData.startTime) / (1000 * 60)
      );

      // Update irrigation log
      const irrigationLog = await IrrigationLog.findById(irrigationData.logId);
      if (irrigationLog) {
        irrigationLog.status = status;
        irrigationLog.endTime = new Date();
        irrigationLog.duration.actual = actualDuration;
        
        // Calculate water usage (simplified calculation)
        irrigationLog.waterUsed = this.calculateWaterUsage(actualDuration);
        irrigationLog.waterSaved = this.calculateWaterSaved(irrigationLog);
        
        await irrigationLog.save();
      }

      // Send stop command to device
      const command = {
        action: 'stop',
        timestamp: new Date().toISOString()
      };

      sendDeviceCommand(deviceId, command);

      // Remove from active irrigations
      this.activeIrrigations.delete(deviceId);

      return {
        success: true,
        message: `Irrigation ${status} successfully`,
        actualDuration,
        waterUsed: irrigationLog?.waterUsed || 0
      };

    } catch (error) {
      console.error('Error stopping irrigation:', error);
      throw error;
    }
  }

  calculateWaterUsage(durationMinutes) {
    // Assume flow rate of 10 liters per minute
    const flowRate = 10;
    return Math.round(durationMinutes * flowRate);
  }

  calculateWaterSaved(irrigationLog) {
    // Compare with traditional irrigation (assume 30% more water used)
    const traditionalUsage = irrigationLog.waterUsed * 1.3;
    return Math.round(traditionalUsage - irrigationLog.waterUsed);
  }

  async getActiveIrrigations() {
    return Array.from(this.activeIrrigations.entries()).map(([deviceId, data]) => ({
      deviceId,
      ...data
    }));
  }

  async emergencyStopAll(userId) {
    try {
      const results = [];
      
      for (const [deviceId] of this.activeIrrigations) {
        try {
          const result = await this.stopIrrigation(deviceId, 'cancelled');
          results.push({
            deviceId,
            success: true,
            ...result
          });
        } catch (error) {
          results.push({
            deviceId,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        message: 'Emergency stop executed',
        results
      };

    } catch (error) {
      console.error('Error in emergency stop:', error);
      throw error;
    }
  }
}

export const irrigationLogic = new IrrigationLogic();