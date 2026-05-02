const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    disputeId: {
      type: String,
      unique: true,
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    submittedByRole: {
      type: String,
      enum: ['brand', 'influencer'],
      required: true,
    },

    against: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },

    contractId: {
      type: String,
      default: 'Not provided',
    },

    subject: {
      type: String,
      required: true,
      trim: true,
    },

    reason: {
      type: String,
      enum: ['Payment issue', 'Contract issue', 'Deliverable dispute', 'Other'],
      default: 'Other',
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },

    status: {
      type: String,
      enum: ['Pending', 'Resolved'],
      default: 'Pending',
    },

    adminResponse: {
      type: String,
      trim: true,
      default: '',
    },

    resolvedAt: {
      type: Date,
    },

    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// ── Auto-generate disputeId before saving ──────────────
disputeSchema.pre('save', async function (next) {
  if (!this.disputeId) {
    const count    = await mongoose.model('Dispute').countDocuments();
    this.disputeId = `DSP-${1001 + count}`;
  }
  next();
});

module.exports = mongoose.model('Dispute', disputeSchema);