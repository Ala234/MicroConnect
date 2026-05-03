import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InfluencerTopNav from '../../components/influencer/InfluencerTopNav';
import { fetchCampaignById } from '../../data/mockCampaigns';
import { getProfileForUser, isInfluencerProfileComplete } from '../../data/influencerAccounts';
import { fetchConversation, sendMessage } from '../../api/messages';
import '../../styles/influencer.css';

const formatTime = (iso) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

export default function MessagingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);

  const currentUser = getCurrentUser();
  const myId = currentUser?._id || currentUser?.id;
  const returnTo = location.state?.returnTo || `/influencer/campaign/${id}`;
  const profileComplete = isInfluencerProfileComplete(getProfileForUser());
  const brandId = campaign?.brandId;
  const campaignBrandName = campaign?.brandName || campaign?.brand || 'Brand';

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
    }
  }, [profileComplete, navigate]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setCampaignLoading(true);
      const found = await fetchCampaignById(id);
      if (!cancelled) {
        setCampaign(found);
        setCampaignLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (!brandId) return undefined;

    let cancelled = false;
    const load = async () => {
      const result = await fetchConversation(brandId);
      if (cancelled) return;
      if (result.success) {
        setMessages(result.messages);
        setError('');
      } else {
        setError(result.message);
      }
    };

    load();
    const interval = setInterval(load, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [brandId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  if (!profileComplete) {
    return null;
  }

  if (campaignLoading) {
    return (
      <main className="influencer-page dashboard-page">
        <div className="dashboard-shell influencer-shell">
          <section className="campaigns-section padded-top">
            <div className="content-card">
              <p className="text-muted">Loading conversation...</p>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!campaign) {
    return (
      <main className="influencer-page dashboard-page">
        <div className="dashboard-shell influencer-shell">
          <header className="influencer-topbar dashboard-topbar">
            <div className="brand-logo dashboard-logo">
              <span className="brand-mark dashboard-logo-icon">M</span>
              <div>
                <p className="brand-name">MicroConnect</p>
                <p className="brand-subtitle">Influencer Portal</p>
              </div>
            </div>
            <InfluencerTopNav active="campaigns" />
            <div className="topbar-actions">
              <button className="dashboard-logout">Sign out</button>
            </div>
          </header>
          <section className="campaigns-section padded-top">
            <div className="content-card">
              <h3>Campaign Not Found</h3>
              <p className="text-muted">The requested campaign could not be found.</p>
              <button className="btn btn-secondary" onClick={() => navigate('/influencer')}>
                Back to Campaigns
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const handleSendMessage = async () => {
    const text = messageText.trim();
    if (!text || sending || !brandId) return;

    setSending(true);
    const result = await sendMessage(brandId, text);
    if (result.success) {
      setMessages((prev) => [...prev, result.message]);
      setMessageText('');
      setError('');
    } else {
      setError(result.message);
    }
    setSending(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <main className="influencer-page dashboard-page">
      <div className="dashboard-shell influencer-shell">
        <header className="influencer-topbar dashboard-topbar">
          <div className="brand-logo dashboard-logo">
            <span className="brand-mark dashboard-logo-icon">M</span>
            <div>
              <p className="brand-name">MicroConnect</p>
              <p className="brand-subtitle">Influencer Portal</p>
            </div>
          </div>

          <InfluencerTopNav active="campaigns" />

          <div className="topbar-actions">
            <button className="dashboard-logout ghost" onClick={() => navigate(returnTo)}>
              Back
            </button>
            <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
          </div>
        </header>

        <section className="campaigns-section padded-top messaging-section">
          <div className="messaging-container">
            <div className="messaging-content-card">
              <div className="chat-header">
                <div className="chat-header-avatar">
                  <div className="chat-avatar-circle">{campaign.name.charAt(0)}</div>
                </div>
                <div className="chat-header-info">
                  <h4 className="chat-header-name">{campaign.name}</h4>
                  <p className="chat-header-status">{campaignBrandName} | Active</p>
                </div>
              </div>

              <div className="messages-list" ref={listRef}>
                {messages.length === 0 ? (
                  <p className="text-muted" style={{ textAlign: 'center', padding: '20px 0' }}>
                    No messages yet. Send a message to start the conversation.
                  </p>
                ) : (
                  messages.map((msg) => {
                    const isMine = String(msg.sender) === String(myId);
                    return (
                      <div
                        key={msg._id}
                        className={`message-bubble message-${isMine ? 'influencer' : 'brand'}`}
                      >
                        <div className="message-text">{msg.text}</div>
                        <div className="message-timestamp">{formatTime(msg.createdAt)}</div>
                      </div>
                    );
                  })
                )}
                {error && (
                  <p style={{ color: '#ff6b6b', textAlign: 'center', marginTop: 8 }}>{error}</p>
                )}
              </div>

              <div className="message-input-area">
                <div className="message-composer">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="message-textarea"
                    rows={1}
                  />
                  <button
                    className="btn btn-send"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || sending}
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
