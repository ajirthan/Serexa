const User = require('../models/User');
const Event = require('../models/Event');
const Message = require('../models/Message');

// @desc    Get dashboard summary
// @route   GET /api/reports/summary
// @access  Private/Admin
exports.getDashboardSummary = async (req, res) => {
  try {
    // Count users
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalNormalUsers = await User.countDocuments({ role: 'user' });

    // Count events
    const totalEvents = await Event.countDocuments();
    const pendingEvents = await Event.countDocuments({ status: 'pending' });
    const approvedEvents = await Event.countDocuments({ status: 'approved' });
    const rejectedEvents = await Event.countDocuments({ status: 'rejected' });

    // Count messages
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      summary: {
        totalUsers,
        totalAdmins,
        totalNormalUsers,
        totalEvents,
        pendingEvents,
        approvedEvents,
        rejectedEvents,
        totalMessages,
        unreadMessages,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get recent activity
// @route   GET /api/reports/recent-activity
// @access  Private/Admin
exports.getRecentActivity = async (req, res) => {
  try {
    // Get latest 10 users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email createdAt');

    // Get latest 10 events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title status createdAt');

    // Get latest 10 messages
    const recentMessages = await Message.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('fullName subject createdAt');

    // Format and combine activities
    const activities = [];

    recentUsers.forEach((user) => {
      activities.push({
        type: 'user',
        title: `New user: ${user.name}`,
        description: user.email,
        createdAt: user.createdAt,
      });
    });

    recentEvents.forEach((event) => {
      activities.push({
        type: 'event',
        title: `Event: ${event.title}`,
        description: `Status: ${event.status}`,
        createdAt: event.createdAt,
      });
    });

    recentMessages.forEach((message) => {
      activities.push({
        type: 'message',
        title: `Message from: ${message.fullName}`,
        description: message.subject || 'No subject',
        createdAt: message.createdAt,
      });
    });

    // Sort by createdAt and limit to 10
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentActivity = activities.slice(0, 10);

    res.status(200).json({
      success: true,
      count: recentActivity.length,
      activities: recentActivity,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get event status statistics
// @route   GET /api/reports/event-status
// @access  Private/Admin
exports.getEventStatusStats = async (req, res) => {
  try {
    const stats = await Event.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the response
    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    stats.forEach((stat) => {
      if (stat._id === 'pending') statusStats.pending = stat.count;
      if (stat._id === 'approved') statusStats.approved = stat.count;
      if (stat._id === 'rejected') statusStats.rejected = stat.count;
    });

    res.status(200).json({
      success: true,
      stats: statusStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Get monthly user statistics for current year
// @route   GET /api/reports/monthly-users
// @access  Private/Admin
exports.getMonthlyUserStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    // BUG FIX 8: Add milliseconds to capture full end of year
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999);

    const stats = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startOfYear,
            $lte: endOfYear,
          },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Format the response with all 12 months
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const monthlyStats = monthNames.map((month, index) => {
      const stat = stats.find((s) => s._id === index + 1);
      return {
        month,
        count: stat ? stat.count : 0,
      };
    });

    res.status(200).json({
      success: true,
      year: currentYear,
      stats: monthlyStats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
