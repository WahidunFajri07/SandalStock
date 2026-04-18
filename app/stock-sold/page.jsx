'use client'

import { useEffect, useState, useCallback } from 'react'
import { Pencil, Trash2, CalendarDays, FilterX, ShoppingBag } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import Modal from '@/components/Modal'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/context/LanguageContext'

const EMPTY  = { sandal_id: '', quantity: '', date: '', note: '' }

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">{label}</label>
      {children}
    </div>
  )
}

export default function StockSoldPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const { t } = useLanguage()

  const [rows, setRows]           = useState(null)
  const [error, setError]         = useState(null)
  const [sandals, setSandals]     = useState([])
  const [form, setForm]           = useState(EMPTY)

  useEffect(() => {
    setForm(prev => ({ ...prev, date: new Date().toISOString().slice(0, 10) }))
  }, [])
  const [filters, setFilters]     = useState({ sandalId: '', startDate: '', endDate: '' })
  const [saving, setSaving]       = useState(false)
  const [deleteId, setDeleteId]   = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm]   = useState(EMPTY)
  const [editId, setEditId]       = useState(null)

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams()
      if (filters.sandalId)  p.set('sandalId',  filters.sandalId)
      if (filters.startDate) p.set('startDate', filters.startDate)
      if (filters.endDate)   p.set('endDate',   filters.endDate)
      
      const res = await fetch(`/api/stock-sold?${p}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load sales records')
      setRows(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message)
      setRows([])
    }
  }, [filters])

  useEffect(() => { fetch('/api/sandals').then(r => r.json()).then(setSandals).catch(e => console.error(e)) }, [])
  useEffect(() => { load() }, [load])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.sandal_id || !form.quantity || !form.date) return toast.error('Please fill all required fields')
    setSaving(true)
    try {
      const res  = await fetch('/api/stock-sold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: Number(form.quantity) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Sale recorded')
      setForm(prev => ({ ...EMPTY, date: prev.date }))
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const openEdit = (row) => {
    setEditId(row.id)
    setEditForm({ sandal_id: row.sandal_id, quantity: row.quantity, date: row.date?.slice(0, 10), note: row.note || '' })
    setEditModal(true)
  }

  const saveEdit = async () => {
    try {
      const res  = await fetch(`/api/stock-sold/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, quantity: Number(editForm.quantity) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Entry updated')
      setEditModal(false)
      load()
    } catch (err) { toast.error(err.message) }
  }

  const remove = async (id) => {
    try {
      const res  = await fetch(`/api/stock-sold/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Entry deleted')
      load()
    } catch (err) { toast.error(err.message) }
  }

  const selectedSandal = sandals.find(s => String(s.id) === String(form.sandal_id))
  const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all appearance-none shadow-sm"

  return (
    <div className="space-y-6 animate-soft-in">
      {/* Header */}
      <div className="glass rounded-[2rem] p-5 sm:p-6 border-slate-200/50 dark:border-white/10 shadow-sm flex items-center gap-4 sm:gap-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20 shrink-0 border-2 border-white/20 dark:border-white/10">
           <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('stockSold')}</h1>
          <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0 sm:mt-1 leading-tight sm:leading-normal">{t('stockSoldHistory')}</p>
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
          <h2 className="text-sm font-black text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2"><span>🛒</span> {t('newSale')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label={t('sandal')}>
              <select value={form.sandal_id} onChange={e => setForm(f => ({ ...f, sandal_id: e.target.value }))} className={inputCls} style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
                <option value="">{t('selectSandal')}</option>
                {sandals.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} – {s.color} ({s.size}) · stok: {s.stock ?? 0}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={`${t('quantity')}${selectedSandal ? ` (max ${selectedSandal.stock ?? 0})` : ''}`}>
              <input type="number" min="1" max={selectedSandal?.stock ?? undefined}
                value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="e.g. 3" className={inputCls} />
            </Field>
            <Field label={t('date')}>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
            </Field>
            <Field label={t('note')}>
              <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder={t('optionalNote')} className={inputCls} />
            </Field>
          </div>
          {selectedSandal && Number(selectedSandal.stock) < 1 && (
            <p className="mt-3 text-xs text-red-500 font-bold bg-red-50 dark:bg-red-500/10 inline-block px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-500/20">⚠ {t('outOfStock')}</p>
          )}
          <button type="submit" disabled={saving || (selectedSandal && Number(selectedSandal.stock) < 1)}
            className="btn-elegant mt-6 px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50">
            {saving ? t('processing') : t('recordSale')}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 glass p-4 rounded-[1.5rem] border-slate-200/50 dark:border-white/10 shadow-sm transition-soft items-center">
        <select value={filters.sandalId} onChange={e => setFilters(f => ({ ...f, sandalId: e.target.value }))} className={`${inputCls} w-auto sm:min-w-[200px] cursor-pointer`} style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
          <option value="">{t('allSandals')}</option>
          {sandals.map(s => <option key={s.id} value={s.id}>{s.name} – {s.color} ({s.size})</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} className={`${inputCls} w-auto`} title="Start Date" />
          <span className="text-slate-400 font-bold">—</span>
          <input type="date" value={filters.endDate}   onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}   className={`${inputCls} w-auto`} title="End Date" />
        </div>
        {(filters.sandalId || filters.startDate || filters.endDate) && (
          <button onClick={() => setFilters({ sandalId: '', startDate: '', endDate: '' })} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors ml-auto sm:ml-0">
             <FilterX size={14} /> {t('clearFilter')}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass rounded-[2rem] shadow-sm border-slate-200/50 dark:border-white/10 overflow-hidden transition-soft">
        {/* Table header title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-sm">
              <span className="text-sm">🛒</span>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">Riwayat Penjualan</p>
              <p className="text-[10px] text-slate-400 font-medium">{rows ? `${rows.length} transaksi ditemukan` : 'Memuat...'}</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-500/20">
            {rows?.length ?? 0} Records
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-premium">
            <thead>
              <tr>
                <th className="w-10 text-center">#</th>
                <th>Date</th>
                <th>Sandal Name</th>
                <th>Color</th>
                <th>Size</th>
                <th>Quantity</th>
                <th>Note</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {!rows ? (
                <tr><td colSpan={isAdmin ? 8 : 7} className="px-6 py-10 text-center text-slate-400 italic">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={isAdmin ? 8 : 7} className="px-6 py-10 text-center text-slate-400 italic">No records found</td></tr>
              ) : rows.map((row, idx) => (
                <tr key={row.id}>
                  <td className="text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-500/10 text-[10px] font-black text-rose-600 dark:text-rose-400">{idx + 1}</span>
                  </td>
                  <td className="text-slate-500 dark:text-slate-400 tabular-nums font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <CalendarDays size={12} className="text-slate-400" />
                      </div>
                      {row.date?.slice(0,10)}
                    </div>
                  </td>
                  <td className="font-bold text-slate-800 dark:text-slate-200">{row.sandal_name}</td>
                  <td className="text-slate-600 dark:text-slate-400">{row.color}</td>
                  <td>
                    <span className="font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs">{row.size}</span>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-black bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                      -{row.quantity}
                    </span>
                  </td>
                  <td className="text-slate-500 dark:text-slate-400 max-w-[160px] truncate italic text-xs">{row.note || '—'}</td>
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
      <Modal open={editModal} onClose={() => setEditModal(false)} title={t('editSale')}
        footer={
          <>
            <button onClick={() => setEditModal(false)} className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">{t('cancel')}</button>
            <button onClick={saveEdit} className="btn-elegant px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25">{t('save')}</button>
          </>
        }
      >
        <div className="space-y-4 py-2 mt-2">
          <Field label={t('sandal')}>
            <select value={editForm.sandal_id} onChange={e => setEditForm(f => ({ ...f, sandal_id: e.target.value }))} className={inputCls} style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
              {sandals.map(s => <option key={s.id} value={s.id}>{s.name} – {s.color} ({s.size})</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('quantity')}>
              <input type="number" min="1" value={editForm.quantity} onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))} className={inputCls} />
            </Field>
            <Field label={t('date')}>
              <input type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} className={inputCls} />
            </Field>
          </div>
          <Field label={t('note')}>
            <input value={editForm.note} onChange={e => setEditForm(f => ({ ...f, note: e.target.value }))} className={inputCls} />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => remove(deleteId)} />
    </div>
  )
}
