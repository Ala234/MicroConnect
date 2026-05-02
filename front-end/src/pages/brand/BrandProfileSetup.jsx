import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../api/auth';
import '../../styles/influencer.css';

const platformMeta = [
  { key: 'instagram', label: 'Instagram', inputType: 'text' },
  { key: 'tiktok', label: 'TikTok', inputType: 'text' },
  { key: 'twitter', label: 'X (Twitter)', inputType: 'text' },
  { key: 'website', label: 'Website', inputType: 'url' },
];

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

export default function BrandProfileSetup() {
  const navigate = useNavigate();

  // Get current user from localStorage (set during login/register)
  const currentUser = useMemo(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }, []);

  const [profile, setProfile] = useState({
    companyName: currentUser?.name || '',
    email: currentUser?.email || '',
    industry: '',
    description: '',
    location: '',
    logo: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    website: '',
  });

  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'brand') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (field, value) => {
    setSaveError('');
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      handleInputChange('logo', reader.result || '');
    };
    reader.readAsDataURL(file);
  };

  const validateProfile = () => {
    const newErrors = {};
    if (!profile.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!profile.email.trim()) newErrors.email = 'Email is required';
    if (!profile.industry.trim()) newErrors.industry = 'Industry is required';
    if (!profile.description.trim()) newErrors.description = 'Description is required';
    if (!profile.location.trim()) newErrors.location = 'Location is required';

    const hasSocial =
      profile.instagram.trim() ||
      profile.tiktok.trim() ||
      profile.twitter.trim() ||
      profile.website.trim();
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
      // Save to localStorage temporarily (until brand API is ready)
      localStorage.setItem('brandProfile', JSON.stringify(profile));

      // TODO: Replace with API call when zainab's backend is ready
      // const data = await saveBrandProfile(profile);

      navigate('/brand');
    } catch (error) {
      setSaveError(error.message || 'Profile could not be saved.');
    } finally {
      setIsSaving(false);
    }
  };

  const fieldError = (field) =>
    errors[field] ? <p className="field-error">{errors[field]}</p> : null;

  const inputClass = (field) => (errors[field] ? 'input-error' : undefined);

  const errorFields = Object.keys(errors);
  const welcomeName = (currentUser?.name || profile.companyName || '').trim();

  return (
    <main className="influencer-page dashboard-page">
      <div className="dashboard-shell influencer-shell">
        <header className="influencer-topbar dashboard-topbar">
          <div className="brand-logo dashboard-logo">
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

        <section className="campaigns-dashboard-banner">
          <div className="campaigns-dashboard-copy">
            <h1>{welcomeName ? `Welcome, ${welcomeName}` : 'Welcome, brand'}</h1>
            <p className="campaigns-dashboard-subtitle">
              Complete your profile to start creating campaigns. Influencers use this information
              to learn about your brand and decide whether to collaborate with you.
            </p>
          </div>
        </section>

        <section className="campaigns-section">
          <div className="campaigns-header">
            <div>
              <p className="section-label">Profile Setup</p>
              <h2>Build your brand profile</h2>
            </div>
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save and Continue'}
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
            {/* Basic Information */}
            <div className="profile-card">
              <h3>Basic Information</h3>
              <div className="profile-avatar-large">
                <img
                  src={profile.logo || createPlaceholderLogo(profile.companyName)}
                  alt={profile.companyName || 'Brand logo'}
                  className="profile-image"
                />
              </div>

              <div className="form-group">
                <label>Brand Logo</label>
                <input type="file" accept="image/*" onChange={handleLogoUpload} />
                <input
                  type="url"
                  value={profile.logo}
                  onChange={(event) => handleInputChange('logo', event.target.value)}
                  placeholder="Or paste an image URL"
                  data-field="logo"
                />
              </div>

              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={profile.companyName}
                  onChange={(event) => handleInputChange('companyName', event.target.value)}
                  className={inputClass('companyName')}
                  data-field="companyName"
                />
                {fieldError('companyName')}
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
                  placeholder="e.g. Riyadh, Saudi Arabia"
                />
                {fieldError('location')}
              </div>
            </div>

            {/* Social Media */}
            <div className="profile-card">
              <h3>Social Media</h3>
              <div className="social-account-grid">
                {platformMeta.map((platform) => (
                  <div key={platform.key} className={`social-account-card ${platform.key}`}>
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

            {/* Industry */}
            <div className="profile-card">
              <h3>Industry</h3>
              <div className="form-group">
                <label>Your industry</label>
                <input
                  type="text"
                  value={profile.industry}
                  onChange={(event) => handleInputChange('industry', event.target.value)}
                  placeholder="e.g. Fashion, Beauty, Tech, Food"
                  className={inputClass('industry')}
                  data-field="industry"
                />
                {fieldError('industry')}
              </div>
            </div>

            {/* Description */}
            <div className="profile-card">
              <h3>Brand Description</h3>
              <textarea
                value={profile.description}
                onChange={(event) => handleInputChange('description', event.target.value)}
                className={inputClass('description')}
                data-field="description"
                rows="4"
                placeholder="Tell influencers about your brand, what you sell, and your values..."
              />
              {fieldError('description')}
            </div>
          </div>

          <div className="campaign-action-buttons">
            <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}