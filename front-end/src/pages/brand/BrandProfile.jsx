import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/influencer.css';

const platformMeta = [
  { key: 'instagram', label: 'Instagram', inputType: 'text' },
  { key: 'tiktok', label: 'TikTok', inputType: 'text' },
  { key: 'twitter', label: 'X (Twitter)', inputType: 'text' },
  { key: 'website', label: 'Website', inputType: 'url' },
];

const emptyText = 'Not set';

const fieldLabels = {
  companyName: 'Company Name',
  email: 'Email',
  industry: 'Industry',
  description: 'Description',
  location: 'Location',
  social: 'Website or Social Account',
};

const createPlaceholderLogo = (name) => {
  const initial = (name || 'B').charAt(0).toUpperCase().replace(/[^A-Z0-9]/, 'B');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#1f2640"/><circle cx="150" cy="150" r="90" fill="#8fb0ff"/><text x="150" y="170" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" font-weight="700" fill="#1f2640">${initial}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const defaultProfile = {
  companyName: '',
  email: '',
  industry: '',
  description: '',
  location: '',
  logo: '',
  instagram: '',
  tiktok: '',
  twitter: '',
  website: '',
};

export default function BrandProfile() {
  const navigate = useNavigate();

  const currentUser = useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }, []);

  const initialProfile = useMemo(() => {
    const stored = localStorage.getItem('brandProfile');
    if (stored) return { ...defaultProfile, ...JSON.parse(stored) };
    return {
      ...defaultProfile,
      companyName: currentUser?.name || '',
      email: currentUser?.email || '',
    };
  }, [currentUser]);

  const isProfileComplete = !!(
    initialProfile.companyName &&
    initialProfile.email &&
    initialProfile.industry &&
    initialProfile.description &&
    initialProfile.location
  );

  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(!isProfileComplete);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'brand') {
      navigate('/login');
      return;
    }

    if (!isProfileComplete) {
      navigate('/brand/setup');
    }
  }, [currentUser, isProfileComplete, navigate]);

  const validateProfile = () => {
    const newErrors = {};
    if (!profile.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!profile.email.trim()) newErrors.email = 'Email is required';
    if (!profile.industry.trim()) newErrors.industry = 'Industry is required';
    if (!profile.description.trim()) newErrors.description = 'Description is required';
    if (!profile.location.trim()) newErrors.location = 'Location is required';

    const hasSocial =
      profile.instagram?.trim() ||
      profile.tiktok?.trim() ||
      profile.twitter?.trim() ||
      profile.website?.trim();
    if (!hasSocial) newErrors.social = 'Please provide at least one social account or website';

    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSave = async () => {
    const validation = validateProfile();
    if (!validation.isValid) {
      setSaveError('');
      setErrors(validation.errors);
      const firstField = Object.keys(validation.errors)[0];

      requestAnimationFrame(() => {
        const target = document.querySelector(`[data-field="${firstField}"]`);
        target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target?.focus?.();
      });
      return;
    }

    setErrors({});
    setSaveError('');
    setIsSaving(true);

    try {
      localStorage.setItem('brandProfile', JSON.stringify(profile));
      setIsEditing(false);
    } catch (error) {
      setSaveError(error.message || 'Profile could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSaveError('');
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => handleInputChange('logo', reader.result || '');
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

  const renderLogo = () => (
    <img
      src={profile.logo || createPlaceholderLogo(profile.companyName)}
      alt={profile.companyName || 'Brand logo'}
      className="profile-image"
    />
  );

  const fieldError = (field) =>
    errors[field] ? <p className="field-error">{errors[field]}</p> : null;

  const inputClass = (field) => (errors[field] ? 'input-error' : undefined);

  const errorFields = Object.keys(errors);

  const displayName = profile.companyName || 'Brand Profile';
  const displayLocation = profile.location || emptyText;
  const displayDescription = profile.description || emptyText;

  return (
    <main className="influencer-page dashboard-page">
      <div className="dashboard-shell influencer-shell">
        <header className="influencer-topbar dashboard-topbar">
          <div className="brand-logo dashboard-logo">
         <button
        className="back-btn"
        onClick={() => {
         console.log('Back clicked!');
            navigate(-1);
         }}
             aria-label="Back"
            type="button"
            >
  ←
</button>
            <span className="brand-mark dashboard-logo-icon">M</span>
            <div>
              <p className="brand-name">MicroConnect</p>
              <p className="brand-subtitle">Brand Portal</p>
            </div>
          </div>

          <div className="topbar-actions">
            <button className="dashboard-logout" onClick={() => navigate('/login')}>
              Sign out
            </button>
          </div>
        </header>

        <section className="campaigns-section padded-top">
          <div className="profile-header-section">
            <div className="profile-image-section">
              <div className="profile-avatar-large">{renderLogo()}</div>

              <div className="profile-info-main">
                <p className="profile-kicker">Brand Profile</p>
                <h1 className="profile-name">{displayName}</h1>
                <p className="profile-location">{displayLocation}</p>
                <p className="profile-bio-preview">{displayDescription}</p>

                <div className="profile-highlight-row">
                  <div className="profile-highlight-pill">
                    <span className="profile-highlight-label">Industry</span>
                    <span className="profile-highlight-value">{profile.industry || emptyText}</span>
                  </div>
                  <div className="profile-highlight-pill">
                    <span className="profile-highlight-label">Website</span>
                    <span className="profile-highlight-value">{profile.website || emptyText}</span>
                  </div>
                  <div className="profile-highlight-pill">
                    <span className="profile-highlight-label">Location</span>
                    <span className="profile-highlight-value">{profile.location || emptyText}</span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="btn btn-secondary" onClick={() => navigate('/brand')}>
                    My Campaigns
                  </button>
                  <button className="btn btn-outline" onClick={() => navigate('/brand/contracts')}>
                    Contracts
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="campaigns-header">
            <div>
              <p className="section-label">Profile Details</p>
              <h2>Manage your brand profile</h2>
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
              <p>
                Invalid fields:{' '}
                {errorFields.map((field) => fieldLabels[field] || field).join(', ')}
              </p>
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
                <label>Brand Logo</label>
                {isEditing ? (
                  <>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} />
                    <input
                      type="url"
                      value={profile.logo}
                      onChange={(e) => handleInputChange('logo', e.target.value)}
                      placeholder="Or paste an image URL"
                      data-field="logo"
                    />
                  </>
                ) : (
                  <p>{profile.logo ? 'Logo saved' : emptyText}</p>
                )}
              </div>
              <div className="form-group">
                <label>Company Name</label>
                {renderEditableText('companyName')}
                {fieldError('companyName')}
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
              <h3>Industry</h3>
              {isEditing ? (
                <div className="form-group">
                  <label>Your industry</label>
                  <input
                    type="text"
                    value={profile.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    placeholder="e.g. Fashion, Beauty, Tech, Food"
                    className={inputClass('industry')}
                    data-field="industry"
                  />
                  {fieldError('industry')}
                </div>
              ) : (
                <p>{profile.industry || emptyText}</p>
              )}
            </div>

            <div className="profile-card">
              <h3>Brand Description</h3>
              {isEditing ? (
                <textarea
                  value={profile.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={inputClass('description')}
                  data-field="description"
                  rows="4"
                  placeholder="Tell influencers about your brand..."
                />
              ) : (
                <p>{profile.description || emptyText}</p>
              )}
              {fieldError('description')}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}