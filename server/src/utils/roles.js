const supportedRoles = ['admin', 'landlord', 'user']
const privilegedRoleEmails = new Map([
  ['brightobengfianko@gmail.com', supportedRoles],
])

const normalizeEmailValue = (email = '') => String(email).trim().toLowerCase()

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

const resolveAllowedRoles = ({ email, role, roles }) => {
  const baseRoles = normalizeRoles(roles, role || 'user')
  const privilegedRoles = privilegedRoleEmails.get(normalizeEmailValue(email))

  if (!privilegedRoles) {
    return baseRoles
  }

  return normalizeRoles([...baseRoles, ...privilegedRoles], role || 'user')
}

const resolveActiveRole = (user, preferredRole) => {
  const allowedRoles = resolveAllowedRoles(user)

  if (preferredRole && allowedRoles.includes(preferredRole)) {
    return preferredRole
  }

  if (user?.role && allowedRoles.includes(user.role)) {
    return user.role
  }

  return allowedRoles[0] || 'user'
}

const applyUserRoles = (user, preferredRole) => {
  if (!user) {
    return null
  }

  const roles = resolveAllowedRoles(user)

  return {
    ...user,
    role: resolveActiveRole({ ...user, roles }, preferredRole),
    roles,
  }
}

const canAssumeRole = (user, role) => {
  if (!role) {
    return true
  }

  return resolveAllowedRoles(user).includes(role)
}

module.exports = {
  applyUserRoles,
  canAssumeRole,
  parseRoles,
  resolveAllowedRoles,
  supportedRoles,
}
