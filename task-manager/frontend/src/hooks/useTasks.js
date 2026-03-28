import { useCallback, useEffect, useMemo, useReducer } from 'react'
import {
  fetchTasks as getTasks,
  createTask as postTask,
  updateTask as patchTask,
  deleteTask as eraseTask,
  getPrettyError,
} from '../services/api'
import { initialTaskState, taskReducer } from '../state/taskReducer'
import {
  buildBoardColumns,
  computeStats,
  filterTasks,
} from '../domain/taskSelectors'

const DARK_MODE_KEY = 'task-manager-dark-mode-v1'

const loadDarkMode = () => {
  if (typeof window === 'undefined') {
    return false
  }

  const stored = window.localStorage.getItem(DARK_MODE_KEY)
  return stored === 'true'
}

const persistDarkMode = (value) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(DARK_MODE_KEY, value ? 'true' : 'false')
}

const useTasks = () => {
  const [state, dispatch] = useReducer(taskReducer, {
    ...initialTaskState,
    darkMode: loadDarkMode(),
  })

  const {
    tasks,
    layoutOrder,
    filter,
    search,
    darkMode,
    loading,
    busy,
    error,
  } = state

  const load = useCallback(
    async ({ suppressLoading } = {}) => {
      if (!suppressLoading) {
        dispatch({ type: 'SET_LOADING', payload: true })
        dispatch({ type: 'SET_ERROR', payload: '' })
      }

      try {
        const response = await getTasks()
        dispatch({ type: 'SET_TASKS', payload: response })
        dispatch({ type: 'SYNC_LAYOUT_ORDER', payload: response })
      } catch (err) {
        dispatch({ type: 'SET_ERROR', payload: getPrettyError(err) })
      } finally {
        if (!suppressLoading) {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      }
    },
    []
  )

  const runAction = useCallback(async (action) => {
    dispatch({ type: 'SET_BUSY', payload: true })
    dispatch({ type: 'SET_ERROR', payload: '' })

    try {
      await action()
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: getPrettyError(err) })
    } finally {
      dispatch({ type: 'SET_BUSY', payload: false })
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const addTask = useCallback(
    async ({ title, priority, deadline, deadlineNote, deadlineImage }) => {
      await runAction(async () => {
        await postTask({ title, priority, deadline, deadlineNote, deadlineImage })
        await load({ suppressLoading: true })
      })
    },
    [runAction, load]
  )

  const toggleTaskStatus = useCallback(
    async (task) => {
      await runAction(async () => {
        const nextStatus = task.status === 'done' ? 'pending' : 'done'
        await patchTask(task.id, { status: nextStatus })
        await load({ suppressLoading: true })
      })
    },
    [runAction, load]
  )

  const removeTask = useCallback(
    async (taskId) => {
      await runAction(async () => {
        await eraseTask(taskId)
        await load({ suppressLoading: true })
      })
    },
    [runAction, load]
  )

  const renameTask = useCallback(
    async (taskId, title) => {
      const nextTitle = title.trim()
      if (!nextTitle) {
        return
      }

      await runAction(async () => {
        await patchTask(taskId, { title: nextTitle })
        await load({ suppressLoading: true })
      })
    },
    [runAction, load]
  )

  const moveTaskStatus = useCallback(
    async (taskId, status) => {
      await runAction(async () => {
        await patchTask(taskId, { status })
        await load({ suppressLoading: true })
      })
    },
    [runAction, load]
  )

  const reorderColumn = useCallback((status, fromIndex, toIndex) => {
    dispatch({
      type: 'REORDER_COLUMN',
      payload: {
        status,
        column: (() => {
          const columnList = Array.from(layoutOrder[status] || [])
          const [moved] = columnList.splice(fromIndex, 1)
          columnList.splice(toIndex, 0, moved)
          return columnList
        })(),
      },
    })
  }, [layoutOrder])

  const toggleDarkMode = useCallback(() => {
    const next = !darkMode
    persistDarkMode(next)
    dispatch({ type: 'SET_DARK_MODE', payload: next })
  }, [darkMode])

  const filteredTasks = useMemo(() => filterTasks(tasks, { filter, search }), [tasks, filter, search])
  const boardColumns = useMemo(() => buildBoardColumns(filteredTasks, layoutOrder), [
    filteredTasks,
    layoutOrder,
  ])
  const stats = useMemo(() => computeStats(tasks), [tasks])

  const setFilter = useCallback((value) => {
    dispatch({ type: 'SET_FILTER', payload: value })
  }, [])

  const setSearch = useCallback((value) => {
    dispatch({ type: 'SET_SEARCH', payload: value })
  }, [])

  return {
    tasks: filteredTasks,
    boardColumns,
    stats,
    loading,
    busy,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    addTask,
    toggleTaskStatus,
    deleteTask: removeTask,
    renameTask,
    reorderColumn,
    moveTaskStatus,
    darkMode,
    toggleDarkMode,
  }
}

export default useTasks
