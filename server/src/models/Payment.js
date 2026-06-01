const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: 'Mock Card' },
    status: {
      type: String,
      enum: ['successful', 'pending', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Payment', paymentSchema)
