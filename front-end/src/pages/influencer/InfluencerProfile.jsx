import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveCurrentInfluencerProfile } from '../../api/auth';
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
  { key: 'website', label: 'Website', inputType: 'url' }
];

const rateMeta = [
  { key: 'post', label: 'Instagram Post' },
  { key: 'story', label: 'Story' },
  { key: 'video', label: 'Video Content' }
];

const audienceMeta = [
  { key: 'age', label: 'Age Range' },
  { key: 'gender', label: 'Gender Split' },
  { key: 'location', label: 'Audience Location' }
];

const emptyText = 'Not set';

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

export default function InfluencerProfile() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const initialProfile = useMemo(
    () => normalizeInfluencerProfile(getProfileForUser(currentUser)),
    [currentUser]
  );
  const initialProfileComplete = useMemo(
    () => isInfluencerProfileComplete(initialProfile),
    [initialProfile]
  );
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(!initialProfileComplete);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'influencer') {
      navigate('/login');
      return;
    }

    if (!initialProfileComplete) {
      navigate('/influencer/setup');
    }
  }, [currentUser, initialProfileComplete, navigate]);

  const displayName = profile.name || 'Influencer Profile';
  const displayLocation = profile.location || emptyText;
  const displayBio = profile.bio || emptyText;

  const handleSave = async () => {
    const validation = validateInfluencerProfile(profile);
    if (!validation.isValid) {
      setSaveError('');
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
    setSaveError('');
    setIsSaving(true);

    try {
      const completedProfile = {
        ...profile,
        status: profile.status || 'active',
        isProfileComplete: true,
      };
      const backendProfile = await saveCurrentInfluencerProfile(completedProfile);
      const savedProfile = saveInfluencerProfile(backendProfile || completedProfile);
      setProfile(savedProfile);
      setIsEditing(false);
    } catch (error) {
      setSaveError(error.message || 'Profile could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSaveError('');
    setProfile((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setSaveError('');
    setProfile((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleCategoriesChange = (value) => {
    setSaveError('');
    setProfile((prev) => ({
      ...prev,
      categories: value
        .split(',')
        .map((category) => category.trim())
        .filter(Boolean)
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

  const renderEditableText = (field, inputType = 'text') => {
    if (isEditing) {
      return (
        <input
          type={inputType}
          value={profile[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={inputClass(field)}
          data-field={field}
        />
      );
    }

    return <p>{profile[field] || emptyText}</p>;
  };

  const renderAvatar = () => {
    return (
      <img
        src={profile.profileImage || createPlaceholderAvatar(profile.name)}
        alt={profile.name || 'Influencer profile'}
        className="profile-image"
      />
    );
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
              {renderAvatar()}
            </div>

            <div className="profile-info-main">
              <p className="profile-kicker">Influencer Profile</p>
              <h1 className="profile-name">{displayName}</h1>
              <p className="profile-location">{displayLocation}</p>
              <p className="profile-bio-preview">{displayBio}</p>

              <div className="profile-highlight-row">
                <div className="profile-highlight-pill">
                  <span className="profile-highlight-label">Followers</span>
                  <span className="profile-highlight-value">{profile.followers || emptyText}</span>
                </div>
                <div className="profile-highlight-pill">
                  <span className="profile-highlight-label">Engagement</span>
                  <span className="profile-highlight-value">{profile.engagement || emptyText}</span>
                </div>
                <div className="profile-highlight-pill">
                  <span className="profile-highlight-label">Audience</span>
                  <span className="profile-highlight-value">{profile.audience.location || emptyText}</span>
                </div>
              </div>

              <div className="profile-actions">
                <button className="btn btn-secondary" onClick={() => navigate('/influencer/applications')}>
                  My Applications
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/influencer/history')}>
                  Brand Feedback
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/influencer/disputes')}>
                  Disputes
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
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {errorFields.length > 0 && (
          <div className="form-error-summary" role="alert">
            <h3>Please fix the highlighted fields before continuing.</h3>
            <p>Invalid fields: {errorFields.map((field) => fieldLabels[field] || field).join(', ')}</p>
          </div>
        )}

        {saveError && (
          <div className="form-error-summary" role="alert">
            <h3>Profile could not be saved.</h3>
            <p>{saveError}</p>
          </div>
        )}

        <div className="profile-grid">
          <div className="profile-card">
            <h3>Basic Information</h3>
            <div className="form-group">
              <label>Profile Image</label>
              {isEditing ? (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                  />
                  <input
                    type="url"
                    value={profile.profileImage}
                    onChange={(e) => handleInputChange('profileImage', e.target.value)}
                    placeholder="Or paste an image URL"
                    data-field="profileImage"
                  />
                </>
              ) : (
                <p>{profile.profileImage ? 'Profile image saved' : emptyText}</p>
              )}
            </div>
            <div className="form-group">
              <label>Full Name</label>
              {renderEditableText('name')}
              {fieldError('name')}
            </div>
            <div className="form-group">
              <label>Email</label>
              {renderEditableText('email', 'email')}
              {fieldError('email')}
            </div>
            <div className="form-group">
              <label>Location</label>
              {renderEditableText('location')}
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
                    {isEditing ? (
                      <input
                        type={platform.inputType}
                        value={profile[platform.key]}
                        onChange={(e) => handleInputChange(platform.key, e.target.value)}
                        className={inputClass('social')}
                        data-field={platform.key}
                        aria-label={platform.label}
                      />
                    ) : (
                      <p>{profile[platform.key] || emptyText}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {fieldError('social')}
          </div>

          <div className="profile-card">
            <h3>Bio</h3>
            {isEditing ? (
              <textarea
                value={profile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={inputClass('bio')}
                data-field="bio"
                rows="4"
              />
            ) : (
              <p>{profile.bio || emptyText}</p>
            )}
            {fieldError('bio')}
          </div>

          <div className="profile-card">
            <h3>Categories</h3>
            {isEditing ? (
              <div className="form-group">
                <label>Categories</label>
                <input
                  type="text"
                  value={profile.categories.join(', ')}
                  onChange={(e) => handleCategoriesChange(e.target.value)}
                  placeholder="Fashion, Lifestyle, Beauty"
                  className={inputClass('categories')}
                  data-field="categories"
                />
                {fieldError('categories')}
              </div>
            ) : (
              <div className="categories-list">
                {profile.categories.length > 0 ? (
                  profile.categories.map((category, index) => (
                    <span key={index} className="category-tag">{category}</span>
                  ))
                ) : (
                  <p>{emptyText}</p>
                )}
              </div>
            )}
          </div>

          <div className="profile-card">
            <h3>Audience Statistics</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Followers</span>
                {isEditing ? (
                  <div className="field-control">
                    <input
                      type="text"
                      value={profile.followers}
                      onChange={(e) => handleInputChange('followers', e.target.value)}
                      className={inputClass('followers')}
                      data-field="followers"
                    />
                    {fieldError('followers')}
                  </div>
                ) : (
                  <span className="stat-value">{profile.followers || emptyText}</span>
                )}
              </div>
              <div className="stat-item">
                <span className="stat-label">Engagement Rate</span>
                {isEditing ? (
                  <div className="field-control">
                    <input
                      type="text"
                      value={profile.engagement}
                      onChange={(e) => handleInputChange('engagement', e.target.value)}
                      className={inputClass('engagement')}
                      data-field="engagement"
                    />
                    {fieldError('engagement')}
                  </div>
                ) : (
                  <span className="stat-value">{profile.engagement || emptyText}</span>
                )}
              </div>
              {audienceMeta.map((item) => (
                <div className="stat-item" key={item.key}>
                  <span className="stat-label">{item.label}</span>
                  {isEditing ? (
                    <div className="field-control">
                      <input
                        type="text"
                        value={profile.audience[item.key]}
                        onChange={(e) => handleNestedInputChange('audience', item.key, e.target.value)}
                        className={inputClass(`audience.${item.key}`)}
                        data-field={`audience.${item.key}`}
                      />
                      {fieldError(`audience.${item.key}`)}
                    </div>
                  ) : (
                    <span className="stat-value">{profile.audience[item.key] || emptyText}</span>
                  )}
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
                  {isEditing ? (
                    <div className="field-control">
                      <input
                        type="text"
                        value={profile.rates[rate.key]}
                        onChange={(e) => handleNestedInputChange('rates', rate.key, e.target.value)}
                        className={inputClass(`rates.${rate.key}`)}
                        data-field={`rates.${rate.key}`}
                      />
                      {fieldError(`rates.${rate.key}`)}
                    </div>
                  ) : (
                    <span>{profile.rates[rate.key] || emptyText}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
