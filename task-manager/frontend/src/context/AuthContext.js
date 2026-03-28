import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { registerUser, loginUser } from '../services/authService'
import { setAuthToken, getPrettyError } from '../services/api'

const SESSION_KEY = 'task-manager-session'
const LEGACY_TOKEN_KEY = 'task-manager-jwt'
const LEGACY_USER_KEY = 'task-manager-user'

export const getDefaultRouteForUser = (user) => (user?.role === 'admin' ? '/admin' : '/dashboard')

const getStoredSession = () => {
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      sessionStorage.removeItem(SESSION_KEY)
    }
  }

  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(LEGACY_TOKEN_KEY)
  localStorage.removeItem(LEGACY_USER_KEY)

  return null
}

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => getStoredSession())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = session?.token || null
  const user = session?.user || null

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const persistSession = useCallback((nextSession) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
    setSession(nextSession)
  }, [])

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    localStorage.removeItem(LEGACY_USER_KEY)
    setSession(null)
  }, [])

  const authenticate = useCallback(
    async (values, serviceCall) => {
      setLoading(true)
      setError('')

      try {
        const payload = await serviceCall(values)
        persistSession({ token: payload.token, user: payload.user })
        return payload
      } catch (err) {
        setError(getPrettyError(err))
        throw err
      } finally {
        setLoading(false)
      }
    },
    [persistSession]
  )

  const login = useCallback((values) => authenticate(values, loginUser), [authenticate])
  const register = useCallback((values) => authenticate(values, registerUser), [authenticate])
  const logout = useCallback(() => clearSession(), [clearSession])
  const clearError = useCallback(() => setError(''), [])

  const value = useMemo(
    () => ({
      user,
      token,
      session,
      isAuthenticated: Boolean(token && user),
      loading,
      error,
      login,
      register,
      logout,
      clearError,
      persistSession,
    }),
    [user, token, session, loading, error, login, register, logout, clearError, persistSession]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
