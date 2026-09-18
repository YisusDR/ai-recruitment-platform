/**
 * app/(dashboard)/candidates/[id]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Candidate profile page with contact info, metadata, and application history.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EmbeddingBadge, StageBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import type { CandidateRow, ApplicationRow, JobRow } from '@/lib/supabase/types'

interface ApplicationWithJob extends ApplicationRow {
  jobs: Pick<JobRow, 'id' | 'title'>
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

// ── Initials avatar ──────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-xl font-bold text-brand-700">
      {initials}
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

// ── Score pill ────────────────────────────────────────────────────────────────

function ScorePill({ score }: { score: number | null }) {
  if (score == null) return <span className="text-slate-400 text-xs">—</span>
  const pct = Math.round(score * 100)
  const color =
    pct >= 75 ? 'bg-green-100 text-green-700' :
    pct >= 50 ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>
      {pct}%
    </span>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: candidate, error } = await (supabase as any)
    .from('candidates')
    .select('*')
    .eq('id', id)
    .is('deleted_at', null)
    .single() as { data: CandidateRow | null; error: unknown }

  if (error || !candidate) notFound()

  // Fetch applications with linked jobs
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawApps } = await (supabase as any)
    .from('applications')
    .select(`*, jobs (id, title)`)
    .eq('candidate_id', id)
    .order('created_at', { ascending: false }) as { data: ApplicationWithJob[] | null }

  const apps = rawApps ?? []
  const meta = candidate.metadata ?? { skills: [], languages: [], certifications: [], years_experience: 0 }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/candidates" className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
          <ArrowLeftIcon />
          Candidatos
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate max-w-[300px]">{candidate.full_name}</span>
      </div>

      {/* ── Header ── */}
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Avatar name={candidate.full_name} />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="page-title">{candidate.full_name}</h1>
              <EmbeddingBadge status={candidate.embedding_status} />
            </div>
            <p className="page-subtitle mt-0.5">{candidate.email}</p>
          </div>
        </div>
        <Link href={`/candidates/${id}/edit`} id="btn-edit-candidate">
          <Button variant="secondary" size="md">
            <PencilIcon />
            Editar
          </Button>
        </Link>
      </div>

      {/* ── Contact & profile info ── */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Información del candidato</h2>
        </div>
        <CardBody>
          <InfoRow label="Teléfono">{candidate.phone || '—'}</InfoRow>
          <InfoRow label="Ubicación">{candidate.location || '—'}</InfoRow>
          <InfoRow label="Nacionalidad">{candidate.nationality || '—'}</InfoRow>
          <InfoRow label="LinkedIn">
            {candidate.linkedin_url ? (
              <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                {candidate.linkedin_url}
              </a>
            ) : '—'}
          </InfoRow>
          <InfoRow label="Portfolio">
            {candidate.portfolio_url ? (
              <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                {candidate.portfolio_url}
              </a>
            ) : '—'}
          </InfoRow>
          <InfoRow label="CV">
            {candidate.resume_url ? (
              <a href={candidate.resume_url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                {candidate.resume_filename ?? 'Descargar CV'}
              </a>
            ) : '—'}
          </InfoRow>
          <InfoRow label="Habilidades">
            {meta.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {meta.skills.map((s: string) => (
                  <span key={s} className="badge badge-blue">{s}</span>
                ))}
              </div>
            ) : '—'}
          </InfoRow>
          <InfoRow label="Experiencia">{meta.years_experience ? `${meta.years_experience} años` : '—'}</InfoRow>
          <InfoRow label="Idiomas">{meta.languages?.length > 0 ? meta.languages.join(', ') : '—'}</InfoRow>
          <InfoRow label="Registrado">{formatDate(candidate.created_at)}</InfoRow>
        </CardBody>
      </Card>

      {/* ── Applications history ── */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            Aplicaciones ({apps.length})
          </h2>
        </div>

        {apps.length === 0 ? (
          <CardBody>
            <p className="text-center text-sm text-slate-500 py-8">
              Este candidato aún no tiene aplicaciones.
            </p>
          </CardBody>
        ) : (
          <div className="table-wrapper rounded-b-xl rounded-t-none border-0">
            <table>
              <thead>
                <tr>
                  <th>Vacante</th>
                  <th>Etapa</th>
                  <th>Score</th>
                  <th>Fuente</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id}>
                    <td>
                      <Link href={`/jobs/${app.jobs.id}`} className="font-medium text-slate-900 hover:text-brand-600 transition-colors">
                        {app.jobs.title}
                      </Link>
                    </td>
                    <td><StageBadge stage={app.stage} /></td>
                    <td><ScorePill score={app.score} /></td>
                    <td className="text-slate-500 capitalize">{app.source}</td>
                    <td className="text-slate-500">{formatDate(app.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
