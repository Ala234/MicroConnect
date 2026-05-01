const express = require('express');
const { body, param, query } = require('express-validator');
const {
  submitApplication,
  getApplications,
  getApplicationsByInfluencer,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

const statusValues = ['Pending', 'Under Review', 'Accepted', 'Rejected', 'pending', 'accepted', 'rejected'];

const applicationBodyValidation = [
  body('influencer').optional().isMongoId().withMessage('Invalid influencer id'),
  body('influencerId').optional().isMongoId().withMessage('Invalid influencerId'),
  body('campaign').optional().isMongoId().withMessage('Invalid campaign id'),
  body('campaignId').optional().isMongoId().withMessage('Invalid campaignId'),
  body('campaignName').optional().isString().withMessage('campaignName must be a string'),
  body('brandName').optional().isString().withMessage('brandName must be a string'),
  body('proposal').trim().notEmpty().withMessage('proposal is required'),
  body('status')
    .optional()
    .isIn(statusValues)
    .withMessage('status must be one of: Pending, Under Review, Accepted, Rejected'),
  body('appliedDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('appliedDate must be a valid date'),
  body('brandResponse')
    .optional()
    .isString()
    .withMessage('brandResponse must be a string'),
];

const applicationUpdateValidation = [
  body('campaignName').optional().isString().withMessage('campaignName must be a string'),
  body('brandName').optional().isString().withMessage('brandName must be a string'),
  body('proposal').optional().trim().notEmpty().withMessage('proposal cannot be empty'),
  body('status')
    .optional()
    .isIn(statusValues)
    .withMessage('status must be one of: Pending, Under Review, Accepted, Rejected'),
  body('statusTone')
    .optional()
    .isIn(['pending', 'review', 'accepted', 'rejected'])
    .withMessage('statusTone must be one of: pending, review, accepted, rejected'),
  body('appliedDate')
    .optional({ values: 'falsy' })
    .isISO8601()
    .withMessage('appliedDate must be a valid date'),
  body('brandResponse')
    .optional()
    .isString()
    .withMessage('brandResponse must be a string'),
];

router.post(
  '/',
  protect,
  authorize('influencer'),
  applicationBodyValidation,
  submitApplication
);

router.get(
  '/',
  [
    query('status')
      .optional()
      .isIn(statusValues)
      .withMessage('status must be one of: Pending, Under Review, Accepted, Rejected'),
    query('campaignId').optional().isMongoId().withMessage('Invalid campaignId'),
    query('influencerId').optional().isMongoId().withMessage('Invalid influencerId'),
  ],
  getApplications
);

router.get(
  '/influencer/:influencerId',
  [param('influencerId').isMongoId().withMessage('Invalid influencer id')],
  getApplicationsByInfluencer
);

router.put(
  '/:id/status',
  protect,
  authorize('brand', 'admin'),
  [
    param('id').isMongoId().withMessage('Invalid application id'),
    body('status')
      .isIn(statusValues)
      .withMessage('status must be one of: Pending, Under Review, Accepted, Rejected'),
    body('brandResponse')
      .optional()
      .isString()
      .withMessage('brandResponse must be a string'),
  ],
  updateApplication
);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid application id')],
  getApplicationById
);

router.put(
  '/:id',
  protect,
  authorize('brand', 'influencer', 'admin'),
  [param('id').isMongoId().withMessage('Invalid application id'), ...applicationUpdateValidation],
  updateApplication
);

router.delete(
  '/:id',
  protect,
  authorize('brand', 'influencer', 'admin'),
  [param('id').isMongoId().withMessage('Invalid application id')],
  deleteApplication
);

module.exports = router;
