const express = require('express');
const router = express.Router();
const {
  createCampaign,
  getAllCampaigns,
  getMyCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
} = require('../controllers/campaignController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Public to logged-in users
router.get('/', protect, getAllCampaigns);
router.get('/my', protect, authorize('brand'), getMyCampaigns);
router.get('/:id', protect, getCampaignById);

// Brand only
router.post('/', protect, authorize('brand'), createCampaign);
router.put('/:id', protect, authorize('brand'), updateCampaign);
router.delete('/:id', protect, authorize('brand'), deleteCampaign);

module.exports = router;