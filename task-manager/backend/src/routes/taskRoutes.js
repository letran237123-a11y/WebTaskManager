const express = require('express')
const taskController = require('../controllers/taskController')
const { requireAuth } = require('../middleware/authMiddleware')

const router = express.Router()
router.use(requireAuth)

router.get('/tasks', taskController.getTasks)
router.post('/tasks', taskController.addTask)
router.put('/tasks/:id', taskController.updateTask)
router.delete('/tasks/:id', taskController.removeTask)

module.exports = router
