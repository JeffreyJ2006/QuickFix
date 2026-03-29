// src/routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Complaint = require('../models/Complaint');
const { protect } = require('../middleware/auth');

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { complaintId, content } = req.body;

    if (!complaintId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Complaint ID and message content are required',
      });
    }

    // Check if complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Check authorization
    const isAuthorized = 
      complaint.reporterId.toString() === req.user.id ||
      (complaint.assignedWorkerId && complaint.assignedWorkerId.toString() === req.user.id);

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages for this complaint',
      });
    }

    // Create message
    const message = await Message.create({
      complaintId,
      senderId: req.user.id,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name profileImageUrl role');

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.to(complaintId).emit('newMessage', populatedMessage);

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message: populatedMessage,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message,
    });
  }
});

// @route   GET /api/messages/:complaintId
// @desc    Get message history for a complaint
// @access  Private
router.get('/:complaintId', protect, async (req, res) => {
  try {
    const { complaintId } = req.params;

    // Check if complaint exists and user is authorized
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    const isAuthorized = 
      complaint.reporterId.toString() === req.user.id ||
      (complaint.assignedWorkerId && complaint.assignedWorkerId.toString() === req.user.id) ||
      req.user.role === 'ADMIN';

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view messages for this complaint',
      });
    }

    const messages = await Message.find({ complaintId })
      .populate('senderId', 'name profileImageUrl role')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: {
        messages,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching messages',
      error: error.message,
    });
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark message as read
// @access  Private
router.put('/:messageId/read', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    // Only recipient can mark as read
    if (message.senderId.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark your own message as read',
      });
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message marked as read',
    });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking message as read',
      error: error.message,
    });
  }
});

module.exports = router;