/**
 * app/(dashboard)/candidates/layout.tsx
 * Provides Metadata for the /candidates domain.
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Candidatos',
  description: 'Lista de postulantes con ranking semántico por CV y estado de pipeline.',
}

export default function CandidatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
