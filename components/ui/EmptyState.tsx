/**
 * components/ui/EmptyState.tsx
 * Displayed when a list/table has no results.
 */
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?:        React.ReactNode
  title:        string
  description?: string
  action?:      React.ReactNode
  className?:   string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          {icon}
        </div>
      )}
      <div>
        <p className="text-base font-semibold text-slate-800">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
