import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SocialPlatformIcon from '../../components/influencer/SocialPlatformIcon';
import {
  getCurrentUser,
  getProfileForUser,
  isInfluencerProfileComplete,
  normalizeInfluencerProfile,
  saveInfluencerProfile,
  validateInfluencerProfile,
} from '../../data/influencerAccounts';
import '../../styles/influencer.css';

const platformMeta = [
  { key: 'instagram', label: 'Instagram', inputType: 'text' },
  { key: 'tiktok', label: 'TikTok', inputType: 'text' },
  { key: 'youtube', label: 'YouTube', inputType: 'text' },
  { key: 'website', label: 'Website', inputType: 'url' },
];

const rateMeta = [
  { key: 'post', label: 'Instagram Post' },
  { key: 'story', label: 'Story' },
  { key: 'video', label: 'Video Content' },
];

const audienceMeta = [
  { key: 'age', label: 'Age Range' },
  { key: 'gender', label: 'Gender Split' },
  { key: 'location', label: 'Audience Location' },
];

const fieldLabels = {
  name: 'Full Name',
  email: 'Email',
  bio: 'Bio',
  location: 'Location',
  social: 'Website or Social Account',
  followers: 'Followers',
  engagement: 'Engagement Rate',
  categories: 'Categories',
  'rates.post': 'Instagram Post Rate',
  'rates.story': 'Story Rate',
  'rates.video': 'Video Content Rate',
  'audience.age': 'Age Range',
  'audience.gender': 'Gender Split',
  'audience.location': 'Audience Location',
};

const focusFieldMap = {
  social: 'website',
};

