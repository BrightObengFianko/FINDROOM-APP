const { randomUUID } = require('node:crypto')
const bcrypt = require('bcryptjs')
const { executeMySql, isMySqlConnected } = require('../config/mysql')
const Booking = require('../models/Booking')
const Message = require('../models/Message')
const Payment = require('../models/Payment')
const Room = require('../models/Room')
const User = require('../models/User')
const { isDbConnected } = require('../config/db')
const { mockStore } = require('../data/mockStore')
const {
  authenticateMySqlUser,
  countMySqlUsers,
  createMySqlUser,
  deleteMySqlUserById,
  findMySqlUserByEmail,
  findMySqlUserById,
  getMySqlUsers,
  updateMySqlUser,
} = require('./mysqlUserService')
const {
  getLoginAttempts,
  recordLoginAttempt,
  updateUserLoginMetadata,
} = require('./loginAuditService')
const {
  createAvatarFallback,
  normalizeEmail,
  resolveScopedUserId,
} = require('../utils/userHelpers')
const { applyUserRoles, canAssumeRole, resolveAllowedRoles } = require('../utils/roles')
const {
  calculateBookingLockUntilDate,
  getRoomBookingLockLabel,
  isRoomBookingLocked,
} = require('../utils/bookingAvailability')

const clone = (value) => JSON.parse(JSON.stringify(value))

const normalizeId = (value) =>
  typeof value === 'string' ? value : value?.toString?.()

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const canUseMongoUserRelations = () => isDbConnected() && !isMySqlConnected()

const getScopedUserId = (user) => resolveScopedUserId(user, mockStore.users)

const serializeEntity = (entity) => {
  if (!entity) {
    return null
  }

  const raw = entity.toObject ? entity.toObject() : clone(entity)

  if (raw._id) {
    raw.id = raw._id.toString()
    delete raw._id
    delete raw.__v
  }

  return raw
}

const serializeUser = (user) => {
  const raw = serializeEntity(user)

  if (!raw) {
    return null
  }

  delete raw.password
  raw.loginCount = Number(raw.loginCount || 0)
  raw.lastLoginAt = raw.lastLoginAt || ''
  raw.lastLoginIp = raw.lastLoginIp || ''
  raw.lastLoginVerified = Boolean(raw.lastLoginVerified)
  return applyUserRoles(raw)
}

const serializeRoom = (room) => {
  const raw = serializeEntity(room)

  if (raw?.landlord) {
    if (typeof raw.landlord === 'object') {
      raw.landlordId = normalizeId(raw.landlord.id || raw.landlord._id || raw.landlord)
      raw.landlordName = raw.landlord.name || raw.landlordName
    } else {
      raw.landlordId = normalizeId(raw.landlord)
    }

    delete raw.landlord
  }

  if (raw?.landlordId) {
    raw.landlordId = normalizeId(raw.landlordId)
  }

  return raw
}

const serializeBooking = (booking) => {
  const raw = serializeEntity(booking)

  if (raw?.room && typeof raw.room === 'object') {
    raw.roomId = normalizeId(raw.room.id || raw.room._id)
    raw.roomTitle = raw.roomTitle || raw.room.title
    delete raw.room
  }

  if (raw?.user && typeof raw.user === 'object') {
    raw.userId = normalizeId(raw.user.id || raw.user._id)
    delete raw.user
  }

  return raw
}

const serializeThread = (thread) => {
  const raw = serializeEntity(thread)

  if (raw?.room && typeof raw.room === 'object') {
    raw.roomId = normalizeId(raw.room.id || raw.room._id)
    delete raw.room
  }

  if (raw?.user && typeof raw.user === 'object') {
    raw.userId = normalizeId(raw.user.id || raw.user._id)
    delete raw.user
  }

  if (raw?.landlord && typeof raw.landlord === 'object') {
    raw.landlordId = normalizeId(raw.landlord.id || raw.landlord._id)
    delete raw.landlord
  }

  raw.messages = raw.messages.map((message) => ({
    id: normalizeId(message.id || message._id),
    senderId:
      typeof message.sender === 'object'
        ? normalizeId(message.sender.id || message.sender._id)
        : normalizeId(message.sender || message.senderId),
    text: message.text,
    createdAt: message.createdAt,
  }))

  return raw
}

