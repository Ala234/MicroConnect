const mongoose = require('mongoose');
const Application = require('../models/Application');
const Brand = require('../models/Brand');
const Campaign = require('../models/Campaign');
const Contract = require('../models/Contract');
const Influencer = require('../models/Influencer');
const Review = require('../models/Review');
const User = require('../models/User');

const getUserId = (req) => req.user?._id || req.user?.id;
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ''));
const allowedRoles = ['brand', 'influencer'];

const normalizeRole = (role) => {
  const value = String(role || '').trim().toLowerCase();
  return allowedRoles.includes(value) ? value : '';
};

const normalizeApplicationStatus = (status = 'pending') => {
  const value = String(status || '').trim().toLowerCase();
  if (value === 'accepted') return 'accepted';
  if (value === 'rejected') return 'rejected';
  return 'pending';
};

const getRecordId = (record) => {
  if (!record) return '';
  if (typeof record === 'object') {
    if (record._id) return String(record._id);
    if (record.id && typeof record.id !== 'function') return String(record.id);
  }
  return String(record);
};

const getPopulatedObject = (value) =>
  value && typeof value === 'object' && (value._id || value.name || value.email)
    ? value
    : null;

const applicationPopulate = (query) =>
  query
    .populate('campaignId')
    .populate('campaign')
    .populate('brandId', 'name email role')
    .populate('brand', 'name email role')
    .populate('influencerId', 'name email role')
    .populate('influencer', 'name email role');

const contractPopulate = (query) =>
  query
    .populate('brand', 'name email role')
    .populate('brandId', 'name email role')
    .populate('influencer', 'name email role')
    .populate('influencerId', 'name email role')
    .populate('campaign')
    .populate('campaignId')
    .populate('application');

const reviewPopulate = (query) =>
  query
    .populate('reviewer', 'name email role')
    .populate('target', 'name email role')
    .populate('brand', 'name email role')
    .populate('influencer', 'name email role')
    .populate('campaign', 'name brandName brandId imageSrc platforms objective')
    .populate('application', 'status campaignId brandId influencerId campaignName brandName')
    .populate('contract', 'contractId status transactionStatus campaignName brandName influencerName influencerEmail');

const getCampaignFromApplication = (application) =>
  application?.campaignId && typeof application.campaignId === 'object'
    ? application.campaignId
    : application?.campaign && typeof application.campaign === 'object'
      ? application.campaign
      : null;

const getCampaignFromContract = (contract) =>
  contract?.campaignId && typeof contract.campaignId === 'object'
    ? contract.campaignId
    : contract?.campaign && typeof contract.campaign === 'object'
      ? contract.campaign
      : null;

const findContractByIdOrCode = (id) => {
  if (!id) return null;
  if (isObjectId(id)) {
    return Contract.findById(id);
  }

  return Contract.findOne({ contractId: id });
};

const resolveBrandUser = async (brandId) => {
  if (!brandId || !isObjectId(brandId)) return null;

  const user = await User.findById(brandId).select('name email role');
  if (user?.role === 'brand') return user;

  const brandProfile = await Brand.findById(brandId).populate('userId', 'name email role');
  if (brandProfile?.userId) return brandProfile.userId;

  return null;
};

const resolveInfluencerUser = async (identifier) => {
  if (!identifier) return null;

  if (String(identifier).includes('@')) {
    const email = String(identifier).trim().toLowerCase();
    const user = await User.findOne({ email, role: 'influencer' }).select('name email role');
    if (user) return user;

    const influencer = await Influencer.findOne({ email }).populate('userId', 'name email role');
    return influencer?.userId || null;
  }

  if (!isObjectId(identifier)) return null;

  const user = await User.findById(identifier).select('name email role');
  if (user?.role === 'influencer') return user;

  const influencer = await Influencer.findById(identifier).populate('userId', 'name email role');
  if (influencer?.userId) return influencer.userId;

  return null;
};

const findContractForBrandReview = async ({ contractId, applicationId }) => {
  if (contractId) {
    return contractPopulate(findContractByIdOrCode(contractId));
  }

  if (applicationId && isObjectId(applicationId)) {
    return contractPopulate(Contract.findOne({ application: applicationId }));
  }

  return null;
};

