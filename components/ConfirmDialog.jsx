'use client'

import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, onClose, onConfirm, message = 'Are you sure you want to delete this item?' }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm Deletion"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose() }}
            className="btn-elegant px-6 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-500/25"
          >
            Delete
          </button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex-shrink-0 w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center border border-red-100 dark:border-red-500/20">
          <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 pt-2">{message}</p>
        </div>
      </div>
    </Modal>
  )
}
