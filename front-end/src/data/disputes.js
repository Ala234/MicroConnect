const SHARED_DISPUTES_KEY = 'microconnectDisputes';
const LEGACY_COMPLAINTS_KEY = 'influencerComplaints';
const LEGACY_SARAH_EMAIL = 'sarah.johnson@email.com';

const readJsonArray = (key) => {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const writeJsonArray = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

export const normalizeDisputeStatus = (status) => {
  if (status === 'Resolved' || status === 'Closed') {
    return 'Resolved';
  }

  return 'Pending';
};

export const normalizeDisputePriority = (priority) => {
  if (priority === 'Low' || priority === 'Medium' || priority === 'High') {
    return priority;
  }

  return 'Medium';
};

export const formatDisputeDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

const defaultAdminDisputes = [
  {
    disputeId: 'D1001',
    submittedByRole: 'influencer',
    submittedByName: 'SaraBlogs',
    submittedByEmail: LEGACY_SARAH_EMAIL,
    campaignName: 'Ramadan Collection',
    brandName: 'NikeArabia',
    contractId: 'Not provided',
    subject: 'Payment not received after content delivery',
    reason: 'Payment issue',
    priority: 'High',
    description: 'Payment was not received after the influencer delivered the agreed campaign content.',
    dateSubmitted: '2026-04-28',
    status: 'Pending',
    adminResponse: ''
  },
  {
    disputeId: 'D1002',
    submittedByRole: 'brand',
    submittedByName: 'GlowCo',
    submittedByEmail: 'support@glowco.com',
    campaignName: 'Summer Glow',
    brandName: 'GlowCo',
    contractId: 'Not provided',
    subject: 'Content did not meet agreed specifications',
    reason: 'Deliverable dispute',
    priority: 'Medium',
    description: 'The brand reported that submitted content did not match the approved campaign specifications.',
    dateSubmitted: '2026-04-25',
    status: 'Resolved',
    adminResponse: 'The campaign terms were reviewed and both parties were notified of the resolution.'
  },
  {
    disputeId: 'D1003',
    submittedByRole: 'influencer',
    submittedByName: 'LisaStyle',
    submittedByEmail: 'lisa.style@email.com',
    campaignName: 'Eid Special Drop',
    brandName: 'LuxBrand',
    contractId: 'Not provided',
    subject: 'Brand changed requirements after contract signing',
    reason: 'Contract issue',
    priority: 'High',
    description: 'The influencer reported a scope change after the original contract was signed.',
    dateSubmitted: '2026-04-22',
    status: 'Pending',
    adminResponse: ''
  },
  {
    disputeId: 'D1004',
    submittedByRole: 'brand',
    submittedByName: 'TechStore',
    submittedByEmail: 'support@techstore.com',
    campaignName: 'Tech Review 2026',
    brandName: 'TechStore',
    contractId: 'Not provided',
    subject: 'Influencer missed agreed posting deadline',
    reason: 'Deliverable dispute',
    priority: 'Low',
    description: 'The brand reported that agreed publishing dates were missed.',
    dateSubmitted: '2026-04-18',
    status: 'Resolved',
    adminResponse: 'Resolved after confirming the updated content delivery schedule.'
  },
  {
    disputeId: 'D1005',
    submittedByRole: 'influencer',
    submittedByName: 'AhmedFit',
    submittedByEmail: 'ahmedfit@email.com',
    campaignName: 'Food Week',
    brandName: 'FoodHub',
    contractId: 'Not provided',
    subject: 'Partial payment amount mismatch',
    reason: 'Payment issue',
    priority: 'Medium',
    description: 'The influencer reported that the payment amount did not match the agreed contract amount.',
    dateSubmitted: '2026-04-15',
    status: 'Pending',
    adminResponse: ''
  },
  {
    disputeId: 'D1006',
    submittedByRole: 'brand',
    submittedByName: 'NikeArabia',
    submittedByEmail: 'support@nikearabia.com',
    campaignName: 'Spring Drop',
    brandName: 'NikeArabia',
    contractId: 'Not provided',
    subject: 'Content removed before agreed campaign end date',
    reason: 'Contract issue',
    priority: 'High',
    description: 'The brand reported that contracted content was removed before the agreed end date.',
    dateSubmitted: '2026-04-10',
    status: 'Pending',
    adminResponse: ''
  },
  {
    disputeId: 'D1007',
    submittedByRole: 'influencer',
    submittedByName: 'SaraBlogs',
    submittedByEmail: LEGACY_SARAH_EMAIL,
    campaignName: 'Glow Up Campaign',
    brandName: 'GlowCo',
    contractId: 'Not provided',
    subject: 'Contract terms were modified without consent',
    reason: 'Contract issue',
    priority: 'Low',
    description: 'The influencer reported that contract terms changed after approval.',
    dateSubmitted: '2026-04-05',
    status: 'Resolved',
    adminResponse: 'The original signed terms were confirmed and the dispute was resolved.'
  },
  {
    disputeId: 'D1008',
    submittedByRole: 'brand',
    submittedByName: 'LuxBrand',
    submittedByEmail: 'support@luxbrand.com',
    campaignName: 'Luxury Fitness',
    brandName: 'LuxBrand',
    contractId: 'Not provided',
    subject: 'Influencer promoted competitor during campaign',
    reason: 'Contract issue',
    priority: 'High',
    description: 'The brand reported a competitor promotion during an active campaign period.',
    dateSubmitted: '2026-03-30',
    status: 'Resolved',
    adminResponse: 'The contract clause was reviewed and the dispute was closed as resolved.'
  }
];

const legacySarahDisputes = [
  {
    complaintId: 'CMP-1001',
    submittedByRole: 'influencer',
    submittedByName: 'Sarah Johnson',
    submittedByEmail: LEGACY_SARAH_EMAIL,
    campaignName: 'Spring Collection',
    brandName: 'Fashion Forward',
    contractId: 'CTR-2041',
    subject: 'Delayed payment release',
    reason: 'Payment issue',
    description: 'The campaign was completed and approved, but the agreed payment has not been released on time.',
    dateSubmitted: '2026-03-22',
    priority: 'Medium',
    status: 'Pending',
    adminResponse: 'Finance verification is in progress. We will update you within 3 business days.'
  },
  {
    complaintId: 'CMP-1002',
    submittedByRole: 'influencer',
    submittedByName: 'Sarah Johnson',
    submittedByEmail: LEGACY_SARAH_EMAIL,
    campaignName: 'Winter Collection',
    brandName: 'North Thread',
    contractId: 'CTR-1985',
    subject: 'Deliverables changed after approval',
    reason: 'Contract issue',
    description: 'Additional deliverables were requested after the contract terms were already approved.',
    dateSubmitted: '2026-02-10',
    priority: 'Medium',
    status: 'Resolved',
    adminResponse: 'The signed contract terms were confirmed and the brand was instructed to follow the original scope.'
  }
];

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const normalizeRole = (role) => role === 'brand' ? 'brand' : 'influencer';

export const normalizeDispute = (dispute = {}, fallback = {}) => {
  const disputeId = dispute.disputeId || dispute.complaintId || dispute.id || `DSP-${Date.now()}`;
  const submittedByRole = normalizeRole(dispute.submittedByRole || fallback.submittedByRole);
  const submittedByEmail = normalizeEmail(dispute.submittedByEmail || fallback.submittedByEmail);
  const submittedByName = dispute.submittedByName || fallback.submittedByName || dispute.filedBy || 'Unknown user';
  const brandName = dispute.brandName || fallback.brandName || dispute.against || 'Not provided';
  const campaignName = dispute.campaignName || fallback.campaignName || dispute.campaign || 'Not provided';
  const reason = dispute.reason || fallback.reason || 'Other';
  const subject = dispute.subject || fallback.subject || reason;

  return {
    disputeId,
    id: disputeId,
    submittedByRole,
    submittedByName,
    submittedByEmail,
    filedBy: submittedByName,
    against: brandName,
    campaign: campaignName,
    campaignName,
    brandName,
    contractId: dispute.contractId || fallback.contractId || 'Not provided',
    subject,
    reason,
    priority: normalizeDisputePriority(dispute.priority || fallback.priority),
    description: dispute.description || fallback.description || subject,
    dateSubmitted: dispute.dateSubmitted || fallback.dateSubmitted || new Date().toISOString().slice(0, 10),
    date: dispute.date || fallback.date || formatDisputeDate(dispute.dateSubmitted || fallback.dateSubmitted || new Date()),
    status: normalizeDisputeStatus(dispute.status || fallback.status),
    adminResponse: dispute.adminResponse || fallback.adminResponse || ''
  };
};

const readLegacyScopedDisputes = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  const disputes = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(`${LEGACY_COMPLAINTS_KEY}:`)) {
      continue;
    }

    const email = key.slice(`${LEGACY_COMPLAINTS_KEY}:`.length);
    disputes.push(
      ...readJsonArray(key).map((complaint) =>
        normalizeDispute(complaint, {
          submittedByRole: 'influencer',
          submittedByEmail: email,
          submittedByName: complaint.submittedByName || 'Influencer'
        })
      )
    );
  }

  return disputes;
};

