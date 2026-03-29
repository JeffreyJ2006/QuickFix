// src/models/Complaint.js
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Electrical', 'Plumbing', 'Cleaning', 'Carpentry', 'IT', 'Other'],
  },
  location: {
    hostel: {
      type: String,
      required: true,
    },
    building: String,
    roomNumber: {
      type: String,
      required: true,
    },
    floor: String,
  },
  imageUrls: [{
    type: String,
  }],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  status: {
    type: String,
    enum: ['Registered', 'Assigned', 'In Progress', 'Resolved', 'Cancelled'],
    default: 'Registered',
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedWorkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 300,
    },
    submittedAt: Date,
  },
  statusHistory: [{
    status: {
      type: String,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  resolvedAt: {
    type: Date,
  },
  estimatedResolutionTime: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Add initial status to history when creating complaint
complaintSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: 'Registered',
      changedBy: this.reporterId,
      timestamp: new Date(),
    });
  }
  next();
});

// Update resolvedAt when status changes to Resolved
complaintSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

// Index for faster queries
complaintSchema.index({ reporterId: 1, status: 1 });
complaintSchema.index({ assignedWorkerId: 1, status: 1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);