const findContractForInfluencerReview = async ({ contractId, applicationId, campaignId, influencerId, brandId }) => {
  if (contractId) {
    return contractPopulate(findContractByIdOrCode(contractId));
  }

  if (applicationId && isObjectId(applicationId)) {
    return contractPopulate(Contract.findOne({ application: applicationId }));
  }

  if (campaignId && influencerId && brandId && isObjectId(campaignId) && isObjectId(influencerId) && isObjectId(brandId)) {
    return contractPopulate(
      Contract.findOne({
        $or: [{ brand: brandId }, { brandId }],
        $and: [
          { $or: [{ campaign: campaignId }, { campaignId }] },
          { $or: [{ influencer: influencerId }, { influencerId }] },
        ],
      })
    );
  }

  return null;
};

const formatReview = (review) => {
  const item = review.toObject ? review.toObject({ virtuals: true }) : review;
  const reviewer = getPopulatedObject(item.reviewer) || {};
  const target = getPopulatedObject(item.target) || {};
  const brand = getPopulatedObject(item.brand) || {};
  const influencer = getPopulatedObject(item.influencer) || {};
  const campaign = getPopulatedObject(item.campaign) || {};
  const contract = getPopulatedObject(item.contract) || {};

  return {
    ...item,
    id: String(item._id || item.id),
    reviewerId: getRecordId(item.reviewer),
    reviewerName: item.reviewerName || reviewer.name || '',
    reviewerEmail: item.reviewerEmail || reviewer.email || '',
    targetId: getRecordId(item.target),
    targetName: item.targetName || target.name || '',
    targetEmail: item.targetEmail || target.email || '',
    brandId: getRecordId(item.brand),
    brandName: item.brandName || brand.name || campaign.brandName || 'Brand',
    influencerId: getRecordId(item.influencer),
    influencerName: item.influencerName || influencer.name || '',
    influencerEmail: item.influencerEmail || influencer.email || '',
    campaignId: getRecordId(item.campaign),
    campaignName: item.campaignName || campaign.name || '',
    applicationId: getRecordId(item.application),
    contractId: contract.contractId || getRecordId(item.contract),
    rating: Number(item.rating),
    review: item.review || '',
  };
};

const sendReviews = (res, reviews) =>
  res.json({ success: true, reviews: reviews.map(formatReview) });

const getCurrentUserReview = (reviews, user) => {
  const userId = String(user._id || user.id);
  return reviews.find((review) => getRecordId(review.reviewer) === userId) || null;
};

const getDuplicateReviewFilter = (reviewData) => {
  const filter = {
    reviewer: getRecordId(reviewData.reviewer),
    reviewerRole: reviewData.reviewerRole,
    target: getRecordId(reviewData.target),
    targetRole: reviewData.targetRole,
  };
  const scopeFilters = [];
  const applicationId = getRecordId(reviewData.application);
  const contractId = getRecordId(reviewData.contract);
  const campaignId = getRecordId(reviewData.campaign);

  if (applicationId) scopeFilters.push({ application: applicationId });
  if (contractId) scopeFilters.push({ contract: contractId });
  if (!scopeFilters.length && campaignId) scopeFilters.push({ campaign: campaignId });

  return scopeFilters.length > 1
    ? { ...filter, $or: scopeFilters }
    : { ...filter, ...scopeFilters[0] };
};

const validateReviewInput = ({ targetRole, rating, review }) => {
  const normalizedTargetRole = normalizeRole(targetRole);
  if (!normalizedTargetRole) {
    return 'targetRole must be brand or influencer';
  }

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return 'Rating must be a number from 1 to 5';
  }

  if (!String(review || '').trim()) {
    return 'Review text is required';
  }

  return null;
};

