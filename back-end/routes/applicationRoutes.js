const express = require('express');
const router = express.Router();
const {
  createApplication,
  getAllApplications,
  getApplicationsForCampaign,
  getMyApplications,
  getApplicationsByInfluencer,
  getApplicationsByBrand,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('influencer'), createApplication);
router.get('/', protect, getAllApplications);
router.get('/my', protect, authorize('influencer'), getMyApplications);
router.get('/campaign/:campaignId', protect, authorize('brand', 'admin'), getApplicationsForCampaign);
router.get('/influencer/:influencerId', protect, getApplicationsByInfluencer);
router.get('/brand/:brandId', protect, getApplicationsByBrand);
router.get('/:id', protect, getApplicationById);
router.put('/:id/status', protect, authorize('brand', 'admin'), updateApplicationStatus);
router.put('/:id', protect, authorize('brand', 'admin'), updateApplication);

module.exports = router;
