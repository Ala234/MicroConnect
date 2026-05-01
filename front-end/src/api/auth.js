import {
  createEmptyInfluencerProfile,
  getMockInfluencerAccountByCredentials,
  saveInfluencerProfile,
  toAuthResponse,
} from "../data/influencerAccounts";

// Base URL of the backend
const API_URL = "http://localhost:5000/api/auth";
const INFLUENCER_API_URL = "http://localhost:5000/api/influencers";

const isMockToken = (token) => token?.startsWith("mock-token-");

const authHeaders = (token = localStorage.getItem("token")) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const readJson = async (res) => {
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
};

export async function getCurrentInfluencerProfile(token = localStorage.getItem("token")) {
  if (!token || isMockToken(token)) {
    return null;
  }

  const res = await fetch(`${INFLUENCER_API_URL}/profile/me`, {
    headers: authHeaders(token),
  });

  const data = await readJson(res);
  return data.influencer;
}

export async function saveCurrentInfluencerProfile(profile, token = localStorage.getItem("token")) {
  if (!token || isMockToken(token)) {
    return profile;
  }

  const res = await fetch(`${INFLUENCER_API_URL}/profile/me`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(profile),
  });

  const data = await readJson(res);
  return data.influencer;
}

// Register a new user
export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await readJson(res);

  if (data.user?.role === "influencer") {
    saveInfluencerProfile(
      data.influencerProfile ||
        createEmptyInfluencerProfile({
          name: data.user.name || name,
          email: data.user.email || email,
        })
    );
  }

  return data;
}

// Login user
export async function loginUser({ email, password }) {
  const mockInfluencerAccount = getMockInfluencerAccountByCredentials({
    email,
    password,
  });

  if (mockInfluencerAccount) {
    return toAuthResponse(mockInfluencerAccount);
  }

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await readJson(res);

  return data;
}

// Get current logged-in user
export async function getCurrentUser() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");

  if (token.startsWith("mock-token-")) {
    return { user: JSON.parse(localStorage.getItem("user")) };
  }

  const res = await fetch(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await readJson(res);

  return data;
}

// Logout user
export async function logoutUser() {
  const token = localStorage.getItem("token");

  if (token && !token.startsWith("mock-token-")) {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
