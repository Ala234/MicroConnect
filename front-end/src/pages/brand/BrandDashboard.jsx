import "../../styles/dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCampaigns } from "../../data/mockCampaigns";

export default function BrandDashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    // Check if user is logged in as brand
    const stored = localStorage.getItem("user");
    const user = stored ? JSON.parse(stored) : null;

    if (!user || user.role !== "brand") {
      navigate("/login");
      return;
    }

    // Check if brand profile is complete - if not, send to setup
    const brandProfile = localStorage.getItem("brandProfile");
    if (!brandProfile) {
      navigate("/brand/setup");
      return;
    }

    setCampaigns(getCampaigns());
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const openCampaignPage = (campaignId) => {
    navigate(`/delete-campaign?id=${campaignId}`);
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

          {/* Brand Top Nav */}
          <nav className="influencer-top-nav">
            <button
              className="influencer-nav-link active"
              onClick={() => navigate("/brand")}
            >
              Campaigns
            </button>
            <button
              className="influencer-nav-link"
              onClick={() => navigate("/brand/profile")}
            >
              Profile
            </button>
            <button
              className="influencer-nav-link"
              onClick={() => navigate("/brand/contracts")}
            >
              Contracts
            </button>
          </nav>

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
              {campaigns.map((campaign) => (
                <div
                  className="dashboard-campaign-item dashboard-campaign-item-clickable"
                  key={campaign.id}
                  onClick={() => openCampaignPage(campaign.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openCampaignPage(campaign.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <img
                    className="dashboard-campaign-thumb"
                    src={campaign.imageSrc}
                    alt={campaign.name}
                  />

                  <div className="dashboard-campaign-content">
                    <h3>{campaign.name}</h3>
                    <div className="dashboard-campaign-meta">
                      <span>{campaign.influencersCount} Influencers</span>
                      <span>{campaign.reach} Reach</span>
                      <span>{campaign.progress}% Complete</span>
                    </div>
                    <div className="dashboard-progress">
                      <div style={{ width: `${campaign.progress}%` }}></div>
                    </div>
                    <div className="dashboard-campaign-actions"></div>
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