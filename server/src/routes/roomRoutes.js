const express = require('express')
const { getRoomById, getRooms } = require('../services/platformService')

const router = express.Router()

router.get('/', async (req, res) => {
  const rooms = await getRooms(req.query)
  res.json({ rooms })
})

router.get('/:roomId', async (req, res) => {
  const room = await getRoomById(req.params.roomId)

  if (!room) {
    return res.status(404).json({ message: 'Room not found.' })
  }

  return res.json({ room })
})

module.exports = router
