const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Application = require('../models/Application');
const Brand = require('../models/Brand');
const Campaign = require('../models/Campaign');
const Influencer = require('../models/Influencer');

const getValidationError = (req, res) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return null;
  }

  return res.status(400).json({ errors: errors.array() });
};

const campaignPopulate = {
  path: 'brandId',
  populate: {
    path: 'userId',
    select: 'name email role',
  },
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const applicationPopulate = [
  {
    path: 'influencer',
    populate: {
      path: 'userId',
      select: 'name email role',
    },
  },
  {
    path: 'influencerId',
    select: 'name email role',
  },
  {
    path: 'campaign',
    populate: campaignPopulate,
  },
  {
    path: 'campaignId',
    populate: campaignPopulate,
  },
];

const populateApplication = (query) => query.populate(applicationPopulate);

const getCampaignDisplayName = (campaign) => {
  return campaign?.name || campaign?.title || undefined;
};

const getCampaignBrandName = (campaign) => {
  return campaign?.brandId?.companyName || campaign?.brandId?.userId?.name || undefined;
};

const formatApplication = (application) => {
  const applicationObject = application.toObject({ virtuals: true });
  const campaign = applicationObject.campaign || applicationObject.campaignId;

  return {
    ...applicationObject,
    id: applicationObject._id.toString(),
    campaign: campaign || null,
    campaignName: applicationObject.campaignName || getCampaignDisplayName(campaign) || '',
    brandName: applicationObject.brandName || getCampaignBrandName(campaign) || '',
    proposal: applicationObject.proposal || '',
    status: applicationObject.status || 'Pending',
    statusTone: applicationObject.statusTone || 'pending',
    appliedDate: applicationObject.appliedDate || applicationObject.createdAt,
    brandResponse: applicationObject.brandResponse || '',
  };
};

const formatApplications = (applications) => applications.map(formatApplication);

const resolveCampaign = async (body) => {
  const campaignReference = body.campaign || body.campaignId;

  if (campaignReference) {
    if (!mongoose.Types.ObjectId.isValid(campaignReference)) {
      return { status: 400, body: { message: 'Invalid campaign id' } };
    }

    const campaign = await Campaign.findById(campaignReference).populate(campaignPopulate);
    if (!campaign) {
      return { status: 404, body: { message: 'Campaign not found' } };
    }

    return { campaign };
  }

  if (body.campaignName) {
    const campaignNameRegex = new RegExp(`^${escapeRegex(body.campaignName.trim())}$`, 'i');
    const campaign = await Campaign.findOne({
      $or: [{ name: campaignNameRegex }, { title: campaignNameRegex }],
    }).populate(campaignPopulate);

    return { campaign };
  }

  return {};
};

const resolveInfluencer = async (req) => {
  const influencerReference = req.body.influencer;

  if (influencerReference) {
    if (!mongoose.Types.ObjectId.isValid(influencerReference)) {
      return { status: 400, body: { message: 'Invalid influencer id' } };
    }

    const influencer = await Influencer.findById(influencerReference);
    if (!influencer) {
      return { status: 404, body: { message: 'Influencer not found' } };
    }

    if (
      req.user?.role === 'influencer' &&
      influencer.userId.toString() !== req.user._id.toString()
    ) {
      return { status: 403, body: { message: 'Forbidden: not your influencer profile' } };
    }

    return { influencer };
  }

  if (req.user?.role === 'influencer') {
    const influencer = await Influencer.findOne({ userId: req.user._id });
    if (!influencer) {
      return { status: 404, body: { message: 'Influencer profile not found' } };
    }

    return { influencer };
  }

  return {};
};

const getBrandForUser = async (userId) => {
  if (!userId) {
    return null;
  }

  return Brand.findOne({ userId });
};

const userCanModifyApplication = async (user, application) => {
  if (!user || user.role === 'admin') {
    return Boolean(user);
  }

  if (user.role === 'influencer') {
    return application.influencerId?.toString() === user._id.toString();
  }

  if (user.role === 'brand') {
    const brand = await getBrandForUser(user._id);
    if (!brand) {
      return false;
    }

    const campaignId = application.campaignId || application.campaign;
    if (!campaignId) {
      return true;
    }

    const campaign = await Campaign.findById(campaignId);
    return campaign?.brandId?.toString() === brand._id.toString();
  }

  return false;
};

exports.submitApplication = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const campaignResult = await resolveCampaign(req.body);
    if (campaignResult.status) {
      return res.status(campaignResult.status).json(campaignResult.body);
    }

    const influencerResult = await resolveInfluencer(req);
    if (influencerResult.status) {
      return res.status(influencerResult.status).json(influencerResult.body);
    }

    const campaign = campaignResult.campaign;
    const influencer = influencerResult.influencer;

    if (!campaign && !req.body.campaignName) {
      return res.status(400).json({ message: 'campaign or campaignName is required' });
    }

    if (!influencer && !req.body.influencerId) {
      return res.status(400).json({ message: 'influencer profile is required' });
    }

    const application = await Application.create({
      influencer: influencer?._id,
      influencerId: influencer?.userId || req.body.influencerId || req.user?._id,
      campaign: campaign?._id,
      campaignId: campaign?._id,
      campaignName: req.body.campaignName || getCampaignDisplayName(campaign),
      brandName: req.body.brandName || getCampaignBrandName(campaign),
      proposal: req.body.proposal,
      status: req.body.status || 'Pending',
      appliedDate: req.body.appliedDate,
      brandResponse: req.body.brandResponse,
    });

    const populatedApplication = await populateApplication(Application.findById(application._id));

    res.status(201).json({
      message: 'Application submitted successfully',
      application: formatApplication(populatedApplication),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Application already exists for this campaign' });
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getApplications = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const filters = {};
    const andFilters = [];

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.campaignId) {
      andFilters.push({
        $or: [{ campaign: req.query.campaignId }, { campaignId: req.query.campaignId }],
      });
    }

    if (req.query.influencerId) {
      andFilters.push({
        $or: [
          { influencer: req.query.influencerId },
          { influencerId: req.query.influencerId },
        ],
      });
    }

    if (andFilters.length) {
      filters.$and = andFilters;
    }

    const applications = await populateApplication(
      Application.find(filters).sort({ appliedDate: -1, createdAt: -1 })
    );

    res.status(200).json({ applications: formatApplications(applications) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getApplicationsByInfluencer = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const applications = await populateApplication(
      Application.find({
        $or: [
          { influencer: req.params.influencerId },
          { influencerId: req.params.influencerId },
        ],
      }).sort({ appliedDate: -1, createdAt: -1 })
    );

    res.status(200).json({ applications: formatApplications(applications) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getApplicationById = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const application = await populateApplication(Application.findById(req.params.id));

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.status(200).json({ application: formatApplication(application) });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateApplication = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const canModifyApplication = await userCanModifyApplication(req.user, application);
    if (!canModifyApplication) {
      return res.status(403).json({ message: 'Forbidden: cannot update this application' });
    }

    const fields = [
      'campaignName',
      'brandName',
      'proposal',
      'status',
      'statusTone',
      'appliedDate',
      'brandResponse',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        application[field] = req.body[field];
      }
    });

    await application.save();

    const populatedApplication = await populateApplication(Application.findById(application._id));

    res.status(200).json({
      message: 'Application updated successfully',
      application: formatApplication(populatedApplication),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteApplication = async (req, res) => {
  const validationError = getValidationError(req, res);
  if (validationError) {
    return validationError;
  }

  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const canModifyApplication = await userCanModifyApplication(req.user, application);
    if (!canModifyApplication) {
      return res.status(403).json({ message: 'Forbidden: cannot delete this application' });
    }

    await application.deleteOne();

    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
