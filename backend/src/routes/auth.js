// src/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  console.log('📝 Registration attempt:', req.body.email);
  try {
    const { name, email, password, role, phoneNumber, rollNumber, hostel, roomNumber, employeeId, category } = req.body;

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Registration failed: Missing fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Registration failed: User exists');
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Create user object based on role
    const userData = {
      name,
      email,
      password,
      role: role || 'STUDENT',
      phoneNumber,
    };

    // Add role-specific fields
    if (role === 'STUDENT') {
      userData.rollNumber = rollNumber;
      userData.hostel = hostel;
      userData.roomNumber = roomNumber;
    } else if (role === 'WORKER') {
      userData.employeeId = employeeId;
      userData.category = category;
      userData.isVerified = false; // Workers need admin approval
    }

    // Create user
    const user = await User.create(userData);
    console.log('✅ User created:', user.email);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: role === 'WORKER' 
        ? 'Registration successful. Awaiting admin verification.' 
        : 'Registration successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          category: user.category,
        },
      },
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  console.log('🔑 Login attempt:', req.body.email);
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      console.log('❌ Login failed: Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      console.log('❌ Login failed: Incorrect password');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if worker is verified
    if (user.role === 'WORKER' && !user.isVerified) {
      console.log('❌ Login failed: Worker not verified');
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin verification',
      });
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ Login successful:', user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profileImageUrl: user.profileImageUrl,
          category: user.category,
          availabilityStatus: user.availabilityStatus,
          phoneNumber: user.phoneNumber,
          hostel: user.hostel,
          roomNumber: user.roomNumber,
        },
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
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
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

// @route   PUT /api/auth/update-fcm-token
// @desc    Update FCM token for push notifications
// @access  Private
router.put('/update-fcm-token', protect, async (req, res) => {
  try {
    const { fcmToken } = req.body;
    
    if (!fcmToken) {
      return res.status(400).json({
        success: false,
        message: 'FCM token is required',
      });
    }

    await User.findByIdAndUpdate(req.user.id, { fcmToken });
    
    res.status(200).json({
      success: true,
      message: 'FCM token updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating FCM token',
      error: error.message,
    });
  }
});

module.exports = router;