const buildInfluencerToBrandReview = async (req) => {
  const {
    applicationId,
    application,
    brandId,
    contractId,
    contract,
    rating,
    review,
  } = req.body;
  const selectedApplicationId = applicationId || application;
  const selectedContractId = contractId || contract;
  let selectedApplication = null;
  let selectedCampaign = null;
  let selectedContract = null;
  let applicationAccepted = false;

  if (selectedApplicationId) {
    if (!isObjectId(selectedApplicationId)) {
      return { status: 400, body: { success: false, message: 'Invalid application id' } };
    }

    selectedApplication = await applicationPopulate(Application.findById(selectedApplicationId));
    if (!selectedApplication) {
      return { status: 404, body: { success: false, message: 'Application not found' } };
    }

    if (getRecordId(selectedApplication.influencerId || selectedApplication.influencer) !== String(getUserId(req))) {
      return { status: 403, body: { success: false, message: 'Not authorized to review this application' } };
    }

    applicationAccepted = normalizeApplicationStatus(selectedApplication.status) === 'accepted';

    selectedCampaign = getCampaignFromApplication(selectedApplication)
      || await Campaign.findById(selectedApplication.campaignId || selectedApplication.campaign);
  }

  selectedContract = await findContractForBrandReview({
    contractId: selectedContractId,
    applicationId: selectedApplication?._id || selectedApplicationId,
  });

  if (selectedContract) {
    const contractInfluencerId = getRecordId(selectedContract.influencerId || selectedContract.influencer);
    const contractInfluencerEmail = String(selectedContract.influencerEmail || '').toLowerCase();

    if (
      contractInfluencerId !== String(getUserId(req)) &&
      contractInfluencerEmail !== String(req.user.email || '').toLowerCase()
    ) {
      return { status: 403, body: { success: false, message: 'Not authorized to review this contract' } };
    }

    selectedCampaign = getCampaignFromContract(selectedContract) || selectedCampaign;
  }

  if (!applicationAccepted && !selectedContract) {
    return {
      status: 400,
      body: { success: false, message: 'Accepted application or contract is required to review a brand' },
    };
  }

  if (!selectedCampaign) {
    return { status: 404, body: { success: false, message: 'Campaign not found for review' } };
  }

  const selectedBrandUser =
    await resolveBrandUser(brandId)
    || getPopulatedObject(selectedApplication?.brandId?._id ? selectedApplication.brandId : selectedApplication?.brand)
    || getPopulatedObject(selectedContract?.brandId?._id ? selectedContract.brandId : selectedContract?.brand)
    || await resolveBrandUser(selectedCampaign.brandId);
  const selectedBrandId = getRecordId(selectedBrandUser) || getRecordId(selectedCampaign.brandId);

  if (!selectedBrandId) {
    return { status: 400, body: { success: false, message: 'Brand could not be identified for this review' } };
  }

  const reviewerName = req.user.name || selectedApplication?.influencerName || selectedContract?.influencerName || 'Influencer';
  const reviewerEmail = req.user.email || selectedApplication?.influencerEmail || selectedContract?.influencerEmail || '';
  const targetName =
    selectedApplication?.brandName ||
    selectedContract?.brandName ||
    selectedCampaign.brandName ||
    selectedBrandUser?.name ||
    'Brand';

  return {
    review: {
      reviewer: getUserId(req),
      reviewerRole: 'influencer',
      reviewerName,
      reviewerEmail,
      target: selectedBrandId,
      targetRole: 'brand',
      targetName,
      targetEmail: selectedBrandUser?.email || '',
      brand: selectedBrandId,
      brandName: targetName,
      influencer: getUserId(req),
      influencerName: reviewerName,
      influencerEmail: reviewerEmail,
      campaign: selectedCampaign._id,
      campaignName: selectedApplication?.campaignName || selectedContract?.campaignName || selectedCampaign.name || 'Campaign',
      application: selectedApplication?._id || selectedContract?.application,
      contract: selectedContract?._id,
      rating: Number(rating),
      review: String(review).trim(),
    },
  };
};

const buildBrandToInfluencerReview = async (req) => {
  const {
    applicationId,
    application,
    campaignId,
    contractId,
    contract,
    influencerId,
    rating,
    review,
  } = req.body;
  const selectedApplicationId = applicationId || application;
  const selectedContractId = contractId || contract;
  const selectedInfluencerUser = await resolveInfluencerUser(influencerId);

  const selectedContract = await findContractForInfluencerReview({
    contractId: selectedContractId,
    applicationId: selectedApplicationId,
    campaignId,
    influencerId: getRecordId(selectedInfluencerUser) || influencerId,
    brandId: String(getUserId(req)),
  });

  if (!selectedContract) {
    return {
      status: 400,
      body: { success: false, message: 'Contract is required to review an influencer' },
    };
  }

  if (getRecordId(selectedContract.brandId || selectedContract.brand) !== String(getUserId(req))) {
    return { status: 403, body: { success: false, message: 'Not authorized to review this contract' } };
  }

  const contractInfluencerUser =
    getPopulatedObject(selectedContract.influencerId?._id ? selectedContract.influencerId : selectedContract.influencer);
  const targetUser = selectedInfluencerUser || contractInfluencerUser;
  const targetUserId = getRecordId(targetUser) || getRecordId(selectedContract.influencerId || selectedContract.influencer);

  if (!targetUserId) {
    return { status: 400, body: { success: false, message: 'Influencer could not be identified for this review' } };
  }

  const selectedCampaign = getCampaignFromContract(selectedContract);
  if (!selectedCampaign) {
    return { status: 404, body: { success: false, message: 'Campaign not found for review' } };
  }

  const selectedBrandUser =
    getPopulatedObject(selectedContract.brandId?._id ? selectedContract.brandId : selectedContract.brand);
  const brandName = selectedContract.brandName || selectedCampaign.brandName || req.user.name || selectedBrandUser?.name || 'Brand';
  const influencerName = selectedContract.influencerName || targetUser?.name || 'Influencer';
  const influencerEmail = selectedContract.influencerEmail || targetUser?.email || '';

  return {
    review: {
      reviewer: getUserId(req),
      reviewerRole: 'brand',
      reviewerName: req.user.name || brandName,
      reviewerEmail: req.user.email || selectedBrandUser?.email || '',
      target: targetUserId,
      targetRole: 'influencer',
      targetName: influencerName,
      targetEmail: influencerEmail,
      brand: getUserId(req),
      brandName,
      influencer: targetUserId,
      influencerName,
      influencerEmail,
      campaign: selectedCampaign._id,
      campaignName: selectedContract.campaignName || selectedCampaign.name || 'Campaign',
      application: selectedContract.application || selectedApplicationId,
      contract: selectedContract._id,
      rating: Number(rating),
      review: String(review).trim(),
    },
  };
};

