/**
 * app/(dashboard)/candidates/[id]/edit/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Edit existing candidate.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CandidateForm } from '@/components/candidates/CandidateForm'
import type { CandidateRow } from '@/lib/supabase/types'

export const metadata = {
  title: 'Editar candidato | ATS',
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

import { mockStore } from '@/lib/mock/store'

export default async function EditCandidatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let candidate: CandidateRow | null = null

  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbCandidate } = await (supabase as any)
      .from('candidates')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single() as { data: CandidateRow | null; error: unknown }

    candidate = dbCandidate
  } catch (_err) {
    // Supabase unavailable
  }

  if (!candidate) {
    candidate = mockStore.getCandidateById(id)
  }

  if (!candidate) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-slide-up">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href={`/candidates/${id}`} className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
          <ArrowLeftIcon />
          {candidate.full_name}
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Editar</span>
      </div>

      <div>
        <h1 className="page-title">Editar candidato</h1>
        <p className="page-subtitle mt-1">Actualiza la información del candidato.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8">
        <CandidateForm candidate={candidate} />
      </div>
    </div>
  )
}
