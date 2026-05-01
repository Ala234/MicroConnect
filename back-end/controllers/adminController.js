const User        = require('../models/User');
const Campaign    = require('../models/Campaign');
const Brand       = require('../models/Brand');
const Application = require('../models/Application');
const { Policy, Commission } = require('../models/Settings');

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

    res.status(200).json({
      totalUsers,
      totalBrands,
      totalInfluencers,
      totalCampaigns,
      activeCampaigns,
      totalApplications,
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
    if (role)              filter.role     = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search)            filter.$or = [
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

// ── TODO (no models yet) ───────────────────────────────
// getAllContracts    → waiting for Contract model
// getAllDisputes     → waiting for Dispute model
// resolveDispute    → waiting for Dispute model
// getAllTransactions → waiting for Transaction model
// getContentReview  → waiting for Content model

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserById,
  toggleSuspendUser,
  deleteUser,
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
};