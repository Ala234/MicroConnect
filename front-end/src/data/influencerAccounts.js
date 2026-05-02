import saraProfileImage from '../assets/images/SaraBlogs-Profile.jpg';
import miaProfileImage from '../assets/images/Lisa-Profile.jpg';

const PROFILE_STORAGE_KEY = 'influencerProfilesByEmail';
const ACCOUNT_STORAGE_KEY = 'influencerAccounts';
const APPLICATION_STORAGE_KEY = 'influencerApplicationsByEmail';

export const getInfluencerStorageKey = (user = getCurrentUser()) => {
  if (!user?.email) {
    return 'guest';
  }

  return normalizeEmail(user.email);
};

export const existingInfluencerProfiles = {
  sarah: {
    id: 'sarah',
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
      video: '$1500-2500',
    },
    audience: {
      age: '18-34',
      gender: '65% Female',
      location: 'US, UK, Canada',
    },
    profileImage: saraProfileImage,
    status: 'active',
    bioState: 'Approved',
    bioStatus: 'approved',
    isProfileComplete: true,
  },
  mia: {
    id: 'mia',
    name: 'Mia Carter',
    email: 'mia.carter@email.com',
    bio: 'Lifestyle and beauty creator known for polished reels, honest product reviews, and warm everyday storytelling.',
    location: 'Dubai, UAE',
    website: 'https://miacarter.co',
    instagram: '@miacarter',
    tiktok: '@miacarter',
    youtube: 'Mia Carter',
    followers: '41.8K',
    engagement: '5.1%',
    categories: ['Lifestyle', 'Beauty', 'Travel'],
    rates: {
      post: '$700-1000',
      story: '$250-450',
      video: '$1200-2100',
    },
    audience: {
      age: '20-32',
      gender: '58% Female',
      location: 'UAE, Saudi Arabia, UK',
    },
    profileImage: miaProfileImage,
    status: 'active',
    bioState: 'Approved',
    bioStatus: 'approved',
    isProfileComplete: true,
  },
};

