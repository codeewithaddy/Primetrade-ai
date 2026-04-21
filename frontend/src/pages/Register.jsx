import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const validate = () => {
    const e = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Name must be at least 2 characters'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address'
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      e.password = 'Must include uppercase, lowercase, and a number'
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match'
    return e
  }

  const submit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await register(form.name.trim(), form.email, form.password)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const mapped = {}
        apiErrors.forEach(({ field, message }) => { mapped[field] = message })
        setErrors(mapped)
      } else {
        setErrors({ general: err.response?.data?.message || 'Registration failed. Please try again.' })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <h1>Get started<br />in minutes.</h1>
          <p>Create your free account and start managing tasks with your team right away.</p>
          <ul className="auth-features">
            <li><span className="feature-dot" /> Free to use, no credit card needed</li>
            <li><span className="feature-dot" /> Secure password hashing (bcrypt)</li>
            <li><span className="feature-dot" /> JWT tokens with auto-refresh</li>
            <li><span className="feature-dot" /> Admin upgradeable at any time</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-logo">
          <div className="auth-logo-mark">P</div>
          <span className="auth-logo-text">Primetrade</span>
        </div>

        <h2 className="auth-heading">Create account</h2>
        <p className="auth-sub">Fill in the details below to get started.</p>

        {errors.general && <div className="alert alert-error" style={{ marginBottom: 16 }}>{errors.general}</div>}

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Full name</label>
            <input
              id="reg-name"
              className={`form-input ${errors.name ? 'is-error' : ''}`}
              type="text" name="name" autoComplete="name"
              placeholder="John Doe"
              value={form.name} onChange={handle} required
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              id="reg-email"
              className={`form-input ${errors.email ? 'is-error' : ''}`}
              type="email" name="email" autoComplete="email"
              placeholder="you@company.com"
              value={form.email} onChange={handle} required
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input
                id="reg-password"
                className={`form-input ${errors.password ? 'is-error' : ''}`}
                style={{ paddingRight: 40 }}
                type={showPass ? 'text' : 'password'} name="password"
                placeholder="Min 8 chars with uppercase & number"
                value={form.password} onChange={handle} required
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input
              id="reg-confirm"
              className={`form-input ${errors.confirm ? 'is-error' : ''}`}
              style={{ paddingRight: 40 }}
              type={showPass ? 'text' : 'password'} name="confirm"
              placeholder="Repeat your password"
              value={form.confirm} onChange={handle} required
            />
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <button
            id="reg-submit"
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {!loading && 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
