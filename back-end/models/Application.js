const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    campaignName: {
      type: String,
      required: true,
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    influencerName: {
      type: String,
      required: true,
    },
    influencerEmail: {
      type: String,
      required: true,
    },
    influencerImage: {
      type: String,
      default: '',
    },
    influencerFollowers: {
      type: String,
      default: '0',
    },
    influencerEngagement: {
      type: String,
      default: '0%',
    },
    influencerAge: {
      type: String,
      default: '',
    },
    influencerLocation: {
      type: String,
      default: '',
    },
    influencerNiches: {
      type: [String],
      default: [],
    },
    proposal: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    brandResponse: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Prevent duplicate applications
applicationSchema.index({ campaignId: 1, influencerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);