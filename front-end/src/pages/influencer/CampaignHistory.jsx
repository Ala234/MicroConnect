import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InfluencerTopNav from '../../components/influencer/InfluencerTopNav';
import { getBrandReviewsForCampaign, getReviewsForInfluencer } from '../../api/reviews';
import { fetchCampaignById } from '../../data/mockCampaigns';
import {
  getCurrentUser,
  getProfileForUser,
  isInfluencerProfileComplete,
} from '../../data/influencerAccounts';
import SocialPlatformIcon from '../../components/influencer/SocialPlatformIcon';
import '../../styles/influencer.css';

const campaignFeedbackSeed = {
  'spring-collection': {
    brandName: 'Fashion Forward',
    completionDate: '2026-03-15',
    socials: [
      { label: 'Instagram', value: '@fashionforward', href: 'https://instagram.com/fashionforward' },
      { label: 'TikTok', value: '@fashionforward', href: 'https://tiktok.com/@fashionforward' },
      { label: 'Website', value: 'fashionforward.com', href: 'https://fashionforward.com' }
    ],
    reviews: [
      {
        influencer: 'Lina Styles',
        rating: 5,
        comment: 'Clear creative direction, fast approvals, and respectful communication from start to finish.'
      },
      {
        influencer: 'Maya Looks',
        rating: 4,
        comment: 'The brief was organized and payment was on time. The team was flexible when I proposed stronger content hooks.'
      }
    ]
  },
  'winter-collection': {
    brandName: 'North Thread',
    completionDate: '2026-02-28',
    socials: [
      { label: 'Instagram', value: '@norththread', href: 'https://instagram.com/norththread' },
      { label: 'YouTube', value: 'North Thread', href: 'https://youtube.com/@norththread' },
      { label: 'Website', value: 'norththread.co', href: 'https://norththread.co' }
    ],
    reviews: [
      {
        influencer: 'Omar Layers',
        rating: 5,
        comment: 'Strong brand fit, detailed product notes, and quick turnaround on approvals.'
      },
      {
        influencer: 'Nora Daily',
        rating: 4,
        comment: 'Good collaboration overall. The campaign timeline was tight, but the brand stayed responsive throughout.'
      }
    ]
  },
  'skin-care-collection': {
    brandName: 'Pure Beauty',
    completionDate: '2026-01-20',
    socials: [
      { label: 'Instagram', value: '@purebeauty', href: 'https://instagram.com/purebeauty' },
      { label: 'TikTok', value: '@purebeauty.skin', href: 'https://tiktok.com/@purebeauty.skin' },
      { label: 'Website', value: 'purebeauty.com', href: 'https://purebeauty.com' }
    ],
    reviews: [
      {
        influencer: 'Sara Glow',
        rating: 5,
        comment: 'Excellent product education and a collaborative review process. The audience response was genuinely strong.'
      },
      {
        influencer: 'Dana Routine',
        rating: 5,
        comment: 'The brand values matched the brief, and the deliverables felt realistic for the timeline.'
      }
    ]
  }
};

const seedCampaignNames = {
  'spring-collection': 'Spring Collection Launch',
  'winter-collection': 'Winter Styling Campaign',
  'skin-care-collection': 'Skin Care Collection'
};

const createHistoryPlaceholderImage = (name) => {
  const initial = (name || 'B').charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="432" viewBox="0 0 360 432"><rect width="360" height="432" rx="28" fill="#10172f"/><circle cx="180" cy="176" r="74" fill="#6d5dfc"/><text x="180" y="205" text-anchor="middle" font-family="Arial, sans-serif" font-size="82" font-weight="700" fill="white">${initial}</text><text x="180" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#d8e0ff">${name || 'Brand'}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getSeedCampaignFallback = (campaignId) => {
  const feedback = campaignFeedbackSeed[campaignId];
  if (!feedback) return null;

  return {
    id: campaignId,
    name: seedCampaignNames[campaignId] || `${feedback.brandName} Campaign`,
    brandName: feedback.brandName,
    objective: 'Brand reputation',
    description: `${feedback.brandName} brand feedback from previous influencer collaborations.`,
    platforms: feedback.socials
      .filter((social) => social.label !== 'Website')
      .map((social) => social.label),
    imageSrc: createHistoryPlaceholderImage(feedback.brandName)
  };
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, index) => (
    <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>{'\u2605'}</span>
  ));

