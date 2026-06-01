const mongoose = require('mongoose')

const messageItemSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const messageSchema = new mongoose.Schema(
  {
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessageAt: { type: Date, default: Date.now },
    messages: { type: [messageItemSchema], default: [] },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Message', messageSchema)
