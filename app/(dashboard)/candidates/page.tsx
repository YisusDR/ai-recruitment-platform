/**
 * app/(dashboard)/candidates/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * /candidates — Applicant list
 * Server Component: fetches candidates with embedding_status, renders table
 * with stage badge, score pill, and embedding pipeline state.
 */
import Link from 'next/link'
import { createClient }     from '@/lib/supabase/server'
import { StageBadge, EmbeddingBadge } from '@/components/ui/Badge'
import { Button }           from '@/components/ui/Button'
import { Card, CardBody }   from '@/components/ui/Card'
import { EmptyState }       from '@/components/ui/EmptyState'
import { formatDate, scoreToPercent, truncate } from '@/lib/utils'
import type { CandidateRow, ApplicationRow, EmbeddingStatus } from '@/lib/supabase/types'

// ── Joined type for display ──────────────────────────────────────────────────

interface CandidateWithApplication extends CandidateRow {
  applications: Pick<ApplicationRow, 'stage' | 'score' | 'job_id'>[]
}

// ── Icons ───────────────────────────────────────────────────────────────────

function UsersIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
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

// ── Stat helpers ─────────────────────────────────────────────────────────────

function buildEmbeddingStats(candidates: CandidateRow[]) {
  const byStatus = (s: EmbeddingStatus) =>
    candidates.filter(c => c.embedding_status === s).length
  return {
    total:      candidates.length,
    ready:      byStatus('ready'),
    pending:    byStatus('pending') + byStatus('processing'),
    failed:     byStatus('failed'),
  }
}

// ── Score pill ───────────────────────────────────────────────────────────────

function ScorePill({ score }: { score: number | null | undefined }) {
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

// ── Initials avatar ──────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
      {initials}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function CandidatesPage() {
  const supabase = await createClient()

  // Fetch candidates + their latest application stage/score
  const { data: rawCandidates, error } = await supabase
    .from('candidates')
    .select(`
      *,
      applications (
        stage,
        score,
        job_id
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const candidates = (rawCandidates ?? []) as CandidateWithApplication[]
  const stats = buildEmbeddingStats(candidates)

  return (
    <div className="space-y-8 animate-slide-up">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Candidatos</h1>
          <p className="page-subtitle">
            {candidates.length > 0
              ? `${candidates.length} candidatos registrados · ${stats.ready} con embedding listo`
              : 'Sin candidatos aún'}
          </p>
        </div>
        <Link href="/candidates/new" id="btn-create-candidate">
          <Button variant="primary" size="md">
            <PlusIcon />
            Añadir candidato
          </Button>
        </Link>
      </div>

      {/* ── Embedding pipeline stats ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Total',      value: stats.total,   color: 'text-brand-600' },
          { label: 'CV listos',  value: stats.ready,   color: 'text-green-600' },
          { label: 'Pendientes', value: stats.pending,  color: 'text-amber-500' },
          { label: 'Con error',  value: stats.failed,  color: 'text-red-500' },
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
          Error al cargar candidatos: {error.message}
        </div>
      )}

      {/* ── Candidates table ── */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Todos los candidatos</h2>
        </div>

        {candidates.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={<UsersIcon />}
              title="Sin candidatos registrados"
              description="Añade candidatos manualmente o espera a que n8n ingiera los CVs automáticamente."
              action={
                <Link href="/candidates/new">
                  <Button variant="primary" size="sm">
                    <PlusIcon />
                    Añadir candidato
                  </Button>
                </Link>
              }
            />
          </CardBody>
        ) : (
          <div className="table-wrapper rounded-b-xl rounded-t-none border-0">
            <table>
              <thead>
                <tr>
                  <th>Candidato</th>
                  <th>Ubicación</th>
                  <th>Etapa</th>
                  <th>Score</th>
                  <th>Embedding</th>
                  <th>Registrado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => {
                  const latestApp = candidate.applications[0]
                  return (
                    <tr key={candidate.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={candidate.full_name} />
                          <div>
                            <Link
                              href={`/candidates/${candidate.id}`}
                              id={`candidate-link-${candidate.id}`}
                              className="font-medium text-slate-900 hover:text-brand-600 transition-colors"
                            >
                              {truncate(candidate.full_name, 40)}
                            </Link>
                            <p className="text-xs text-slate-400">{candidate.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-500">{candidate.location ?? '—'}</td>
                      <td>
                        {latestApp ? (
                          <StageBadge stage={latestApp.stage} />
                        ) : (
                          <span className="text-slate-400 text-xs">Sin aplicación</span>
                        )}
                      </td>
                      <td>
                        <ScorePill score={latestApp?.score} />
                      </td>
                      <td>
                        <EmbeddingBadge status={candidate.embedding_status} />
                      </td>
                      <td className="text-slate-500 whitespace-nowrap">
                        {formatDate(candidate.created_at)}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/candidates/${candidate.id}`}
                            id={`candidate-view-${candidate.id}`}
                            className="text-xs text-brand-600 hover:underline font-medium"
                          >
                            Ver
                          </Link>
                          <Link
                            href={`/candidates/${candidate.id}/edit`}
                            id={`candidate-edit-${candidate.id}`}
                            className="text-xs text-slate-500 hover:underline"
                          >
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
