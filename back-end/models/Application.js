const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    campaignName: {
      type: String,
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    brandName: {
      type: String,
      default: '',
    },
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
      enum: ['pending', 'accepted', 'rejected', 'Pending', 'Under Review', 'Accepted', 'Rejected'],
      default: 'pending',
    },
    statusTone: {
      type: String,
      default: 'pending',
    },
    appliedDate: {
      type: String,
      default: '',
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

applicationSchema.pre('validate', function syncApplicationAliases() {
  if (!this.campaign && this.campaignId) {
    this.campaign = this.campaignId;
  }

  if (!this.campaignId && this.campaign) {
    this.campaignId = this.campaign;
  }

  if (!this.brand && this.brandId) {
    this.brand = this.brandId;
  }

  if (!this.brandId && this.brand) {
    this.brandId = this.brand;
  }

  if (!this.influencer && this.influencerId) {
    this.influencer = this.influencerId;
  }

  if (!this.influencerId && this.influencer) {
    this.influencerId = this.influencer;
  }

  if (!this.appliedDate && this.createdAt) {
    this.appliedDate = this.createdAt.toISOString().slice(0, 10);
  }
});

module.exports = mongoose.model('Application', applicationSchema);
