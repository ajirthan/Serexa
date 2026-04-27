const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      default: 'Admin Dashboard',
    },
    logo: {
      type: String,
    },
    primaryColor: {
      type: String,
      default: '#ffdf00',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Setting', settingSchema);
