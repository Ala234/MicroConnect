import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InfluencerTopNav from '../../components/influencer/InfluencerTopNav';
import { fetchCampaignById } from '../../data/mockCampaigns';
import { applyToCampaign, getMyApplications } from '../../api/applications';
import { getProfileForUser, isInfluencerProfileComplete, getCurrentUser } from '../../data/influencerAccounts';
import '../../styles/influencer.css';

export default function CampaignDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [proposal, setProposal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [bannerMessage, setBannerMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const profileComplete = isInfluencerProfileComplete(getProfileForUser());
  const currentUser = getCurrentUser();
  const influencerProfile = getProfileForUser(currentUser);

  const campaignBrandName = campaign?.brandName || campaign?.brand || 'Brand';
  const durationDays = campaign?.startDate && campaign?.endDate
    ? Math.max(1, Math.ceil((new Date(campaign.endDate) - new Date(campaign.startDate)) / (1000 * 60 * 60 * 24)))
    : 0;

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load campaign
        const campaignData = await fetchCampaignById(id);
        setCampaign(campaignData);

        // Check if already applied
        const appsResult = await getMyApplications();
        if (appsResult.success && appsResult.applications) {
          const alreadyApplied = appsResult.applications.some(
            (app) => String(app.campaignId) === String(id) || String(app.campaignId?._id) === String(id)
          );
          setHasApplied(alreadyApplied);
        }
      } catch (err) {
        console.error('Failed to load campaign:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, profileComplete, navigate]);

  const handleSubmitApplication = async () => {
    if (!proposal.trim()) {
      setErrorMessage('Please write a short proposal explaining why you fit this campaign');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await applyToCampaign(
        id,
        proposal,
        {
          profileImage: influencerProfile.profileImage,
          followers: influencerProfile.followers,
          engagement: influencerProfile.engagement,
          age: influencerProfile.audience?.age || '',
          location: influencerProfile.location,
          categories: influencerProfile.categories,
        }
      );

      if (result.success) {
        setHasApplied(true);
        setShowApplyModal(false);
        setProposal('');
        setBannerMessage({
          type: 'success',
          title: 'Application sent!',
          text: `Your application was sent to ${campaignBrandName}. They'll review it soon.`,
        });
      } else {
        setErrorMessage(result.message || 'Failed to submit application');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profileComplete) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="influencer-page dashboard-page">
        <div className="dashboard-shell influencer-shell">
          <section className="campaigns-section padded-top">
            <div className="content-card">
              <h3>Loading campaign...</h3>
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
            <button className="dashboard-logout" onClick={() => navigate('/login')}>
              Sign out
            </button>
          </div>
        </header>

        <section className="campaigns-section padded-top">
          <div className="campaigns-header">
            <div>
              <p className="section-label">Campaign Details</p>
              <h2>{campaign.name}</h2>
              <p className="text-muted">by {campaignBrandName}</p>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/influencer')}>
              ← Back
            </button>
          </div>

          {bannerMessage && (
            <div
              className="content-card"
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                marginBottom: '20px',
              }}
            >
              <strong style={{ color: '#22c55e' }}>{bannerMessage.title}</strong>
              <p style={{ color: '#b8c2e4', margin: '6px 0 0 0' }}>{bannerMessage.text}</p>
            </div>
          )}

          <div className="campaign-details-grid">
            <div className="campaign-image-section">
              <img src={campaign.imageSrc} alt={campaign.name} className="campaign-detail-image" />
            </div>

            <div className="campaign-info-section">
              <div className="content-card campaign-overview-card">
                <div className="campaign-overview-header">
                  <div>
                    <p className="section-label">Overview</p>
                    <h3>{campaign.name}</h3>
                    <p className="campaign-overview-subtitle">
                      {campaignBrandName} | {campaign.objective} campaign for {(campaign.platforms || []).join(', ')}
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
                    <span className="meta-label">Brand</span>
                    <span className="meta-value">{campaignBrandName}</span>
                  </div>
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
                    <span className="meta-value">{(campaign.platforms || []).join(', ')}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Objective</span>
                    <span className="meta-value">{campaign.objective}</span>
                  </div>
                </div>

                <div className="campaign-action-buttons">
                  {hasApplied ? (
                    <button className="btn btn-secondary" disabled>
                      ✓ Already Applied
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>
                      Apply
                    </button>
                  )}
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      navigate(`/influencer/campaign/${campaign.id || campaign._id}/message`, {
                        state: { returnTo: `/influencer/campaign/${campaign.id || campaign._id}` },
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

        {/* Apply Modal */}
        {showApplyModal && (
          <div
            className="campaign-modal-overlay"
            onClick={() => !isSubmitting && setShowApplyModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#1a1f3a',
                padding: '32px',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '90%',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <h3 style={{ color: 'white', marginBottom: '8px' }}>Apply to Campaign</h3>
              <p style={{ color: '#9aa8d2', fontSize: '14px', marginBottom: '20px' }}>
                Tell {campaignBrandName} why you'd be a great fit for "{campaign.name}"
              </p>

              {errorMessage && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}
                >
                  {errorMessage}
                </div>
              )}

              <label style={{ color: '#b8c2e4', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                Your Proposal
              </label>
              <textarea
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                placeholder="Hi! I'd love to collaborate on this campaign because..."
                rows="6"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                disabled={isSubmitting}
              />

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowApplyModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSubmitApplication}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}