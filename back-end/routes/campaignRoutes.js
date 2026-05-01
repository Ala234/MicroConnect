const express = require('express');
const { body, param, query } = require('express-validator');
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getCampaignApplications,
  updateApplicationStatus,
} = require('../controllers/campaignController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const campaignRouter = express.Router();
const applicationRouter = express.Router();

/*
Postman examples

POST /api/campaigns
Authorization: Bearer <brand-jwt>
{
  "title": "Summer Serum Launch",
  "description": "Promote our new serum with short-form content.",
  "budget": 5000,
  "requirements": "At least 20k followers and beauty niche audience.",
  "targetNiche": "beauty",
  "deadline": "2026-06-15T00:00:00.000Z",
  "status": "open"
}

GET /api/campaigns?status=open&targetNiche=beauty&minBudget=1000&maxBudget=10000&brandId=<brandId>

PUT /api/campaigns/:id
Authorization: Bearer <brand-jwt>
{
  "budget": 6500,
  "status": "closed"
}

DELETE /api/campaigns/:id
Authorization: Bearer <brand-jwt>

GET /api/campaigns/:id/applications
Authorization: Bearer <brand-jwt>

PUT /api/applications/:id/status
Authorization: Bearer <brand-jwt>
{
  "status": "accepted",
  "brandResponse": "Approved. We will contact you with next steps."
}
*/

const campaignBodyValidation = [
  body().custom((_, { req }) => {
    if (req.body.title || req.body.name) {
      return true;
    }

    throw new Error('title or name is required');
  }),
  body('title').optional().trim().notEmpty().withMessage('title cannot be empty'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('objective').optional().isString().withMessage('objective must be a string'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('description is required'),
  body('budget')
    .isFloat({ min: 0 })
    .withMessage('budget must be a number greater than or equal to 0'),
  body('requirements')
    .optional()
    .isString()
    .withMessage('requirements must be a string'),
  body('targetNiche')
    .optional()
    .isString()
    .withMessage('targetNiche must be a string'),
  body('targetAudience')
    .optional()
    .isString()
    .withMessage('targetAudience must be a string'),
  body('platforms')
    .optional()
    .custom((value) => Array.isArray(value) || typeof value === 'string')
    .withMessage('platforms must be an array or comma-separated string'),
  body('contentType')
    .optional()
    .isString()
    .withMessage('contentType must be a string'),
  body('imageSrc').optional().isString().withMessage('imageSrc must be a string'),
  body('imageKey').optional().isString().withMessage('imageKey must be a string'),
  body('startDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('startDate must be a valid date'),
  body('endDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('endDate must be a valid date'),
  body('influencersCount')
    .optional()
    .custom((value) => typeof value === 'string' || typeof value === 'number')
    .withMessage('influencersCount must be a string or number'),
  body('reach')
    .optional()
    .custom((value) => typeof value === 'string' || typeof value === 'number')
    .withMessage('reach must be a string or number'),
  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('progress must be between 0 and 100'),
  body('deadline')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('deadline must be a valid date'),
  body('status')
    .optional()
    .isIn(['open', 'closed', 'draft'])
    .withMessage('status must be one of: open, closed, draft'),
];

const campaignUpdateValidation = [
  body('title').optional().trim().notEmpty().withMessage('title cannot be empty'),
  body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
  body('objective').optional().isString().withMessage('objective must be a string'),
  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('description cannot be empty'),
  body('budget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('budget must be a number greater than or equal to 0'),
  body('requirements')
    .optional()
    .isString()
    .withMessage('requirements must be a string'),
  body('targetNiche')
    .optional()
    .isString()
    .withMessage('targetNiche must be a string'),
  body('targetAudience')
    .optional()
    .isString()
    .withMessage('targetAudience must be a string'),
  body('platforms')
    .optional()
    .custom((value) => Array.isArray(value) || typeof value === 'string')
    .withMessage('platforms must be an array or comma-separated string'),
  body('contentType')
    .optional()
    .isString()
    .withMessage('contentType must be a string'),
  body('imageSrc').optional().isString().withMessage('imageSrc must be a string'),
  body('imageKey').optional().isString().withMessage('imageKey must be a string'),
  body('startDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('startDate must be a valid date'),
  body('endDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('endDate must be a valid date'),
  body('influencersCount')
    .optional()
    .custom((value) => typeof value === 'string' || typeof value === 'number')
    .withMessage('influencersCount must be a string or number'),
  body('reach')
    .optional()
    .custom((value) => typeof value === 'string' || typeof value === 'number')
    .withMessage('reach must be a string or number'),
  body('progress')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('progress must be between 0 and 100'),
  body('deadline')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('deadline must be a valid date'),
  body('status')
    .optional()
    .isIn(['open', 'closed', 'draft'])
    .withMessage('status must be one of: open, closed, draft'),
];

campaignRouter.post(
  '/',
  protect,
  authorize('brand'),
  campaignBodyValidation,
  createCampaign
);

campaignRouter.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(['open', 'closed', 'draft'])
      .withMessage('status must be one of: open, closed, draft'),
    query('targetNiche')
      .optional()
      .isString()
      .withMessage('targetNiche must be a string'),
    query('search').optional().isString().withMessage('search must be a string'),
    query('budget')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('budget must be one of: low, medium, high'),
    query('age')
      .optional()
      .isIn(['teens', 'young-adults', 'adults'])
      .withMessage('age must be one of: teens, young-adults, adults'),
    query('gender').optional().isString().withMessage('gender must be a string'),
    query('interests').optional().isString().withMessage('interests must be a string'),
    query('objective').optional().isString().withMessage('objective must be a string'),
    query('contentType').optional().isString().withMessage('contentType must be a string'),
    query('platforms').optional().isString().withMessage('platforms must be a string'),
    query('minBudget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('minBudget must be a non-negative number'),
    query('maxBudget')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('maxBudget must be a non-negative number'),
    query('brandId').optional().isMongoId().withMessage('Invalid brandId'),
  ],
  getCampaigns
);

campaignRouter.get(
  '/:id/applications',
  protect,
  authorize('brand'),
  [param('id').isMongoId().withMessage('Invalid campaign id')],
  getCampaignApplications
);

campaignRouter.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid campaign id')],
  getCampaignById
);

campaignRouter.put(
  '/:id',
  protect,
  authorize('brand'),
  [param('id').isMongoId().withMessage('Invalid campaign id'), ...campaignUpdateValidation],
  updateCampaign
);

campaignRouter.delete(
  '/:id',
  protect,
  authorize('brand'),
  [param('id').isMongoId().withMessage('Invalid campaign id')],
  deleteCampaign
);

applicationRouter.put(
  '/:id/status',
  protect,
  authorize('brand'),
  [
    param('id').isMongoId().withMessage('Invalid application id'),
    body('status')
      .isIn(['accepted', 'rejected'])
      .withMessage('status must be either accepted or rejected'),
    body('brandResponse')
      .optional()
      .isString()
      .withMessage('brandResponse must be a string'),
  ],
  updateApplicationStatus
);

module.exports = {
  campaignRouter,
  applicationRouter,
};