const serializePayment = (payment) => {
  const raw = serializeEntity(payment)

  if (raw?.booking && typeof raw.booking === 'object') {
    raw.bookingId = normalizeId(raw.booking.id || raw.booking._id)
    delete raw.booking
  }

  if (raw?.user && typeof raw.user === 'object') {
    raw.userId = normalizeId(raw.user.id || raw.user._id)
    delete raw.user
  }

  return raw
}

const matchesRoomFilters = (room, filters) => {
  const amenities = filters.amenities
    ? String(filters.amenities)
        .split(',')
        .filter(Boolean)
    : []

  const matchesLocation = filters.location
    ? `${room.location} ${room.area}`.toLowerCase().includes(String(filters.location).toLowerCase())
    : true
  const matchesType = filters.roomType ? room.roomType === filters.roomType : true
  const matchesPrice = filters.maxPrice ? room.price <= Number(filters.maxPrice) : true
  const matchesAmenities = amenities.length
    ? amenities.every((amenity) => room.amenities.includes(amenity))
    : true

  return matchesLocation && matchesType && matchesPrice && matchesAmenities
}

const findMockRoom = (roomId) => mockStore.rooms.find((room) => room.id === roomId)

const updateRoomBookingLock = async (roomId, updates = {}) => {
  if (!roomId) {
    return null
  }

  if (isDbConnected()) {
    const updated = await Room.findByIdAndUpdate(
      roomId,
      {
        bookingLockedUntil: updates.bookingLockedUntil || '',
        bookingLockBookingId: updates.bookingLockBookingId || '',
        bookingLockPaymentId: updates.bookingLockPaymentId || '',
      },
      { new: true },
    )

    return serializeRoom(updated)
  }

  const room = mockStore.rooms.find((candidate) => candidate.id === roomId)

  if (!room) {
    return null
  }

  Object.assign(room, {
    bookingLockedUntil: updates.bookingLockedUntil || '',
    bookingLockBookingId: updates.bookingLockBookingId || '',
    bookingLockPaymentId: updates.bookingLockPaymentId || '',
  })

  return clone(room)
}

const getLandlordRoomIds = (landlordId, rooms) =>
  rooms.filter((room) => room.landlordId === landlordId).map((room) => room.id)

const filterScopedBookings = (bookings, user, rooms) => {
  const scopedUserId = getScopedUserId(user)

  if (user.role === 'admin') {
    return bookings
  }

  if (user.role === 'landlord') {
    const landlordRoomIds = getLandlordRoomIds(scopedUserId, rooms)
    return bookings.filter((booking) => landlordRoomIds.includes(booking.roomId))
  }

  return bookings.filter((booking) => booking.userId === scopedUserId)
}

const filterScopedThreads = (threads, user) => {
  if (user.role === 'admin') {
    return threads
  }

  const scopedUserId = getScopedUserId(user)

  return threads.filter(
    (thread) => thread.userId === scopedUserId || thread.landlordId === scopedUserId,
  )
}

const filterScopedPayments = (payments, user, bookings, rooms) => {
  const scopedUserId = getScopedUserId(user)

  if (user.role === 'admin') {
    return payments
  }

  if (user.role === 'landlord') {
    const landlordRoomIds = getLandlordRoomIds(scopedUserId, rooms)
    return payments.filter((payment) => {
      const booking = bookings.find((candidate) => candidate.id === payment.bookingId)
      return landlordRoomIds.includes(booking?.roomId)
    })
  }

  return payments.filter((payment) => payment.userId === scopedUserId)
}

const buildAdminStats = (users, rooms, payments) => ({
  totalUsers: users.length,
  totalRooms: rooms.length,
  pendingListings: rooms.filter((room) => room.status === 'pending').length,
  monthlyRevenue: payments
    .filter((payment) => payment.status === 'successful')
    .reduce((total, payment) => total + payment.amount, 0),
})

