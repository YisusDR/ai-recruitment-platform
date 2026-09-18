/**
 * app/(dashboard)/jobs/new/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * /jobs/new — Crear nueva vacante
 * Server Component shell; form logic delegated to <NewJobForm> (Client Component).
 */
import Link from 'next/link'
import { NewJobForm } from '@/components/jobs/NewJobForm'

export const metadata = {
  title: 'Nueva vacante | ATS',
  description: 'Crea una nueva vacante en la plataforma de reclutamiento.',
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-slide-up">

      {/* ── Breadcrumb / back ── */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link
          href="/jobs"
          id="link-back-to-jobs"
          className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors"
        >
          <ArrowLeftIcon />
          Vacantes
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Nueva</span>
      </div>

      {/* ── Page header ── */}
      <div>
        <h1 className="page-title">Crear nueva vacante</h1>
        <p className="page-subtitle mt-1">
          Completa los campos a continuación para publicar una nueva posición.
        </p>
      </div>

      {/* ── Card shell ── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8">
        <NewJobForm />
      </div>
    </div>
  )
}
