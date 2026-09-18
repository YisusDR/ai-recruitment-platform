/**
 * app/layout.tsx — Root layout
 * Applies Inter font, dark-mode class strategy, and global CSS.
 */
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'ATS Platform',
    template: '%s | ATS Platform',
  },
  description: 'AI-powered Applicant Tracking System — manage jobs, candidates, and interviews with semantic CV ranking.',
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
