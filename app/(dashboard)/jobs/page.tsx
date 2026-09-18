/**
 * app/(dashboard)/jobs/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * /jobs — Vacantes panel
 * Server Component: fetches jobs from Supabase, renders stats + table.
 */
import Link from 'next/link'
import { createClient }     from '@/lib/supabase/server'
import { JobStatusBadge }   from '@/components/ui/Badge'
import { Button }           from '@/components/ui/Button'
import { Card, CardBody }   from '@/components/ui/Card'
import { EmptyState }       from '@/components/ui/EmptyState'
import { formatDate, truncate } from '@/lib/utils'
import type { JobRow, JobStatus } from '@/lib/supabase/types'

// ── Stat card data derived from jobs list ───────────────────────────────────

interface StatItem {
  label:  string
  value:  number
  color:  string
}

function buildStats(jobs: JobRow[]): StatItem[] {
  const count = (status: JobStatus) => jobs.filter(j => j.status === status).length
  return [
    { label: 'Abiertas',   value: count('open'),   color: 'text-green-600' },
    { label: 'Pausadas',   value: count('paused'),  color: 'text-amber-500' },
    { label: 'Borradores', value: count('draft'),   color: 'text-slate-500' },
    { label: 'Total',      value: jobs.length,      color: 'text-brand-600' },
  ]
}

// ── Icons ───────────────────────────────────────────────────────────────────

function BriefcaseIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
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

// ── Page ────────────────────────────────────────────────────────────────────

export default async function JobsPage() {
  const supabase = await createClient()

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false })

  const jobList: JobRow[] = jobs ?? []
  const stats = buildStats(jobList)

  return (
    <div className="space-y-8 animate-slide-up">

      {/* ── Page header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Vacantes</h1>
          <p className="page-subtitle">
            {jobList.length > 0
              ? `${jobList.length} posiciones registradas`
              : 'Sin vacantes aún'}
          </p>
        </div>
        <Link href="/jobs/new" id="btn-create-job">
          <Button variant="primary" size="md">
            <PlusIcon />
            Nueva vacante
          </Button>
        </Link>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(({ label, value, color }) => (
          <Card key={label} className="p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
          </Card>
        ))}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Error al cargar vacantes: {error.message}
        </div>
      )}

      {/* ── Jobs table ── */}
      <Card>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Todas las vacantes</h2>
        </div>

        {jobList.length === 0 ? (
          <CardBody>
            <EmptyState
              icon={<BriefcaseIcon />}
              title="Sin vacantes registradas"
              description="Crea tu primera vacante para comenzar a recibir candidatos."
              action={
                <Link href="/jobs/new">
                  <Button variant="primary" size="sm">
                    <PlusIcon />
                    Crear vacante
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
                  <th>Título</th>
                  <th>Departamento</th>
                  <th>Modalidad</th>
                  <th>Estado</th>
                  <th>Publicada</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {jobList.map((job) => (
                  <tr key={job.id} className="group">
                    <td>
                      <Link
                        href={`/jobs/${job.id}`}
                        id={`job-link-${job.id}`}
                        className="font-medium text-slate-900 hover:text-brand-600 transition-colors"
                      >
                        {truncate(job.title, 50)}
                      </Link>
                      {job.location && (
                        <p className="text-xs text-slate-400 mt-0.5">{job.location}</p>
                      )}
                    </td>
                    <td className="text-slate-500">{job.department ?? '—'}</td>
                    <td>
                      <span className="capitalize text-slate-600">{job.modality}</span>
                    </td>
                    <td>
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="text-slate-500 whitespace-nowrap">
                      {formatDate(job.published_at ?? job.created_at)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/jobs/${job.id}`}
                          id={`job-view-${job.id}`}
                          className="text-xs text-brand-600 hover:underline font-medium"
                        >
                          Ver
                        </Link>
                        <Link
                          href={`/jobs/${job.id}/edit`}
                          id={`job-edit-${job.id}`}
                          className="text-xs text-slate-500 hover:underline"
                        >
                          Editar
                        </Link>
                      </div>
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
