import {
  createEmptyInfluencerProfile,
  getProfileForUser,
  getMockInfluencerAccountByCredentials,
  saveInfluencerProfile,
  toAuthResponse,
} from "../data/influencerAccounts";

// Base URL of the backend
const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const API_URL = `${API_BASE_URL}/auth`;
const INFLUENCER_API_URL = `${API_BASE_URL}/influencers`;

const isMockToken = (token) => token?.startsWith("mock-token-");
const LOCAL_ACCOUNT_STORAGE_KEY = "influencerAccounts";

const normalizeEmail = (email = "") => String(email || "").trim().toLowerCase();

const authHeaders = (token = localStorage.getItem("token")) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const readStoredJson = (key, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : fallback;
  } catch {
    return fallback;
  }
};

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return readStoredJson("user", null);
};

const getStoredInfluencerAccount = (email) => {
  const normalizedEmail = normalizeEmail(email);
  const storedAccounts = readStoredJson(LOCAL_ACCOUNT_STORAGE_KEY, {});

  return Object.values(storedAccounts).find(
    (account) => normalizeEmail(account.email) === normalizedEmail
  ) || null;
};

const readJson = async (res) => {
  const contentType = res.headers.get("content-type") || "";
  const responseText = await res.text();
  const requestUrl = res.url || "unknown URL";

  if (!contentType.toLowerCase().includes("application/json")) {
    const responsePreview = responseText.trim().replace(/\s+/g, " ").slice(0, 120);
    throw new Error(
      `Expected JSON from ${requestUrl}, but received ${contentType || "non-JSON"} with status ${res.status}. ${responsePreview}`
    );
  }

  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(`Invalid JSON from ${requestUrl} with status ${res.status}.`);
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status} at ${requestUrl}`);
  }

  return data;
};

const requestAuth = async (path, body) => {
  const res = await fetch(`${API_URL}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return readJson(res);
};

const syncLocalInfluencerAccount = async (account, profileToSave) => {
  const email = account?.email || profileToSave?.email;
  const name = profileToSave?.name || account?.name || "Influencer";
  const password = account?.password;

  if (!email || !password) {
    throw new Error(
      "This local influencer account is not linked to MongoDB and does not have stored credentials. Log out, register or log in again, then retry saving."
    );
  }

  let authData;
  try {
    authData = await requestAuth("login", { email, password });
  } catch {
    authData = await requestAuth("register", {
      name,
      email,
      password,
      role: "influencer",
    });
  }

  const localProfile = profileToSave || getProfileForUser({
    ...account,
    email,
    name,
    role: "influencer",
  });
  const backendProfile = await saveCurrentInfluencerProfile(
    {
      ...localProfile,
      name: localProfile.name || name,
      email: localProfile.email || email,
    },
    authData.token
  );

  if (typeof window !== "undefined") {
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify(authData.user));
  }

  if (backendProfile) {
    saveInfluencerProfile(backendProfile);
  }

  return {
    ...authData,
    influencerProfile: backendProfile,
  };
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
  if (!token) {
    return profile;
  }

  if (isMockToken(token)) {
    const currentUser = getStoredUser();
    const storedAccount = getStoredInfluencerAccount(profile.email || currentUser?.email);
    const syncedAccount = {
      ...currentUser,
      ...storedAccount,
      email: profile.email || storedAccount?.email || currentUser?.email,
      name: profile.name || storedAccount?.name || currentUser?.name,
      role: "influencer",
    };
    const syncedData = await syncLocalInfluencerAccount(syncedAccount, profile);
    return syncedData.influencerProfile || profile;
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
  const data = await requestAuth("register", { name, email, password, role });

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

  try {
    return await requestAuth("login", { email, password });
  } catch (error) {
    if (mockInfluencerAccount) {
      try {
        return await syncLocalInfluencerAccount(mockInfluencerAccount);
      } catch {
        return toAuthResponse(mockInfluencerAccount);
      }
    }

    throw error;
  }
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
