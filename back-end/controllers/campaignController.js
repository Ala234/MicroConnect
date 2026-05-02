const Campaign = require('../models/Campaign');

// Brand creates a campaign
exports.createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      brandId: req.user._id || req.user.id,
      brandName: req.body.brandName || req.user.name || 'Brand',
    });
    res.status(201).json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all campaigns (for influencers and brands to browse)
exports.getAllCampaigns = async (req, res) => {
  try {
    const { platform, contentType, audience } = req.query;

    const filter = { status: 'active' };
    if (platform) filter.platforms = platform;
    if (contentType) filter.contentType = new RegExp(contentType, 'i');
    if (audience) filter.targetAudience = new RegExp(audience, 'i');

    const campaigns = await Campaign.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get brand's own campaigns
exports.getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({
      brandId: req.user._id || req.user.id,
    }).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get one campaign by ID
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, brandId: req.user._id || req.user.id },
      req.body,
      { new: true }
    );
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found or not authorized' });
    }
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      brandId: req.user._id || req.user.id,
    });
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found or not authorized' });
    }
    res.json({ success: true, message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};