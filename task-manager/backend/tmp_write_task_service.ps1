Set-Content -Path 'src/services/taskService.js' -Value @'

const { sql, poolPromise } = require('../config/db')

const VALID_STATUSES = ['pending', 'done']
const VALID_PRIORITIES = ['low', 'medium', 'high']
const DEFAULT_PRIORITY = 'low'

const sanitizePriority = (priority) =
  if (!priority) return DEFAULT_PRIORITY
  const normalized = priority.toLowerCase()
  return VALID_PRIORITIES.includes(normalized) ? normalized : DEFAULT_PRIORITY
}

const sanitizeStatus = (status) =
  if (!status) return 'pending'
  const normalized = status.toLowerCase()
  return VALID_STATUSES.includes(normalized) ? normalized : 'pending'
}

const listTasks = async ({ status, search } = {}) =
  const pool = await poolPromise
  const request = pool.request()
  const conditions = []

  if (status) {
    if (status !== 'all') {
      conditions.push('status = @status')
      request.input('status', sql.VarChar(10), status)
    }
  }

  if (search) {
    conditions.push('title LIKE @search')
    request.input('search', sql.NVarChar(255), %%%% )
  }

  const whereClause = conditions.length ? WHERE  : ''
  const query = 
    SELECT id, title, status, priority, created_at
    FROM tasks
ECHO is on.
    ORDER BY created_at DESC
ECHO is on.
  const result = await request.query(query)
  return result.recordset
}

const createTask = async ({ title, priority }) =
  if (!title) {
    throw new Error('Title is required')
  } else if (!title.trim()) {
    throw new Error('Title is required')
  }
  const pool = await poolPromise
  const request = pool.request()
  const sanitizedPriority = sanitizePriority(priority)
  const result = await request
    .input('title', sql.NVarChar(255), title.trim())
    .input('status', sql.VarChar(10), 'pending')
    .input('priority', sql.VarChar(10), sanitizedPriority)
    .query(
      INSERT INTO tasks (title, status, priority, created_at)
       OUTPUT INSERTED.id, INSERTED.title, INSERTED.status, INSERTED.priority, INSERTED.created_at
       VALUES (@title, @status, @priority, GETDATE())
    )
ECHO is on.
  return result.recordset[0]
}

const updateTask = async ({ id, status, priority, title }) =
  if (!id) {
    throw new Error('Task id is required')
  }

  const pool = await poolPromise
  const request = pool.request()
  const updates = []

  if (status) {
    const sanitizedStatus = sanitizeStatus(status)
    updates.push('status = @status')
    request.input('status', sql.VarChar(10), sanitizedStatus)
  }

  if (priority) {
    const sanitizedPriority = sanitizePriority(priority)
    updates.push('priority = @priority')
    request.input('priority', sql.VarChar(10), sanitizedPriority)
