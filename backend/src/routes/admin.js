// src/routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected and only accessible by ADMIN
router.use(protect);
router.use(authorize('ADMIN'));

// @route   GET /api/admin/dashboard
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalComplaints: await Complaint.countDocuments(),
      todayComplaints: await Complaint.countDocuments({
        createdAt: { $gte: today },
      }),
      activeComplaints: await Complaint.countDocuments({
        status: { $in: ['Registered', 'Assigned', 'In Progress'] },
      }),
      resolvedComplaints: await Complaint.countDocuments({
        status: 'Resolved',
      }),
      totalStudents: await User.countDocuments({ role: 'STUDENT' }),
      totalWorkers: await User.countDocuments({ role: 'WORKER', isVerified: true }),
      pendingVerifications: await User.countDocuments({ role: 'WORKER', isVerified: false }),
    };

    // Category-wise breakdown
    const categoryBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] },
          },
        },
      },
    ]);

    // Average resolution time
    const resolvedComplaints = await Complaint.find({
      status: 'Resolved',
      resolvedAt: { $exists: true },
    }).select('createdAt resolvedAt');

    let avgResolutionTime = 0;
    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, complaint) => {
        const timeDiff = complaint.resolvedAt - complaint.createdAt;
        return sum + timeDiff;
      }, 0);
      avgResolutionTime = Math.round(totalTime / resolvedComplaints.length / (1000 * 60 * 60)); // in hours
    }

    res.status(200).json({
      success: true,
      data: {
        stats,
        categoryBreakdown,
        avgResolutionTime,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message,
    });
  }
});

// @route   GET /api/admin/complaints
// @desc    Get all complaints with filters
// @access  Private (Admin)
router.get('/complaints', async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (category) query.category = category;

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
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/complaints/:id/reassign
// @desc    Reassign complaint to different worker
// @access  Private (Admin)
router.put('/complaints/:id/reassign', async (req, res) => {
  try {
    const { workerId } = req.body;

    if (!workerId) {
      return res.status(400).json({
        success: false,
        message: 'Worker ID is required',
      });
    }

    // Check if worker exists and is verified
    const worker = await User.findOne({
      _id: workerId,
      role: 'WORKER',
      isVerified: true,
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found or not verified',
      });
    }

    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    complaint.assignedWorkerId = workerId;
    complaint.status = 'Assigned';
    complaint.statusHistory.push({
      status: 'Reassigned',
      changedBy: req.user.id,
      timestamp: new Date(),
    });

    await complaint.save();

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit(`worker_${workerId}`, {
      type: 'COMPLAINT_REASSIGNED',
      complaint,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint reassigned successfully',
      data: {
        complaint,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reassigning complaint',
      error: error.message,
    });
  }
});

// @route   GET /api/admin/workers
// @desc    Get all workers
// @access  Private (Admin)
router.get('/workers', async (req, res) => {
  try {
    const { verified, category } = req.query;
    
    const query = { role: 'WORKER' };
    if (verified !== undefined) {
      query.isVerified = verified === 'true';
    }
    if (category) {
      query.category = category;
    }

    const workers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        workers,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching workers',
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/workers/:id/verify
// @desc    Verify worker account
// @access  Private (Admin)
router.put('/workers/:id/verify', async (req, res) => {
  try {
    const worker = await User.findOne({
      _id: req.params.id,
      role: 'WORKER',
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      });
    }

    worker.isVerified = true;
    await worker.save();

    // Emit notification to worker
    const io = req.app.get('io');
    io.emit(`worker_${worker._id}`, {
      type: 'ACCOUNT_VERIFIED',
      message: 'Your account has been verified by admin',
    });

    res.status(200).json({
      success: true,
      message: 'Worker verified successfully',
      data: {
        worker,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying worker',
      error: error.message,
    });
  }
});

// @route   DELETE /api/admin/workers/:id
// @desc    Delete/Deactivate worker
// @access  Private (Admin)
router.delete('/workers/:id', async (req, res) => {
  try {
    const worker = await User.findOneAndDelete({
      _id: req.params.id,
      role: 'WORKER',
    });

    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found',
      });
    }

    // Reassign their active complaints
    await Complaint.updateMany(
      {
        assignedWorkerId: worker._id,
        status: { $in: ['Assigned', 'In Progress'] },
      },
      {
        $set: { assignedWorkerId: null, status: 'Registered' },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Worker deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting worker',
      error: error.message,
    });
  }
});

module.exports = router;