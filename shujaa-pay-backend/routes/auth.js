// routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import User from '../models/User.js';
import { authenticateToken, restrictTo, authenticateTokenWithFallback } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();
router.use(cookieParser());

/* =========================
   Config / Helpers
   ========================= */
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; 
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

// Use HARDCODED JWT secret to ensure consistency
const JWT_SECRET = '24c75fb7980ef8a827bca061f9a9075bb75d4446329a15a977fc3eb572f9935ab1ad1294b0a25010ba56e925df9ec3b25a262c9c0b7c7da15e3c007e3a613d68';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';

console.log('🔐 JWT Configuration:', {
  accessExpires: ACCESS_EXPIRES_IN,
  refreshExpires: REFRESH_EXPIRES_IN,
  jwtSecret: 'HARDCODED (consistent across files)',
  jwtRefreshSecretSet: !!process.env.JWT_REFRESH_SECRET
});

/** Generate access token with 1h expiry */
function generateAccessToken(user) {
  const payload = {
    userId: user._id.toString(),
    id: user._id.toString(),
    email: user.email,
    role: user.role || 'seller',
    type: 'access',
    expires: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour from now
  };
  
  console.log('🔐 Generating access token with 1h expiry');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

/** Generate refresh token with 7d expiry */
function generateRefreshToken(user) {
  const payload = {
    userId: user._id.toString(),
    id: user._id.toString(),
    email: user.email,
    role: user.role || 'seller',
    type: 'refresh',
    expires: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days from now
  };
  
  console.log('🔐 Generating refresh token with 7d expiry');
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
}

/** Hash refresh token */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Set refresh token cookie */
function setRefreshCookie(res, token) {
  let maxAgeMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  if (typeof REFRESH_EXPIRES_IN === 'string') {
    if (REFRESH_EXPIRES_IN.endsWith('d')) {
      const days = parseInt(REFRESH_EXPIRES_IN.replace('d', ''), 10);
      if (!Number.isNaN(days)) maxAgeMs = days * 24 * 60 * 60 * 1000;
    } else if (REFRESH_EXPIRES_IN.endsWith('h')) {
      const hours = parseInt(REFRESH_EXPIRES_IN.replace('h', ''), 10);
      if (!Number.isNaN(hours)) maxAgeMs = hours * 60 * 60 * 1000;
    }
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAgeMs,
    path: '/'
  };

  console.log('🍪 Setting refresh cookie with maxAge:', maxAgeMs, 'ms');
  res.cookie('refreshToken', token, cookieOptions);
}

/* =========================
   Input Validation Middleware
   ========================= */
const validateRegisterInput = (req, res, next) => {
  const { fullName, email, password, phoneNumber } = req.body;
  
  console.log('📝 Validating registration input:', { fullName, email, phoneNumber });

  if (!fullName || !email || !password || !phoneNumber) {
    return res.status(400).json({
      success: false,
      message: 'All required fields must be filled',
      required: ['fullName', 'email', 'password', 'phoneNumber'],
      code: 'MISSING_FIELDS'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid email address',
      code: 'INVALID_EMAIL'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false,
      message: 'Password must be at least 6 characters long',
      code: 'PASSWORD_TOO_SHORT'
    });
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;
  
  console.log('📝 Validating login input for:', email);

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      required: ['email', 'password'],
      code: 'MISSING_CREDENTIALS'
    });
  }
  next();
};

/* =========================
   Routes
   ========================= */

/** Test route */
router.get('/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Auth route is working!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    jwtSecret: 'HARDCODED (consistent)',
    tokenExpiry: {
      access: ACCESS_EXPIRES_IN,
      refresh: REFRESH_EXPIRES_IN
    }
  });
});

/* -------------------
   REGISTER
   ------------------- */
