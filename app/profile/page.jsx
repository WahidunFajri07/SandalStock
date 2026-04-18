'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/context/LanguageContext'
import { toast } from 'sonner'
import { User, Lock, Shield, Calendar, Edit3, Save, Eye, EyeOff } from 'lucide-react'

const inputCls = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all shadow-sm"

const PasswordInput = ({ id, label, value, show, onToggle, onChange }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest pl-1 cursor-pointer w-fit">{label}</label>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        className={`${inputCls} pr-11`}
      />
      <button type="button" onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
)

export default function ProfilePage() {
  const { data: session } = useSession()
  const { t } = useLanguage()
  const [saving, setSaving] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return toast.error(t('passwordMismatch'))
    if (pwForm.newPassword.length < 6)
      return toast.error(t('passwordShort'))
    setSaving(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memperbarui kata sandi')
      toast.success(t('passwordUpdated'))
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  if (!session) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400 italic text-sm">{t('loading')}</div>
    </div>
  )

  const user = session.user
  const roleColor = user.role === 'admin'
    ? 'from-violet-500 to-purple-600'
    : 'from-blue-500 to-indigo-600'

  const initials = user.name ? user.name.slice(0, 2).toUpperCase() : 'UN'

  return (
    <div className="space-y-6 animate-soft-in max-w-3xl mx-auto pb-10">
      {/* Header Card */}
      <div className="glass rounded-[2rem] p-5 sm:p-6 border-slate-200/50 dark:border-white/10 shadow-sm flex items-center gap-4 sm:gap-5">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 shrink-0 border-2 border-white/20 dark:border-white/10">
           <User className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow-md" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight">{t('myProfile')}</h1>
          <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0 sm:mt-1 leading-tight sm:leading-normal">{t('profileDesc')}</p>
        </div>
      </div>

      {/* Profile Hero Card */}
      <div className="glass rounded-[2rem] overflow-hidden shadow-sm border-slate-200/50 dark:border-white/10 relative">
        {/* Gradient banner - rounded separately to allow avatar shadow to overflow outside parent if needed */}
        <div className={`h-32 bg-gradient-to-br ${roleColor} relative overflow-hidden rounded-t-[2rem]`}>
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-8 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute top-4 right-5 text-[4.5rem] opacity-10 select-none">👡</div>
        </div>

        {/* Avatar + Info */}
        <div className="px-8 pb-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-6 -mt-10 mb-6 relative z-10">
            <div
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-xl border-4 border-white dark:border-slate-950 shrink-0`}>
              {initials}
            </div>
            <div className="pb-1 min-w-0 flex-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white truncate sm:pb-2">{user.name}</h2>
              <div className="flex items-center gap-2 mt-2 sm:mt-6">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10.5px] font-black uppercase tracking-widest text-white bg-gradient-to-r ${roleColor} shadow-sm`}>
                  <Shield size={10} />
                  {user.role === 'admin' ? t('roleAdmin') : t('roleStaff')}
                </span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <User size={15} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('username')}</span>
              </div>
              <p className="text-lg font-black text-slate-800 dark:text-white break-all">{user.name}</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-500/20 flex items-center justify-center">
                  <Shield size={15} className="text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t('role')}</span>
              </div>
              <p className="text-lg font-black text-slate-800 dark:text-white capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="glass rounded-[2rem] shadow-sm border-slate-200/50 dark:border-white/10 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Lock size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('changePassword')}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Perbarui keamanan akun Anda</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="p-8 space-y-5">
          <PasswordInput
            id="currentPassword"
            label={t('currentPassword')}
            value={pwForm.currentPassword}
            show={showPasswords}
            onToggle={() => setShowPasswords(v => !v)}
            onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              id="newPassword"
              label={t('newPassword')}
              value={pwForm.newPassword}
              show={showPasswords}
              onToggle={() => setShowPasswords(v => !v)}
              onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
            />
            <PasswordInput
              id="confirmPassword"
              label={t('confirmPassword')}
              value={pwForm.confirmPassword}
              show={showPasswords}
              onToggle={() => setShowPasswords(v => !v)}
              onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
            />
          </div>

          {/* Strength hint */}
          {pwForm.newPassword && (
            <div className="flex items-center gap-2">
              {[1,2,3,4].map(n => (
                <div key={n} className={`flex-1 h-1.5 rounded-full transition-all ${
                  pwForm.newPassword.length >= n * 3
                    ? n <= 1 ? 'bg-red-400' : n <= 2 ? 'bg-amber-400' : n <= 3 ? 'bg-blue-400' : 'bg-emerald-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`} />
              ))}
              <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                {pwForm.newPassword.length < 4 ? 'Lemah' : pwForm.newPassword.length < 8 ? 'Sedang' : pwForm.newPassword.length < 12 ? 'Kuat' : 'Sangat Kuat'}
              </span>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={saving}
              className="btn-elegant flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50">
              <Save size={15} />
              {saving ? t('saving') : t('updatePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