exports.createReview = async (req, res) => {
  try {
    const validationError = validateReviewInput(req.body);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const targetRole = normalizeRole(req.body.targetRole);
    let builtReview;

    if (targetRole === 'brand') {
      if (req.user.role !== 'influencer') {
        return res.status(403).json({ success: false, message: 'Only influencers can review brands' });
      }
      builtReview = await buildInfluencerToBrandReview(req);
    } else {
      if (req.user.role !== 'brand') {
        return res.status(403).json({ success: false, message: 'Only brands can review influencers' });
      }
      builtReview = await buildBrandToInfluencerReview(req);
    }

    if (builtReview.status) {
      return res.status(builtReview.status).json(builtReview.body);
    }

    const existingReview = await reviewPopulate(
      Review.findOne(getDuplicateReviewFilter(builtReview.review))
    );
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'A review already exists for this collaboration',
        review: formatReview(existingReview),
      });
    }

    const createdReview = await Review.create(builtReview.review);
    const populatedReview = await reviewPopulate(Review.findById(createdReview._id));
    return res.status(201).json({ success: true, review: formatReview(populatedReview) });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A review already exists for this collaboration',
      });
    }

    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviewsByBrand = async (req, res) => {
  try {
    const brandUser = await resolveBrandUser(req.params.brandId);
    if (!brandUser) {
      return res.status(400).json({ success: false, message: 'Invalid brand id' });
    }

    const reviews = await reviewPopulate(
      Review.find({ target: brandUser._id, targetRole: 'brand' }).sort({ createdAt: -1 })
    );

    return sendReviews(res, reviews);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviewsByInfluencer = async (req, res) => {
  try {
    const influencerUser = await resolveInfluencerUser(req.params.influencerId);
    if (!influencerUser) {
      return res.status(400).json({ success: false, message: 'Invalid influencer id' });
    }

    const reviews = await reviewPopulate(
      Review.find({ target: influencerUser._id, targetRole: 'influencer' }).sort({ createdAt: -1 })
    );

    return sendReviews(res, reviews);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviewsByCampaign = async (req, res) => {
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
      Review.find({ target: campaign.brandId, targetRole: 'brand' }).sort({ createdAt: -1 })
    );

    return sendReviews(res, reviews);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviewsByContract = async (req, res) => {
  try {
    const contract = await contractPopulate(findContractByIdOrCode(req.params.contractId));
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    const reviews = await reviewPopulate(
      Review.find({ contract: contract._id }).sort({ createdAt: -1 })
    );
    const currentReview = getCurrentUserReview(reviews, req.user);

    return res.json({
      success: true,
      reviews: reviews.map(formatReview),
      review: currentReview ? formatReview(currentReview) : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.getReviewsByApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!isObjectId(applicationId)) {
      return res.status(400).json({ success: false, message: 'Invalid application id' });
    }

    const reviews = await reviewPopulate(
      Review.find({ application: applicationId }).sort({ createdAt: -1 })
    );
    const currentReview = getCurrentUserReview(reviews, req.user);

    return res.json({
      success: true,
      reviews: reviews.map(formatReview),
      review: currentReview ? formatReview(currentReview) : null,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
