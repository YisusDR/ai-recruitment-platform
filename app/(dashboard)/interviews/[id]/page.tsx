/**
 * app/(dashboard)/interviews/[id]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Interview detail page: candidate, job, schedule, result, feedback, rating.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InterviewResultBadge, InterviewTypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { formatDateTime } from '@/lib/utils'
import type {
  InterviewRow, InterviewResult, InterviewType,
  CandidateRow, JobRow, RecruiterRow,
} from '@/lib/supabase/types'

interface InterviewFull extends InterviewRow {
  applications: {
    candidates: Pick<CandidateRow, 'id' | 'full_name' | 'email'>
    jobs: Pick<JobRow, 'id' | 'title'>
  }
  recruiters: Pick<RecruiterRow, 'id' | 'full_name' | 'email'> | null
}

// ── Icons ────────────────────────────────────────────────────────────────────

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
    </svg>
  )
}

// ── Rating stars ─────────────────────────────────────────────────────────────

function RatingStars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-slate-400 text-sm">Sin valoración</span>
  return (
    <div className="flex gap-0.5" aria-label={`Puntuación: ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-5 w-5 ${i < rating ? 'text-amber-400' : 'text-slate-200'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
        </svg>
      ))}
    </div>
  )
}

// ── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="w-36 shrink-0 text-sm font-medium text-slate-500">{label}</span>
      <div className="text-sm text-slate-900">{children}</div>
    </div>
  )
}

import { mockStore } from '@/lib/mock/store'
import { cookies } from 'next/headers'

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function InterviewDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const isDemo = cookieStore.has('ats_demo_user')

  let interview: InterviewFull | null = null
  let interviewer: Pick<RecruiterRow, 'id' | 'full_name' | 'email'> | null = null

  if (!isDemo) {
    try {
      const supabase = await createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: dbInterview } = await (supabase as any)
        .from('interviews')
        .select(`
          *,
          applications (
            candidates (id, full_name, email),
            jobs (id, title)
          )
        `)
        .eq('id', id)
        .single() as { data: InterviewFull | null; error: unknown }

      interview = dbInterview

      if (interview) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: dbInterviewer } = await (supabase as any)
          .from('recruiters')
          .select('id, full_name, email')
          .eq('id', interview.interviewer_id)
          .single() as { data: Pick<RecruiterRow, 'id' | 'full_name' | 'email'> | null }
        interviewer = dbInterviewer
      }
    } catch (_err) {
      // Supabase unavailable
    }
  }

  // Fallback to mock store
  if (!interview) {
    const mockI = mockStore.getInterviewById(id)
    if (mockI) {
      const app = mockStore.getApplicationById(mockI.application_id)
      const cand = app ? mockStore.getCandidateById(app.candidate_id) : null
      const mockJob = app ? mockStore.getJobById(app.job_id) : null
      const rec = mockStore.getCurrentRecruiter()
      interviewer = {
        id: rec.id,
        full_name: rec.full_name,
        email: rec.email,
      }
      interview = {
        ...mockI,
        applications: {
          candidates: {
            id: cand?.id ?? 'cand-1',
            full_name: cand?.full_name ?? 'Candidato',
            email: cand?.email ?? 'candidato@email.com',
          },
          jobs: {
            id: mockJob?.id ?? 'job-1',
            title: mockJob?.title ?? 'Vacante',
          },
        },
        recruiters: interviewer,
      }
    }
  }

  if (!interview) notFound()

  const candidate = interview.applications?.candidates
  const job = interview.applications?.jobs

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/interviews" className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
          <ArrowLeftIcon />
          Entrevistas
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Detalle</span>
      </div>

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">Entrevista con {candidate?.full_name ?? 'Candidato'}</h1>
            <InterviewResultBadge result={interview.result as InterviewResult} />
          </div>
          <p className="page-subtitle mt-1">
            {job?.title ?? 'Vacante'} · {formatDateTime(interview.scheduled_at)}
          </p>
        </div>
        {interview.result === 'pending' && (
          <Link href={`/interviews/${id}/edit`} id="btn-edit-interview">
            <Button variant="secondary" size="md">
              <PencilIcon />
              Registrar resultado
            </Button>
          </Link>
        )}
      </div>

      {/* ── Interview details ── */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Detalles de la entrevista</h2>
        </div>
        <CardBody>
          <InfoRow label="Candidato">
            {candidate ? (
              <Link href={`/candidates/${candidate.id}`} className="text-brand-600 hover:underline font-medium">
                {candidate.full_name}
              </Link>
            ) : '—'}
          </InfoRow>
          <InfoRow label="Email">{candidate?.email ?? '—'}</InfoRow>
          <InfoRow label="Vacante">
            {job ? (
              <Link href={`/jobs/${job.id}`} className="text-brand-600 hover:underline font-medium">
                {job.title}
              </Link>
            ) : '—'}
          </InfoRow>
          <InfoRow label="Entrevistador">{interviewer?.full_name ?? '—'}</InfoRow>
          <InfoRow label="Tipo">
            <InterviewTypeBadge type={interview.interview_type as InterviewType} />
          </InfoRow>
          <InfoRow label="Fecha">{formatDateTime(interview.scheduled_at)}</InfoRow>
          <InfoRow label="Duración">{interview.duration_minutes} min</InfoRow>
          <InfoRow label="URL reunión">
            {interview.meeting_url ? (
              <a href={interview.meeting_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                {interview.meeting_url}
              </a>
            ) : '—'}
          </InfoRow>
          <InfoRow label="Ubicación">{interview.location_notes || '—'}</InfoRow>
          <InfoRow label="Resultado">
            <InterviewResultBadge result={interview.result as InterviewResult} />
          </InfoRow>
          <InfoRow label="Valoración">
            <RatingStars rating={interview.rating} />
          </InfoRow>
          <InfoRow label="Notas">
            <p className="whitespace-pre-wrap">{interview.notes || 'Sin notas.'}</p>
          </InfoRow>
          {interview.conducted_at && (
            <InfoRow label="Realizada">{formatDateTime(interview.conducted_at)}</InfoRow>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
