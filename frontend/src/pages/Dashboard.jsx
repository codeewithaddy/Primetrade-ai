import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import api from '../lib/api'
import { CheckSquare, Clock, AlertTriangle, Archive, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tasks/stats'),
      api.get('/tasks?limit=5&sortOrder=desc'),
    ]).then(([s, t]) => {
      setStats(s.data.data)
      setRecent(t.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loader"><div className="spinner" /></div>

  const total = stats?.total || 0
  const pct = total ? Math.round((stats.completed / total) * 100) : 0

  const cards = [
    { label: 'Total', value: total, icon: <CheckSquare size={16} />, color: '#4f46e5' },
    { label: 'In Progress', value: stats?.in_progress || 0, icon: <Clock size={16} />, color: '#d97706' },
    { label: 'Completed', value: stats?.completed || 0, icon: <CheckSquare size={16} />, color: '#059669' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: <AlertTriangle size={16} />, color: '#dc2626' },
    { label: 'Archived', value: stats?.archived || 0, icon: <Archive size={16} />, color: '#94a3b8' },
  ]

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Dashboard</span>
        <Link to="/tasks" className="btn btn-primary btn-sm"><Plus size={14} /> New Task</Link>
      </div>

      <div className="page-content">
        <div style={{ marginBottom: 24 }}>
          <div className="page-title">Good {getGreeting()}, {user?.name?.split(' ')[0]}.</div>
          <div className="page-sub">Here's a summary of your tasks.</div>
        </div>

        <div className="stats-row">
          {cards.map((c) => (
            <div key={c.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="stat-label">{c.label}</span>
                <span style={{ color: c.color }}>{c.icon}</span>
              </div>
              <div className="stat-value">{c.value}</div>
            </div>
          ))}
        </div>

        <div className="card mb-6">
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="section-title">Completion rate</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5' }}>{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-muted" style={{ marginTop: 6 }}>{stats?.completed || 0} of {total} tasks completed</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="section-title">Recent tasks</span>
          <Link to="/tasks" className="btn btn-ghost btn-sm">View all →</Link>
        </div>

        {recent.length === 0 ? (
          <div className="card">
            <div className="empty">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No tasks yet</div>
              <p className="empty-desc">Create your first task to get started tracking your work.</p>
              <Link to="/tasks" className="btn btn-primary btn-sm" style={{ marginTop: 8 }}>
                <Plus size={14} /> Create task
              </Link>
            </div>
          </div>
        ) : (
          <div className="task-list">
            {recent.map((t) => (
              <div key={t._id} className="task-item">
                <div className={`task-check ${t.status === 'completed' ? 'done' : ''}`} />
                <div className="task-body">
                  <div className={`task-title ${t.status === 'completed' ? 'done' : ''}`}>{t.title}</div>
                  <div className="task-meta">
                    <span className={`badge badge-${t.status}`}>{t.status.replace('_', ' ')}</span>
                    <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                    {t.dueDate && (
                      <span className="task-date">{format(new Date(t.dueDate), 'MMM d')}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
