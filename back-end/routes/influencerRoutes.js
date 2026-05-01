const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createInfluencer,
  getInfluencers,
  getInfluencerById,
  updateInfluencer,
  getCurrentInfluencerProfile,
  updateCurrentInfluencerProfile,
  deleteInfluencer,
} = require('../controllers/influencerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

/*
Postman examples

POST /api/influencers
Authorization: Bearer <influencer-jwt>
{
  "bio": "Lifestyle creator focused on beauty and wellness.",
  "niche": "beauty",
  "socialLinks": {
    "instagram": "https://instagram.com/example",
    "tiktok": "https://tiktok.com/@example",
    "youtube": "https://youtube.com/@example",
    "website": "https://example.com"
  },
  "followers": 25000,
  "status": "active"
}

GET /api/influencers?niche=beauty&status=active

PUT /api/influencers/:id
Authorization: Bearer <influencer-jwt>
{
  "bio": "Updated influencer bio.",
  "followers": 30000
}

DELETE /api/influencers/:id
Authorization: Bearer <influencer-jwt>
*/

const influencerBodyValidation = [
  body('name').optional().isString().withMessage('name must be a string'),
  body('email').optional().isEmail().withMessage('email must be a valid email'),
  body('bio').optional().isString().withMessage('bio must be a string'),
  body('location').optional().isString().withMessage('location must be a string'),
  body('website').optional().isString().withMessage('website must be a string'),
  body('instagram').optional().isString().withMessage('instagram must be a string'),
  body('tiktok').optional().isString().withMessage('tiktok must be a string'),
  body('youtube').optional().isString().withMessage('youtube must be a string'),
  body('niche').optional().isString().withMessage('niche must be a string'),
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage('socialLinks must be an object'),
  body('socialLinks.instagram')
    .optional()
    .isString()
    .withMessage('socialLinks.instagram must be a string'),
  body('socialLinks.tiktok')
    .optional()
    .isString()
    .withMessage('socialLinks.tiktok must be a string'),
  body('socialLinks.youtube')
    .optional()
    .isString()
    .withMessage('socialLinks.youtube must be a string'),
  body('socialLinks.website')
    .optional()
    .isString()
    .withMessage('socialLinks.website must be a string'),
  body('followers')
    .optional()
    .custom((value) => typeof value === 'string' || typeof value === 'number')
    .withMessage('followers must be a string or number'),
  body('engagement').optional().isString().withMessage('engagement must be a string'),
  body('categories')
    .optional()
    .custom((value) => Array.isArray(value) || typeof value === 'string')
    .withMessage('categories must be an array or comma-separated string'),
  body('rates').optional().isObject().withMessage('rates must be an object'),
  body('rates.post').optional().isString().withMessage('rates.post must be a string'),
  body('rates.story').optional().isString().withMessage('rates.story must be a string'),
  body('rates.video').optional().isString().withMessage('rates.video must be a string'),
  body('audience').optional().isObject().withMessage('audience must be an object'),
  body('audience.age').optional().isString().withMessage('audience.age must be a string'),
  body('audience.gender').optional().isString().withMessage('audience.gender must be a string'),
  body('audience.location')
    .optional()
    .isString()
    .withMessage('audience.location must be a string'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'pending', 'verified', 'suspended'])
    .withMessage('status must be one of: active, inactive, pending, verified, suspended'),
];

router.post(
  '/',
  protect,
  authorize('influencer'),
  influencerBodyValidation,
  createInfluencer
);

router.get(
  '/',
  [
    query('niche').optional().isString().withMessage('niche must be a string'),
    query('category').optional().isString().withMessage('category must be a string'),
    query('search').optional().isString().withMessage('search must be a string'),
    query('status')
      .optional()
      .isIn(['active', 'inactive', 'pending', 'verified', 'suspended'])
      .withMessage('status must be one of: active, inactive, pending, verified, suspended'),
  ],
  getInfluencers
);

router.get(
  '/profile/me',
  protect,
  authorize('influencer'),
  getCurrentInfluencerProfile
);

router.put(
  '/profile/me',
  protect,
  authorize('influencer'),
  influencerBodyValidation,
  updateCurrentInfluencerProfile
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid influencer id')],
  getInfluencerById
);

router.put(
  '/:id',
  protect,
  authorize('influencer'),
  [param('id').isMongoId().withMessage('Invalid influencer id'), ...influencerBodyValidation],
  updateInfluencer
);

router.delete(
  '/:id',
  protect,
  authorize('influencer'),
  [param('id').isMongoId().withMessage('Invalid influencer id')],
  deleteInfluencer
);

module.exports = router;
