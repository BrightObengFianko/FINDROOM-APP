const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['user', 'landlord', 'admin'],
      default: 'user',
    },
    roles: {
      type: [String],
      default: [],
    },
    landlordVerificationStatus: {
      type: String,
      enum: ['not_submitted', 'pending', 'approved', 'rejected'],
      default: 'not_submitted',
    },
    landlordVerificationSubmittedAt: { type: String, default: '' },
    landlordVerificationReviewedAt: { type: String, default: '' },
    landlordVerification: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar: { type: String, default: '' },
    loginCount: { type: Number, default: 0 },
    lastLoginAt: { type: String, default: '' },
    lastLoginIp: { type: String, default: '' },
    lastLoginVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('User', userSchema)
