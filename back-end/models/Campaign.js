const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
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
  },
  objective: String,
  description: String,
  startDate: Date,
  endDate: Date,
  budget: Number,
  influencersCount: Number,
  targetAudience: String,
  contentType: String,
  platforms: [String],
  imageSrc: String,
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active',
  },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);