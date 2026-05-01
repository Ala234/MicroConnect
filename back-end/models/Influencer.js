const mongoose = require('mongoose');

const influencerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    niche: {
      type: String,
      trim: true,
    },
    socialLinks: {
      instagram: {
        type: String,
        trim: true,
      },
      tiktok: {
        type: String,
        trim: true,
      },
      youtube: {
        type: String,
        trim: true,
      },
      website: {
        type: String,
        trim: true,
      },
    },
    followers: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Influencer', influencerSchema);

