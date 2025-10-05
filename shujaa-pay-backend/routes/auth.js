// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables from .env
dotenv.config();

const router = express.Router();

/* =========================
   Config / Helpers
   ========================= */
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

/** Generate short-lived access token */
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES_IN }
  );
}

/** Generate long-lived refresh token */
function generateRefreshToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES_IN }
  );
}

/** Hash refresh token before storing in DB */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Set refresh token cookie (HTTPOnly) */
function setRefreshCookie(res, token) {
  let maxAgeMs = 7 * 24 * 60 * 60 * 1000; // default 7 days
  if (typeof REFRESH_EXPIRES_IN === 'string' && REFRESH_EXPIRES_IN.endsWith('d')) {
    const days = parseInt(REFRESH_EXPIRES_IN.replace('d', ''), 10);
    if (!Number.isNaN(days)) maxAgeMs = days * 24 * 60 * 60 * 1000;
  }

  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: maxAgeMs
  });
}

/* =========================
   Validation middleware
   ========================= */
const validateRegisterInput = (req, res, next) => {
  const { fullName, email, password, phoneNumber } = req.body;
  if (!fullName || !email || !password || !phoneNumber) {
    return res.status(400).json({
      message: 'All required fields must be filled',
      required: ['fullName', 'email', 'password', 'phoneNumber']
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email address' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
      required: ['email', 'password']
    });
  }
  next();
};

/* =========================
   Routes
   ========================= */

/** Test route */
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working!', timestamp: new Date().toISOString() });
});

/* -------------------
   REGISTER
   ------------------- */
router.post('/register', validateRegisterInput, async (req, res) => {
  try {
    const { fullName, businessName, businessType, location, phoneNumber, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(409).json({ message: 'User already exists with this email', code: 'EMAIL_EXISTS' });

    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) return res.status(409).json({ message: 'Phone number already registered', code: 'PHONE_EXISTS' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      fullName: fullName.trim(),
      businessName: businessName?.trim() || '',
      businessType: businessType || '',
      location: location || '',
      phoneNumber,
      email: email.toLowerCase().trim(),
      password: hashedPassword
    });

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshHash = hashToken(refreshToken);

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ tokenHash: refreshHash, userAgent: req.get('User-Agent') || '' });
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      message: 'User registered successfully',
      token: accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ message: `${field} already exists`, code: 'DUPLICATE_ENTRY' });
    }
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error during registration', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });
  }
});

/* -------------------
   LOGIN
   ------------------- */
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshHash = hashToken(refreshToken);

    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ tokenHash: refreshHash, userAgent: req.get('User-Agent') || '' });
    await user.save();

    setRefreshCookie(res, refreshToken);

    res.json({
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });
  }
});

/* -------------------
   REFRESH TOKEN
   ------------------- */
router.post('/refresh-token', async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken;
    if (!incoming) return res.status(401).json({ message: 'Refresh token required' });

    let decoded;
    try {
      decoded = jwt.verify(incoming, JWT_REFRESH_SECRET);
    } catch (err) {
      console.error('Refresh token verify error:', err);
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const incomingHash = hashToken(incoming);
    const tokenIndex = (user.refreshTokens || []).findIndex(rt => rt.tokenHash === incomingHash);
    if (tokenIndex === -1) return res.status(403).json({ message: 'Refresh token not recognized' });

    user.refreshTokens.splice(tokenIndex, 1);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newHash = hashToken(newRefreshToken);

    user.refreshTokens.push({ tokenHash: newHash, userAgent: req.get('User-Agent') || '' });
    await user.save();

    setRefreshCookie(res, newRefreshToken);

    res.json({ token: newAccessToken });

  } catch (error) {
    console.error('Refresh token route error:', error);
    res.status(500).json({ message: 'Server error processing refresh token' });
  }
});

/* -------------------
   LOGOUT
   ------------------- */
router.post('/logout', async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken;
    if (!incoming) {
      res.clearCookie('refreshToken');
      return res.json({ message: 'Logged out' });
    }

    let decoded;
    try {
      decoded = jwt.verify(incoming, JWT_REFRESH_SECRET);
    } catch (err) {
      res.clearCookie('refreshToken');
      return res.json({ message: 'Logged out' });
    }

    const user = await User.findById(decoded.userId);
    if (user) {
      const incomingHash = hashToken(incoming);
      user.refreshTokens = (user.refreshTokens || []).filter(rt => rt.tokenHash !== incomingHash);
      await user.save();
    }

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error while logging out' });
  }
});

/* -------------------
   LOGOUT ALL
   ------------------- */
router.post('/logout-all', async (req, res) => {
  try {
    const authHeader = req.header('Authorization')?.replace('Bearer ', '');
    if (!authHeader) return res.status(401).json({ message: 'Access token required' });

    let decoded;
    try {
      decoded = jwt.verify(authHeader, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.refreshTokens = [];
    await user.save();

    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out from all devices' });

  } catch (error) {
    console.error('Logout-all error:', error);
    res.status(500).json({ message: 'Server error while logging out all sessions' });
  }
});

/* -------------------
   PROFILE
   ------------------- */
router.get('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access token required', code: 'NO_TOKEN' });

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found', code: 'USER_NOT_FOUND' });

    res.json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Profile error:', error);
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ message: 'Invalid or expired token', code: 'INVALID_TOKEN' });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
    res.status(500).json({ message: 'Server error while fetching profile', error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' });
  }
});

/* -------------------
   PUBLIC SELLER PROFILE
   ------------------- */
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    const user = await User.findById(sellerId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'Seller not found' });

    res.json({
      success: true,
      seller: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        rating: 4.5,
        totalRatings: 12,
        completedOrders: 47
      }
    });

  } catch (error) {
    console.error('Get seller profile error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching seller profile' });
  }
});

/* -------------------
   UPDATE PROFILE
   ------------------- */
router.put('/profile', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access token required' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const { fullName, businessName, businessType, location, phoneNumber } = req.body;

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (fullName) user.fullName = fullName.trim();
    if (businessName !== undefined) user.businessName = businessName.trim();
    if (businessType) user.businessType = businessType;
    if (location) user.location = location;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    if (error.code === 11000) return res.status(409).json({ message: 'Phone number already exists' });
    res.status(500).json({ message: 'Server error while updating profile', error: error.message });
  }
});

/* -------------------
   CHECK EMAIL
   ------------------- */
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    res.json({ available: !existingUser, email });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
