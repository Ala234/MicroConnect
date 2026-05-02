import "../../styles/dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiCalendar,
  FiCheck,
  FiDollarSign,
  FiEdit2,
  FiFileText,
  FiFilter,
  FiLogOut,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { deleteCampaignById, fetchCampaignById } from "../../data/mockCampaigns";
import { getApplicationsForCampaign, updateApplicationStatus } from "../../api/applications";
import BrandChatModal from "./BrandChatModal";

const getNumericValue = (value) => Number.parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;

const normalizeApplicationStatus = (status) => {
  const value = String(status || "").trim().toLowerCase();
  if (value === "accepted") return "accepted";
  if (value === "rejected") return "rejected";
  return "pending";
};

const normalizeApplications = (items) =>
  (items || []).map((application) => ({
    ...application,
    status: normalizeApplicationStatus(application.status),
  }));

const getRecordId = (record) => {
  if (!record) return "";
  if (typeof record === "object") return record._id || record.id || "";
  return record;
};

const getDurationLabel = (startDate, endDate) => {
  if (!startDate || !endDate) return "Not set";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInDays = Math.round((end - start) / (1000 * 60 * 60 * 24));
  if (Number.isNaN(diffInDays) || diffInDays < 0) return "Not set";
  return `${diffInDays} days`;
};

