const express = require('express')
const { authorizeRoles, requireAuth } = require('../middleware/authMiddleware')
const {
  deleteUserById,
  getAdminStats,
  getAdminLoginAttempts,
  getAdminUsers,
  reviewLandlordVerification,
  updateRoomStatus,
} = require('../services/platformService')

const router = express.Router()

router.use(requireAuth)
router.use(authorizeRoles('admin'))

router.get('/stats', async (req, res) => {
  const stats = await getAdminStats()
  res.json({ stats })
})

router.get('/users', async (req, res) => {
  const users = await getAdminUsers()
  res.json({ users })
})

router.get('/login-attempts', async (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100
  const attempts = await getAdminLoginAttempts(limit)
  res.json({ attempts })
})

router.patch('/users/:userId/verification', async (req, res) => {
  const { status } = req.body

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ message: 'status must be approved, rejected, or pending.' })
  }

  const user = await reviewLandlordVerification(req.params.userId, status)

  if (!user) {
    return res.status(404).json({ message: 'User not found.' })
  }

  res.json({ user })
})

router.patch('/listings/:roomId/status', async (req, res) => {
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ message: 'status is required.' })
  }

  const room = await updateRoomStatus(req.params.roomId, status)
  res.json({ room })
})

router.delete('/users/:userId', async (req, res) => {
  await deleteUserById(req.params.userId)
  res.status(204).send()
})

module.exports = router
