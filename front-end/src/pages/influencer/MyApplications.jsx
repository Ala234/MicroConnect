import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfluencerTopNav from '../../components/influencer/InfluencerTopNav';
import { getMyApplications } from '../../api/applications';
import { createBrandReview, getBrandReviewForApplication } from '../../api/brandReviews';
import { getMyContracts } from '../../api/contracts';
import {
  getProfileForUser,
  isInfluencerProfileComplete,
} from '../../data/influencerAccounts';
import '../../styles/influencer.css';

const statusConfig = {
  pending: {
    label: 'Pending',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.3)',
    icon: '⏳',
    description: 'The brand is reviewing your application',
  },
  accepted: {
    label: 'Accepted',
    color: '#22c55e',
    bg: 'rgba(34, 197, 94, 0.12)',
    border: 'rgba(34, 197, 94, 0.3)',
    icon: '✓',
    description: 'Congratulations! The brand accepted your application',
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.3)',
    icon: '✕',
    description: 'The brand chose another influencer this time',
  },
};

const getRecordId = (record) => {
  if (!record) return '';
  if (typeof record === 'object') return String(record._id || record.id || '');
  return String(record);
};

const getApplicationRecordId = (application) => application?.id || application?._id || '';

const getApplicationCampaignRecord = (application) =>
  application?.campaignId && typeof application.campaignId === 'object'
    ? application.campaignId
    : application?.campaign && typeof application.campaign === 'object'
      ? application.campaign
      : null;

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandReviewsByApplication, setBrandReviewsByApplication] = useState({});
  const [contractsByApplication, setContractsByApplication] = useState({});
  const [reviewModalApplication, setReviewModalApplication] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewNotice, setReviewNotice] = useState('');
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  const profileComplete = isInfluencerProfileComplete(getProfileForUser());
  const reviewCampaignRecord = getApplicationCampaignRecord(reviewModalApplication);
  const reviewCampaignName = reviewModalApplication?.campaignName || reviewCampaignRecord?.name || 'Campaign';
  const reviewBrandName = reviewCampaignRecord?.brandName || reviewModalApplication?.brandName || 'Brand';

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
      return;
    }

    const loadApplications = async () => {
      setIsLoading(true);
      try {
        const result = await getMyApplications();
        if (result.success) {
          const mappedApplications = (result.applications || []).map((application) => ({
            ...application,
            status: String(application.status || 'pending').toLowerCase(),
          }));
          setApplications(mappedApplications);

          const acceptedApplications = mappedApplications.filter(
            (application) => application.status === 'accepted' && getApplicationRecordId(application)
          );
          const reviewEntries = await Promise.all(
            acceptedApplications.map(async (application) => {
              const applicationId = getApplicationRecordId(application);
              const reviewResult = await getBrandReviewForApplication(applicationId);
              return [applicationId, reviewResult.success ? reviewResult.review : null];
            })
          );
          setBrandReviewsByApplication(
            reviewEntries.reduce((reviews, [applicationId, review]) => {
              if (review) {
                reviews[applicationId] = review;
              }
              return reviews;
            }, {})
          );

          const contractsResult = await getMyContracts();
          if (contractsResult.success) {
            setContractsByApplication(
              (contractsResult.contracts || []).reduce((contracts, contract) => {
                const applicationId = getRecordId(contract.application);
                if (applicationId) {
                  contracts[applicationId] = contract;
                }
                return contracts;
              }, {})
            );
          } else {
            setContractsByApplication({});
          }

          setErrorMessage('');
        } else {
          setErrorMessage(result.message || 'Applications could not be loaded');
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
        setErrorMessage(err.message || 'Applications could not be loaded');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [profileComplete, navigate]);

  const openReviewModal = (application) => {
    setReviewModalApplication(application);
    setReviewRating(0);
    setReviewText('');
    setReviewError('');
    setReviewNotice('');
  };

  const closeReviewModal = () => {
    if (isReviewSubmitting) return;

    setReviewModalApplication(null);
    setReviewRating(0);
    setReviewText('');
    setReviewError('');
  };

  const handleSubmitBrandReview = async () => {
    const applicationId = getApplicationRecordId(reviewModalApplication);
    const campaignRecord = getApplicationCampaignRecord(reviewModalApplication);
    const campaignId = getRecordId(campaignRecord) || getRecordId(reviewModalApplication?.campaignId || reviewModalApplication?.campaign);
    const brandId = getRecordId(reviewModalApplication?.brandId || reviewModalApplication?.brand || campaignRecord?.brandId);
    const trimmedReview = reviewText.trim();

    if (!reviewRating) {
      setReviewError('Please select a rating from 1 to 5 stars.');
      return;
    }

    if (!trimmedReview) {
      setReviewError('Please write your brand review before submitting.');
      return;
    }

    setIsReviewSubmitting(true);
    setReviewError('');

    try {
      const result = await createBrandReview({
        applicationId,
        brandId,
        campaignId,
        rating: reviewRating,
        review: trimmedReview,
      });

      if (result.success) {
        setBrandReviewsByApplication((currentReviews) => ({
          ...currentReviews,
          [applicationId]: result.review,
        }));
        setReviewNotice('Brand review submitted.');
        setReviewModalApplication(null);
        setReviewRating(0);
        setReviewText('');
      } else {
        if (result.review) {
          setBrandReviewsByApplication((currentReviews) => ({
            ...currentReviews,
            [applicationId]: result.review,
          }));
        }

        setReviewError(result.message || 'Brand review could not be submitted.');
      }
    } catch (err) {
      setReviewError(err.message || 'Brand review could not be submitted.');
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const filteredApplications =
    statusFilter === 'all'
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  if (!profileComplete) return null;

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

          <InfluencerTopNav active="applications" />

          <div className="topbar-actions">
            <button className="dashboard-logout" onClick={() => navigate('/login')}>
              Sign out
            </button>
          </div>
        </header>

        <section className="campaigns-section padded-top">
          <div className="campaigns-header">
            <div>
              <p className="section-label">My Applications</p>
              <h2>Track your campaign applications</h2>
            </div>
          </div>

          {reviewNotice && (
            <div
              className="content-card"
              style={{
                background: 'rgba(34, 197, 94, 0.12)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                marginBottom: 20,
              }}
            >
              <p style={{ color: '#22c55e', margin: 0, fontWeight: 700 }}>{reviewNotice}</p>
            </div>
          )}

          {/* Status Tabs */}
          <div className="status-tabs" style={{ marginBottom: 20 }}>
            <button
              className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All <span className="status-tab-badge">{statusCounts.all}</span>
            </button>
            <button
              className={`status-tab ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending <span className="status-tab-badge pending">{statusCounts.pending}</span>
            </button>
            <button
              className={`status-tab ${statusFilter === 'accepted' ? 'active' : ''}`}
              onClick={() => setStatusFilter('accepted')}
            >
              Accepted <span className="status-tab-badge accepted">{statusCounts.accepted}</span>
            </button>
            <button
              className={`status-tab ${statusFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => setStatusFilter('rejected')}
            >
              Rejected <span className="status-tab-badge rejected">{statusCounts.rejected}</span>
            </button>
          </div>

          {isLoading ? (
            <div className="content-card">
              <h3>Loading your applications...</h3>
            </div>
          ) : errorMessage ? (
            <div className="no-results">
              <h3>Applications could not be loaded</h3>
              <p>{errorMessage}</p>
              <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="no-results">
              <h3>No applications yet</h3>
              <p>
                {statusFilter === 'all'
                  ? "You haven't applied to any campaigns yet. Browse available campaigns to find opportunities!"
                  : `No ${statusFilter} applications found.`}
              </p>
              {statusFilter === 'all' && (
                <button className="btn btn-primary" onClick={() => navigate('/influencer')}>
                  Browse Campaigns
                </button>
              )}
            </div>
          ) : (
            <div className="my-applications-list">
              {filteredApplications.map((app) => {
                const config = statusConfig[app.status] || statusConfig.pending;
                const applicationId = getApplicationRecordId(app);
                const campaignRecord = getApplicationCampaignRecord(app);
                const campaignId = getRecordId(campaignRecord) || getRecordId(app.campaignId || app.campaign);
                const campaignName = app.campaignName || campaignRecord?.name || 'Campaign';
                const brandName = campaignRecord?.brandName || app.brandName || 'Brand';
                const existingReview = brandReviewsByApplication[applicationId];
                const hasContract = Boolean(contractsByApplication[applicationId]);

                return (
                  <div className="application-card-new" key={applicationId}>
                    <div className="application-card-header">
                      <div>
                        <h3 style={{ color: 'white', margin: '0 0 6px 0' }}>{campaignName}</h3>
                        <p style={{ color: '#9aa8d2', fontSize: 13, margin: 0 }}>
                          {brandName} | Applied on{' '}
                          {new Date(app.createdAt || app.appliedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      <div
                        className="application-status-badge"
                        style={{
                          background: config.bg,
                          color: config.color,
                          border: `1px solid ${config.border}`,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{config.icon}</span>
                        <span>{config.label}</span>
                      </div>
                    </div>

                    <div
                      className="application-status-message"
                      style={{
                        background: config.bg,
                        borderLeft: `3px solid ${config.color}`,
                      }}
                    >
                      <p style={{ color: config.color, margin: 0, fontWeight: 600 }}>
                        {config.description}
                      </p>
                    </div>

                    {app.proposal && (
                      <div className="application-section">
                        <p className="application-section-label">Your proposal:</p>
                        <p className="application-proposal">"{app.proposal}"</p>
                      </div>
                    )}

                    {app.brandResponse && (
                      <div className="application-section">
                        <p className="application-section-label">Brand response:</p>
                        <p className="application-brand-response">"{app.brandResponse}"</p>
                      </div>
                    )}

                    <div className="application-actions">
                      {app.status === 'accepted' ? (
                        <>
                          {existingReview ? (
                            <button className="btn btn-secondary" disabled>
                              Brand reviewed
                            </button>
                          ) : (
                            <button
                              className="btn btn-primary"
                              onClick={() => openReviewModal(app)}
                            >
                              Review Brand
                            </button>
                          )}

                          {hasContract && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => navigate('/influencer/contracts')}
                            >
                              View Contract
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          className="btn btn-secondary"
                          onClick={() => navigate(`/influencer/campaign/${campaignId}`)}
                        >
                          View Campaign
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {reviewModalApplication && (
          <div
            className="campaign-modal-overlay"
            onClick={closeReviewModal}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.72)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 20,
            }}
          >
            <div
              className="content-card"
              onClick={(event) => event.stopPropagation()}
              style={{
                width: 'min(520px, 100%)',
                background: '#151b33',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              <p className="section-label">Review Brand</p>
              <h3 style={{ color: 'white', margin: '0 0 6px 0' }}>{reviewBrandName}</h3>
              <p className="text-muted" style={{ marginTop: 0 }}>
                Share feedback about your experience with {reviewBrandName} on {reviewCampaignName}.
              </p>

              <div style={{ marginTop: 18 }}>
                <p className="application-section-label">Rating</p>
                <div
                  aria-label="Brand rating"
                  role="radiogroup"
                  style={{ display: 'flex', gap: 8, marginTop: 8 }}
                >
                  {[1, 2, 3, 4, 5].map((ratingValue) => (
                    <button
                      key={ratingValue}
                      type="button"
                      aria-checked={reviewRating === ratingValue}
                      role="radio"
                      onClick={() => setReviewRating(ratingValue)}
                      disabled={isReviewSubmitting}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        border: reviewRating >= ratingValue
                          ? '1px solid rgba(251, 191, 36, 0.8)'
                          : '1px solid rgba(255, 255, 255, 0.16)',
                        background: reviewRating >= ratingValue
                          ? 'rgba(251, 191, 36, 0.16)'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: reviewRating >= ratingValue ? '#fbbf24' : '#7784ad',
                        fontSize: 24,
                        cursor: isReviewSubmitting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <label className="application-section-label" htmlFor="brand-review-text">
                  Written feedback
                </label>
                <textarea
                  id="brand-review-text"
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  rows="6"
                  disabled={isReviewSubmitting}
                  placeholder="Describe the brand communication, clarity, timeline, and collaboration experience."
                  style={{
                    width: '100%',
                    marginTop: 8,
                    padding: '12px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: 10,
                    color: 'white',
                    fontSize: 14,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {reviewError && (
                <div
                  style={{
                    marginTop: 16,
                    padding: '12px 14px',
                    borderRadius: 10,
                    color: '#ef4444',
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.28)',
                    fontSize: 13,
                  }}
                >
                  {reviewError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 22 }}>
                <button className="btn btn-secondary" onClick={closeReviewModal} disabled={isReviewSubmitting}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleSubmitBrandReview} disabled={isReviewSubmitting}>
                  {isReviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
