const Campaign = require('../models/Campaign');

// Brand creates a campaign
exports.createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      brandId: req.user.id,
      brandName: req.user.name,
    });
    res.status(201).json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all campaigns (for influencers to browse)
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
    res.status(500).json({ message: err.message });
  }
};

// Get brand's own campaigns
exports.getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ brandId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get one campaign
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update campaign
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, brandId: req.user.id },
      req.body,
      { new: true }
    );
    if (!campaign) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, campaign });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete campaign
exports.deleteCampaign = async (req, res) => {
  try {
    const result = await Campaign.findOneAndDelete({
      _id: req.params.id,
      brandId: req.user.id,
    });
    if (!result) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};