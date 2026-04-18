'use client'

import { useEffect, useState, useCallback } from 'react'
import ExportButtons from '@/components/ExportButtons'
import { FilterX, TrendingUp, BarChart3 } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

function StockCell({ value }) {
  const n = Number(value)
  const cls = n === 0
    ? 'bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
    : n < 10
      ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/30'
      : 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
  const label = n === 0 ? '● 0' : n < 10 ? `⚡ ${n}` : `✓ ${n}`
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black shadow-sm border ${cls}`}>{label}</span>
}

function StockCompareChart({ rows }) {
  const { t } = useLanguage()
  if (!rows || rows.length === 0) return null
  const top = rows.slice().sort((a, b) => Number(b.stock_in) - Number(a.stock_in)).slice(0, 10)
  const maxVal = Math.max(...top.map(r => Math.max(Number(r.stock_in), Number(r.stock_sold))), 1)

  return (
    <div className="glass rounded-[2rem] p-8 border-slate-200/50 dark:border-white/10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Stok Masuk vs Terjual</h3>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">Top 10 SKU</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-emerald-500"><span className="w-3 h-2 rounded-sm bg-emerald-500 inline-block" /> {t('stockIn2')}</span>
          <span className="flex items-center gap-1.5 text-rose-500"><span className="w-3 h-2 rounded-sm bg-rose-500 inline-block" /> {t('stockSold2')}</span>
        </div>
      </div>
      <div className="space-y-3">
        {top.map((row, i) => {
          const inW = (Number(row.stock_in) / maxVal) * 100
          const soldW = (Number(row.stock_sold) / maxVal) * 100
          const available = Number(row.stock_sold) + Number(row.current_stock)
          const sellThrough = available > 0 ? Math.round((Number(row.stock_sold) / available) * 100) : 0
          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                  {row.name} <span className="font-normal text-slate-400">#{row.size}</span>
                </span>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${sellThrough >= 80 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : sellThrough >= 50 ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>{sellThrough}% {t('stockSold2').toLowerCase()}</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${inW}%` }} />
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${soldW}%` }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ReportsPage() {
  const { t } = useLanguage()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState(null)
  const [cats, setCats] = useState([])
  const [filters, setFilters] = useState({ startDate: '', endDate: '', categoryId: '' })

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams()
      if (filters.startDate) p.set('startDate', filters.startDate)
      if (filters.endDate) p.set('endDate', filters.endDate)
      if (filters.categoryId) p.set('categoryId', filters.categoryId)
      const res = await fetch(`/api/reports?${p}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to load report data')
      setRows(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) { setError(err.message); setRows([]) }
  }, [filters])

  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(setCats).catch(e => console.error(e)) }, [])
  useEffect(() => { load() }, [load])

  const totals = rows ? {
    in: rows.reduce((a, r) => a + Number(r.stock_in), 0),
    sold: rows.reduce((a, r) => a + Number(r.stock_sold), 0),
    current: rows.reduce((a, r) => a + Number(r.current_stock), 0),
  } : null
  const totalAvailable = totals ? (totals.sold + totals.current) : 0
  const globalSellThrough = totalAvailable > 0 ? Math.round((totals.sold / totalAvailable) * 100) : 0

  const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all appearance-none shadow-sm"

  return (
    <div className="space-y-6 animate-soft-in">
      {/* Header */}
      <div className="glass rounded-[2rem] p-5 sm:p-6 border-slate-200/50 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0 border-2 border-white/20 dark:border-white/10">
            <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('stockReport')}</h1>
            <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0 sm:mt-1 leading-tight sm:leading-normal">{t('stockReportDesc')}</p>
          </div>
        </div>
        <div className="w-full md:w-auto mt-1 md:mt-0">
          <ExportButtons filters={filters} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-between">
          <p>⚠️ {error}</p>
          <button onClick={load} className="text-xs underline hover:no-underline font-bold">{t('retry')}</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 glass p-5 rounded-[1.5rem] border-slate-200/50 dark:border-white/10 shadow-sm items-end">
        <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">{t('startDate')}</label>
          <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[150px]">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">{t('endDate')}</label>
          <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} className={inputCls} />
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">{t('category')}</label>
          <select value={filters.categoryId} onChange={e => setFilters(f => ({ ...f, categoryId: e.target.value }))} className={inputCls}
            style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}>
            <option value="">{t('allCategories')}</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {(filters.startDate || filters.endDate || filters.categoryId) && (
          <button onClick={() => setFilters({ startDate: '', endDate: '', categoryId: '' })}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <FilterX size={16} /> {t('resetFilter')}
          </button>
        )}
      </div>

      {/* Summary cards */}
      {totals && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
          {[
            { label: t('totalIn'), value: totals.in, color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25', icon: '📦' },
            { label: t('totalSold'), value: totals.sold, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/25', icon: '🛒' },
            { label: t('currentStock'), value: totals.current, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/25', icon: '📊' },
            { label: t('sellThrough'), value: `${globalSellThrough}%`, color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25', icon: '📈' },
          ].map(({ label, value, color, shadow, icon }) => (
            <div key={label} className={`rounded-[2rem] p-5 bg-gradient-to-br ${color} text-white shadow-xl ${shadow} relative overflow-hidden group`}>
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <span className="text-xl">{icon}</span>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</p>
              </div>
              <p className="text-3xl font-black relative z-10 drop-shadow-md">{typeof value === 'number' ? value.toLocaleString('id-ID') : value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {rows && rows.length > 0 && <StockCompareChart rows={rows} />}

      {/* Table */}
      <div className="glass rounded-[2rem] shadow-sm border-slate-200/50 dark:border-white/10 overflow-hidden">
        {/* Table title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
              <BarChart3 size={13} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white">{t('stockReport')}</p>
              <p className="text-[10px] text-slate-400 font-medium">
                {rows ? `${rows.length} ${t('itemsFound')}` : t('loading')}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-100 dark:border-violet-500/20">
            {rows?.length ?? 0} {t('records')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm table-premium">
            <thead>
              <tr>
                {['#', t('code'), t('sandal'), t('category'), t('color'), t('size'), t('totalIn'), t('totalSold'), t('currentStock'), t('sellThrough')].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {!rows ? (
                <tr><td colSpan={10} className="px-6 py-10 text-center text-slate-400 italic">{t('loading')}</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-10 text-center text-slate-400 italic">{t('noData')}</td></tr>
              ) : rows.map((row, i) => {
                const available = Number(row.stock_sold) + Number(row.current_stock)
                const st = available > 0 ? Math.round((Number(row.stock_sold) / available) * 100) : 0
                return (
                  <tr key={row.id}>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-violet-50 dark:bg-violet-500/10 text-[10px] font-black text-violet-600 dark:text-violet-400">{i + 1}</span>
                    </td>
                    <td className="text-slate-500 dark:text-slate-400 font-mono text-xs">{row.code || '—'}</td>
                    <td className="font-bold text-slate-800 dark:text-slate-200">{row.name}</td>
                    <td>
                      <span className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                        {row.category_name}
                      </span>
                    </td>
                    <td className="text-slate-600 dark:text-slate-400">{row.color}</td>
                    <td><span className="font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg text-xs">{row.size}</span></td>
                    <td>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                        +{row.stock_in}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
                        -{row.stock_sold}
                      </span>
                    </td>
                    <td><StockCell value={row.current_stock} /></td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(st, 100)}%`, background: st >= 80 ? '#10b981' : st >= 50 ? '#3b82f6' : '#94a3b8' }} />
                        </div>
                        <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 tabular-nums w-8">{st}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
