const API_URL = "http://localhost:5000/api/campaigns";

const getToken = () => localStorage.getItem("token");

export const createCampaign = async (campaignData) => {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(campaignData),
  });
  return res.json();
};

export const getAllCampaigns = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  const res = await fetch(`${API_URL}?${query}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const getMyCampaigns = async () => {
  const res = await fetch(`${API_URL}/my`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const getCampaignById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};

export const deleteCampaign = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  return res.json();
};