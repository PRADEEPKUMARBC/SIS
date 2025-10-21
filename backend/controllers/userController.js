import User from '../models/User.js';
import Device from '../models/Device.js';
import IrrigationLog from '../models/IrrigationLog.js';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('devices', 'name location status')
      .populate('irrigationLogs', 'device duration waterUsed timestamp');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, address, preferences } = req.body;

    // Check if email already exists for other users
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (preferences) updateFields.preferences = preferences;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// @desc    Get user dashboard statistics
// @route   GET /api/users/dashboard
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's devices
    const devices = await Device.find({ user: userId });
    
    // Get irrigation logs for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const irrigationStats = await IrrigationLog.aggregate([
      {
        $match: {
          user: userId,
          timestamp: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalWaterUsed: { $sum: '$waterUsed' },
          totalIrrigationTime: { $sum: '$duration' },
          irrigationCount: { $sum: 1 }
        }
      }
    ]);

    // Get device status counts
    const deviceStatusCounts = await Device.aggregate([
      {
        $match: { user: userId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent irrigation activities
    const recentActivities = await IrrigationLog.find({ user: userId })
      .populate('device', 'name location')
      .sort({ timestamp: -1 })
      .limit(5)
      .select('device duration waterUsed timestamp status');

    const stats = irrigationStats[0] || {
      totalWaterUsed: 0,
      totalIrrigationTime: 0,
      irrigationCount: 0
    };

    const statusCounts = {
      active: 0,
      inactive: 0,
      maintenance: 0
    };

    deviceStatusCounts.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalDevices: devices.length,
        totalWaterUsed: stats.totalWaterUsed,
        totalIrrigationTime: stats.totalIrrigationTime,
        totalIrrigations: stats.irrigationCount,
        deviceStatus: statusCounts,
        recentActivities
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteUserAccount = asyncHandler(async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user.id);

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete user's devices and related data
    await Device.deleteMany({ user: req.user.id });
    await IrrigationLog.deleteMany({ user: req.user.id });

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
});

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
export const updateUserPreferences = asyncHandler(async (req, res) => {
  try {
    const { 
      notifications, 
      language, 
      units, 
      autoIrrigation,
      waterSavingMode,
      alertThresholds 
    } = req.body;

    const updateFields = { preferences: {} };

    if (notifications !== undefined) updateFields.preferences.notifications = notifications;
    if (language) updateFields.preferences.language = language;
    if (units) updateFields.preferences.units = units;
    if (autoIrrigation !== undefined) updateFields.preferences.autoIrrigation = autoIrrigation;
    if (waterSavingMode !== undefined) updateFields.preferences.waterSavingMode = waterSavingMode;
    if (alertThresholds) updateFields.preferences.alertThresholds = alertThresholds;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedUser.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating preferences'
    });
  }
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .populate('devices')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('devices')
      .populate('irrigationLogs');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUserById = asyncHandler(async (req, res) => {
  try {
    const { name, email, phone, address, role, isActive } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (role) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Update user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @desc    Delete user by ID (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user's devices and related data
    await Device.deleteMany({ user: req.params.id });
    await IrrigationLog.deleteMany({ user: req.params.id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getDashboardStats,
  deleteUserAccount,
  updateUserPreferences,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
};