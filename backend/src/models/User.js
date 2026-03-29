// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['STUDENT', 'WORKER', 'ADMIN'],
    default: 'STUDENT',
  },
  phoneNumber: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
  },
  profileImageUrl: {
    type: String,
    default: null,
  },
  
  // Student specific fields
  rollNumber: {
    type: String,
    sparse: true,
  },
  hostel: {
    type: String,
  },
  roomNumber: {
    type: String,
  },
  
  // Worker specific fields
  employeeId: {
    type: String,
    sparse: true,
  },
  category: {
    type: String,
    enum: ['Electrical', 'Plumbing', 'Cleaning', 'Carpentry', 'IT', 'Other', null],
  },
  availabilityStatus: {
    type: String,
    enum: ['Available', 'Busy', 'Off-duty'],
    default: 'Available',
  },
  assignedZones: [{
    type: String,
  }],
  
  // Stats
  totalComplaintsResolved: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  
  isVerified: {
    type: Boolean,
    default: function() {
      return this.role !== 'WORKER';
    },
  },
  fcmToken: {
    type: String,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Method to get public profile
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);