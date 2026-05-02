const API_URL = "http://localhost:5000/api/campaigns";

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