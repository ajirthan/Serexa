const express = require('express');
const router = express.Router();
const {
  getDashboardSummary,
  getRecentActivity,
  getEventStatusStats,
  getMonthlyUserStats,
} = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Apply protect and adminOnly middleware to all routes
router.use(protect);
router.use(adminOnly);

// GET /api/reports/summary - Get dashboard summary
router.get('/summary', getDashboardSummary);

// GET /api/reports/recent-activity - Get recent activity
router.get('/recent-activity', getRecentActivity);

// GET /api/reports/event-status - Get event status statistics
router.get('/event-status', getEventStatusStats);

// GET /api/reports/monthly-users - Get monthly user statistics
router.get('/monthly-users', getMonthlyUserStats);

module.exports = router;
