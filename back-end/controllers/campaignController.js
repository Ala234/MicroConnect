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

    const campaign = await Campaign.create({
      title: req.body.title,
      description: req.body.description,
      budget: req.body.budget,
      requirements: req.body.requirements,
      targetNiche: req.body.targetNiche,
      deadline: req.body.deadline,
      status: req.body.status,
      brandId: brand._id,
    });

    const populatedCampaign = await Campaign.findById(campaign._id).populate(
      brandPopulate
    );

    res.status(201).json({
      message: 'Campaign created successfully',
      campaign: populatedCampaign,
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

    const campaigns = await Campaign.find(filters)
      .populate(brandPopulate)
      .sort({ createdAt: -1 });

    res.status(200).json({ campaigns });
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

    res.status(200).json({ campaign });
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
      'title',
      'description',
      'budget',
      'requirements',
      'targetNiche',
      'deadline',
      'status',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        campaign[field] = req.body[field];
      }
    });

    await campaign.save();

    const populatedCampaign = await Campaign.findById(campaign._id).populate(
      brandPopulate
    );

    res.status(200).json({
      message: 'Campaign updated successfully',
      campaign: populatedCampaign,
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
