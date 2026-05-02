const mongoose = require('mongoose');
const Application = require('../models/Application');
const Campaign = require('../models/Campaign');

const getUserId = (req) => req.user?._id || req.user?.id;

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ''));

const normalizeStatus = (status = 'pending') => {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'accepted') return 'accepted';
  if (value === 'rejected') return 'rejected';
  if (value === 'under review') return 'pending';
  return 'pending';
};

const statusLabel = (status) => {
  const value = normalizeStatus(status);
  if (value === 'accepted') return 'Accepted';
  if (value === 'rejected') return 'Rejected';
  return 'Pending';
};

const statusTone = (status) => {
  const value = normalizeStatus(status);
  if (value === 'accepted') return 'accepted';
  if (value === 'rejected') return 'rejected';
  return 'pending';
};

const applicationPopulate = (query) =>
  query
    .populate('campaignId')
    .populate('campaign')
    .populate('brandId', 'name email role')
    .populate('brand', 'name email role')
    .populate('influencerId', 'name email role')
    .populate('influencer', 'name email role');

const getCampaignFromApplication = (application) =>
  application.campaignId && typeof application.campaignId === 'object'
    ? application.campaignId
    : application.campaign && typeof application.campaign === 'object'
      ? application.campaign
      : null;

const getInfluencerFromApplication = (application) =>
  application.influencerId && typeof application.influencerId === 'object'
    ? application.influencerId
    : application.influencer && typeof application.influencer === 'object'
      ? application.influencer
      : null;

const backfillApplicationFields = (application) => {
  const campaign = getCampaignFromApplication(application);
  const influencerUser = getInfluencerFromApplication(application);
  const brandUser = application.brandId && typeof application.brandId === 'object'
    ? application.brandId
    : application.brand && typeof application.brand === 'object'
      ? application.brand
      : null;

  if (!application.campaignName && campaign?.name) {
    application.campaignName = campaign.name;
  }

  if (!application.brandName) {
    application.brandName = campaign?.brandName || brandUser?.name || 'Brand';
  }

  if (!application.brandId && campaign?.brandId) {
    application.brandId = campaign.brandId;
  }

  if (!application.brand && campaign?.brandId) {
    application.brand = campaign.brandId;
  }

  if (!application.influencerName && influencerUser?.name) {
    application.influencerName = influencerUser.name;
  }

  if (!application.influencerEmail && influencerUser?.email) {
    application.influencerEmail = influencerUser.email;
  }
};

const formatApplication = (application) => {
  const app = application.toObject ? application.toObject({ virtuals: true }) : application;
  const campaign = getCampaignFromApplication(app) || {};
  const brandUser = app.brandId && typeof app.brandId === 'object'
    ? app.brandId
    : app.brand && typeof app.brand === 'object'
      ? app.brand
      : {};
  const influencerUser = app.influencerId && typeof app.influencerId === 'object'
    ? app.influencerId
    : app.influencer && typeof app.influencer === 'object'
      ? app.influencer
      : {};
  const normalizedStatus = normalizeStatus(app.status);

  return {
    ...app,
    id: String(app._id || app.id),
    campaign: app.campaign || app.campaignId,
    campaignId: campaign._id || app.campaignId || app.campaign,
    campaignName: app.campaignName || campaign.name || '',
    brand: app.brand || app.brandId || campaign.brandId,
    brandId: brandUser._id || app.brandId || app.brand || campaign.brandId,
    brandName: app.brandName || campaign.brandName || brandUser.name || 'Brand',
    influencer: app.influencer || app.influencerId,
    influencerId: influencerUser._id || app.influencerId || app.influencer,
    influencerName: app.influencerName || influencerUser.name || '',
    influencerEmail: app.influencerEmail || influencerUser.email || '',
    status: normalizedStatus,
    statusLabel: statusLabel(normalizedStatus),
    statusTone: app.statusTone || statusTone(normalizedStatus),
    appliedDate: app.appliedDate || app.createdAt?.toISOString?.().slice(0, 10) || '',
    brandResponse: app.brandResponse || '',
  };
};

const sendApplications = (res, applications) =>
  res.json({ success: true, applications: applications.map(formatApplication) });

const userOwnsApplication = async (application, user) => {
  const userId = String(user._id || user.id);
  if (user.role === 'admin') {
    return true;
  }

  if (user.role === 'influencer') {
    return String(application.influencerId?._id || application.influencerId) === userId;
  }

  if (user.role === 'brand') {
    const campaign = getCampaignFromApplication(application)
      || await Campaign.findById(application.campaignId || application.campaign);
    return String(campaign?.brandId) === userId;
  }

  return false;
};

const getBrandCampaignIds = async (brandId) => {
  const campaigns = await Campaign.find({ brandId }).select('_id');
  return campaigns.map((campaign) => campaign._id);
};

