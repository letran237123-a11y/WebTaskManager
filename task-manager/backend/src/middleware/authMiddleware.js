const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'task-manager-secret'

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    const err = new Error('Authentication token missing')
    err.status = 401
    return next(err)
  }

  const token = header.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (error) {
    const err = new Error('Invalid or expired session')
    err.status = 401
    next(err)
  }
}

const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'Forbidden' })
  }

  next()
}

module.exports = {
  requireAuth,
  requireRole,
}
