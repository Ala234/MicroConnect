import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import InfluencerTopNav from '../../components/influencer/InfluencerTopNav';
import { fetchCampaigns } from '../../data/mockCampaigns';
import { getCurrentUser, getProfileForUser, isInfluencerProfileComplete } from '../../data/influencerAccounts';
import '../../styles/influencer.css';

const getProfileImage = (profile = {}) =>
  profile.profileImage || profile.image || profile.avatar || profile.profileImageUrl || '';

const getProfileInitial = (name = '') =>
  (name.trim().charAt(0) || 'I').toUpperCase();

export default function AvailableCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const currentUser = getCurrentUser();
  const influencerProfile = getProfileForUser(currentUser);
  const profileComplete = isInfluencerProfileComplete(influencerProfile);
  const influencerName = influencerProfile.name || currentUser?.name || 'Influencer';
  const influencerImage = getProfileImage(influencerProfile);

  const [searchTerm, setSearchTerm] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [ageFilter, setAgeFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState({
    gender: [],
    interests: []
  });
  const [showAudienceDropdown, setShowAudienceDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!profileComplete) {
      navigate('/influencer/setup');
      return;
    }

    // Fetch campaigns from MongoDB backend
    const loadCampaigns = async () => {
      setIsLoading(true);
      try {
        const allCampaigns = await fetchCampaigns();
        // Filter out summer-collection (was a mock)
        setCampaigns(allCampaigns.filter((c) => c.id !== 'summer-collection'));
      } catch (err) {
        console.error('Failed to fetch campaigns:', err);
        setCampaigns([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCampaigns();
  }, [profileComplete, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAudienceDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = searchTerm === '' ||
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.brandName || campaign.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.objective || '').toLowerCase().includes(searchTerm.toLowerCase());

      const budget = parseInt(campaign.budget);
      const matchesBudget = budgetFilter === '' ||
        (budgetFilter === 'low' && budget < 1200) ||
        (budgetFilter === 'medium' && budget >= 1200 && budget < 2000) ||
        (budgetFilter === 'high' && budget >= 2000);

      const matchesAge = ageFilter === '' || (() => {
        const targetAudience = (campaign.targetAudience || '').toLowerCase();
        if (ageFilter === 'teens') return targetAudience.includes('13') || targetAudience.includes('teens') || targetAudience.includes('18-24');
        if (ageFilter === 'young-adults') return targetAudience.includes('20') || targetAudience.includes('25') || targetAudience.includes('20-29') || targetAudience.includes('18-40');
        if (ageFilter === 'adults') return targetAudience.includes('30') || targetAudience.includes('35') || targetAudience.includes('30+');
        return false;
      })();

      const matchesAudience = (audienceFilter.gender.length === 0 && audienceFilter.interests.length === 0) || (() => {
        const targetAudience = (campaign.targetAudience || '').toLowerCase();
        const contentType = (campaign.contentType || '').toLowerCase();
        const description = (campaign.description || '').toLowerCase();
        const objective = (campaign.objective || '').toLowerCase();

        const genderMatch = audienceFilter.gender.length === 0 || audienceFilter.gender.some(gender => {
          if (gender === 'female') return targetAudience.includes('women') || targetAudience.includes('female') || targetAudience.includes('girls');
          if (gender === 'male') return targetAudience.includes('men') || targetAudience.includes('male') || targetAudience.includes('boys');
          if (gender === 'mixed') return targetAudience.includes('men and women') || targetAudience.includes('adults') || targetAudience.includes('people') || (!targetAudience.includes('women only') && !targetAudience.includes('men only'));
          return false;
        });

        const interestsMatch = audienceFilter.interests.length === 0 || audienceFilter.interests.some(interest => {
          if (interest === 'fashion') return objective.includes('fashion') || contentType.includes('fashion') || description.includes('fashion') || targetAudience.includes('fashion');
          if (interest === 'beauty') return objective.includes('beauty') || contentType.includes('beauty') || description.includes('beauty') || targetAudience.includes('beauty') || contentType.includes('skincare');
          if (interest === 'fitness') return objective.includes('fitness') || contentType.includes('fitness') || description.includes('fitness');
          return false;
        });

        return genderMatch && interestsMatch;
      })();

      return matchesSearch && matchesBudget && matchesAge && matchesAudience;
    });
  }, [searchTerm, budgetFilter, ageFilter, audienceFilter, campaigns]);

  if (!profileComplete) {
    return null;
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

        <InfluencerTopNav active="campaigns" />

        <div className="topbar-actions">
          <button className="dashboard-logout" onClick={() => navigate('/login')}>Sign out</button>
        </div>
      </header>

      <section className="campaigns-dashboard-banner">
        <div className="campaigns-dashboard-avatar" aria-hidden="true">
          {influencerImage ? (
            <img src={influencerImage} alt="" />
          ) : (
            <span>{getProfileInitial(influencerName)}</span>
          )}
        </div>
        <div className="campaigns-dashboard-copy">
          <h1>Welcome, {influencerName}</h1>
          <p className="campaigns-dashboard-subtitle">
            Review open brand opportunities, filter campaigns quickly, and focus on partnerships that fit your audience best.
          </p>
        </div>
      </section>

      <section className="campaigns-section" id="campaigns">
        <div className="campaigns-header">
          <div>
            <p className="section-label">Available Campaigns</p>
            <h2>Choose your next brand collaboration</h2>
          </div>

          <div className="search-block">
            <input
              type="search"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)}>
              <option value="">All Budgets</option>
              <option value="low">Under $1,200</option>
              <option value="medium">$1,200 - $1,999</option>
              <option value="high">$2,000+</option>
            </select>
            <div className="filter-dropdown" ref={dropdownRef}>
              <button
                className="dropdown-toggle"
                onClick={() => setShowAudienceDropdown(!showAudienceDropdown)}
              >
                Audience {audienceFilter.gender.length > 0 || audienceFilter.interests.length > 0 ? `(${audienceFilter.gender.length + audienceFilter.interests.length})` : ''}
                <span className="dropdown-arrow">{showAudienceDropdown ? '▲' : '▼'}</span>
              </button>
              {showAudienceDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-section">
                    <h4>Gender</h4>
                    <div className="dropdown-options">
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={audienceFilter.gender.includes('female')}
                          onChange={(e) => {
                            const newGender = e.target.checked
                              ? [...audienceFilter.gender, 'female']
                              : audienceFilter.gender.filter(g => g !== 'female');
                            setAudienceFilter({...audienceFilter, gender: newGender});
                          }}
                        />
                        <span className="checkbox-label">Female</span>
                      </label>
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={audienceFilter.gender.includes('male')}
                          onChange={(e) => {
                            const newGender = e.target.checked
                              ? [...audienceFilter.gender, 'male']
                              : audienceFilter.gender.filter(g => g !== 'male');
                            setAudienceFilter({...audienceFilter, gender: newGender});
                          }}
                        />
                        <span className="checkbox-label">Male</span>
                      </label>
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={audienceFilter.gender.includes('mixed')}
                          onChange={(e) => {
                            const newGender = e.target.checked
                              ? [...audienceFilter.gender, 'mixed']
                              : audienceFilter.gender.filter(g => g !== 'mixed');
                            setAudienceFilter({...audienceFilter, gender: newGender});
                          }}
                        />
                        <span className="checkbox-label">Mixed</span>
                      </label>
                    </div>
                  </div>
                  <div className="dropdown-section">
                    <h4>Interests</h4>
                    <div className="dropdown-options">
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={audienceFilter.interests.includes('fashion')}
                          onChange={(e) => {
                            const newInterests = e.target.checked
                              ? [...audienceFilter.interests, 'fashion']
                              : audienceFilter.interests.filter(i => i !== 'fashion');
                            setAudienceFilter({...audienceFilter, interests: newInterests});
                          }}
                        />
                        <span className="checkbox-label">Fashion</span>
                      </label>
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={audienceFilter.interests.includes('beauty')}
                          onChange={(e) => {
                            const newInterests = e.target.checked
                              ? [...audienceFilter.interests, 'beauty']
                              : audienceFilter.interests.filter(i => i !== 'beauty');
                            setAudienceFilter({...audienceFilter, interests: newInterests});
                          }}
                        />
                        <span className="checkbox-label">Beauty</span>
                      </label>
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={audienceFilter.interests.includes('fitness')}
                          onChange={(e) => {
                            const newInterests = e.target.checked
                              ? [...audienceFilter.interests, 'fitness']
                              : audienceFilter.interests.filter(i => i !== 'fitness');
                            setAudienceFilter({...audienceFilter, interests: newInterests});
                          }}
                        />
                        <span className="checkbox-label">Fitness</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
              <option value="">All Ages</option>
              <option value="teens">Teens (13–19)</option>
              <option value="young-adults">Young Adults (20–29)</option>
              <option value="adults">Adults (30+)</option>
            </select>
          </div>

          {(searchTerm || budgetFilter || ageFilter || audienceFilter.gender.length > 0 || audienceFilter.interests.length > 0) && (
            <div className="filter-actions">
              <button
                className="btn btn-link"
                onClick={() => {
                  setSearchTerm('');
                  setBudgetFilter('');
                  setAgeFilter('');
                  setAudienceFilter({ gender: [], interests: [] });
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        <div className="campaign-grid">
          {isLoading ? (
            <div className="no-results">
              <h3>Loading campaigns...</h3>
              <p>Please wait while we fetch the latest opportunities.</p>
            </div>
          ) : filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => {
              const campaignBrandName = campaign.brandName || campaign.brand || 'Brand';

              return (
                <article className="campaign-card" key={campaign.id || campaign._id}>
                  <div className="campaign-card-media">
                    <img src={campaign.imageSrc} alt={campaign.name} />
                  </div>
                  <div className="campaign-content">
                    <div className="campaign-summary">
                      <div className="campaign-info-top">
                        <span className="campaign-objective-pill">{campaign.objective}</span>
                        <span className="campaign-budget">${campaign.budget}</span>
                      </div>
                      <h3>{campaign.name}</h3>
                      <p className="campaign-summary-meta">by {campaignBrandName}</p>
                      <p className="campaign-summary-text">{campaign.targetAudience}</p>
                      <p className="campaign-summary-meta">{(campaign.platforms || []).join(', ')} | {campaign.contentType}</p>
                    </div>
                    <div className="campaign-actions">
                      <button className="btn btn-secondary" onClick={() => navigate(`/influencer/campaign/${campaign.id || campaign._id}`)}>Details</button>
                      <button className="btn btn-outline" onClick={() => navigate(`/influencer/campaign/${campaign.id || campaign._id}/history`)}>
                        Campaign History
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="no-results">
              <h3>No campaigns found</h3>
              <p>Try adjusting your search criteria or filters to find more opportunities.</p>
            </div>
          )}
        </div>
      </section>
      </div>
    </main>
  );
}