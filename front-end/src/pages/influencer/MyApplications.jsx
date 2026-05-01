import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampaigns } from '../../data/mockCampaigns';
import {
  getInfluencerApplications,
  getProfileForUser,
  isInfluencerProfileComplete,
} from '../../data/influencerAccounts';
import '../../styles/influencer.css';

/*

      'We love your content style and audience match. Let’s schedule a call to confirm deliverables and timeline.'
  },
  {
    campaignId: 'skin-care-collection',
    status: 'Pending',
    statusTone: 'pending',
    appliedDate: '2026-03-21',
    proposal:
      'My audience engages strongly with beauty routines and educational reviews. I would position this launch through a clear, trust-based skincare story.'
  }
];
*/

export default function MyApplications() {
  const navigate = useNavigate();
  const campaigns = getCampaigns();
  const profileComplete = isInfluencerProfileComplete(getProfileForUser());

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
    }
  }, [profileComplete, navigate]);

  const applications = profileComplete ? getInfluencerApplications()
    .map((application) => {
      const campaign = campaigns.find((item) => item.id === application.campaignId);
      return campaign ? { ...application, campaign } : null;
    })
    .filter(Boolean) : [];

  if (!profileComplete) {
    return null;
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
          <button className="active">Applications</button>
        </nav>

        <div className="topbar-actions">
          <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
        </div>
      </header>

      <section className="campaigns-section padded-top">
        <div className="campaigns-header">
          <div>
            <p className="section-label">My Applications</p>
            <h2>Track your campaign applications</h2>
          </div>
        </div>

        <div className="applications-list">
          {applications.length > 0 ? applications.map((application) => {
            const applicationBrandName =
              application.campaign.brandName ||
              application.campaign.brand ||
              application.brandName ||
              'Brand';
            const durationDays = Math.max(
              1,
              Math.ceil(
                (new Date(application.campaign.endDate) - new Date(application.campaign.startDate)) /
                (1000 * 60 * 60 * 24)
              )
            );

            return (
            <article className="application-card" key={application.id}>
              <div className="application-media">
                <img
                  src={application.campaign.imageSrc}
                  alt={application.campaign.name}
                  className="application-image"
                />
              </div>

              <div className="application-body">
                <div className="application-header">
                  <div className="application-heading">
                    <h3>{application.campaign.name}</h3>
                    <p className="application-subtitle">{applicationBrandName} | {application.campaign.objective}</p>
                  </div>
                  <div className="application-status">
                    <span className={`status-badge status-${application.statusTone}`}>
                      {application.status}
                    </span>
                  </div>
                </div>

                <div className="application-content">
                  <div className="application-stat-grid">
                    <div className="application-stat-card">
                      <span className="application-stat-label">Applications</span>
                      <span className="application-stat-value">Open</span>
                    </div>
                    <div className="application-stat-card">
                      <span className="application-stat-label">Budget</span>
                      <span className="application-stat-value">${application.campaign.budget}</span>
                    </div>
                    <div className="application-stat-card">
                      <span className="application-stat-label">Duration</span>
                      <span className="application-stat-value">{durationDays} days</span>
                    </div>
                    <div className="application-stat-card">
                      <span className="application-stat-label">Influencers</span>
                      <span className="application-stat-value">{application.campaign.influencersCount}</span>
                    </div>
                  </div>

                  <div className="application-meta">
                    <span>
                      Brand: {applicationBrandName}
                    </span>
                    <span>
                      Applied:{' '}
                      {new Date(application.appliedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span>{application.campaign.objective}</span>
                  </div>

                  <div className="application-message">
                    <h4>Your Proposal</h4>
                    <p>{application.proposal}</p>
                  </div>

                  {application.brandResponse && (
                    <div className="application-response">
                      <h4>Brand Response</h4>
                      <p>{application.brandResponse}</p>
                    </div>
                  )}
                </div>

                <div className="application-actions">
                  {application.statusTone === 'accepted' && (
                    <button className="btn btn-primary">
                      Start Collaboration
                    </button>
                  )}
                </div>
              </div>
            </article>
          )}) : (
            <div className="no-results">
              <h3>No applications yet</h3>
              <p>Apply to campaigns that fit your audience and track every proposal here.</p>
              <button className="btn btn-primary" onClick={() => navigate('/influencer')}>
                Browse Campaigns
              </button>
            </div>
          )}
        </div>
      </section>
      </div>
    </main>
  );
}
