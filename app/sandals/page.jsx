'use client'

import { useEffect, useState, useCallback } from 'react'
import { Pencil, Trash2, Search, Filter, Footprints } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import Modal from '@/components/Modal'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/context/LanguageContext'

const EMPTY = { category_id: '', code: '', name: '', color: '', size: '' }

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      {children}
    </div>
  )
}

export default function SandalsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const { t } = useLanguage()

  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [cats, setCats] = useState([])
  const [form, setForm] = useState(EMPTY)

  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')

  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams()
      if (search) p.set('search', search)
      if (catFilter) p.set('categoryId', catFilter)

      const res = await fetch(`/api/sandals?${p}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load sandals')
      setRows(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setRows([])
    }
  }, [search, catFilter])

  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(setCats).catch(e => console.error(e)) }, [])
  useEffect(() => { load() }, [load])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.category_id || !form.size) return toast.error('Please fill all required fields')
    setSaving(true)
    try {
      const res = await fetch('/api/sandals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Sandal created')
      setForm(EMPTY)
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const openEdit = (row) => {
    setEditId(row.id)
    setEditForm({
      category_id: row.category_id, code: row.code || '', name: row.name,
      color: row.color || '', size: row.size
    })
    setEditModal(true)
  }

  const saveEdit = async () => {
    try {
      const res = await fetch(`/api/sandals/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Sandal updated')
      setEditModal(false)
      load()
    } catch (err) { toast.error(err.message) }
  }

  const remove = async (id) => {
    try {
      const res = await fetch(`/api/sandals/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Sandal deleted')
      load()
    } catch (err) { toast.error(err.message) }
  }

  const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all appearance-none shadow-sm"

  const filteredRows = rows?.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    (r.code && r.code.toLowerCase().includes(search.toLowerCase())) ||
    (r.color && r.color.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="space-y-6 animate-soft-in">
      {/* Header */}
      <div className="glass rounded-[2rem] p-5 sm:p-6 border-slate-200/50 dark:border-white/10 shadow-sm flex items-center gap-4 sm:gap-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0 border-2 border-white/20 dark:border-white/10">
          <Footprints className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('sandals')}</h1>
          <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0 sm:mt-1 leading-tight sm:leading-normal">{t('manageSandals')}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-between">
          <p>⚠️ {error}</p>
          <button onClick={load} className="text-xs underline hover:no-underline font-bold">Retry</button>
        </div>
      )}

      {/* Add Form (Admin Only) */}
      {isAdmin && (
        <form onSubmit={submit} className="glass rounded-[2rem] shadow-sm border-slate-200/50 dark:border-white/10 p-6 transition-soft">
          <h2 className="text-sm font-black text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2"><span>✨</span> {t('newSandal')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <Field label="Category*">
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className={inputCls} style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                <option value="">{t('select')}</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label={t('code')}>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. SN-01" className={inputCls} />
            </Field>
            <Field label={`${t('name')}*`}>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Eiger Lights" className={inputCls} />
            </Field>
            <Field label={t('color')}>
              <input value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} placeholder="e.g. Black" className={inputCls} />
            </Field>
            <Field label={`${t('size')}*`}>
              <input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="e.g. 42" className={inputCls} />
            </Field>
          </div>
          <button type="submit" disabled={saving} className="btn-elegant mt-6 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
            {saving ? t('saving') : t('addSandal')}
          </button>
        </form>
      )}

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 glass p-4 rounded-[1.5rem] border-slate-200/50 dark:border-white/10 shadow-sm transition-soft">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search by name, code, or color..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all shadow-sm"
          />
        </div>
        <div className="relative w-full sm:w-56">
          <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
          <select
            value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all appearance-none cursor-pointer relative shadow-sm"
          >
            <option value="">All Categories</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-[2rem] shadow-sm border-slate-200/50 dark:border-white/10 overflow-hidden transition-soft">
        {/* Table header title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm shrink-0">
              <Footprints size={13} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">{t('sandals')}</p>
              <p className="text-[10px] text-slate-400 font-medium">{filteredRows ? `${filteredRows.length} item ditemukan` : 'Memuat...'}</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100/60 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            {filteredRows?.length ?? 0} Records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-premium">
            <thead>
              <tr>
                <th className="w-10 text-center">#</th>
                <th>Image</th>
                <th>{t('code')}</th>
                <th>{t('name')}</th>
                <th>Category</th>
                <th>{t('color')}</th>
                <th>{t('size')}</th>
                <th>{t('stock')}</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {!filteredRows ? (
                <tr><td colSpan={isAdmin ? 9 : 8} className="px-6 py-10 text-center text-slate-400 italic">{t('loading')}</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={isAdmin ? 9 : 8} className="px-6 py-10 text-center text-slate-400 italic">{t('notFound')}</td></tr>
              ) : filteredRows.map((row, idx) => (
                <tr key={row.id}>
                  <td className="text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-400">{idx + 1}</span>
                  </td>
                  <td>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-500/20 dark:to-purple-500/20 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center text-xl shadow-sm">
                      👡
                    </div>
                  </td>
                  <td className="text-slate-500 dark:text-slate-400 font-mono text-xs">{row.code || '—'}</td>
                  <td className="font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                  <td>
                    <span className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20 px-2.5 py-1 rounded-lg text-xs font-bold">{row.category_name}</span>
                  </td>
                  <td className="text-slate-600 dark:text-slate-400">{row.color || '—'}</td>
                  <td>
                    <span className="font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs">{row.size}</span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black shadow-sm border ${Number(row.stock) === 0 ? 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 border-red-200 dark:border-red-500/30' :
                      Number(row.stock) < 10 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/30' :
                        'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                      }`}>
                      {Number(row.stock) === 0 ? '● Habis' : Number(row.stock) < 10 ? `⚡ ${row.stock ?? 0}` : `✓ ${row.stock ?? 0}`}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(row)} className="btn-crud-edit" title="Edit">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(row.id)} className="btn-crud-delete" title="Hapus">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title={t('editSandal')}
        footer={
          <>
            <button onClick={() => setEditModal(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">{t('cancel')}</button>
            <button onClick={saveEdit} className="btn-elegant px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25">{t('save')}</button>
          </>
        }
      >
        <div className="space-y-4 py-2 mt-2">
          <Field label="Category"><select value={editForm.category_id} onChange={e => setEditForm(f => ({ ...f, category_id: e.target.value }))} className={inputCls}>{cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
          <Field label={t('code')}><input value={editForm.code} onChange={e => setEditForm(f => ({ ...f, code: e.target.value }))} className={inputCls} /></Field>
          <Field label={t('name')}><input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('color')}><input value={editForm.color} onChange={e => setEditForm(f => ({ ...f, color: e.target.value }))} className={inputCls} /></Field>
            <Field label={t('size')}><input value={editForm.size} onChange={e => setEditForm(f => ({ ...f, size: e.target.value }))} className={inputCls} /></Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => remove(deleteId)} />
    </div>
  )
}
