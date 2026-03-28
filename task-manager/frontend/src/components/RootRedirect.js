import React from 'react'
import { Navigate } from 'react-router-dom'
import { getDefaultRouteForUser, useAuth } from '../context/AuthContext'

const RootRedirect = () => {
  const { user } = useAuth()
  return <Navigate to={getDefaultRouteForUser(user)} replace />
}

export default RootRedirect
