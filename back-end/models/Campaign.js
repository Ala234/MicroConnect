const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    objective: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    startDate: {
      type: String,
      default: '',
    },
    endDate: {
      type: String,
      default: '',
    },
    budget: {
      type: String,
      default: '0',
    },
    influencersCount: {
      type: String,
      default: '0',
    },
    targetAudience: {
      type: String,
      default: '',
    },
    contentType: {
      type: String,
      default: '',
    },
    platforms: {
      type: [String],
      default: [],
    },
    imageSrc: {
      type: String,
      default: '',
    },
    reach: {
      type: String,
      default: '0',
    },
    progress: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);