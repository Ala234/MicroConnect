import {
  apiCreateCampaign,
  apiGetAllCampaigns,
  apiGetMyCampaigns,
  apiGetCampaignById,
  apiUpdateCampaign,
  apiDeleteCampaign,
} from "../api/campaigns";

// Default placeholder image
const createPlaceholderImage = (name) => {
  const initial = (name || "C").charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#6d5dfc"/><stop offset="100%" stop-color="#4d8aff"/></linearGradient></defs><rect width="200" height="200" rx="20" fill="url(#g)"/><text x="100" y="120" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" font-weight="700" fill="white">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const withImage = (campaign) => ({
  ...campaign,
  id: campaign._id || campaign.id,
  imageSrc: campaign.imageSrc || createPlaceholderImage(campaign.name),
});

// In-memory cache
let cachedCampaigns = [];

// Async: fetch all campaigns from backend
export const fetchCampaigns = async () => {
  const result = await apiGetAllCampaigns();
  if (result.success) {
    cachedCampaigns = result.campaigns.map(withImage);
    return cachedCampaigns;
  }
  return [];
};

// Async: fetch my campaigns (for brands)
export const fetchMyCampaigns = async () => {
  const result = await apiGetMyCampaigns();
  if (result.success) {
    cachedCampaigns = result.campaigns.map(withImage);
    return cachedCampaigns;
  }
  return [];
};

// Sync: get cached campaigns (for components that already loaded them)
export const getCampaigns = () => cachedCampaigns;

// Async: get campaign by id from backend
export const fetchCampaignById = async (campaignId) => {
  const result = await apiGetCampaignById(campaignId);
  if (result.success) {
    return withImage(result.campaign);
  }
  return null;
};

// Sync: get from cache (fallback)
export const getCampaignById = (campaignId) =>
  cachedCampaigns.find((c) => c.id === campaignId || c._id === campaignId) || null;

// Async: save (create or update)
export const saveCampaign = async (campaign) => {
  const dataToSend = {
    name: campaign.name,
    brandName: campaign.brandName,
    objective: campaign.objective,
    description: campaign.description,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    budget: String(campaign.budget),
    influencersCount: String(campaign.influencersCount),
    targetAudience: campaign.targetAudience,
    contentType: campaign.contentType,
    platforms: campaign.platforms,
    imageSrc: campaign.imageSrc,
  };

  let result;
  if (campaign.id) {
    result = await apiUpdateCampaign(campaign.id, dataToSend);
  } else {
    result = await apiCreateCampaign(dataToSend);
  }

  if (result.success) {
    return withImage(result.campaign);
  }
  throw new Error(result.message || "Failed to save campaign");
};

// Async: delete campaign
export const deleteCampaignById = async (campaignId) => {
  const result = await apiDeleteCampaign(campaignId);
  if (result.success) {
    cachedCampaigns = cachedCampaigns.filter((c) => c.id !== campaignId && c._id !== campaignId);
    return cachedCampaigns;
  }
  throw new Error(result.message || "Failed to delete campaign");
};