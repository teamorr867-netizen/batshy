import { useState, useEffect } from 'react'

type Status = 'hot' | 'warm' | 'cold'
interface Lead {
  id: string
  firstName: string
  lastName: string
  phone: string
  notes: string
  status: Status
  createdAt: string
}

const STATUS_LABELS: Record<Status, string> = { hot: 'חם', warm: 'פושר', cold: 'קר' }
const STATUS_COLORS: Record<Status, string> = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-amber-100 text-amber-700',
  cold: 'bg-sky-100 text-sky-700',
}

const EMPTY_FORM = { firstName: '', lastName: '', phone: '', notes: '', status: 'warm' as Status }

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try { return JSON.parse(localStorage.getItem('batshy-leads') || '[]') } catch { return [] }
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [filter, setFilter] = useState<Status | 'all'>('all')

  useEffect(() => {
    localStorage.setItem('batshy-leads', JSON.stringify(leads))
  }, [leads])

  const save = () => {
    if (!form.firstName || !form.phone) return
    if (editId) {
      setLeads(leads.map(l => l.id === editId ? { ...l, ...form } : l))
      setEditId(null)
    } else {
      setLeads([{ id: Date.now().toString(), ...form, createdAt: new Date().toLocaleDateString('he-IL') }, ...leads])
    }
    setForm(EMPTY_FORM)
    setShowForm(false)
  }

  const startEdit = (lead: Lead) => {
    setForm({ firstName: lead.firstName, lastName: lead.lastName, phone: lead.phone, notes: lead.notes, status: lead.status })
    setEditId(lead.id)
    setShowForm(true)
  }

  const remove = (id: string) => setLeads(leads.filter(l => l.id !== id))

  const openNew = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter)
  const counts = { hot: leads.filter(l => l.status === 'hot').length, warm: leads.filter(l => l.status === 'warm').length, cold: leads.filter(l => l.status === 'cold').length }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-bronze tracking-widest uppercase mb-1">CRM</div>
          <h1 className="section-title">ניהול לידים</h1>
          <p className="section-sub">לקוחות פוטנציאליים ואנשי קשר</p>
        </div>
        <button className="btn-bronze px-5 py-3 text-sm" onClick={openNew}>+ ליד חדש</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: 'hot', label: 'חמים', count: counts.hot, color: 'text-red-600' },
          { key: 'warm', label: 'פושרים', count: counts.warm, color: 'text-amber-600' },
          { key: 'cold', label: 'קרים', count: counts.cold, color: 'text-sky-600' },
        ].map(s => (
          <div key={s.key} className="result-box text-center">
            <div className={`text-2xl font-black ${s.color}`}>{s.count}</div>
            <div className="text-xs text-ink-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <div className="card space-y-4 border-2 border-bronze/20">
          <div className="text-sm font-bold text-ink">{editId ? 'עריכת ליד' : 'ליד חדש'}</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">שם פרטי *</label>
              <input className="input-field" placeholder="ישראל" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div>
              <label className="label">שם משפחה</label>
              <input className="input-field" placeholder="ישראלי" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div>
              <label className="label">טלפון *</label>
              <input className="input-field" placeholder="050-0000000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className="label">סטטוס</label>
              <select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Status })}>
                <option value="hot">חם 🔥</option>
                <option value="warm">פושר ☀️</option>
                <option value="cold">קר ❄️</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">הערות</label>
            <textarea className="input-field" rows={3} placeholder="מחפש דירה 4 חדרים בת&quot;א, תקציב 3M..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button className="btn-bronze flex-1" onClick={save}>שמור</button>
            <button className="flex-1 py-3 rounded-2xl border-2 border-cream-dark text-ink-muted text-sm font-medium" onClick={() => setShowForm(false)}>ביטול</button>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      {leads.length > 0 && (
        <div className="flex gap-2">
          {([['all', 'הכל'], ['hot', 'חמים'], ['warm', 'פושרים'], ['cold', 'קרים']] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${filter === k ? 'bg-bronze text-white' : 'bg-cream-light text-ink-muted'}`}>
              {l}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {leads.length === 0 && !showForm && (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">👤</div>
          <div className="text-ink font-medium">אין לידים עדיין</div>
          <div className="text-ink-faint text-sm mt-1">לחץ על &quot;+ ליד חדש&quot; להוספה</div>
        </div>
      )}

      {/* Leads list */}
      <div className="space-y-3">
        {filtered.map(lead => (
          <div key={lead.id} className="card flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-bronze/10 flex items-center justify-center text-bronze font-bold flex-shrink-0">
              {lead.firstName[0]}{lead.lastName?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-ink">{lead.firstName} {lead.lastName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>
                  {STATUS_LABELS[lead.status]}
                </span>
              </div>
              <a href={`tel:${lead.phone}`} className="text-bronze text-sm mt-0.5 font-medium block hover:underline">{lead.phone}</a>
              {lead.notes && <div className="text-ink-muted text-xs mt-1 leading-relaxed">{lead.notes}</div>}
              <div className="text-ink-faint text-xs mt-1">{lead.createdAt}</div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => startEdit(lead)} className="w-8 h-8 rounded-xl bg-cream-light text-ink-muted hover:text-ink flex items-center justify-center text-sm transition-colors">✎</button>
              <button onClick={() => remove(lead.id)} className="w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:text-red-600 flex items-center justify-center text-sm transition-colors">✕</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && leads.length > 0 && (
          <div className="card-flat text-center text-ink-muted py-6 text-sm">אין לידים בסטטוס זה</div>
        )}
      </div>
    </div>
  )
}
