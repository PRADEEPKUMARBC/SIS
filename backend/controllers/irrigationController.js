import IrrigationLog from '../models/IrrigationLog.js';
import Device from '../models/Device.js';
import { irrigationLogic } from '../utils/irrigationLogic.js';
import { irrigationAI } from '../utils/aiModel.js';

export const startIrrigation = async (req, res) => {
  try {
    const { duration, type = 'manual' } = req.body;

    if (!duration || duration < 1 || duration > 120) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 1 and 120 minutes'
      });
    }

    const result = await irrigationLogic.startIrrigation(
      req.params.deviceId,
      duration,
      type,
      req.user.id
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Start irrigation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error starting irrigation'
    });
  }
};

export const stopIrrigation = async (req, res) => {
  try {
    const result = await irrigationLogic.stopIrrigation(
      req.params.deviceId,
      req.body.status || 'completed'
    );

    res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Stop irrigation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error stopping irrigation'
    });
  }
};

export const getIrrigationHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, deviceId, type, status } = req.query;
    
    const filter = { user: req.user.id };
    if (deviceId) filter.device = deviceId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    const irrigations = await IrrigationLog.find(filter)
      .populate('device', 'name deviceId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await IrrigationLog.countDocuments(filter);

    res.json({
      success: true,
      irrigations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get irrigation history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching irrigation history'
    });
  }
};

export const getIrrigationStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const stats = await IrrigationLog.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalIrrigations: { $sum: 1 },
          totalWaterUsed: { $sum: '$waterUsed' },
          totalWaterSaved: { $sum: '$waterSaved' },
          totalDuration: { $sum: '$duration.actual' },
          avgEfficiency: { $avg: '$efficiency' }
        }
      }
    ]);

    const dailyStats = await IrrigationLog.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: thirtyDaysAgo },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          waterUsed: { $sum: '$waterUsed' },
          waterSaved: { $sum: '$waterSaved' },
          irrigations: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const result = stats[0] || {
      totalIrrigations: 0,
      totalWaterUsed: 0,
      totalWaterSaved: 0,
      totalDuration: 0,
      avgEfficiency: 0
    };

    res.json({
      success: true,
      stats: result,
      dailyStats,
      period: '30 days'
    });

  } catch (error) {
    console.error('Get irrigation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching irrigation statistics'
    });
  }
};
export const emergencyStopAll = async (req, res) => {
  try {
    // Call your logic function
    const result = await irrigationLogic.emergencyStopAll(req.user.id);

    // Convert result to plain object (handles Mongoose documents safely)
    let plainResult;
    if (Array.isArray(result)) {
      plainResult = result.map(r => (r.toObject ? r.toObject() : r));
    } else {
      plainResult = result.toObject ? result.toObject() : result;
    }

    // Send response safely
    res.json({
      success: true,
      message: "Emergency stop executed",
      results: plainResult || [] // always send array for consistency
    });

  } catch (error) {
    console.error('Emergency stop error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error executing emergency stop'
    });
  }
};


export const getActiveIrrigations = async (req, res) => {
  try {
    const activeIrrigations = await irrigationLogic.getActiveIrrigations();
    
    // Enrich with device information
    const enrichedIrrigations = await Promise.all(
      activeIrrigations.map(async (irrigation) => {
        const device = await Device.findById(irrigation.deviceId)
          .select('name deviceId farm');
        return {
          ...irrigation,
          device: device || { name: 'Unknown', deviceId: 'Unknown' }
        };
      })
    );

    res.json({
      success: true,
      activeIrrigations: enrichedIrrigations
    });

  } catch (error) {
    console.error('Get active irrigations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active irrigations'
    });
  }
};