/**
 * app/(dashboard)/interviews/schedule/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Schedule a new interview: picks an application and an interviewer.
 */
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { InterviewForm } from '@/components/interviews/InterviewForm'
import type { ApplicationRow, CandidateRow, JobRow, RecruiterRow } from '@/lib/supabase/types'

export const metadata = {
  title: 'Programar entrevista | ATS',
  description: 'Programa una nueva entrevista para un candidato.',
}

interface ApplicationWithRelations extends ApplicationRow {
  candidates: Pick<CandidateRow, 'full_name'>
  jobs: Pick<JobRow, 'title'>
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

export default async function ScheduleInterviewPage() {
  const supabase = await createClient()

  // Fetch active applications (not hired/rejected/withdrawn)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawApps } = await (supabase as any)
    .from('applications')
    .select(`
      id, stage,
      candidates (full_name),
      jobs (title)
    `)
    .not('stage', 'in', '("hired","rejected","withdrawn")')
    .order('created_at', { ascending: false }) as { data: ApplicationWithRelations[] | null }

  // Fetch active recruiters as interviewer options
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawRecruiters } = await (supabase as any)
    .from('recruiters')
    .select('id, full_name')
    .eq('is_active', true)
    .order('full_name') as { data: Pick<RecruiterRow, 'id' | 'full_name'>[] | null }

  const applications = (rawApps ?? []).map(app => ({
    id: app.id,
    candidateName: app.candidates?.full_name ?? 'Candidato',
    jobTitle: app.jobs?.title ?? 'Vacante',
  }))

  const recruiters = (rawRecruiters ?? []).map(r => ({
    id: r.id,
    fullName: r.full_name,
  }))

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-slide-up">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/interviews" className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
          <ArrowLeftIcon />
          Entrevistas
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Programar</span>
      </div>

      <div>
        <h1 className="page-title">Programar entrevista</h1>
        <p className="page-subtitle mt-1">
          Selecciona la aplicación, el entrevistador, y la fecha para agendar la sesión.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8">
        <InterviewForm applications={applications} recruiters={recruiters} />
      </div>
    </div>
  )
}
