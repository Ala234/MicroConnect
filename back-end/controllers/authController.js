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

    const user = await User.findOne({ email });
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
