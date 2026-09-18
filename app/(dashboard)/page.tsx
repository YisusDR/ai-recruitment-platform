/**
 * app/(dashboard)/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dashboard overview: KPIs, recent activity, pipeline summary.
 */
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { JobStatusBadge, StageBadge, InterviewResultBadge } from '@/components/ui/Badge'
import { formatDate, formatDateTime, truncate } from '@/lib/utils'
import type { JobRow, CandidateRow, InterviewRow, ApplicationRow } from '@/lib/supabase/types'

// ── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, color, href }: { label: string; value: number; color: string; href: string }) {
  return (
    <Link href={href}>
      <Card className="p-5 hover:shadow-brand transition-shadow cursor-pointer group">
        <p className="text-sm text-slate-500">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${color} group-hover:scale-105 transition-transform origin-left`}>{value}</p>
      </Card>
    </Link>
  )
}

// ── Icons ────────────────────────────────────────────────────────────────────

function ArrowRightIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()

  // Parallel data fetching
  const [jobsResult, candidatesResult, interviewsResult, appsResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('jobs').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(5) as Promise<{ data: Pick<JobRow, 'id' | 'title' | 'status' | 'created_at'>[] | null }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('candidates').select('id, full_name, email, embedding_status, created_at').is('deleted_at', null).order('created_at', { ascending: false }).limit(5) as Promise<{ data: Pick<CandidateRow, 'id' | 'full_name' | 'email' | 'embedding_status' | 'created_at'>[] | null }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('interviews').select('id, scheduled_at, result, interview_type, duration_minutes').order('scheduled_at', { ascending: true }).limit(5) as Promise<{ data: Pick<InterviewRow, 'id' | 'scheduled_at' | 'result' | 'interview_type' | 'duration_minutes'>[] | null }>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from('applications').select('id, stage').order('created_at', { ascending: false }) as Promise<{ data: Pick<ApplicationRow, 'id' | 'stage'>[] | null }>,
  ])

  const jobs = jobsResult.data ?? []
  const candidates = candidatesResult.data ?? []
  const interviews = interviewsResult.data ?? []
  const apps = appsResult.data ?? []

  // KPIs
  const openJobs = jobs.filter(j => j.status === 'open').length
  const totalCandidates = candidates.length
  const upcomingInterviews = interviews.filter(i => new Date(i.scheduled_at) >= new Date() && i.result === 'pending').length
  const inPipeline = apps.filter(a => !['hired', 'rejected', 'withdrawn'].includes(a.stage)).length

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Header ── */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle mt-1">Resumen general de tu plataforma de reclutamiento</p>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Vacantes abiertas" value={openJobs} color="text-green-600" href="/jobs" />
        <StatCard label="Candidatos" value={totalCandidates} color="text-brand-600" href="/candidates" />
        <StatCard label="Entrevistas próximas" value={upcomingInterviews} color="text-blue-600" href="/interviews" />
        <StatCard label="En pipeline" value={inPipeline} color="text-amber-500" href="/candidates" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ── Recent jobs ── */}
        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Vacantes recientes</h2>
            <Link href="/jobs" className="text-xs text-brand-600 hover:underline font-medium inline-flex items-center gap-1">
              Ver todas <ArrowRightIcon />
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="p-5 text-center text-sm text-slate-500">Sin vacantes aún.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {jobs.slice(0, 5).map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{truncate(job.title, 40)}</p>
                    <p className="text-xs text-slate-400">{formatDate(job.created_at)}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* ── Upcoming interviews ── */}
        <Card>
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Próximas entrevistas</h2>
            <Link href="/interviews" className="text-xs text-brand-600 hover:underline font-medium inline-flex items-center gap-1">
              Ver todas <ArrowRightIcon />
            </Link>
          </div>
          {interviews.length === 0 ? (
            <div className="p-5 text-center text-sm text-slate-500">Sin entrevistas programadas.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {interviews.slice(0, 5).map(interview => (
                <Link key={interview.id} href={`/interviews/${interview.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/60 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{formatDateTime(interview.scheduled_at)}</p>
                    <p className="text-xs text-slate-400">{interview.duration_minutes} min · {interview.interview_type.replace('_', ' ')}</p>
                  </div>
                  <InterviewResultBadge result={interview.result} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Quick actions ── */}
      <div className="flex flex-wrap gap-3">
        <Link href="/jobs/new">
          <Button variant="primary" size="md">Nueva vacante</Button>
        </Link>
        <Link href="/candidates/new">
          <Button variant="secondary" size="md">Añadir candidato</Button>
        </Link>
        <Link href="/interviews/schedule">
          <Button variant="secondary" size="md">Programar entrevista</Button>
        </Link>
      </div>
    </div>
  )
}
