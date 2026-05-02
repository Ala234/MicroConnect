const mongoose = require('mongoose');
const Application = require('../models/Application');
const Campaign = require('../models/Campaign');
const Contract = require('../models/Contract');

const getUserId = (req) => req.user?._id || req.user?.id;
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ''));

const normalizeStatus = (status) => Contract.normalizeContractStatus(status);
const normalizeTransactionStatus = (status) => Contract.normalizeTransactionStatus(status);

const parseAmount = (value) => {
  const amount = Number.parseFloat(String(value || '').replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
};

const parseRequiredDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .flatMap((line) => line.split(','))
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const contractPopulate = (query) =>
  query
    .populate('brand', 'name email role')
    .populate('brandId', 'name email role')
    .populate('influencer', 'name email role')
    .populate('influencerId', 'name email role')
    .populate('campaign')
    .populate('campaignId')
    .populate('application');

const getObject = (value) => (value && typeof value === 'object' ? value : {});

const formatContract = (contract) => {
  const item = contract.toObject ? contract.toObject({ virtuals: true }) : contract;
  const brand = getObject(item.brand?._id ? item.brand : item.brandId);
  const influencer = getObject(item.influencer?._id ? item.influencer : item.influencerId);
  const campaign = getObject(item.campaign?._id ? item.campaign : item.campaignId);
  const status = normalizeStatus(item.status);
  const transactionStatus = normalizeTransactionStatus(item.transactionStatus || item.paymentStatus);

  return {
    ...item,
    id: String(item._id || item.id),
    contractId: item.contractId,
    brand: item.brand || item.brandId,
    brandId: brand._id || item.brandId || item.brand,
    brandName: item.brandName || campaign.brandName || brand.name || 'Brand',
    influencer: item.influencer || item.influencerId,
    influencerId: influencer._id || item.influencerId || item.influencer,
    influencerName: item.influencerName || influencer.name || '',
    influencerEmail: item.influencerEmail || influencer.email || '',
    campaign: item.campaign || item.campaignId,
    campaignId: campaign._id || item.campaignId || item.campaign,
    campaignName: item.campaignName || campaign.name || '',
    application: item.application,
    value: item.value || (item.totalAmount ? `SAR ${item.totalAmount}` : ''),
    status,
    transactionStatus,
    details: item.details || 'Contract details and deliverables will be managed by the brand and influencer.',
    deliverables: Array.isArray(item.deliverables) ? item.deliverables : [],
  };
};

const sendContracts = (res, contracts) =>
  res.json({ success: true, contracts: contracts.map(formatContract) });

const findContractByIdOrCode = (id) => {
  if (isObjectId(id)) {
    return Contract.findById(id);
  }

  return Contract.findOne({ contractId: id });
};

const ownsContract = (contract, user) => {
  if (user.role === 'admin') return true;

  const userId = String(user._id || user.id);
  if (user.role === 'brand') {
    return String(contract.brand?._id || contract.brand || contract.brandId?._id || contract.brandId) === userId;
  }

  if (user.role === 'influencer') {
    return (
      String(contract.influencer?._id || contract.influencer || contract.influencerId?._id || contract.influencerId) === userId
      || String(contract.influencerEmail || '').toLowerCase() === String(user.email || '').toLowerCase()
    );
  }

  return false;
};

const buildInfluencerQuery = (identifier) => {
  const filter = { $or: [] };
  if (isObjectId(identifier)) {
    filter.$or.push({ influencer: identifier }, { influencerId: identifier });
  }

  if (String(identifier).includes('@')) {
    filter.$or.push({ influencerEmail: String(identifier).toLowerCase() });
  }

  return filter.$or.length ? filter : null;
};

const buildBrandQuery = (identifier) => {
  const filter = { $or: [] };
  if (isObjectId(identifier)) {
    filter.$or.push({ brand: identifier }, { brandId: identifier });
  }

  if (String(identifier).includes('@')) {
    filter.$or.push({ brandEmail: String(identifier).toLowerCase() });
  }

  return filter.$or.length ? filter : null;
};

exports.createContract = async (req, res) => {
  try {
    const {
      applicationId,
      application,
      campaignId,
      influencerId,
      value,
      totalAmount,
      startDate,
      endDate,
      duration,
      details,
      deliverables,
      terms,
      paymentTiming,
      transactionStatus,
    } = req.body;

    const selectedApplicationId = applicationId || application;
    let selectedApplication = null;
    let selectedCampaign = null;

    if (selectedApplicationId) {
      if (!isObjectId(selectedApplicationId)) {
        return res.status(400).json({ success: false, message: 'Invalid application id' });
      }

      selectedApplication = await Application.findById(selectedApplicationId)
        .populate('campaignId')
        .populate('influencerId', 'name email')
        .populate('influencer', 'name email');
      if (!selectedApplication) {
        return res.status(404).json({ success: false, message: 'Application not found' });
      }

      selectedCampaign = selectedApplication.campaignId;
      if (!selectedCampaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found for application' });
      }

      if (String(selectedCampaign.brandId) !== String(getUserId(req))) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      if (String(selectedApplication.status).toLowerCase() !== 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Only accepted applications can receive a contract',
        });
      }

      const existingContract = await Contract.findOne({ application: selectedApplication._id });
      if (existingContract) {
        const populatedExisting = await contractPopulate(Contract.findById(existingContract._id));
        return res.status(409).json({
          success: false,
          message: 'A contract already exists for this application',
          contract: formatContract(populatedExisting),
        });
      }
    } else {
      if (!campaignId || !influencerId || !isObjectId(campaignId) || !isObjectId(influencerId)) {
        return res.status(400).json({
          success: false,
          message: 'applicationId is required, or provide valid campaignId and influencerId',
        });
      }

      selectedCampaign = await Campaign.findById(campaignId);
      if (!selectedCampaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      if (String(selectedCampaign.brandId) !== String(getUserId(req))) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    const contractValue = value || (totalAmount ? `SAR ${totalAmount}` : '');
    const amount = parseAmount(contractValue || totalAmount);
    const contractStartDate = parseRequiredDate(startDate);
    const contractEndDate = parseRequiredDate(endDate);

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Contract value is required' });
    }

    if (!contractStartDate) {
      return res.status(400).json({ success: false, message: 'Valid startDate is required' });
    }

    if (!contractEndDate) {
      return res.status(400).json({ success: false, message: 'Valid endDate is required' });
    }

    if (contractEndDate < contractStartDate) {
      return res.status(400).json({ success: false, message: 'endDate must be after startDate' });
    }

    const selectedInfluencerUser =
      selectedApplication?.influencerId && typeof selectedApplication.influencerId === 'object'
        ? selectedApplication.influencerId
        : selectedApplication?.influencer && typeof selectedApplication.influencer === 'object'
          ? selectedApplication.influencer
          : null;
    const selectedInfluencerId = selectedInfluencerUser?._id || selectedApplication?.influencerId || influencerId;

    const contract = await Contract.create({
      brand: selectedCampaign.brandId,
      brandId: selectedCampaign.brandId,
      brandName: selectedApplication?.brandName || selectedCampaign.brandName || req.user.name || 'Brand',
      influencer: selectedInfluencerId,
      influencerId: selectedInfluencerId,
      influencerName: selectedApplication?.influencerName || selectedInfluencerUser?.name || '',
      influencerEmail: selectedApplication?.influencerEmail || selectedInfluencerUser?.email || '',
      campaign: selectedCampaign._id,
      campaignId: selectedCampaign._id,
      campaignName: selectedApplication?.campaignName || selectedCampaign.name || '',
      application: selectedApplication?._id,
      value: contractValue,
      totalAmount: amount,
      startDate: contractStartDate,
      endDate: contractEndDate,
      duration: duration || '',
      details: details || 'Contract details and deliverables will be managed by the brand and influencer.',
      deliverables: normalizeStringArray(deliverables),
      terms: normalizeStringArray(terms),
      paymentTiming: paymentTiming || 'before',
      status: 'Pending',
      transactionStatus: transactionStatus || 'Pending',
      paymentStatus: 'unpaid',
    });

    const populatedContract = await contractPopulate(Contract.findById(contract._id));
    res.status(201).json({ success: true, contract: formatContract(populatedContract) });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.application) {
      return res.status(409).json({
        success: false,
        message: 'A contract already exists for this application',
      });
    }

    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getContracts = async (req, res) => {
  try {
    let filter = {};
    const userId = getUserId(req);

    if (req.user.role === 'brand') {
      filter = { $or: [{ brand: userId }, { brandId: userId }] };
    } else if (req.user.role === 'influencer') {
      filter = { $or: [{ influencer: userId }, { influencerId: userId }, { influencerEmail: req.user.email }] };
    }

    if (req.query.status) {
      const status = normalizeStatus(req.query.status);
      filter = filter.$or ? { $and: [filter, { status }] } : { status };
    }

    const contracts = await contractPopulate(Contract.find(filter).sort({ createdAt: -1 }));
    sendContracts(res, contracts);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyContracts = async (req, res) => {
  try {
    const filter = req.user.role === 'brand'
      ? { $or: [{ brand: getUserId(req) }, { brandId: getUserId(req) }] }
      : { $or: [{ influencer: getUserId(req) }, { influencerId: getUserId(req) }, { influencerEmail: req.user.email }] };

    const contracts = await contractPopulate(Contract.find(filter).sort({ createdAt: -1 }));
    sendContracts(res, contracts);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getContractById = async (req, res) => {
  try {
    const contract = await contractPopulate(findContractByIdOrCode(req.params.id));
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (!ownsContract(contract, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, contract: formatContract(contract) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getContractsByInfluencer = async (req, res) => {
  try {
    const { influencerId } = req.params;
    const filter = buildInfluencerQuery(influencerId);
    if (!filter) {
      return res.status(400).json({ success: false, message: 'Invalid influencer identifier' });
    }

    if (
      req.user.role === 'influencer'
      && String(influencerId).toLowerCase() !== String(getUserId(req)).toLowerCase()
      && String(influencerId).toLowerCase() !== String(req.user.email).toLowerCase()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const contracts = await contractPopulate(Contract.find(filter).sort({ createdAt: -1 }));
    sendContracts(res, contracts);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getContractsByBrand = async (req, res) => {
  try {
    const { brandId } = req.params;
    const filter = buildBrandQuery(brandId);
    if (!filter) {
      return res.status(400).json({ success: false, message: 'Invalid brand identifier' });
    }

    if (req.user.role === 'brand' && String(brandId) !== String(getUserId(req))) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const contracts = await contractPopulate(Contract.find(filter).sort({ createdAt: -1 }));
    sendContracts(res, contracts);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateContract = async (req, res) => {
  try {
    const contract = await contractPopulate(findContractByIdOrCode(req.params.id));
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (!ownsContract(contract, req.user) || req.user.role === 'influencer') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    [
      'value',
      'startDate',
      'endDate',
      'duration',
      'details',
      'paymentTiming',
    ].forEach((field) => {
      if (req.body[field] !== undefined) {
        contract[field] = req.body[field];
      }
    });

    if (req.body.totalAmount !== undefined) contract.totalAmount = parseAmount(req.body.totalAmount);
    if (req.body.deliverables !== undefined) contract.deliverables = normalizeStringArray(req.body.deliverables);
    if (req.body.terms !== undefined) contract.terms = normalizeStringArray(req.body.terms);
    if (req.body.transactionStatus !== undefined) contract.transactionStatus = req.body.transactionStatus;
    if (req.body.status !== undefined) contract.status = req.body.status;

    await contract.save();
    const populatedContract = await contractPopulate(Contract.findById(contract._id));
    res.json({ success: true, contract: formatContract(populatedContract) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateContractStatus = async (req, res) => {
  try {
    const { status, transactionStatus, influencerResponse } = req.body;
    const nextStatus = normalizeStatus(status);

    const contract = await contractPopulate(findContractByIdOrCode(req.params.id));
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Contract not found' });
    }

    if (!ownsContract(contract, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'influencer' && !['Active', 'Rejected'].includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Influencers can only accept or reject pending contracts',
      });
    }

    contract.status = nextStatus;
    if (transactionStatus !== undefined) {
      contract.transactionStatus = transactionStatus;
    }
    if (influencerResponse !== undefined) {
      contract.influencerResponse = influencerResponse;
    }
    if (req.user.role === 'influencer') {
      contract.respondedAt = new Date();
    }

    await contract.save();
    const populatedContract = await contractPopulate(Contract.findById(contract._id));
    res.json({ success: true, contract: formatContract(populatedContract) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
