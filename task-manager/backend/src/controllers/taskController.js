const taskService = require('../services/taskService')

const resolveUserId = (req) => {
  if (!req.user || !req.user.user_id) {
    const err = new Error('Authenticated user is required')
    err.status = 401
    throw err
  }

  return req.user.user_id
}

const getTasks = async (req, res, next) => {
  try {
    const userId = resolveUserId(req)
    const tasks = await taskService.listTasks({
      userId,
      status: req.query.status,
      search: req.query.search,
    })
    res.json(tasks)
  } catch (err) {
    next(err)
  }
}

const addTask = async (req, res, next) => {
  try {
    const userId = resolveUserId(req)
    const { title, priority, deadline, deadlineNote, deadlineImage } = req.body
    const task = await taskService.createTask({
      title,
      priority,
      deadline,
      deadlineNote,
      deadlineImage,
      userId,
    })
    res.status(201).json(task)
  } catch (err) {
    next(err)
  }
}

const updateTask = async (req, res, next) => {
  try {
    const userId = resolveUserId(req)
    const taskId = Number(req.params.id)
    const { title, status, priority, deadline, deadlineNote, deadlineImage } = req.body
    const task = await taskService.updateTask({
      id: taskId,
      userId,
      title,
      status,
      priority,
      deadline,
      deadlineNote,
      deadlineImage,
    })

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json(task)
  } catch (err) {
    next(err)
  }
}

const removeTask = async (req, res, next) => {
  try {
    const userId = resolveUserId(req)
    const taskId = Number(req.params.id)
    await taskService.deleteTask({ id: taskId, userId })
    res.json({ message: 'Task deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  getTasks,
  addTask,
  updateTask,
  removeTask,
}
