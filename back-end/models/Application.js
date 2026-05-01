const mongoose = require('mongoose');

const statusToneMap = {
  Pending: 'pending',
  'Under Review': 'review',
  Accepted: 'accepted',
  Rejected: 'rejected',
};

const normalizeStatus = (value) => {
  if (!value) {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();

  if (normalized === 'pending') {
    return 'Pending';
  }

  if (normalized === 'under review' || normalized === 'under-review' || normalized === 'review') {
    return 'Under Review';
  }

  if (normalized === 'accepted') {
    return 'Accepted';
  }

  if (normalized === 'rejected') {
    return 'Rejected';
  }

  return value;
};

const applicationSchema = new mongoose.Schema(
  {
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Influencer',
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    campaignName: {
      type: String,
      trim: true,
    },
    brandName: {
      type: String,
      trim: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    proposal: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Under Review', 'Accepted', 'Rejected'],
      default: 'Pending',
      set: normalizeStatus,
    },
    statusTone: {
      type: String,
      enum: ['pending', 'review', 'accepted', 'rejected'],
      default: 'pending',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    brandResponse: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

applicationSchema.pre('validate', function syncApplicationFields() {
  if (this.campaign && !this.campaignId) {
    this.campaignId = this.campaign;
  }

  if (this.campaignId && !this.campaign) {
    this.campaign = this.campaignId;
  }

  this.status = normalizeStatus(this.status);
  this.statusTone = statusToneMap[this.status] || 'pending';
});

applicationSchema.index({ campaignId: 1, influencerId: 1 }, { unique: true, sparse: true });
applicationSchema.index({ campaign: 1, influencer: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Application', applicationSchema);
