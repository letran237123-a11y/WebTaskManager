import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 12000,
})

const normalizeError = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.message) {
    return error.message
  }

  return 'Something went wrong. Please try again.'
}

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

export const fetchTasks = async (params = {}) => {
  const response = await api.get('/tasks', { params })
  return response.data
}

export const createTask = async ({ title, priority, deadline, deadlineNote, deadlineImage }) => {
  const response = await api.post('/tasks', { title, priority, deadline, deadlineNote, deadlineImage })
  return response.data
}

export const updateTask = async (id, payload) => {
  const response = await api.put(`/tasks/${id}`, payload)
  return response.data
}

export const deleteTask = async (id) => {
  await api.delete(`/tasks/${id}`)
}

export const fetchAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params })
  return response.data
}

export const updateUserRole = async (id, role) => {
  const response = await api.put(`/admin/users/${id}/role`, { role })
  return response.data
}

export const deleteUser = async (id) => {
  await api.delete(`/admin/users/${id}`)
}

export const fetchAdminTasks = async (params = {}) => {
  const response = await api.get('/admin/tasks', { params })
  return response.data
}

export const deleteAdminTask = async (id) => {
  await api.delete(`/admin/tasks/${id}`)
}

export const getPrettyError = normalizeError
export { api }
