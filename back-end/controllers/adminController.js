const User        = require('../models/User');
const Campaign    = require('../models/Campaign');
const Brand       = require('../models/Brand');
const Application = require('../models/Application');
const { Policy, Commission } = require('../models/Settings');
const Influencer  = require('../models/Influencer');
const Dispute = require('../models/Dispute');

// ── DASHBOARD STATS ────────────────────────────────────
// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers        = await User.countDocuments();
    const totalBrands       = await User.countDocuments({ role: 'brand' });
    const totalInfluencers  = await User.countDocuments({ role: 'influencer' });
    const totalCampaigns    = await Campaign.countDocuments();
    const activeCampaigns   = await Campaign.countDocuments({ status: 'open' });
    const totalApplications = await Application.countDocuments();
    const flaggedBios       = await Influencer.countDocuments({ bioStatus: 'flagged' });
    const openDisputes      = await Dispute.countDocuments({ status: 'Pending' });
    const highPriority      = await Dispute.countDocuments({ status: 'Pending', priority: 'High' });

    res.status(200).json({
      totalUsers,
      totalBrands,
      totalInfluencers,
      totalCampaigns,
      activeCampaigns,
      totalApplications,
      flaggedBios,
      openDisputes,
      highPriority,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

// ── USERS ──────────────────────────────────────────────
// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;

    const filter = {};
    if (role)                  filter.role     = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search)                filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error: error.message });
  }
};

// PATCH /api/admin/users/:id/suspend
const toggleSuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot suspend an admin' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      message: `User ${user.isActive ? 'unsuspended' : 'suspended'} successfully`,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin' });

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user', error: error.message });
  }
};

// GET /api/admin/users/:id/influencer-profile
const getInfluencerProfile = async (req, res) => {
  try {
    const influencer = await Influencer.findOne({ userId: req.params.id });
    if (!influencer) return res.status(404).json({ message: 'Influencer profile not found' });
    res.status(200).json(influencer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch influencer profile', error: error.message });
  }
};

// GET /api/admin/users/:id/brand-profile
const getBrandProfile = async (req, res) => {
  try {
    const brand = await Brand.findOne({ userId: req.params.id });
    if (!brand) return res.status(404).json({ message: 'Brand profile not found' });
    res.status(200).json(brand);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brand profile', error: error.message });
  }
};

// ── INFLUENCERS ────────────────────────────────────────
// GET /api/admin/influencers
const getAllInfluencers = async (req, res) => {
  try {
    const { bioStatus, search } = req.query;
    const filter = {};
    const filters = [];

    if (bioStatus) {
      filters.push({ $or: [
        { bioStatus },
        { bioState: bioStatus === 'flagged' ? 'Flagged' : 'Approved' },
      ] });
    }

    if (search)    filters.push({ $or: [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ] });

    if (filters.length === 1) {
      Object.assign(filter, filters[0]);
    } else if (filters.length > 1) {
      filter.$and = filters;
    }

    const influencers = await Influencer.find(filter)
      .populate('userId', 'name email isActive')
      .sort({ createdAt: -1 });

    res.status(200).json(influencers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch influencers', error: error.message });
  }
};

// PATCH /api/admin/influencers/:id/bio-status
const updateInfluencerBioStatus = async (req, res) => {
  try {
    const { bioStatus } = req.body;
    const allowed = ['approved', 'flagged'];

    if (!allowed.includes(bioStatus)) {
      return res.status(400).json({ message: 'bioStatus must be approved or flagged' });
    }

    const influencer = await Influencer.findByIdAndUpdate(
      req.params.id,
      {
        bioStatus,
        bioState: bioStatus === 'flagged' ? 'Flagged' : 'Approved',
      },
      { new: true }
    );

    if (!influencer) return res.status(404).json({ message: 'Influencer not found' });

    res.status(200).json({
      message: `Bio ${bioStatus === 'approved' ? 'approved' : 'flagged'} successfully`,
      influencer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bio status', error: error.message });
  }
};

// ── CAMPAIGNS ──────────────────────────────────────────
// GET /api/admin/campaigns
const getAllCampaigns = async (req, res) => {
  try {
    const { status, search } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const campaigns = await Campaign.find(filter)
      .populate('brandId', 'companyName logo')
      .sort({ createdAt: -1 });

    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch campaigns', error: error.message });
  }
};

// GET /api/admin/campaigns/:id
const getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('brandId', 'companyName logo');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch campaign', error: error.message });
  }
};

// ── BRANDS ─────────────────────────────────────────────
// GET /api/admin/brands
const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find()
      .populate('userId', 'name email isActive')
      .sort({ createdAt: -1 });
    res.status(200).json(brands);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch brands', error: error.message });
  }
};

// ── APPLICATIONS ───────────────────────────────────────
// GET /api/admin/applications
const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const applications = await Application.find(filter)
      .populate('campaignId',   'title budget status')
      .populate('influencerId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applications', error: error.message });
  }
};

