import "../../styles/dashboard.css";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCalendar,
  FiDollarSign,
  FiFileText,
  FiLogOut,
  FiUsers,
} from "react-icons/fi";
import springImg from "../../assets/images/spring.png";

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
    value: "$3,500",
    tone: "blue",
  },
  {
    icon: <FiCalendar />,
    label: "Duration",
    value: "60 days",
    tone: "peach",
  },
  {
    icon: <FiUsers />,
    label: "Influencers",
    value: "12",
    tone: "mint",
  },
];

const applicants = [
  {
    name: "Sarah Johnson",
    role: "Fashion & Lifestyle",
    rating: "4.9",
    engagement: "8.5%",
    age: "28",
    followers: "45.2K",
  },
  {
    name: "Mia Carter",
    role: "Beauty Creator",
    rating: "4.8",
    engagement: "7.9%",
    age: "24",
    followers: "32.1K",
  },
];

export default function DeleteCampaign() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

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

        <div className="dashboard-section delete-campaign-page">
          <div className="campaign-review-head">
            <img
              className="campaign-review-thumb"
              src={springImg}
              alt="Spring Collection"
            />

            <div className="campaign-review-title">
              <h1>Spring Collection</h1>
              <button
                className="campaign-inline-link"
                onClick={() => navigate("/create-campaign")}
              >
                Check our New Collection
              </button>
            </div>

            <div className="campaign-success-banner">
              <strong>Campaign deleted successfully!</strong>
              <span>This campaign has been removed from the system</span>
            </div>
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
              <p>Brand Awareness</p>
            </div>

            <div className="campaign-review-card">
              <span className="campaign-card-label">Target Audience</span>
              <p>Women 25-35, interested in fashion</p>
            </div>

            <div className="campaign-review-card">
              <span className="campaign-card-label">Description</span>
              <p>
                Launch our new spring collection through micro-influencer
                content with fresh styling inspiration and product discovery.
              </p>
            </div>

            <div className="campaign-review-card">
              <span className="campaign-card-label">Content Type</span>
              <p>Short-form video review</p>
            </div>

            <div className="campaign-review-card">
              <span className="campaign-card-label">Preferred Platforms</span>
              <p>Instagram, YouTube, TikTok</p>
            </div>
          </div>

          <div className="campaign-review-applications">
            <div className="campaign-review-section-title">
              <h2>Influencers Application</h2>
              <p>2 Applications Found</p>
            </div>

            <div className="campaign-application-list">
              {applicants.map((applicant) => (
                <div className="campaign-application-card" key={applicant.name}>
                  <div className="campaign-application-profile">
                    <img src={springImg} alt={applicant.name} />

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

                  <div className="campaign-application-actions">
                    <button className="campaign-status-btn accept">
                      Accept
                    </button>
                    <button className="campaign-status-btn decline">
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
