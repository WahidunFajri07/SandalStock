'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Tag, Footprints, PackagePlus, ShoppingBag, BarChart3,
  Menu, X, LogOut, User as UserIcon, Sun, Moon, ChevronRight, Globe
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/context/LanguageContext'

const NAV_KEYS = [
  { href: '/', key: 'dashboard', icon: LayoutDashboard, color: '#3b82f6' },
  { href: '/categories', key: 'categories', icon: Tag, color: '#8b5cf6' },
  { href: '/sandals', key: 'sandals', icon: Footprints, color: '#10b981' },
  { href: '/stock-in', key: 'stockIn', icon: PackagePlus, color: '#f59e0b' },
  { href: '/stock-sold', key: 'stockSold', icon: ShoppingBag, color: '#f43f5e' },
  { href: '/reports', key: 'reports', icon: BarChart3, color: '#06b6d4' },
]

export default function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const { lang, toggleLang, t } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const f = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(f)
  }, [])

  useEffect(() => {
    const f = requestAnimationFrame(() => setOpen(false))
    return () => cancelAnimationFrame(f)
  }, [pathname])

  return (
    <>
      {/* Top Navigation Overlay */}
      <div className="fixed top-4 left-4 right-4 lg:top-6 lg:right-6 lg:left-auto flex items-center justify-between lg:justify-end z-40 pointer-events-none">
        
        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(true)}
          className="lg:hidden pointer-events-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 transition-all hover:scale-105"
        >
          <Menu size={20} />
        </button>

        {/* Right Actions: Theme Toggle, Lang Toggle & Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* Lang Toggle in Header */}
          {mounted && (
            <button
              onClick={toggleLang}
              className="bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 sm:p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 transition-all hover:scale-105 hover:border-blue-500/30 flex items-center gap-1.5"
              title={lang === 'id' ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'}
            >
              <Globe size={18} />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">{lang}</span>
            </button>
          )}

          {/* Theme Toggle in Header */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2.5 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 transition-all hover:scale-105 hover:border-blue-500/30"
              title={theme === 'dark' ? t('light') : t('dark')}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}
          
          {/* User Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
              className="bg-white dark:bg-slate-900 p-1.5 pr-2 sm:pr-3 rounded-xl shadow-lg border border-slate-200 dark:border-white/10 flex items-center gap-2 transition-all hover:border-blue-500/30 hover:shadow-xl focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-black shadow-inner">
                {session?.user?.name?.slice(0, 2).toUpperCase() || 'UN'}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:block truncate max-w-[100px]">
                {session?.user?.name || 'User'}
              </span>
            </button>
            
            {/* Dropdown Menu */}
            <div className={`absolute right-0 top-[calc(100%+0.5rem)] w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-slate-100 dark:border-slate-800 transition-all duration-200 transform origin-top-right p-2 overflow-hidden ${userMenuOpen ? 'opacity-100 visible scale-100' : 'opacity-0 invisible scale-95'}`}>
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                <p className="text-xs font-black text-slate-800 dark:text-white truncate">{session?.user?.name}</p>
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 mt-1">{session?.user?.role === 'admin' ? t('roleAdmin') : t('roleStaff')}</p>
              </div>
              <Link href="/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors">
                <UserIcon size={14} />
                {t('profile')}
              </Link>
              <button 
                onClick={() => {
                  setUserMenuOpen(false);
                  signOut();
                }} 
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-left mt-1 border border-transparent hover:border-red-100 dark:hover:border-red-500/20"
              >
                <LogOut size={14} />
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={[
          'fixed inset-0 bg-slate-900/50 dark:bg-black/70 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside className={[
        'fixed top-0 left-0 h-full w-64 z-50 flex flex-col',
        'bg-white dark:bg-slate-950 shadow-[4px_0_32px_rgba(0,0,0,0.04)] border-r border-slate-200 dark:border-white/5',
        'transition-transform duration-300',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}>

        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm shrink-0 transition-transform hover:rotate-3">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover shadow-inner" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">
                {t('tokoKembar')}
              </h1>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest -mt-0.5">
                {t('inventoryPro')}
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-3 mb-2">Menu</p>
          {NAV_KEYS.map(({ href, key, icon: Icon, color }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link key={href} href={href}
                className={[
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden',
                  active
                    ? 'text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white',
                ].join(' ')}
                style={active ? { background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 4px 14px ${color}40` } : {}}
              >
                {/* Shimmer on hover for inactive */}
                {!active && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${color}0a, ${color}05)` }} />
                )}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:scale-110'
                  }`}
                  style={!active ? { color } : {}}>
                  <Icon size={15} className={active ? 'text-white' : ''} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className="flex-1 relative z-10">{t(key)}</span>
                {active && <ChevronRight size={14} className="text-white/60 shrink-0" />}
              </Link>
            )
          })}

          {/* Profile Link */}
          <div className="pt-3">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] px-3 mb-2">Account</p>
            <Link href="/profile"
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative overflow-hidden',
                pathname === '/profile'
                  ? 'text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white',
              ].join(' ')}
              style={pathname === '/profile' ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 14px #7c3aed40' } : {}}>
              {!pathname.startsWith('/profile') && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #7c3aed0a, #7c3aed05)' }} />
              )}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${pathname === '/profile' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:scale-110'
                }`} style={pathname !== '/profile' ? { color: '#7c3aed' } : {}}>
                <UserIcon size={15} className={pathname === '/profile' ? 'text-white' : ''} strokeWidth={2} />
              </div>
              <span className="flex-1 relative z-10">{t('profile')}</span>
              {pathname === '/profile' && <ChevronRight size={14} className="text-white/60 shrink-0" />}
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-white/5 space-y-3">
          {/* Theme + Lang Toggles */}
          {mounted && (
            <div className="flex gap-2">
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1 flex-1 flex relative overflow-hidden">
                <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-white/10 transition-all duration-300 shadow-sm
                  ${theme === 'dark' ? 'left-[calc(50%+2px)]' : 'left-1'}`} />
                <button onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-all relative z-10 ${theme === 'dark' ? 'text-slate-500' : 'text-blue-600'}`}>
                  <Sun size={12} /> {t('light')}
                </button>
                <button onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold transition-all relative z-10 ${theme === 'light' ? 'text-slate-400' : 'text-blue-400'}`}>
                  <Moon size={12} /> {t('dark')}
                </button>
              </div>

              <button onClick={toggleLang}
                className="w-14 h-full bg-slate-100 dark:bg-slate-800/50 rounded-xl flex items-center justify-center text-xs font-black uppercase text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 border border-slate-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 transition-all">
                {lang}
              </button>
            </div>
          )}

          {/* User Info */}
          {session ? (
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-3 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-md shrink-0">
                  {session.user.name?.slice(0, 2).toUpperCase() || 'UN'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">{session.user.name}</p>
                  <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest">
                    {session.user.role === 'admin' ? t('roleAdmin') : t('roleStaff')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 py-2 text-[10px] font-black uppercase tracking-widest
                  text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent
                  hover:border-red-200 dark:hover:border-red-500/20 rounded-xl transition-all">
                <LogOut size={12} /> {t('signOut')}
              </button>
            </div>
          ) : (
            <div className="px-2 py-2 text-[10px] text-slate-400 font-medium text-center">
              © 2026 | Toko Kembar
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
