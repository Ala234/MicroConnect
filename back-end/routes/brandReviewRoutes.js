const express = require('express');
const {
  createBrandReview,
  getBrandReviewsByBrand,
  getBrandReviewsByCampaign,
  getBrandReviewByApplication,
} = require('../controllers/brandReviewController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', protect, authorize('influencer'), createBrandReview);
router.get('/brand/:brandId', protect, getBrandReviewsByBrand);
router.get('/campaign/:campaignId', protect, getBrandReviewsByCampaign);
router.get('/application/:applicationId', protect, getBrandReviewByApplication);

module.exports = router;
