 
import "../../styles/dashboard.css";
import springImg from "../../assets/images/spring.png";
import winterImg from "../../assets/images/winter.png";
import skinCareImg from "../../assets/images/skincare.png";
import { useNavigate } from "react-router-dom";

export default function BrandDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>

          <button className="dashboard-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>

        <div className="dashboard-body">
          <div className="dashboard-hero">
            <h1>Brand Dashboard</h1>
            <p>Manage your campaigns and connect with micro-influencers</p>
          </div>

          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <h3>8</h3>
              <p>Active Campaigns</p>
            </div>

            <div className="dashboard-stat-card">
              <h3>124k</h3>
              <p>Total Reach</p>
            </div>

            <div className="dashboard-stat-card">
              <h3>45</h3>
              <p>Connected Influencers</p>
            </div>

            <div className="dashboard-stat-card">
              <h3>$12.4k</h3>
              <p>Budget Spent</p>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="dashboard-section-header">
              <div>
                <h2>Campaign Management</h2>
                <p>Track and manage all your campaigns</p>
              </div>

              <button
        className="dashboard-primary-btn"
         onClick={() => navigate("/create-campaign")}
        >
        + Create Campaign
        </button>
            </div>

            <div className="dashboard-campaign-list">
              <div className="dashboard-campaign-item">
                <img
                  className="dashboard-campaign-thumb"
                  src={springImg}
                  alt="Spring Collection"
                />

                <div className="dashboard-campaign-content">
                  <h3>Spring Collection</h3>
                  <div className="dashboard-campaign-meta">
                    <span>12 Influencers</span>
                    <span>45k Reach</span>
                    <span>80% Complete</span>
                  </div>
                  <div className="dashboard-progress">
                    <div style={{ width: "80%" }}></div>
                  </div>
                  <div className="dashboard-campaign-actions">
                    <button
                      className="campaign-chip-btn edit"
                      onClick={() => navigate("/create-campaign")}
                    >
                      Review
                    </button>
                    <button
                      className="campaign-chip-btn delete"
                      onClick={() => navigate("/delete-campaign")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div className="dashboard-campaign-item">
                <img
                  className="dashboard-campaign-thumb"
                  src={winterImg}
                  alt="Winter Collection"
                />

                <div className="dashboard-campaign-content">
                  <h3>Winter Collection</h3>
                  <div className="dashboard-campaign-meta">
                    <span>20 Influencers</span>
                    <span>60k Reach</span>
                    <span>50% Complete</span>
                  </div>
                  <div className="dashboard-progress">
                    <div style={{ width: "50%" }}></div>
                  </div>
                </div>
              </div>

              <div className="dashboard-campaign-item">
                <img
                  className="dashboard-campaign-thumb"
                  src={skinCareImg}
                  alt="Skin Care Collection"
                />

                <div className="dashboard-campaign-content">
                  <h3>Skin Care Collection</h3>
                  <div className="dashboard-campaign-meta">
                    <span>0 Influencers</span>
                    <span>0 Reach</span>
                    <span>0% Complete</span>
                  </div>
                  <div className="dashboard-progress">
             <div style={{ width: "0%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
