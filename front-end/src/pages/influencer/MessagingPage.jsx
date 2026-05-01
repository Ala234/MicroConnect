import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getCampaignById } from '../../data/mockCampaigns';
import { getProfileForUser, isInfluencerProfileComplete } from '../../data/influencerAccounts';
import '../../styles/influencer.css';

export default function MessagingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'brand',
      text: 'Hi! We\'re excited to have you view this campaign. Feel free to reach out with any questions!',
      timestamp: '10:30 AM'
    }
  ]);
  const [messageText, setMessageText] = useState('');

  const campaign = getCampaignById(id);
  const returnTo = location.state?.returnTo || `/influencer/campaign/${id}`;
  const profileComplete = isInfluencerProfileComplete(getProfileForUser());

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
    }
  }, [profileComplete, navigate]);

  if (!profileComplete) {
    return null;
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
            <nav className="topnav">
              <button onClick={() => navigate('/influencer')}>Campaigns</button>
              <button onClick={() => navigate('/influencer/profile')}>Profile</button>
              <button onClick={() => navigate('/influencer/applications')}>Applications</button>
            </nav>
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

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: 'influencer',
        text: messageText,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, newMessage]);
      setMessageText('');
    }
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

          <nav className="topnav">
            <button onClick={() => navigate('/influencer')}>Campaigns</button>
            <button onClick={() => navigate('/influencer/profile')}>Profile</button>
            <button onClick={() => navigate('/influencer/applications')}>Applications</button>
          </nav>

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
                  <p className="chat-header-status">Active | Online</p>
                </div>
              </div>

              <div className="messages-list">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message-bubble message-${msg.sender}`}>
                    <div className="message-text">{msg.text}</div>
                    <div className="message-timestamp">{msg.timestamp}</div>
                  </div>
                ))}
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
                    disabled={!messageText.trim()}
                  >
                    Send
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
