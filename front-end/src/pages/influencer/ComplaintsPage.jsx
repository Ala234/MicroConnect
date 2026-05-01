import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getInfluencerStorageKey,
  getProfileForUser,
  isInfluencerProfileComplete,
} from '../../data/influencerAccounts';
import '../../styles/influencer.css';

const STORAGE_KEY = 'influencerComplaints';
const SARAH_STORAGE_KEY = 'sarah.johnson@email.com';

const complaintsByInfluencer = {
  [SARAH_STORAGE_KEY]: [
    {
      complaintId: 'CMP-1001',
      campaignName: 'Spring Collection',
      brandName: 'Fashion Forward',
      contractId: 'CTR-2041',
      subject: 'Delayed payment release',
      reason: 'Payment issue',
      description: 'The campaign was completed and approved, but the agreed payment has not been released on time.',
      dateSubmitted: '2026-03-22',
      status: 'In Review',
      adminResponse: 'Finance verification is in progress. We will update you within 3 business days.'
    },
    {
      complaintId: 'CMP-1002',
      campaignName: 'Winter Collection',
      brandName: 'North Thread',
      contractId: 'CTR-1985',
      subject: 'Deliverables changed after approval',
      reason: 'Contract issue',
      description: 'Additional deliverables were requested after the contract terms were already approved.',
      dateSubmitted: '2026-02-10',
      status: 'Resolved',
      adminResponse: 'The signed contract terms were confirmed and the brand was instructed to follow the original scope.'
    }
  ]
};

const removedComplaintIds = new Set(['CMP-1003']);

const emptyComplaint = () => ({
  complaintId: '',
  campaignName: '',
  brandName: '',
  contractId: '',
  subject: '',
  reason: '',
  description: '',
  dateSubmitted: '',
  status: 'Pending'
});

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

const generateComplaintId = (complaints) => {
  let nextNumber = complaints.reduce((max, complaint) => {
    const numericId = Number(complaint.complaintId.replace(/\D/g, ''));
    return Number.isNaN(numericId) ? max : Math.max(max, numericId);
  }, 1000) + 1;

  while (removedComplaintIds.has(`CMP-${nextNumber}`)) {
    nextNumber += 1;
  }

  return `CMP-${nextNumber}`;
};

const sanitizeComplaints = (complaints) =>
  complaints.filter((complaint) => !removedComplaintIds.has(complaint.complaintId));

const getScopedStorageKey = (influencerKey) => `${STORAGE_KEY}:${influencerKey}`;

const readJsonArray = (storageKey) => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawComplaints = localStorage.getItem(storageKey);
  if (!rawComplaints) {
    return null;
  }

  try {
    const parsedComplaints = JSON.parse(rawComplaints);
    return Array.isArray(parsedComplaints) ? parsedComplaints : null;
  } catch {
    return null;
  }
};

const readStoredComplaints = (influencerKey) => {
  const scopedComplaints = readJsonArray(getScopedStorageKey(influencerKey));
  if (scopedComplaints) {
    return sanitizeComplaints(scopedComplaints);
  }

  if (influencerKey === SARAH_STORAGE_KEY) {
    const legacyComplaints = readJsonArray(STORAGE_KEY);
    return sanitizeComplaints(legacyComplaints || complaintsByInfluencer[SARAH_STORAGE_KEY]);
  }

  return [];
};

const writeStoredComplaints = (influencerKey, complaints) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(getScopedStorageKey(influencerKey), JSON.stringify(complaints));
};

const statusToneMap = {
  Pending: 'pending',
  'In Review': 'review',
  Resolved: 'resolved',
  Closed: 'closed'
};

export default function ComplaintsPage() {
  const navigate = useNavigate();
  const influencerKey = getInfluencerStorageKey();
  const profileComplete = isInfluencerProfileComplete(getProfileForUser());
  const initialComplaints = useMemo(() => readStoredComplaints(influencerKey), [influencerKey]);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [formData, setFormData] = useState(() => ({
    ...emptyComplaint(),
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

  const resetForm = (nextComplaints) => {
    setFormData({
      ...emptyComplaint(),
      dateSubmitted: new Date().toISOString().slice(0, 10)
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextComplaints = [
      {
        ...formData,
        complaintId: generateComplaintId(complaints),
        contractId: formData.contractId.trim() || 'Not provided',
        adminResponse: ''
      },
      ...complaints
    ];

    setComplaints(nextComplaints);
    writeStoredComplaints(influencerKey, nextComplaints);
    resetForm(nextComplaints);
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
              <p className="section-label">Complaints</p>
              <h2>Submit and track campaign complaints</h2>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/influencer/profile')}>
              Back to Profile
            </button>
          </div>

          <div className="complaints-layout">
            <section className="content-card complaints-form-card">
              <div className="complaints-section-header">
                <p className="section-label">Submit a Complaint</p>
                <h3>Report a campaign or contract issue</h3>
              </div>

              <form className="complaints-form" onSubmit={handleSubmit}>
                <div className="complaints-form-grid">
                  <div className="form-group">
                    <label htmlFor="complaintId">Complaint ID</label>
                    <input id="complaintId" type="text" value={formData.complaintId} placeholder="Assigned after submission" readOnly />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dateSubmitted">Date Submitted</label>
                    <input id="dateSubmitted" type="text" value={formatDate(formData.dateSubmitted)} readOnly />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <input id="status" type="text" value={formData.status} readOnly />
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
                  <button type="button" className="btn btn-outline" onClick={() => resetForm(complaints)}>
                    Reset
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Submit Complaint
                  </button>
                </div>
              </form>
            </section>

            <section className="content-card complaints-history-card">
              <div className="complaints-section-header">
                <p className="section-label">Complaint History</p>
                <h3>Track complaint IDs and status updates</h3>
              </div>

              <div className="complaints-history-list">
                {complaints.length > 0 ? complaints.map((complaint) => (
                  <article className="complaint-history-item" key={complaint.complaintId}>
                    <div className="complaint-history-header">
                      <div>
                        <h4>{complaint.complaintId}</h4>
                        <p>{complaint.campaignName} | {complaint.brandName}</p>
                      </div>
                      <span className={`status-badge status-${statusToneMap[complaint.status] || 'pending'}`}>
                        {complaint.status}
                      </span>
                    </div>

                    <div className="complaint-history-meta">
                      <div className="history-detail-stat">
                        <span className="meta-label">Contract Reference</span>
                        <span className="meta-value">{complaint.contractId}</span>
                      </div>
                      <div className="history-detail-stat">
                        <span className="meta-label">Date Submitted</span>
                        <span className="meta-value">{formatDate(complaint.dateSubmitted)}</span>
                      </div>
                      <div className="history-detail-stat">
                        <span className="meta-label">Subject</span>
                        <span className="meta-value">{complaint.subject}</span>
                      </div>
                    </div>

                    <div className="complaint-history-body">
                      <div>
                        <h5>Reason</h5>
                        <p>{complaint.reason}</p>
                      </div>
                      <div>
                        <h5>Description</h5>
                        <p>{complaint.description}</p>
                      </div>
                      <div>
                        <h5>Admin Response / Resolution</h5>
                        <p>{complaint.adminResponse || 'No admin response yet.'}</p>
                      </div>
                    </div>
                  </article>
                )) : (
                  <div className="no-results">
                    <h3>No complaints submitted yet</h3>
                    <p>
                      If you ever face a payment, contract, deliverable, or communication issue, you can submit a complaint here and track the admin response.
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
