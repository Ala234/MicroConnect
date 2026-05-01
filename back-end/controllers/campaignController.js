const { validationResult } = require('express-validator');
const Application = require('../models/Application');
const Brand = require('../models/Brand');
const Campaign = require('../models/Campaign');

const getValidationError = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  return res.status(400).json({ errors: errors.array() });
};

const brandPopulate = {
  path: 'brandId',
  populate: {
    path: 'userId',
    select: 'name email role',
  },
};

const textFilterFields = [
  'name',
  'title',
  'description',
  'objective',
  'targetAudience',
  'targetNiche',
  'requirements',
  'contentType',
];

const influencerCampaignFields = [
  'name',
  'objective',
  'targetAudience',
  'platforms',
  'contentType',
  'imageSrc',
  'imageKey',
  'startDate',
  'endDate',
  'influencersCount',
  'reach',
  'progress',
];

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const makeRegex = (value) => new RegExp(escapeRegex(value), 'i');

const splitQueryList = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap(splitQueryList);
  }

  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizePlatforms = (value) => splitQueryList(value);

const buildTextFilter = (fields, value) => ({
  $or: fields.map((field) => ({ [field]: makeRegex(value) })),
});

const formatCampaign = (campaign) => {
  const campaignObject = campaign.toObject({ virtuals: true });

  return {
    ...campaignObject,
    id: campaignObject._id.toString(),
    name: campaignObject.name || campaignObject.title,
    title: campaignObject.title || campaignObject.name,
    objective: campaignObject.objective || campaignObject.targetNiche || '',
    targetAudience:
      campaignObject.targetAudience || campaignObject.targetNiche || campaignObject.requirements || '',
    platforms: Array.isArray(campaignObject.platforms) ? campaignObject.platforms : [],
    contentType: campaignObject.contentType || '',
    imageSrc: campaignObject.imageSrc || '',
    startDate: campaignObject.startDate || campaignObject.createdAt,
    endDate: campaignObject.endDate || campaignObject.deadline,
    influencersCount: campaignObject.influencersCount || '0',
  };
};

const formatCampaigns = (campaigns) => campaigns.map(formatCampaign);

const buildCampaignPayload = (body, brandId) => {
  const payload = {
    title: body.title || body.name,
    description: body.description,
    budget: body.budget,
    requirements: body.requirements,
    targetNiche: body.targetNiche,
    deadline: body.deadline || body.endDate,
    status: body.status,
    brandId,
  };

  influencerCampaignFields.forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = field === 'platforms' ? normalizePlatforms(body[field]) : body[field];
    }
  });

  if (!payload.name && payload.title) {
    payload.name = payload.title;
  }

  return payload;
};

const applyCampaignFilters = (filters, query) => {
  const andFilters = [];

  if (query.search) {
    andFilters.push(buildTextFilter(textFilterFields, query.search));
  }

  if (query.objective) {
    filters.objective = makeRegex(query.objective);
  }

  if (query.contentType) {
    filters.contentType = makeRegex(query.contentType);
  }

  if (query.platforms) {
    filters.platforms = { $in: splitQueryList(query.platforms).map(makeRegex) };
  }

  if (query.budget) {
    if (query.budget === 'low') {
      filters.budget = { ...(filters.budget || {}), $lt: 1200 };
    } else if (query.budget === 'medium') {
      filters.budget = { ...(filters.budget || {}), $gte: 1200, $lt: 2000 };
    } else if (query.budget === 'high') {
      filters.budget = { ...(filters.budget || {}), $gte: 2000 };
    }
  }

  if (query.age) {
    const agePatterns = {
      teens: ['13', '14', '15', '16', '17', '18-24', 'teens'],
      'young-adults': ['20', '25', '20-29', '18-40', '18-34'],
      adults: ['30', '35', '30+', '18-40', '18-34'],
    };
    const patterns = agePatterns[query.age] || [query.age];
    andFilters.push({
      $or: patterns.map((pattern) => ({ targetAudience: makeRegex(pattern) })),
    });
  }

  if (query.gender) {
    const genderFilters = splitQueryList(query.gender).map((gender) => {
      if (gender === 'female') {
        return buildTextFilter(['targetAudience'], 'women');
      }

      if (gender === 'male') {
        return buildTextFilter(['targetAudience'], 'men');
      }

      return buildTextFilter(['targetAudience'], gender);
    });

    if (genderFilters.length) {
      andFilters.push({ $or: genderFilters });
    }
  }

  if (query.interests) {
    const interestFilters = splitQueryList(query.interests).map((interest) =>
      buildTextFilter(
        ['objective', 'description', 'targetAudience', 'targetNiche', 'requirements', 'contentType'],
        interest
      )
    );

    if (interestFilters.length) {
      andFilters.push({ $or: interestFilters });
    }
  }

  if (andFilters.length) {
    filters.$and = andFilters;
  }
};