router.post('/register', validateRegisterInput, async (req, res) => {
  try {
    const { fullName, businessName, businessType, location, phoneNumber, email, password } = req.body;

    console.log('👤 Starting registration for:', email);

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: 'User already exists with this email', 
        code: 'EMAIL_EXISTS' 
      });
    }

    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(409).json({ 
        success: false,
        message: 'Phone number already registered', 
        code: 'PHONE_EXISTS' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      fullName: fullName.trim(),
      businessName: businessName?.trim() || '',
      businessType: businessType || '',
      location: location || '',
      phoneNumber,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'seller'
    });

    await user.save();
    console.log('✅ User registered successfully:', user._id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshHash = hashToken(refreshToken);

    // Store refresh token
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ 
      tokenHash: refreshHash, 
      userAgent: req.get('User-Agent') || '',
      createdAt: new Date()
    });
    
    await user.save();

    // Set refresh token cookie
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: accessToken,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      },
      expiresIn: ACCESS_EXPIRES_IN,
      autoLogout: true // Frontend should handle automatic logout
    });

  } catch (error) {
    console.error('❌ Registration error:', error);
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({ 
        success: false,
        message: `${field} already exists`, 
        code: 'DUPLICATE_ENTRY' 
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed', 
        errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/* -------------------
   LOGIN
   ------------------- */
router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Attempting login for:', email);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log('❌ Login failed: User not found');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password', 
        code: 'INVALID_CREDENTIALS' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Login failed: Invalid password');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password', 
        code: 'INVALID_CREDENTIALS' 
      });
    }

    console.log('✅ Login successful for user:', user._id);

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshHash = hashToken(refreshToken);

    // Store refresh token
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({ 
      tokenHash: refreshHash, 
      userAgent: req.get('User-Agent') || '',
      createdAt: new Date()
    });
    
    await user.save();

    // Set refresh token cookie
    setRefreshCookie(res, refreshToken);

    res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      },
      expiresIn: ACCESS_EXPIRES_IN,
      autoLogout: true // Frontend should handle automatic logout
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

/* -------------------
   REFRESH TOKEN
   ------------------- */
router.post('/refresh-token', async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken;
    console.log('🔄 Refresh token request received');

    if (!incoming) {
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token required',
        code: 'NO_REFRESH_TOKEN',
        action: 'LOGOUT'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(incoming, JWT_REFRESH_SECRET);
      console.log('✅ Refresh token verified for user:', decoded.userId);
    } catch (err) {
      console.error('❌ Refresh token verification failed:', err.message);
      return res.status(403).json({ 
        success: false,
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
        action: 'LOGOUT'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        action: 'LOGOUT'
      });
    }

    const incomingHash = hashToken(incoming);
    const tokenIndex = (user.refreshTokens || []).findIndex(rt => rt.tokenHash === incomingHash);
    
    if (tokenIndex === -1) {
      console.log('❌ Refresh token not found in database');
      return res.status(403).json({ 
        success: false,
        message: 'Refresh token not recognized',
        code: 'UNKNOWN_REFRESH_TOKEN',
        action: 'LOGOUT'
      });
    }

    // Remove old refresh token
    user.refreshTokens.splice(tokenIndex, 1);

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    const newHash = hashToken(newRefreshToken);

    // Store new refresh token
    user.refreshTokens.push({ 
      tokenHash: newHash, 
      userAgent: req.get('User-Agent') || '',
      createdAt: new Date()
    });
    
    await user.save();

    // Set new refresh token cookie
    setRefreshCookie(res, newRefreshToken);

    console.log('✅ Token refresh successful for user:', user._id);

    res.json({
      success: true,
      token: newAccessToken,
      expiresIn: ACCESS_EXPIRES_IN,
      autoLogout: true
    });

  } catch (error) {
    console.error('❌ Refresh token route error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error processing refresh token',
      code: 'SERVER_ERROR',
      action: 'LOGOUT'
    });
  }
});

/* -------------------
   LOGOUT
   ------------------- */
router.post('/logout', async (req, res) => {
  try {
    const incoming = req.cookies?.refreshToken;
    console.log('🚪 Logout request received');

    if (!incoming) {
      res.clearCookie('refreshToken');
      return res.json({ 
        success: true,
        message: 'Logged out successfully',
        action: 'LOGOUT'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(incoming, JWT_REFRESH_SECRET);
    } catch (err) {
      // If token is invalid, just clear the cookie
      res.clearCookie('refreshToken');
      return res.json({ 
        success: true,
        message: 'Logged out successfully',
        action: 'LOGOUT'
      });
    }

    const user = await User.findById(decoded.userId);
    if (user) {
      const incomingHash = hashToken(incoming);
      user.refreshTokens = (user.refreshTokens || []).filter(rt => rt.tokenHash !== incomingHash);
      await user.save();
      console.log('✅ Refresh token removed for user:', user._id);
    }

    res.clearCookie('refreshToken');
    res.json({ 
      success: true,
      message: 'Logged out successfully',
      action: 'LOGOUT'
    });

  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while logging out',
      code: 'SERVER_ERROR',
      action: 'LOGOUT'
    });
  }
});

/* -------------------
   LOGOUT ALL
   ------------------- */
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        action: 'LOGOUT'
      });
    }

    user.refreshTokens = [];
    await user.save();

    res.clearCookie('refreshToken');
    
    console.log('✅ All sessions logged out for user:', user._id);
    res.json({ 
      success: true,
      message: 'Logged out from all devices',
      action: 'LOGOUT'
    });

  } catch (error) {
    console.error('❌ Logout-all error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while logging out all sessions',
      code: 'SERVER_ERROR',
      action: 'LOGOUT'
    });
  }
});

