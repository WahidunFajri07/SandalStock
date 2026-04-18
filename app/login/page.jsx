'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AnimatedBackground from '@/components/AnimatedBackground'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await signIn('credentials', { ...form, redirect: false })
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rgb-flow-container group shadow-2xl">
          <div className="rgb-flow-bg" />
          <div className="relative bg-white dark:bg-slate-900 backdrop-blur-2xl p-8 rounded-[2.1rem]">

            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
                <span className="text-3xl">👡</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">KEMBAR STOCK</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Silakan masuk ke akun Anda</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-semibold text-center">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1">Username</label>
                <input
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-slate-900 dark:text-white transition-all shadow-sm"
                  placeholder="Masukkan username"
                  disabled={loading}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-slate-900 dark:text-white transition-all shadow-sm"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-2"
              >
                {loading ? 'Masuk...' : 'Masuk ke Sistem'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
              Belum punya akun?{' '}
              <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                Daftar di sini
              </Link>
            </div>

          </div>
        </div>
      </motion.div>
    </div>
  )
}
