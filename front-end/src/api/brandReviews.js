const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
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

export const createBrandReview = async ({ applicationId, brandId, campaignId, rating, review }) =>
  request(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      targetRole: "brand",
      brandId,
      campaignId,
      applicationId,
      rating,
      review,
    }),
  });

export const getBrandReviewsForBrand = async (brandId) =>
  request(`${API_URL}/brand/${encodeURIComponent(brandId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getBrandReviewsForCampaign = async (campaignId) =>
  request(`${API_URL}/campaign/${encodeURIComponent(campaignId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getBrandReviewForApplication = async (applicationId) =>
  request(`${API_URL}/application/${encodeURIComponent(applicationId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
