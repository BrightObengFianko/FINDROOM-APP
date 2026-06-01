const cors = require('cors')
const fs = require('node:fs')
const dotenv = require('dotenv')
const express = require('express')
const path = require('node:path')
const morgan = require('morgan')
const { connectDB, isDbConnected } = require('./src/config/db')
const { connectMySql, isMySqlConnected } = require('./src/config/mysql')
const adminRoutes = require('./src/routes/adminRoutes')
const authRoutes = require('./src/routes/authRoutes')
const bookingRoutes = require('./src/routes/bookingRoutes')
const dashboardRoutes = require('./src/routes/dashboardRoutes')
const messageRoutes = require('./src/routes/messageRoutes')
const paymentRoutes = require('./src/routes/paymentRoutes')
const roomRoutes = require('./src/routes/roomRoutes')
const { seedMongoDatabase } = require('./src/config/seed')
const userRoutes = require('./src/routes/userRoutes')

dotenv.config()

const app = express()
const port = process.env.PORT || 5000
const clientDistPath = path.join(__dirname, '..', 'client', 'dist')

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  }),
)
app.use(express.json())
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  const dataMode = isDbConnected() ? 'database' : 'mock'
  const authMode = isMySqlConnected() ? 'mysql' : isDbConnected() ? 'mongodb' : 'mock'

  res.json({
    status: 'ok',
    mode: isDbConnected() ? 'database' : isMySqlConnected() ? 'mock+mysql-auth' : 'mock',
    dataMode,
    authMode,
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/admin', adminRoutes)

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath))

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
}

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' })
})

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500
  res.status(statusCode).json({
    message: error.message || 'Internal server error',
  })
})

;(async () => {
  try {
    await Promise.allSettled([connectDB(), connectMySql()])
    await seedMongoDatabase()
  } catch (error) {
    console.error('FindRoom bootstrap encountered an error.', error)
  }

  app.listen(port, () => {
    console.log(`FindRoom API listening on port ${port}`)
  })
})()
