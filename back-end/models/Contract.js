const mongoose = require('mongoose');

const CONTRACT_STATUSES = ['Completed', 'Active', 'Pending', 'Rejected'];
const TRANSACTION_STATUSES = ['Completed', 'Pending', 'Failed'];

const normalizeContractStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'completed') return 'Completed';
  if (value === 'active' || value === 'accepted') return 'Active';
  if (value === 'rejected') return 'Rejected';
  return 'Pending';
};

const normalizeTransactionStatus = (status) => {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'completed' || value === 'paid') return 'Completed';
  if (value === 'failed') return 'Failed';
  return 'Pending';
};

const parseAmount = (value) => {
  const amount = Number.parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
};

const stringArraySchema = [
  {
    type: String,
    trim: true,
  },
];

const contractSchema = new mongoose.Schema(
  {
    contractId: {
      type: String,
      unique: true,
      index: true,
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
      trim: true,
    },
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    influencerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    influencerName: {
      type: String,
      default: '',
      trim: true,
    },
    influencerEmail: {
      type: String,
      default: '',
      lowercase: true,
      trim: true,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    campaignName: {
      type: String,
      default: '',
      trim: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      unique: true,
      sparse: true,
    },
    value: {
      type: String,
      default: '',
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    duration: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: CONTRACT_STATUSES,
      default: 'Pending',
      set: normalizeContractStatus,
    },
    transactionStatus: {
      type: String,
      enum: TRANSACTION_STATUSES,
      default: 'Pending',
      set: normalizeTransactionStatus,
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
    deliverables: stringArraySchema,
    terms: stringArraySchema,
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    commissionRate: {
      type: Number,
      default: 10,
      min: 0,
    },
    adminCut: {
      type: Number,
      default: 0,
      min: 0,
    },
    influencerCut: {
      type: Number,
      default: 0,
      min: 0,
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

contractSchema.pre('validate', async function syncContractFields() {
  if (!this.contractId) {
    const count = await mongoose.model('Contract').countDocuments();
    const timestamp = Date.now().toString(36).toUpperCase();
    this.contractId = `CT-${timestamp}-${1001 + count}`;
  }

  if (!this.brand && this.brandId) this.brand = this.brandId;
  if (!this.brandId && this.brand) this.brandId = this.brand;
  if (!this.influencer && this.influencerId) this.influencer = this.influencerId;
  if (!this.influencerId && this.influencer) this.influencerId = this.influencer;
  if (!this.campaign && this.campaignId) this.campaign = this.campaignId;
  if (!this.campaignId && this.campaign) this.campaignId = this.campaign;

  this.status = normalizeContractStatus(this.status);
  this.transactionStatus = normalizeTransactionStatus(this.transactionStatus);

  if (!this.value && this.totalAmount) {
    this.value = `SAR ${this.totalAmount}`;
  }

  if (!this.totalAmount && this.value) {
    this.totalAmount = parseAmount(this.value);
  }

  const adminCut = (this.totalAmount * this.commissionRate) / 100;
  this.adminCut = Number.isFinite(adminCut) ? adminCut : 0;
  this.influencerCut = Math.max((this.totalAmount || 0) - this.adminCut, 0);
});

contractSchema.statics.normalizeContractStatus = normalizeContractStatus;
contractSchema.statics.normalizeTransactionStatus = normalizeTransactionStatus;

module.exports = mongoose.model('Contract', contractSchema);
