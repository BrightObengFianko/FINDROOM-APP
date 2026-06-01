const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    roomTitle: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    startDate: { type: String, required: true },
    duration: { type: String, default: '1 month' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Booking', bookingSchema)
