const jwt = require('jsonwebtoken')
const authService = require('../services/authService')

const JWT_SECRET = process.env.JWT_SECRET || 'task-manager-secret'
const JWT_TTL = '7d'

const createToken = (user) =>
  jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      username: user.username,
      role: user.role || 'user',
    },
    JWT_SECRET,
    { expiresIn: JWT_TTL }
  )

const toAuthResponse = (user, token) => ({
  token,
  user: {
    email: user.email,
    username: user.username,
    role: user.role || 'user',
  },
})

const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body
    if (!email || !password) {
      const err = new Error('Email and password are required')
      err.status = 400
      throw err
    }

    const user = await authService.createUser({ email, password, username })
    const token = createToken(user)

    res.status(201).json(toAuthResponse(user, token))
  } catch (err) {
    next(err)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      const err = new Error('Email and password are required')
      err.status = 400
      throw err
    }

    const user = await authService.verifyCredentials({ email, password })
    const token = createToken(user)

    res.json(toAuthResponse(user, token))
  } catch (err) {
    next(err)
  }
}

module.exports = {
  register,
  login,
}
