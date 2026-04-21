import { useEffect, useState, useCallback } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { Plus, Search, Pencil, Trash2, X, Tag } from 'lucide-react'
import { format } from 'date-fns'

const STATUSES = ['todo', 'in_progress', 'completed', 'archived']
const PRIORITIES = ['low', 'medium', 'high', 'urgent']

function TaskModal({ task, onClose, onSave }) {
  const isEdit = !!task?._id
  const [form, setForm] = useState({
    title: task?.title || '', description: task?.description || '',
    status: task?.status || 'todo', priority: task?.priority || 'medium',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
    isPublic: task?.isPublic || false, tags: task?.tags || [],
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const handle = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const addTag = (e) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const t = tagInput.trim()
    if (t && !form.tags.includes(t) && form.tags.length < 10) {
      setForm({ ...form, tags: [...form.tags, t] })
    }
    setTagInput('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setErrors({ title: 'Title is required' }); return }
    setErrors({})
    setLoading(true)
    try {
      const payload = { ...form, dueDate: form.dueDate || undefined }
      if (isEdit) {
        const { data } = await api.put(`/tasks/${task._id}`, payload)
        onSave(data.data, true)
        toast.success('Task updated')
      } else {
        const { data } = await api.post('/tasks', payload)
        onSave(data.data, false)
        toast.success('Task created')
      }
      onClose()
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      if (apiErrors) {
        const m = {}; apiErrors.forEach(({ field, message }) => { m[field] = message })
        setErrors(m)
      } else {
        toast.error(err.response?.data?.message || 'Something went wrong')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <span className="modal-title">{isEdit ? 'Edit task' : 'New task'}</span>
          <button className="close-btn" onClick={onClose}><X size={14} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input id="task-title" className={`form-input ${errors.title ? 'is-error' : ''}`}
                name="title" value={form.title} onChange={handle} placeholder="What needs to be done?" autoFocus />
              {errors.title && <span className="form-error">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" name="description" value={form.description}
                onChange={handle} placeholder="Add details (optional)" />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handle}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select className="form-select" name="priority" value={form.priority} onChange={handle}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Due date</label>
              <input className="form-input" type="date" name="dueDate" value={form.dueDate}
                onChange={handle} min={new Date().toISOString().slice(0, 10)} />
            </div>

            <div className="form-group">
              <label className="form-label">Tags <span className="form-hint">(press Enter)</span></label>
              {form.tags.length > 0 && (
                <div className="tags-wrap">
                  {form.tags.map((t) => (
                    <span key={t} className="tag">
                      {t}
                      <span className="tag-remove" onClick={() => setForm({ ...form, tags: form.tags.filter((x) => x !== t) })}>×</span>
                    </span>
                  ))}
                </div>
              )}
              <input className="form-input" value={tagInput}
                onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type a tag..." />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'var(--text-2)' }}>
              <input type="checkbox" name="isPublic" checked={form.isPublic} onChange={handle} />
              Make this task visible to others
            </label>
          </div>
          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button id="task-submit" type="submit"
              className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading}>
              {!loading && (isEdit ? 'Save changes' : 'Create task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1 })
  const [searchInput, setSearchInput] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page: filters.page, limit: 10 }
      if (filters.status) params.status = filters.status
      if (filters.priority) params.priority = filters.priority
      if (filters.search) params.search = filters.search
      const { data } = await api.get('/tasks', { params })
      setTasks(data.data || [])
      setMeta(data.meta || {})
    } catch { toast.error('Failed to load tasks') }
    setLoading(false)
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleSave = (saved, isEdit) => {
    setTasks((p) => isEdit ? p.map((t) => t._id === saved._id ? saved : t) : [saved, ...p])
  }

  const toggleDone = async (t) => {
    const next = t.status === 'completed' ? 'todo' : 'completed'
    try {
      const { data } = await api.put(`/tasks/${t._id}`, { status: next })
      setTasks((p) => p.map((x) => x._id === t._id ? data.data : x))
    } catch { toast.error('Failed to update') }
  }

  const doDelete = async () => {
    try {
      await api.delete(`/tasks/${deleteId}`)
      setTasks((p) => p.filter((t) => t._id !== deleteId))
      toast.success('Task deleted')
    } catch { toast.error('Failed to delete') }
    setDeleteId(null)
  }

  const today = new Date()
  const isOverdue = (t) => t.dueDate && t.status !== 'completed' && new Date(t.dueDate) < today

  return (
    <div>
      <div className="topbar">
        <span className="topbar-title">Tasks</span>
        <button id="create-task-btn" className="btn btn-primary btn-sm" onClick={() => setModal('new')}>
          <Plus size={14} /> New task
        </button>
      </div>

      <div className="page-content">
        <div className="filters-row">
          <form onSubmit={(e) => { e.preventDefault(); setFilters({ ...filters, search: searchInput, page: 1 }) }}
            className="search-input-wrap">
            <span className="search-icon"><Search size={14} /></span>
            <input className="form-input search-input" placeholder="Search tasks..."
              value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          </form>

          <select className="form-select" style={{ width: 'auto' }}
            value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
            <option value="">All status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>

          <select className="form-select" style={{ width: 'auto' }}
            value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}>
            <option value="">All priority</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          {(filters.status || filters.priority || filters.search) && (
            <button className="btn btn-ghost btn-sm"
              onClick={() => { setFilters({ status: '', priority: '', search: '', page: 1 }); setSearchInput('') }}>
              Clear filters
            </button>
          )}
        </div>

        {loading ? <div className="loader"><div className="spinner" /></div> : tasks.length === 0 ? (
          <div className="card"><div className="empty">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No tasks found</div>
            <p className="empty-desc">Try different filters or create a new task.</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={() => setModal('new')}>
              <Plus size={14} /> Create task
            </button>
          </div></div>
        ) : (
          <div className="task-list">
            {tasks.map((t) => (
              <div key={t._id} className="task-item">
                <div className={`task-check ${t.status === 'completed' ? 'done' : ''}`} onClick={() => toggleDone(t)} />
                <div className="task-body">
                  <div className={`task-title ${t.status === 'completed' ? 'done' : ''}`}>{t.title}</div>
                  {t.description && <div className="task-desc">{t.description}</div>}
                  <div className="task-meta">
                    <span className={`badge badge-${t.status}`}>{t.status.replace('_', ' ')}</span>
                    <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                    {t.dueDate && (
                      <span className={`task-date ${isOverdue(t) ? 'overdue' : ''}`}>
                        {isOverdue(t) ? '⚠ Overdue · ' : ''}{format(new Date(t.dueDate), 'MMM d, yyyy')}
                      </span>
                    )}
                    {t.tags?.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                  </div>
                </div>
                <div className="task-actions">
                  <button className="icon-btn" title="Edit" onClick={() => setModal(t)}><Pencil size={13} /></button>
                  <button className="icon-btn danger" title="Delete" onClick={() => setDeleteId(t._id)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" disabled={!meta.hasPrevPage} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>‹</button>
            {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} className={`page-btn ${p === meta.page ? 'active' : ''}`}
                onClick={() => setFilters({ ...filters, page: p })}>{p}</button>
            ))}
            <button className="page-btn" disabled={!meta.hasNextPage} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>›</button>
          </div>
        )}
      </div>

      {(modal === 'new' || (modal && modal._id)) && (
        <TaskModal task={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
      )}

      {deleteId && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-head"><span className="modal-title">Delete task?</span></div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-2)', fontSize: 14 }}>This action cannot be undone. The task will be permanently removed.</p>
            </div>
            <div className="modal-foot">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button id="confirm-delete" className="btn btn-danger" onClick={doDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
