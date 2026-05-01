import {
  getMockInfluencerAccountByCredentials,
  registerInfluencerAccount,
  toAuthResponse,
} from "../data/influencerAccounts";

// Base URL of the backend
const API_URL = "http://localhost:5000/api/auth";

// Register a new user
export async function registerUser({ name, email, password, role }) {
  if (role === "influencer") {
    return registerInfluencerAccount({ name, email, password });
  }

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, role }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Registration failed");
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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Login failed");
  }

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

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Failed to fetch user");
  }

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
