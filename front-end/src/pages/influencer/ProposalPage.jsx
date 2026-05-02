import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import InfluencerTopNav from '../../components/influencer/InfluencerTopNav';
import { fetchCampaignById } from '../../data/mockCampaigns';
import { applyToCampaign } from '../../api/applications';
import {
  getCurrentUser,
  getProfileForUser,
  isInfluencerProfileComplete,
} from '../../data/influencerAccounts';
import '../../styles/influencer.css';

export default function ProposalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const influencerProfile = getProfileForUser(currentUser);
  const [campaign, setCampaign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [proposal, setProposal] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const campaignBrandName = campaign?.brandName || campaign?.brand || 'Brand';
  const returnTo = location.state?.returnTo || `/influencer/campaign/${id}`;
  const profileComplete = isInfluencerProfileComplete(influencerProfile);

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
      return;
    }

    let isMounted = true;

    const loadCampaign = async () => {
      setIsLoading(true);
      try {
        const campaignData = await fetchCampaignById(id);
        if (isMounted) {
          setCampaign(campaignData);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCampaign();

    return () => {
      isMounted = false;
    };
  }, [id, profileComplete, navigate]);

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

  const handleSubmit = async () => {
    if (proposal.trim()) {
      setIsSubmitting(true);
      setErrorMessage('');
      const result = await applyToCampaign(id, proposal.trim(), {
        profileImage: influencerProfile.profileImage,
        followers: influencerProfile.followers,
        engagement: influencerProfile.engagement,
        age: influencerProfile.audience?.age || '',
        location: influencerProfile.location,
        categories: influencerProfile.categories,
      });

      if (!result.success) {
        setErrorMessage(result.message || 'Failed to submit proposal');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      setTimeout(() => {
        navigate('/influencer/applications');
      }, 2000);
      setIsSubmitting(false);
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

        <section className="campaigns-section padded-top proposal-page-section">
          <div className="proposal-campaign-header">
            <div className="campaign-header-content">
              <div className="campaign-header-avatar">
                <div className="campaign-header-circle">{campaign.name.charAt(0)}</div>
              </div>
              <div className="campaign-header-info">
                <h1 className="campaign-header-title">{campaign.name}</h1>
                <p className="campaign-header-meta">{campaignBrandName} | Open for Applications</p>
              </div>
            </div>
          </div>

          {!isSubmitted ? (
            <div className="proposal-main-card">
              <div className="proposal-form-section">
                <div className="proposal-form-header">
                  <h2>Submit Your Proposal</h2>
                  <p className="proposal-description">
                    Tell the brand why you're a great fit for this campaign. Share your experience, ideas, and content vision.
                  </p>
                </div>

                <div className="proposal-form-content">
                  {errorMessage && (
                    <div className="form-error-summary">
                      {errorMessage}
                    </div>
                  )}
                  <div className="form-group proposal-form-group">
                    <label htmlFor="proposal">Your Proposal</label>
                    <textarea
                      id="proposal"
                      value={proposal}
                      onChange={(e) => setProposal(e.target.value)}
                      placeholder="Tell us about your experience, why this campaign interests you, and your content ideas..."
                      rows={15}
                      className="form-textarea proposal-textarea"
                    />
                  </div>
                </div>

                <div className="proposal-actions-section">
                  <button className="btn btn-outline" onClick={() => navigate(returnTo)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={!proposal.trim() || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Proposal'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="proposal-main-card success-message">
              <div className="proposal-form-section">
                <div className="proposal-form-header">
                  <h2>Proposal Sent Successfully!</h2>
                  <p className="text-success">
                    Your proposal has been submitted. You can track your applications and message with the brand in your Applications page.
                  </p>
                  <p className="text-muted">Redirecting to your applications...</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
