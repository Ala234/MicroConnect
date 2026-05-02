import "../../styles/dashboard.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiFileText, FiLogOut, FiRefreshCcw } from "react-icons/fi";
import { getMyContracts } from "../../api/contracts";
import { createInfluencerReview, getReviewsForContract } from "../../api/reviews";

const getContractKey = (contract) => contract.contractId || contract._id || contract.id;

const getRecordId = (record) => {
  if (!record) return "";
  if (typeof record === "object") return record._id || record.id || "";
  return record;
};

const statusClass = (status) => {
  switch (status) {
    case "Active":
    case "Completed":
      return "status-accepted";
    case "Rejected":
      return "status-deleted";
    case "Pending":
      return "status-pending";
    default:
      return "status-pending";
  }
};

const canReviewInfluencer = (contract) =>
  Boolean(
    getContractKey(contract) &&
    (getRecordId(contract.influencerId || contract.influencer) ||
      contract.influencerEmail ||
      contract.influencerName)
  );

const formatDate = (date) => {
  if (!date) return "Not set";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Not set";
  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function BrandContracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewsByContract, setReviewsByContract] = useState({});
  const [reviewModalContract, setReviewModalContract] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewNotice, setReviewNotice] = useState("");
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

  const contractStats = useMemo(() => ({
    total: contracts.length,
    pending: contracts.filter((contract) => contract.status === "Pending").length,
    active: contracts.filter((contract) => contract.status === "Active").length,
    rejected: contracts.filter((contract) => contract.status === "Rejected").length,
  }), [contracts]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;

    if (!user || user.role !== "brand") {
      navigate("/login");
    }
  }, [navigate]);

  const loadReviewMap = useCallback(async (nextContracts) => {
    const reviewEntries = await Promise.all(
      (nextContracts || [])
        .filter(canReviewInfluencer)
        .map(async (contract) => {
          const contractKey = getContractKey(contract);
          const result = await getReviewsForContract(contractKey);
          return [contractKey, result.success ? result.review : null];
        })
    );

    setReviewsByContract(
      reviewEntries.reduce((reviews, [contractKey, review]) => {
        if (review) {
          reviews[contractKey] = review;
        }
        return reviews;
      }, {})
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadContracts = async () => {
      const result = await getMyContracts();
      if (!isMounted) return;

      if (result.success) {
        const nextContracts = result.contracts || [];
        setContracts(nextContracts);
        await loadReviewMap(nextContracts);
        setErrorMessage("");
      } else {
        setErrorMessage(result.message || "Contracts could not be loaded");
      }
      setLoading(false);
      setRefreshing(false);
    };

    loadContracts();

    const handleFocus = () => {
      loadContracts();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadReviewMap]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const result = await getMyContracts();
    if (result.success) {
      const nextContracts = result.contracts || [];
      setContracts(nextContracts);
      await loadReviewMap(nextContracts);
      setErrorMessage("");
    } else {
      setErrorMessage(result.message || "Contracts could not be loaded");
    }
    setRefreshing(false);
    setLoading(false);
  };

  const openContract = (contract) => {
    const params = new URLSearchParams({
      contractId: getContractKey(contract),
      state: contract.status || "Pending",
    });
    const campaignId = getRecordId(contract.campaignId || contract.campaign);
    const applicationId = getRecordId(contract.application);
    const influencerId = getRecordId(contract.influencerId || contract.influencer);

    if (campaignId) params.set("campaignId", campaignId);
    if (applicationId) params.set("applicationId", applicationId);
    if (influencerId) params.set("influencer", influencerId);

    navigate(`/contracts?${params.toString()}`);
  };

  const openReviewModal = (contract) => {
    setReviewModalContract(contract);
    setReviewRating(0);
    setReviewText("");
    setReviewError("");
    setReviewNotice("");
  };

  const closeReviewModal = () => {
    if (isReviewSubmitting) return;

    setReviewModalContract(null);
    setReviewRating(0);
    setReviewText("");
    setReviewError("");
  };

  const submitInfluencerReview = async () => {
    if (!reviewRating) {
      setReviewError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (!reviewText.trim()) {
      setReviewError("Please write your influencer review before submitting.");
      return;
    }

    const contractKey = getContractKey(reviewModalContract);
    setIsReviewSubmitting(true);
    setReviewError("");

    try {
      const result = await createInfluencerReview({
        influencerId: getRecordId(reviewModalContract.influencerId || reviewModalContract.influencer),
        campaignId: getRecordId(reviewModalContract.campaignId || reviewModalContract.campaign),
        applicationId: getRecordId(reviewModalContract.application),
        contractId: contractKey,
        rating: reviewRating,
        review: reviewText.trim(),
      });

      if (result.success) {
        setReviewsByContract((currentReviews) => ({
          ...currentReviews,
          [contractKey]: result.review,
        }));
        setReviewNotice("Influencer review submitted.");
        setReviewModalContract(null);
        setReviewRating(0);
        setReviewText("");
      } else {
        if (result.review) {
          setReviewsByContract((currentReviews) => ({
            ...currentReviews,
            [contractKey]: result.review,
          }));
        }
        setReviewError(result.message || "Influencer review could not be submitted.");
      }
    } catch (err) {
      setReviewError(err.message || "Influencer review could not be submitted.");
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <div>
              <p className="brand-name">MicroConnect</p>
              <p className="brand-subtitle">Brand Portal</p>
            </div>
          </div>

          <nav className="influencer-top-nav">
            <button className="influencer-nav-link" onClick={() => navigate("/brand")}>
              Campaigns
            </button>
            <button className="influencer-nav-link" onClick={() => navigate("/brand/profile")}>
              Profile
            </button>
            <button className="influencer-nav-link active" onClick={() => navigate("/brand/contracts")}>
              Contracts
            </button>
          </nav>

          <button className="dashboard-logout ghost" onClick={handleLogout}>
            <FiLogOut />
            <span>Log out</span>
          </button>
        </div>

        <div className="dashboard-body">
          <div className="dashboard-hero">
            <h1>Contracts</h1>
            <p>Track contract status directly from MongoDB.</p>
          </div>

          {reviewNotice ? (
            <div className="contract-banner success" style={{ margin: "0 0 18px auto" }}>
              <strong>Feedback & Reviews</strong>
              <span>{reviewNotice}</span>
            </div>
          ) : null}

          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <h3>{contractStats.total}</h3>
              <p>Total Contracts</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>{contractStats.pending}</h3>
              <p>Pending</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>{contractStats.active}</h3>
              <p>Active</p>
            </div>
            <div className="dashboard-stat-card">
              <h3>{contractStats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Brand Contracts</h2>
                <p>Statuses update from the backend contract records.</p>
              </div>
              <button className="dashboard-primary-btn" onClick={handleRefresh} disabled={refreshing}>
                <FiRefreshCcw />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            </div>

            {errorMessage ? (
              <div className="campaign-filter-empty">{errorMessage}</div>
            ) : loading ? (
              <div className="campaign-filter-empty">Loading contracts...</div>
            ) : contracts.length === 0 ? (
              <div className="campaign-filter-empty">No contracts have been generated yet.</div>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Influencer</th>
                      <th>Campaign</th>
                      <th>Value</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Transaction</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contracts.map((contract) => (
                      <tr key={getContractKey(contract)}>
                        <td className="txn-id">{contract.contractId || "Not set"}</td>
                        <td>{contract.influencerName || "Influencer"}</td>
                        <td>{contract.campaignName || "Campaign"}</td>
                        <td className="txn-amount">{contract.value || "Not set"}</td>
                        <td className="txn-date">{formatDate(contract.startDate)}</td>
                        <td className="txn-date">{formatDate(contract.endDate)}</td>
                        <td className={contract.transactionStatus === "Completed" ? "status-resolved" : "status-pending"}>
                          {contract.transactionStatus || "Pending"}
                        </td>
                        <td className={statusClass(contract.status)}>
                          {contract.status || "Pending"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <button className="campaign-view-btn" onClick={() => openContract(contract)}>
                              <FiFileText />
                              <span>View</span>
                            </button>
                            {canReviewInfluencer(contract) && (
                              reviewsByContract[getContractKey(contract)] ? (
                                <button className="campaign-view-btn" disabled>
                                  Influencer reviewed
                                </button>
                              ) : (
                                <button className="campaign-view-btn" onClick={() => openReviewModal(contract)}>
                                  Review Influencer
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {reviewModalContract && (
          <div
            className="campaign-modal-overlay"
            onClick={closeReviewModal}
            style={{ position: "fixed", padding: 20 }}
          >
            <div
              className="campaign-confirm-modal"
              onClick={(event) => event.stopPropagation()}
              style={{ textAlign: "left", width: "min(560px, 100%)" }}
            >
              <p className="campaign-card-label">Feedback & Reviews</p>
              <h3>Review {reviewModalContract.influencerName || "Influencer"}</h3>
              <p>
                Share feedback about this collaboration for {reviewModalContract.campaignName || "the campaign"}.
              </p>

              <div style={{ marginTop: 18 }}>
                <span className="campaign-card-label">Rating</span>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {[1, 2, 3, 4, 5].map((ratingValue) => (
                    <button
                      key={ratingValue}
                      type="button"
                      onClick={() => setReviewRating(ratingValue)}
                      disabled={isReviewSubmitting}
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 10,
                        border: reviewRating >= ratingValue ? "1px solid #fbbf24" : "1px solid rgba(255,255,255,0.18)",
                        background: reviewRating >= ratingValue ? "rgba(251,191,36,0.16)" : "rgba(255,255,255,0.05)",
                        color: reviewRating >= ratingValue ? "#fbbf24" : "#97adde",
                        fontSize: 24,
                        cursor: isReviewSubmitting ? "not-allowed" : "pointer",
                      }}
                    >
                      &#9733;
                    </button>
                  ))}
                </div>
              </div>

              <label className="campaign-card-label" htmlFor="influencer-review-text" style={{ display: "block", marginTop: 18 }}>
                Written feedback
              </label>
              <textarea
                id="influencer-review-text"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                rows="6"
                disabled={isReviewSubmitting}
                placeholder="Describe communication, content quality, delivery, and reliability."
                style={{
                  width: "100%",
                  marginTop: 8,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  borderRadius: 12,
                  color: "white",
                  fontFamily: "inherit",
                  resize: "vertical",
                }}
              />

              {reviewError ? (
                <div className="contract-banner danger" style={{ maxWidth: "100%", margin: "16px 0 0" }}>
                  <strong>Review could not be submitted</strong>
                  <span>{reviewError}</span>
                </div>
              ) : null}

              <div className="campaign-confirm-actions" style={{ marginTop: 22 }}>
                <button className="campaign-confirm-btn cancel" onClick={closeReviewModal} disabled={isReviewSubmitting}>
                  Cancel
                </button>
                <button className="campaign-confirm-btn delete" onClick={submitInfluencerReview} disabled={isReviewSubmitting}>
                  {isReviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