const removeMockUserData = (userId) => {
  mockStore.users = mockStore.users.filter((user) => user.id !== userId)
  mockStore.bookings = mockStore.bookings.filter((booking) => booking.userId !== userId)
  mockStore.threads = mockStore.threads.filter(
    (thread) => thread.userId !== userId && thread.landlordId !== userId,
  )
  mockStore.payments = mockStore.payments.filter((payment) => payment.userId !== userId)
}

async function createUser(payload) {
  const roles = resolveAllowedRoles({
    email: payload.email,
    role: payload.role || 'user',
    roles: payload.roles,
  })

  if (isMySqlConnected()) {
    return createMySqlUser({ ...payload, roles })
  }

  if (isDbConnected()) {
    const hashedPassword = await bcrypt.hash(payload.password, 10)
    const created = await User.create({
      ...payload,
      email: normalizeEmail(payload.email),
      password: hashedPassword,
      roles,
      avatar: payload.avatar || createAvatarFallback(payload.name),
      loginCount: Number(payload.loginCount || 0),
      lastLoginAt: payload.lastLoginAt || '',
      lastLoginIp: payload.lastLoginIp || '',
      lastLoginVerified: Boolean(payload.lastLoginVerified),
    })
    return serializeUser(created)
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10)
  const created = {
    id: randomUUID(),
    name: payload.name,
    email: normalizeEmail(payload.email),
    password: hashedPassword,
    role: payload.role || 'user',
    roles,
    phone: '',
    bio: '',
    avatar: createAvatarFallback(payload.name),
    loginCount: Number(payload.loginCount || 0),
    lastLoginAt: payload.lastLoginAt || '',
    lastLoginIp: payload.lastLoginIp || '',
    lastLoginVerified: Boolean(payload.lastLoginVerified),
    status: 'active',
  }

  mockStore.users.unshift(created)
  return serializeUser(created)
}

async function findUserByEmail(email) {
  if (isMySqlConnected()) {
    return findMySqlUserByEmail(email)
  }

  if (isDbConnected()) {
    return User.findOne({ email: normalizeEmail(email) })
  }

  return mockStore.users.find((user) => user.email === normalizeEmail(email)) || null
}

async function authenticateUser({ email, password, role }, requestMeta = {}) {
  if (isMySqlConnected()) {
    return authenticateMySqlUser({ email, password, role, requestMeta })
  }

  const user = await findUserByEmail(email)

  if (!user) {
    await recordLoginAttempt({
      email,
      roleRequested: role,
      status: 'failed',
      verified: false,
      failureReason: 'user_not_found',
      requestMeta,
    })
    return null
  }

  if (!canAssumeRole(user, role)) {
    await recordLoginAttempt({
      email: user.email,
      user,
      roleRequested: role,
      roleResolved: user.role,
      status: 'failed',
      verified: false,
      failureReason: 'role_not_allowed',
      requestMeta,
    })
    return null
  }

  const passwordMatches = await bcrypt.compare(password, user.password)

  if (!passwordMatches) {
    await recordLoginAttempt({
      email: user.email,
      user,
      roleRequested: role,
      roleResolved: user.role,
      status: 'failed',
      verified: false,
      failureReason: 'invalid_password',
      requestMeta,
    })
    return null
  }

  const activeUser = applyUserRoles(serializeUser(user), role)

  await updateUserLoginMetadata(user.id, requestMeta, true)
  await recordLoginAttempt({
    email: user.email,
    user: activeUser,
    roleRequested: role,
    roleResolved: activeUser.role,
    status: 'success',
    verified: true,
    requestMeta,
  })

  return activeUser
}

async function findUserById(userId) {
  if (isMySqlConnected()) {
    return findMySqlUserById(userId)
  }

  if (isDbConnected()) {
    return serializeUser(await User.findById(userId))
  }

  return serializeUser(mockStore.users.find((user) => user.id === userId))
}