const getSocialPlatformClass = (label) => {
  const normalized = label.toLowerCase();
  if (normalized.includes('instagram')) return 'instagram';
  if (normalized.includes('tiktok')) return 'tiktok';
  if (normalized.includes('youtube')) return 'youtube';
  return 'website';
};

const getRecordId = (record) => {
  if (!record) return '';
  if (typeof record === 'object') return String(record._id || record.id || '');
  return String(record);
};

const isMongoId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || ''));

const getCampaignRouteId = (campaign, fallbackId) => campaign?.id || campaign?._id || fallbackId;

const getCampaignBrandName = (campaign, feedback, brandProfile) => {
  if (campaign?.brandName) return campaign.brandName;
  if (typeof campaign?.brand === 'string') return campaign.brand;
  if (campaign?.brand?.companyName) return campaign.brand.companyName;
  if (campaign?.brand?.name) return campaign.brand.name;
  if (brandProfile?.companyName) return brandProfile.companyName;
  if (brandProfile?.userId?.name) return brandProfile.userId.name;
  if (campaign?.brandId?.companyName) return campaign.brandId.companyName;
  if (campaign?.brandId?.name) return campaign.brandId.name;
  return feedback?.brandName || 'Brand';
};

const getSeedFeedbackForCampaign = (campaign) => {
  if (!campaign) return null;

  const directFeedback =
    campaignFeedbackSeed[campaign.id] ||
    campaignFeedbackSeed[campaign._id] ||
    campaignFeedbackSeed[getCampaignRouteId(campaign, '')];

  if (directFeedback) {
    return directFeedback;
  }

  if (isMongoId(getCampaignRouteId(campaign, ''))) {
    return null;
  }

  const brandName = getCampaignBrandName(campaign).toLowerCase();
  return (
    Object.values(campaignFeedbackSeed).find(
      (seed) => seed.brandName.toLowerCase() === brandName
    ) || null
  );
};

const formatBackendReview = (review) => ({
  id: review.id || review._id,
  influencer: review.influencerName || 'Influencer',
  campaignName: review.campaignName || '',
  rating: Number(review.rating),
  comment: review.review || '',
  date: review.createdAt,
});

const formatInfluencerBackendReview = (review) => ({
  id: review.id || review._id,
  brand: review.brandName || review.reviewerName || 'Brand',
  collaboration: review.campaignName || 'Campaign',
  date: review.createdAt,
  rating: Number(review.rating),
  comment: review.review || '',
});

const getSocialHref = (label, value) => {
  if (!value) return '';

  const trimmed = String(value).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const handle = trimmed.replace(/^@/, '');
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes('instagram')) {
    return `https://instagram.com/${handle}`;
  }

  if (normalizedLabel.includes('tiktok')) {
    return `https://tiktok.com/@${handle}`;
  }

  if (normalizedLabel.includes('youtube')) {
    return `https://youtube.com/@${handle.replace(/\s+/g, '')}`;
  }

  return `https://${trimmed.replace(/^https?:\/\//i, '')}`;
};

const getBrandSocials = (campaign, feedback, brandProfile) => {
  if (feedback?.socials?.length) {
    return feedback.socials;
  }

  const campaignBrand = typeof campaign?.brand === 'object' ? campaign.brand : {};
  const socialData = campaign?.socials || campaign?.brandSocials || {};
  const candidates = [
    ['Instagram', brandProfile?.instagram || socialData.instagram || campaignBrand.instagram || campaign?.instagram || campaign?.brandInstagram],
    ['TikTok', brandProfile?.tiktok || socialData.tiktok || campaignBrand.tiktok || campaign?.tiktok || campaign?.brandTikTok],
    ['YouTube', socialData.youtube || campaignBrand.youtube || campaign?.youtube || campaign?.brandYouTube],
    ['Website', brandProfile?.website || socialData.website || campaignBrand.website || campaign?.website || campaign?.brandWebsite]
  ];

  return candidates
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => ({
      label,
      value,
      href: getSocialHref(label, value)
    }));
};

