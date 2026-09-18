'use client'

import { useState, useTransition } from 'react'
import { updateApplicationStageAction } from '@/lib/actions/applications'
import type { CandidateStage } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'

const STAGES: { value: CandidateStage; label: string }[] = [
  { value: 'applied',        label: 'Aplicado' },
  { value: 'screening',      label: 'Screening' },
  { value: 'technical_test', label: 'Test técnico' },
  { value: 'interview',      label: 'Entrevista' },
  { value: 'offer',          label: 'Oferta' },
  { value: 'hired',          label: 'Contratado' },
  { value: 'rejected',       label: 'Rechazado' },
  { value: 'withdrawn',      label: 'Retirado' },
]

const inputBase =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none'

interface StageSelectorProps {
  applicationId: string
  currentStage:  CandidateStage
}

export function StageSelector({ applicationId, currentStage }: StageSelectorProps) {
  const [stage, setStage] = useState(currentStage)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStage = e.target.value as CandidateStage
    setStage(newStage)
    setError(null)

    startTransition(async () => {
      const result = await updateApplicationStageAction(applicationId, newStage)
      if (result.error) {
        setError(result.error)
        setStage(currentStage) // revert
      }
    })
  }

  return (
    <div className="inline-flex flex-col gap-1">
      <select
        value={stage}
        onChange={handleChange}
        disabled={isPending}
        className={cn(inputBase, isPending && 'opacity-50 cursor-wait')}
        aria-label="Cambiar etapa"
      >
        {STAGES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  )
}
