const express = require('express');
const router = express.Router();
const {
  createMessage,
  getAllMessages,
  getMessageById,
  markMessageAsRead,
  deleteMessage,
} = require('../controllers/messageController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/messages - Create new message (public)
router.post('/', createMessage);

// Apply protect and adminOnly middleware to remaining routes
router.use(protect);
router.use(adminOnly);

// GET /api/messages - Get all messages (admin only)
router.get('/', getAllMessages);

// GET /api/messages/:id - Get message by ID (admin only)
router.get('/:id', getMessageById);

// PATCH /api/messages/:id/read - Mark message as read (admin only)
router.patch('/:id/read', markMessageAsRead);

// DELETE /api/messages/:id - Delete message (admin only)
router.delete('/:id', deleteMessage);

module.exports = router;
