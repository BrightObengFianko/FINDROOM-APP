const bcrypt = require('bcryptjs')
const Booking = require('../models/Booking')
const Message = require('../models/Message')
const Payment = require('../models/Payment')
const Room = require('../models/Room')
const User = require('../models/User')
const { calculateBookingLockUntilDate } = require('../utils/bookingAvailability')
const { isDbConnected } = require('./db')
const { createAvatarFallback, normalizeEmail } = require('../utils/userHelpers')
const { applyUserRoles } = require('../utils/roles')
const { mockStore } = require('../data/mockStore')

const seedUsers = async () => {
  const createdUsers = new Map()

  for (const user of mockStore.users) {
    const hashedPassword = await bcrypt.hash(user.password, 10)

    const created = await User.create(
      applyUserRoles(
        {
          name: user.name,
          email: normalizeEmail(user.email),
          password: hashedPassword,
          role: user.role || 'user',
          roles: user.roles || [user.role || 'user'],
          phone: user.phone || '',
          bio: user.bio || '',
          avatar: user.avatar || createAvatarFallback(user.name),
          loginCount: Number(user.loginCount || 0),
          lastLoginAt: user.lastLoginAt || '',
          lastLoginIp: user.lastLoginIp || '',
          lastLoginVerified: Boolean(user.lastLoginVerified),
          landlordVerificationStatus: user.landlordVerificationStatus || 'not_submitted',
          landlordVerificationSubmittedAt: user.landlordVerificationSubmittedAt || '',
          landlordVerificationReviewedAt: user.landlordVerificationReviewedAt || '',
          landlordVerification: user.landlordVerification || null,
          status: user.status || 'active',
        },
        user.role,
      ),
    )

    createdUsers.set(user.id, created)
  }

  return createdUsers
}

const seedRooms = async (createdUsers) => {
  const createdRooms = new Map()

  for (const room of mockStore.rooms) {
    const landlord = createdUsers.get(room.landlordId)

    if (!landlord) {
      continue
    }

    const created = await Room.create({
      title: room.title,
      location: room.location,
      area: room.area,
      roomType: room.roomType,
      price: room.price,
      rating: room.rating,
      status: room.status,
      landlord: landlord._id,
      landlordName: landlord.name,
      availableFrom: room.availableFrom,
      images: room.images,
      amenities: room.amenities,
      description: room.description,
      summary: room.summary,
      accent: room.accent,
      bookingLockedUntil: room.bookingLockedUntil || '',
      bookingLockBookingId: room.bookingLockBookingId || '',
      bookingLockPaymentId: room.bookingLockPaymentId || '',
    })

    createdRooms.set(room.id, created)
  }

  return createdRooms
}

const seedBookings = async (createdUsers, createdRooms) => {
  const createdBookings = new Map()

  for (const booking of mockStore.bookings) {
    const user = createdUsers.get(booking.userId)
    const room = createdRooms.get(booking.roomId)

    if (!user || !room) {
      continue
    }

    const created = await Booking.create({
      room: room._id,
      roomTitle: booking.roomTitle,
      user: user._id,
      amount: booking.amount,
      startDate: booking.startDate,
      duration: booking.duration,
      status: booking.status,
    })

    createdBookings.set(booking.id, created)
  }

  return createdBookings
}

const seedThreads = async (createdUsers, createdRooms) => {
  for (const thread of mockStore.threads) {
    const user = createdUsers.get(thread.userId)
    const landlord = createdUsers.get(thread.landlordId)
    const room = createdRooms.get(thread.roomId)

    if (!user || !landlord || !room) {
      continue
    }

    await Message.create({
      room: room._id,
      user: user._id,
      landlord: landlord._id,
      lastMessageAt: thread.lastMessageAt,
      messages: thread.messages.map((message) => ({
        sender: createdUsers.get(message.senderId)?._id || user._id,
        text: message.text,
        createdAt: message.createdAt,
      })),
    })
  }
}

const seedPayments = async (createdUsers, createdBookings) => {
  for (const payment of mockStore.payments) {
    const booking = createdBookings.get(payment.bookingId)
    const user = createdUsers.get(payment.userId)

    if (!booking || !user) {
      continue
    }

    const createdPayment = await Payment.create({
      booking: booking._id,
      user: user._id,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
    })

    if (payment.status === 'successful') {
      const bookingLockedUntil = calculateBookingLockUntilDate({
        startDate: booking.startDate,
        duration: booking.duration,
      })

      if (bookingLockedUntil) {
        await Room.findByIdAndUpdate(booking.room, {
          bookingLockedUntil,
          bookingLockBookingId: booking.id || booking._id.toString(),
          bookingLockPaymentId: createdPayment._id.toString(),
        })
      }
    }
  }
}

const backfillRoomBookingLocks = async () => {
  const successfulPayments = await Payment.find({ status: 'successful' }).sort({ createdAt: -1 })
  const bookings = await Booking.find().sort({ createdAt: -1 })
  const roomLocks = new Map()

  for (const payment of successfulPayments) {
    const booking = bookings.find(
      (candidate) => candidate._id.toString() === payment.booking.toString(),
    )

    if (!booking?.room) {
      continue
    }

    const bookingLockedUntil = calculateBookingLockUntilDate({
      startDate: booking.startDate,
      duration: booking.duration,
    })

    if (!bookingLockedUntil) {
      continue
    }

    const roomId = booking.room.toString()
    const currentLock = roomLocks.get(roomId)

    if (!currentLock || currentLock.bookingLockedUntil < bookingLockedUntil) {
      roomLocks.set(roomId, {
        bookingLockedUntil,
        bookingLockBookingId: booking._id.toString(),
        bookingLockPaymentId: payment._id.toString(),
      })
    }
  }

  for (const [roomId, lock] of roomLocks.entries()) {
    await Room.findByIdAndUpdate(roomId, lock)
  }
}

const seedMongoDatabase = async () => {
  if (!isDbConnected()) {
    return false
  }

  const userCount = await User.countDocuments()
  if (userCount > 0) {
    await backfillRoomBookingLocks()
    return false
  }

  const createdUsers = await seedUsers()
  const createdRooms = await seedRooms(createdUsers)
  const createdBookings = await seedBookings(createdUsers, createdRooms)

  await seedThreads(createdUsers, createdRooms)
  await seedPayments(createdUsers, createdBookings)
  await backfillRoomBookingLocks()

  console.log('Seeded FindRoom demo data into MongoDB.')
  return true
}

module.exports = { seedMongoDatabase }