const getBrandProfileForUser = async (userId) => {
  return Brand.findOne({ userId });
};

const getOwnedCampaign = async (campaignId, brandId) => {
  const campaign = await Campaign.findById(campaignId);

  if (!campaign) {
    return { status: 404, body: { message: 'Campaign not found' } };
  }

  if (campaign.brandId.toString() !== brandId.toString()) {
    return { status: 403, body: { message: 'Forbidden: not your campaign' } };
  }

  return { campaign };
};

exports.createCampaign = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const brand = await getBrandProfileForUser(req.user._id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }

    const campaign = await Campaign.create(buildCampaignPayload(req.body, brand._id));

    const populatedCampaign = await Campaign.findById(campaign._id).populate(
      brandPopulate
    );

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign: formatCampaign(populatedCampaign),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCampaigns = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const filters = {};

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.targetNiche) {
      filters.targetNiche = req.query.targetNiche;
    }

    if (req.query.brandId) {
      filters.brandId = req.query.brandId;
    }

    if (req.query.minBudget || req.query.maxBudget) {
      filters.budget = {};

      if (req.query.minBudget) {
        filters.budget.$gte = Number(req.query.minBudget);
      }

      if (req.query.maxBudget) {
        filters.budget.$lte = Number(req.query.maxBudget);
      }
    }

    applyCampaignFilters(filters, req.query);

    const campaigns = await Campaign.find(filters)
      .populate(brandPopulate)
      .sort({ createdAt: -1 });

    res.status(200).json({ campaigns: formatCampaigns(campaigns) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCampaignById = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const campaign = await Campaign.findById(req.params.id).populate(
      brandPopulate
    );

    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.status(200).json({ campaign: formatCampaign(campaign) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCampaign = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const brand = await getBrandProfileForUser(req.user._id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }

    const ownedCampaignResult = await getOwnedCampaign(req.params.id, brand._id);
    if (!ownedCampaignResult.campaign) {
      return res
        .status(ownedCampaignResult.status)
        .json(ownedCampaignResult.body);
    }

    const campaign = ownedCampaignResult.campaign;

    const fields = [
      'name',
      'title',
      'objective',
      'description',
      'budget',
      'requirements',
      'targetNiche',
      'targetAudience',
      'platforms',
      'contentType',
      'imageSrc',
      'imageKey',
      'startDate',
      'endDate',
      'influencersCount',
      'reach',
      'progress',
      'deadline',
      'status',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        campaign[field] = field === 'platforms' ? normalizePlatforms(req.body[field]) : req.body[field];
      }
    });

    await campaign.save();

    const populatedCampaign = await Campaign.findById(campaign._id).populate(
      brandPopulate
    );

    res.status(200).json({
      message: 'Campaign updated successfully',
      campaign: formatCampaign(populatedCampaign),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCampaign = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const brand = await getBrandProfileForUser(req.user._id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }

    const ownedCampaignResult = await getOwnedCampaign(req.params.id, brand._id);
    if (!ownedCampaignResult.campaign) {
      return res
        .status(ownedCampaignResult.status)
        .json(ownedCampaignResult.body);
    }

    await Application.deleteMany({ campaignId: req.params.id });
    await ownedCampaignResult.campaign.deleteOne();

    res.status(200).json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCampaignApplications = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const brand = await getBrandProfileForUser(req.user._id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }

    const ownedCampaignResult = await getOwnedCampaign(req.params.id, brand._id);
    if (!ownedCampaignResult.campaign) {
      return res
        .status(ownedCampaignResult.status)
        .json(ownedCampaignResult.body);
    }

    const applications = await Application.find({ campaignId: req.params.id })
      .populate('influencerId', 'name email role')
      .populate({
        path: 'campaignId',
        select: 'title status budget targetNiche deadline brandId',
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const brand = await getBrandProfileForUser(req.user._id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand profile not found' });
    }

    const application = await Application.findById(req.params.id).populate({
      path: 'campaignId',
      select: 'brandId title status',
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (!application.campaignId) {
      return res
        .status(404)
        .json({ message: 'Campaign for this application was not found' });
    }

    if (application.campaignId.brandId.toString() !== brand._id.toString()) {
      return res.status(403).json({
        message: 'Forbidden: you do not own the campaign for this application',
      });
    }

    application.status = req.body.status;

    if (req.body.brandResponse !== undefined) {
      application.brandResponse = req.body.brandResponse;
    }

    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('influencerId', 'name email role')
      .populate({
        path: 'campaignId',
        select: 'title status budget targetNiche deadline brandId',
      });

    res.status(200).json({
      message: 'Application status updated successfully',
      application: populatedApplication,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
