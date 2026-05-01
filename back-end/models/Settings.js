const mongoose = require('mongoose');

const policySchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const commissionSchema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Policy     = mongoose.model('Policy',     policySchema);
const Commission = mongoose.model('Commission', commissionSchema);

module.exports = { Policy, Commission };