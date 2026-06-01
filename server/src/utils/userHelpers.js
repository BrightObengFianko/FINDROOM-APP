const { applyUserRoles, parseRoles } = require('./roles')

const normalizeEmail = (email = '') => String(email).trim().toLowerCase()

const createAvatarFallback = (name = 'FindRoom') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0f172a&color=ffffff`

const parseMaybeJson = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') {
    return fallback
  }

  if (typeof value === 'object') {
    return value
  }

  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const serializeMySqlUser = (row) => {
  if (!row) {
    return null
  }

  return applyUserRoles({
    id: String(row.id),
    name: row.full_name,
    email: normalizeEmail(row.email),
    role: row.role || 'user',
    roles: parseRoles(row.roles_json),
    landlordVerificationStatus: row.landlord_verification_status || 'not_submitted',
    landlordVerificationSubmittedAt: row.landlord_verification_submitted_at || '',
    landlordVerificationReviewedAt: row.landlord_verification_reviewed_at || '',
    landlordVerification: parseMaybeJson(row.landlord_verification, null),
    phone: row.phone || '',
    bio: row.bio || '',
    avatar: row.avatar || createAvatarFallback(row.full_name),
    loginCount: Number(row.login_count || 0),
    lastLoginAt: row.last_login_at || '',
    lastLoginIp: row.last_login_ip || '',
    lastLoginVerified: Boolean(row.last_login_verified),
    status: row.status || 'active',
    createdAt: row.created_at || row.createdAt || null,
  })
}

const normalizeUserId = (value) =>
  typeof value === 'string' ? value : value?.toString?.() || ''

const resolveScopedUserId = (user, users = []) => {
  const targetId = normalizeUserId(user?.id)
  const targetEmail = normalizeEmail(user?.email)

  const matchedUser = users.find(
    (candidate) =>
      normalizeUserId(candidate.id) === targetId ||
      normalizeEmail(candidate.email) === targetEmail,
  )

  return matchedUser ? normalizeUserId(matchedUser.id) : targetId
}

module.exports = {
  createAvatarFallback,
  normalizeEmail,
  normalizeUserId,
  resolveScopedUserId,
  serializeMySqlUser,
}
