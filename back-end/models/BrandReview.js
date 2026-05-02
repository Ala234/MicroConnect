const mongoose = require('mongoose');

const brandReviewSchema = new mongoose.Schema(
  {
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
      required: true,
      unique: true,
      index: true,
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
    },
  },
  { timestamps: true }
);

brandReviewSchema.index({ application: 1, influencer: 1 }, { unique: true });
brandReviewSchema.index({ brand: 1, createdAt: -1 });
brandReviewSchema.index({ campaign: 1, createdAt: -1 });

module.exports = mongoose.model('BrandReview', brandReviewSchema);
