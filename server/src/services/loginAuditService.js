const { randomUUID } = require('node:crypto')
const LoginAttempt = require('../models/LoginAttempt')
const User = require('../models/User')
const { isDbConnected } = require('../config/db')
const { executeMySql, isMySqlConnected } = require('../config/mysql')
const { mockStore } = require('../data/mockStore')
const { normalizeEmail } = require('../utils/userHelpers')
const { supportedRoles } = require('../utils/roles')

const clone = (value) => JSON.parse(JSON.stringify(value))

const normalizeId = (value) => (typeof value === 'string' ? value : value?.toString?.() || '')

const normalizeRole = (value, fallback = 'user') =>
  supportedRoles.includes(value) ? value : fallback

const buildAttempt = ({
  email,
  user = null,
  roleRequested = '',
  roleResolved = '',
  status,
  verified = false,
  failureReason = '',
  requestMeta = {},
}) => ({
  email: normalizeEmail(email || user?.email || ''),
  userId: normalizeId(user?.id || user?._id),
  userName: user?.name || user?.full_name || '',
  roleRequested: normalizeRole(roleRequested || user?.role || 'user'),
  roleResolved: normalizeRole(roleResolved || user?.role || 'user'),
  status,
  verified: Boolean(verified),
  failureReason: failureReason || '',
  ipAddress: requestMeta.ipAddress || '',
  userAgent: requestMeta.userAgent || '',
})

const serializeLoginAttempt = (attempt) => {
  if (!attempt) {
    return null
  }

  if (attempt.toObject) {
    const raw = attempt.toObject()
    return {
      id: raw._id ? raw._id.toString() : normalizeId(raw.id),
      email: normalizeEmail(raw.email),
      userId: normalizeId(raw.userId),
      userName: raw.userName || '',
      roleRequested: normalizeRole(raw.roleRequested || 'user'),
      roleResolved: normalizeRole(raw.roleResolved || 'user'),
      status: raw.status || 'failed',
      verified: Boolean(raw.verified),
      failureReason: raw.failureReason || '',
      ipAddress: raw.ipAddress || '',
      userAgent: raw.userAgent || '',
      createdAt: raw.createdAt || null,
    }
  }

  return {
    id: normalizeId(attempt.id),
    email: normalizeEmail(attempt.email),
    userId: normalizeId(attempt.userId),
    userName: attempt.userName || '',
    roleRequested: normalizeRole(attempt.roleRequested || 'user'),
    roleResolved: normalizeRole(attempt.roleResolved || 'user'),
    status: attempt.status || 'failed',
    verified: Boolean(attempt.verified),
    failureReason: attempt.failureReason || '',
    ipAddress: attempt.ipAddress || '',
    userAgent: attempt.userAgent || '',
    createdAt: attempt.createdAt || null,
  }
}

const recordLoginAttempt = async (payload) => {
  const attempt = buildAttempt(payload)
  const createdAt = new Date().toISOString()

  if (isMySqlConnected()) {
    const result = await executeMySql(
      `
        INSERT INTO login_attempts
          (user_id, email, user_name, role_requested, role_resolved, status, verified, failure_reason, ip_address, user_agent)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        attempt.userId || null,
        attempt.email,
        attempt.userName,
        attempt.roleRequested,
        attempt.roleResolved,
        attempt.status,
        attempt.verified ? 1 : 0,
        attempt.failureReason,
        attempt.ipAddress,
        attempt.userAgent,
      ],
    )

    return {
      ...attempt,
      id: String(result.insertId || ''),
      createdAt,
    }
  }

  if (isDbConnected()) {
    const created = await LoginAttempt.create(attempt)
    return serializeLoginAttempt(created)
  }

  const fallbackAttempt = {
    id: randomUUID(),
    ...attempt,
    createdAt,
  }

  mockStore.loginAttempts.unshift(fallbackAttempt)
  return clone(fallbackAttempt)
}

const updateUserLoginMetadata = async (userId, requestMeta = {}, verified = true) => {
  const lastLoginAt = new Date().toISOString()

  if (isMySqlConnected()) {
    await executeMySql(
      `
        UPDATE users
        SET
          login_count = COALESCE(login_count, 0) + 1,
          last_login_at = ?,
          last_login_ip = ?,
          last_login_verified = ?
        WHERE id = ?
      `,
      [lastLoginAt, requestMeta.ipAddress || '', verified ? 1 : 0, userId],
    )

    return
  }

  if (isDbConnected()) {
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { loginCount: 1 },
        lastLoginAt,
        lastLoginIp: requestMeta.ipAddress || '',
        lastLoginVerified: Boolean(verified),
      },
      { new: true },
    )
    return
  }

  const user = mockStore.users.find((candidate) => candidate.id === userId)
  if (user) {
    user.loginCount = Number(user.loginCount || 0) + 1
    user.lastLoginAt = lastLoginAt
    user.lastLoginIp = requestMeta.ipAddress || ''
    user.lastLoginVerified = Boolean(verified)
  }
}

const getLoginAttempts = async ({ limit = 100 } = {}) => {
  const safeLimit = Number.isFinite(Number(limit)) ? Math.max(1, Math.min(Number(limit), 500)) : 100

  if (isMySqlConnected()) {
    const rows = await executeMySql(
      `
        SELECT
          id,
          user_id,
          email,
          user_name,
          role_requested,
          role_resolved,
          status,
          verified,
          failure_reason,
          ip_address,
          user_agent,
          created_at
        FROM login_attempts
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `,
      [safeLimit],
    )

    return rows.map((row) => ({
      id: String(row.id),
      email: normalizeEmail(row.email),
      userId: normalizeId(row.user_id),
      userName: row.user_name || '',
      roleRequested: row.role_requested || 'user',
      roleResolved: row.role_resolved || 'user',
      status: row.status || 'failed',
      verified: Boolean(row.verified),
      failureReason: row.failure_reason || '',
      ipAddress: row.ip_address || '',
      userAgent: row.user_agent || '',
      createdAt: row.created_at || null,
    }))
  }

  if (isDbConnected()) {
    return (await LoginAttempt.find().sort({ createdAt: -1 }).limit(safeLimit)).map(
      serializeLoginAttempt,
    )
  }

  return clone(mockStore.loginAttempts.slice(0, safeLimit).map(serializeLoginAttempt))
}

module.exports = {
  getLoginAttempts,
  recordLoginAttempt,
  updateUserLoginMetadata,
}
