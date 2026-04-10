import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import saraProfileImage from '../../assets/images/SaraBlogs-Profile.jpg';
import SocialPlatformIcon from '../../components/influencer/SocialPlatformIcon';
import '../../styles/influencer.css';

const profileSeed = {
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  bio: 'Fashion and lifestyle content creator with 50K+ followers. Specializing in authentic reviews and trend analysis.',
  location: 'New York, USA',
  website: 'https://sarahjohnson.com',
  instagram: '@sarahjohnson',
  tiktok: '@sarahjohnson',
  youtube: 'Sarah Johnson',
  followers: '52.3K',
  engagement: '4.2%',
  categories: ['Fashion', 'Lifestyle', 'Beauty'],
  rates: {
    post: '$800-1200',
    story: '$300-500',
    video: '$1500-2500'
  },
  audience: {
    age: '18-34',
    gender: '65% Female',
    location: 'US, UK, Canada'
  }
};

const platformMeta = [
  { key: 'instagram', label: 'Instagram', inputType: 'text' },
  { key: 'tiktok', label: 'TikTok', inputType: 'text' },
  { key: 'youtube', label: 'YouTube', inputType: 'text' },
  { key: 'website', label: 'Website', inputType: 'url' }
];

export default function InfluencerProfile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(profileSeed);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value
    }));
  };

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
          <button className="active">Profile</button>
          <button onClick={() => navigate('/influencer/applications')}>Applications</button>
        </nav>

        <div className="topbar-actions">
          <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
        </div>
      </header>

      <section className="campaigns-section padded-top">
        <div className="profile-header-section">
          <div className="profile-image-section">
            <div className="profile-avatar-large">
              <img src={saraProfileImage} alt={profile.name} className="profile-image" />
            </div>

            <div className="profile-info-main">
              <p className="profile-kicker">Influencer Profile</p>
              <h1 className="profile-name">{profile.name}</h1>
              <p className="profile-location">{profile.location}</p>
              <p className="profile-bio-preview">{profile.bio}</p>

              <div className="profile-highlight-row">
                <div className="profile-highlight-pill">
                  <span className="profile-highlight-label">Followers</span>
                  <span className="profile-highlight-value">{profile.followers}</span>
                </div>
                <div className="profile-highlight-pill">
                  <span className="profile-highlight-label">Engagement</span>
                  <span className="profile-highlight-value">{profile.engagement}</span>
                </div>
                <div className="profile-highlight-pill">
                  <span className="profile-highlight-label">Audience</span>
                  <span className="profile-highlight-value">{profile.audience.location}</span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn btn-secondary" onClick={() => navigate('/influencer/applications')}>
                  My Applications
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/influencer/history')}>
                  Brand Feedback
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/influencer/complaints')}>
                  Complaints
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="campaigns-header">
          <div>
            <p className="section-label">Profile Details</p>
            <h2>Manage your influencer profile</h2>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              ) : (
                <p>{profile.name}</p>
              )}
            </div>
            <div className="form-group">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <p>{profile.email}</p>
              )}
            </div>
            <div className="form-group">
              <label>Location</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              ) : (
                <p>{profile.location}</p>
              )}
            </div>
          </div>

          <div className="profile-card">
            <h3>Social Media</h3>
            <div className="social-account-grid">
              {platformMeta.map((platform) => (
                <div key={platform.key} className={`social-account-card ${platform.key}`}>
                  <div className="social-account-icon" aria-hidden="true">
                    <SocialPlatformIcon platform={platform.key} />
                  </div>

                  <div className="social-account-content">
                    <span className="social-account-label">{platform.label}</span>
                    {isEditing ? (
                      <input
                        type={platform.inputType}
                        value={profile[platform.key]}
                        onChange={(e) => handleInputChange(platform.key, e.target.value)}
                        aria-label={platform.label}
                      />
                    ) : (
                      <p>{profile[platform.key]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <h3>Bio</h3>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows="4"
              />
            ) : (
              <p>{profile.bio}</p>
            )}
          </div>

          <div className="profile-card">
            <h3>Categories</h3>
            <div className="categories-list">
              {profile.categories.map((category, index) => (
                <span key={index} className="category-tag">{category}</span>
              ))}
            </div>
          </div>

          <div className="profile-card">
            <h3>Audience Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Followers</span>
                <span className="stat-value">{profile.followers}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Engagement Rate</span>
                <span className="stat-value">{profile.engagement}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Age Range</span>
                <span className="stat-value">{profile.audience.age}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Gender Split</span>
                <span className="stat-value">{profile.audience.gender}</span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3>Rates</h3>
            <div className="rates-list">
              <div className="rate-item">
                <span>Instagram Post</span>
                <span>{profile.rates.post}</span>
              </div>
              <div className="rate-item">
                <span>Story</span>
                <span>{profile.rates.story}</span>
              </div>
              <div className="rate-item">
                <span>Video Content</span>
                <span>{profile.rates.video}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
