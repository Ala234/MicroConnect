const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const API_URL = `${API_BASE_URL}/applications`;

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
      message:
        data.message === "You already applied to this campaign"
          ? "You already applied to this campaign. View it in My Applications."
          : data.message || `Request failed with status ${res.status}`,
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

export const applyToCampaign = async (campaignId, proposal, influencerData) =>
  request(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ campaignId, proposal, influencerData }),
  });

export const getApplications = async () =>
  request(API_URL, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getApplicationsForCampaign = async (campaignId) =>
  request(`${API_URL}/campaign/${campaignId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getApplicationsForInfluencer = async (influencerIdOrEmail) =>
  request(`${API_URL}/influencer/${encodeURIComponent(influencerIdOrEmail)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getApplicationsForBrand = async (brandId) =>
  request(`${API_URL}/brand/${encodeURIComponent(brandId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getApplicationById = async (applicationId) =>
  request(`${API_URL}/${applicationId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getMyApplications = async () =>
  request(`${API_URL}/my`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const updateApplication = async (applicationId, applicationData) =>
  request(`${API_URL}/${applicationId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(applicationData),
  });

export const updateApplicationStatus = async (applicationId, status, brandResponse = "") =>
  updateApplication(applicationId, { status, brandResponse });
