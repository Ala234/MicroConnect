import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCampaignById } from '../../data/mockCampaigns';
import '../../styles/influencer.css';

export default function CampaignDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const campaign = getCampaignById(id);
  const durationDays = Math.max(
    1,
    Math.ceil((new Date(campaign?.endDate) - new Date(campaign?.startDate)) / (1000 * 60 * 60 * 24))
  );

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
          <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
        </div>
      </header>

      <section className="campaigns-section padded-top">
        <div className="campaigns-header">
          <div>
            <p className="section-label">Campaign Details</p>
            <h2>{campaign.name}</h2>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/influencer')}>
            ← Back
          </button>
        </div>

        <div className="campaign-details-grid">
          <div className="campaign-image-section">
            <img
              src={campaign.imageSrc}
              alt={campaign.name}
              className="campaign-detail-image"
            />
          </div>

          <div className="campaign-info-section">
            <div className="content-card campaign-overview-card">
              <div className="campaign-overview-header">
                <div>
                  <p className="section-label">Overview</p>
                  <h3>{campaign.name}</h3>
                  <p className="campaign-overview-subtitle">
                    {campaign.objective} campaign for {campaign.platforms.join(', ')}
                  </p>
                </div>
                <span className="campaign-objective-pill">{campaign.objective}</span>
              </div>

              <div className="campaign-stat-grid">
                <div className="campaign-stat-card">
                  <span className="campaign-stat-label">Applications</span>
                  <span className="campaign-stat-value">Open</span>
                </div>
                <div className="campaign-stat-card">
                  <span className="campaign-stat-label">Budget</span>
                  <span className="campaign-stat-value">${campaign.budget}</span>
                </div>
                <div className="campaign-stat-card">
                  <span className="campaign-stat-label">Duration</span>
                  <span className="campaign-stat-value">{durationDays} days</span>
                </div>
                <div className="campaign-stat-card">
                  <span className="campaign-stat-label">Influencers</span>
                  <span className="campaign-stat-value">{campaign.influencersCount}</span>
                </div>
              </div>

              <div className="campaign-meta">
                <div className="meta-item">
                  <span className="meta-label">Target Audience</span>
                  <span className="meta-value">{campaign.targetAudience}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Content Type</span>
                  <span className="meta-value">{campaign.contentType}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Platforms</span>
                  <span className="meta-value">{campaign.platforms.join(', ')}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Objective</span>
                  <span className="meta-value">{campaign.objective}</span>
                </div>
              </div>
              <div className="campaign-action-buttons">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate(`/influencer/campaign/${campaign.id}/propose`, {
                      state: { returnTo: `/influencer/campaign/${campaign.id}` }
                    })
                  }
                >
                  Apply
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    navigate(`/influencer/campaign/${campaign.id}/message`, {
                      state: { returnTo: `/influencer/campaign/${campaign.id}` }
                    })
                  }
                >
                  Message
                </button>
              </div>
            </div>

            <div className="content-card">
              <h3>Description</h3>
              <p className="campaign-description">{campaign.description}</p>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
