/**
 * app/(dashboard)/candidates/new/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Create a new candidate manually.
 */
import Link from 'next/link'
import { CandidateForm } from '@/components/candidates/CandidateForm'

export const metadata = {
  title: 'Nuevo candidato | ATS',
  description: 'Añade un nuevo candidato manualmente a la plataforma.',
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

export default function NewCandidatePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-slide-up">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/candidates" className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
          <ArrowLeftIcon />
          Candidatos
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Nuevo</span>
      </div>

      <div>
        <h1 className="page-title">Añadir candidato</h1>
        <p className="page-subtitle mt-1">
          Registra un nuevo candidato manualmente. El CV puede ser procesado posteriormente por n8n.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8">
        <CandidateForm />
      </div>
    </div>
  )
}
