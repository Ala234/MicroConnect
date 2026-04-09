import { useState } from "react";
import { FiMessageCircle, FiSend, FiX } from "react-icons/fi";

const initialConversation = [
  {
    id: "msg-1",
    sender: "influencer",
    text: "Hi, I reviewed the campaign brief and I am interested in the next steps.",
    time: "09:12",
  },
  {
    id: "msg-2",
    sender: "brand",
    text: "Great. I wanted to confirm timing, deliverables, and contract details with you.",
    time: "09:14",
  },
];

export default function BrandChatModal({
  influencerName,
  influencerImage,
  onClose,
}) {
  const [messages, setMessages] = useState(initialConversation);
  const [draft, setDraft] = useState("");

  const handleSend = () => {
    const trimmedDraft = draft.trim();

    if (!trimmedDraft) {
      return;
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: `msg-${currentMessages.length + 1}`,
        sender: "brand",
        text: trimmedDraft,
        time: "Now",
      },
    ]);
    setDraft("");
  };

  return (
    <div className="campaign-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={(event) => event.stopPropagation()}>
        <div className="chat-modal-header">
          <div className="chat-modal-profile">
            <img src={influencerImage} alt={influencerName} />
            <div>
              <strong>{influencerName}</strong>
              <span>Active now</span>
            </div>
          </div>

          <button className="chat-close-btn" onClick={onClose} aria-label="Close chat">
            <FiX />
          </button>
        </div>

        <div className="chat-modal-body">
          <div className="chat-intro-chip">
            <FiMessageCircle />
            <span>Campaign conversation</span>
          </div>

          <div className="chat-message-list">
            {messages.map((message) => (
              <div
                className={`chat-message ${message.sender}`}
                key={message.id}
              >
                <p>{message.text}</p>
                <span>{message.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="chat-modal-footer">
          <textarea
            rows="3"
            placeholder="Write a message to the influencer..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />

          <button className="dashboard-primary-btn" onClick={handleSend}>
            <FiSend />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
