import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InfluencerTopNav from '../../components/influencer/InfluencerTopNav';
import {
  getCurrentUser,
  getProfileForUser,
  isInfluencerProfileComplete,
} from '../../data/influencerAccounts';
import {
  getMyContracts,
  updateContractStatus,
} from '../../api/contracts';
import '../../styles/influencer.css';

const statusToneMap = {
  Completed: 'accepted',
  Active: 'accepted',
  Pending: 'pending',
  Rejected: 'rejected',
};

const emptyText = 'Not set';

const getContractKey = (contract) => contract.contractId || contract._id || contract.id;

const formatFieldValue = (value) => {
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : emptyText;
  }

  return value || emptyText;
};

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
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [decisionLoading, setDecisionLoading] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
    }
  }, [profileComplete, navigate]);

  useEffect(() => {
    if (!profileComplete) {
      return undefined;
    }

    let isMounted = true;

    const loadContracts = async () => {
      const result = await getMyContracts();
      if (!isMounted) {
        return;
      }

      if (result.success) {
        setContracts(result.contracts || []);
        setErrorMessage('');
      } else {
        setErrorMessage(result.message || 'Contracts could not be loaded');
      }
      setIsLoading(false);
    };

    loadContracts();

    return () => {
      isMounted = false;
    };
  }, [profileComplete]);

  if (!profileComplete) {
    return null;
  }

  const selectedContract =
    contracts.find((contract) =>
      getContractKey(contract) === selectedContractId
    ) || null;

  const handleContractDecision = async (contractId, status) => {
    setDecisionLoading(`${contractId}:${status}`);
    setErrorMessage('');
    const result = await updateContractStatus(contractId, status);
    if (result.success && result.contract) {
      const updatedContract = result.contract;
      const updatedKey = getContractKey(updatedContract);
      setContracts((currentContracts) =>
        currentContracts.map((contract) =>
          getContractKey(contract) === contractId || getContractKey(contract) === updatedKey
            ? { ...contract, ...updatedContract }
            : contract
        )
      );
      setSelectedContractId(updatedKey);
    } else {
      setErrorMessage(result.message || 'Contract status could not be updated');
    }
    setDecisionLoading('');
  };

  const renderContractField = (label, value) => (
    <div className="contract-field">
      <span className="contract-field-label">{label}</span>
      <span className="contract-field-value">{formatFieldValue(value)}</span>
    </div>
  );

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

          {isLoading ? (
            <div className="content-card">
              <h3>Loading contracts...</h3>
            </div>
          ) : errorMessage ? (
            <div className="no-results">
              <h3>Contracts could not be loaded</h3>
              <p>{errorMessage}</p>
            </div>
          ) : contracts.length === 0 ? (
            <div className="no-results">
              <h3>No contracts yet</h3>
              <p>When a brand accepts your proposal and sends a contract, it will appear here.</p>
            </div>
          ) : (
            <div className="contracts-list">
              {contracts.map((contract) => (
                <article className="contract-card" key={getContractKey(contract)}>
                  <div className="contract-card-header">
                    <div className="contract-card-title">
                      <p className="section-label">Contract</p>
                      <h3>{contract.campaignName || emptyText}</h3>
                      <p>{contract.brandName || emptyText}</p>
                    </div>
                    <div className="contract-card-status">
                      {renderStatusBadge(contract.status)}
                    </div>
                  </div>

                  <div className="contract-card-grid">
                    {renderContractField('Contract ID', contract.contractId)}
                    {renderContractField('Brand', contract.brandName)}
                    {renderContractField('Campaign', contract.campaignName)}
                    {renderContractField('Value', contract.value)}
                    {renderContractField('Start', formatDate(contract.startDate))}
                    {renderContractField('End', formatDate(contract.endDate))}
                    {renderContractField('Status', contract.status)}
                    {renderContractField('Transaction Status', contract.transactionStatus)}
                  </div>

                  <div className="contract-card-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedContractId(getContractKey(contract))}
                    >
                      View Contract
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {selectedContract && (
            <section className="contract-detail-card">
              <div className="contract-detail-header">
                <div>
                  <p className="section-label">Contract Details</p>
                  <h3>{formatFieldValue(selectedContract.contractId)}</h3>
                  <p>{formatFieldValue(selectedContract.brandName)} | {formatFieldValue(selectedContract.campaignName)}</p>
                </div>
                {renderStatusBadge(selectedContract.status)}
              </div>

              <div className="contract-detail-grid">
                {renderContractField('ID', selectedContract.contractId)}
                {renderContractField('Brand', selectedContract.brandName)}
                {renderContractField('Influencer', selectedContract.influencerName)}
                {renderContractField('Campaign', selectedContract.campaignName)}
                {renderContractField('Value', selectedContract.value)}
                {renderContractField('Start', formatDate(selectedContract.startDate))}
                {renderContractField('End', formatDate(selectedContract.endDate))}
                {renderContractField('Status', selectedContract.status)}
                {renderContractField('Transaction Status', selectedContract.transactionStatus)}
              </div>

              <div className="contract-detail-section">
                <h4>Details</h4>
                <p>{selectedContract.details || emptyText}</p>
              </div>

              <div className="contract-detail-section">
                <h4>Deliverables</h4>
                {Array.isArray(selectedContract.deliverables) && selectedContract.deliverables.length > 0 ? (
                  <ul className="contract-detail-list">
                    {selectedContract.deliverables.map((deliverable, index) => (
                      <li key={`${deliverable}-${index}`}>{deliverable}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{emptyText}</p>
                )}
              </div>

              {selectedContract.status === 'Pending' ? (
                <div className="contract-decision-actions">
                  <button
                    className="btn btn-primary"
                    onClick={() => handleContractDecision(getContractKey(selectedContract), 'Active')}
                    disabled={Boolean(decisionLoading)}
                  >
                    {decisionLoading === `${getContractKey(selectedContract)}:Active` ? 'Accepting...' : 'Accept Contract'}
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => handleContractDecision(getContractKey(selectedContract), 'Rejected')}
                    disabled={Boolean(decisionLoading)}
                  >
                    {decisionLoading === `${getContractKey(selectedContract)}:Rejected` ? 'Rejecting...' : 'Reject Contract'}
                  </button>
                </div>
              ) : (
                <p className="contract-current-status">Current contract status: {selectedContract.status}</p>
              )}
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
