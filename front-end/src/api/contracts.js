const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "");
const API_URL = `${API_BASE_URL}/contracts`;

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

export const createContract = async (contractData) =>
  request(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(contractData),
  });

export const getContracts = async () =>
  request(API_URL, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getMyContracts = async () =>
  request(`${API_URL}/my`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getContractsForInfluencer = async (influencerIdOrEmail) =>
  request(`${API_URL}/influencer/${encodeURIComponent(influencerIdOrEmail)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getContractsForBrand = async (brandId) =>
  request(`${API_URL}/brand/${encodeURIComponent(brandId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const getContractById = async (contractId) =>
  request(`${API_URL}/${encodeURIComponent(contractId)}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

export const updateContractStatus = async (contractId, status) =>
  request(`${API_URL}/${encodeURIComponent(contractId)}/status`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });

export const getPendingContractCount = async () => {
  const result = await getMyContracts();
  if (!result.success) {
    return 0;
  }

  return (result.contracts || []).filter((contract) => contract.status === "Pending").length;
};
