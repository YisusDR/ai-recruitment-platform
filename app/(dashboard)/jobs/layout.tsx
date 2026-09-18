/**
 * app/(dashboard)/jobs/layout.tsx
 * Provides Metadata for the /jobs domain.
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vacantes',
  description: 'Gestiona las vacantes abiertas, en pausa y archivadas de tu empresa.',
}

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
