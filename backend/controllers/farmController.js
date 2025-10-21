// controllers/farmController.js
import Farm from '../models/Farm.js';
import Device from '../models/Device.js';

export const getFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user.id }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: farms.length,
      farms
    });
  } catch (error) {
    console.error('Get farms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farms'
    });
  }
};

export const getFarm = async (req, res) => {
  try {
    const farm = await Farm.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Get devices associated with this farm
    const devices = await Device.find({ 
      farm: farm._id,
      user: req.user.id 
    });

    res.json({
      success: true,
      farm: {
        ...farm.toObject(),
        deviceCount: devices.length,
        devices
      }
    });
  } catch (error) {
    console.error('Get farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farm'
    });
  }
};

export const addFarm = async (req, res) => {
  try {
    const { name, location, crops, soilType, size } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Farm name is required'
      });
    }

    if (!location || !location.address) {
      return res.status(400).json({
        success: false,
        message: 'Farm location address is required'
      });
    }

    const farm = await Farm.create({
      name,
      user: req.user.id,
      location: {
        address: location.address,
        lat: location.lat || null,
        lng: location.lng || null,
        size: size || null,
        zone: location.zone || ''
      },
      crops: crops || [],
      soilType: soilType || 'loam'
    });

    // Populate user data
    await farm.populate('user', 'name email');

    res.status(201).json({
      success: true,
      message: 'Farm created successfully',
      farm
    });
  } catch (error) {
    console.error('Add farm error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Farm with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating farm'
    });
  }
};

export const updateFarm = async (req, res) => {
  try {
    const { name, location, crops, soilType, size } = req.body;

    const farm = await Farm.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { 
        name,
        location: {
          address: location?.address,
          lat: location?.lat,
          lng: location?.lng,
          size: size,
          zone: location?.zone
        },
        crops,
        soilType
      },
      { new: true, runValidators: true }
    );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.json({
      success: true,
      message: 'Farm updated successfully',
      farm
    });
  } catch (error) {
    console.error('Update farm error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Farm with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating farm'
    });
  }
};

export const deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Optional: Handle devices associated with this farm
    // You can either delete them or set their farm to null
    await Device.updateMany(
      { farm: req.params.id, user: req.user.id },
      { $unset: { farm: "" } }
    );

    res.json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (error) {
    console.error('Delete farm error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting farm'
    });
  }
};

export const getFarmStats = async (req, res) => {
  try {
    const farmId = req.params.id;
    
    // Verify farm belongs to user
    const farm = await Farm.findOne({ _id: farmId, user: req.user.id });
    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    // Get devices for this farm
    const devices = await Device.find({ farm: farmId, user: req.user.id });
    
    // Get sensor data statistics
    const stats = {
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => d.status === 'online').length,
      offlineDevices: devices.filter(d => d.status === 'offline').length,
      deviceTypes: {
        sensor: devices.filter(d => d.type === 'sensor').length,
        controller: devices.filter(d => d.type === 'controller').length,
        gateway: devices.filter(d => d.type === 'gateway').length
      },
      averageMoisture: 0,
      averageTemperature: 0,
      irrigationEvents: 0 // You can track this from your irrigation logs
    };

    // Calculate average sensor readings
    const moistureReadings = devices
      .map(d => d.lastSensorData?.soilMoisture)
      .filter(val => val && val > 0);
    
    const temperatureReadings = devices
      .map(d => d.lastSensorData?.temperature)
      .filter(val => val && val > 0);

    if (moistureReadings.length > 0) {
      stats.averageMoisture = moistureReadings.reduce((a, b) => a + b, 0) / moistureReadings.length;
    }

    if (temperatureReadings.length > 0) {
      stats.averageTemperature = temperatureReadings.reduce((a, b) => a + b, 0) / temperatureReadings.length;
    }

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get farm stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farm statistics'
    });
  }
};

export const getUserFarmStats = async (req, res) => {
  try {
    const farms = await Farm.find({ user: req.user.id });
    const devices = await Device.find({ user: req.user.id });

    const stats = {
      totalFarms: farms.length,
      totalDevices: devices.length,
      onlineDevices: devices.filter(d => d.status === 'online').length,
      farmsWithDevices: new Set(devices.map(d => d.farm).filter(Boolean)).size,
      crops: {},
      soilTypes: {}
    };

    // Count crops across all farms
    farms.forEach(farm => {
      farm.crops.forEach(crop => {
        stats.crops[crop] = (stats.crops[crop] || 0) + 1;
      });
      
      if (farm.soilType) {
        stats.soilTypes[farm.soilType] = (stats.soilTypes[farm.soilType] || 0) + 1;
      }
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get user farm stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farm statistics'
    });
  }
};

export const searchFarms = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const farms = await Farm.find({
      user: req.user.id,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'location.address': { $regex: query, $options: 'i' } },
        { 'location.zone': { $regex: query, $options: 'i' } },
        { crops: { $in: [new RegExp(query, 'i')] } }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: farms.length,
      farms
    });
  } catch (error) {
    console.error('Search farms error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching farms'
    });
  }
};