async function getRooms(filters = {}) {
  if (isDbConnected()) {
    const query = {}

    if (filters.location) {
      query.$or = [
        { location: { $regex: filters.location, $options: 'i' } },
        { area: { $regex: filters.location, $options: 'i' } },
      ]
    }

    if (filters.roomType) {
      query.roomType = filters.roomType
    }

    if (filters.maxPrice) {
      query.price = { $lte: Number(filters.maxPrice) }
    }

    if (filters.amenities) {
      query.amenities = { $all: String(filters.amenities).split(',').filter(Boolean) }
    }

    const rooms = await Room.find(query)
      .sort({ createdAt: -1 })
      .populate('landlord', 'name email avatar bio role roles')
    return rooms.map(serializeRoom)
  }

  return clone(mockStore.rooms.filter((room) => matchesRoomFilters(room, filters)))
}

async function getRoomById(roomId) {
  if (isDbConnected()) {
    return serializeRoom(
      await Room.findById(roomId).populate('landlord', 'name email avatar bio role roles'),
    )
  }

  return clone(findMockRoom(roomId))
}

async function getBookingsForUser(user) {
  if (canUseMongoUserRelations()) {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate('room')
      .populate('user', 'name email role')
    const serialized = bookings.map(serializeBooking)
    const rooms = await getRooms()
    return filterScopedBookings(serialized, user, rooms)
  }

  return clone(filterScopedBookings(mockStore.bookings, user, mockStore.rooms))
}

async function createBooking(user, roomId, bookingDetails = {}) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw createHttpError('Room not found.', 404)
  }

  if (room.status !== 'approved') {
    throw createHttpError('This room is not approved for booking yet.', 409)
  }

  if (isRoomBookingLocked(room)) {
    throw createHttpError(
      `${getRoomBookingLockLabel(room)}.`,
      409,
    )
  }

  if (canUseMongoUserRelations()) {
    const created = await Booking.create({
      room: room.id,
      roomTitle: room.title,
      user: user.id,
      amount: room.price,
      startDate: bookingDetails.startDate || room.availableFrom,
      duration: bookingDetails.duration || '1 month',
      status: 'pending',
    })

    return serializeBooking(created)
  }

  const booking = {
    id: randomUUID(),
    roomId: room.id,
    roomTitle: room.title,
    userId: getScopedUserId(user),
    amount: room.price,
    startDate: bookingDetails.startDate || room.availableFrom,
    duration: bookingDetails.duration || '1 month',
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  mockStore.bookings.unshift(booking)
  mockStore.recentActivity.unshift({
    id: randomUUID(),
    title: 'Booking requested',
    description: `${user.name} requested ${room.title}.`,
    createdAt: new Date().toISOString(),
  })

  return clone(booking)
}

async function getThreadsForUser(user) {
  if (canUseMongoUserRelations()) {
    const threads = await Message.find()
      .sort({ lastMessageAt: -1 })
      .populate('room')
      .populate('user', 'name')
      .populate('landlord', 'name')
      .populate('messages.sender', 'name')
    const serialized = threads.map(serializeThread)
    return filterScopedThreads(serialized, user)
  }

  return clone(filterScopedThreads(mockStore.threads, user))
}

async function sendMessage(user, { roomId, recipientId, text }) {
  const room = await getRoomById(roomId)

  if (!room) {
    throw new Error('Room not found.')
  }

  const scopedUserId = getScopedUserId(user)
  const userId = user.role === 'landlord' ? recipientId : scopedUserId
  const landlordId = user.role === 'landlord' ? scopedUserId : recipientId || room.landlordId
  const createdAt = new Date().toISOString()

  if (canUseMongoUserRelations()) {
    let thread = await Message.findOne({
      room: room.id,
      user: userId,
      landlord: landlordId,
    })

    if (!thread) {
      thread = await Message.create({
        room: room.id,
        user: userId,
        landlord: landlordId,
        lastMessageAt: createdAt,
        messages: [],
      })
    }

    thread.messages.push({
      sender: user.id,
      text,
      createdAt,
    })
    thread.lastMessageAt = createdAt
    await thread.save()

    const populated = await Message.findById(thread.id)
      .populate('room')
      .populate('user', 'name')
      .populate('landlord', 'name')
      .populate('messages.sender', 'name')

    return serializeThread(populated)
  }

  let thread = mockStore.threads.find(
    (candidate) =>
      candidate.roomId === room.id &&
      candidate.userId === userId &&
      candidate.landlordId === landlordId,
  )

  const message = {
    id: randomUUID(),
    senderId: scopedUserId,
    text,
    createdAt,
  }

  if (!thread) {
    thread = {
      id: randomUUID(),
      roomId: room.id,
      userId,
      landlordId,
      lastMessageAt: createdAt,
      messages: [],
    }
    mockStore.threads.unshift(thread)
  }

  thread.messages.push(message)
  thread.lastMessageAt = createdAt
  return clone(thread)
}

