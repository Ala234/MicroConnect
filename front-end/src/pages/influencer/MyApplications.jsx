import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfluencerTopNav from '../../components/influencer/InfluencerTopNav';
import { getMyApplications } from '../../api/applications';
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

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const profileComplete = isInfluencerProfileComplete(getProfileForUser());

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
          setApplications(result.applications || []);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [profileComplete, navigate]);

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

                return (
                  <div className="application-card-new" key={app._id}>
                    <div className="application-card-header">
                      <div>
                        <h3 style={{ color: 'white', margin: '0 0 6px 0' }}>{app.campaignName}</h3>
                        <p style={{ color: '#9aa8d2', fontSize: 13, margin: 0 }}>
                          Applied on{' '}
                          {new Date(app.createdAt).toLocaleDateString('en-US', {
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
                      <button
                        className="btn btn-secondary"
                        onClick={() => navigate(`/influencer/campaign/${app.campaignId}`)}
                      >
                        View Campaign
                      </button>

                      {app.status === 'accepted' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => navigate('/influencer/contracts')}
                        >
                          View Contract
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}