exports.createApplication = async (req, res) => {
  try {
    const { campaignId, campaign, proposal, influencerData } = req.body;
    const selectedCampaignId = campaignId || campaign;

    if (!selectedCampaignId || !isObjectId(selectedCampaignId)) {
      return res.status(400).json({ success: false, message: 'Valid campaignId is required' });
    }

    const selectedCampaign = await Campaign.findById(selectedCampaignId);
    if (!selectedCampaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const influencerId = getUserId(req);
    const existing = await Application.findOne({
      campaignId: selectedCampaign._id,
      influencerId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'You already applied to this campaign. View it in My Applications.',
        application: formatApplication(await applicationPopulate(Application.findById(existing._id))),
      });
    }

    const application = await Application.create({
      campaign: selectedCampaign._id,
      campaignId: selectedCampaign._id,
      campaignName: selectedCampaign.name,
      brand: selectedCampaign.brandId,
      brandId: selectedCampaign.brandId,
      brandName: selectedCampaign.brandName || 'Brand',
      influencer: influencerId,
      influencerId,
      influencerName: req.user.name,
      influencerEmail: req.user.email,
      influencerImage: influencerData?.profileImage || '',
      influencerFollowers: influencerData?.followers || '0',
      influencerEngagement: influencerData?.engagement || '0%',
      influencerAge: influencerData?.age || '',
      influencerLocation: influencerData?.location || '',
      influencerNiches: influencerData?.categories || influencerData?.niches || [],
      proposal: proposal || '',
      status: 'pending',
      statusTone: 'pending',
      appliedDate: new Date().toISOString().slice(0, 10),
    });

    const populatedApplication = await applicationPopulate(Application.findById(application._id));
    res.status(201).json({ success: true, application: formatApplication(populatedApplication) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const filter = {};
    const userId = getUserId(req);

    if (req.user.role === 'influencer') {
      filter.influencerId = userId;
    } else if (req.user.role === 'brand') {
      filter.campaignId = { $in: await getBrandCampaignIds(userId) };
    }

    const applications = await applicationPopulate(
      Application.find(filter).sort({ createdAt: -1 })
    );
    sendApplications(res, applications);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getApplicationsForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!isObjectId(campaignId)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign id' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    if (req.user.role === 'brand' && String(campaign.brandId) !== String(getUserId(req))) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applications = await applicationPopulate(
      Application.find({ campaignId }).sort({ createdAt: -1 })
    );
    sendApplications(res, applications);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyApplications = async (req, res) => {
  try {
    const applications = await applicationPopulate(
      Application.find({ influencerId: getUserId(req) }).sort({ createdAt: -1 })
    );
    sendApplications(res, applications);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getApplicationsByInfluencer = async (req, res) => {
  try {
    const { influencerId } = req.params;
    const filter = { $or: [] };

    if (isObjectId(influencerId)) {
      filter.$or.push({ influencerId }, { influencer: influencerId });
    }

    if (String(influencerId).includes('@')) {
      filter.$or.push({ influencerEmail: String(influencerId).toLowerCase() });
    }

    if (!filter.$or.length) {
      return res.status(400).json({ success: false, message: 'Invalid influencer identifier' });
    }

    if (
      req.user.role === 'influencer'
      && String(influencerId).toLowerCase() !== String(getUserId(req)).toLowerCase()
      && String(influencerId).toLowerCase() !== String(req.user.email).toLowerCase()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const applications = await applicationPopulate(
      Application.find(filter).sort({ createdAt: -1 })
    );
    sendApplications(res, applications);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getApplicationsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const selectedBrandId = brandId || getUserId(req);

    if (req.user.role === 'brand' && String(selectedBrandId) !== String(getUserId(req))) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!isObjectId(selectedBrandId)) {
      return res.status(400).json({ success: false, message: 'Invalid brand id' });
    }

    const campaignIds = await getBrandCampaignIds(selectedBrandId);
    const applications = await applicationPopulate(
      Application.find({ campaignId: { $in: campaignIds } }).sort({ createdAt: -1 })
    );
    sendApplications(res, applications);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application id' });
    }

    const application = await applicationPopulate(Application.findById(id));
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!(await userOwnsApplication(application, req.user))) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, application: formatApplication(application) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const application = await applicationPopulate(Application.findById(req.params.id));
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!(await userOwnsApplication(application, req.user)) || req.user.role === 'influencer') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.body.status !== undefined) {
      application.status = normalizeStatus(req.body.status);
      application.statusTone = statusTone(application.status);
    }

    backfillApplicationFields(application);

    if (req.body.brandResponse !== undefined) {
      application.brandResponse = req.body.brandResponse;
    }

    await application.save();
    const populatedApplication = await applicationPopulate(Application.findById(application._id));
    res.json({ success: true, application: formatApplication(populatedApplication) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, brandResponse } = req.body;
    const normalizedStatus = normalizeStatus(status);

    const application = await applicationPopulate(Application.findById(req.params.id));
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!(await userOwnsApplication(application, req.user)) || req.user.role === 'influencer') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = normalizedStatus;
    application.statusTone = statusTone(normalizedStatus);
    backfillApplicationFields(application);
    if (brandResponse !== undefined) application.brandResponse = brandResponse;
    await application.save();

    const populatedApplication = await applicationPopulate(Application.findById(application._id));
    res.json({ success: true, application: formatApplication(populatedApplication) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
