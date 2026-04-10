import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getCampaignById } from '../../data/mockCampaigns';
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

const influencerFeedbackSeed = {
  averageRating: 4.8,
  completedCollaborations: 12,
  repeatBrands: 5,
  reviews: [
    {
      brand: 'Fashion Forward',
      collaboration: 'Spring Collection Launch',
      date: '2026-03-18',
      rating: 5,
      comment: 'Sarah delivered polished content on time, understood the brief quickly, and communicated clearly through every revision.'
    },
    {
      brand: 'Pure Beauty',
      collaboration: 'Skin Care Collection',
      date: '2026-02-04',
      rating: 5,
      comment: 'Her audience trust showed in the final content. The review felt authentic, detailed, and aligned with our brand tone.'
    },
    {
      brand: 'North Thread',
      collaboration: 'Winter Styling Campaign',
      date: '2026-01-27',
      rating: 4,
      comment: 'Reliable and collaborative. She adapted well to feedback and kept the campaign moving without delays.'
    }
  ]
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

function CampaignHistoryNotFound() {
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

          <nav className="topnav">
            <button onClick={() => navigate('/influencer')}>Campaigns</button>
            <button onClick={() => navigate('/influencer/profile')}>Profile</button>
            <button onClick={() => navigate('/influencer/applications')}>Applications</button>
          </nav>

          <div className="topbar-actions">
            <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
          </div>
        </header>

        <section className="campaigns-section padded-top">
          <div className="content-card">
            <h3>Campaign History Not Found</h3>
            <p className="text-muted">No influencer feedback is available for the requested campaign.</p>
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
  const campaign = id ? getCampaignById(id) : null;
  const feedback = campaign ? campaignFeedbackSeed[campaign.id] : null;
  const averageRating = feedback
    ? (feedback.reviews.reduce((total, review) => total + review.rating, 0) / feedback.reviews.length).toFixed(1)
    : null;

  if (id && (!campaign || !feedback)) {
    return <CampaignHistoryNotFound />;
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

          <nav className="topnav">
            <button onClick={() => navigate('/influencer')}>Campaigns</button>
            <button onClick={() => navigate('/influencer/profile')}>Profile</button>
            <button onClick={() => navigate('/influencer/applications')}>Applications</button>
          </nav>

          <div className="topbar-actions">
            <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
          </div>
        </header>

        <section className={`campaigns-section padded-top${id ? ' campaign-history-page' : ' brand-feedback-page'}`}>
          <div className="campaigns-header">
            <div>
              <p className="section-label">{id ? 'Campaign History' : 'Brand Feedback'}</p>
              <h2>{id ? `${campaign.name} feedback history` : 'Brand reviews about your work'}</h2>
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
                    <h3>Connect with {feedback.brandName}</h3>
                  </div>
                  <div className="social-account-grid">
                    {feedback.socials.map((social) => {
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
                    })}
                  </div>
                </div>
              </aside>

              <article className="content-card history-detail-card">
                <div className="history-detail-copy">
                  <p className="history-detail-brand">{feedback.brandName}</p>
                  <h3 className="history-detail-title">{campaign.name}</h3>
                  <p className="history-detail-summary">{campaign.description}</p>
                </div>

                <div className="history-detail-meta">
                  <div className="history-detail-stat">
                    <span className="meta-label">Campaign Summary</span>
                    <span className="meta-value">{campaign.objective} for {campaign.platforms.join(', ')}</span>
                  </div>
                  <div className="history-detail-stat">
                    <span className="meta-label">Completion Date</span>
                    <span className="meta-value">{formatDate(feedback.completionDate)}</span>
                  </div>
                  <div className="history-detail-stat">
                    <span className="meta-label">Average Rating</span>
                    <span className="meta-value">{averageRating}/5</span>
                  </div>
                </div>

                <div className="history-review-list history-detail-reviews">
                  {feedback.reviews.map((review) => (
                    <section className="history-review-card" key={review.influencer}>
                      <div className="history-review-header">
                        <div>
                          <h4>{review.influencer}</h4>
                          <p>Completed collaboration</p>
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

                <div className="campaign-action-buttons history-action-buttons">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      navigate(`/influencer/campaign/${campaign.id}/message`, {
                        state: { returnTo: `/influencer/campaign/${campaign.id}/history` }
                      })
                    }
                  >
                    Message
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(`/influencer/campaign/${campaign.id}/propose`, {
                        state: { returnTo: `/influencer/campaign/${campaign.id}/history` }
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
              <section className="content-card influencer-feedback-overview">
                <div className="influencer-feedback-intro">
                  <p className="section-label">Profile Feedback</p>
                  <h3>How brands rate your collaborations</h3>
                  <p className="text-muted">
                    This page reflects feedback brands left about your communication, reliability, content quality, and delivery.
                  </p>
                </div>

                <div className="influencer-feedback-stats">
                  <div className="history-detail-stat">
                    <span className="meta-label">Average Rating</span>
                    <span className="meta-value">{influencerFeedbackSeed.averageRating}/5</span>
                  </div>
                  <div className="history-detail-stat">
                    <span className="meta-label">Completed Collaborations</span>
                    <span className="meta-value">{influencerFeedbackSeed.completedCollaborations}</span>
                  </div>
                  <div className="history-detail-stat">
                    <span className="meta-label">Repeat Brands</span>
                    <span className="meta-value">{influencerFeedbackSeed.repeatBrands}</span>
                  </div>
                </div>
              </section>

              <div className="history-review-list">
                {influencerFeedbackSeed.reviews.map((review) => (
                  <section className="history-review-card" key={`${review.brand}-${review.date}`}>
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
            </div>
          )}

        </section>
      </div>
    </main>
  );
}
