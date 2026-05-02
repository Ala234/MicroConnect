const mongoose = require('mongoose');
const Application = require('../models/Application');
const Brand = require('../models/Brand');
const BrandReview = require('../models/BrandReview');
const Campaign = require('../models/Campaign');

const getUserId = (req) => req.user?._id || req.user?.id;
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ''));

const normalizeApplicationStatus = (status = 'pending') => {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'accepted') return 'accepted';
  if (value === 'rejected') return 'rejected';
  return 'pending';
};

const getRecordId = (record) => {
  if (!record) return '';
  if (typeof record === 'object') return String(record._id || record.id || '');
  return String(record);
};

const getObject = (value) => (value && typeof value === 'object' ? value : {});

const applicationPopulate = (query) =>
  query
    .populate('campaignId')
    .populate('campaign')
    .populate('brandId', 'name email role')
    .populate('brand', 'name email role')
    .populate('influencerId', 'name email role')
    .populate('influencer', 'name email role');

const reviewPopulate = (query) =>
  query
    .populate('brand', 'name email role')
    .populate('campaign', 'name brandName brandId imageSrc platforms objective')
    .populate('application', 'status campaignId brandId influencerId campaignName brandName')
    .populate('influencer', 'name email role');

const getCampaignFromApplication = (application) =>
  application.campaignId && typeof application.campaignId === 'object'
    ? application.campaignId
    : application.campaign && typeof application.campaign === 'object'
      ? application.campaign
      : null;

const formatReview = (review) => {
  const item = review.toObject ? review.toObject({ virtuals: true }) : review;
  const brand = getObject(item.brand);
  const campaign = getObject(item.campaign);
  const influencer = getObject(item.influencer);

  return {
    ...item,
    id: String(item._id || item.id),
    brand: item.brand,
    brandId: brand._id || item.brand,
    brandName: item.brandName || brand.name || campaign.brandName || 'Brand',
    campaign: item.campaign,
    campaignId: campaign._id || item.campaign,
    campaignName: item.campaignName || campaign.name || '',
    application: item.application,
    influencer: item.influencer,
    influencerId: influencer._id || item.influencer,
    influencerName: item.influencerName || influencer.name || 'Influencer',
    influencerEmail: item.influencerEmail || influencer.email || '',
    rating: Number(item.rating),
    review: item.review || '',
  };
};

const sendReviews = (res, reviews) =>
  res.json({ success: true, reviews: reviews.map(formatReview) });

const resolveBrandUserId = async (brandId) => {
  const brandProfile = await Brand.findById(brandId).select('userId');
  return brandProfile?.userId || brandId;
};

const userCanAccessApplicationReview = async (application, user) => {
  if (user.role === 'admin') return true;

  const userId = String(user._id || user.id);
  if (user.role === 'influencer') {
    return getRecordId(application.influencerId || application.influencer) === userId;
  }

  if (user.role === 'brand') {
    const campaign = getCampaignFromApplication(application)
      || await Campaign.findById(application.campaignId || application.campaign);

    return (
      getRecordId(campaign?.brandId) === userId ||
      getRecordId(application.brandId || application.brand) === userId
    );
  }

  return false;
};

exports.createBrandReview = async (req, res) => {
  try {
    const { targetRole, applicationId, application, rating, review } = req.body;
    const selectedApplicationId = applicationId || application;

    if (targetRole && String(targetRole).toLowerCase() !== 'brand') {
      return res.status(400).json({ success: false, message: 'Only brand reviews are supported' });
    }

    if (!selectedApplicationId || !isObjectId(selectedApplicationId)) {
      return res.status(400).json({ success: false, message: 'Valid applicationId is required' });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be a number from 1 to 5' });
    }

    const reviewText = String(review || '').trim();
    if (!reviewText) {
      return res.status(400).json({ success: false, message: 'Review text is required' });
    }

    const selectedApplication = await applicationPopulate(Application.findById(selectedApplicationId));
    if (!selectedApplication) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (String(getRecordId(selectedApplication.influencerId || selectedApplication.influencer)) !== String(getUserId(req))) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this application' });
    }

    if (normalizeApplicationStatus(selectedApplication.status) !== 'accepted') {
      return res.status(400).json({ success: false, message: 'Only accepted applications can be reviewed' });
    }

    const existingReview = await BrandReview.findOne({ application: selectedApplication._id });
    if (existingReview) {
      const populatedExisting = await reviewPopulate(BrandReview.findById(existingReview._id));
      return res.status(409).json({
        success: false,
        message: 'A brand review already exists for this application',
        review: formatReview(populatedExisting),
      });
    }

    const selectedCampaign = getCampaignFromApplication(selectedApplication)
      || await Campaign.findById(selectedApplication.campaignId || selectedApplication.campaign);

    if (!selectedCampaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found for application' });
    }

    const selectedBrandId =
      getRecordId(selectedApplication.brandId) ||
      getRecordId(selectedApplication.brand) ||
      getRecordId(selectedCampaign.brandId);

    if (!selectedBrandId) {
      return res.status(400).json({ success: false, message: 'Brand could not be identified for this application' });
    }

    const influencerUser = getObject(
      selectedApplication.influencerId?._id ? selectedApplication.influencerId : selectedApplication.influencer
    );

    const createdReview = await BrandReview.create({
      brand: selectedBrandId,
      brandName: selectedApplication.brandName || selectedCampaign.brandName || 'Brand',
      campaign: selectedCampaign._id,
      campaignName: selectedApplication.campaignName || selectedCampaign.name || 'Campaign',
      application: selectedApplication._id,
      influencer: getUserId(req),
      influencerName: selectedApplication.influencerName || influencerUser.name || req.user.name || 'Influencer',
      influencerEmail: selectedApplication.influencerEmail || influencerUser.email || req.user.email || '',
      rating: numericRating,
      review: reviewText,
    });

    const populatedReview = await reviewPopulate(BrandReview.findById(createdReview._id));
    return res.status(201).json({ success: true, review: formatReview(populatedReview) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A brand review already exists for this application',
      });
    }

    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBrandReviewsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;

    if (!isObjectId(brandId)) {
      return res.status(400).json({ success: false, message: 'Invalid brand id' });
    }

    const selectedBrandId = await resolveBrandUserId(brandId);
    const reviews = await reviewPopulate(
      BrandReview.find({ brand: selectedBrandId }).sort({ createdAt: -1 })
    );

    return sendReviews(res, reviews);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBrandReviewsByCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    if (!isObjectId(campaignId)) {
      return res.status(400).json({ success: false, message: 'Invalid campaign id' });
    }

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }

    const reviews = await reviewPopulate(
      BrandReview.find({ brand: campaign.brandId }).sort({ createdAt: -1 })
    );

    return sendReviews(res, reviews);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getBrandReviewByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!isObjectId(applicationId)) {
      return res.status(400).json({ success: false, message: 'Invalid application id' });
    }

    const application = await applicationPopulate(Application.findById(applicationId));
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!(await userCanAccessApplicationReview(application, req.user))) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const review = await reviewPopulate(BrandReview.findOne({ application: applicationId }));

    return res.json({
      success: true,
      review: review ? formatReview(review) : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
