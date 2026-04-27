const express = require('express');
const router = express.Router();
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  approveEvent,
  rejectEvent,
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Apply protect and adminOnly middleware to all routes
router.use(protect);
router.use(adminOnly);

// GET /api/events - Get all events
// POST /api/events - Create new event (with image upload)
router.route('/').get(getAllEvents).post(upload.single('image'), createEvent);

// GET /api/events/:id - Get event by ID
// PUT /api/events/:id - Update event (with optional image upload)
// DELETE /api/events/:id - Delete event
router
  .route('/:id')
  .get(getEventById)
  .put(upload.single('image'), updateEvent)
  .delete(deleteEvent);

// PATCH /api/events/:id/approve - Approve event
router.patch('/:id/approve', approveEvent);

// PATCH /api/events/:id/reject - Reject event
router.patch('/:id/reject', rejectEvent);

module.exports = router;
