/**
 * app/(dashboard)/jobs/[id]/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Job detail page: shows full job info + list of applications.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { JobStatusBadge, StageBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { formatDate } from '@/lib/utils'
import type { JobRow, ApplicationRow, CandidateRow } from '@/lib/supabase/types'

interface ApplicationWithCandidate extends ApplicationRow {
  candidates: Pick<CandidateRow, 'id' | 'full_name' | 'email'>
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

// ── Info row helper ──────────────────────────────────────────────────────────

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="w-36 shrink-0 text-sm font-medium text-slate-500">{label}</span>
      <div className="text-sm text-slate-900">{children}</div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

import { mockStore } from '@/lib/mock/store'

import { cookies } from 'next/headers'

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const isDemo = cookieStore.has('ats_demo_user')

  let job: JobRow | null = null
  let apps: ApplicationWithCandidate[] = []

  if (!isDemo) {
    try {
      const supabase = await createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: dbJob } = await (supabase as any)
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single() as { data: JobRow | null; error: unknown }

      job = dbJob

      if (job) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: rawApps } = await (supabase as any)
          .from('applications')
          .select(`
            *,
            candidates (
              id,
              full_name,
              email
            )
          `)
          .eq('job_id', id)
          .order('created_at', { ascending: false }) as { data: ApplicationWithCandidate[] | null }

        apps = rawApps ?? []
      }
    } catch (_err) {
      // Supabase unavailable
    }
  }

  // Mock store fallback
  if (!job) {
    job = mockStore.getJobById(id)
    if (job) {
      const mockApps = mockStore.getApplicationsByJob(id)
      apps = mockApps.map(a => {
        const c = mockStore.getCandidateById(a.candidate_id)
        return {
          ...a,
          candidates: {
            id: c?.id ?? a.candidate_id,
            full_name: c?.full_name ?? 'Candidato',
            email: c?.email ?? 'candidato@email.com',
          },
        }
      })
    }
  }

  if (!job) notFound()

  const req = job.requirements ?? { skills: [], languages: [], education: '', experience_years: 0 }

  return (
    <div className="space-y-8 animate-slide-up">
      {/* ── Breadcrumb ── */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/jobs" className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
          <ArrowLeftIcon />
          Vacantes
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium truncate max-w-[300px]">{job.title}</span>
      </div>

      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">{job.title}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="page-subtitle mt-1">
            {job.department ?? 'Sin departamento'} · {job.modality} · {job.location ?? 'Sin ubicación'}
          </p>
        </div>
        <Link href={`/jobs/${id}/edit`} id="btn-edit-job">
          <Button variant="secondary" size="md">
            <PencilIcon />
            Editar
          </Button>
        </Link>
      </div>

      {/* ── Job details card ── */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Detalles de la vacante</h2>
        </div>
        <CardBody>
          <InfoRow label="Descripción">
            <p className="whitespace-pre-wrap">{job.description}</p>
          </InfoRow>
          <InfoRow label="Salario">
            {job.salary_min && job.salary_max
              ? `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()} ${job.salary_currency ?? 'EUR'}`
              : '—'}
          </InfoRow>
          <InfoRow label="Habilidades">
            {req.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {req.skills.map((s: string) => (
                  <span key={s} className="badge badge-blue">{s}</span>
                ))}
              </div>
            ) : '—'}
          </InfoRow>
          <InfoRow label="Experiencia">{req.experience_years ? `${req.experience_years} años` : '—'}</InfoRow>
          <InfoRow label="Educación">{req.education || '—'}</InfoRow>
          <InfoRow label="Idiomas">
            {req.languages?.length > 0 ? req.languages.join(', ') : '—'}
          </InfoRow>
          <InfoRow label="Publicada">{formatDate(job.published_at)}</InfoRow>
          <InfoRow label="Cierre">{formatDate(job.closes_at)}</InfoRow>
          <InfoRow label="Creada">{formatDate(job.created_at)}</InfoRow>
        </CardBody>
      </Card>

      {/* ── Applications ── */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">
            Aplicaciones ({apps.length})
          </h2>
        </div>

        {apps.length === 0 ? (
          <CardBody>
            <p className="text-center text-sm text-slate-500 py-8">
              Aún no hay candidatos aplicados a esta vacante.
            </p>
          </CardBody>
        ) : (
          <div className="table-wrapper rounded-b-xl rounded-t-none border-0">
            <table>
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Etapa</th>
                  <th>Score</th>
                  <th>Fuente</th>
                  <th>Aplicación</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => (
                  <tr key={app.id} className="group">
                    <td>
                      <Link
                        href={`/candidates/${app.candidates.id}`}
                        className="font-medium text-slate-900 hover:text-brand-600 transition-colors"
                      >
                        {app.candidates.full_name}
                      </Link>
                      <p className="text-xs text-slate-400">{app.candidates.email}</p>
                    </td>
                    <td><StageBadge stage={app.stage} /></td>
                    <td><ScorePill score={app.score} /></td>
                    <td className="text-slate-500 capitalize">{app.source}</td>
                    <td className="text-slate-500">{formatDate(app.created_at)}</td>
                    <td className="text-right">
                      <Link
                        href={`/candidates/${app.candidates.id}`}
                        className="text-xs text-brand-600 hover:underline font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Ver perfil
                      </Link>
                    </td>
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
