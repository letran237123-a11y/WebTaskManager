import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getDefaultRouteForUser, useAuth } from '../context/AuthContext'

const initialForm = {
  email: '',
  password: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const LoginPage = () => {
  const { login, loading, error, clearError, isAuthenticated, user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDefaultRouteForUser(user), { replace: true })
    }
  }, [isAuthenticated, navigate, user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) {
      clearError()
    }
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) {
      next.email = 'Email is required.'
    } else if (!emailPattern.test(form.email)) {
      next.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      next.password = 'Password is required.'
    } else if (form.password.length < 6) {
      next.password = 'Password needs 6 or more characters.'
    }

    return next
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validation = validate()
    if (Object.keys(validation).length) {
      setFieldErrors(validation)
      return
    }

    try {
      const payload = await login({ email: form.email, password: form.password })
      const fallbackRoute = getDefaultRouteForUser(payload.user)
      const requestedRoute = location.state?.from
      const nextRoute = payload.user?.role === 'admin' ? '/admin' : requestedRoute || fallbackRoute
      navigate(nextRoute, { replace: true })
    } catch (err) {
      // error is handled in context
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Task HQ</p>
          <h1>Sign in</h1>
          <p>Use your account to enter the correct workspace for your role.</p>
        </div>

        {error && <p className="auth-message auth-message--error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>Email address</span>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
            {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
          </label>

          <label>
            <span>Password</span>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />
            {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
