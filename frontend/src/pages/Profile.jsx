import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [pLoading, setPLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')

  const saveProfile = async (e) => {
    e.preventDefault()
    setPLoading(true)
    try {
      const { data } = await api.put('/auth/me', { name: profile.name, email: profile.email })
      updateUser(data.data)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally { setPLoading(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    if (passwords.newPassword !== passwords.confirm) { setPwError('Passwords do not match'); return }
    if (passwords.newPassword.length < 8) { setPwError('Password must be at least 8 characters'); return }
    setPwLoading(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      })
      toast.success('Password changed. Please log in again.')
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' })
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password')
    } finally { setPwLoading(false) }
  }

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Profile</span>
      </div>

      <div className="page-content" style={{ maxWidth: 580 }}>
        {/* Avatar section */}
        <div className="card mb-6">
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'var(--primary-text)', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17 }}>{user?.name}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{user?.email}</div>
              <span className={`badge badge-${user?.role}`} style={{ marginTop: 6 }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Edit info */}
        <div className="card mb-6">
          <div className="card-header"><span className="card-title">Account information</span></div>
          <div className="card-body">
            <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input id="profile-name" className="form-input" value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input id="profile-email" className="form-input" type="email" value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
              </div>
              <div>
                <button id="profile-save" type="submit"
                  className={`btn btn-primary ${pLoading ? 'btn-loading' : ''}`} disabled={pLoading}>
                  {!pLoading && 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <div className="card-header"><span className="card-title">Change password</span></div>
          <div className="card-body">
            {pwError && <div className="alert alert-error" style={{ marginBottom: 14 }}>{pwError}</div>}
            <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Current password</label>
                <input id="current-password" className="form-input" type="password"
                  value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">New password</label>
                <input id="new-password" className="form-input" type="password"
                  value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <input id="confirm-password" className="form-input" type="password"
                  value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
              </div>
              <div>
                <button id="change-password-btn" type="submit"
                  className={`btn btn-secondary ${pwLoading ? 'btn-loading btn-secondary' : ''}`} disabled={pwLoading}>
                  {!pwLoading && 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
