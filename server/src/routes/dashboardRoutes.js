const express = require('express')
const { requireAuth } = require('../middleware/authMiddleware')
const { getDashboardOverview } = require('../services/platformService')

const router = express.Router()

router.use(requireAuth)

router.get('/overview', async (req, res) => {
  const recentActivity = await getDashboardOverview(req.user)
  res.json({ recentActivity })
})

module.exports = router
