import "../../styles/dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchCampaignById, saveCampaign } from "../../data/mockCampaigns";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("id");
  const isSaved = searchParams.get("saved") === "1";

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
  const [campaignImage, setCampaignImage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!campaignId) {
      setCampaignName("");
      setCampaignObjectives("");
      setCampaignDescription("");
      setStartDate("");
      setEndDate("");
      setBudget("");
      setInfluencersCount("");
      setTargetAudience("");
      setContentType("");
      setPlatforms([]);
      setCampaignImage("");
      setErrorMessage("");
      return;
    }

    const loadCampaign = async () => {
      setIsLoading(true);
      const campaign = await fetchCampaignById(campaignId);
      if (campaign) {
        setCampaignName(campaign.name);
        setCampaignObjectives(campaign.objective);
        setCampaignDescription(campaign.description);
        setStartDate(campaign.startDate);
        setEndDate(campaign.endDate);
        setBudget(campaign.budget);
        setInfluencersCount(campaign.influencersCount);
        setTargetAudience(campaign.targetAudience);
        setContentType(campaign.contentType);
        setPlatforms(campaign.platforms || []);
        setCampaignImage(campaign.imageSrc || "");
        setErrorMessage("");
      } else {
        setErrorMessage("This campaign could not be found.");
      }
      setIsLoading(false);
    };
    loadCampaign();
  }, [campaignId]);

  const togglePlatform = (platform) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((item) => item !== platform) : [...prev, platform]
    );
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCampaignImage(reader.result || "");
      setErrorMessage("");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => setCampaignImage("");

  const handleCreateCampaign = async () => {
    if (
      !campaignName || !campaignObjectives || !campaignDescription ||
      !startDate || !endDate || !budget || !influencersCount ||
      !targetAudience || !contentType || platforms.length === 0
    ) {
      setErrorMessage("Please complete all campaign fields before saving.");
      return;
    }
    if (endDate < startDate) {
      setErrorMessage("End date must be after the start date.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    const brandProfile = JSON.parse(localStorage.getItem("brandProfile") || "{}");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const brandName = brandProfile.companyName || user.name || "Brand";

    try {
      const savedCampaign = await saveCampaign({
        id: campaignId || undefined,
        name: campaignName,
        brandName,
        objective: campaignObjectives,
        description: campaignDescription,
        startDate,
        endDate,
        budget,
        influencersCount,
        targetAudience,
        contentType,
        platforms,
        imageSrc: campaignImage,
      });

      if (campaignId) {
        navigate(`/create-campaign?id=${savedCampaign.id}&saved=1`);
      } else {
        navigate("/brand");
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to save campaign.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-shell">
        <div className="dashboard-topbar">
          <div className="dashboard-logo">
            <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back" type="button">←</button>
            <div className="dashboard-logo-icon">M</div>
            <span>MicroConnect</span>
          </div>
        </div>

        <div className="dashboard-section create-campaign-page">
          <div className="campaign-form-header">
            <h2>{campaignId ? "Edit Campaign" : "Create Campaign"}</h2>
            <p>{campaignId ? "Update the campaign details." : "Fill in the campaign details below."}</p>
          </div>

          {errorMessage && <div className="campaign-flow-banner error">{errorMessage}</div>}
          {isSaved && <div className="campaign-flow-banner success">Campaign saved successfully.</div>}
          {isLoading && <div className="campaign-flow-banner info">Loading...</div>}

          <div className="campaign-form-grid">
            <div className="campaign-form-group full-width">
              <label>Campaign Image</label>
              <div className="campaign-image-upload">
                {campaignImage ? (
                  <div className="campaign-image-preview">
                    <img src={campaignImage} alt="Campaign preview" />
                    <button type="button" className="campaign-image-remove" onClick={handleRemoveImage}>✕ Remove</button>
                  </div>
                ) : (
                  <label className="campaign-image-dropzone">
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                    <div className="upload-icon">📷</div>
                    <p>Click to upload campaign image</p>
                    <span>PNG, JPG up to 5MB</span>
                  </label>
                )}
              </div>
            </div>

            <div className="campaign-form-group full-width">
              <label>Campaign Name</label>
              <input type="text" placeholder="Enter Campaign Name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            </div>

            <div className="campaign-form-group full-width">
              <label>Campaign Objectives</label>
              <input type="text" placeholder="Enter Campaign Objectives" value={campaignObjectives} onChange={(e) => setCampaignObjectives(e.target.value)} />
            </div>

            <div className="campaign-form-group full-width">
              <label>Campaign Description</label>
              <textarea rows="4" placeholder="Describe your campaign goals" value={campaignDescription} onChange={(e) => setCampaignDescription(e.target.value)} />
            </div>

            <div className="campaign-form-group">
              <label>Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="campaign-form-group">
              <label>End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="campaign-form-group">
              <label>Total Budget</label>
              <input type="number" placeholder="Enter the budget" value={budget} onChange={(e) => setBudget(e.target.value)} />
            </div>

            <div className="campaign-form-group">
              <label>Number of Influencers</label>
              <input type="number" placeholder="Enter their number" value={influencersCount} onChange={(e) => setInfluencersCount(e.target.value)} />
            </div>

            <div className="campaign-form-group full-width">
              <label>Target Audience</label>
              <input type="text" placeholder="e.g. women 25-35" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
            </div>

            <div className="campaign-form-group full-width">
              <label>Social Media Platforms</label>
              <div className="platform-options">
                {["TikTok", "Instagram", "YouTube", "X"].map((p) => (
                  <button key={p} type="button" className={`platform-chip ${platforms.includes(p) ? "active" : ""}`} onClick={() => togglePlatform(p)}>{p}</button>
                ))}
              </div>
            </div>

            <div className="campaign-form-group full-width">
              <label>Preferred Content Type</label>
              <input type="text" placeholder="story, reel, tutorial..." value={contentType} onChange={(e) => setContentType(e.target.value)} />
            </div>
          </div>

          <div className="campaign-form-actions">
            <button className="dashboard-logout" onClick={() => navigate(campaignId ? `/delete-campaign?id=${campaignId}` : "/brand")} disabled={isLoading}>Cancel</button>
            <button className="dashboard-primary-btn" onClick={handleCreateCampaign} disabled={isLoading}>
              {isLoading ? "Saving..." : campaignId ? "Save Changes" : "Create Campaign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}