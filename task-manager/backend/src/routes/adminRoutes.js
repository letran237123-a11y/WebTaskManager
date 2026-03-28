const express = require('express')
const adminController = require('../controllers/adminController')
const { requireAuth, requireRole } = require('../middleware/authMiddleware')

const router = express.Router()

router.use(requireAuth, requireRole('admin'))

router.get('/users', adminController.getUsers)
router.put('/users/:id/role', adminController.changeUserRole)
router.delete('/users/:id', adminController.removeUser)
router.get('/tasks', adminController.getTasks)
router.delete('/tasks/:id', adminController.removeTask)

module.exports = router
