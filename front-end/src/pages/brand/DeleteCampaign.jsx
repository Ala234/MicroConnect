import "../../styles/dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiDollarSign,
  FiEdit2,
  FiFileText,
  FiLogOut,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";
import SaraBImage from "../../assets/images/SaraBlogs-Profile.jpg";
import LisaSImage from "../../assets/images/Lisa-Profile.jpg";
import { deleteCampaignById, getCampaignById } from "../../data/mockCampaigns";
import BrandChatModal from "./BrandChatModal";

const initialApplicants = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    role: "Fashion & Lifestyle",
    rating: "4.9",
    engagement: "8.5%",
    age: "28",
    followers: "45.2K",
    imageSrc: SaraBImage,
    status: "pending",
    flow: "approval",
  },
  {
    id: "mia-carter",
    name: "Mia Carter",
    role: "Lifestyle & Travel",
    rating: "4.8",
    engagement: "10.5%",
    age: "25",
    followers: "38.2K",
    imageSrc: LisaSImage,
    status: "contract",
    flow: "contract",
  },
];

const filterLabels = ["Followers", "Age Group", "Target Aud", "Engagement lvl"];

const getDurationLabel = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return "Not set";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffInDays = Math.round((end - start) / (1000 * 60 * 60 * 24));

  if (Number.isNaN(diffInDays) || diffInDays < 0) {
    return "Not set";
  }

  return `${diffInDays} days`;
};

export default function DeleteCampaign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("id");
  const [campaign, setCampaign] = useState(null);
  const [applicants, setApplicants] = useState(initialApplicants);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeChatApplicant, setActiveChatApplicant] = useState(null);
  const [banner, setBanner] = useState(null);
  const [campaignDeleted, setCampaignDeleted] = useState(false);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!campaignId) {
      setStatus("missing");
      return;
    }

    const selectedCampaign = getCampaignById(campaignId);

    if (!selectedCampaign) {
      setStatus("missing");
      return;
    }

    setCampaign(selectedCampaign);
    setStatus("ready");
  }, [campaignId]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const showBanner = (title, text) => {
    setBanner({ title, text });
  };

  const handleApplicantAction = (applicantId, nextStatus) => {
    const applicant = applicants.find((item) => item.id === applicantId);

    if (!applicant || applicant.status === nextStatus) {
      return;
    }

    if (nextStatus === "accepted") {
      navigate(
        `/contracts?campaignId=${campaignId}&influencer=${applicant.id}&state=accepted`
      );
      return;
    }

    setApplicants((currentApplicants) =>
      currentApplicants.map((item) =>
        item.id === applicantId ? { ...item, status: nextStatus } : item
      )
    );

    showBanner(
      "Application rejected!",
      `${applicant.name} has been notified of your decision`
    );
  };

  const handleApplicantContractFlow = (applicantId, nextState) => {
    navigate(`/contracts?campaignId=${campaignId}&influencer=${applicantId}&state=${nextState}`);
  };

  const handleDeleteCampaign = () => {
    if (!campaign) {
      return;
    }

    deleteCampaignById(campaign.id);
    setCampaignDeleted(true);
    setShowDeleteModal(false);
    showBanner(
      "Campaign deleted successfully!",
      "This campaign has been removed from the system"
    );
  };

  if (status === "missing") {
    return (
      <div className="dashboard-page campaign-review-page">
        <div className="dashboard-shell">
          <div className="dashboard-section delete-campaign-page">
            <div className="campaign-review-empty">
              <h1>Campaign Not Found</h1>
              <p>Select a campaign from the dashboard and try again.</p>
              <button
                className="dashboard-primary-btn"
                onClick={() => navigate("/brand")}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  const metrics = [
    {
      icon: <FiFileText />,
      label: "Applications",
      value: "80",
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

  return (
    <div className="dashboard-page campaign-review-page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>

          <div className="dashboard-topbar-actions">
            <button className="dashboard-logout ghost" onClick={handleLogout}>
              <FiLogOut />
              <span>Log out</span>
            </button>

            <button
              className="campaign-review-arrow"
              onClick={() => navigate("/brand")}
              aria-label="Back to brand dashboard"
            >
              <FiArrowRight />
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
              <p>{campaignDeleted ? "Campaign removed from active listings" : "Check our New Collection !"}</p>
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
                  onClick={() => navigate(`/create-campaign?id=${campaign.id}`)}
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
              <div
                key={metric.label}
                className={`campaign-review-metric ${metric.tone}`}
              >
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
              <p>{campaign.platforms.join(", ")}</p>
            </div>

            <div className="campaign-review-card full-width">
              <span className="campaign-card-label">Target Audience</span>
              <p>{campaign.targetAudience}</p>
            </div>
          </div>

          <div className="campaign-review-applications">
            <div className="campaign-review-toolbar">
              <div className="campaign-review-section-title">
                <h2>Influencers Application</h2>
                <p>{applicants.length} Applications Found</p>
              </div>

              <div className="campaign-filter-row">
                {filterLabels.map((label) => (
                  <button className="campaign-filter-chip" key={label} type="button">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="campaign-application-list">
              {applicants.map((applicant) => (
                <div className="campaign-application-card" key={applicant.id}>
                  <div className="campaign-application-profile">
                    <img src={applicant.imageSrc} alt={applicant.name} />

                    <div>
                      <h3>{applicant.name}</h3>
                      <p>{applicant.role}</p>
                      <span>{applicant.rating} / 5</span>
                    </div>
                  </div>

                  <div className="campaign-application-stats">
                    <div>
                      <span>Engagement</span>
                      <strong>{applicant.engagement}</strong>
                    </div>

                    <div>
                      <span>Age</span>
                      <strong>{applicant.age}</strong>
                    </div>

                    <div>
                      <span>Followers</span>
                      <strong>{applicant.followers}</strong>
                    </div>
                  </div>

                  <div className="campaign-application-actions stacked">
                    <button className="campaign-view-btn">View Profile</button>
                    {applicant.status !== "pending" &&
                    applicant.status !== "contract" ? (
                      <span className={`campaign-decision-badge ${applicant.status}`}>
                        {applicant.status === "accepted" ? "Accepted" : "Rejected"}
                      </span>
                    ) : null}
                    <div className="campaign-application-actions">
                      {applicant.flow === "approval" ? (
                        <>
                          <button
                            className="campaign-status-btn accept"
                            onClick={() =>
                              handleApplicantAction(applicant.id, "accepted")
                            }
                            disabled={campaignDeleted || applicant.status === "accepted"}
                          >
                            <FiCheck />
                            <span>Accept</span>
                          </button>
                          <button
                            className="campaign-status-btn decline"
                            onClick={() =>
                              handleApplicantAction(applicant.id, "rejected")
                            }
                            disabled={campaignDeleted || applicant.status === "rejected"}
                          >
                            <FiX />
                            <span>Reject</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="campaign-status-btn message"
                            onClick={() => setActiveChatApplicant(applicant)}
                            disabled={campaignDeleted}
                          >
                            <span>Message</span>
                          </button>
                          <button
                            className="campaign-status-btn contract"
                            onClick={() =>
                              handleApplicantContractFlow(applicant.id, "requested")
                            }
                            disabled={campaignDeleted}
                          >
                            <span>Contract</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showDeleteModal ? (
            <div
              className="campaign-modal-overlay"
              onClick={() => setShowDeleteModal(false)}
            >
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
              influencerName={activeChatApplicant.name}
              influencerImage={activeChatApplicant.imageSrc}
              onClose={() => setActiveChatApplicant(null)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
