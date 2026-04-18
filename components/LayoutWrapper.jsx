'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import { ThemeProvider } from 'next-themes'

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const isAuthPage = pathname === '/login' || pathname === '/register'

  // Stability Guard for Navigation Transitions
  // Fixes: Uncaught TypeError: Cannot read properties of null (reading 'dispatchEvent') at History.pushState
  // This typically occurs when browser extensions try to observe DOM changes during Next.js route swaps.
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const originalPushState = window.history.pushState
    window.history.pushState = function(...args) {
      try {
        return originalPushState.apply(this, args)
      } catch (err) {
        // Silently recover from dispatchEvent errors to prevent app crash
        if (err instanceof TypeError && err.message.includes('dispatchEvent')) {
          return
        }
        throw err
      }
    }
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
      {!isAuthPage && <Sidebar />}
      <main className={`min-h-screen transition-colors duration-300 bg-slate-50 dark:bg-slate-950 ${!isAuthPage ? 'lg:pl-64' : ''}`}>
        <div className={!isAuthPage ? 'p-6 pt-16 lg:pt-6' : 'h-screen w-full'}>
          {children}
        </div>
      </main>
    </ThemeProvider>
  )
}
