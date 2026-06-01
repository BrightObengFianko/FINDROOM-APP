const supportedRoles = ['admin', 'landlord', 'user']
const privilegedRoleEmails = new Map([
  ['brightobengfianko@gmail.com', supportedRoles],
])

const normalizeEmail = (email = '') => String(email).trim().toLowerCase()

const parseRoles = (value) => {
  if (Array.isArray(value)) {
    return value
  }

  if (!value) {
    return []
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()

    if (!trimmed) {
      return []
    }

    try {
      const parsed = JSON.parse(trimmed)
      return Array.isArray(parsed) ? parsed : [trimmed]
    } catch {
      return [trimmed]
    }
  }

  return []
}

const normalizeRoles = (roles, fallbackRole = 'user') => {
  const allowedRoles = new Set(
    parseRoles(roles).filter((role) => supportedRoles.includes(role)),
  )

  if (!allowedRoles.size && supportedRoles.includes(fallbackRole)) {
    allowedRoles.add(fallbackRole)
  }

  return supportedRoles.filter((role) => allowedRoles.has(role))
}

export const resolveAllowedRoles = (user = {}) => {
  const baseRoles = normalizeRoles(user.roles, user.role || 'user')
  const privilegedRoles = privilegedRoleEmails.get(normalizeEmail(user.email))

  if (!privilegedRoles) {
    return baseRoles
  }

  return normalizeRoles([...baseRoles, ...privilegedRoles], user.role || 'user')
}

export const hydrateUserRoles = (user, preferredRole) => {
  if (!user) {
    return null
  }

  const roles = resolveAllowedRoles(user)
  const activeRole =
    preferredRole && roles.includes(preferredRole)
      ? preferredRole
      : user.role && roles.includes(user.role)
        ? user.role
        : roles[0] || 'user'

  return {
    ...user,
    role: activeRole,
    roles,
  }
}

export const canAssumeRole = (user, role) => {
  if (!role) {
    return true
  }

  return resolveAllowedRoles(user).includes(role)
}

export const formatUserRoles = (user) =>
  hydrateUserRoles(user)?.roles.join(' / ') || user?.role || 'user'
