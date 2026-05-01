const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    objective: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    requirements: {
      type: String,
      trim: true,
    },
    targetNiche: {
      type: String,
      trim: true,
    },
    targetAudience: {
      type: String,
      trim: true,
    },
    platforms: [
      {
        type: String,
        trim: true,
      },
    ],
    contentType: {
      type: String,
      trim: true,
    },
    imageSrc: {
      type: String,
      trim: true,
    },
    imageKey: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    influencersCount: {
      type: String,
      trim: true,
      default: '0',
    },
    reach: {
      type: String,
      trim: true,
      default: '0',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    deadline: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'draft'],
      default: 'open',
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
  },
  { timestamps: true }
);

campaignSchema.pre('validate', function syncCampaignFields() {
  if (!this.title && this.name) {
    this.title = this.name;
  }

  if (!this.name && this.title) {
    this.name = this.title;
  }

  if (!this.endDate && this.deadline) {
    this.endDate = this.deadline;
  }

  if (!this.deadline && this.endDate) {
    this.deadline = this.endDate;
  }

  if (!this.targetAudience && this.targetNiche) {
    this.targetAudience = this.targetNiche;
  }
});

module.exports = mongoose.model('Campaign', campaignSchema);
