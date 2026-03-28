const { sql, poolPromise } = require('../config/db')

const normalizePagination = ({ page = 1, pageSize = 10, maxPageSize = 50 } = {}) => {
  const normalizedPage = Math.max(1, Number(page) || 1)
  const normalizedPageSize = Math.min(maxPageSize, Math.max(1, Number(pageSize) || 10))

  return {
    page: normalizedPage,
    pageSize: normalizedPageSize,
    offset: (normalizedPage - 1) * normalizedPageSize,
  }
}

const listUsers = async ({ page, pageSize, search } = {}) => {
  const pagination = normalizePagination({ page, pageSize })
  const pool = await poolPromise
  const request = pool.request()
  const countRequest = pool.request()
  const conditions = []

  if (search && search.trim()) {
    const normalizedSearch = `%${search.trim()}%`
    conditions.push('(email LIKE @search OR username LIKE @search)')
    request.input('search', sql.NVarChar(255), normalizedSearch)
    countRequest.input('search', sql.NVarChar(255), normalizedSearch)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  request.input('offset', sql.Int, pagination.offset)
  request.input('pageSize', sql.Int, pagination.pageSize)

  const query = [
    'SELECT id, email, username, role, created_at',
    'FROM users',
    whereClause,
    'ORDER BY created_at DESC',
    'OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY',
  ].join('\n')

  const countQuery = [
    'SELECT COUNT(*) AS total',
    'FROM users',
    whereClause,
  ].join('\n')

  const [result, countResult] = await Promise.all([
    request.query(query),
    countRequest.query(countQuery),
  ])

  return {
    items: result.recordset,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: countResult.recordset[0]?.total || 0,
  }
}

const updateUserRole = async ({ id, role, currentUserId }) => {
  if (!id) {
    const error = new Error('User id is required')
    error.status = 400
    throw error
  }

  if (!['user', 'admin'].includes(role)) {
    const error = new Error('Role must be user or admin')
    error.status = 400
    throw error
  }

  if (Number(id) === Number(currentUserId) && role !== 'admin') {
    const error = new Error('Admin cannot remove their own admin role')
    error.status = 400
    throw error
  }

  const pool = await poolPromise
  const request = pool.request()
  request.input('id', sql.Int, id)
  request.input('role', sql.VarChar(32), role)

  const query = [
    'UPDATE users',
    'SET role = @role',
    'OUTPUT INSERTED.id, INSERTED.email, INSERTED.username, INSERTED.role, INSERTED.created_at',
    'WHERE id = @id',
  ].join('\n')

  const result = await request.query(query)
  return result.recordset[0] || null
}

const deleteUser = async ({ id, currentUserId }) => {
  if (!id) {
    const error = new Error('User id is required')
    error.status = 400
    throw error
  }

  if (Number(id) === Number(currentUserId)) {
    const error = new Error('Admin cannot delete their own account')
    error.status = 400
    throw error
  }

  const pool = await poolPromise
  const request = pool.request()
  request.input('id', sql.Int, id)

  await request.query('DELETE FROM tasks WHERE user_id = @id')
  const result = await request.query('DELETE FROM users WHERE id = @id')

  if (!result.rowsAffected[0]) {
    const error = new Error('User not found')
    error.status = 404
    throw error
  }

  return true
}

const listAllTasks = async ({ page, pageSize, status } = {}) => {
  const pagination = normalizePagination({ page, pageSize })
  const pool = await poolPromise
  const request = pool.request()
  const countRequest = pool.request()
  const conditions = []

  if (status && status.toLowerCase() !== 'all') {
    conditions.push('t.status = @status')
    request.input('status', sql.VarChar(10), status.toLowerCase())
    countRequest.input('status', sql.VarChar(10), status.toLowerCase())
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  request.input('offset', sql.Int, pagination.offset)
  request.input('pageSize', sql.Int, pagination.pageSize)

  const query = [
    'SELECT t.id, t.title, t.status, t.priority, t.deadline, t.deadline_note, t.deadline_image, t.completed_at, t.created_at,',
    'u.id AS user_id, u.email AS user_email, u.username AS username',
    'FROM tasks t',
    'INNER JOIN users u ON u.id = t.user_id',
    whereClause,
    'ORDER BY t.created_at DESC',
    'OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY',
  ].join('\n')

  const countQuery = [
    'SELECT COUNT(*) AS total',
    'FROM tasks t',
    whereClause,
  ].join('\n')

  const [result, countResult] = await Promise.all([
    request.query(query),
    countRequest.query(countQuery),
  ])

  return {
    items: result.recordset,
    page: pagination.page,
    pageSize: pagination.pageSize,
    total: countResult.recordset[0]?.total || 0,
  }
}

const deleteTaskAsAdmin = async (id) => {
  if (!id) {
    const error = new Error('Task id is required')
    error.status = 400
    throw error
  }

  const pool = await poolPromise
  const request = pool.request()
  request.input('id', sql.Int, id)

  const result = await request.query('DELETE FROM tasks WHERE id = @id')

  if (!result.rowsAffected[0]) {
    const error = new Error('Task not found')
    error.status = 404
    throw error
  }

  return true
}

module.exports = {
  listUsers,
  updateUserRole,
  deleteUser,
  listAllTasks,
  deleteTaskAsAdmin,
}
