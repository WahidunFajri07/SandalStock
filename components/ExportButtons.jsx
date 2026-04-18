'use client'

import { FileSpreadsheet, FileText, File } from 'lucide-react'
import { toast } from 'sonner'

export default function ExportButtons({ filters = {} }) {
  const download = async (format) => {
    const params = new URLSearchParams({ format, ...filters })
    for (const [k, v] of [...params]) { if (!v) params.delete(k) }

    const toastId = toast.loading(`Generating ${format.toUpperCase()} report…`)
    try {
      const res = await fetch(`/api/reports/export?${params}`)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Koneksi bermasalah' }))
        throw new Error(errorData.error || 'Ekspor gagal')
      }
      
      const contentType = res.headers.get('content-type')
      const blob = new Blob([await res.arrayBuffer()], { type: contentType })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      
      // Dynamic filename with date
      const date = new Date().toISOString().slice(0, 10)
      const ext  = format === 'excel' ? 'xlsx' : format
      
      a.href     = url
      a.download = `sandal-report-${date}.${ext}`
      a.click()
      
      // Small timeout to ensure browser starts download before revoking
      setTimeout(() => URL.revokeObjectURL(url), 500)
      
      toast.success(`${format.toUpperCase()} downloaded!`, { id: toastId })
    } catch (err) {
      toast.error(`Export failed: ${err.message}`, { id: toastId })
    }
  }

  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => download('csv')}
        className="btn-elegant flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 rounded-xl transition-all shadow-sm"
      >
        <FileText size={16} /> CSV
      </button>
      <button
        onClick={() => download('excel')}
        className="btn-elegant flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 hover:bg-violet-100 dark:hover:bg-violet-500/20 rounded-xl transition-all shadow-sm"
      >
        <FileSpreadsheet size={16} /> Excel
      </button>
      <button
        onClick={() => download('pdf')}
        className="btn-elegant flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/20 rounded-xl transition-all shadow-sm"
      >
        <File size={16} /> PDF
      </button>
    </div>
  )
}
