const adminService = require('../services/adminService')

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.listUsers({
      page: req.query.page,
      pageSize: req.query.pageSize,
      search: req.query.search,
    })

    res.json(users)
  } catch (error) {
    next(error)
  }
}

const changeUserRole = async (req, res, next) => {
  try {
    const user = await adminService.updateUserRole({
      id: Number(req.params.id),
      role: req.body.role,
      currentUserId: req.user.user_id,
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}

const removeUser = async (req, res, next) => {
  try {
    await adminService.deleteUser({
      id: Number(req.params.id),
      currentUserId: req.user.user_id,
    })

    res.json({ message: 'User deleted' })
  } catch (error) {
    next(error)
  }
}

const getTasks = async (req, res, next) => {
  try {
    const tasks = await adminService.listAllTasks({
      page: req.query.page,
      pageSize: req.query.pageSize,
      status: req.query.status,
    })

    res.json(tasks)
  } catch (error) {
    next(error)
  }
}

const removeTask = async (req, res, next) => {
  try {
    await adminService.deleteTaskAsAdmin(Number(req.params.id))
    res.json({ message: 'Task deleted' })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getUsers,
  changeUserRole,
  removeUser,
  getTasks,
  removeTask,
}
