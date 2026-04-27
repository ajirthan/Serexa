const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  blockUser,
  unblockUser,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Apply protect and adminOnly middleware to all routes
router.use(protect);
router.use(adminOnly);

// GET /api/users - Get all users
// POST /api/users - Create new user
router.route('/').get(getAllUsers).post(createUser);

// GET /api/users/:id - Get user by ID
// PUT /api/users/:id - Update user
// DELETE /api/users/:id - Delete user
router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

// PATCH /api/users/:id/block - Block user
router.patch('/:id/block', blockUser);

// PATCH /api/users/:id/unblock - Unblock user
router.patch('/:id/unblock', unblockUser);

module.exports = router;
