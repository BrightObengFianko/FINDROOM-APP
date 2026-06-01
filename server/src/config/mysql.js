const fs = require('node:fs/promises')
const path = require('node:path')
const bcrypt = require('bcryptjs')
const mysql = require('mysql2/promise')
const { mockStore } = require('../data/mockStore')
const { normalizeEmail } = require('../utils/userHelpers')

const defaultDatabase = 'findroom_db'
const requiredColumns = [
  { name: 'roles_json', definition: 'JSON NULL' },
  {
    name: 'landlord_verification_status',
    definition:
      "ENUM('not_submitted', 'pending', 'approved', 'rejected') NOT NULL DEFAULT 'not_submitted'",
  },
  {
    name: 'landlord_verification_submitted_at',
    definition: "VARCHAR(50) NOT NULL DEFAULT ''",
  },
  {
    name: 'landlord_verification_reviewed_at',
    definition: "VARCHAR(50) NOT NULL DEFAULT ''",
  },
  { name: 'landlord_verification', definition: 'JSON NULL' },
  { name: 'phone', definition: "VARCHAR(50) NOT NULL DEFAULT ''" },
  { name: 'bio', definition: 'TEXT NULL' },
  { name: 'avatar', definition: "VARCHAR(255) NOT NULL DEFAULT ''" },
  { name: 'login_count', definition: 'INT NOT NULL DEFAULT 0' },
  { name: 'last_login_at', definition: "VARCHAR(50) NOT NULL DEFAULT ''" },
  { name: 'last_login_ip', definition: "VARCHAR(100) NOT NULL DEFAULT ''" },
  { name: 'last_login_verified', definition: 'TINYINT(1) NOT NULL DEFAULT 0' },
  {
    name: 'status',
    definition: "ENUM('active', 'blocked') NOT NULL DEFAULT 'active'",
  },
]

let pool = null
let mySqlConnected = false

const getMySqlDatabase = () => process.env.MYSQL_DATABASE || defaultDatabase

const hasMySqlConfig = () => Boolean(process.env.MYSQL_HOST && process.env.MYSQL_USER)

const createBaseConfig = () => ({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD || '',
})

const createPoolConfig = () => ({
  ...createBaseConfig(),
  database: getMySqlDatabase(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

const legacyDemoEmails = [
  'ama.serwaa@findroom.local',
  'kwaku.mensah@findroom.local',
  'user@findroom.dev',
  'landlord@findroom.dev',
  'admin@findroom.dev',
  'david@example.com',
]

const readInitSql = async () =>
  fs.readFile(path.join(__dirname, '..', '..', 'sql', 'init-findroom-db.sql'), 'utf8')

const ensureExtendedUserColumns = async (connection) => {
  const [rows] = await connection.execute(
    `
      SELECT COLUMN_NAME
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'users'
    `,
    [getMySqlDatabase()],
  )

  const existingColumns = new Set(rows.map((row) => row.COLUMN_NAME))

  for (const column of requiredColumns) {
    if (existingColumns.has(column.name)) {
      continue
    }

    await connection.query(`ALTER TABLE users ADD COLUMN ${column.name} ${column.definition}`)
  }
}

const clearLegacyDemoUsers = async (connection) => {
  if (!legacyDemoEmails.length) {
    return
  }

  await connection.execute(
    `DELETE FROM users WHERE LOWER(email) IN (${legacyDemoEmails.map(() => '?').join(', ')})`,
    legacyDemoEmails.map((email) => normalizeEmail(email)),
  )
}

const seedDemoUsers = async (connection) => {
  await clearLegacyDemoUsers(connection)

  for (const user of mockStore.users) {
    const passwordHash = await bcrypt.hash(user.password, 10)

    await connection.execute(
      `
        INSERT INTO users
          (
            full_name,
            email,
            password_hash,
            role,
            roles_json,
            landlord_verification_status,
            landlord_verification_submitted_at,
            landlord_verification_reviewed_at,
            landlord_verification,
            phone,
            bio,
            avatar,
            login_count,
            last_login_at,
            last_login_ip,
            last_login_verified,
            status
          )
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          full_name = VALUES(full_name),
          role = VALUES(role),
          roles_json = VALUES(roles_json),
          landlord_verification_status = VALUES(landlord_verification_status),
          landlord_verification_submitted_at = VALUES(landlord_verification_submitted_at),
          landlord_verification_reviewed_at = VALUES(landlord_verification_reviewed_at),
          landlord_verification = VALUES(landlord_verification),
          phone = VALUES(phone),
          bio = VALUES(bio),
          avatar = VALUES(avatar),
          status = VALUES(status)
      `,
      [
        user.name,
        normalizeEmail(user.email),
        passwordHash,
        user.role,
        user.roles ? JSON.stringify(user.roles) : null,
        user.landlordVerificationStatus || 'not_submitted',
        user.landlordVerificationSubmittedAt || '',
        user.landlordVerificationReviewedAt || '',
        user.landlordVerification ? JSON.stringify(user.landlordVerification) : null,
        user.phone || '',
        user.bio || '',
        user.avatar || '',
        Number(user.loginCount || 0),
        user.lastLoginAt || '',
        user.lastLoginIp || '',
        user.lastLoginVerified ? 1 : 0,
        user.status || 'active',
      ],
    )
  }
}

const connectMySql = async () => {
  if (mySqlConnected && pool) {
    return true
  }

  if (!hasMySqlConfig()) {
    console.log('MySQL config not found. Auth will use MongoDB or mock mode.')
    return false
  }

  let bootstrapConnection = null

  try {
    bootstrapConnection = await mysql.createConnection({
      ...createBaseConfig(),
      multipleStatements: true,
    })

    await bootstrapConnection.query(await readInitSql())
    await ensureExtendedUserColumns(bootstrapConnection)
    await seedDemoUsers(bootstrapConnection)
    await bootstrapConnection.end()
    bootstrapConnection = null

    pool = mysql.createPool(createPoolConfig())
    await pool.query('SELECT 1')
    mySqlConnected = true

    console.log(`MySQL connected for FindRoom auth using database ${getMySqlDatabase()}.`)
    return true
  } catch (error) {
    mySqlConnected = false

    if (bootstrapConnection) {
      await bootstrapConnection.end().catch(() => {})
    }

    if (pool) {
      await pool.end().catch(() => {})
      pool = null
    }

    console.warn(`MySQL connection failed. Falling back to MongoDB/mock auth. ${error.message}`)
    return false
  }
}

const executeMySql = async (sql, params = []) => {
  if (!pool) {
    throw new Error('MySQL pool is not initialized.')
  }

  const [rows] = await pool.execute(sql, params)
  return rows
}

const isMySqlConnected = () => mySqlConnected

module.exports = {
  connectMySql,
  executeMySql,
  isMySqlConnected,
}