const readLegacyDisputes = () => [
  ...legacySarahDisputes.map((complaint) => normalizeDispute(complaint)),
  ...readJsonArray(LEGACY_COMPLAINTS_KEY).map((complaint) =>
    normalizeDispute(complaint, {
      submittedByRole: 'influencer',
      submittedByEmail: LEGACY_SARAH_EMAIL,
      submittedByName: 'Sarah Johnson'
    })
  ),
  ...readLegacyScopedDisputes()
];

const dedupeDisputes = (disputes) => {
  const disputesById = new Map();
  disputes.forEach((dispute) => {
    const normalized = normalizeDispute(dispute);
    disputesById.set(normalized.disputeId, normalized);
  });
  return Array.from(disputesById.values());
};

export const getAllDisputes = () =>
  dedupeDisputes([
    ...defaultAdminDisputes.map((dispute) => normalizeDispute(dispute)),
    ...readLegacyDisputes(),
    ...readJsonArray(SHARED_DISPUTES_KEY).map((dispute) => normalizeDispute(dispute))
  ]);

export const getDisputesForInfluencer = (email) => {
  const influencerEmail = normalizeEmail(email);
  if (!influencerEmail) {
    return [];
  }

  return getAllDisputes().filter(
    (dispute) =>
      dispute.submittedByRole === 'influencer' &&
      normalizeEmail(dispute.submittedByEmail) === influencerEmail
  );
};

export const generateDisputeId = (disputes = getAllDisputes()) => {
  const maxNumber = disputes.reduce((max, dispute) => {
    const numericId = Number(String(dispute.disputeId || '').replace(/\D/g, ''));
    return Number.isNaN(numericId) ? max : Math.max(max, numericId);
  }, 1000);

  return `DSP-${maxNumber + 1}`;
};

export const saveDispute = (dispute) => {
  const nextDispute = normalizeDispute(dispute);
  const disputes = [
    nextDispute,
    ...getAllDisputes().filter((item) => item.disputeId !== nextDispute.disputeId)
  ];

  writeJsonArray(SHARED_DISPUTES_KEY, disputes);
  return nextDispute;
};

export const updateDispute = (disputeId, updates) => {
  const disputes = getAllDisputes().map((dispute) =>
    dispute.disputeId === disputeId
      ? normalizeDispute({
          ...dispute,
          ...updates,
          status: updates.status ? normalizeDisputeStatus(updates.status) : dispute.status,
          priority: updates.priority ? normalizeDisputePriority(updates.priority) : dispute.priority
        })
      : dispute
  );

  writeJsonArray(SHARED_DISPUTES_KEY, disputes);
  return disputes;
};
