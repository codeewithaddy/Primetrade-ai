import { useEffect, useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Users, CheckSquare, BarChart3, Search, UserX, UserCheck, Shield, Trash2 } from 'lucide-react'

export default function Admin() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({})
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.get('/admin/users', { params: { page, limit: 15, search: search || undefined } })
      .then(({ data }) => { setUsers(data.data || []); setMeta(data.meta || {}) })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [page, search])

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin'
    try {
      await api.put(`/admin/users/${u._id}/role`, { role: newRole })
      setUsers((p) => p.map((x) => x._id === u._id ? { ...x, role: newRole } : x))
      toast.success(`Changed to ${newRole}`)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const toggleStatus = async (u) => {
    try {
      await api.put(`/admin/users/${u._id}/status`)
      setUsers((p) => p.map((x) => x._id === u._id ? { ...x, isActive: !x.isActive } : x))
      toast.success(u.isActive ? 'User deactivated' : 'User activated')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user and all their tasks? This cannot be undone.')) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers((p) => p.filter((u) => u._id !== id))
      toast.success('User deleted')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const taskStats = stats?.tasks || {}
  const totalTasks = Object.values(taskStats).reduce((a, b) => a + b, 0)

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Admin Panel</span>
      </div>

      <div className="page-content">
        {stats && (
          <div className="stats-row mb-6">
            <div className="stat-card">
              <div className="stat-label">Total users</div>
              <div className="stat-value">{stats.users?.total ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Active users</div>
              <div className="stat-value">{stats.users?.active ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Admins</div>
              <div className="stat-value">{stats.users?.admins ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total tasks</div>
              <div className="stat-value">{totalTasks}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Completed tasks</div>
              <div className="stat-value">{taskStats.completed ?? 0}</div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <span className="card-title">Users</span>
            <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1) }}
              style={{ display: 'flex', gap: 8 }}>
              <div className="search-input-wrap">
                <span className="search-icon"><Search size={14} /></span>
                <input className="form-input search-input" placeholder="Search users..."
                  value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-secondary btn-sm">Search</button>
            </form>
          </div>

          {loading ? <div className="loader"><div className="spinner" /></div> : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--primary-text)', flexShrink: 0 }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{u.email}</td>
                      <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                      <td>
                        <span className={`badge ${u.isActive ? 'badge-completed' : 'badge-archived'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-3)', fontSize: 13 }}>
                        {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => toggleRole(u)} title="Toggle role">
                            <Shield size={13} /> {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                          <button className="btn btn-secondary btn-sm" onClick={() => toggleStatus(u)}>
                            {u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={6}>
                      <div className="empty"><div className="empty-title">No users found</div></div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {meta.totalPages > 1 && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }}>
              <div className="pagination" style={{ marginTop: 0 }}>
                <button className="page-btn" disabled={!meta.hasPrevPage} onClick={() => setPage(page - 1)}>‹</button>
                <span style={{ fontSize: 13, color: 'var(--text-3)', padding: '0 8px' }}>
                  Page {meta.page} of {meta.totalPages}
                </span>
                <button className="page-btn" disabled={!meta.hasNextPage} onClick={() => setPage(page + 1)}>›</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
