const express = require('express');
const router = express.Router();
const {
  createApplication,
  getApplicationsForCampaign,
  getMyApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/', protect, authorize('influencer'), createApplication);
router.get('/my', protect, authorize('influencer'), getMyApplications);
router.get('/campaign/:campaignId', protect, authorize('brand'), getApplicationsForCampaign);
router.put('/:id', protect, authorize('brand'), updateApplicationStatus);

module.exports = router;