const bcrypt = require('bcryptjs')
const { sql, poolPromise } = require('../config/db')

const normalizeEmail = (email) => (email || '').toLowerCase().trim()
const deriveUsername = (email, override) => {
  if (override && override.trim()) {
    return override.trim().replace(/\s+/g, '_').substring(0, 100)
  }

  const normalized = normalizeEmail(email)
  const localPart = normalized.split('@')[0] || 'user'
  return localPart.substring(0, 100)
}

const findUserByEmail = async (email) => {
  const normalized = normalizeEmail(email)
  const pool = await poolPromise
  const request = pool.request()
  request.input('email', sql.NVarChar(255), normalized)
  const { recordset } = await request.query(
    'SELECT id, email, username, password_hash, role FROM users WHERE email = @email'
  )
  return recordset[0] || null
}

const createUser = async ({ email, password, role = 'user', username }) => {
  const normalizedEmail = normalizeEmail(email)
  const existing = await findUserByEmail(normalizedEmail)
  if (existing) {
    const err = new Error('Email already registered')
    err.status = 409
    throw err
  }

  const finalUsername = deriveUsername(normalizedEmail, username)
  const passwordHash = await bcrypt.hash(password, 10)

  const pool = await poolPromise
  const request = pool.request()
  request.input('email', sql.NVarChar(255), normalizedEmail)
  request.input('username', sql.NVarChar(100), finalUsername)
  request.input('password', sql.NVarChar(255), passwordHash)
  request.input('role', sql.NVarChar(32), role)

  const query = [
    'INSERT INTO users (email, username, password_hash, role)',
    'OUTPUT INSERTED.id, INSERTED.email, INSERTED.username, INSERTED.role',
    'VALUES (@email, @username, @password, @role)',
  ].join('\n')

  const result = await request.query(query)
  return result.recordset[0]
}

const verifyCredentials = async ({ email, password }) => {
  const user = await findUserByEmail(email)
  if (!user) {
    const err = new Error('Invalid credentials')
    err.status = 401
    throw err
  }

  const isMatch = await bcrypt.compare(password, user.password_hash)
  if (!isMatch) {
    const err = new Error('Invalid credentials')
    err.status = 401
    throw err
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role || 'user',
  }
}

module.exports = {
  createUser,
  verifyCredentials,
  findUserByEmail,
}
