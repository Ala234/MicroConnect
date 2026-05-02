const API_URL = "http://localhost:5000/api/applications";

const getToken = () => localStorage.getItem("token");

const handleResponse = async (res) => {
  try {
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Request failed" };
    }
    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const applyToCampaign = async (campaignId, proposal, influencerData) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ campaignId, proposal, influencerData }),
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getApplicationsForCampaign = async (campaignId) => {
  try {
    const res = await fetch(`${API_URL}/campaign/${campaignId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getMyApplications = async () => {
  try {
    const res = await fetch(`${API_URL}/my`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const updateApplicationStatus = async (applicationId, status, brandResponse = "") => {
  try {
    const res = await fetch(`${API_URL}/${applicationId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status, brandResponse }),
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};