const createPlaceholderAvatar = (name) => {
  const initial = (name || 'I').charAt(0).toUpperCase().replace(/[^A-Z0-9]/, 'I');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#1f2640"/><circle cx="150" cy="118" r="54" fill="#8fb0ff"/><path d="M66 262c12-54 45-82 84-82s72 28 84 82" fill="#8fb0ff"/><text x="150" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#1f2640">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export default function InfluencerSetup() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const initialProfile = useMemo(
    () => normalizeInfluencerProfile(getProfileForUser(currentUser)),
    [currentUser]
  );
  const [profile, setProfile] = useState(initialProfile);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'influencer') {
      navigate('/login');
      return;
    }

    if (isInfluencerProfileComplete(initialProfile)) {
      navigate('/influencer');
    }
  }, [currentUser, initialProfile, navigate]);

  const handleInputChange = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setProfile((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const handleCategoriesChange = (value) => {
    setProfile((current) => ({
      ...current,
      categories: value
        .split(',')
        .map((category) => category.trim())
        .filter(Boolean),
    }));
  };

  const handleProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleInputChange('profileImage', reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const validation = validateInfluencerProfile(profile);

    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstField = Object.keys(validation.errors)[0];
      const targetField = focusFieldMap[firstField] || firstField;

      requestAnimationFrame(() => {
        const target = document.querySelector(`[data-field="${targetField}"]`);
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target?.focus?.();
      });
      return;
    }

    setErrors({});
    saveInfluencerProfile(profile);
    navigate('/influencer');
  };

  const fieldError = (field) =>
    errors[field] ? <p className="field-error">{errors[field]}</p> : null;

  const inputClass = (field) => (errors[field] ? 'input-error' : undefined);

  const errorFields = Object.keys(errors);

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

          <div className="topbar-actions">
            <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
          </div>
        </header>

        <section className="campaigns-dashboard-banner">
          <div className="campaigns-dashboard-copy">
            <h1>Welcome, new influencer</h1>
            <p className="campaigns-dashboard-subtitle">
              Complete your profile to start applying for campaigns. Brands use this information to understand your audience, platforms, and collaboration rates.
            </p>
          </div>
        </section>

        <section className="campaigns-section">
          <div className="campaigns-header">
            <div>
              <p className="section-label">Profile Setup</p>
              <h2>Build your influencer profile</h2>
            </div>
            <button className="btn btn-primary" onClick={handleSave}>
              Save and Continue
            </button>
          </div>

          {errorFields.length > 0 && (
            <div className="form-error-summary" role="alert">
              <h3>Please fix the highlighted fields before continuing.</h3>
              <p>Invalid fields: {errorFields.map((field) => fieldLabels[field] || field).join(', ')}</p>
            </div>
          )}

          <div className="profile-grid">
            <div className="profile-card">
              <h3>Basic Information</h3>
              <div className="profile-avatar-large">
                <img
                  src={profile.profileImage || createPlaceholderAvatar(profile.name)}
                  alt={profile.name || 'Influencer profile'}
                  className="profile-image"
                />
              </div>

              <div className="form-group">
                <label>Profile Image</label>
                <input type="file" accept="image/*" onChange={handleProfileImageUpload} />
                <input
                  type="url"
                  value={profile.profileImage}
                  onChange={(event) => handleInputChange('profileImage', event.target.value)}
                  placeholder="Or paste an image URL"
                  data-field="profileImage"
                />
              </div>

              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(event) => handleInputChange('name', event.target.value)}
                  className={inputClass('name')}
                  data-field="name"
                />
                {fieldError('name')}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(event) => handleInputChange('email', event.target.value)}
                  className={inputClass('email')}
                  data-field="email"
                />
                {fieldError('email')}
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(event) => handleInputChange('location', event.target.value)}
                  className={inputClass('location')}
                  data-field="location"
                />
                {fieldError('location')}
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
                      <input
                        type={platform.inputType}
                        value={profile[platform.key]}
                        onChange={(event) => handleInputChange(platform.key, event.target.value)}
                        className={inputClass('social')}
                        data-field={platform.key}
                        aria-label={platform.label}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {fieldError('social')}
            </div>

            <div className="profile-card">
              <h3>Bio</h3>
              <textarea
                value={profile.bio}
                onChange={(event) => handleInputChange('bio', event.target.value)}
                className={inputClass('bio')}
                data-field="bio"
                rows="4"
              />
              {fieldError('bio')}
            </div>

            <div className="profile-card">
              <h3>Categories</h3>
              <div className="form-group">
                <label>Categories</label>
                <input
                  type="text"
                  value={profile.categories.join(', ')}
                  onChange={(event) => handleCategoriesChange(event.target.value)}
                  placeholder="Fashion, Lifestyle, Beauty"
                  className={inputClass('categories')}
                  data-field="categories"
                />
                {fieldError('categories')}
              </div>
            </div>

            <div className="profile-card">
              <h3>Audience Statistics</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Followers</span>
                  <div className="field-control">
                    <input
                      type="text"
                      value={profile.followers}
                      onChange={(event) => handleInputChange('followers', event.target.value)}
                      placeholder="52.3K"
                      className={inputClass('followers')}
                      data-field="followers"
                    />
                    {fieldError('followers')}
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Engagement Rate</span>
                  <div className="field-control">
                    <input
                      type="text"
                      value={profile.engagement}
                      onChange={(event) => handleInputChange('engagement', event.target.value)}
                      placeholder="4.2%"
                      className={inputClass('engagement')}
                      data-field="engagement"
                    />
                    {fieldError('engagement')}
                  </div>
                </div>
                {audienceMeta.map((item) => (
                  <div className="stat-item" key={item.key}>
                    <span className="stat-label">{item.label}</span>
                    <div className="field-control">
                      <input
                        type="text"
                        value={profile.audience[item.key]}
                        onChange={(event) => handleNestedInputChange('audience', item.key, event.target.value)}
                        className={inputClass(`audience.${item.key}`)}
                        data-field={`audience.${item.key}`}
                      />
                      {fieldError(`audience.${item.key}`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="profile-card">
              <h3>Rates</h3>
              <div className="rates-list">
                {rateMeta.map((rate) => (
                  <div className="rate-item" key={rate.key}>
                    <span>{rate.label}</span>
                    <div className="field-control">
                      <input
                        type="text"
                        value={profile.rates[rate.key]}
                        onChange={(event) => handleNestedInputChange('rates', rate.key, event.target.value)}
                        placeholder="$800-1200"
                        className={inputClass(`rates.${rate.key}`)}
                        data-field={`rates.${rate.key}`}
                      />
                      {fieldError(`rates.${rate.key}`)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="campaign-action-buttons">
            <button className="btn btn-primary" onClick={handleSave}>
              Save and Continue
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
