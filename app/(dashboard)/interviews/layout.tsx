/**
 * app/(dashboard)/interviews/layout.tsx
 * Provides Metadata for the /interviews domain.
 */
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Entrevistas',
  description: 'Agenda de entrevistas programadas, resultados y feedback de candidatos.',
}

export default function InterviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
