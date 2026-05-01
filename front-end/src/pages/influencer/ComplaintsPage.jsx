import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getInfluencerStorageKey,
  getProfileForUser,
  isInfluencerProfileComplete,
} from '../../data/influencerAccounts';
import {
  formatDisputeDate,
  generateDisputeId,
  getDisputesForInfluencer,
  saveDispute,
} from '../../data/disputes';
import '../../styles/influencer.css';

const emptyDispute = () => ({
  disputeId: '',
  campaignName: '',
  brandName: '',
  contractId: '',
  subject: '',
  reason: '',
  priority: 'Medium',
  description: '',
  dateSubmitted: '',
  status: 'Pending'
});

const statusToneMap = {
  Pending: 'pending',
  Resolved: 'resolved'
};

const priorityOptions = ['Low', 'Medium', 'High'];

export default function ComplaintsPage() {
  const navigate = useNavigate();
  const influencerKey = getInfluencerStorageKey();
  const currentProfile = getProfileForUser();
  const influencerEmail = currentProfile.email || influencerKey;
  const profileComplete = isInfluencerProfileComplete(getProfileForUser());
  const initialDisputes = useMemo(() => getDisputesForInfluencer(influencerEmail), [influencerEmail]);
  const [disputes, setDisputes] = useState(initialDisputes);
  const [formData, setFormData] = useState(() => ({
    ...emptyDispute(),
    dateSubmitted: new Date().toISOString().slice(0, 10)
  }));

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
    }
  }, [profileComplete, navigate]);

  if (!profileComplete) {
    return null;
  }

  const handleInputChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      ...emptyDispute(),
      dateSubmitted: new Date().toISOString().slice(0, 10)
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const savedDispute = saveDispute({
      ...formData,
      disputeId: generateDisputeId(),
      submittedByRole: 'influencer',
      submittedByName: currentProfile.name || 'Influencer',
      submittedByEmail: influencerEmail,
      contractId: formData.contractId.trim() || 'Not provided',
      priority: formData.priority,
      status: 'Pending',
      adminResponse: ''
    });

    setDisputes([
      savedDispute,
      ...disputes.filter((dispute) => dispute.disputeId !== savedDispute.disputeId)
    ]);
    resetForm();
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
            <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
          </div>
        </header>

        <section className="campaigns-section padded-top">
          <div className="campaigns-header">
            <div>
              <p className="section-label">Disputes</p>
              <h2>Submit and track campaign disputes</h2>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/influencer/profile')}>
              Back to Profile
            </button>
          </div>

          <div className="complaints-layout">
            <section className="content-card complaints-form-card">
              <div className="complaints-section-header">
                <p className="section-label">Raise a Dispute</p>
                <h3>Report a campaign or contract issue</h3>
              </div>

              <form className="complaints-form" onSubmit={handleSubmit}>
                <div className="complaints-form-grid">
                  <div className="form-group">
                    <label htmlFor="disputeId">Dispute ID</label>
                    <input id="disputeId" type="text" value={formData.disputeId} placeholder="Assigned after submission" readOnly />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateSubmitted">Date Submitted</label>
                    <input id="dateSubmitted" type="text" value={formatDisputeDate(formData.dateSubmitted)} readOnly />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <input id="status" type="text" value={formData.status} readOnly />
                  </div>

                  <div className="form-group">
                    <label htmlFor="priority">Priority</label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(event) => handleInputChange('priority', event.target.value)}
                      required
                    >
                      {priorityOptions.map((priority) => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="campaignName">Campaign Name</label>
                    <input
                      id="campaignName"
                      type="text"
                      value={formData.campaignName}
                      onChange={(event) => handleInputChange('campaignName', event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="brandName">Brand Name</label>
                    <input
                      id="brandName"
                      type="text"
                      value={formData.brandName}
                      onChange={(event) => handleInputChange('brandName', event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contractIdValue">Contract ID (if available)</label>
                    <input
                      id="contractIdValue"
                      type="text"
                      value={formData.contractId}
                      onChange={(event) => handleInputChange('contractId', event.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(event) => handleInputChange('subject', event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="reason">Reason</label>
                    <select
                      id="reason"
                      value={formData.reason}
                      onChange={(event) => handleInputChange('reason', event.target.value)}
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="Payment issue">Payment issue</option>
                      <option value="Contract issue">Contract issue</option>
                      <option value="Deliverable dispute">Deliverable dispute</option>
                      <option value="Communication issue">Communication issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows="6"
                    value={formData.description}
                    onChange={(event) => handleInputChange('description', event.target.value)}
                    required
                  />
                </div>

                <div className="complaints-form-actions">
                  <button type="button" className="btn btn-outline" onClick={resetForm}>
                    Reset
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Dispute
                  </button>
                </div>
              </form>
            </section>

            <section className="content-card complaints-history-card">
              <div className="complaints-section-header">
                <p className="section-label">Dispute History</p>
                <h3>Track dispute IDs and status updates</h3>
              </div>

              <div className="complaints-history-list">
                {disputes.length > 0 ? disputes.map((dispute) => (
                  <article className="complaint-history-item" key={dispute.disputeId}>
                    <div className="complaint-history-header">
                      <div>
                        <h4>{dispute.disputeId}</h4>
                        <p>{dispute.campaignName} | {dispute.brandName}</p>
                      </div>
                      <span className={`status-badge status-${statusToneMap[dispute.status] || 'pending'}`}>
                        {dispute.status}
                      </span>
                    </div>

                    <div className="complaint-history-meta">
                      <div className="history-detail-stat">
                        <span className="meta-label">Contract Reference</span>
                        <span className="meta-value">{dispute.contractId}</span>
                      </div>
                      <div className="history-detail-stat">
                        <span className="meta-label">Date Submitted</span>
                        <span className="meta-value">{formatDisputeDate(dispute.dateSubmitted)}</span>
                      </div>
                      <div className="history-detail-stat">
                        <span className="meta-label">Priority</span>
                        <span className="meta-value">{dispute.priority}</span>
                      </div>
                      <div className="history-detail-stat">
                        <span className="meta-label">Subject</span>
                        <span className="meta-value">{dispute.subject}</span>
                      </div>
                    </div>

                    <div className="complaint-history-body">
                      <div>
                        <h5>Reason</h5>
                        <p>{dispute.reason}</p>
                      </div>
                      <div>
                        <h5>Description</h5>
                        <p>{dispute.description}</p>
                      </div>
                      <div>
                        <h5>Admin Response / Resolution</h5>
                        <p>{dispute.adminResponse || 'No admin response yet.'}</p>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="no-results">
                    <h3>No disputes submitted yet</h3>
                    <p>
                      If you ever face a payment, contract, deliverable, or communication issue, you can raise a dispute here and track the admin response.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
