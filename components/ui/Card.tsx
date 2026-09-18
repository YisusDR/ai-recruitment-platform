/**
 * components/ui/Card.tsx
 * Generic card shell with optional header, body, and footer slots.
 */
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('card', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('flex items-center justify-between px-5 py-4 border-b border-slate-100', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ className, children, ...props }: CardProps) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn('flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl', className)}
      {...props}
    >
      {children}
    </div>
  )
}
