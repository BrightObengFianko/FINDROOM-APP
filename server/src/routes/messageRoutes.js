const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { getThreadsForUser, sendMessage } = require('../services/platformService')

const router = express.Router()

router.use(requireAuth)

router.get('/conversations', async (req, res) => {
  const threads = await getThreadsForUser(req.user)
  res.json({ threads })
})

router.post('/', async (req, res) => {
  const { roomId, recipientId, text } = req.body

  if (!roomId || !text) {
    return res.status(400).json({ message: 'roomId and text are required.' })
  }

  const thread = await sendMessage(req.user, { roomId, recipientId, text })
  res.status(201).json({ thread })
})

module.exports = router
