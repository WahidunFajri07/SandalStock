'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Panel */}
      <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-slate-200/50 dark:border-white/10 animate-soft-in">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-black tracking-tight text-slate-800 dark:text-white uppercase">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-[2rem]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
