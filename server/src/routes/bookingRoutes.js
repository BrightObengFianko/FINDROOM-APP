const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { createBooking, getBookingsForUser } = require('../services/platformService')

const router = express.Router()

router.use(requireAuth)

router.get('/me', async (req, res) => {
  const bookings = await getBookingsForUser(req.user)
  res.json({ bookings })
})

router.post('/', async (req, res) => {
  const { roomId } = req.body

  if (!roomId) {
    return res.status(400).json({ message: 'roomId is required.' })
  }

  const booking = await createBooking(req.user, roomId)
  res.status(201).json({ booking })
})

module.exports = router
