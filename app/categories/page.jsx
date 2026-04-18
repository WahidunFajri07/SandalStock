'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, FolderPlus, Tag } from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import Modal from '@/components/Modal'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/context/LanguageContext'

export default function CategoriesPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const { t } = useLanguage()

  const [rows, setRows]           = useState(null)
  const [error, setError]         = useState(null)
  const [name, setName]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [deleteId, setDeleteId]   = useState(null)
  const [editModal, setEditModal] = useState(false)
  const [editForm, setEditForm]   = useState({ id: null, name: '' })

  const load = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load categories')
      setRows(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) { setError(err.message); setRows([]) }
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast.error(t('categoryName') + ' ' + t('notFound'))
    setSaving(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(t('categories') + ' berhasil ditambahkan')
      setName('')
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const openEdit = (row) => { setEditForm({ id: row.id, name: row.name }); setEditModal(true) }

  const saveEdit = async () => {
    try {
      const res = await fetch(`/api/categories/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editForm.name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(t('categories') + ' berhasil diperbarui')
      setEditModal(false)
      load()
    } catch (err) { toast.error(err.message) }
  }

  const remove = async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(t('categories') + ' berhasil dihapus')
      load()
    } catch (err) { toast.error(err.message) }
  }

  const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all shadow-sm"

  return (
    <div className="space-y-6 animate-soft-in">
      {/* Header */}
      <div className="glass rounded-[2rem] p-5 sm:p-6 border-slate-200/50 dark:border-white/10 shadow-sm flex items-center gap-4 sm:gap-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0 border-2 border-white/20 dark:border-white/10">
           <Tag className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('categories')}</h1>
          <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0 sm:mt-1 leading-tight sm:leading-normal">{t('manageCategory')}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-between">
          <p>⚠️ {error}</p>
          <button onClick={load} className="text-xs underline hover:no-underline font-bold">{t('retry')}</button>
        </div>
      )}

      {/* Add Form */}
      {isAdmin && (
        <form onSubmit={submit} className="glass rounded-[2rem] shadow-sm border-slate-200/50 dark:border-white/10 p-6 transition-soft">
          <h2 className="text-sm font-black text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <FolderPlus size={14} className="text-white" />
            </span>
            {t('newCategory')}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full flex flex-col gap-2">
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1">{t('categoryName')}</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('categoryPlaceholder')}
                className={inputCls}
              />
            </div>
            <button type="submit" disabled={saving}
              className="btn-elegant w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25">
              {saving ? t('saving') : t('addCategory')}
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="glass rounded-[2rem] shadow-sm border-slate-200/50 dark:border-white/10 overflow-hidden transition-soft">
        {/* Table title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <Tag size={13} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">{t('categories')}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {rows ? `${rows.length} ${t('itemsFound')}` : t('loading')}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-100 dark:border-blue-500/20">
            {rows?.length ?? 0} {t('records')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-premium">
            <thead>
              <tr>
                <th className="w-12 text-center">#</th>
                <th>{t('name')}</th>
                <th>{t('items')}</th>
                {isAdmin && <th className="w-28">{t('actions')}</th>}
              </tr>
            </thead>
            <tbody>
              {!rows ? (
                <tr><td colSpan={isAdmin ? 4 : 3} className="px-6 py-10 text-center text-slate-400 italic">{t('loading')}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={isAdmin ? 4 : 3} className="px-6 py-10 text-center text-slate-400 italic">{t('notFound')}</td></tr>
              ) : rows.map((row, idx) => (
                <tr key={row.id}>
                  <td className="text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[10px] font-black text-blue-600 dark:text-blue-400">{idx + 1}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ec4899','#14b8a6'][idx % 6]}22, ${['#6366f1','#a855f7','#059669','#f97316','#db2777','#0891b2'][idx % 6]}22)`,
                          border: `1px solid ${['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ec4899','#14b8a6'][idx % 6]}30` }}>
                        <Tag size={13} style={{ color: ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ec4899','#14b8a6'][idx % 6] }} />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{row.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black
                      bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {row.total_skus || 0} {t('items')}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(row)} className="btn-crud-edit" title={t('edit')}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteId(row.id)} className="btn-crud-delete" title={t('delete')}>
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
      <Modal open={editModal} onClose={() => setEditModal(false)} title={t('editCategory')}
        footer={
          <>
            <button onClick={() => setEditModal(false)}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
              {t('cancel')}
            </button>
            <button onClick={saveEdit}
              className="btn-elegant px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25">
              {t('save')}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-2 mt-4 mb-2">
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1">{t('categoryName')}</label>
          <input
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            className={inputCls}
          />
        </div>
      </Modal>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)} onConfirm={() => remove(deleteId)} />
    </div>
  )
}
