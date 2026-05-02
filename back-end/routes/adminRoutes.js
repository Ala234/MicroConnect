const express = require('express');
const router  = express.Router();

const {
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
  getInfluencerProfile,
  getBrandProfile
} = require('../controllers/adminController');

const { protect }   = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All routes require login + admin role
router.use(protect);
router.use(authorize('admin'));

// ── DASHBOARD ──────────────────────────────────────────
router.get('/stats', getDashboardStats);

// ── USERS ──────────────────────────────────────────────
router.get   ('/users',             getAllUsers);
router.get   ('/users/:id',         getUserById);
router.patch ('/users/:id/suspend', toggleSuspendUser);
router.delete('/users/:id',         deleteUser);
router.get('/users/:id/influencer-profile', getInfluencerProfile);
router.get('/users/:id/brand-profile', getBrandProfile);

// ── CAMPAIGNS ──────────────────────────────────────────
router.get('/campaigns',     getAllCampaigns);
router.get('/campaigns/:id', getCampaignById);

// ── BRANDS ─────────────────────────────────────────────
router.get('/brands', getAllBrands);

// ── APPLICATIONS ───────────────────────────────────────
router.get('/applications', getAllApplications);

// ── POLICIES ───────────────────────────────────────────
router.get   ('/policies',     getPolicies);
router.post  ('/policies',     addPolicy);
router.put   ('/policies/:id', updatePolicy);
router.delete('/policies/:id', deletePolicy);

// ── COMMISSION ─────────────────────────────────────────
router.get('/commission', getCommission);
router.put('/commission', updateCommission);

// ── TODO (no models yet) ───────────────────────────────
// router.get   ('/contracts',              getAllContracts);
// router.get   ('/disputes',               getAllDisputes);
// router.patch ('/disputes/:id/resolve',   resolveDispute);
// router.get   ('/transactions',           getAllTransactions);

module.exports = router;