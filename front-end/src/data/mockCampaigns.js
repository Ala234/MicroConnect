const STORAGE_KEY = "brandCampaigns";

// Default placeholder image (transparent SVG with logo letter)
const createPlaceholderImage = (name) => {
  const initial = (name || "C").charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6d5dfc"/><stop offset="100%" stop-color="#4d8aff"/></linearGradient></defs><rect width="200" height="200" rx="20" fill="url(#g)"/><text x="100" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" font-weight="700" fill="white">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const readStoredCampaigns = () => {
  if (typeof window === "undefined") {
    return [];
  }

  const rawCampaigns = localStorage.getItem(STORAGE_KEY);

  if (!rawCampaigns) {
    return [];
  }

  try {
    const parsedCampaigns = JSON.parse(rawCampaigns);
    return Array.isArray(parsedCampaigns) ? parsedCampaigns : [];
  } catch {
    return [];
  }
};

const writeStoredCampaigns = (campaigns) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
};

const normalizeCampaign = (campaign) => ({
  id: campaign.id || `campaign-${Date.now()}`,
  name: campaign.name || "",
  brandName: campaign.brandName || "Brand",
  objective: campaign.objective || "",
  description: campaign.description || "",
  startDate: campaign.startDate || "",
  endDate: campaign.endDate || "",
  budget: campaign.budget || "",
  influencersCount: campaign.influencersCount || "0",
  targetAudience: campaign.targetAudience || "",
  contentType: campaign.contentType || "",
  platforms: Array.isArray(campaign.platforms) ? campaign.platforms : [],
  reach: campaign.reach || "0",
  progress: Number(campaign.progress ?? 0),
  imageSrc: campaign.imageSrc || "",
});

const withImage = (campaign) => ({
  ...campaign,
  imageSrc: campaign.imageSrc || createPlaceholderImage(campaign.name),
});

export const getCampaigns = () => readStoredCampaigns().map(withImage);

export const getCampaignById = (campaignId) =>
  getCampaigns().find((campaign) => campaign.id === campaignId) || null;

export const saveCampaign = (campaign) => {
  const campaigns = readStoredCampaigns();
  const existingIndex = campaigns.findIndex((item) => item.id === campaign.id);
  const existingCampaign = existingIndex >= 0 ? campaigns[existingIndex] : null;
  const normalizedCampaign = normalizeCampaign({
    ...existingCampaign,
    ...campaign,
  });

  if (existingIndex >= 0) {
    campaigns[existingIndex] = normalizedCampaign;
  } else {
    campaigns.unshift(normalizedCampaign);
  }

  writeStoredCampaigns(campaigns);
  return withImage(normalizedCampaign);
};

export const deleteCampaignById = (campaignId) => {
  const campaigns = readStoredCampaigns();
  const nextCampaigns = campaigns.filter((campaign) => campaign.id !== campaignId);
  writeStoredCampaigns(nextCampaigns);
  return nextCampaigns.map(withImage);
};