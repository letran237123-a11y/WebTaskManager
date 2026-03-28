import { TASK_STATUS_COLUMNS } from './taskColumns'

export const deriveLayoutOrder = (tasks, previousOrder = {}) => {
  const base = TASK_STATUS_COLUMNS.reduce((acc, column) => {
    acc[column.id] = []
    return acc
  }, {})

  TASK_STATUS_COLUMNS.forEach(({ id }) => {
    const ordered = (previousOrder[id] || []).filter((taskId) =>
      tasks.some((task) => task.id === taskId && task.status === id)
    )
    base[id] = ordered
  })

  tasks.forEach((task) => {
    if (!base[task.status]) {
      base[task.status] = []
    }

    if (!base[task.status].includes(task.id)) {
      base[task.status].push(task.id)
    }
  })

  return base
}

export const buildTaskLookup = (tasks) =>
  tasks.reduce((acc, task) => {
    acc[task.id] = task
    return acc
  }, {})

export const buildBoardColumns = (tasks, layoutOrder) =>
  TASK_STATUS_COLUMNS.map((column) => {
    const orderedIds = layoutOrder[column.id] || []
    const orderedTasks = orderedIds
      .map((taskId) => tasks.find((task) => task.id === taskId))
      .filter(Boolean)

    const extras = tasks.filter(
      (task) => task.status === column.id && !orderedIds.includes(task.id)
    )

    return {
      ...column,
      tasks: [...orderedTasks, ...extras],
    }
  })

export const filterTasks = (tasks, { filter, search }) => {
  const normalizedSearch = search.trim().toLowerCase()

  return tasks.filter((task) => {
    if (filter !== 'all' && task.status !== filter) {
      return false
    }

    if (normalizedSearch && !task.title.toLowerCase().includes(normalizedSearch)) {
      return false
    }

    return true
  })
}

export const computeStats = (tasks) => {
  const completedCount = tasks.filter((task) => task.status === 'done').length
  const pendingCount = tasks.filter((task) => task.status === 'pending').length
  const totalCount = tasks.length
  const overdueCount = tasks.filter((task) => {
    if (!task.deadline || task.status === 'done') {
      return false
    }

    return new Date(task.deadline) < new Date()
  }).length

  const dueSoonCount = tasks.filter((task) => {
    if (!task.deadline || task.status === 'done') {
      return false
    }

    const diff = new Date(task.deadline) - new Date()
    return diff > 0 && diff <= 1000 * 60 * 60 * 24
  }).length

  const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0

  return {
    completedCount,
    pendingCount,
    totalCount,
    overdueCount,
    dueSoonCount,
    progress,
  }
}
