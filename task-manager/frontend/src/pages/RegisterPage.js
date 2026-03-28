import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const initialForm = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RegisterPage = () => {
  const { register, loading, error, clearError, isAuthenticated, user } = useAuth()
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState(initialForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate, user])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    setSuccess('')
    if (error) {
      clearError()
    }
  }

  const validate = () => {
    const next = {}
    if (!form.username.trim()) {
      next.username = 'Username is required.'
    }
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
    if (form.password !== form.confirmPassword) {
      next.confirmPassword = 'Passwords must match.'
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
      await register({ username: form.username, email: form.email, password: form.password })
      setSuccess('Account created successfully. Redirecting to your workspace...')
    } catch (err) {
      // handled in context
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Join Task HQ</p>
          <h1>Create an account</h1>
          <p>Register once, then the app will route you based on your role.</p>
        </div>

        {success && <p className="auth-message auth-message--success">{success}</p>}
        {error && <p className="auth-message auth-message--error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label>
            <span>Username</span>
            <input name="username" value={form.username} onChange={handleChange} />
            {fieldErrors.username && <small className="field-error">{fieldErrors.username}</small>}
          </label>

          <label>
            <span>Email address</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} />
            {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
          </label>

          <label>
            <span>Password</span>
            <input name="password" type="password" value={form.password} onChange={handleChange} />
            {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
          </label>

          <label>
            <span>Confirm password</span>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} />
            {fieldErrors.confirmPassword && <small className="field-error">{fieldErrors.confirmPassword}</small>}
          </label>

          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage
