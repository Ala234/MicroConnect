const express = require('express');
const {
  createReview,
  getReviewsByBrand,
  getReviewsByInfluencer,
  getReviewsByCampaign,
  getReviewsByContract,
  getReviewsByApplication,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, message: 'Reviews API is available' });
});
router.post('/', protect, createReview);
router.get('/brand/:brandId', protect, getReviewsByBrand);
router.get('/influencer/:influencerId', protect, getReviewsByInfluencer);
router.get('/campaign/:campaignId', protect, getReviewsByCampaign);
router.get('/contract/:contractId', protect, getReviewsByContract);
router.get('/application/:applicationId', protect, getReviewsByApplication);

module.exports = router;
