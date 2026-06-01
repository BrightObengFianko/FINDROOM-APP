const bcrypt = require('bcryptjs')
const { executeMySql } = require('../config/mysql')
const {
  recordLoginAttempt,
  updateUserLoginMetadata,
} = require('./loginAuditService')
const {
  createAvatarFallback,
  normalizeEmail,
  serializeMySqlUser,
} = require('../utils/userHelpers')
const { applyUserRoles, canAssumeRole, resolveAllowedRoles } = require('../utils/roles')

const userColumns = `
  id,
  full_name,
  email,
  role,
  roles_json,
  landlord_verification_status,
  landlord_verification_submitted_at,
  landlord_verification_reviewed_at,
  landlord_verification,
  phone,
  bio,
  avatar,
  login_count,
  last_login_at,
  last_login_ip,
  last_login_verified,
  status,
  created_at
`

const userColumnsWithPassword = `${userColumns}, password_hash`

const findMySqlUserRecordByEmail = async (email) => {
  const rows = await executeMySql(
    `SELECT ${userColumnsWithPassword} FROM users WHERE email = ? LIMIT 1`,
    [normalizeEmail(email)],
  )

  return rows[0] || null
}

const findMySqlUserByEmail = async (email) =>
  serializeMySqlUser(await findMySqlUserRecordByEmail(email))

const findMySqlUserById = async (userId) => {
  const rows = await executeMySql(
    `SELECT ${userColumns} FROM users WHERE id = ? LIMIT 1`,
    [userId],
  )

  return serializeMySqlUser(rows[0])
}

const createMySqlUser = async (payload) => {
  const passwordHash = await bcrypt.hash(payload.password, 10)
  const allowedRoles = resolveAllowedRoles(payload)
  const createdUser = applyUserRoles(
    {
      email: payload.email,
      role: payload.role || 'user',
      roles: allowedRoles,
    },
    payload.role,
  )
  const result = await executeMySql(
    `
      INSERT INTO users
        (
          full_name,
          email,
          password_hash,
          role,
          roles_json,
          phone,
          bio,
          avatar,
          login_count,
          last_login_at,
          last_login_ip,
          last_login_verified,
          status
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.name,
      normalizeEmail(payload.email),
      passwordHash,
      createdUser.role,
      JSON.stringify(createdUser.roles),
      payload.phone || '',
      payload.bio || '',
      payload.avatar || createAvatarFallback(payload.name),
      Number(payload.loginCount || 0),
      payload.lastLoginAt || '',
      payload.lastLoginIp || '',
      payload.lastLoginVerified ? 1 : 0,
      payload.status || 'active',
    ],
  )

  return findMySqlUserById(result.insertId)
}

const authenticateMySqlUser = async ({ email, password, role, requestMeta = {} }) => {
  const user = await findMySqlUserRecordByEmail(email)

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
      user: {
        id: String(user.id),
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
      roleRequested: role,
      roleResolved: user.role,
      status: 'failed',
      verified: false,
      failureReason: 'role_not_allowed',
      requestMeta,
    })
    return null
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash)
  if (!passwordMatches) {
    await recordLoginAttempt({
      email: user.email,
      user: {
        id: String(user.id),
        name: user.full_name,
        email: user.email,
        role: user.role,
      },
      roleRequested: role,
      roleResolved: user.role,
      status: 'failed',
      verified: false,
      failureReason: 'invalid_password',
      requestMeta,
    })
    return null
  }

  const activeUser = applyUserRoles(serializeMySqlUser(user), role)

  await updateUserLoginMetadata(String(user.id), requestMeta, true)
  await recordLoginAttempt({
    email: user.email,
    user: {
      id: String(user.id),
      name: user.full_name,
      email: user.email,
      role: user.role,
    },
    roleRequested: role,
    roleResolved: activeUser.role,
    status: 'success',
    verified: true,
    requestMeta,
  })

  return activeUser
}

const updateMySqlUser = async (userId, updates) => {
  const currentUser = await findMySqlUserById(userId)

  if (!currentUser) {
    return null
  }

  await executeMySql(
    `
      UPDATE users
      SET
        full_name = ?,
        email = ?,
        phone = ?,
        bio = ?,
        avatar = ?,
        status = ?
      WHERE id = ?
    `,
    [
      updates.name ?? currentUser.name,
      updates.email ? normalizeEmail(updates.email) : currentUser.email,
      updates.phone ?? currentUser.phone,
      updates.bio ?? currentUser.bio,
      updates.avatar ?? currentUser.avatar,
      updates.status ?? currentUser.status,
      userId,
    ],
  )

  return findMySqlUserById(userId)
}

const getMySqlUsers = async () => {
  const rows = await executeMySql(`SELECT ${userColumns} FROM users ORDER BY created_at DESC`)
  return rows.map(serializeMySqlUser)
}

const countMySqlUsers = async () => {
  const rows = await executeMySql('SELECT COUNT(*) AS total FROM users')
  return Number(rows[0]?.total || 0)
}

const deleteMySqlUserById = async (userId) => {
  await executeMySql('DELETE FROM users WHERE id = ?', [userId])
}

module.exports = {
  authenticateMySqlUser,
  countMySqlUsers,
  createMySqlUser,
  deleteMySqlUserById,
  findMySqlUserByEmail,
  findMySqlUserById,
  getMySqlUsers,
  updateMySqlUser,
}