export default function DeleteCampaign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("id");
  const [campaign, setCampaign] = useState(null);
  const [applications, setApplications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeChatApplicant, setActiveChatApplicant] = useState(null);
  const [banner, setBanner] = useState(null);
  const [campaignDeleted, setCampaignDeleted] = useState(false);
  const [status, setStatus] = useState("loading");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all"); // all, pending, accepted, rejected
  const [showFilters, setShowFilters] = useState(false);
  const [minFollowers, setMinFollowers] = useState("");
  const [minEngagement, setMinEngagement] = useState("");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const isMissingCampaignId = !campaignId;

  useEffect(() => {
    if (isMissingCampaignId) {
      return undefined;
    }

    const loadData = async () => {
      try {
        const selectedCampaign = await fetchCampaignById(campaignId);
        if (!selectedCampaign) {
          setStatus("missing");
          return;
        }
        setCampaign(selectedCampaign);

        const result = await getApplicationsForCampaign(campaignId);
        if (result.success) {
          setApplications(normalizeApplications(result.applications));
        }

        setStatus("ready");
      } catch (err) {
        console.error("Failed to load campaign data:", err);
        setStatus("missing");
      }
    };

    loadData();
  }, [campaignId, isMissingCampaignId]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const showBanner = (title, text) => setBanner({ title, text });

  const handleApplicantAction = async (application, nextStatus) => {
    if (nextStatus === "accepted") {
      const result = await updateApplicationStatus(application._id, "Accepted");
      if (!result.success) {
        showBanner("Application update failed", result.message || "Could not accept this application");
        return;
      }

      const updatedApplication = {
        ...application,
        ...(result.application || {}),
        status: normalizeApplicationStatus(result.application?.status || "accepted"),
      };
      setApplications((current) =>
        current.map((item) =>
          item._id === application._id ? updatedApplication : item
        )
      );

      const nextParams = new URLSearchParams({
        campaignId,
        influencer: getRecordId(updatedApplication.influencerId || updatedApplication.influencer),
        applicationId: updatedApplication._id,
        state: "draft",
      });
      navigate(`/contracts?${nextParams.toString()}`);
      return;
    }

    if (nextStatus === "rejected") {
      const result = await updateApplicationStatus(application._id, "Rejected");
      if (result.success) {
        const updatedApplication = {
          ...application,
          ...(result.application || {}),
          status: normalizeApplicationStatus(result.application?.status || "rejected"),
        };
        setApplications((current) =>
          current.map((item) =>
            item._id === application._id ? updatedApplication : item
          )
        );
        showBanner(
          "Application rejected!",
          `${application.influencerName} has been notified of your decision`
        );
      } else {
        showBanner("Application update failed", result.message || "Could not reject this application");
      }
    }
  };

  const handleDeleteCampaign = async () => {
    if (!campaign) return;
    try {
      await deleteCampaignById(campaign.id || campaign._id);
      setCampaignDeleted(true);
      setShowDeleteModal(false);
      showBanner(
        "Campaign deleted successfully!",
        "This campaign has been removed from the system"
      );
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const clearFilters = () => {
    setMinFollowers("");
    setMinEngagement("");
    setMinAge("");
    setMaxAge("");
  };

  if (status === "missing" || isMissingCampaignId) {
    return (
      <div className="dashboard-page campaign-review-page">
        <div className="dashboard-shell">
          <div className="dashboard-section delete-campaign-page">
            <div className="campaign-review-empty">
              <h1>Campaign Not Found</h1>
              <p>Select a campaign from the dashboard and try again.</p>
              <button className="dashboard-primary-btn" onClick={() => navigate("/brand")}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) return null;

  // Apply Filters
  const filteredApplications = applications.filter((app) => {
    // Status filter
    if (statusFilter !== "all" && app.status !== statusFilter) {
      return false;
    }

    // Followers filter
    if (minFollowers) {
      const followers = getNumericValue(app.influencerFollowers);
      const followersMultiplier = String(app.influencerFollowers || "").toLowerCase().includes("k") ? 1000 : 1;
      const actualFollowers = followers * followersMultiplier;
      const minVal = getNumericValue(minFollowers);
      if (actualFollowers < minVal) return false;
    }

    // Engagement filter
    if (minEngagement) {
      const engagement = getNumericValue(app.influencerEngagement);
      if (engagement < getNumericValue(minEngagement)) return false;
    }

    // Age filter
    if (minAge || maxAge) {
      const age = getNumericValue(app.influencerAge);
      if (age === 0) return false;
      if (minAge && age < getNumericValue(minAge)) return false;
      if (maxAge && age > getNumericValue(maxAge)) return false;
    }

    return true;
  });

  // Status counts for tabs
  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const metrics = [
    {
      icon: <FiFileText />,
      label: "Applications",
      value: applications.length,
      tone: "lavender",
    },
    {
      icon: <FiDollarSign />,
      label: "Budget",
      value: `$${campaign.budget}`,
      tone: "blue",
    },
    {
      icon: <FiCalendar />,
      label: "Duration",
      value: getDurationLabel(campaign.startDate, campaign.endDate),
      tone: "peach",
    },
    {
      icon: <FiUsers />,
      label: "Influencers",
      value: campaign.influencersCount,
      tone: "mint",
    },
  ];

  const hasActiveFilters = minFollowers || minEngagement || minAge || maxAge;

  return (
    <div className="dashboard-page campaign-review-page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <button
            className="back-btn-large"
            onClick={() => navigate(-1)}
            aria-label="Back"
            type="button"
          >
            ←
          </button>
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>
          <div className="dashboard-topbar-actions">
            <button className="dashboard-logout ghost" onClick={handleLogout}>
              <FiLogOut />
              <span>Log out</span>
            </button>
          </div>
        </div>

        <div
          className={`dashboard-section delete-campaign-page ${
            showDeleteModal || activeChatApplicant ? "dimmed" : ""
          }`}
        >
          <div className="campaign-review-head">
            <img
              className="campaign-review-thumb large"
              src={campaign.imageSrc}
              alt={campaign.name}
            />
            <div className="campaign-review-title">
              <h1>{campaign.name}</h1>
              <p>
                {campaignDeleted
                  ? "Campaign removed from active listings"
                  : campaign.description?.slice(0, 80) || "Campaign details"}
              </p>
            </div>

            {banner ? (
              <div className="campaign-success-banner large">
                <strong>{banner.title}</strong>
                <span>{banner.text}</span>
              </div>
            ) : (
              <div className="campaign-review-actions">
                <button
                  className="campaign-inline-btn edit"
                  onClick={() => navigate(`/create-campaign?id=${campaign.id || campaign._id}`)}
                  disabled={campaignDeleted}
                >
                  <FiEdit2 />
                  <span>Edit</span>
                </button>
                <button
                  className="campaign-inline-btn delete"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={campaignDeleted}
                >
                  <FiTrash2 />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>

          <div className="campaign-review-metrics">
            {metrics.map((metric) => (
              <div key={metric.label} className={`campaign-review-metric ${metric.tone}`}>
                <div className="campaign-review-metric-icon">{metric.icon}</div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>

          <div className="campaign-review-grid">
            <div className="campaign-review-card">
              <span className="campaign-card-label">Objective</span>
              <p>{campaign.objective}</p>
            </div>
            <div className="campaign-review-card">
              <span className="campaign-card-label">Content Type</span>
              <p>{campaign.contentType}</p>
            </div>
            <div className="campaign-review-card">
              <span className="campaign-card-label">Description</span>
              <p>{campaign.description}</p>
            </div>
            <div className="campaign-review-card">
              <span className="campaign-card-label">Platforms</span>
              <p>{(campaign.platforms || []).join(", ")}</p>
            </div>
            <div className="campaign-review-card full-width">
              <span className="campaign-card-label">Target Audience</span>
              <p>{campaign.targetAudience}</p>
            </div>
          </div>

          <div className="campaign-review-applications">
            <div className="campaign-review-toolbar">
              <div className="campaign-review-section-title">
                <h2>Influencers Applications</h2>
                <p>{filteredApplications.length} of {applications.length} shown</p>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="status-tabs">
              <button
                className={`status-tab ${statusFilter === "all" ? "active" : ""}`}
                onClick={() => setStatusFilter("all")}
              >
                All <span className="status-tab-badge">{statusCounts.all}</span>
              </button>
              <button
                className={`status-tab ${statusFilter === "pending" ? "active" : ""}`}
                onClick={() => setStatusFilter("pending")}
              >
                Pending <span className="status-tab-badge pending">{statusCounts.pending}</span>
              </button>
              <button
                className={`status-tab ${statusFilter === "accepted" ? "active" : ""}`}
                onClick={() => setStatusFilter("accepted")}
              >
                Accepted <span className="status-tab-badge accepted">{statusCounts.accepted}</span>
              </button>
              <button
                className={`status-tab ${statusFilter === "rejected" ? "active" : ""}`}
                onClick={() => setStatusFilter("rejected")}
              >
                Rejected <span className="status-tab-badge rejected">{statusCounts.rejected}</span>
              </button>

              <button
                className={`filter-toggle-btn ${showFilters ? "active" : ""} ${
                  hasActiveFilters ? "has-filters" : ""
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter />
                <span>Filters</span>
                {hasActiveFilters && <span className="filter-dot"></span>}
              </button>
            </div>

            {/* Custom Filters Panel */}
            {showFilters && (
              <div className="custom-filters-panel">
                <div className="custom-filter-group">
                  <label>Minimum Followers</label>
                  <input
                    type="number"
                    placeholder="e.g. 10000"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                  />
                </div>

                <div className="custom-filter-group">
                  <label>Minimum Engagement (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    step="0.1"
                    value={minEngagement}
                    onChange={(e) => setMinEngagement(e.target.value)}
                  />
                </div>

                <div className="custom-filter-group">
                  <label>Age Range</label>
                  <div className="age-range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                    />
                    <span className="age-separator">–</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <button className="clear-filters-btn" onClick={clearFilters}>
                    <FiX /> Clear all
                  </button>
                )}
              </div>
            )}

            <div className="campaign-application-list">
              {filteredApplications.length === 0 ? (
                <div className="campaign-filter-empty">
                  {applications.length === 0
                    ? "No applications yet. Influencers will appear here when they apply."
                    : "No influencers match the selected filters."}
                </div>
              ) : (
                filteredApplications.map((app) => (
                  <div className="campaign-application-card" key={app._id}>
                    <div className="campaign-application-profile">
                      {app.influencerImage ? (
                        <img src={app.influencerImage} alt={app.influencerName} />
                      ) : (
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #6d5dfc, #4d8aff)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 24,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {(app.influencerName || "I").charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3>{app.influencerName}</h3>
                        <p>{(app.influencerNiches || []).slice(0, 2).join(" & ") || "Influencer"}</p>
                        <span style={{ fontSize: 12, color: "#9aa8d2" }}>
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="campaign-application-stats">
                      <div>
                        <span>Engagement</span>
                        <strong>{app.influencerEngagement}</strong>
                      </div>
                      <div>
                        <span>Age</span>
                        <strong>{app.influencerAge || "—"}</strong>
                      </div>
                      <div>
                        <span>Followers</span>
                        <strong>{app.influencerFollowers}</strong>
                      </div>
                    </div>

                    <div className="campaign-application-actions stacked">
                      <button
                        className="campaign-view-btn"
                        onClick={() =>
                          navigate(
                            `/influencer-profile?campaignId=${campaignId}&influencer=${app.influencerId}`
                          )
                        }
                      >
                        View Profile
                      </button>

                      {app.status === "accepted" || app.status === "rejected" ? (
                        <span className={`campaign-decision-badge ${app.status}`}>
                          {app.status === "accepted" ? "Accepted" : "Rejected"}
                        </span>
                      ) : (
                        <div className="campaign-application-actions">
                          <button
                            className="campaign-status-btn accept"
                            onClick={() => handleApplicantAction(app, "accepted")}
                            disabled={campaignDeleted}
                          >
                            <FiCheck />
                            <span>Accept</span>
                          </button>
                          <button
                            className="campaign-status-btn decline"
                            onClick={() => handleApplicantAction(app, "rejected")}
                            disabled={campaignDeleted}
                          >
                            <FiX />
                            <span>Reject</span>
                          </button>
                        </div>
                      )}

                      {app.proposal && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 10,
                            background: "rgba(255,255,255,0.04)",
                            borderRadius: 8,
                            color: "#dce6ff",
                            fontSize: 12,
                            fontStyle: "italic",
                            maxWidth: 280,
                          }}
                        >
                          "{app.proposal.slice(0, 100)}{app.proposal.length > 100 ? "..." : ""}"
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {showDeleteModal ? (
            <div className="campaign-modal-overlay" onClick={() => setShowDeleteModal(false)}>
              <div
                className="campaign-confirm-modal"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="campaign-confirm-icon">
                  <FiTrash2 />
                </div>
                <h3>Delete campaign?</h3>
                <p>
                  Are you sure you want to delete this campaign?
                  <br />
                  This action cannot be undone.
                </p>
                <div className="campaign-confirm-actions">
                  <button
                    className="campaign-confirm-btn cancel"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="campaign-confirm-btn delete"
                    onClick={handleDeleteCampaign}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {activeChatApplicant ? (
            <BrandChatModal
              influencerName={activeChatApplicant.influencerName}
              influencerImage={activeChatApplicant.influencerImage}
              onClose={() => setActiveChatApplicant(null)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
