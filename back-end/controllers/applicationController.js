const Application = require('../models/Application');
const Campaign = require('../models/Campaign');

// Influencer applies to a campaign
exports.createApplication = async (req, res) => {
  try {
    const { campaignId, proposal, influencerData } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const existing = await Application.findOne({
      campaignId,
      influencerId: req.user._id || req.user.id,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already applied to this campaign',
      });
    }

    const application = await Application.create({
      campaignId,
      campaignName: campaign.name,
      influencerId: req.user._id || req.user.id,
      influencerName: req.user.name,
      influencerEmail: req.user.email,
      influencerImage: influencerData?.profileImage || '',
      influencerFollowers: influencerData?.followers || '0',
      influencerEngagement: influencerData?.engagement || '0%',
      influencerAge: influencerData?.age || '',
      influencerLocation: influencerData?.location || '',
      influencerNiches: influencerData?.categories || influencerData?.niches || [],
      proposal: proposal || '',
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Brand: Get applications for one campaign
exports.getApplicationsForCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findOne({
      _id: campaignId,
      brandId: req.user._id || req.user.id,
    });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const applications = await Application.find({ campaignId }).sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Influencer: Get my applications
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      influencerId: req.user._id || req.user.id,
    }).sort({ createdAt: -1 });
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Brand: Accept or Reject application
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, brandResponse } = req.body;

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const application = await Application.findById(id).populate('campaignId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (String(application.campaignId.brandId) !== String(req.user._id || req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    application.status = status;
    if (brandResponse) application.brandResponse = brandResponse;
    await application.save();

    res.json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};