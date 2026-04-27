const Event = require('../models/Event');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Helper function to get relative path from file upload
const getRelativePath = (file) => {
  if (!file) return null;
  const normalized = file.path.replace(/\\/g, '/');
  const idx = normalized.indexOf('uploads/');
  return idx !== -1 ? normalized.substring(idx) : normalized;
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
exports.createEvent = async (req, res) => {
  try {
    const { title, description, location, date, endDate, autoDeleteDate, time, category } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a title',
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required',
      });
    }

    if (!autoDeleteDate) {
      return res.status(400).json({
        success: false,
        message: 'Auto delete date is required',
      });
    }

    // Date validation
    const startDate = new Date(date);
    const autoDelete = new Date(autoDeleteDate);
    
    if (endDate) {
      const end = new Date(endDate);
      if (end < startDate) {
        return res.status(400).json({
          success: false,
          message: 'End date cannot be earlier than start date',
        });
      }
    }

    if (autoDelete < startDate) {
      return res.status(400).json({
        success: false,
        message: 'Auto delete date cannot be earlier than start date',
      });
    }

    // FIX 3: Get relative image path if uploaded
    const image = getRelativePath(req.file);

    // Create event
    const event = await Event.create({
      title,
      description,
      location,
      date,
      endDate,
      autoDeleteDate,
      time,
      category,
      image,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private/Admin
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({}).populate('createdBy', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Private/Admin
exports.getEventById = async (req, res) => {
  try {
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
exports.updateEvent = async (req, res) => {
  try {
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const { title, description, location, date, endDate, autoDeleteDate, time, category, status } = req.body;

    // Validate autoDeleteDate if provided
    if (autoDeleteDate !== undefined && !autoDeleteDate) {
      return res.status(400).json({
        success: false,
        message: 'Auto delete date is required',
      });
    }

    // Date validation
    if (date !== undefined) {
      const startDate = new Date(date);
      
      if (endDate !== undefined && endDate) {
        const end = new Date(endDate);
        if (end < startDate) {
          return res.status(400).json({
            success: false,
            message: 'End date cannot be earlier than start date',
          });
        }
      }

      if (autoDeleteDate !== undefined && autoDeleteDate) {
        const autoDelete = new Date(autoDeleteDate);
        if (autoDelete < startDate) {
          return res.status(400).json({
            success: false,
            message: 'Auto delete date cannot be earlier than start date',
          });
        }
      }
    }

    // Update fields
    // BUG FIX 3: Use explicit undefined checks to allow empty strings
    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (location !== undefined) event.location = location;
    if (date !== undefined) event.date = date;
    if (endDate !== undefined) event.endDate = endDate;
    if (autoDeleteDate !== undefined) event.autoDeleteDate = autoDeleteDate;
    if (time !== undefined) event.time = time;
    if (category !== undefined) event.category = category;
    if (status !== undefined) event.status = status;

    // FIX 3: Update image if new one is uploaded
    if (req.file) {
      // Delete old image if exists
      if (event.image) {
        const oldImagePath = path.join(__dirname, '../', event.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Store relative path
      event.image = getRelativePath(req.file);
    }

    await event.save();

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
exports.deleteEvent = async (req, res) => {
  try {
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // FIX 3: Delete image file using absolute path reconstruction
    if (event.image) {
      const imagePath = path.join(__dirname, '../', event.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Approve event
// @route   PATCH /api/events/:id/approve
// @access  Private/Admin
exports.approveEvent = async (req, res) => {
  try {
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.status = 'approved';
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event approved successfully',
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Reject event
// @route   PATCH /api/events/:id/reject
// @access  Private/Admin
exports.rejectEvent = async (req, res) => {
  try {
    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID',
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.status = 'rejected';
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event rejected successfully',
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
