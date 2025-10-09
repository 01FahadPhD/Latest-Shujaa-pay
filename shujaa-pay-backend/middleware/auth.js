// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Use the EXACT SAME hardcoded secret as routes/auth.js
const JWT_SECRET = '24c75fb7980ef8a827bca061f9a9075bb75d4446329a15a977fc3eb572f9935ab1ad1294b0a25010ba56e925df9ec3b25a262c9c0b7c7da15e3c007e3a613d68';

console.log('🔐 Auth Middleware - Using HARDCODED JWT_SECRET:', JWT_SECRET.substring(0, 20) + '...');

/**
 * Authenticate Token - Protect routes with automatic logout on expiry
 */
export const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 Starting authentication...');
    
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    console.log('🔐 Auth Header:', authHeader ? `${authHeader.substring(0, 50)}...` : 'No header');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No Bearer token found in header');
      return res.status(401).json({ 
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN',
        action: 'LOGOUT'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    console.log('🔐 Token extracted:', token ? `${token.substring(0, 20)}...` : 'Empty token');

    if (!token) {
      console.log('❌ Empty token after extraction');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format',
        code: 'INVALID_TOKEN',
        action: 'LOGOUT'
      });
    }

    // Verify the token with HARDCODED secret
    console.log('🔐 Verifying token with HARDCODED secret...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token decoded successfully for user:', decoded.userId);

    // Check if token is about to expire (within 5 minutes)
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;
    
    if (timeUntilExpiry < 300) { // 5 minutes
      console.log('⚠️ Token expiring soon for user:', decoded.userId, `(${timeUntilExpiry}s remaining)`);
      // Frontend can use this warning to refresh token if needed
    }

    // Find user and attach to request
    const userId = decoded.userId || decoded.id;
    console.log('🔐 Looking for user with ID:', userId);
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log('❌ User not found in database');
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        action: 'LOGOUT'
      });
    }

    console.log('✅ User found:', { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    });

    // Attach user to request with consistent structure
    req.user = {
      userId: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      tokenExpiry: decoded.exp,
      timeUntilExpiry,
      ...user.toObject()
    };

    console.log('✅ Authentication successful, proceeding to next middleware');
    next();

  } catch (error) {
    console.error('❌ Authentication error:', {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token signature - please login again',
        code: 'INVALID_TOKEN_SIGNATURE',
        action: 'LOGOUT', // Frontend should logout immediately
        debug: process.env.NODE_ENV === 'development' ? {
          secretUsed: 'HARDCODED (should match routes/auth.js)',
          recommendation: 'Both files must use identical JWT_SECRET'
        } : undefined
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Your session has expired - please login again',
        code: 'TOKEN_EXPIRED',
        action: 'LOGOUT' // Frontend should logout immediately
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token not active yet',
        code: 'TOKEN_NOT_ACTIVE',
        action: 'LOGOUT'
      });
    }

    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
      action: 'LOGOUT',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Enhanced authenticate token with fallback for different token structures
 */
export const authenticateTokenWithFallback = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required',
        code: 'NO_TOKEN',
        action: 'LOGOUT'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // Try to verify token with HARDCODED secret
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Handle different token payload structures
    const userId = decoded.userId || decoded.id || decoded._id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token payload',
        code: 'INVALID_TOKEN_PAYLOAD',
        action: 'LOGOUT'
      });
    }

    const user = await User.findById(userId).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
        action: 'LOGOUT'
      });
    }

    // Check token expiry warning
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;

    // Standardize user object on request
    req.user = {
      userId: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.fullName,
      tokenExpiry: decoded.exp,
      timeUntilExpiry,
      ...user.toObject()
    };

    next();

  } catch (error) {
    console.error('Authentication with fallback error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      // Provide clear instruction to fix the issue
      return res.status(401).json({ 
        success: false,
        message: 'Your session has expired or is invalid. Please log out and log in again.',
        code: 'INVALID_TOKEN_SIGNATURE',
        action: 'CLEAR_TOKEN_AND_RELOGIN'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Your session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
        action: 'RELOGIN'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR',
      action: 'LOGOUT'
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token, but attaches user if valid
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without user
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      
      const user = await User.findById(userId).select('-password');
      if (user) {
        const currentTime = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decoded.exp - currentTime;

        req.user = {
          userId: user._id.toString(),
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          tokenExpiry: decoded.exp,
          timeUntilExpiry,
          ...user.toObject()
        };
        
        console.log('✅ Optional auth - User attached:', user.email);
      }
    } catch (tokenError) {
      // For optional auth, we just continue without user on token error
      console.log('Optional auth - Token invalid, continuing without user:', tokenError.message);
    }

    next();
  } catch (error) {
    // For optional auth, we just continue without user on any error
    console.log('Optional auth failed, continuing without user:', error.message);
    next();
  }
};

/**
 * Restrict access to specific roles
 * Usage: restrictTo('admin', 'seller')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
        code: 'NO_USER',
        action: 'LOGIN_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      console.log(`❌ Access denied for user ${req.user.email} with role ${req.user.role}. Required: ${roles.join(', ')}`);
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required roles: ${roles.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role,
        action: 'REDIRECT_TO_HOME'
      });
    }

    console.log(`✅ Role access granted for ${req.user.email} (${req.user.role})`);
    next();
  };
};

/**
 * Validate JWT token without database lookup (for performance)
 */
export const validateToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - currentTime;
    
    return {
      valid: true,
      decoded,
      userId: decoded.userId || decoded.id,
      expiresIn: timeUntilExpiry,
      isExpiringSoon: timeUntilExpiry < 300 // 5 minutes
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      code: error.name,
      action: error.name === 'TokenExpiredError' ? 'RELOGIN' : 'LOGOUT'
    };
  }
};

/**
 * Check if user is authenticated (synchronous, for route guards)
 */
export const isAuthenticated = (req) => {
  return !!req.user;
};

/**
 * Check if user has specific role (synchronous, for route guards)
 */
export const hasRole = (req, role) => {
  return req.user && req.user.role === role;
};

/**
 * Check if user has any of the specified roles (synchronous, for route guards)
 */
export const hasAnyRole = (req, roles) => {
  return req.user && roles.includes(req.user.role);
};

export default {
  authenticateToken,
  authenticateTokenWithFallback,
  optionalAuth,
  restrictTo,
  validateToken,
  isAuthenticated,
  hasRole,
  hasAnyRole
};