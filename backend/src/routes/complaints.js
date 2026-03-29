// src/routes/complaints.js
const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const { uploadImage } = require('../config/cloudinary');

// @route   POST /api/complaints
// @desc    Create new complaint
// @access  Private (Student)
router.post('/', protect, authorize('STUDENT'), upload.array('images', 3), handleMulterError, async (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body;
    
    // Parse location if it's a string
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    // Handle image uploads to Cloudinary
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const imageUrl = await uploadImage(file.buffer, 'complaints');
          imageUrls.push(imageUrl);
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
        }
      }
    }

    // Create complaint
    const complaint = await Complaint.create({
      title,
      description,
      category,
      location: parsedLocation,
      imageUrls,
      priority: priority || 'Medium',
      reporterId: req.user.id,
    });

    // Auto-assign to available worker
    const availableWorker = await User.findOne({
      role: 'WORKER',
      category,
      availabilityStatus: 'Available',
      isVerified: true,
    });

    if (availableWorker) {
      complaint.assignedWorkerId = availableWorker._id;
      complaint.status = 'Assigned';
      complaint.statusHistory.push({
        status: 'Assigned',
        changedBy: availableWorker._id,
        timestamp: new Date(),
      });
      await complaint.save();

      // Emit Socket.IO event
      const io = req.app.get('io');
      io.emit(`worker_${availableWorker._id}`, {
        type: 'NEW_COMPLAINT_ASSIGNED',
        complaint,
      });
    }

    // Populate and return
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('reporterId', 'name email phoneNumber')
      .populate('assignedWorkerId', 'name category');

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: {
        complaint: populatedComplaint,
      },
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message,
    });
  }
});

// @route   GET /api/complaints
// @desc    Get complaints (filtered by user role)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, category, priority, page = 1, limit = 20 } = req.query;
    
    let query = {};

    // Filter based on user role
    if (req.user.role === 'STUDENT') {
      query.reporterId = req.user.id;
    } else if (req.user.role === 'WORKER') {
      query.assignedWorkerId = req.user.id;
    }
    // ADMIN can see all complaints

    // Apply additional filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const complaints = await Complaint.find(query)
      .populate('reporterId', 'name email phoneNumber hostel roomNumber')
      .populate('assignedWorkerId', 'name category phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Complaint.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        complaints,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message,
    });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get complaint details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reporterId', 'name email phoneNumber hostel roomNumber profileImageUrl')
      .populate('assignedWorkerId', 'name category phoneNumber profileImageUrl')
      .populate('statusHistory.changedBy', 'name');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check authorization
    const isAuthorized = 
      req.user.role === 'ADMIN' ||
      complaint.reporterId._id.toString() === req.user.id ||
      (complaint.assignedWorkerId && complaint.assignedWorkerId._id.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this complaint',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        complaint,
      },
    });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message,
    });
  }
});

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private (Worker, Admin)
router.put('/:id/status', protect, authorize('WORKER', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check if worker is assigned to this complaint
    if (req.user.role === 'WORKER' && 
        (!complaint.assignedWorkerId || complaint.assignedWorkerId.toString() !== req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this complaint',
      });
    }

    // Update status
    complaint.status = status;
    complaint.statusHistory.push({
      status,
      changedBy: req.user.id,
      timestamp: new Date(),
    });

    if (status === 'Resolved') {
      complaint.resolvedAt = new Date();
      
      // Increment worker's resolved complaints count
      if (complaint.assignedWorkerId) {
        await User.findByIdAndUpdate(complaint.assignedWorkerId, {
          $inc: { totalComplaintsResolved: 1 },
        });
      }
    }

    await complaint.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(complaint._id.toString()).emit('statusChanged', {
      complaintId: complaint._id,
      status,
      timestamp: new Date(),
    });

    // Notify student
    io.emit(`student_${complaint.reporterId}`, {
      type: 'STATUS_UPDATE',
      complaint,
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('reporterId', 'name email')
      .populate('assignedWorkerId', 'name category');

    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: {
        complaint: populatedComplaint,
      },
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message,
    });
  }
});

// @route   POST /api/complaints/:id/feedback
// @desc    Submit feedback for resolved complaint
// @access  Private (Student)
router.post('/:id/feedback', protect, authorize('STUDENT'), async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating (1-5)',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (complaint.reporterId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit feedback for this complaint',
      });
    }

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({
        success: false,
        message: 'Can only submit feedback for resolved complaints',
      });
    }

    if (complaint.feedback && complaint.feedback.rating) {
      return res.status(400).json({
        success: false,
        message: 'Feedback already submitted for this complaint',
      });
    }

    complaint.feedback = {
      rating,
      comment,
      submittedAt: new Date(),
    };

    await complaint.save();

    // Update worker's average rating
    if (complaint.assignedWorkerId) {
      const workerComplaints = await Complaint.find({
        assignedWorkerId: complaint.assignedWorkerId,
        'feedback.rating': { $exists: true },
      });

      if (workerComplaints.length > 0) {
        const totalRating = workerComplaints.reduce((sum, c) => sum + c.feedback.rating, 0);
        const averageRating = totalRating / workerComplaints.length;

        await User.findByIdAndUpdate(complaint.assignedWorkerId, {
          averageRating: averageRating.toFixed(2),
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: {
        complaint,
      },
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message,
    });
  }
});

// @route   DELETE /api/complaints/:id
// @desc    Delete/Cancel complaint
// @access  Private (Student - own complaints, Admin)
router.delete('/:id', protect, authorize('STUDENT', 'ADMIN'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Student can only delete their own unresolved complaints
    if (req.user.role === 'STUDENT') {
      if (complaint.reporterId.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this complaint',
        });
      }

      if (complaint.status === 'Resolved') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete resolved complaints',
        });
      }
    }

    // Cancel instead of delete
    complaint.status = 'Cancelled';
    complaint.statusHistory.push({
      status: 'Cancelled',
      changedBy: req.user.id,
      timestamp: new Date(),
    });
    await complaint.save();

    res.status(200).json({
      success: true,
      message: 'Complaint cancelled successfully',
    });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting complaint',
      error: error.message,
    });
  }
});

module.exports = router;