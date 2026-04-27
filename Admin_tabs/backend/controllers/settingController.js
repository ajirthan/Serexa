const Setting = require('../models/Setting');
const fs = require('fs');
const path = require('path');

// FIX 4: Helper function to get relative path from file upload
const getRelativePath = (file) => {
  if (!file) return null;
  const normalized = file.path.replace(/\\/g, '/');
  const idx = normalized.indexOf('uploads/');
  return idx !== -1 ? normalized.substring(idx) : normalized;
};

// @desc    Get settings
// @route   GET /api/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Setting.create({
        brandName: 'Admin Dashboard',
        primaryColor: '#ffdf00',
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const { brandName, primaryColor } = req.body;

    let settings = await Setting.findOne();

    // If no settings exist, create new one
    if (!settings) {
      settings = await Setting.create({
        brandName: brandName || 'Admin Dashboard',
        primaryColor: primaryColor || '#ffdf00',
      });
    } else {
      // Update existing settings
      if (brandName !== undefined) settings.brandName = brandName;
      if (primaryColor !== undefined) settings.primaryColor = primaryColor;
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

// @desc    Upload logo
// @route   POST /api/settings/upload-logo
// @access  Private/Admin
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a logo file',
      });
    }

    let settings = await Setting.findOne();

    // If no settings exist, create new one
    if (!settings) {
      // FIX 4: Store relative path
      settings = await Setting.create({
        logo: getRelativePath(req.file),
      });
    } else {
      // FIX 4: Delete old logo if exists
      if (settings.logo) {
        const oldLogoPath = path.join(__dirname, '../', settings.logo);
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      // Update logo path with relative path
      settings.logo = getRelativePath(req.file);
      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      settings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
