import './globals.css'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from '@/components/Providers'
import LayoutWrapper from '@/components/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Kembar — Sandal Stock Management',
  description: 'Manage sandal inventory, stock-in, stock-sold and generate reports.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased`}>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
