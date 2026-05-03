const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE}/messages`;

const getToken = () => localStorage.getItem("token");

export const fetchConversation = async (otherUserId) => {
  try {
    const res = await fetch(`${API_URL}/${otherUserId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Failed to load messages" };
    }
    return { success: true, messages: data.messages || [] };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const sendMessage = async (recipientId, text) => {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ recipientId, text }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message || "Failed to send" };
    }
    return { success: true, message: data.message };
  } catch (err) {
    return { success: false, message: err.message };
  }
};
