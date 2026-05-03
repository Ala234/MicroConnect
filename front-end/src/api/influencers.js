const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE}/influencers`;

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

export const saveInfluencerProfile = async (profileData) => {
  try {
    const res = await fetch(`${API_URL}/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getMyInfluencerProfile = async () => {
  try {
    const res = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getInfluencerById = async (id) => {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const getAllInfluencers = async () => {
  try {
    const res = await fetch(`${API_URL}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    return handleResponse(res);
  } catch (err) {
    return { success: false, message: err.message };
  }
};