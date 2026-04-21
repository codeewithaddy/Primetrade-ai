import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <h1>Manage tasks,<br />ship faster.</h1>
          <p>A simple, focused task manager with role-based access. Built for teams who value clarity.</p>
          <ul className="auth-features">
            <li><span className="feature-dot" /> JWT-secured authentication</li>
            <li><span className="feature-dot" /> Role-based access control</li>
            <li><span className="feature-dot" /> Real-time task management</li>
            <li><span className="feature-dot" /> Admin panel & analytics</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-logo">
          <div className="auth-logo-mark">P</div>
          <span className="auth-logo-text">Primetrade</span>
        </div>

        <h2 className="auth-heading">Sign in</h2>
        <p className="auth-sub">Enter your credentials to access your account.</p>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

        <form className="auth-form" onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              id="login-email"
              className="form-input"
              type="email" name="email" autoComplete="email"
              placeholder="you@company.com"
              value={form.email} onChange={handle} required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrap">
              <input
                id="login-password"
                className="form-input"
                style={{ paddingRight: 40 }}
                type={showPass ? 'text' : 'password'} name="password"
                placeholder="Enter password"
                value={form.password} onChange={handle} required
              />
              <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className={`btn btn-primary btn-full btn-lg ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {!loading && 'Sign in'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
