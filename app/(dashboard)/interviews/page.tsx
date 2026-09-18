/**
 * app/(dashboard)/interviews/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * /interviews — Interview agenda
 * Server Component: fetches interviews joined with application→candidate/job,
 * groups by upcoming vs past, renders type + result badges and rating stars.
 */
import Link from 'next/link'
import { createClient }             from '@/lib/supabase/server'
import { InterviewResultBadge, InterviewTypeBadge } from '@/components/ui/Badge'
import { Button }                   from '@/components/ui/Button'
import { Card, CardBody }           from '@/components/ui/Card'
import { EmptyState }               from '@/components/ui/EmptyState'
import { formatDateTime, truncate } from '@/lib/utils'
import type {
  InterviewRow,
  InterviewResult,
  InterviewType,
  CandidateRow,
  JobRow,
} from '@/lib/supabase/types'

// ── Joined shape ─────────────────────────────────────────────────────────────

interface InterviewWithRelations extends InterviewRow {
  applications: {
    candidates: Pick<CandidateRow, 'id' | 'full_name' | 'email'>
    jobs:       Pick<JobRow, 'id' | 'title'>
  }
}

// ── Icons ────────────────────────────────────────────────────────────────────

function CalendarIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}

// ── Rating stars ─────────────────────────────────────────────────────────────

function RatingStars({ rating }: { rating: number | null }) {
  if (rating == null) return <span className="text-slate-400 text-xs">—</span>
  return (
    <div className="flex gap-0.5" aria-label={`Puntuación: ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? 'text-amber-400' : 'text-slate-200'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 0 0 .95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 0 0-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 0 0-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 0 0-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 0 0 .951-.69l1.07-3.292Z" />
        </svg>
      ))}
    </div>
  )
}

// ── Stat helpers ─────────────────────────────────────────────────────────────

function buildStats(interviews: InterviewRow[]) {
  const byResult = (r: InterviewResult) =>
    interviews.filter(i => i.result === r).length
  const upcoming = interviews.filter(
    i => new Date(i.scheduled_at) > new Date() && i.result === 'pending',
  ).length
  return {
    total:    interviews.length,
    upcoming,
    passed:   byResult('passed'),
    pending:  byResult('pending'),
  }
}

// ── Upcoming vs past split ───────────────────────────────────────────────────

function splitInterviews(interviews: InterviewWithRelations[]) {
  const now = new Date()
  return {
    upcoming: interviews.filter(i => new Date(i.scheduled_at) >= now),
    past:     interviews.filter(i => new Date(i.scheduled_at) <  now),
  }
}

// ── Interview row component ──────────────────────────────────────────────────

function InterviewTableRow({ interview }: { interview: InterviewWithRelations }) {
  const { candidates: candidate, jobs: job } = interview.applications

  return (
    <tr className="group">
      <td>
        <Link
          href={`/interviews/${interview.id}`}
          id={`interview-link-${interview.id}`}
          className="font-medium text-slate-900 hover:text-brand-600 transition-colors"
        >
          {truncate(candidate.full_name, 35)}
        </Link>
        <p className="text-xs text-slate-400">{candidate.email}</p>
      </td>
      <td className="text-slate-600">{truncate(job.title, 40)}</td>
      <td>
        <InterviewTypeBadge type={interview.interview_type as InterviewType} />
      </td>
      <td className="whitespace-nowrap text-slate-600">
        {formatDateTime(interview.scheduled_at)}
      </td>
      <td>{interview.duration_minutes} min</td>
      <td>
        <InterviewResultBadge result={interview.result as InterviewResult} />
      </td>
      <td>
        <RatingStars rating={interview.rating} />
      </td>
      <td className="text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/interviews/${interview.id}`}
            id={`interview-view-${interview.id}`}
            className="text-xs text-brand-600 hover:underline font-medium"
          >
            Ver
          </Link>
          {interview.result === 'pending' && (
            <Link
              href={`/interviews/${interview.id}/edit`}
              id={`interview-edit-${interview.id}`}
              className="text-xs text-slate-500 hover:underline"
            >
              Editar
            </Link>
          )}
        </div>
      </td>
    </tr>
  )
}

// ── Table shell ──────────────────────────────────────────────────────────────

function InterviewTable({ interviews }: { interviews: InterviewWithRelations[] }) {
  return (
    <div className="table-wrapper rounded-b-xl rounded-t-none border-0">
      <table>
        <thead>
          <tr>
            <th>Candidato</th>
            <th>Vacante</th>
            <th>Tipo</th>
            <th>Fecha</th>
            <th>Duración</th>
            <th>Resultado</th>
            <th>Valoración</th>
            <th className="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {interviews.map(interview => (
            <InterviewTableRow key={interview.id} interview={interview} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function InterviewsPage() {
  const supabase = await createClient()

  const { data: rawInterviews, error } = await supabase
    .from('interviews')
    .select(`
      *,
      applications (
        candidates (
          id,
          full_name,
          email
        ),
        jobs (
          id,
          title
        )
      )
    `)
    .order('scheduled_at', { ascending: true })

  const interviews = (rawInterviews ?? []) as InterviewWithRelations[]
  const stats = buildStats(interviews)
  const { upcoming, past } = splitInterviews(interviews)

  return (
    <div className="space-y-8 animate-slide-up">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Entrevistas</h1>
          <p className="page-subtitle">
            {stats.upcoming > 0
              ? `${stats.upcoming} próximas · ${stats.passed} aprobadas`
              : 'Agenda de entrevistas'}
          </p>
        </div>
        <Link href="/interviews/schedule" id="btn-schedule-interview">
          <Button variant="primary" size="md">
            <PlusIcon />
            Programar entrevista
          </Button>
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total',     value: stats.total,   color: 'text-brand-600' },
          { label: 'Próximas',  value: stats.upcoming, color: 'text-blue-600' },
          { label: 'Pendientes', value: stats.pending, color: 'text-amber-500' },
          { label: 'Aprobadas', value: stats.passed,  color: 'text-green-600' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error al cargar entrevistas: {error.message}
        </div>
      )}

      {/* ── Upcoming section ── */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-800">Próximas entrevistas</h2>
            {upcoming.length > 0 && (
              <span className="badge badge-blue">{upcoming.length}</span>
            )}
          </div>
        </div>

        {upcoming.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={<CalendarIcon />}
              title="No hay entrevistas próximas"
              description="Programa entrevistas para candidatos en etapa de evaluación."
              action={
                <Link href="/interviews/schedule">
                  <Button variant="primary" size="sm">
                    <PlusIcon />
                    Programar entrevista
                  </Button>
                </Link>
              }
            />
          </CardBody>
        ) : (
          <InterviewTable interviews={upcoming} />
        )}
      </Card>

      {/* ── Past section ── */}
      {past.length > 0 && (
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">
              Entrevistas pasadas
            </h2>
          </div>
          <InterviewTable interviews={past} />
        </Card>
      )}
    </div>
  )
}
