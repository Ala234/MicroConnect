const { validationResult } = require('express-validator');
const Influencer = require('../models/Influencer');

const influencerPopulate = ['userId', 'name email role'];
const socialFields = ['instagram', 'tiktok', 'youtube', 'website'];

const defaultRates = {
  post: '',
  story: '',
  video: '',
};

const defaultAudience = {
  age: '',
  gender: '',
  location: '',
};

const getValidationError = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  return res.status(400).json({ errors: errors.array() });
};

const normalizeStringArray = (value) => {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const cleanObject = (payload) => {
  return Object.entries(payload).reduce((cleaned, [key, value]) => {
    if (value !== undefined) {
      cleaned[key] = value;
    }

    return cleaned;
  }, {});
};

const getSocialLinksPayload = (body) => {
  const socialLinks = {
    ...(body.socialLinks && typeof body.socialLinks === 'object' ? body.socialLinks : {}),
  };

  socialFields.forEach((field) => {
    if (body[field] !== undefined) {
      socialLinks[field] = body[field];
    }
  });

  return Object.keys(socialLinks).length ? socialLinks : undefined;
};

const mergeNestedObject = (currentValue, nextValue) => {
  const currentObject = currentValue?.toObject ? currentValue.toObject() : currentValue || {};
  return {
    ...currentObject,
    ...nextValue,
  };
};

const buildInfluencerPayload = (body, user) => {
  const categories = normalizeStringArray(body.categories);
  const socialLinks = getSocialLinksPayload(body);
  const payload = {
    userId: user._id,
    name: body.name || user.name,
    email: body.email || user.email,
    bio: body.bio,
    location: body.location,
    website: body.website ?? socialLinks?.website,
    instagram: body.instagram ?? socialLinks?.instagram,
    tiktok: body.tiktok ?? socialLinks?.tiktok,
    youtube: body.youtube ?? socialLinks?.youtube,
    followers: body.followers,
    engagement: body.engagement,
    categories: categories ?? (body.niche ? [body.niche] : undefined),
    rates: body.rates,
    audience: body.audience,
    status: body.status,
    niche: body.niche,
    socialLinks,
  };

  return cleanObject(payload);
};

const applyInfluencerUpdates = (influencer, body) => {
  const fields = [
    'name',
    'email',
    'bio',
    'location',
    'website',
    'instagram',
    'tiktok',
    'youtube',
    'followers',
    'engagement',
    'niche',
    'status',
  ];

  fields.forEach((field) => {
    if (body[field] !== undefined) {
      influencer[field] = body[field];
    }
  });

  const categories = normalizeStringArray(body.categories);
  if (categories !== undefined) {
    influencer.categories = categories;
  }

  if (body.rates !== undefined) {
    influencer.rates = mergeNestedObject(influencer.rates, body.rates);
  }

  if (body.audience !== undefined) {
    influencer.audience = mergeNestedObject(influencer.audience, body.audience);
  }

  const socialLinks = getSocialLinksPayload(body);
  if (socialLinks) {
    influencer.socialLinks = mergeNestedObject(influencer.socialLinks, socialLinks);
  }
};

const populateInfluencer = (query) => query.populate(...influencerPopulate);

const formatInfluencer = (influencer) => {
  const influencerObject = influencer.toObject({ virtuals: true });
  const user = influencerObject.userId && typeof influencerObject.userId === 'object'
    ? influencerObject.userId
    : {};
  const socialLinks = influencerObject.socialLinks || {};
  const rates = influencerObject.rates || {};
  const audience = influencerObject.audience || {};

  return {
    ...influencerObject,
    id: influencerObject._id.toString(),
    name: influencerObject.name || user.name || '',
    email: influencerObject.email || user.email || '',
    bio: influencerObject.bio || '',
    location: influencerObject.location || '',
    website: influencerObject.website || socialLinks.website || '',
    instagram: influencerObject.instagram || socialLinks.instagram || '',
    tiktok: influencerObject.tiktok || socialLinks.tiktok || '',
    youtube: influencerObject.youtube || socialLinks.youtube || '',
    followers: influencerObject.followers || '0',
    engagement: influencerObject.engagement || '0%',
    categories: Array.isArray(influencerObject.categories)
      ? influencerObject.categories
      : influencerObject.niche
        ? [influencerObject.niche]
        : [],
    rates: {
      ...defaultRates,
      ...rates,
    },
    audience: {
      ...defaultAudience,
      ...audience,
    },
    status: influencerObject.status || 'active',
  };
};

const formatInfluencers = (influencers) => influencers.map(formatInfluencer);

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

    const influencer = await Influencer.create(buildInfluencerPayload(req.body, req.user));

    const populatedInfluencer = await populateInfluencer(Influencer.findById(influencer._id));

    res.status(201).json({
      message: 'Influencer profile created successfully',
      influencer: formatInfluencer(populatedInfluencer),
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

    if (req.query.category) {
      filters.categories = req.query.category;
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filters.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { bio: searchRegex },
        { location: searchRegex },
        { niche: searchRegex },
        { categories: searchRegex },
      ];
    }

    const influencers = await populateInfluencer(
      Influencer.find(filters).sort({ createdAt: -1 })
    );

    res.status(200).json({ influencers: formatInfluencers(influencers) });
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
    const influencer = await populateInfluencer(Influencer.findById(req.params.id));

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer not found' });
    }

    res.status(200).json({ influencer: formatInfluencer(influencer) });
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
    applyInfluencerUpdates(influencer, req.body);
    await influencer.save();

    const populatedInfluencer = await populateInfluencer(Influencer.findById(influencer._id));

    res.status(200).json({
      message: 'Influencer profile updated successfully',
      influencer: formatInfluencer(populatedInfluencer),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCurrentInfluencerProfile = async (req, res) => {
  try {
    const influencer = await populateInfluencer(
      Influencer.findOne({ userId: req.user._id })
    );

    if (!influencer) {
      return res.status(404).json({ message: 'Influencer profile not found' });
    }

    res.status(200).json({ influencer: formatInfluencer(influencer) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCurrentInfluencerProfile = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    let influencer = await Influencer.findOne({ userId: req.user._id });

    if (!influencer) {
      influencer = new Influencer(buildInfluencerPayload(req.body, req.user));
    } else {
      applyInfluencerUpdates(influencer, req.body);
    }

    await influencer.save();

    const populatedInfluencer = await populateInfluencer(Influencer.findById(influencer._id));

    res.status(200).json({
      message: 'Influencer profile saved successfully',
      influencer: formatInfluencer(populatedInfluencer),
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
