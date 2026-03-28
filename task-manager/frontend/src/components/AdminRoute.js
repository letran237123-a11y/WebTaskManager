import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getDefaultRouteForUser, useAuth } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (user?.role !== 'admin') {
    return <Navigate to={getDefaultRouteForUser(user)} replace />
  }

  return children
}

export default AdminRoute
