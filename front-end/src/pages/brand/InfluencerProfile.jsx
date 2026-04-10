import "../../styles/dashboard.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiLogOut, FiMapPin, FiStar, FiUsers } from "react-icons/fi";
import { getCampaignById } from "../../data/mockCampaigns";
import { getInfluencerById } from "../../data/mockInfluencers";

export default function InfluencerProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const influencerId = searchParams.get("influencer");
  const campaign = campaignId ? getCampaignById(campaignId) : null;
  const influencer = influencerId ? getInfluencerById(influencerId) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!influencer) {
    return (
      <div className="dashboard-page campaign-review-page">
        <div className="dashboard-shell">
          <div className="dashboard-section profile-page">
            <div className="campaign-review-empty">
              <h1>Influencer Not Found</h1>
              <p>Select an influencer from the campaign page and try again.</p>
              <button
                className="dashboard-primary-btn"
                onClick={() => navigate(campaignId ? `/delete-campaign?id=${campaignId}` : "/brand")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page campaign-review-page">
      <div className="dashboard-shell profile-page-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>

          <div className="dashboard-topbar-actions">
            <button
              className="dashboard-logout ghost"
              onClick={() => navigate(campaignId ? `/delete-campaign?id=${campaignId}` : "/brand")}
            >
              <FiArrowLeft />
              <span>Back</span>
            </button>

            <button className="dashboard-logout ghost" onClick={handleLogout}>
              <FiLogOut />
              <span>Log out</span>
            </button>
          </div>
        </div>

        <div className="dashboard-section profile-page">
          <div className="profile-hero">
            <img
              className="profile-hero-image"
              src={influencer.imageSrc}
              alt={influencer.name}
            />

            <div className="profile-hero-copy">
              <span className="profile-role-pill">{influencer.role}</span>
              <h1>{influencer.name}</h1>
              <p>{influencer.bio}</p>

              <div className="profile-meta-row">
                <span>
                  <FiMapPin />
                  {influencer.location}
                </span>
                <span>
                  <FiStar />
                  {influencer.rating} rating
                </span>
                <span>
                  <FiUsers />
                  {influencer.followers} followers
                </span>
              </div>
            </div>
          </div>

          <div className="profile-stat-grid">
            <div className="campaign-review-metric lavender">
              <span>Engagement</span>
              <strong>{influencer.engagement}</strong>
            </div>
            <div className="campaign-review-metric blue">
              <span>Age</span>
              <strong>{influencer.age}</strong>
            </div>
            <div className="campaign-review-metric peach">
              <span>Platforms</span>
              <strong>{influencer.platforms.length}</strong>
            </div>
            <div className="campaign-review-metric mint">
              <span>Campaign</span>
              <strong>{campaign?.name || "Open"}</strong>
            </div>
          </div>

          <div className="profile-content-grid">
            <div className="campaign-review-card">
              <span className="campaign-card-label">Niches</span>
              <p>{influencer.niches.join(", ")}</p>
            </div>

            <div className="campaign-review-card">
              <span className="campaign-card-label">Platforms</span>
              <p>{influencer.platforms.join(", ")}</p>
            </div>

            <div className="campaign-review-card full-width">
              <span className="campaign-card-label">Audience</span>
              <p>{influencer.audience}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button
              className="campaign-status-btn message"
              onClick={() =>
                navigate(
                  campaignId
                    ? `/delete-campaign?id=${campaignId}`
                    : "/brand"
                )
              }
            >
              Back to Campaign
            </button>
            <button
              className="campaign-status-btn contract"
              onClick={() =>
                navigate(
                  `/contracts?campaignId=${campaignId || "spring-collection"}&influencer=${influencer.id}&state=requested`
                )
              }
            >
              Open Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