async function getPaymentsForUser(user) {
  if (canUseMongoUserRelations()) {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate('booking')
      .populate('user', 'name')
    const serialized = payments.map(serializePayment)
    const bookings = await getBookingsForUser({ ...user, role: 'admin' })
    const rooms = await getRooms()
    return filterScopedPayments(serialized, user, bookings, rooms)
  }

  return clone(filterScopedPayments(mockStore.payments, user, mockStore.bookings, mockStore.rooms))
}

async function createMockPayment(user, bookingId) {
  const bookings = await getBookingsForUser({ ...user, role: 'admin' })
  const booking = bookings.find((item) => item.id === bookingId)

  if (!booking) {
    throw createHttpError('Booking not found.', 404)
  }

  const room = await getRoomById(booking.roomId)

  if (!room) {
    throw createHttpError('Room not found.', 404)
  }

  if (isRoomBookingLocked(room) && room.bookingLockBookingId !== booking.id) {
    throw createHttpError(`${getRoomBookingLockLabel(room)}.`, 409)
  }

  if (canUseMongoUserRelations()) {
    const payment = await Payment.create({
      booking: booking.id,
      user: booking.userId,
      amount: booking.amount,
      method: 'Mock Card',
      status: 'successful',
    })

    await Booking.findByIdAndUpdate(booking.id, { status: 'approved' })
    const bookingLockedUntil = calculateBookingLockUntilDate({
      startDate: booking.startDate,
      durationMonths: booking.durationMonths,
      duration: booking.duration,
    })

    await updateRoomBookingLock(room.id, {
      bookingLockedUntil,
      bookingLockBookingId: booking.id,
      bookingLockPaymentId: payment.id,
    })
    return serializePayment(payment)
  }

  const payment = {
    id: randomUUID(),
    bookingId,
    userId: booking.userId,
    amount: booking.amount,
    method: 'Mock Card',
    status: 'successful',
    createdAt: new Date().toISOString(),
  }

  mockStore.payments.unshift(payment)
  const target = mockStore.bookings.find((item) => item.id === bookingId)
  if (target) {
    target.status = 'approved'
  }
  const bookingLockedUntil = calculateBookingLockUntilDate({
    startDate: booking.startDate,
    durationMonths: booking.durationMonths,
    duration: booking.duration,
  })

  await updateRoomBookingLock(room.id, {
    bookingLockedUntil,
    bookingLockBookingId: booking.id,
    bookingLockPaymentId: payment.id,
  })

  return clone(payment)
}

async function updateCurrentUser(userId, updates) {
  const nextUpdates = {
    name: updates.name,
    email: updates.email ? normalizeEmail(updates.email) : undefined,
    phone: updates.phone,
    bio: updates.bio,
    avatar: updates.avatar,
    status: updates.status,
  }

  if (isMySqlConnected()) {
    return updateMySqlUser(userId, nextUpdates)
  }

  if (isDbConnected()) {
    const updated = await User.findByIdAndUpdate(userId, nextUpdates, {
      new: true,
      runValidators: true,
    })
    return serializeUser(updated)
  }

  const user = mockStore.users.find((candidate) => candidate.id === userId)
  Object.assign(user, Object.fromEntries(Object.entries(nextUpdates).filter(([, value]) => value !== undefined)))
  return clone(serializeUser(user))
}

