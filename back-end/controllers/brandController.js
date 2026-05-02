const { validationResult } = require('express-validator');
const Brand = require('../models/Brand');

const getValidationError = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  return res.status(400).json({ errors: errors.array() });
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().populate('userId', 'name email role');
    res.status(200).json({ brands });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getBrandById = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const brand = await Brand.findById(req.params.id).populate(
      'userId',
      'name email role'
    );

    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    res.status(200).json({ brand });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.upsertBrandProfile = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const payload = {
      companyName: req.body.companyName,
      industry: req.body.industry,
      website: req.body.website,
      logo: req.body.logo,
      description: req.body.description,
      location: req.body.location,
      instagram: req.body.instagram,
      tiktok: req.body.tiktok,
      twitter: req.body.twitter,
    };

    const brand = await Brand.findOneAndUpdate(
      { userId: req.user._id },
      { $set: payload, $setOnInsert: { userId: req.user._id } },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).populate('userId', 'name email role');

    res.status(200).json({
      message: 'Brand profile saved successfully',
      brand,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
