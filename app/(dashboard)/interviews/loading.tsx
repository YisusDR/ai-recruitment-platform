import { Card } from '@/components/ui/Card'

export default function InterviewsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-start justify-between">
        <div>
          <div className="h-8 w-36 rounded-lg bg-slate-200" />
          <div className="mt-2 h-4 w-48 rounded bg-slate-200" />
        </div>
        <div className="h-9 w-44 rounded-xl bg-slate-200" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-5">
            <div className="h-4 w-16 rounded bg-slate-200" />
            <div className="mt-2 h-8 w-10 rounded bg-slate-200" />
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="h-5 w-48 rounded bg-slate-200" />
        </div>
        <div className="p-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 flex-1 rounded bg-slate-200" />
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="h-4 w-16 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
