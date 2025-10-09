import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  userAgent: { type: String, default: '' }
});

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  businessName: {
    type: String,
    trim: true,
    default: ''
  },
  businessType: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['seller', 'admin'],
    default: 'seller'
  },
  refreshTokens: {
    type: [refreshTokenSchema],
    default: []
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
