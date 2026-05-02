const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewerRole: {
      type: String,
      enum: ['brand', 'influencer'],
      required: true,
    },
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    reviewerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    target: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetRole: {
      type: String,
      enum: ['brand', 'influencer'],
      required: true,
    },
    targetName: {
      type: String,
      required: true,
      trim: true,
    },
    targetEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    brandName: {
      type: String,
      required: true,
      trim: true,
    },
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    influencerName: {
      type: String,
      required: true,
      trim: true,
    },
    influencerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    campaignName: {
      type: String,
      required: true,
      trim: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      index: true,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => String(value || '').trim().length > 0,
        message: 'Review text is required',
      },
    },
    duplicateKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

reviewSchema.pre('validate', function setDuplicateKey() {
  if (!this.duplicateKey) {
    const scope = this.application
      ? `application:${this.application}`
      : this.contract
        ? `contract:${this.contract}`
        : `campaign:${this.campaign}`;

    this.duplicateKey = [
      this.reviewer,
      this.reviewerRole,
      this.target,
      this.targetRole,
      scope,
    ].join(':');
  }
});

reviewSchema.index({ target: 1, targetRole: 1, createdAt: -1 });
reviewSchema.index({ brand: 1, targetRole: 1, createdAt: -1 });
reviewSchema.index({ influencer: 1, targetRole: 1, createdAt: -1 });
reviewSchema.index({ campaign: 1, targetRole: 1, createdAt: -1 });
reviewSchema.index({ contract: 1, createdAt: -1 });
reviewSchema.index({ application: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
