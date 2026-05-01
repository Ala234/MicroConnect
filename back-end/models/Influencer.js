const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema(
  {
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
  { _id: false }
);

const ratesSchema = new mongoose.Schema(
  {
    post: {
      type: String,
      trim: true,
    },
    story: {
      type: String,
      trim: true,
    },
    video: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const audienceSchema = new mongoose.Schema(
  {
    age: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const influencerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
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
    followers: {
      type: String,
      trim: true,
      default: '',
    },
    engagement: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    rates: {
      type: ratesSchema,
      default: () => ({}),
    },
    audience: {
      type: audienceSchema,
      default: () => ({}),
    },
    niche: {
      type: String,
      trim: true,
    },
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'verified', 'suspended'],
      default: 'active',
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

influencerSchema.pre('validate', function syncSocialFields() {
  this.socialLinks = this.socialLinks || {};

  ['instagram', 'tiktok', 'youtube', 'website'].forEach((field) => {
    if (!this[field] && this.socialLinks[field]) {
      this[field] = this.socialLinks[field];
    }

    if (this[field] && !this.socialLinks[field]) {
      this.socialLinks[field] = this[field];
    }
  });
});

module.exports = mongoose.model('Influencer', influencerSchema);
