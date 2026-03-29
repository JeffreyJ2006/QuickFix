// src/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { uploadImage } = require('../config/cloudinary');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phoneNumber, hostel, roomNumber, assignedZones } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    
    // Student specific
    if (req.user.role === 'STUDENT') {
      if (hostel) updateData.hostel = hostel;
      if (roomNumber) updateData.roomNumber = roomNumber;
    }

    // Worker specific
    if (req.user.role === 'WORKER') {
      if (assignedZones) updateData.assignedZones = assignedZones;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
});

// @route   POST /api/users/profile/avatar
// @desc    Upload profile picture
// @access  Private
router.post('/profile/avatar', protect, upload.single('avatar'), handleMulterError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image',
      });
    }

    // Upload to Cloudinary
    const imageUrl = await uploadImage(req.file.buffer, 'avatars');

    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImageUrl: imageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profileImageUrl: user.profileImageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error.message,
    });
  }
});

// @route   PUT /api/users/availability
// @desc    Update worker availability status
// @access  Private (Worker)
router.put('/availability', protect, authorize('WORKER'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Available', 'Busy', 'Off-duty'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid availability status',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { availabilityStatus: status },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Availability status updated successfully',
      data: {
        availabilityStatus: user.availabilityStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
      error: error.message,
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message,
    });
  }
});

module.exports = router;