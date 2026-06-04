const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    area: { type: String, required: true, trim: true },
    roomType: {
      type: String,
      enum: ['Private Room', 'Studio', 'Shared Room'],
      required: true,
    },
    price: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    landlordName: { type: String, required: true },
    availableFrom: { type: String, required: true },
    images: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    description: { type: String, default: '' },
    summary: { type: String, default: '' },
    accent: { type: String, default: 'from-sky-500 via-cyan-500 to-blue-600' },
    bookingLockedUntil: { type: String, default: '' },
    bookingLockBookingId: { type: String, default: '' },
    bookingLockPaymentId: { type: String, default: '' },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Room', roomSchema)
