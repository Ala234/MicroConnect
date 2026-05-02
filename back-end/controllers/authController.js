const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Influencer = require('../models/Influencer');

// Helper: Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createInitialInfluencerProfile = async (user) => {
  return Influencer.create({
    userId: user._id,
    name: user.name,
    email: user.email,
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
    isProfileComplete: false,
    bioState: 'Approved',
    bioStatus: 'approved',
  });
};

const DEMO_INFLUENCER_PASSWORD = 'password123';

const demoInfluencerProfiles = {
  'sarah.johnson@email.com': {
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
  },
  'mia.carter@email.com': {
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
  },
  'jason.creator@email.com': {
    name: 'Jason Lee',
    email: 'jason.creator@email.com',
    bio: 'Fitness and tech lifestyle creator producing practical product reviews, short-form tutorials, and energetic campaign content.',
    location: 'Riyadh, Saudi Arabia',
    website: 'https://jasoncreator.com',
    instagram: '@jasoncreator',
    tiktok: '@jasoncreator',
    youtube: 'Jason Creator',
    followers: '48.6K',
    engagement: '4.8%',
    categories: ['Fitness', 'Tech', 'Lifestyle'],
    rates: {
      post: '$750-1100',
      story: '$250-450',
      video: '$1300-2200',
    },
    audience: {
      age: '18-34',
      gender: 'Mixed',
      location: 'Saudi Arabia, UAE, UK',
    },
  },
};

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const hasValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && value !== '';
};

const fillMissingInfluencerProfileFields = (influencer, demoProfile) => {
  [
    'name',
    'email',
    'bio',
    'location',
    'website',
    'instagram',
    'tiktok',
    'youtube',
    'followers',
    'engagement',
  ].forEach((field) => {
    if (!hasValue(influencer[field])) {
      influencer[field] = demoProfile[field];
    }
  });

  if (!Array.isArray(influencer.categories) || influencer.categories.length === 0) {
    influencer.categories = demoProfile.categories;
  }

  influencer.rates = influencer.rates || {};
  ['post', 'story', 'video'].forEach((field) => {
    if (!hasValue(influencer.rates[field])) {
      influencer.rates[field] = demoProfile.rates[field];
    }
  });

  influencer.audience = influencer.audience || {};
  ['age', 'gender', 'location'].forEach((field) => {
    if (!hasValue(influencer.audience[field])) {
      influencer.audience[field] = demoProfile.audience[field];
    }
  });

  influencer.status = influencer.status || 'active';
  influencer.isProfileComplete = true;
  influencer.bioState = influencer.bioState || 'Approved';
  influencer.bioStatus = influencer.bioStatus || (influencer.bioState === 'Flagged' ? 'flagged' : 'approved');
};

const ensureDemoInfluencerAccount = async (email) => {
  const demoProfile = demoInfluencerProfiles[normalizeEmail(email)];
  if (!demoProfile) {
    return null;
  }

  let user = await User.findOne({ email: demoProfile.email });
  if (!user) {
    user = await User.create({
      name: demoProfile.name,
      email: demoProfile.email,
      password: await User.hashPassword(DEMO_INFLUENCER_PASSWORD),
      role: 'influencer',
      isActive: true,
    });
  } else {
    let userChanged = false;
    const hasDemoPassword = await user.comparePassword(DEMO_INFLUENCER_PASSWORD);

    if (!hasDemoPassword) {
      user.password = await User.hashPassword(DEMO_INFLUENCER_PASSWORD);
      userChanged = true;
    }

    if (user.role !== 'influencer') {
      user.role = 'influencer';
      userChanged = true;
    }

    if (!user.isActive) {
      user.isActive = true;
      userChanged = true;
    }

    if (!user.name) {
      user.name = demoProfile.name;
      userChanged = true;
    }

    if (userChanged) {
      await user.save();
    }
  }

  let influencer = await Influencer.findOne({ email: demoProfile.email });
  if (!influencer) {
    influencer = await Influencer.findOne({ userId: user._id });
  }

  if (!influencer) {
    influencer = new Influencer({
      userId: user._id,
      ...demoProfile,
      profileImage: '',
      status: 'active',
      isProfileComplete: true,
      bioState: 'Approved',
      bioStatus: 'approved',
    });
  } else {
    influencer.userId = user._id;
    fillMissingInfluencerProfileFields(influencer, demoProfile);
  }

  await influencer.save();
  return user;
};

// @desc    Register new user (brand or influencer only)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('Request received:', req.body);

    const { name, email, password, role } = req.body;

    // Validate role - only brand or influencer allowed at registration
    if (!role || !['brand', 'influencer'].includes(role)) {
      return res.status(400).json({
        message: 'Role must be either "brand" or "influencer"',
      });
    }
    console.log('Role validated');

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    console.log('Email is unique');

    // Hash password manually
    const hashedPassword = await User.hashPassword(password);
    console.log('Password hashed');

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });
    console.log(' User created:', user._id);

    let influencerProfile = null;
    if (role === 'influencer') {
      influencerProfile = await createInitialInfluencerProfile(user);
      console.log('Influencer profile created:', influencerProfile._id);
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('Token generated');

    res.status(201).json({
      message:'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      influencerProfile,
    });
  } catch (error) {
    console.log(' ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password' });
    }

    const isDemoInfluencerLogin =
      password === DEMO_INFLUENCER_PASSWORD &&
      Boolean(demoInfluencerProfiles[normalizeEmail(email)]);

    const user = isDemoInfluencerLogin
      ? await ensureDemoInfluencerAccount(email)
      : await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
