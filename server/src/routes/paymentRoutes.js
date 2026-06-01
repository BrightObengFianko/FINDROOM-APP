const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { createMockPayment, getPaymentsForUser } = require('../services/platformService')

const router = express.Router()

router.use(requireAuth)

router.get('/me', async (req, res) => {
  const payments = await getPaymentsForUser(req.user)
  res.json({ payments })
})

router.post('/mock-checkout', async (req, res) => {
  const { bookingId } = req.body

  if (!bookingId) {
    return res.status(400).json({ message: 'bookingId is required.' })
  }

  const payment = await createMockPayment(req.user, bookingId)
  res.status(201).json({ payment })
})

module.exports = router
