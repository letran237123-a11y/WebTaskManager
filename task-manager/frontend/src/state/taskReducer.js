import { deriveLayoutOrder } from '../domain/taskSelectors'
import { TASK_STATUS_COLUMNS } from '../domain/taskColumns'

const buildInitialLayout = () =>
  TASK_STATUS_COLUMNS.reduce((acc, column) => {
    acc[column.id] = []
    return acc
  }, {})

export const initialTaskState = {
  tasks: [],
  layoutOrder: buildInitialLayout(),
  darkMode: false,
  filter: 'all',
  search: '',
  loading: false,
  busy: false,
  error: '',
}

export const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }

    case 'SET_BUSY':
      return { ...state, busy: action.payload }

    case 'SET_ERROR':
      return { ...state, error: action.payload }

    case 'SET_FILTER':
      return { ...state, filter: action.payload }

    case 'SET_SEARCH':
      return { ...state, search: action.payload }

    case 'SET_TASKS':
      return { ...state, tasks: action.payload }

    case 'SYNC_LAYOUT_ORDER':
      return {
        ...state,
        layoutOrder: deriveLayoutOrder(action.payload, state.layoutOrder),
      }

    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload }

    case 'REORDER_COLUMN':
      return {
        ...state,
        layoutOrder: {
          ...state.layoutOrder,
          [action.payload.status]: action.payload.column,
        },
      }

    default:
      return state
  }
}
