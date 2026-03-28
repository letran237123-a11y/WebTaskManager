import { useCallback, useEffect, useState } from 'react'
import AppShell from '../../components/common/AppShell'
import { useAuth } from '../../context/AuthContext'
import {
  deleteAdminTask,
  deleteUser,
  fetchAdminTasks,
  fetchAdminUsers,
  getPrettyError,
  updateUserRole,
} from '../../services/api'

const initialUsersState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
}

const initialTasksState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
}

const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '-')
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : 'No deadline')

const AdminDashboardPage = () => {
  const { user, logout } = useAuth()
  const [usersData, setUsersData] = useState(initialUsersState)
  const [tasksData, setTasksData] = useState(initialTasksState)
  const [userSearch, setUserSearch] = useState('')
  const [taskStatus, setTaskStatus] = useState('all')
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')

  const loadUsers = useCallback(async (page = usersData.page, search = userSearch) => {
    setLoadingUsers(true)
    try {
      const response = await fetchAdminUsers({
        page,
        pageSize: usersData.pageSize,
        search,
      })
      setUsersData(response)
    } catch (err) {
      setError(getPrettyError(err))
    } finally {
      setLoadingUsers(false)
    }
  }, [userSearch, usersData.page, usersData.pageSize])

  const loadTasks = useCallback(async (page = tasksData.page, status = taskStatus) => {
    setLoadingTasks(true)
    try {
      const response = await fetchAdminTasks({
        page,
        pageSize: tasksData.pageSize,
        status,
      })
      setTasksData(response)
    } catch (err) {
      setError(getPrettyError(err))
    } finally {
      setLoadingTasks(false)
    }
  }, [taskStatus, tasksData.page, tasksData.pageSize])

  useEffect(() => {
    loadUsers(1, userSearch)
  }, [loadUsers, userSearch])

  useEffect(() => {
    loadTasks(1, taskStatus)
  }, [loadTasks, taskStatus])

  const runAction = async (key, action) => {
    setBusyAction(key)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(getPrettyError(err))
    } finally {
      setBusyAction('')
    }
  }

  const handleRoleChange = async (targetUser, role) => {
    await runAction(`role-${targetUser.id}`, async () => {
      await updateUserRole(targetUser.id, role)
      await loadUsers(usersData.page, userSearch)
    })
  }

  const handleDeleteUser = async (targetUser) => {
    const confirmed = window.confirm(`Delete user ${targetUser.email}? This also removes their tasks.`)
    if (!confirmed) {
      return
    }

    await runAction(`delete-user-${targetUser.id}`, async () => {
      await deleteUser(targetUser.id)
      await Promise.all([loadUsers(usersData.page, userSearch), loadTasks(tasksData.page, taskStatus)])
    })
  }

  const handleDeleteTask = async (task) => {
    const confirmed = window.confirm(`Delete task "${task.title}" from ${task.user_email}?`)
    if (!confirmed) {
      return
    }

    await runAction(`delete-task-${task.id}`, async () => {
      await deleteAdminTask(task.id)
      await loadTasks(tasksData.page, taskStatus)
    })
  }

  const userTotalPages = Math.max(1, Math.ceil(usersData.total / usersData.pageSize))
  const taskTotalPages = Math.max(1, Math.ceil(tasksData.total / tasksData.pageSize))

  return (
    <AppShell
      user={user}
      onLogout={logout}
      title="Admin panel"
      subtitle="Monitor accounts, deadlines, and completion history across the whole system."
    >
      {error && <div className="alert alert--danger">{error}</div>}

      <section className="panel">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Users Management</p>
            <h3>All users</h3>
          </div>
          <label className="table-search">
            <span>Search by email or username</span>
            <input
              type="search"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              placeholder="Search users"
            />
          </label>
        </div>

        {loadingUsers ? (
          <p>Loading users...</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.email}</td>
                      <td>{item.username}</td>
                      <td>
                        <select
                          value={item.role}
                          onChange={(event) => handleRoleChange(item, event.target.value)}
                          disabled={busyAction === `role-${item.id}`}
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDeleteUser(item)}
                          disabled={busyAction === `delete-user-${item.id}` || item.email === user?.email}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!usersData.items.length && (
                    <tr>
                      <td colSpan="4" className="table-empty">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination-row">
              <span>{usersData.total} users</span>
              <div>
                <button
                  type="button"
                  className="ghost-button"
                  disabled={usersData.page <= 1}
                  onClick={() => loadUsers(usersData.page - 1, userSearch)}
                >
                  Previous
                </button>
                <span>Page {usersData.page} / {userTotalPages}</span>
                <button
                  type="button"
                  className="ghost-button"
                  disabled={usersData.page >= userTotalPages}
                  onClick={() => loadUsers(usersData.page + 1, userSearch)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="panel panel--admin-tasks">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Tasks Management</p>
            <h3>All tasks</h3>
          </div>
          <label className="table-search table-search--compact">
            <span>Filter by status</span>
            <select value={taskStatus} onChange={(event) => setTaskStatus(event.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="done">Done</option>
            </select>
          </label>
        </div>

        {loadingTasks ? (
          <p>Loading tasks...</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Deadline</th>
                    <th>Completed</th>
                    <th>User</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasksData.items.map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td><span className={`status-pill status-pill--${task.status}`}>{task.status}</span></td>
                      <td>{task.priority}</td>
                      <td>{formatDate(task.deadline)}</td>
                      <td>{formatDateTime(task.completed_at)}</td>
                      <td>
                        <strong>{task.username}</strong>
                        <div>{task.user_email}</div>
                      </td>
                      <td>{formatDateTime(task.created_at)}</td>
                      <td>
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() => handleDeleteTask(task)}
                          disabled={busyAction === `delete-task-${task.id}`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!tasksData.items.length && (
                    <tr>
                      <td colSpan="8" className="table-empty">No tasks found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination-row">
              <span>{tasksData.total} tasks</span>
              <div>
                <button
                  type="button"
                  className="ghost-button"
                  disabled={tasksData.page <= 1}
                  onClick={() => loadTasks(tasksData.page - 1, taskStatus)}
                >
                  Previous
                </button>
                <span>Page {tasksData.page} / {taskTotalPages}</span>
                <button
                  type="button"
                  className="ghost-button"
                  disabled={tasksData.page >= taskTotalPages}
                  onClick={() => loadTasks(tasksData.page + 1, taskStatus)}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </AppShell>
  )
}

export default AdminDashboardPage
