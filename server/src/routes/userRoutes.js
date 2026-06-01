const express = require('express')
const multer = require('multer')
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary')
const { requireAuth } = require('../middleware/authMiddleware')
const { createAvatarFallback, updateCurrentUser } = require('../services/platformService')
const { applyUserRoles } = require('../utils/roles')

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'findroom/avatars' },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        resolve(result)
      },
    )

    stream.end(buffer)
  })

router.use(requireAuth)

router.put('/me', async (req, res) => {
  const user = await updateCurrentUser(req.user.id, req.body)
  res.json({ user: applyUserRoles(user, req.user.role) })
})

router.post('/me/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'An avatar file is required.' })
  }

  if (isCloudinaryConfigured) {
    const result = await uploadToCloudinary(req.file.buffer)
    return res.json({ avatarUrl: result.secure_url })
  }

  return res.json({ avatarUrl: createAvatarFallback(req.user.name) })
})

module.exports = router
