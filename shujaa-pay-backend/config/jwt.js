// config/jwt.js
import dotenv from 'dotenv';
dotenv.config();

// Centralized JWT configuration
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || '24c75fb7980ef8a827bca061f9a9075bb75d4446329a15a977fc3eb572f9935ab1ad1294b0a25010ba56e925df9ec3b25a262c9c0b7c7da15e3c007e3a613d68',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'refresh-secret-placeholder',
  ACCESS_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REFRESH_EXPIRES_IN: process.env.REFRESH_EXPIRES_IN || '30d'
};

console.log('🔐 JWT Configuration Loaded:', {
  secretSet: !!JWT_CONFIG.SECRET,
  secretPreview: JWT_CONFIG.SECRET.substring(0, 20) + '...',
  accessExpires: JWT_CONFIG.ACCESS_EXPIRES_IN,
  refreshExpires: JWT_CONFIG.REFRESH_EXPIRES_IN
});

export default JWT_CONFIG;