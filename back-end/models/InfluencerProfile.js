const mongoose = require('mongoose');

const influencerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    profileImage: { type: String, default: '' },
    website: { type: String, default: '' },
    instagram: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    youtube: { type: String, default: '' },
    followers: { type: String, default: '0' },
    engagement: { type: String, default: '0%' },
    categories: { type: [String], default: [] },
    rates: {
      post: { type: String, default: '' },
      story: { type: String, default: '' },
      video: { type: String, default: '' },
    },
    audience: {
      age: { type: String, default: '' },
      gender: { type: String, default: '' },
      location: { type: String, default: '' },
    },
    isProfileComplete: { type: Boolean, default: false },
    status: { type: String, default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InfluencerProfile', influencerProfileSchema);