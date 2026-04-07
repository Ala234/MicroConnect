 import "../../styles/dashboard.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateCampaign() {
  const navigate = useNavigate();

  const [campaignName, setCampaignName] = useState("");
  const [campaignObjectives, setCampaignObjectives] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [influencersCount, setInfluencersCount] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [contentType, setContentType] = useState("");
  const [platforms, setPlatforms] = useState([]);

  const togglePlatform = (platform) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((item) => item !== platform)
        : [...prev, platform]
    );
  };

  const handleCreateCampaign = () => {
    const newCampaign = {
      campaignName,
      campaignObjectives,
      campaignDescription,
      startDate,
      endDate,
      budget,
      influencersCount,
      targetAudience,
      contentType,
      platforms,
    };

    console.log("New Campaign:", newCampaign);
    navigate("/brand");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>
        </div>

        <div className="dashboard-section create-campaign-page">
          <div className="campaign-form-header">
            <h2>Create Campaign</h2>
            <p>Fill in the campaign details below.</p>
          </div>

          <div className="campaign-form-grid">
            <div className="campaign-form-group full-width">
              <label>Campaign Name</label>
              <input
                type="text"
                placeholder="Enter Campaign Name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            <div className="campaign-form-group full-width">
              <label>Campaign Objectives</label>
              <input
                type="text"
                placeholder="Enter Campaign Objectives"
                value={campaignObjectives}
                onChange={(e) => setCampaignObjectives(e.target.value)}
              />
            </div>

            <div className="campaign-form-group full-width">
              <label>Campaign Description</label>
              <textarea
                rows="4"
                placeholder="Describe your campaign goals, target audience and key message"
                value={campaignDescription}
                onChange={(e) => setCampaignDescription(e.target.value)}
              />
            </div>

            <div className="campaign-form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="campaign-form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div className="campaign-form-group">
              <label>Total Budget</label>
              <input
                type="number"
                placeholder="Enter the budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="campaign-form-group">
              <label>Number of Influencers</label>
              <input
                type="number"
                placeholder="Enter their number"
                value={influencersCount}
 onChange={(e) => setInfluencersCount(e.target.value)}
              />
            </div>

            <div className="campaign-form-group full-width">
              <label>Target Audience</label>
              <input
                type="text"
                placeholder="e.g. women 25-35"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              />
            </div>

            <div className="campaign-form-group full-width">
              <label>Social Media Platforms</label>
              <div className="platform-options">
                <button
                  type="button"
                  className={`platform-chip ${platforms.includes("TikTok") ? "active" : ""}`}
                  onClick={() => togglePlatform("TikTok")}
                >
                  TikTok
                </button>

                <button
                  type="button"
                  className={`platform-chip ${platforms.includes("Instagram") ? "active" : ""}`}
                  onClick={() => togglePlatform("Instagram")}
                >
                  Instagram
                </button>

                <button
                  type="button"
                  className={`platform-chip ${platforms.includes("YouTube") ? "active" : ""}`}
                  onClick={() => togglePlatform("YouTube")}
                >
                  YouTube
                </button>

                <button
                  type="button"
                  className={`platform-chip ${platforms.includes("X") ? "active" : ""}`}
                  onClick={() => togglePlatform("X")}
                >
                  X
                </button>
              </div>
            </div>

            <div className="campaign-form-group full-width">
              <label>Preferred Content Type</label>
              <input
                type="text"
                placeholder="story, reel, tutorial..."
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
              />
            </div>
          </div>

          <div className="campaign-form-actions">
            <button
              className="dashboard-logout"
              onClick={() => navigate("/brand")}
            >
              Cancel
            </button>

            <button
              className="dashboard-primary-btn"
              onClick={handleCreateCampaign}
            >
              Create Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}