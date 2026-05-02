const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    contractId: {
      type: String,
      unique: true,
    },

    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },

    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Influencer',
      required: true,
    },

    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },

    // Contract Details
    duration: {
      type: String,
      trim: true,
    },

    startDate: {
      type: Date,
    },

    endDate: {
      type: Date,
    },

    // Payment
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    commissionRate: {
      type: Number,
      required: true,
      default: 10,
    },

    adminCut: {
      type: Number,
      required: true,
    },

    influencerCut: {
      type: Number,
      required: true,
    },

    paymentTiming: {
      type: String,
      enum: ['before', 'after'],
      default: 'before',
    },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid'],
      default: 'unpaid',
    },

    // Content
    deliverables: [
      {
        type: String,
        trim: true,
      },
    ],

    terms: [
      {
        type: String,
        trim: true,
      },
    ],

    // Status
    status: {
      type: String,
      enum: ['draft', 'pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'draft',
    },

    // Response from influencer
    influencerResponse: {
      type: String,
      trim: true,
      default: '',
    },

    respondedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ── Auto-generate contractId before saving ─────────────
contractSchema.pre('save', async function (next) {
  if (!this.contractId) {
    const count      = await mongoose.model('Contract').countDocuments();
    const timestamp  = Date.now().toString(36).toUpperCase();
    this.contractId  = `CT-${timestamp}-${1001 + count}`;
  }
  next();
});

module.exports = mongoose.model('Contract', contractSchema);