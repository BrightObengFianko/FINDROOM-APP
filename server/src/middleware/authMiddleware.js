const jwt = require('jsonwebtoken')
const { findUserById } = require('../services/platformService')
const { applyUserRoles } = require('../utils/roles')

const signToken = (user) =>
  jwt.sign(
    {
      userId: user.id,
      role: applyUserRoles(user, user.role)?.role,
      roles: applyUserRoles(user, user.role)?.roles,
    },
    process.env.JWT_SECRET || 'findroom-dev-secret',
    { expiresIn: '7d' },
  )

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required.' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'findroom-dev-secret')
    const user = await findUserById(payload.userId)

    if (!user) {
      return res.status(401).json({ message: 'User not found.' })
    }

    req.user = applyUserRoles(user, payload.role)
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' })
  }
}

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have access to this resource.' })
  }

  next()
}

module.exports = { authorizeRoles, requireAuth, signToken }
