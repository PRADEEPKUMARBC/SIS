import Device from '../models/Device.js';
import { sendDeviceCommand } from '../utils/mqttHandler.js';

export const getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: devices.length,
      devices
    });

  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching devices'
    });
  }
};

export const getDevice = async (req, res) => {
  try {
    const device = await Device.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      device
    });

  } catch (error) {
    console.error('Get device error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching device'
    });
  }
};

export const addDevice = async (req, res) => {
  try {
    const { deviceId, name, farm, type, location, configuration } = req.body;

    // Validation
    if (!deviceId || !name || !farm) {
      return res.status(400).json({
        success: false,
        message: 'Please provide deviceId, name, and farm'
      });
    }

    // Check if device ID already exists
    const existingDevice = await Device.findOne({ deviceId });
    if (existingDevice) {
      return res.status(400).json({
        success: false,
        message: 'Device with this ID already exists'
      });
    }

    const device = await Device.create({
      deviceId: deviceId.toUpperCase(),
      name,
      user: req.user.id,
      farm,
      type: type || 'sensor',
      location,
      configuration: configuration || {
        irrigationDuration: 30,
        moistureThreshold: 60,
        automation: true,
        cropType: 'vegetables',
        soilType: 'loam'
      }
    });

    // Populate user data
    await device.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Device added successfully',
      device
    });

  } catch (error) {
    console.error('Add device error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Device ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error adding device'
    });
  }
};

export const updateDevice = async (req, res) => {
  try {
    const { name, farm, location, configuration, status } = req.body;

    const device = await Device.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, farm, location, configuration, status },
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Device updated successfully',
      device
    });

  } catch (error) {
    console.error('Update device error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating device'
    });
  }
};

export const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    res.json({
      success: true,
      message: 'Device deleted successfully'
    });

  } catch (error) {
    console.error('Delete device error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting device'
    });
  }
};

export const sendCommandToDevice = async (req, res) => {
  try {
    const { action, duration, data } = req.body;
    
    const device = await Device.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }

    const command = {
      action,
      duration,
      ...data,
      timestamp: new Date().toISOString()
    };

    const commandSent = sendDeviceCommand(device._id, command); // imported from mqttHandler

    if (!commandSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send command to device. Device might be offline.'
      });
    }

    res.json({
      success: true,
      message: `Command '${action}' sent to device`,
      command
    });

  } catch (error) {
    console.error('Send device command error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending command to device'
    });
  }
};


export const getDeviceStats = async (req, res) => {
  try {
    const devices = await Device.find({ user: req.user.id });
    
    const stats = {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      maintenance: devices.filter(d => d.status === 'maintenance').length,
      error: devices.filter(d => d.status === 'error').length,
      byType: {
        sensor: devices.filter(d => d.type === 'sensor').length,
        controller: devices.filter(d => d.type === 'controller').length,
        gateway: devices.filter(d => d.type === 'gateway').length
      },
      lowBattery: devices.filter(d => d.battery.level < 20).length
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get device stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching device statistics'
    });
  }
};