const mockInfluencerAccounts = [
  {
    id: 'sarah',
    name: existingInfluencerProfiles.sarah.name,
    email: existingInfluencerProfiles.sarah.email,
    password: 'password123',
    role: 'influencer',
  },
  {
    id: 'mia',
    name: existingInfluencerProfiles.mia.name,
    email: existingInfluencerProfiles.mia.email,
    password: 'password123',
    role: 'influencer',
  },
];

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const readJson = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const rawValue = localStorage.getItem(key);
  if (!rawValue) {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(key, JSON.stringify(value));
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const followersPattern = /^\d+(\.\d+)?\s*[kKmM]?$/;
const engagementPattern = /^\d+(\.\d+)?\s*%$/;
const agePattern = /^\d{1,2}\s*(-\s*\d{1,2}|\+)$/;
const genderPattern = /^(female|male|mixed|\d+(\.\d+)?%\s*(female|male)|\d+(\.\d+)?%\s*(female|male)\s*\/\s*\d+(\.\d+)?%\s*(female|male))$/i;

const rateHasNumber = (value) => /\d/.test(String(value || ''));
const hasProfileCompleteFlag = (profile = {}) =>
  Object.prototype.hasOwnProperty.call(profile, 'isProfileComplete');

const applicationStatusTone = (status) => {
  if (status === 'Accepted') return 'accepted';
  if (status === 'Rejected') return 'rejected';
  if (status === 'Under Review') return 'review';
  return 'pending';
};

const defaultProfilesByEmail = () =>
  Object.values(existingInfluencerProfiles).reduce((profiles, profile) => {
    profiles[normalizeEmail(profile.email)] = profile;
    return profiles;
  }, {});

export const createEmptyInfluencerProfile = ({ name = '', email = '' } = {}) => ({
  name,
  email,
  bio: '',
  location: '',
  website: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  followers: '',
  engagement: '',
  categories: [],
  rates: {
    post: '',
    story: '',
    video: '',
  },
  audience: {
    age: '',
    gender: '',
    location: '',
  },
  profileImage: '',
  status: 'active',
  bioState: 'Approved',
  bioStatus: 'approved',
  isProfileComplete: false,
});

export const getInfluencerProfiles = () => ({
  ...defaultProfilesByEmail(),
  ...readJson(PROFILE_STORAGE_KEY, {}),
});

export const saveInfluencerProfile = (profile) => {
  const email = normalizeEmail(profile.email);
  if (!email) {
    return profile;
  }

  const profiles = getInfluencerProfiles();
  const nextProfile = normalizeInfluencerProfile(profile);
  profiles[email] = nextProfile;
  writeJson(PROFILE_STORAGE_KEY, profiles);

  const currentUser = getCurrentUser();
  if (typeof window !== 'undefined' && currentUser?.role === 'influencer') {
    const previousEmail = normalizeEmail(currentUser.email);
    const nextUser = {
      ...currentUser,
      name: nextProfile.name || currentUser.name,
      email: nextProfile.email || currentUser.email,
    };
    const accounts = readJson(ACCOUNT_STORAGE_KEY, {});

    if (accounts[previousEmail]) {
      accounts[email] = {
        ...accounts[previousEmail],
        ...nextUser,
      };
      writeJson(ACCOUNT_STORAGE_KEY, accounts);
    }

    localStorage.setItem('user', JSON.stringify(nextUser));
  }

  return nextProfile;
};

export const normalizeInfluencerProfile = (profile = {}) => ({
  ...createEmptyInfluencerProfile(),
  ...profile,
  categories: Array.isArray(profile.categories) ? profile.categories : [],
  rates: {
    post: '',
    story: '',
    video: '',
    ...(profile.rates || {}),
  },
  audience: {
    age: '',
    gender: '',
    location: '',
    ...(profile.audience || {}),
  },
  bioState: profile.bioState === 'Flagged' || profile.bioStatus === 'flagged' ? 'Flagged' : 'Approved',
  bioStatus: profile.bioState === 'Flagged' || profile.bioStatus === 'flagged' ? 'flagged' : 'approved',
  isProfileComplete: hasProfileCompleteFlag(profile) ? profile.isProfileComplete === true : undefined,
});

export const validateInfluencerProfile = (profile) => {
  const currentProfile = normalizeInfluencerProfile(profile);
  const errors = {};
  const addError = (field, message) => {
    errors[field] = message;
  };
  const hasSocialOrWebsite = [
    currentProfile.website,
    currentProfile.instagram,
    currentProfile.tiktok,
    currentProfile.youtube,
  ].some((value) => String(value || '').trim());

  const name = String(currentProfile.name || '').trim();
  const email = String(currentProfile.email || '').trim();
  const bio = String(currentProfile.bio || '').trim();
  const location = String(currentProfile.location || '').trim();
  const followers = String(currentProfile.followers || '').trim();
  const engagement = String(currentProfile.engagement || '').trim();
  const audienceAge = String(currentProfile.audience.age || '').trim();
  const audienceGender = String(currentProfile.audience.gender || '').trim();
  const audienceLocation = String(currentProfile.audience.location || '').trim();

  if (!name) {
    addError('name', 'This field is required.');
  } else if (name.length < 2) {
    addError('name', 'Full name must be at least 2 characters.');
  }

  if (!email) {
    addError('email', 'This field is required.');
  } else if (!emailPattern.test(email)) {
    addError('email', 'Enter a valid email address.');
  }

  if (!bio) {
    addError('bio', 'This field is required.');
  } else if (bio.length < 20) {
    addError('bio', 'Bio must be at least 20 characters.');
  }

  if (!location) {
    addError('location', 'This field is required.');
  }

  if (!hasSocialOrWebsite) {
    addError('social', 'Add at least one website or social account.');
  }

  if (!followers) {
    addError('followers', 'This field is required.');
  } else if (!followersPattern.test(followers)) {
    addError('followers', 'Followers must be a number, like 33000 or 33K.');
  }

  if (!engagement) {
    addError('engagement', 'This field is required.');
  } else if (!engagementPattern.test(engagement)) {
    addError('engagement', 'Engagement rate must include %, like 4.2%.');
  }

  if (!currentProfile.categories.length) {
    addError('categories', 'This field is required.');
  }

  ['post', 'story', 'video'].forEach((rateKey) => {
    const rate = String(currentProfile.rates[rateKey] || '').trim();
    if (!rate) {
      addError(`rates.${rateKey}`, 'This field is required.');
    } else if (!rateHasNumber(rate)) {
      addError(`rates.${rateKey}`, 'Rate must include a number, like 800 or $800-1200.');
    }
  });

  if (!audienceAge) {
    addError('audience.age', 'This field is required.');
  } else if (!agePattern.test(audienceAge)) {
    addError('audience.age', 'Age range must look like 18-34 or 30+.');
  }

  if (!audienceGender) {
    addError('audience.gender', 'This field is required.');
  } else if (!genderPattern.test(audienceGender)) {
    addError('audience.gender', 'Gender split must be Female, Male, Mixed, or a valid split like 65% Female.');
  }

  if (!audienceLocation) {
    addError('audience.location', 'This field is required.');
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const isInfluencerProfileComplete = (profile) => {
  const currentProfile = normalizeInfluencerProfile(profile);
  return currentProfile.isProfileComplete !== false && validateInfluencerProfile(currentProfile).isValid;
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawUser = localStorage.getItem('user');
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const getProfileForUser = (user = getCurrentUser()) => {
  if (!user || user.role !== 'influencer') {
    return createEmptyInfluencerProfile();
  }

  const profiles = getInfluencerProfiles();
  const email = normalizeEmail(user.email);
  const profile = profiles[email] || createEmptyInfluencerProfile({
    name: user.name || '',
    email: user.email || '',
  });

  return normalizeInfluencerProfile(profile);
};

const defaultApplicationsByEmail = () => ({
  [normalizeEmail(existingInfluencerProfiles.sarah.email)]: [
    {
      id: 'sarah-spring-collection',
      influencer: normalizeEmail(existingInfluencerProfiles.sarah.email),
      campaign: 'spring-collection',
      campaignId: 'spring-collection',
      campaignName: 'Spring Collection',
      brandName: 'Fashion Forward',
      status: 'Under Review',
      statusTone: 'review',
      appliedDate: '2026-03-15',
      proposal:
        'Excited to collaborate on this spring fashion campaign. My audience responds well to seasonal styling content and product discovery posts.',
      brandResponse: '',
    },
    {
      id: 'sarah-winter-collection',
      influencer: normalizeEmail(existingInfluencerProfiles.sarah.email),
      campaign: 'winter-collection',
      campaignId: 'winter-collection',
      campaignName: 'Winter Collection',
      brandName: 'North Thread',
      status: 'Accepted',
      statusTone: 'accepted',
      appliedDate: '2026-03-10',
      proposal:
        'Perfect fit for my lifestyle content. I can build cozy seasonal looks and short-form videos that show the collection naturally.',
      brandResponse:
        'We love your content style and audience match. Let us schedule a call to confirm deliverables and timeline.',
    },
    {
      id: 'sarah-skin-care-collection',
      influencer: normalizeEmail(existingInfluencerProfiles.sarah.email),
      campaign: 'skin-care-collection',
      campaignId: 'skin-care-collection',
      campaignName: 'Skin Care Collection',
      brandName: 'Pure Beauty',
      status: 'Pending',
      statusTone: 'pending',
      appliedDate: '2026-03-21',
      proposal:
        'My audience engages strongly with beauty routines and educational reviews. I would position this launch through a clear, trust-based skincare story.',
      brandResponse: '',
    },
  ],
});

const normalizeApplication = (application = {}) => {
  const campaignId = application.campaignId || application.campaign || '';
  const status = application.status || 'Pending';

  return {
    id: application.id || `application-${Date.now()}`,
    influencer: application.influencer || '',
    campaign: application.campaign || campaignId,
    campaignId,
    campaignName: application.campaignName || '',
    brandName: application.brandName || '',
    proposal: application.proposal || '',
    status,
    statusTone: application.statusTone || applicationStatusTone(status),
    appliedDate: application.appliedDate || new Date().toISOString().slice(0, 10),
    brandResponse: application.brandResponse || '',
  };
};

const getApplicationsByEmail = () => ({
  ...defaultApplicationsByEmail(),
  ...readJson(APPLICATION_STORAGE_KEY, {}),
});

export const getInfluencerApplications = (user = getCurrentUser()) => {
  const influencerKey = getInfluencerStorageKey(user);
  if (!influencerKey || influencerKey === 'guest') {
    return [];
  }

  return (getApplicationsByEmail()[influencerKey] || []).map(normalizeApplication);
};

export const saveInfluencerApplication = (application, user = getCurrentUser()) => {
  const influencerKey = getInfluencerStorageKey(user);
  if (!influencerKey || influencerKey === 'guest') {
    return null;
  }

  const storedApplications = readJson(APPLICATION_STORAGE_KEY, {});
  const existingApplications = storedApplications[influencerKey] || getInfluencerApplications(user);
  const nextApplication = normalizeApplication({
    ...application,
    id: application.id || `application-${Date.now()}`,
    influencer: influencerKey,
  });

  storedApplications[influencerKey] = [
    nextApplication,
    ...existingApplications.filter((item) => item.id !== nextApplication.id),
  ];
  writeJson(APPLICATION_STORAGE_KEY, storedApplications);

  return nextApplication;
};

export const getMockInfluencerAccountByCredentials = ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const storedAccounts = Object.values(readJson(ACCOUNT_STORAGE_KEY, {}));
  const accounts = [...mockInfluencerAccounts, ...storedAccounts];

  return accounts.find(
    (account) =>
      normalizeEmail(account.email) === normalizedEmail &&
      account.password === password &&
      account.role === 'influencer'
  ) || null;
};

const getInfluencerAccountByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);
  const storedAccounts = Object.values(readJson(ACCOUNT_STORAGE_KEY, {}));
  const accounts = [...mockInfluencerAccounts, ...storedAccounts];

  return accounts.find(
    (account) =>
      normalizeEmail(account.email) === normalizedEmail &&
      account.role === 'influencer'
  ) || null;
};

export const registerInfluencerAccount = ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const existingAccount = getInfluencerAccountByEmail(email);
  const profiles = getInfluencerProfiles();

  if (existingAccount || profiles[normalizedEmail]) {
    throw new Error('User already exists');
  }

  const accounts = readJson(ACCOUNT_STORAGE_KEY, {});
  const user = {
    id: `local-influencer-${Date.now()}`,
    name,
    email,
    role: 'influencer',
  };

  accounts[normalizedEmail] = {
    ...user,
    password,
  };
  writeJson(ACCOUNT_STORAGE_KEY, accounts);

  saveInfluencerProfile(createEmptyInfluencerProfile({ name, email }));

  return {
    token: `mock-token-${user.id}`,
    user,
  };
};

export const toAuthResponse = (account) => {
  const user = {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
  };

  return {
    message: 'Login successful',
    token: `mock-token-${account.id}`,
    user,
  };
};
