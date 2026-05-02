import "../../styles/dashboard.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function DisputeDetail() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [collapsed,      setCollapsed]      = useState(localStorage.getItem("sidebar") === "true");
  const [dispute,        setDispute]        = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [successMsg,     setSuccessMsg]     = useState("");
  const [confirmResolve, setConfirmResolve] = useState(false);
  const [adminResponse,  setAdminResponse]  = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // ── Fetch Dispute ──────────────────────────────────────
  useEffect(() => {
    const fetchDispute = async () => {
      try {
        const res  = await fetch(`/api/admin/disputes/${id}`, { headers });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setDispute(data);
        setAdminResponse(data.adminResponse || "");
      } catch (err) {
        setError(err.message || "Failed to load dispute");
      } finally {
        setLoading(false);
      }
    };
    fetchDispute();
  }, [id]);

  // ── Resolve ────────────────────────────────────────────
  const handleResolve = async () => {
    try {
      const res  = await fetch(`/api/admin/disputes/${id}/resolve`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ adminResponse }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setDispute((prev) => ({ ...prev, status: "Resolved", adminResponse }));
      setConfirmResolve(false);
      showSuccess("Dispute resolved successfully.");
    } catch (err) {
      setError(err.message || "Failed to resolve dispute");
    }
  };

  const priorityClass = (priority) => {
    switch (priority) {
      case "High":   return "priority-high";
      case "Medium": return "priority-medium";
      case "Low":    return "priority-low";
      default:       return "";
    }
  };

  const statusClass = (status) => {
    switch (status) {
      case "Pending":  return "status-pending";
      case "Resolved": return "status-resolved";
      default:         return "";
    }
  };

  return (
    <div className={`dashboard-page ${collapsed ? "collapsed" : ""}`}>
      <div className="dashboard-shell">

        {/* TOP BAR */}
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>
          <div className="dashboard-topbar-actions">
            <div className="profile-actions">
              <button
                className="dashboard-primary-btn"
                onClick={() => navigate("/disputes")}
              >
                <ArrowLeft size={16} /> Back to Disputes
              </button>

              {dispute?.status === "Pending" && (
                <button
                  className="campaign-status-btn accept"
                  onClick={() => setConfirmResolve(true)}
                >
                  <CheckCircle size={15} /> Mark as Resolved
                </button>
              )}

              <button className="dashboard-logout" onClick={handleLogout}>
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* INLINE CONFIRM */}
        {confirmResolve && (
          <div className="resolve-confirm-row" style={{ margin: "0 24px 0" }}>
            <span className="resolve-confirm-label">
              Resolve dispute <strong>{dispute?.disputeId}</strong>? Add an optional response:
            </span>
            <textarea
              className="resolve-textarea"
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              placeholder="Optional admin response visible to both parties..."
              rows={2}
            />
            <div className="resolve-confirm-actions">
              <button className="confirm-yes" onClick={handleResolve}>
                Yes, Resolve
              </button>
              <button
                className="confirm-no"
                onClick={() => setConfirmResolve(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* MAIN LAYOUT */}
        <div className="admin-layout">
          <Sidebar onCollapse={setCollapsed} />

          <div className="admin-content">

            {/* HERO */}
            <div className="dashboard-hero">
              <h1>Dispute Details</h1>
              <p>Full information about this dispute</p>
            </div>

            {/* SUCCESS */}
            {successMsg && (
              <div className="settings-success">{successMsg}</div>
            )}

            {/* ERROR */}
            {error && (
              <div className="confirm-row">
                <span className="error-text">{error}</span>
              </div>
            )}

            {loading ? (
              <div className="txn-summary">
                <span className="loading-text">Loading dispute...</span>
              </div>
            ) : !dispute ? (
              <div className="dashboard-section">
                <div className="campaign-review-empty">
                  <h1 className="loading-text">Dispute Not Found</h1>
                  <button
                    className="dashboard-primary-btn"
                    onClick={() => navigate("/disputes")}
                  >
                    Back to Disputes
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* DISPUTE OVERVIEW */}
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h2>{dispute.subject}</h2>
                      <p>{dispute.disputeId}</p>
                    </div>
                    <div className="dispute-badges">
                      <span className={`dispute-badge ${statusClass(dispute.status)}`}>
                        {dispute.status}
                      </span>
                      <span className={`dispute-badge ${priorityClass(dispute.priority)}`}>
                        {dispute.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>

                {/* PARTIES */}
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h2>Parties Involved</h2>
                    </div>
                  </div>
                  <div className="profile-content-grid">

                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Filed By</span>
                      <p className="dispute-detail-value">
                        {dispute.submittedBy?.name || "—"}
                      </p>
                      <span className="campaign-card-label">
                        {dispute.submittedBy?.email || ""}
                      </span>
                      <span className={`dispute-role-pill dispute-role-pill--${dispute.submittedByRole}`}>
                        {dispute.submittedByRole}
                      </span>
                    </div>

                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Against</span>
                      <p className="dispute-detail-value">
                        {dispute.against?.name || "—"}
                      </p>
                      <span className="campaign-card-label">
                        {dispute.against?.email || ""}
                      </span>
                      <span className={`dispute-role-pill dispute-role-pill--${dispute.against?.role}`}>
                        {dispute.against?.role || "—"}
                      </span>
                    </div>

                  </div>
                </div>

                {/* DISPUTE INFO */}
                <div className="dashboard-section">
                  <div className="dashboard-section-header">
                    <div>
                      <h2>Dispute Information</h2>
                    </div>
                  </div>
                  <div className="profile-content-grid">

                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Campaign</span>
                      <p className="dispute-detail-value">
                        {dispute.campaignId?.title || "—"}
                      </p>
                    </div>

                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Contract ID</span>
                      <p className="dispute-detail-value">{dispute.contractId}</p>
                    </div>

                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Reason Category</span>
                      <p className="dispute-detail-value">{dispute.reason}</p>
                    </div>

                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Date Submitted</span>
                      <p className="dispute-detail-value">
                        {new Date(dispute.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Priority</span>
                      <p className={priorityClass(dispute.priority)}>
                        {dispute.priority}
                      </p>
                    </div>

                    <div className="campaign-review-card">
                      <span className="campaign-card-label">Status</span>
                      <p className={statusClass(dispute.status)}>
                        {dispute.status}
                      </p>
                    </div>

                    <div className="campaign-review-card dispute-full-width">
                      <span className="campaign-card-label">Description</span>
                      <p className="dispute-description">{dispute.description}</p>
                    </div>

                  </div>
                </div>

                {/* ADMIN RESPONSE */}
                {dispute.status === "Resolved" && (
                  <div className="dashboard-section">
                    <div className="dashboard-section-header">
                      <div>
                        <h2>Resolution</h2>
                        <p>
                          Resolved on{" "}
                          {dispute.resolvedAt
                            ? new Date(dispute.resolvedAt).toLocaleDateString("en-GB", {
                                day: "numeric", month: "long", year: "numeric",
                              })
                            : "—"
                          }
                          {dispute.resolvedBy?.name && ` by ${dispute.resolvedBy.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="campaign-review-card dispute-full-width">
                      <span className="campaign-card-label">Admin Response</span>
                      <p className="dispute-description">
                        {dispute.adminResponse || "No response provided."}
                      </p>
                    </div>
                  </div>
                )}

              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}