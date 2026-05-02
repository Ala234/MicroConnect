const STORAGE_KEY = 'microconnectContracts';

export const CONTRACT_STATUSES = ['Completed', 'Active', 'Pending', 'Rejected'];
export const TRANSACTION_STATUSES = ['Completed', 'Pending', 'Failed'];

const influencerEmailById = {
  'sarah-johnson': 'sarah.johnson@email.com',
  'mia-carter': 'mia.carter@email.com',
};

const readJson = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

const normalizeEmail = (email = '') => String(email || '').trim().toLowerCase();

const hashString = (value) => {
  const text = String(value || '');
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 900000;
  }

  return String(hash + 100000).slice(0, 6);
};

const normalizeContractStatus = (status) => {
  if (CONTRACT_STATUSES.includes(status)) {
    return status;
  }

  if (status === 'Accepted' || status === 'Confirmed' || status === 'accepted') {
    return 'Active';
  }

  if (status === 'requested' || status === 'In Review' || status === 'Under Review') {
    return 'Pending';
  }

  return 'Pending';
};

const normalizeTransactionStatus = (status) =>
  TRANSACTION_STATUSES.includes(status) ? status : 'Pending';

export const generateContractId = (campaignId, influencerEmail) =>
  `CTR-${hashString(`${campaignId}-${normalizeEmail(influencerEmail)}`)}`;

export const normalizeContract = (contract = {}) => {
  const now = new Date().toISOString();
  const influencerEmail = normalizeEmail(contract.influencerEmail);

  return {
    contractId: contract.contractId || generateContractId(contract.campaignId, influencerEmail),
    brandName: contract.brandName || contract.brand || 'Brand',
    influencerName: contract.influencerName || contract.influencer || 'Influencer',
    influencerEmail,
    campaignId: contract.campaignId || '',
    campaignName: contract.campaignName || contract.campaign || 'Campaign',
    value: contract.value || '',
    startDate: contract.startDate || contract.start || '',
    endDate: contract.endDate || contract.end || '',
    status: normalizeContractStatus(contract.status),
    transactionStatus: normalizeTransactionStatus(contract.transactionStatus),
    details: contract.details || 'Contract details and deliverables will be managed by the brand and influencer.',
    deliverables: contract.deliverables || '',
    createdAt: contract.createdAt || now,
    updatedAt: contract.updatedAt || now,
  };
};

export const getAllContracts = () =>
  readJson(STORAGE_KEY, []).map(normalizeContract);

export const saveContract = (contract) => {
  const nextContract = normalizeContract(contract);
  const contracts = getAllContracts();
  const existingIndex = contracts.findIndex(
    (item) => item.contractId === nextContract.contractId
  );

  if (existingIndex >= 0) {
    contracts[existingIndex] = {
      ...contracts[existingIndex],
      ...nextContract,
      createdAt: contracts[existingIndex].createdAt,
      updatedAt: new Date().toISOString(),
    };
  } else {
    contracts.unshift(nextContract);
  }

  writeJson(STORAGE_KEY, contracts);
  return existingIndex >= 0 ? contracts[existingIndex] : nextContract;
};

export const getContractsForInfluencer = (userOrEmail) => {
  const email = typeof userOrEmail === 'string'
    ? userOrEmail
    : userOrEmail?.email;
  const influencerEmail = normalizeEmail(email);

  if (!influencerEmail) {
    return [];
  }

  return getAllContracts().filter(
    (contract) => normalizeEmail(contract.influencerEmail) === influencerEmail
  );
};

export const getPendingContractCountForInfluencer = (userOrEmail) =>
  getContractsForInfluencer(userOrEmail).filter(
    (contract) => contract.status === 'Pending'
  ).length;

export const updateContractStatus = (contractId, status) => {
  const nextStatus = normalizeContractStatus(status);
  const contracts = getAllContracts();
  const existingContract = contracts.find((contract) => contract.contractId === contractId);

  if (!existingContract) {
    return null;
  }

  return saveContract({
    ...existingContract,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  });
};

export const buildContractFromBrandRequest = ({ campaign, influencer }) => {
  const influencerEmail = normalizeEmail(
    influencer?.email || influencerEmailById[influencer?.id]
  );
  const campaignBrandName = campaign?.brandName || campaign?.brand || 'Brand';
  const campaignName = campaign?.name || 'Campaign';

  return normalizeContract({
    contractId: generateContractId(campaign?.id || campaignName, influencerEmail),
    brandName: campaignBrandName,
    influencerName: influencer?.name || 'Influencer',
    influencerEmail,
    campaignId: campaign?.id || '',
    campaignName,
    value: campaign?.budget ? `$${campaign.budget}` : '',
    startDate: campaign?.startDate || '',
    endDate: campaign?.endDate || '',
    status: 'Pending',
    transactionStatus: 'Pending',
    details: `Digital agreement for ${campaignName} by ${campaignBrandName}.`,
    deliverables: campaign?.contentType || '',
  });
};

export const sendContractFromBrand = ({ campaign, influencer }) =>
  saveContract(buildContractFromBrandRequest({ campaign, influencer }));