/* -------------------
   PROFILE
   ------------------- */
router.get('/profile', authenticateTokenWithFallback, async (req, res) => {
  try {
    console.log('👤 Fetching profile for user:', req.user.userId);

    const user = await User.findById(req.user.userId).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found', 
        code: 'USER_NOT_FOUND',
        action: 'LOGOUT'
      });
    }

    console.log('✅ Profile fetched successfully for:', user.email);

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      tokenExpiry: req.user.tokenExpiry
    });

  } catch (error) {
    console.error('❌ Profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching profile', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'SERVER_ERROR',
      action: 'LOGOUT'
    });
  }
});

/* -------------------
   PUBLIC SELLER PROFILE
   ------------------- */
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    console.log('👤 Fetching public seller profile:', sellerId);

    const user = await User.findById(sellerId).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Seller not found',
        code: 'SELLER_NOT_FOUND'
      });
    }

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
        rating: user.rating || 4.5,
        totalRatings: user.totalRatings || 12,
        completedOrders: user.completedOrders || 47
      }
    });

  } catch (error) {
    console.error('❌ Get seller profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching seller profile',
      code: 'SERVER_ERROR'
    });
  }
});

/* -------------------
   UPDATE PROFILE
   ------------------- */
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { fullName, businessName, businessType, location, phoneNumber } = req.body;

    console.log('✏️ Updating profile for user:', req.user.userId, 'with data:', req.body);

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        action: 'LOGOUT'
      });
    }

    if (fullName) user.fullName = fullName.trim();
    if (businessName !== undefined) user.businessName = businessName.trim();
    if (businessType) user.businessType = businessType;
    if (location) user.location = location;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    console.log('✅ Profile updated successfully for user:', user._id);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        businessType: user.businessType,
        location: user.location,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false,
        message: 'Phone number already exists',
        code: 'PHONE_EXISTS'
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating profile', 
      error: error.message,
      code: 'SERVER_ERROR',
      action: 'LOGOUT'
    });
  }
});

/* -------------------
   CHECK EMAIL
   ------------------- */
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('📧 Checking email availability:', email);

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    
    res.json({ 
      success: true,
      available: !existingUser, 
      email 
    });
  } catch (error) {
    console.error('❌ Check email error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      code: 'SERVER_ERROR'
    });
  }
});

/* -------------------
   ADMIN DASHBOARD
   ------------------- */
router.get('/admin/dashboard', authenticateToken, restrictTo('admin'), (req, res) => {
  res.json({ 
    success: true,
    message: 'Welcome Admin!', 
    user: req.user,
    stats: {
      totalUsers: 150,
      activeSellers: 89,
      totalOrders: 1247,
      revenue: 45000000
    },
    tokenExpiry: req.user.tokenExpiry
  });
});

/* -------------------
   CHANGE PASSWORD
   ------------------- */
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('🔑 Changing password for user:', req.user.userId);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Current password and new password are required',
        code: 'MISSING_PASSWORDS' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'New password must be at least 6 characters long',
        code: 'PASSWORD_TOO_SHORT' 
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        action: 'LOGOUT'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Current password is incorrect',
        code: 'INCORRECT_PASSWORD' 
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    console.log('✅ Password changed successfully for user:', user._id);

    res.json({ 
      success: true,
      message: 'Password changed successfully' 
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while changing password',
      code: 'SERVER_ERROR',
      action: 'LOGOUT'
    });
  }
});

/* -------------------
   VERIFY TOKEN
   ------------------- */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    success: true,
    valid: true, 
    user: {
      id: req.user.userId,
      email: req.user.email,
      role: req.user.role
    },
    tokenExpiry: req.user.tokenExpiry,
    timeUntilExpiry: req.user.tokenExpiry - Math.floor(Date.now() / 1000)
  });
});

/* -------------------
   HEALTH CHECK
   ------------------- */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'Authentication Service',
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    jwtSecret: 'HARDCODED (consistent)',
    tokenExpiry: {
      access: ACCESS_EXPIRES_IN,
      refresh: REFRESH_EXPIRES_IN
    }
  });
});

/* -------------------
   TOKEN STATUS
   ------------------- */
router.get('/token-status', authenticateToken, (req, res) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = req.user.tokenExpiry - currentTime;
  
  res.json({
    success: true,
    status: timeUntilExpiry > 0 ? 'VALID' : 'EXPIRED',
    timeUntilExpiry,
    expiresIn: `${Math.floor(timeUntilExpiry / 60)} minutes`,
    willAutoLogout: timeUntilExpiry <= 300 // 5 minutes
  });
});

export default router;