const fetchBrandProfileForCampaign = async (campaign) => {
  try {
    const response = await fetch('http://localhost:5000/api/brands');
    if (!response.ok) return null;

    const data = await response.json();
    const brands = Array.isArray(data) ? data : data.brands || data.data || [];
    const campaignBrandId = getRecordId(campaign?.brandId);
    const campaignBrandName = String(campaign?.brandName || '').toLowerCase();

    return (
      brands.find((brand) => {
        const userId = getRecordId(brand.userId);
        const companyName = String(brand.companyName || '').toLowerCase();
        const userName = String(brand.userId?.name || '').toLowerCase();

        return (
          (campaignBrandId && userId === campaignBrandId) ||
          (campaignBrandName && companyName === campaignBrandName) ||
          (campaignBrandName && userName === campaignBrandName)
        );
      }) || null
    );
  } catch {
    return null;
  }
};

function CampaignHistoryNotFound({ message = 'The requested campaign could not be found.' }) {
  const navigate = useNavigate();

  return (
    <main className="influencer-page dashboard-page">
      <div className="dashboard-shell influencer-shell">
        <header className="influencer-topbar dashboard-topbar">
          <div className="brand-logo dashboard-logo">
            <span className="brand-mark dashboard-logo-icon">M</span>
            <div>
              <p className="brand-name">MicroConnect</p>
              <p className="brand-subtitle">Influencer Portal</p>
            </div>
          </div>

          <InfluencerTopNav active="campaigns" />

          <div className="topbar-actions">
            <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
          </div>
        </header>

        <section className="campaigns-section padded-top">
          <div className="content-card">
            <h3>Campaign Not Found</h3>
            <p className="text-muted">{message}</p>
            <button className="btn btn-secondary" onClick={() => navigate('/influencer')}>
              Back to Campaigns
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function CampaignHistory() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [brandProfile, setBrandProfile] = useState(null);
  const [backendReviews, setBackendReviews] = useState([]);
  const [backendInfluencerReviews, setBackendInfluencerReviews] = useState([]);
  const [isCampaignLoading, setIsCampaignLoading] = useState(Boolean(id));
  const [loadError, setLoadError] = useState('');

  const profileComplete = isInfluencerProfileComplete(getProfileForUser());
  const feedback = getSeedFeedbackForCampaign(campaign);
  const campaignBrandName = getCampaignBrandName(campaign, feedback, brandProfile);
  const campaignRouteId = getCampaignRouteId(campaign, id);
  const campaignPlatforms = Array.isArray(campaign?.platforms)
    ? campaign.platforms.length > 0 ? campaign.platforms.join(', ') : 'Not specified'
    : campaign?.platforms || 'Not specified';
  const backendReviewCards = backendReviews.map(formatBackendReview);
  const campaignReviews = backendReviewCards.length > 0 ? backendReviewCards : feedback?.reviews || [];
  const brandSocials = getBrandSocials(campaign, feedback, brandProfile);
  const influencerReviewCards = backendInfluencerReviews.map(formatInfluencerBackendReview);
  const hasInfluencerFeedback = influencerReviewCards.length > 0;
  const influencerAverageRating = hasInfluencerFeedback
    ? (influencerReviewCards.reduce((total, review) => total + review.rating, 0) / influencerReviewCards.length).toFixed(1)
    : null;
  const completedCollaborations = new Set(influencerReviewCards.map((review) => review.collaboration)).size;
  const repeatBrands = new Set(influencerReviewCards.map((review) => review.brand)).size;
  const hasCampaignReviews = campaignReviews.length > 0;
  const averageRating = hasCampaignReviews
    ? (campaignReviews.reduce((total, review) => total + review.rating, 0) / campaignReviews.length).toFixed(1)
    : null;

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
    }
  }, [profileComplete, navigate]);

  useEffect(() => {
    if (!id || !profileComplete) {
      setCampaign(null);
      setBrandProfile(null);
      setBackendReviews([]);
      setIsCampaignLoading(false);
      return undefined;
    }

    let ignoreResult = false;

    const loadCampaignHistory = async () => {
      setIsCampaignLoading(true);
      setLoadError('');

      try {
        const campaignData = (await fetchCampaignById(id)) || getSeedCampaignFallback(id);
        const brandData = campaignData ? await fetchBrandProfileForCampaign(campaignData) : null;
        const selectedCampaignId = getCampaignRouteId(campaignData, id);
        const reviewsResult = campaignData && isMongoId(selectedCampaignId)
          ? await getBrandReviewsForCampaign(selectedCampaignId)
          : { success: true, reviews: [] };

        if (!ignoreResult) {
          setCampaign(campaignData);
          setBrandProfile(brandData);
          setBackendReviews(reviewsResult.success ? reviewsResult.reviews || [] : []);
        }
      } catch (err) {
        if (!ignoreResult) {
          setCampaign(null);
          setBrandProfile(null);
          setBackendReviews([]);
          setLoadError(err.message || 'Unable to load campaign history.');
        }
      } finally {
        if (!ignoreResult) {
          setIsCampaignLoading(false);
        }
      }
    };

    loadCampaignHistory();

    return () => {
      ignoreResult = true;
    };
  }, [id, profileComplete]);

  useEffect(() => {
    if (id || !profileComplete) {
      setBackendInfluencerReviews([]);
      return undefined;
    }

    let ignoreResult = false;

    const loadInfluencerReviews = async () => {
      const currentUser = getCurrentUser();
      const influencerIdentifier = currentUser?._id || currentUser?.id || currentUser?.email;

      if (!influencerIdentifier) {
        setBackendInfluencerReviews([]);
        return;
      }

      const reviewsResult = await getReviewsForInfluencer(influencerIdentifier);
      if (!ignoreResult) {
        setBackendInfluencerReviews(reviewsResult.success ? reviewsResult.reviews || [] : []);
      }
    };

    loadInfluencerReviews();

    return () => {
      ignoreResult = true;
    };
  }, [id, profileComplete]);

  if (!profileComplete) {
    return null;
  }

  if (id && isCampaignLoading) {
    return (
      <main className="influencer-page dashboard-page">
        <div className="dashboard-shell influencer-shell">
          <header className="influencer-topbar dashboard-topbar">
            <div className="brand-logo dashboard-logo">
              <span className="brand-mark dashboard-logo-icon">M</span>
              <div>
                <p className="brand-name">MicroConnect</p>
                <p className="brand-subtitle">Influencer Portal</p>
              </div>
            </div>

            <InfluencerTopNav active="campaigns" />

            <div className="topbar-actions">
              <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
            </div>
          </header>

          <section className="campaigns-section padded-top">
            <div className="content-card">
              <h3>Loading campaign history...</h3>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (id && !campaign) {
    return (
      <CampaignHistoryNotFound
        message={loadError || 'The requested campaign could not be found.'}
      />
    );
  }

  return (
    <main className="influencer-page dashboard-page">
      <div className="dashboard-shell influencer-shell">
        <header className="influencer-topbar dashboard-topbar">
          <div className="brand-logo dashboard-logo">
            <span className="brand-mark dashboard-logo-icon">M</span>
            <div>
              <p className="brand-name">MicroConnect</p>
              <p className="brand-subtitle">Influencer Portal</p>
            </div>
          </div>

          <InfluencerTopNav active={id ? 'campaigns' : 'profile'} />

          <div className="topbar-actions">
            <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
          </div>
        </header>

        <section className={`campaigns-section padded-top${id ? ' campaign-history-page' : ' brand-feedback-page'}`}>
          <div className="campaigns-header">
            <div>
              <p className="section-label">Feedback & Reviews</p>
              <h2>{id ? `${campaign.name} brand feedback history` : 'Brand reviews about your work'}</h2>
            </div>
            <button className="btn btn-outline" onClick={() => navigate(id ? '/influencer' : '/influencer/profile')}>
              Back
            </button>
          </div>

          {id ? (
            <div className="history-detail-layout">
              <aside className="history-detail-sidebar">
                <div className="content-card history-detail-image-card">
                  <img src={campaign.imageSrc} alt={campaign.name} className="history-detail-image" />
                </div>

                <div className="content-card history-social-card">
                  <div className="history-social-header">
                    <p className="section-label">Brand Social Media</p>
                    <h3>Connect with {campaignBrandName}</h3>
                  </div>
                  <div className="social-account-grid">
                    {brandSocials.length > 0 ? (
                      brandSocials.map((social) => {
                        const platformClass = getSocialPlatformClass(social.label);

                        return (
                          <a
                            key={social.label}
                            className={`social-account-card history-social-account ${platformClass}`}
                            href={social.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <div className="social-account-icon" aria-hidden="true">
                              <SocialPlatformIcon platform={platformClass} />
                            </div>
                            <div className="social-account-content">
                              <span className="social-account-label">{social.label}</span>
                              <p>{social.value}</p>
                            </div>
                          </a>
                        );
                      })
                    ) : (
                      <p className="text-muted">No brand social media links are available yet.</p>
                    )}
                  </div>
                </div>
              </aside>

              <article className="content-card history-detail-card">
                <div className="history-detail-copy">
                  <p className="history-detail-brand">{campaignBrandName}</p>
                  <h3 className="history-detail-title">{campaign.name}</h3>
                  <p className="history-detail-summary">
                    {campaign.description || 'No campaign summary is available yet.'}
                  </p>
                </div>

                <div className="history-detail-meta">
                  <div className="history-detail-stat">
                    <span className="meta-label">Brand</span>
                    <span className="meta-value">{campaignBrandName}</span>
                  </div>
                  <div className="history-detail-stat">
                    <span className="meta-label">Objective</span>
                    <span className="meta-value">{campaign.objective || 'Not specified'}</span>
                  </div>
                  <div className="history-detail-stat">
                    <span className="meta-label">Platforms</span>
                    <span className="meta-value">{campaignPlatforms}</span>
                  </div>
                  <div className="history-detail-stat">
                    <span className="meta-label">Average Rating</span>
                    <span className="meta-value">{averageRating ? `${averageRating}/5` : 'No ratings yet'}</span>
                  </div>
                </div>

                <div className="history-review-list history-detail-reviews">
                  {hasCampaignReviews ? (
                    campaignReviews.map((review) => (
                      <section className="history-review-card" key={review.id || `${review.influencer}-${review.date || review.comment}`}>
                        <div className="history-review-header">
                          <div>
                            <h4>{review.influencer}</h4>
                            <p>
                              {review.date
                                ? `${review.campaignName ? `${review.campaignName} | ` : ''}${formatDate(review.date)}`
                                : 'Completed collaboration'}
                            </p>
                          </div>
                          <div className="history-campaign-rating">
                            <div className="rating-stars">
                              {renderStars(review.rating)}
                            </div>
                            <span className="rating-text">{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="review-text">{review.comment}</p>
                      </section>
                    ))
                  ) : (
                    <div className="no-results">
                      <h3>No brand reviews yet</h3>
                      <p>
                        This brand has not received influencer feedback yet. Once influencers complete collaborations, their ratings and reviews will appear here.
                      </p>
                    </div>
                  )}
                </div>

                <div className="campaign-action-buttons history-action-buttons">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      navigate(`/influencer/campaign/${campaignRouteId}/message`, {
                        state: { returnTo: `/influencer/campaign/${campaignRouteId}/history` }
                      })
                    }
                  >
                    Message
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(`/influencer/campaign/${campaignRouteId}/propose`, {
                        state: { returnTo: `/influencer/campaign/${campaignRouteId}/history` }
                      })
                    }
                  >
                    Apply
                  </button>
                </div>
              </article>
            </div>
          ) : (
            <div className="influencer-feedback-layout">
              {hasInfluencerFeedback ? (
                <>
                  <section className="content-card influencer-feedback-overview">
                    <div className="influencer-feedback-intro">
                      <p className="section-label">Feedback & Reviews</p>
                      <h3>How brands rate your collaborations</h3>
                      <p className="text-muted">
                        This page reflects feedback brands left about your communication, reliability, content quality, and delivery.
                      </p>
                    </div>

                    <div className="influencer-feedback-stats">
                      <div className="history-detail-stat">
                        <span className="meta-label">Average Rating</span>
                        <span className="meta-value">{influencerAverageRating}/5</span>
                      </div>
                      <div className="history-detail-stat">
                        <span className="meta-label">Completed Collaborations</span>
                        <span className="meta-value">{completedCollaborations}</span>
                      </div>
                      <div className="history-detail-stat">
                        <span className="meta-label">Reviewed Brands</span>
                        <span className="meta-value">{repeatBrands}</span>
                      </div>
                    </div>
                  </section>

                  <div className="history-review-list">
                    {influencerReviewCards.map((review) => (
                      <section className="history-review-card" key={review.id || `${review.brand}-${review.date}`}>
                        <div className="history-review-header">
                          <div>
                            <h4>{review.brand}</h4>
                            <p>{review.collaboration} | {formatDate(review.date)}</p>
                          </div>
                          <div className="history-campaign-rating">
                            <div className="rating-stars">
                              {renderStars(review.rating)}
                            </div>
                            <span className="rating-text">{review.rating}/5</span>
                          </div>
                        </div>
                        <p className="review-text">{review.comment}</p>
                      </section>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-results">
                  <h3>No influencer reviews yet</h3>
                  <p>
                    Brand feedback will appear here after completed collaborations.
                  </p>
                </div>
              )}
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
