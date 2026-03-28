const bcrypt = require('bcryptjs')
const { sql, poolPromise } = require('./src/config/db')
const authService = require('./src/services/authService')

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@taskhq.local'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123!'

const createAdmin = async () => {
  try {
    console.log('Ensuring admin ' + ADMIN_EMAIL)
    await authService.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      username: 'admin',
    })
    console.log('Admin account created or already existed.')
  } catch (error) {
    if (error.status === 409) {
      console.log('Admin already exists.')
    } else {
      console.error('Failed to create admin account', error)
    }
  } finally {
    poolPromise.then((pool) => pool.close())
  }
}

createAdmin()
