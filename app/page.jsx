'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Tag, Footprints, PackagePlus, ShoppingBag, AlertTriangle,
  TrendingUp, TrendingDown, ArrowUpRight, RefreshCw, Sparkles, Clock, LayoutDashboard
} from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useSession } from 'next-auth/react'

/* ─────────────────────────── HELPERS ─────────────────────────── */
const PALETTE = [
  ['#3b82f6','#6366f1'], ['#8b5cf6','#a855f7'], ['#10b981','#059669'],
  ['#f59e0b','#f97316'], ['#ec4899','#db2777'], ['#14b8a6','#0891b2'],
]
function getPalette(i) { return PALETTE[i % PALETTE.length] }

/* ──────────────────────── WELCOME CARD ───────────────────────── */
function WelcomeCard() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [time, setTime] = useState(new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => {
      cancelAnimationFrame(frame)
      clearInterval(timer)
    }
  }, [])

  const hour = time.getHours()
  const greeting = hour < 11 ? t('welcomeGreetMorning')
    : hour < 15 ? t('welcomeGreetDay')
    : hour < 19 ? t('welcomeGreetAfternoon')
    : t('welcomeGreetNight')
  const greetEmoji = hour < 11 ? '🌅' : hour < 15 ? '☀️' : hour < 19 ? '🌤️' : '🌙'

  const dateStr = mounted
    ? time.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  const userName = session?.user?.name || 'Admin'
  const userRole = session?.user?.role || ''

  return (
    <div className="welcome-gradient rounded-[2rem] p-6 sm:p-8 relative overflow-hidden" id="welcome-card">
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-12 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-20 -translate-y-1/2 text-[5rem] sm:text-[8rem] leading-none select-none float-anim opacity-[0.07] pointer-events-none">👡</div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center gap-6 sm:gap-8">
        {/* Left: Greeting */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <div className="relative flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ping-slow absolute" />
            </div>
            <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.25em]">{t('welcomeSystem')}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-1">
            {greetEmoji} {greeting},
          </h2>
          <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-3 sm:mb-4" style={{
            background: 'linear-gradient(90deg, #ffffff, #bfdbfe)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {userName}!
          </h2>

          <p className="text-white/60 text-xs sm:text-sm font-medium max-w-md leading-relaxed">
            {t('welcomeDesc')} <br className="hidden sm:block" />
            <span className="text-white/80">{t('welcomeSubDesc')}</span>
          </p>

          {userRole && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-white/10 border border-white/20 text-white/80 text-[10px] sm:text-[11px] font-black uppercase tracking-widest
              backdrop-blur-sm">
              <Sparkles size={11} className="text-yellow-300" />
              {userRole === 'admin' ? t('roleAdmin') : t('roleStaff')}
            </div>
          )}
        </div>

        {/* Right: Live Clock */}
        <div className="flex flex-row lg:flex-col items-center gap-4 lg:gap-2 shrink-0
          bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3 sm:px-8 sm:py-6">
          <div className="flex flex-col lg:items-center">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={11} className="text-white/50" />
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{t('currentTime')}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-3xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                {mounted ? time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </div>
              <div className="text-sm sm:text-lg font-bold text-white/40 tabular-nums">
                :{mounted ? String(time.getSeconds()).padStart(2, '0') : '00'}
              </div>
            </div>
          </div>
          <div className="text-[10px] sm:text-[11px] font-medium text-white/40 text-left lg:text-center max-w-[150px] sm:max-w-[200px] leading-tight">{dateStr}</div>
        </div>
      </div>

      {/* Bottom tips */}
      <div className="relative z-10 mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-[10px] font-black text-white/35 uppercase tracking-widest">{t('quickTips')}:</span>
        {[
          { icon: '📊', text: t('tip1') },
          { icon: '⚠️', text: t('tip2') },
          { icon: '🔄', text: t('tip3') },
        ].map((tip, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11px] text-white/45 font-medium">
            <span>{tip.icon}</span>{tip.text}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────── KPI CARD ─────────────────────────── */
function KpiCard({ label, value, icon: Icon, from, to, trend, trendLabel }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    if (value == null) return
    let start = 0
    const step = Math.ceil(value / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplayed(value); clearInterval(timer) }
      else setDisplayed(start)
    }, 16)
    return () => clearInterval(timer)
  }, [value])

  return (
    <div className="glass card-hover rounded-[2rem] p-6 flex items-center justify-between group transition-soft overflow-hidden relative">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
      <div className="flex flex-col gap-1.5 relative z-10">
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-4xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
          {value == null ? '—' : displayed.toLocaleString('id-ID')}
        </p>
        {trendLabel && (
          <p className={`text-[11px] font-bold flex items-center gap-1 ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendLabel}
          </p>
        )}
      </div>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3 shrink-0"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
        <Icon size={24} className="text-white drop-shadow-md" />
      </div>
    </div>
  )
}

/* ─────────────────── CATEGORY BAR CHART ─────────────────────── */
function CategoryBarChart({ data }) {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(null)
  if (!data || data.length === 0) return (
    <div className="glass rounded-[2rem] p-10 text-center text-slate-400 dark:text-slate-500 italic">
      {t('noInventory')}
    </div>
  )
  const max = Math.max(...data.map(d => d.stock), 1)
  const total = data.reduce((a, d) => a + d.stock, 0)

  return (
    <div className="glass rounded-[2rem] p-8 relative overflow-hidden border-slate-200/50 dark:border-white/10 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t('inventoryDist')}</h3>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{t('stockPerCat')}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-slate-800 dark:text-white">{total.toLocaleString('id-ID')}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalStock')}</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 h-48 mb-4">
        {data.map((cat, i) => {
          const [c1, c2] = getPalette(i)
          const heightPct = (cat.stock / max) * 100
          const pct = total > 0 ? Math.round((cat.stock / total) * 100) : 0
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <div className="relative w-full flex flex-col justify-end h-full">
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-200 pointer-events-none z-20
                  ${hovered === i ? 'opacity-100 -translate-y-1' : 'opacity-0 translate-y-0'}`}>
                  <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[11px] font-black px-3 py-1.5 rounded-xl shadow-2xl">
                    {cat.stock} unit ({pct}%)
                  </div>
                </div>
                <div className="w-full rounded-t-xl transition-all duration-700 ease-out cursor-pointer"
                  style={{
                    height: `${Math.max(heightPct, 5)}%`,
                    background: `linear-gradient(to top, ${c1}, ${c2})`,
                    opacity: hovered === null || hovered === i ? 1 : 0.4,
                    boxShadow: hovered === i ? `0 0 20px ${c1}60` : 'none',
                    transform: hovered === i ? 'scaleX(1.05)' : 'scaleX(1)',
                  }} />
              </div>
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 truncate w-full text-center uppercase tracking-tighter shrink-0">{cat.name}</p>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {data.map((cat, i) => {
          const [c1] = getPalette(i)
          const pct = total > 0 ? Math.round((cat.stock / total) * 100) : 0
          return (
            <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-400">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c1 }} />
              {cat.name} <span className="text-slate-400">({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─────────────────── TREND AREA CHART ─────────────────────── */
function TrendChart({ trendIn, trendSold, days }) {
  const { t } = useLanguage()
  const [activeDay, setActiveDay] = useState(null)

  const today = new Date()
  const dayList = Array.from({ length: days }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (days - 1 - i))
    return d.toISOString().slice(0, 10)
  })

  const inMap   = Object.fromEntries((trendIn   || []).map(r => [r.day, r.qty]))
  const soldMap = Object.fromEntries((trendSold || []).map(r => [r.day, r.qty]))
  const inValues   = dayList.map(d => inMap[d]   || 0)
  const soldValues = dayList.map(d => soldMap[d] || 0)
  const maxVal = Math.max(...inValues, ...soldValues, 1)
  const W = 100, H = 60

  const area = (vals) => {
    const points = vals.map((v, i) => ({
      x: (i / (dayList.length - 1)) * W,
      y: H - (v / maxVal) * H
    }))
    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`
    return { linePath, areaPath }
  }

  const inArea   = area(inValues)
  const soldArea = area(soldValues)

  return (
    <div className="glass rounded-[2rem] p-8 border-slate-200/50 dark:border-white/10 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{t('stockTrend')}</h3>
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{days} {t('lastNDays')}</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-emerald-500"><span className="w-3 h-1.5 rounded-full bg-emerald-500 inline-block" /> {t('stockIn2')}</span>
          <span className="flex items-center gap-1.5 text-rose-500"><span className="w-3 h-1.5 rounded-full bg-rose-500 inline-block" /> {t('stockSold2')}</span>
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '160px' }} preserveAspectRatio="none"
          onMouseLeave={() => setActiveDay(null)}>
          <defs>
            <linearGradient id="gradIn" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradSold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={inArea.areaPath}   fill="url(#gradIn)"   />
          <path d={soldArea.areaPath} fill="url(#gradSold)" />
          <path d={inArea.linePath}   fill="none" stroke="#10b981" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d={soldArea.linePath} fill="none" stroke="#f43f5e" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
          {dayList.map((day, i) => {
            const x = (i / (dayList.length - 1)) * W
            const yIn   = H - (inValues[i]   / maxVal) * H
            const ySold = H - (soldValues[i] / maxVal) * H
            return (
              <g key={day}>
                {inValues[i] > 0 && <circle cx={x} cy={yIn} r="1" fill="#10b981" className="cursor-pointer" onMouseEnter={() => setActiveDay(i)} />}
                {soldValues[i] > 0 && <circle cx={x} cy={ySold} r="1" fill="#f43f5e" className="cursor-pointer" onMouseEnter={() => setActiveDay(i)} />}
              </g>
            )
          })}
        </svg>

        {activeDay !== null && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-800 text-white text-[10px] font-bold px-3 py-2 rounded-xl shadow-2xl pointer-events-none z-10 whitespace-nowrap">
            <p className="text-slate-400 mb-1">{dayList[activeDay]}</p>
            <p className="text-emerald-400">{t('stockIn2')}: {inValues[activeDay]}</p>
            <p className="text-rose-400">{t('stockSold2')}: {soldValues[activeDay]}</p>
          </div>
        )}

        <div className="flex justify-between mt-2">
          {[0, Math.floor(days/4), Math.floor(days/2), Math.floor(days*3/4), days-1].map(i => (
            <span key={i} className="text-[9px] font-bold text-slate-400">{dayList[i]?.slice(5)}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── DONUT CHART ─────────────────────── */
function DonutChart({ data }) {
  const { t } = useLanguage()
  const [hovered, setHovered] = useState(null)

  const total = useMemo(() => (data || []).reduce((a, d) => a + d.stock, 0), [data])

  const arcs = useMemo(() => {
    if (!data || total === 0) return []
    const R = 40, CX = 50, CY = 50
    let current = -90
    const result = []
    for (const cat of data) {
      const pct = cat.stock / total
      const angle = pct * 360
      const start = current
      current += angle
      const [c1] = getPalette(result.length)
      const toRad = (deg) => (deg * Math.PI) / 180
      const x1 = CX + R * Math.cos(toRad(start))
      const y1 = CY + R * Math.sin(toRad(start))
      const x2 = CX + R * Math.cos(toRad(start + angle))
      const y2 = CY + R * Math.sin(toRad(start + angle))
      const d = `M ${x1} ${y1} A ${R} ${R} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2}`
      result.push({ d, color: c1, pct: Math.round(pct * 100), name: cat.name, stock: cat.stock })
    }
    return result
  }, [data, total])

  if (!data || data.length === 0 || total === 0) return null

  const strokeW = 18
  const hoveredArc = hovered !== null ? arcs[hovered] : null

  return (
    <div className="glass rounded-[2rem] p-8 border-slate-200/50 dark:border-white/10">
      <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight mb-6">{t('catPortion')}</h3>
      <div className="flex items-center gap-8">
        <div className="relative shrink-0">
          <svg viewBox="0 0 100 100" className="w-36 h-36">
            {arcs.map((arc, i) => (
              <path key={i} d={arc.d} fill="none" stroke={arc.color}
                strokeWidth={hovered === i ? strokeW + 3 : strokeW}
                strokeLinecap="butt"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                style={{ opacity: hovered === null || hovered === i ? 1 : 0.35 }} />
            ))}
            <text x="50" y="48" textAnchor="middle" className="font-black" fontSize="14" fill="currentColor" style={{ fontWeight: 900 }}>
              {hoveredArc ? hoveredArc.pct + '%' : total}
            </text>
            <text x="50" y="60" textAnchor="middle" fontSize="6" fill="#94a3b8">
              {hoveredArc ? hoveredArc.name : 'Total'}
            </text>
          </svg>
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {arcs.map((arc, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] font-bold cursor-pointer"
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: arc.color }} />
              <span className={`truncate transition-colors ${hovered === i ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{arc.name}</span>
              <span className="ml-auto shrink-0 font-black text-slate-800 dark:text-slate-200">{arc.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────── LOW STOCK PANEL ─────────────────────── */
function LowStockPanel({ items }) {
  const { t } = useLanguage()
  if (!items) return <div className="glass rounded-[2rem] p-5 h-48 animate-pulse" />
  if (items.length === 0) return (
    <div className="glass bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-500/20 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-3">
        <PackagePlus size={20} className="text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">{t('stockSafe')}</h3>
      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">{t('stockSafeDesc')}</p>
    </div>
  )
  return (
    <div className="glass bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-500/20 rounded-[2rem] p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <AlertTriangle size={80} className="text-amber-500" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
          <AlertTriangle size={16} className="text-white" />
        </div>
        <h3 className="font-bold text-amber-900 dark:text-amber-100 text-sm">{t('criticalStock')} ({items.length} item)</h3>
      </div>
      <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
        {items.map((s, i) => (
          <div key={s.id ?? i} className="text-[11px] bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-200 px-3 py-2.5 rounded-xl font-bold shadow-sm flex items-center justify-between gap-2">
            <div className="truncate">
              <span>{s.name}</span>
              {s.color && <span className="font-normal text-amber-600 dark:text-amber-400"> · {s.color}</span>}
              <span className="font-normal text-amber-500"> #{s.size}</span>
            </div>
            <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black ${
              s.stock === 0 ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
            }`}>
              {s.stock === 0 ? t('outLabel') : `${s.stock} ${t('leftLabel')}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── ACTIVITY FEED ─────────────────────── */
function ActivityFeed({ recentIn, recentSold }) {
  const { t } = useLanguage()
  const combined = [
    ...(recentIn   || []).map(r => ({ ...r, type: 'in' })),
    ...(recentSold || []).map(r => ({ ...r, type: 'sold' })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

  return (
    <div className="glass rounded-[2rem] border-slate-200/50 dark:border-white/10 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          {t('recentActivity')}
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100/50 dark:bg-slate-800 px-2.5 py-1 rounded-md">{t('live')}</span>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-800/50 max-h-[340px] overflow-y-auto">
        {combined.length === 0 ? (
          <div className="px-6 py-8 text-center text-slate-400 italic text-sm">{t('noActivity')}</div>
        ) : combined.map((r, i) => (
          <div key={i} className="px-6 py-3.5 flex items-center gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              r.type === 'in' ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/20'
            }`}>
              {r.type === 'in'
                ? <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                : <ShoppingBag size={12} className="text-rose-600 dark:text-rose-400" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{r.sandal_name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{r.color} · {r.date?.slice?.(0,10)}</p>
            </div>
            <span className={`text-xs font-black shrink-0 ${r.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {r.type === 'in' ? '+' : '-'}{r.quantity}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────── MAIN DASHBOARD ─────────────────────── */
export default function DashboardPage() {
  const { t } = useLanguage()
  const [data, setData]             = useState(null)
  const [error, setError]           = useState(null)
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const time = new Date().getTime()
      const res  = await fetch(`/api/dashboard?days=30&t=${time}`, { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Gagal memuat data')
      setData(json)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const stats = data?.stats
  const currentStock = stats ? Number(stats.current_stock) : null

  return (
    <div className="space-y-8 animate-soft-in">
      {/* Header */}
      <div className="glass rounded-[2rem] p-5 sm:p-6 border-slate-200/50 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0 border-2 border-white/20 dark:border-white/10">
             <LayoutDashboard className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {t('dashboard')} <span className="text-blue-600">Overview</span>
            </h1>
            <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0 sm:mt-1 leading-tight sm:leading-normal">
              {t('dashboardOverview')}
            </p>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="relative z-10 flex items-center gap-2 px-5 py-3 text-xs font-black uppercase tracking-widest
            bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400
            hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-xl transition-all
            border border-blue-100 dark:border-blue-500/20 shrink-0 self-start md:self-auto
            cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {t('refresh')}
        </button>
      </div>

      {/* Welcome Card */}
      <WelcomeCard />

      {/* Error */}
      {error && (
        <div className="glass border-red-200/50 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-6 py-4 rounded-3xl text-sm font-bold flex items-center justify-between">
          <p className="flex items-center gap-2">⚠️ {error}</p>
          <button onClick={() => load()} className="btn-elegant text-xs uppercase tracking-widest bg-red-600 text-white px-4 py-2 rounded-xl">{t('retry')}</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard label={t('categories')}  value={stats ? Number(stats.categories) : null} icon={Tag}         from="#3b82f6" to="#1d4ed8" />
        <KpiCard label="Total SKU"        value={stats ? Number(stats.skus)        : null} icon={Footprints}  from="#8b5cf6" to="#6d28d9" />
        <KpiCard label={t('currentStock')} value={currentStock}                           icon={PackagePlus} from="#10b981" to="#059669" />
        <KpiCard label={t('totalSold')}   value={stats ? Number(stats.total_sold)  : null} icon={ShoppingBag} from="#f43f5e" to="#be123c" />
      </div>

      {/* Charts */}
      {!loading && data && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><CategoryBarChart data={data.categoryStock} /></div>
            <div><DonutChart data={data.categoryStock} /></div>
          </div>

          <TrendChart trendIn={data.trendIn} trendSold={data.trendSold} days={30} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LowStockPanel items={data.lowStock} />
            <ActivityFeed recentIn={data.recentIn} recentSold={data.recentSold} />
          </div>
        </>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="glass rounded-[2rem] p-8 h-48 animate-pulse" />
          ))}
        </div>
      )}
    </div>
  )
}
