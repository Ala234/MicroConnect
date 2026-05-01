const { validationResult } = require('express-validator');
const Influencer = require('../models/Influencer');

const getValidationError = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  return res.status(400).json({ errors: errors.array() });
};

const getOwnedInfluencer = async (influencerId, userId) => {
  const influencer = await Influencer.findById(influencerId);

  if (!influencer) {
    return { status: 404, body: { message: 'Influencer not found' } };
  }

  if (influencer.userId.toString() !== userId.toString()) {
    return { status: 403, body: { message: 'Forbidden: not your profile' } };
  }

  return { influencer };
};

exports.createInfluencer = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const existingInfluencer = await Influencer.findOne({ userId: req.user._id });
    if (existingInfluencer) {
      return res.status(400).json({ message: 'Influencer profile already exists' });
    }

    const influencer = await Influencer.create({
      userId: req.user._id,
      bio: req.body.bio,
      niche: req.body.niche,
      socialLinks: req.body.socialLinks,
      followers: req.body.followers,
      status: req.body.status,
    });

    const populatedInfluencer = await Influencer.findById(influencer._id).populate(
      'userId',
      'name email role'
    );

    res.status(201).json({
      message: 'Influencer profile created successfully',
      influencer: populatedInfluencer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getInfluencers = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const filters = {};

    if (req.query.niche) {
      filters.niche = req.query.niche;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    const influencers = await Influencer.find(filters)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ influencers });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getInfluencerById = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const influencer = await Influencer.findById(req.params.id).populate(
      'userId',
      'name email role'
    );

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    res.status(200).json({ influencer });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateInfluencer = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const ownedInfluencerResult = await getOwnedInfluencer(
      req.params.id,
      req.user._id
    );
    if (!ownedInfluencerResult.influencer) {
      return res
        .status(ownedInfluencerResult.status)
        .json(ownedInfluencerResult.body);
    }

    const influencer = ownedInfluencerResult.influencer;
    const fields = ['bio', 'niche', 'socialLinks', 'followers', 'status'];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        influencer[field] = req.body[field];
      }
    });

    await influencer.save();

    const populatedInfluencer = await Influencer.findById(influencer._id).populate(
      'userId',
      'name email role'
    );

    res.status(200).json({
      message: 'Influencer profile updated successfully',
      influencer: populatedInfluencer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteInfluencer = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const ownedInfluencerResult = await getOwnedInfluencer(
      req.params.id,
      req.user._id
    );
    if (!ownedInfluencerResult.influencer) {
      return res
        .status(ownedInfluencerResult.status)
        .json(ownedInfluencerResult.body);
    }

    await ownedInfluencerResult.influencer.deleteOne();

    res.status(200).json({ message: 'Influencer profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

