import { useEffect, useRef, useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";
import { fetchConversation, sendMessage } from "../../api/messages";

const formatTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export default function BrandChatModal({
  influencerId,
  influencerName,
  influencerImage,
  onClose,
}) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();
  const myId = currentUser?._id || currentUser?.id;

  const loadMessages = async () => {
    if (!influencerId) return;
    const result = await fetchConversation(influencerId);
    if (result.success) {
      setMessages(result.messages);
      setError("");
    } else {
      setError(result.message);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setLoading(true);
      await loadMessages();
      if (!cancelled) setLoading(false);
    };
    init();
    const interval = setInterval(loadMessages, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [influencerId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending || !influencerId) return;

    setSending(true);
    const result = await sendMessage(influencerId, text);
    if (result.success) {
      setMessages((prev) => [...prev, result.message]);
      setDraft("");
      setError("");
    } else {
      setError(result.message);
    }
    setSending(false);
  };

  return (
    <div className="campaign-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(event) => event.stopPropagation()}>
        <div className="chat-modal-header">
          <div className="chat-modal-profile">
            <img src={influencerImage} alt={influencerName} />
            <div>
              <strong>{influencerName}</strong>
              <span>Direct message</span>
            </div>
          </div>

          <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            <FiX />
          </button>
        </div>

        <div className="chat-modal-body">
          <div className="chat-intro-chip">
            <FiMessageCircle />
            <span>Conversation</span>
          </div>

          <div className="chat-message-list" ref={listRef}>
            {loading ? (
              <p style={{ color: "#9aa8d2", textAlign: "center" }}>Loading messages...</p>
            ) : messages.length === 0 ? (
              <p style={{ color: "#9aa8d2", textAlign: "center" }}>
                No messages yet. Say hi!
              </p>
            ) : (
              messages.map((message) => {
                const isMine = String(message.sender) === String(myId);
                return (
                  <div
                    className={`chat-message ${isMine ? "brand" : "influencer"}`}
                    key={message._id}
                  >
                    <p>{message.text}</p>
                    <span>{formatTime(message.createdAt)}</span>
                  </div>
                );
              })
            )}
            {error && (
              <p style={{ color: "#ff6b6b", textAlign: "center", marginTop: 8 }}>
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="chat-modal-footer">
          <textarea
            rows="3"
            placeholder="Write a message to the influencer..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
          />

          <button
            className="dashboard-primary-btn"
            onClick={handleSend}
            disabled={sending || !draft.trim()}
          >
            <FiSend />
            <span>{sending ? "Sending..." : "Send"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
