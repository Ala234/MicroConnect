const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createInfluencer,
  getInfluencers,
  getInfluencerById,
  updateInfluencer,
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
  body('bio').optional().isString().withMessage('bio must be a string'),
  body('niche').optional().isString().withMessage('niche must be a string'),
  body('socialLinks')
    .optional()
    .isObject()
    .withMessage('socialLinks must be an object'),
  body('socialLinks.instagram')
    .optional()
    .isURL()
    .withMessage('instagram must be a valid URL'),
  body('socialLinks.tiktok')
    .optional()
    .isURL()
    .withMessage('tiktok must be a valid URL'),
  body('socialLinks.youtube')
    .optional()
    .isURL()
    .withMessage('youtube must be a valid URL'),
  body('socialLinks.website')
    .optional()
    .isURL()
    .withMessage('website must be a valid URL'),
  body('followers')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('followers must be a number greater than or equal to 0'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('status must be one of: active, inactive'),
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
    query('status')
      .optional()
      .isIn(['active', 'inactive'])
      .withMessage('status must be one of: active, inactive'),
  ],
  getInfluencers
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

