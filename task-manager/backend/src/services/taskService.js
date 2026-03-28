const { sql, poolPromise } = require('../config/db')

const VALID_STATUSES = ['pending', 'done']
const VALID_PRIORITIES = ['low', 'medium', 'high']
const DEFAULT_PRIORITY = 'low'
const DEFAULT_STATUS = 'pending'

const sanitizePriority = (priority) => {
  if (!priority) return DEFAULT_PRIORITY
  const normalized = priority.toLowerCase()
  return VALID_PRIORITIES.includes(normalized) ? normalized : DEFAULT_PRIORITY
}

const sanitizeStatus = (status) => {
  if (!status) return DEFAULT_STATUS
  const normalized = status.toLowerCase()
  return VALID_STATUSES.includes(normalized) ? normalized : DEFAULT_STATUS
}

const normalizeDeadline = (deadline) => {
  if (!deadline) {
    return null
  }

  const parsed = new Date(deadline)
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error('Deadline must be a valid date')
    error.status = 400
    throw error
  }

  return parsed
}

const normalizeDeadlineNote = (note) => {
  if (!note) {
    return null
  }

  const trimmed = String(note).trim()
  if (!trimmed) {
    return null
  }

  if (trimmed.length > 2000) {
    const error = new Error('Deadline note must be 2000 characters or fewer')
    error.status = 400
    throw error
  }

  return trimmed
}

const normalizeDeadlineImage = (image) => {
  if (!image) {
    return null
  }

  const trimmed = String(image).trim()
  if (!trimmed) {
    return null
  }

  if (!trimmed.startsWith('data:image/')) {
    const error = new Error('Deadline image must be a valid image upload')
    error.status = 400
    throw error
  }

  if (trimmed.length > 2_500_000) {
    const error = new Error('Deadline image is too large')
    error.status = 400
    throw error
  }

  return trimmed
}

const taskSelectFields = [
  'id',
  'title',
  'status',
  'priority',
  'deadline',
  'deadline_note',
  'deadline_image',
  'completed_at',
  'created_at',
].join(', ')

const outputFields = taskSelectFields.replace(/(^|, )([^,]+)/g, '$1INSERTED.$2')

const listTasks = async ({ userId, status, search } = {}) => {
  if (!userId) {
    const error = new Error('User id is required to list tasks')
    error.status = 400
    throw error
  }

  const pool = await poolPromise
  const request = pool.request()
  request.input('userId', sql.Int, userId)
  const conditions = ['user_id = @userId']

  if (status && status.toLowerCase() !== 'all') {
    const normalizedStatus = sanitizeStatus(status)
    conditions.push('status = @status')
    request.input('status', sql.VarChar(10), normalizedStatus)
  }

  if (search && search.trim()) {
    const normalizedSearch = '%' + search.trim() + '%'
    conditions.push('title LIKE @search')
    request.input('search', sql.NVarChar(255), normalizedSearch)
  }

  const whereClause = 'WHERE ' + conditions.join(' AND ')
  const query = [
    `SELECT ${taskSelectFields}`,
    'FROM tasks',
    whereClause,
    'ORDER BY created_at DESC',
  ].join('\n')

  const result = await request.query(query)
  return result.recordset
}

const createTask = async ({ title, priority, userId, deadline, deadlineNote, deadlineImage }) => {
  if (!userId) {
    const error = new Error('User id is required to create tasks')
    error.status = 400
    throw error
  }

  if (!title || !title.trim()) {
    const error = new Error('Title is required')
    error.status = 400
    throw error
  }

  const normalizedDeadline = normalizeDeadline(deadline)
  const normalizedDeadlineNote = normalizeDeadlineNote(deadlineNote)
  const normalizedDeadlineImage = normalizeDeadlineImage(deadlineImage)

  const pool = await poolPromise
  const request = pool.request()
  request.input('title', sql.NVarChar(255), title.trim())
  request.input('status', sql.VarChar(10), DEFAULT_STATUS)
  request.input('priority', sql.VarChar(10), sanitizePriority(priority))
  request.input('deadline', sql.DateTime2, normalizedDeadline)
  request.input('deadlineNote', sql.NVarChar(sql.MAX), normalizedDeadlineNote)
  request.input('deadlineImage', sql.NVarChar(sql.MAX), normalizedDeadlineImage)
  request.input('completedAt', sql.DateTime2, null)
  request.input('userId', sql.Int, userId)

  const query = [
    'INSERT INTO tasks (title, status, priority, deadline, deadline_note, deadline_image, completed_at, created_at, user_id)',
    `OUTPUT ${outputFields}`,
    'VALUES (@title, @status, @priority, @deadline, @deadlineNote, @deadlineImage, @completedAt, GETDATE(), @userId)',
  ].join('\n')

  const result = await request.query(query)
  return result.recordset[0]
}

const updateTask = async (payload) => {
  const { id, userId, title, status, priority, deadline, deadlineNote, deadlineImage } = payload

  if (!id) {
    const error = new Error('Task id is required')
    error.status = 400
    throw error
  }

  if (!userId) {
    const error = new Error('User id is required to update tasks')
    error.status = 400
    throw error
  }

  const updates = []
  const pool = await poolPromise
  const request = pool.request()
  request.input('id', sql.Int, id)
  request.input('userId', sql.Int, userId)

  if (typeof title === 'string' && title.trim()) {
    updates.push('title = @title')
    request.input('title', sql.NVarChar(255), title.trim())
  }

  if (status) {
    const normalizedStatus = sanitizeStatus(status)
    updates.push('status = @status')
    request.input('status', sql.VarChar(10), normalizedStatus)
    updates.push(`completed_at = ${normalizedStatus === 'done' ? 'GETDATE()' : 'NULL'}`)
  }

  if (priority) {
    updates.push('priority = @priority')
    request.input('priority', sql.VarChar(10), sanitizePriority(priority))
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'deadline')) {
    updates.push('deadline = @deadline')
    request.input('deadline', sql.DateTime2, normalizeDeadline(deadline))
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'deadlineNote')) {
    updates.push('deadline_note = @deadlineNote')
    request.input('deadlineNote', sql.NVarChar(sql.MAX), normalizeDeadlineNote(deadlineNote))
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'deadlineImage')) {
    updates.push('deadline_image = @deadlineImage')
    request.input('deadlineImage', sql.NVarChar(sql.MAX), normalizeDeadlineImage(deadlineImage))
  }

  if (!updates.length) {
    const error = new Error('No updatable fields provided')
    error.status = 400
    throw error
  }

  const query = [
    'UPDATE tasks',
    'SET ' + updates.join(', '),
    'WHERE id = @id AND user_id = @userId;',
    `SELECT ${taskSelectFields}`,
    'FROM tasks',
    'WHERE id = @id AND user_id = @userId',
  ].join('\n')

  const result = await request.query(query)
  return result.recordset[0] || null
}

const deleteTask = async ({ id, userId }) => {
  if (!id) {
    const error = new Error('Task id is required')
    error.status = 400
    throw error
  }

  if (!userId) {
    const error = new Error('User id is required to delete tasks')
    error.status = 400
    throw error
  }

  const pool = await poolPromise
  const request = pool.request()
  request.input('id', sql.Int, id)
  request.input('userId', sql.Int, userId)

  const result = await request.query('DELETE FROM tasks WHERE id = @id AND user_id = @userId')

  if (!result.rowsAffected[0]) {
    const error = new Error('Task not found')
    error.status = 404
    throw error
  }

  return true
}

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
}
