const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  uploadLogo,
} = require('../controllers/settingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Apply protect and adminOnly middleware to all routes
router.use(protect);
router.use(adminOnly);

// GET /api/settings - Get settings
router.get('/', getSettings);

// PUT /api/settings - Update settings
router.put('/', updateSettings);

// POST /api/settings/upload-logo - Upload logo
router.post('/upload-logo', upload.single('logo'), uploadLogo);

module.exports = router;
