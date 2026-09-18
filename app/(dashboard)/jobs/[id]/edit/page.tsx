/**
 * app/(dashboard)/jobs/[id]/edit/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Edit existing job.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditJobForm } from '@/components/jobs/EditJobForm'
import type { JobRow } from '@/lib/supabase/types'

export const metadata = {
  title: 'Editar vacante | ATS',
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: job, error } = await (supabase as any)
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single() as { data: JobRow | null; error: unknown }

  if (error || !job) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-slide-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href={`/jobs/${id}`} className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
          <ArrowLeftIcon />
          {job.title}
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Editar</span>
      </div>

      <div>
        <h1 className="page-title">Editar vacante</h1>
        <p className="page-subtitle mt-1">Modifica los campos y guarda los cambios.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8">
        <EditJobForm job={job} />
      </div>
    </div>
  )
}
