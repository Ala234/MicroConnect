import "../../styles/dashboard.css";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiLogOut, FiMapPin, FiStar, FiUsers } from "react-icons/fi";
import { fetchCampaignById } from "../../data/mockCampaigns";
import { getInfluencerById as getMockInfluencerById } from "../../data/mockInfluencers";
import {
  getAllInfluencers,
  getInfluencerById as apiGetInfluencerById,
} from "../../api/influencers";
import { getReviewsForInfluencer } from "../../api/reviews";

const getRecordId = (record) => {
  if (!record) return "";
  if (typeof record === "object") return record._id || record.id || "";
  return record;
};

const createPlaceholderAvatar = (name) => {
  const initial = (name || "I").charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#1f2640"/><circle cx="150" cy="118" r="54" fill="#8fb0ff"/><path d="M66 262c12-54 45-82 84-82s72 28 84 82" fill="#8fb0ff"/><text x="150" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#1f2640">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getPlatforms = (profile) =>
  [
    profile.instagram ? "Instagram" : "",
    profile.tiktok ? "TikTok" : "",
    profile.youtube ? "YouTube" : "",
    profile.website ? "Website" : "",
  ].filter(Boolean);

const normalizeInfluencer = (profile) => {
  if (!profile) return null;

  const platforms = Array.isArray(profile.platforms) && profile.platforms.length
    ? profile.platforms
    : getPlatforms(profile);
  const categories = profile.categories || profile.niches || [];
  const audience = profile.audience && typeof profile.audience === "object"
    ? profile.audience
    : {};

  return {
    ...profile,
    id: profile.id || profile._id,
    userId: getRecordId(profile.userId) || profile.userId,
    name: profile.name || "Influencer",
    email: profile.email || "",
    role: profile.role || categories.slice(0, 2).join(" & ") || profile.niche || "Influencer",
    rating: profile.rating || "No reviews yet",
    engagement: profile.engagement || "Not set",
    age: profile.age || audience.age || "Not set",
    followers: profile.followers || "Not set",
    imageSrc: profile.imageSrc || profile.profileImage || createPlaceholderAvatar(profile.name),
    location: profile.location || "Not set",
    bio: profile.bio || "No bio available yet.",
    niches: categories,
    platforms,
    audience: typeof profile.audience === "string"
      ? profile.audience
      : audience.location || "Not set",
  };
};

const formatDate = (date) => {
  if (!date) return "Not dated";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const averageRating = (reviews) => {
  if (!reviews.length) return null;
  return (
    reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
  ).toFixed(1);
};

export default function InfluencerProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const influencerId = searchParams.get("influencer");
  const [campaign, setCampaign] = useState(null);
  const [influencer, setInfluencer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        if (campaignId) {
          const loadedCampaign = await fetchCampaignById(campaignId);
          if (isMounted) setCampaign(loadedCampaign);
        }

        let loadedInfluencer = null;
        const profileResult = influencerId ? await apiGetInfluencerById(influencerId) : null;
        if (profileResult?.success && profileResult.influencer) {
          loadedInfluencer = profileResult.influencer;
        } else {
          const influencersResult = await getAllInfluencers();
          const influencers = influencersResult.influencers || [];
          loadedInfluencer = influencers.find((item) =>
            getRecordId(item._id || item.id) === influencerId ||
            getRecordId(item.userId) === influencerId ||
            String(item.email || "").toLowerCase() === String(influencerId || "").toLowerCase()
          );
        }

        const mockInfluencer = getMockInfluencerById(influencerId);
        const nextInfluencer = normalizeInfluencer(loadedInfluencer || mockInfluencer);
        const influencerUserId = getRecordId(nextInfluencer?.userId) || getRecordId(nextInfluencer?._id || nextInfluencer?.id) || influencerId;
        const reviewsResult = influencerUserId ? await getReviewsForInfluencer(influencerUserId) : null;

        if (isMounted) {
          setInfluencer(nextInfluencer);
          setReviews(reviewsResult?.success ? reviewsResult.reviews || [] : []);
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || "Influencer profile could not be loaded");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [campaignId, influencerId]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const reviewAverage = averageRating(reviews);

  if (loading) {
    return (
      <div className="dashboard-page campaign-review-page">
        <div className="dashboard-shell">
          <div className="dashboard-section profile-page">
            <div className="campaign-review-empty">Loading influencer profile...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="dashboard-page campaign-review-page">
        <div className="dashboard-shell">
          <div className="dashboard-section profile-page">
            <div className="campaign-review-empty">
              <h1>Influencer Not Found</h1>
              <p>{errorMessage || "Select an influencer from the campaign page and try again."}</p>
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
          <button
            className="back-btn-large"
            onClick={() => navigate(-1)}
            aria-label="Back"
            type="button"
          >
            Back
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
                  {reviewAverage ? `${reviewAverage}/5` : influencer.rating}
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
              <p>{influencer.niches.length ? influencer.niches.join(", ") : "Not set"}</p>
            </div>

            <div className="campaign-review-card">
              <span className="campaign-card-label">Platforms</span>
              <p>{influencer.platforms.length ? influencer.platforms.join(", ") : "Not set"}</p>
            </div>

            <div className="campaign-review-card full-width">
              <span className="campaign-card-label">Audience</span>
              <p>{influencer.audience}</p>
            </div>

            <div className="campaign-review-card full-width">
              <span className="campaign-card-label">Feedback & Reviews</span>
              {reviews.length ? (
                reviews.map((review) => (
                  <div className="history-review-card" key={review.id || review._id}>
                    <div className="history-review-header">
                      <div>
                        <h4>{review.brandName || review.reviewerName || "Brand"}</h4>
                        <p>{review.campaignName || "Campaign"} | {formatDate(review.createdAt)}</p>
                      </div>
                      <div className="history-campaign-rating">
                        <span className="rating-text">{review.rating}/5</span>
                      </div>
                    </div>
                    <p className="review-text">{review.review}</p>
                  </div>
                ))
              ) : (
                <div className="campaign-filter-empty">
                  <h3>No influencer reviews yet</h3>
                  <p>Brand feedback will appear here after completed collaborations.</p>
                </div>
              )}
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
          </div>
        </div>
      </div>
    </div>
  );
}
