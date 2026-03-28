import { api } from './api'

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export const registerUser = async (credentials) => {
  const response = await api.post('/auth/register', credentials)
  return response.data
}
