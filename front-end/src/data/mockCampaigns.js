import springImg from "../assets/images/spring.png";
import winterImg from "../assets/images/winter.png";
import skinCareImg from "../assets/images/skincare.png";
import summerImg from "../assets/images/summer-camp.png";

const STORAGE_KEY = "brandCampaigns";

const campaignImages = {
  spring: springImg,
  winter: winterImg,
  skincare: skinCareImg,
  summer: summerImg,
};

const legacyImageMap = {
  '/spring.png': springImg,
  'spring.png': springImg,
  '/winter.png': winterImg,
  'winter.png': winterImg,
  '/skincare.png': skinCareImg,
  'skincare.png': skinCareImg,
  '/summer-camp.png': summerImg,
  'summer-camp.png': summerImg,
};

const resolveLegacyImage = (image) => {
  if (!image) return null;
  const normalized = String(image).trim().toLowerCase();
  if (legacyImageMap[normalized]) {
    return legacyImageMap[normalized];
  }
  if (normalized.includes('spring')) return springImg;
  if (normalized.includes('winter')) return winterImg;
  if (normalized.includes('skincare') || normalized.includes('skin')) return skinCareImg;
  if (normalized.includes('summer')) return summerImg;
  return null;
};

const defaultCampaigns = [
  {
    id: "spring-collection",
    name: "Spring Collection",
    objective: "Brand Awareness",
    description:
      "Launch our new spring collection through micro-influencer content with fresh styling inspiration and product discovery.",
    startDate: "2026-04-10",
    endDate: "2026-06-09",
    budget: "3500",
    influencersCount: "12",
    targetAudience: "Women 25-35, interested in fashion",
    contentType: "Short-form video review",
    platforms: ["Instagram", "TikTok", "YouTube"],
    reach: "45k",
    progress: 80,
    imageKey: "spring",
  },
  {
    id: "winter-collection",
    name: "Winter Collection",
    objective: "Conversions",
    description:
      "Drive seasonal sales with creators showing outfit combinations, product details, and limited-time offers.",
    startDate: "2026-11-01",
    endDate: "2026-12-31",
    budget: "5200",
    influencersCount: "20",
    targetAudience: "Adults 18-40 shopping for winter fashion",
    contentType: "Reels and styling tutorials",
    platforms: ["Instagram", "TikTok"],
    reach: "60k",
    progress: 50,
    imageKey: "winter",
  },
  {
    id: "skin-care-collection",
    name: "Skin Care Collection",
    objective: "Product Launch",
    description:
      "Introduce a new skin-care line with educational creator content focused on routines, ingredients, and before/after storytelling.",
    startDate: "2026-07-01",
    endDate: "2026-08-15",
    budget: "2800",
    influencersCount: "0",
    targetAudience: "Women and men 20-35 interested in beauty and wellness",
    contentType: "Routine videos and product tutorials",
    platforms: ["Instagram", "YouTube"],
    reach: "0",
    progress: 0,
    imageKey: "skincare",
  },
  {
    id: "summer-collection",
    name: "Summer Campaign",
    objective: "Seasonal Promotion",
    description:
      "Beachwear and summer essentials promotion campaign. Showcase summer fashion and lifestyle content to engage audiences looking for seasonal inspiration.",
    startDate: "2026-06-01",
    endDate: "2026-08-31",
    budget: "950",
    influencersCount: "8",
    targetAudience: "Young adults 18-24 interested in fashion and beach lifestyle",
    contentType: "Summer styling and beach content",
    platforms: ["Instagram", "TikTok"],
    reach: "35k",
    progress: 0,
    imageKey: "summer",
  },
];

const withImage = (campaign) => {
  const legacyImageSrc = typeof campaign.imageSrc === 'string' ? resolveLegacyImage(campaign.imageSrc) : null;

  return {
    ...campaign,
    imageSrc:
      legacyImageSrc ||
      campaign.imageSrc ||
      resolveLegacyImage(campaign.image) ||
      campaignImages[campaign.imageKey] ||
      springImg,
  };
};

const readStoredCampaigns = () => {
  if (typeof window === "undefined") {
    return defaultCampaigns;
  }

  const rawCampaigns = localStorage.getItem(STORAGE_KEY);

  if (!rawCampaigns) {
    return defaultCampaigns;
  }

  try {
    const parsedCampaigns = JSON.parse(rawCampaigns);
    return Array.isArray(parsedCampaigns) ? parsedCampaigns : defaultCampaigns;
  } catch {
    return defaultCampaigns;
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
  imageKey: campaign.imageKey || "spring",
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

export { defaultCampaigns, campaignImages };
