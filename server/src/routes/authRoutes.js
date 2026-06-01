const express = require('express')
const { findUserByEmail, createUser, authenticateUser } = require('../services/platformService')
const { signToken } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/signup', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' })
  }

  const existingUser = await findUserByEmail(email)
  if (existingUser) {
    return res.status(409).json({ message: 'An account with that email already exists.' })
  }

  const user = await createUser({ name, email, password, role })
  return res.status(201).json({ token: signToken(user), user })
})

router.post('/login', async (req, res) => {
  const { email, password, role } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  const user = await authenticateUser(
    { email, password, role },
    {
      ipAddress:
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.ip ||
        req.socket?.remoteAddress ||
        '',
      userAgent: req.get('user-agent') || '',
    },
  )
  if (!user) {
    return res.status(401).json({ message: 'Invalid login credentials.' })
  }

  return res.json({ token: signToken(user), user })
})

module.exports = router
