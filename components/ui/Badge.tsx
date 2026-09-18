/**
 * components/ui/Badge.tsx
 * Displays status labels with contextual colour variants.
 * Typed against domain enums — no `any` used.
 */
import { cn } from '@/lib/utils'
import type {
  CandidateStage,
  EmbeddingStatus,
  InterviewResult,
  InterviewType,
  JobStatus,
  RecruiterRole,
} from '@/lib/supabase/types'

type BadgeVariant = 'green' | 'blue' | 'amber' | 'red' | 'slate' | 'violet'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

export function Badge({ label, variant = 'slate', className }: BadgeProps) {
  return (
    <span className={cn(`badge badge-${variant}`, className)}>
      {label}
    </span>
  )
}

// ── Domain-specific badge mappers ────────────────────────────────────────────

const JOB_STATUS_MAP: Record<JobStatus, { label: string; variant: BadgeVariant }> = {
  draft:    { label: 'Borrador',  variant: 'slate' },
  open:     { label: 'Abierta',  variant: 'green' },
  paused:   { label: 'Pausada',  variant: 'amber' },
  closed:   { label: 'Cerrada',  variant: 'red' },
  archived: { label: 'Archivada', variant: 'slate' },
}

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const { label, variant } = JOB_STATUS_MAP[status]
  return <Badge label={label} variant={variant} />
}

const STAGE_MAP: Record<CandidateStage, { label: string; variant: BadgeVariant }> = {
  applied:        { label: 'Aplicado',      variant: 'blue' },
  screening:      { label: 'Screening',     variant: 'violet' },
  technical_test: { label: 'Test técnico',  variant: 'amber' },
  interview:      { label: 'Entrevista',    variant: 'blue' },
  offer:          { label: 'Oferta',        variant: 'green' },
  hired:          { label: 'Contratado',    variant: 'green' },
  rejected:       { label: 'Rechazado',     variant: 'red' },
  withdrawn:      { label: 'Retirado',      variant: 'slate' },
}

export function StageBadge({ stage }: { stage: CandidateStage }) {
  const { label, variant } = STAGE_MAP[stage]
  return <Badge label={label} variant={variant} />
}

const EMBEDDING_STATUS_MAP: Record<EmbeddingStatus, { label: string; variant: BadgeVariant }> = {
  pending:    { label: 'Pendiente',   variant: 'slate' },
  processing: { label: 'Procesando', variant: 'amber' },
  ready:      { label: 'Listo',      variant: 'green' },
  failed:     { label: 'Error',      variant: 'red' },
}

export function EmbeddingBadge({ status }: { status: EmbeddingStatus }) {
  const { label, variant } = EMBEDDING_STATUS_MAP[status]
  return <Badge label={label} variant={variant} />
}

const INTERVIEW_RESULT_MAP: Record<InterviewResult, { label: string; variant: BadgeVariant }> = {
  pending:     { label: 'Pendiente',    variant: 'slate' },
  passed:      { label: 'Aprobado',    variant: 'green' },
  failed:      { label: 'No aprobado', variant: 'red' },
  no_show:     { label: 'No asistió',  variant: 'red' },
  rescheduled: { label: 'Reprogramado', variant: 'amber' },
  cancelled:   { label: 'Cancelado',   variant: 'slate' },
}

export function InterviewResultBadge({ result }: { result: InterviewResult }) {
  const { label, variant } = INTERVIEW_RESULT_MAP[result]
  return <Badge label={label} variant={variant} />
}

const INTERVIEW_TYPE_MAP: Record<InterviewType, string> = {
  phone_screen:  'Llamada inicial',
  technical:     'Técnica',
  cultural_fit:  'Cultural fit',
  panel:         'Panel',
  final:         'Final',
  offer_call:    'Oferta',
}

export function InterviewTypeBadge({ type }: { type: InterviewType }) {
  return <Badge label={INTERVIEW_TYPE_MAP[type]} variant="blue" />
}

const ROLE_MAP: Record<RecruiterRole, { label: string; variant: BadgeVariant }> = {
  admin:       { label: 'Admin',        variant: 'violet' },
  recruiter:   { label: 'Reclutador',   variant: 'blue' },
  interviewer: { label: 'Entrevistador', variant: 'slate' },
  viewer:      { label: 'Visitante',    variant: 'slate' },
}

export function RoleBadge({ role }: { role: RecruiterRole }) {
  const { label, variant } = ROLE_MAP[role]
  return <Badge label={label} variant={variant} />
}
