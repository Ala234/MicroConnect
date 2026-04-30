const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposal: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    brandResponse: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ campaignId: 1, influencerId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
