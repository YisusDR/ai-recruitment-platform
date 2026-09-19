/**
 * app/(dashboard)/interviews/[id]/edit/page.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Edit interview result and feedback.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InterviewFeedbackForm } from '@/components/interviews/InterviewFeedbackForm'
import type { InterviewRow } from '@/lib/supabase/types'

export const metadata = {
  title: 'Editar entrevista | ATS',
}

function ArrowLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

import { mockStore } from '@/lib/mock/store'

export default async function EditInterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  let interview: InterviewRow | null = null

  try {
    const supabase = await createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dbInterview } = await (supabase as any)
      .from('interviews')
      .select('*')
      .eq('id', id)
      .single() as { data: InterviewRow | null; error: unknown }

    interview = dbInterview
  } catch (_err) {
    // Supabase unavailable
  }

  if (!interview) {
    interview = mockStore.getInterviewById(id)
  }

  if (!interview) notFound()

  return (
    <div className="mx-auto max-w-2xl space-y-8 animate-slide-up">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href={`/interviews/${id}`} className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors">
          <ArrowLeftIcon />
          Entrevista
        </Link>
        <span>/</span>
        <span className="text-slate-700 font-medium">Registrar resultado</span>
      </div>

      <div>
        <h1 className="page-title">Registrar resultado</h1>
        <p className="page-subtitle mt-1">Actualiza el resultado, valoración y notas de esta entrevista.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8">
        <InterviewFeedbackForm
          interviewId={interview.id}
          currentResult={interview.result}
          currentRating={interview.rating}
          currentNotes={interview.notes}
        />
      </div>
    </div>
  )
}
