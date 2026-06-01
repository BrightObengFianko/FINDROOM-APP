const fs = require('node:fs/promises')
const path = require('node:path')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let memoryServer = null

const getMongoUri = async () => {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI
  }

  if (!memoryServer) {
    const dbPath = path.join(__dirname, '..', '..', '.mongo-data')
    await fs.mkdir(dbPath, { recursive: true })

    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger',
      },
    })

    console.log(`Embedded MongoDB started for FindRoom at ${memoryServer.getUri()}`)
  }

  return memoryServer.getUri()
}

const connectDB = async () => {
  try {
    const uri = await getMongoUri()
    const connectionOptions = process.env.MONGO_URI
      ? undefined
      : { dbName: process.env.MONGO_DB_NAME || 'findroom_db' }

    await mongoose.connect(uri, connectionOptions)

    console.log(
      process.env.MONGO_URI
        ? 'MongoDB connected for FindRoom.'
        : `Embedded MongoDB connected for FindRoom database ${process.env.MONGO_DB_NAME || 'findroom_db'}.`,
    )
    return true
  } catch (error) {
    console.warn(`MongoDB connection failed. Falling back to mock mode. ${error.message}`)
    return false
  }
}

const isDbConnected = () => mongoose.connection.readyState === 1

module.exports = { connectDB, isDbConnected }
