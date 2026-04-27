const express = require('express');
const router = express.Router();
const { loginAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', loginAdmin);

// GET /api/auth/me
router.get('/me', protect, getMe);

module.exports = router;
