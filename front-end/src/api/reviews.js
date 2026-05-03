const rawApiBaseUrl = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api"
).replace(/\/$/, "");
const API_BASE_URL = rawApiBaseUrl.endsWith("/api") ? rawApiBaseUrl : `${rawApiBaseUrl}/api`;
const API_URL = `${API_BASE_URL}/reviews`;

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const readJson = async (res) => {
  const contentType = res.headers.get("content-type") || "";
  const text = await res.text();

  if (!contentType.toLowerCase().includes("application/json")) {
    return {
      success: false,
      message: `Expected JSON from ${res.url}, received ${contentType || "non-JSON"} with status ${res.status}`,
    };
  }

  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    return {
      ...data,
      success: false,
      message: data.message || `Request failed with status ${res.status}`,
    };
  }

  return data;
};

const request = async (url, options = {}) => {
  try {
    const res = await fetch(url, options);
    return readJson(res);
  } catch (err) {
    return { success: false, message: err.message || "Request failed" };
  }
};

export const createReview = async (reviewData) =>
  request(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(reviewData),
  });

export const createBrandReview = async ({ applicationId, brandId, campaignId, contractId, rating, review }) =>
  createReview({
    targetRole: "brand",
    brandId,
    campaignId,
    applicationId,
    contractId,
    rating,
    review,
  });

export const createInfluencerReview = async ({ influencerId, campaignId, applicationId, contractId, rating, review }) =>
  createReview({
    targetRole: "influencer",
    influencerId,
    campaignId,
    applicationId,
    contractId,
    rating,
    review,
  });

export const getReviewsForBrand = async (brandId) =>
  request(`${API_URL}/brand/${encodeURIComponent(brandId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getReviewsForInfluencer = async (influencerId) =>
  request(`${API_URL}/influencer/${encodeURIComponent(influencerId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getReviewsForCampaign = async (campaignId) =>
  request(`${API_URL}/campaign/${encodeURIComponent(campaignId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getReviewsForContract = async (contractId) =>
  request(`${API_URL}/contract/${encodeURIComponent(contractId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getReviewsForApplication = async (applicationId) =>
  request(`${API_URL}/application/${encodeURIComponent(applicationId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getBrandReviewsForCampaign = getReviewsForCampaign;
export const getBrandReviewsForBrand = getReviewsForBrand;
export const getBrandReviewForApplication = getReviewsForApplication;