async function reviewLandlordVerification(userId, status) {
  const reviewedAt = status === 'pending' ? '' : new Date().toISOString()

  if (isMySqlConnected()) {
    await executeMySql(
      `
        UPDATE users
        SET
          landlord_verification_status = ?,
          landlord_verification_reviewed_at = ?
        WHERE id = ?
      `,
      [status, reviewedAt, userId],
    )

    return findMySqlUserById(userId)
  }

  if (isDbConnected()) {
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        landlordVerificationStatus: status,
        landlordVerificationReviewedAt: reviewedAt,
      },
      { new: true, runValidators: true },
    )

    return serializeUser(updated)
  }

  const user = mockStore.users.find((candidate) => candidate.id === userId)
  if (!user) {
    return null
  }

  user.landlordVerificationStatus = status
  user.landlordVerificationReviewedAt = reviewedAt
  return clone(serializeUser(user))
}

async function getDashboardOverview(user) {
  if (!canUseMongoUserRelations()) {
    return clone(mockStore.recentActivity.slice(0, 5))
  }

  const bookings = await getBookingsForUser(user)
  const payments = await getPaymentsForUser(user)
  const threads = await getThreadsForUser(user)

  const activities = [
    ...bookings.slice(0, 2).map((booking) => ({
      id: `booking-${booking.id}`,
      title: `Booking ${booking.status}`,
      description: `${booking.roomTitle} is currently ${booking.status}.`,
      createdAt: booking.createdAt || booking.startDate,
    })),
    ...payments.slice(0, 2).map((payment) => ({
      id: `payment-${payment.id}`,
      title: `Payment ${payment.status}`,
      description: `A ${payment.method} payment of ${payment.amount} was recorded.`,
      createdAt: payment.createdAt,
    })),
    ...threads.slice(0, 1).map((thread) => ({
      id: `thread-${thread.id}`,
      title: 'Conversation updated',
      description: thread.messages[thread.messages.length - 1]?.text || 'New message',
      createdAt: thread.lastMessageAt,
    })),
  ]

  return activities
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
    .slice(0, 5)
}

async function getAdminStats() {
  if (isMySqlConnected()) {
    const rooms = await getRooms()
    return {
      totalUsers: await countMySqlUsers(),
      totalRooms: rooms.length,
      pendingListings: rooms.filter((room) => room.status === 'pending').length,
      monthlyRevenue: mockStore.payments
        .filter((payment) => payment.status === 'successful')
        .reduce((total, payment) => total + payment.amount, 0),
    }
  }

  if (isDbConnected()) {
    const users = (await User.find()).map(serializeUser)
    const rooms = await getRooms()
    const payments = (await Payment.find()).map(serializePayment)
    return buildAdminStats(users, rooms, payments)
  }

  return buildAdminStats(mockStore.users, mockStore.rooms, mockStore.payments)
}

async function getAdminUsers() {
  if (isMySqlConnected()) {
    return getMySqlUsers()
  }

  if (isDbConnected()) {
    return (await User.find().sort({ createdAt: -1 })).map(serializeUser)
  }

  return clone(mockStore.users.map(serializeUser))
}

async function getAdminLoginAttempts(limit = 100) {
  return getLoginAttempts({ limit })
}

async function updateRoomStatus(roomId, status) {
  if (isDbConnected()) {
    const updated = await Room.findByIdAndUpdate(roomId, { status }, { new: true })
    return serializeRoom(updated)
  }

  const room = mockStore.rooms.find((candidate) => candidate.id === roomId)
  if (room) {
    room.status = status
  }
  return clone(room)
}

async function deleteUserById(userId) {
  if (isMySqlConnected()) {
    const user = await findMySqlUserById(userId)
    await deleteMySqlUserById(userId)

    if (user) {
      removeMockUserData(getScopedUserId(user))
    }
    return
  }

  if (isDbConnected()) {
    await User.findByIdAndDelete(userId)
    return
  }

  removeMockUserData(userId)
}

module.exports = {
  authenticateUser,
  createBooking,
  createMockPayment,
  createUser,
  createAvatarFallback,
  deleteUserById,
  findUserByEmail,
  findUserById,
  getAdminStats,
  getAdminLoginAttempts,
  getAdminUsers,
  getBookingsForUser,
  getDashboardOverview,
  getPaymentsForUser,
  getRoomById,
  getRooms,
  getThreadsForUser,
  reviewLandlordVerification,
  sendMessage,
  updateCurrentUser,
  updateRoomStatus,
}
