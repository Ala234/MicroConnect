import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfluencerTopNav from '../../components/influencer/InfluencerTopNav';
import {
  getCurrentUser,
  getProfileForUser,
  isInfluencerProfileComplete,
} from '../../data/influencerAccounts';
import {
  getContractsForInfluencer,
  updateContractStatus,
} from '../../data/contracts';
import '../../styles/influencer.css';

const statusToneMap = {
  Completed: 'accepted',
  Active: 'accepted',
  Pending: 'pending',
  Rejected: 'rejected',
};

const emptyText = 'Not set';

const formatDate = (date) => {
  if (!date) {
    return emptyText;
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function ContractsPage() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const currentProfile = useMemo(() => getProfileForUser(currentUser), [currentUser]);
  const profileComplete = isInfluencerProfileComplete(currentProfile);
  const influencerEmail = currentProfile.email || currentUser?.email || '';
  const [contracts, setContracts] = useState(() => getContractsForInfluencer(influencerEmail));
  const [selectedContractId, setSelectedContractId] = useState('');

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
    }
  }, [profileComplete, navigate]);

  useEffect(() => {
    setContracts(getContractsForInfluencer(influencerEmail));
  }, [influencerEmail]);

  if (!profileComplete) {
    return null;
  }

  const selectedContract =
    contracts.find((contract) => contract.contractId === selectedContractId) || null;

  const refreshContracts = () => {
    setContracts(getContractsForInfluencer(influencerEmail));
  };

  const handleContractDecision = (contractId, status) => {
    const updatedContract = updateContractStatus(contractId, status);
    if (updatedContract) {
      setSelectedContractId(updatedContract.contractId);
      refreshContracts();
    }
  };

  const renderStatusBadge = (status) => (
    <span className={`status-badge status-${statusToneMap[status] || 'pending'}`}>
      {status}
    </span>
  );

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

          <InfluencerTopNav active="contracts" />

          <div className="topbar-actions">
            <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
          </div>
        </header>

        <section className="campaigns-section padded-top">
          <div className="campaigns-header">
            <div>
              <p className="section-label">Contracts</p>
              <h2>Review contracts sent by brands</h2>
            </div>
          </div>

          {contracts.length === 0 ? (
            <div className="no-results">
              <h3>No contracts yet</h3>
              <p>When a brand accepts your proposal and sends a contract, it will appear here.</p>
            </div>
          ) : (
            <div className="applications-list">
              {contracts.map((contract) => (
                <article className="application-card" key={contract.contractId}>
                  <div className="application-body">
                    <div className="application-header">
                      <div className="application-heading">
                        <h3>{contract.campaignName}</h3>
                        <p className="application-subtitle">{contract.brandName} | {contract.contractId}</p>
                      </div>
                      <div className="application-status">
                        {renderStatusBadge(contract.status)}
                      </div>
                    </div>

                    <div className="application-content">
                      <div className="application-stat-grid">
                        <div className="application-stat-card">
                          <span className="application-stat-label">Contract ID</span>
                          <span className="application-stat-value">{contract.contractId}</span>
                        </div>
                        <div className="application-stat-card">
                          <span className="application-stat-label">Value</span>
                          <span className="application-stat-value">{contract.value || emptyText}</span>
                        </div>
                        <div className="application-stat-card">
                          <span className="application-stat-label">Start</span>
                          <span className="application-stat-value">{formatDate(contract.startDate)}</span>
                        </div>
                        <div className="application-stat-card">
                          <span className="application-stat-label">End</span>
                          <span className="application-stat-value">{formatDate(contract.endDate)}</span>
                        </div>
                      </div>

                      <div className="application-meta">
                        <span>Brand: {contract.brandName}</span>
                        <span>Campaign: {contract.campaignName}</span>
                        <span>Transaction Status: {contract.transactionStatus}</span>
                      </div>
                    </div>

                    <div className="application-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => setSelectedContractId(contract.contractId)}
                      >
                        View Contract
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {selectedContract && (
            <div className="content-card campaign-overview-card">
              <div className="campaign-overview-header">
                <div>
                  <p className="section-label">Contract Details</p>
                  <h3>{selectedContract.contractId}</h3>
                  <p className="campaign-overview-subtitle">
                    {selectedContract.brandName} | {selectedContract.campaignName}
                  </p>
                </div>
                {renderStatusBadge(selectedContract.status)}
              </div>

              <div className="campaign-meta">
                <div className="meta-item">
                  <span className="meta-label">Brand</span>
                  <span className="meta-value">{selectedContract.brandName}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Influencer</span>
                  <span className="meta-value">{selectedContract.influencerName}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Campaign</span>
                  <span className="meta-value">{selectedContract.campaignName}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Value</span>
                  <span className="meta-value">{selectedContract.value || emptyText}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Start</span>
                  <span className="meta-value">{formatDate(selectedContract.startDate)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">End</span>
                  <span className="meta-value">{formatDate(selectedContract.endDate)}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Status</span>
                  <span className="meta-value">{selectedContract.status}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Transaction Status</span>
                  <span className="meta-value">{selectedContract.transactionStatus}</span>
                </div>
              </div>

              <div className="application-message">
                <h4>Details / Deliverables</h4>
                <p>{selectedContract.details}</p>
                <p>{selectedContract.deliverables || emptyText}</p>
              </div>

              {selectedContract.status === 'Pending' ? (
                <div className="campaign-action-buttons">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleContractDecision(selectedContract.contractId, 'Active')}
                  >
                    Accept Contract
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleContractDecision(selectedContract.contractId, 'Rejected')}
                  >
                    Reject Contract
                  </button>
                </div>
              ) : (
                <p className="text-muted">Current contract status: {selectedContract.status}</p>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