// ── POLICIES ───────────────────────────────────────────
// GET /api/admin/policies
const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json(policies);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch policies', error: error.message });
  }
};

// POST /api/admin/policies
const addPolicy = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Policy text is required' });
    }
    const count  = await Policy.countDocuments();
    const policy = await Policy.create({ text: text.trim(), order: count });
    res.status(201).json({ message: 'Policy added successfully', policy });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add policy', error: error.message });
  }
};

// PUT /api/admin/policies/:id
const updatePolicy = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Policy text is required' });
    }
    const policy = await Policy.findByIdAndUpdate(
      req.params.id,
      { text: text.trim() },
      { new: true }
    );
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.status(200).json({ message: 'Policy updated successfully', policy });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update policy', error: error.message });
  }
};

// DELETE /api/admin/policies/:id
const deletePolicy = async (req, res) => {
  try {
    const policy = await Policy.findByIdAndDelete(req.params.id);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });
    res.status(200).json({ message: 'Policy deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete policy', error: error.message });
  }
};

// ── COMMISSION ─────────────────────────────────────────
// GET /api/admin/commission
const getCommission = async (req, res) => {
  try {
    let commission = await Commission.findOne().sort({ createdAt: -1 });
    if (!commission) commission = { rate: 10 };
    res.status(200).json(commission);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch commission rate', error: error.message });
  }
};

// PUT /api/admin/commission
const updateCommission = async (req, res) => {
  try {
    const { rate } = req.body;
    if (rate === undefined || rate === null) {
      return res.status(400).json({ message: 'Rate is required' });
    }
    if (rate < 0 || rate > 100) {
      return res.status(400).json({ message: 'Rate must be between 0 and 100' });
    }
    const commission = await Commission.create({
      rate,
      updatedBy: req.user._id,
    });
    res.status(200).json({ message: 'Commission rate updated successfully', commission });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update commission rate', error: error.message });
  }
};

// GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// PUT /api/admin/profile
const updateAdminProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;

    const admin = await User.findById(req.user._id);

    if (name) admin.name = name.trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      const isMatch = await admin.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      admin.password = await User.hashPassword(newPassword);
    }

    await admin.save();

    const updated = await User.findById(admin._id).select('-password');
    res.status(200).json({ message: 'Profile updated successfully', user: updated });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// ── DISPUTES ───────────────────────────────────────────
// GET /api/admin/disputes
const getAllDisputes = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    const filter = {};
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (search)   filter.$or = [
      { subject:     { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { disputeId:   { $regex: search, $options: 'i' } },
    ];

    const disputes = await Dispute.find(filter)
      .populate('submittedBy', 'name email role')
      .populate('against',     'name email role')
      .populate('campaignId',  'title')
      .sort({ createdAt: -1 });

    res.status(200).json(disputes);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch disputes', error: error.message });
  }
};

// PATCH /api/admin/disputes/:id/resolve
const resolveDispute = async (req, res) => {
  try {
    const { adminResponse } = req.body;

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    if (dispute.status === 'Resolved') {
      return res.status(400).json({ message: 'Dispute is already resolved' });
    }

    dispute.status        = 'Resolved';
    dispute.resolvedAt    = new Date();
    dispute.resolvedBy    = req.user._id;
    dispute.adminResponse = adminResponse || '';

    await dispute.save();

    res.status(200).json({ message: 'Dispute resolved successfully', dispute });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve dispute', error: error.message });
  }
};

// GET /api/admin/disputes/stats
const getDisputeStats = async (req, res) => {
  try {
    const total    = await Dispute.countDocuments();
    const pending  = await Dispute.countDocuments({ status: 'Pending' });
    const resolved = await Dispute.countDocuments({ status: 'Resolved' });
    const high     = await Dispute.countDocuments({ status: 'Pending', priority: 'High' });

    res.status(200).json({ total, pending, resolved, high });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dispute stats', error: error.message });
  }
};

const getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate('submittedBy', 'name email role')
      .populate('against',     'name email role')
      .populate('campaignId',  'title')
      .populate('resolvedBy',  'name');

    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    res.status(200).json(dispute);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dispute', error: error.message });
  }
};

// ── TODO (no models yet) ───────────────────────────────
// getAllContracts    → waiting for Contract model
// getAllTransactions → waiting for Transaction model

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  toggleSuspendUser,
  deleteUser,
  getInfluencerProfile,
  getBrandProfile,
  getAllInfluencers,
  updateInfluencerBioStatus,
  getAllCampaigns,
  getCampaignById,
  getAllBrands,
  getAllApplications,
  getPolicies,
  addPolicy,
  updatePolicy,
  deletePolicy,
  getCommission,
  updateCommission,
  getAdminProfile,
  updateAdminProfile,
  getAllDisputes,
  resolveDispute,
  getDisputeStats,
  getDisputeById,
};
