const mongoose = require('mongoose')

const loginAttemptSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    userId: { type: String, default: '' },
    userName: { type: String, default: '' },
    roleRequested: { type: String, default: 'user' },
    roleResolved: { type: String, default: 'user' },
    status: {
      type: String,
      enum: ['success', 'failed'],
      required: true,
    },
    verified: { type: Boolean, default: false },
    failureReason: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('LoginAttempt', loginAttemptSchema)
