const express = require('express');
const { body, param } = require('express-validator');
const {
  getBrands,
  getBrandById,
  upsertBrandProfile,
} = require('../controllers/brandController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

/*
Postman examples

PUT /api/brands/profile
Authorization: Bearer <brand-jwt>
{
  "companyName": "Glow Labs",
  "industry": "Beauty",
  "website": "https://glowlabs.example",
  "logo": "https://cdn.example.com/glow-logo.png",
  "description": "Clean skincare brand focused on creator partnerships."
}
*/

router.get('/', getBrands);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid brand id')],
  getBrandById
);

router.put(
  '/profile',
  protect,
  authorize('brand'),
  [
    body('companyName')
      .trim()
      .notEmpty()
      .withMessage('companyName is required'),
    body('industry').optional().isString().withMessage('industry must be a string'),
    body('website').optional().isURL().withMessage('website must be a valid URL'),
    body('logo').optional().isURL().withMessage('logo must be a valid URL'),
    body('description')
      .optional()
      .isString()
      .withMessage('description must be a string'),
  ],
  upsertBrandProfile
);

module.exports = router;
