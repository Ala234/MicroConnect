const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE}/campaigns`;

const getToken = () => localStorage.getItem("token");

const handleResponse = async (res) => {
  try {
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Request failed" };
    }

    if (
      data?.success === undefined &&
      (Array.isArray(data) || Array.isArray(data?.campaigns) || Array.isArray(data?.data) || data?.campaign)
    ) {
      return {
        ...(Array.isArray(data) ? { campaigns: data } : data),
        success: true,
      };
    }

    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const apiCreateCampaign = async (campaignData) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(campaignData),
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const apiGetAllCampaigns = async (filters = {}) => {
  try {
    const query = new URLSearchParams(filters).toString();
    const url = query ? `${API_URL}?${query}` : API_URL;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const apiGetMyCampaigns = async () => {
  try {
    const res = await fetch(`${API_URL}/my`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const apiGetCampaignById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const apiUpdateCampaign = async (id, data) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const apiDeleteCampaign = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};
