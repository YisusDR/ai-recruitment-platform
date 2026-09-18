/**
 * components/layout/Sidebar.tsx
 * Main navigation sidebar for the dashboard shell.
 * Server Component — no interactivity needed (active link detection via pathname).
 */
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface NavItem {
  href:  string
  label: string
  icon:  React.ReactNode
}

// ── SVG icon mini-set (inline, no external dependency) ──────────────────────

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  )
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={cn('h-5 w-5', className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z" />
    </svg>
  )
}

function LogoIcon() {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 shadow-brand">
      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 12.75 2.25 2.25 4.5-4.5m6.364-4.773A10.96 10.96 0 0 1 22 12c0 6.075-4.925 11-11 11S0 18.075 0 12 4.925 1 11 1c2.777 0 5.318 1.03 7.227 2.727" />
      </svg>
    </div>
  )
}

const NAV_ITEMS: NavItem[] = [
  { href: '/jobs',        label: 'Vacantes',    icon: <BriefcaseIcon /> },
  { href: '/candidates',  label: 'Candidatos',  icon: <UsersIcon /> },
  { href: '/interviews',  label: 'Entrevistas', icon: <CalendarIcon /> },
]

interface SidebarProps {
  activePath: string
}

export function Sidebar({ activePath }: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <LogoIcon />
        <div>
          <p className="text-sm font-bold text-slate-900 leading-none">ATS Platform</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Recruitment Hub</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Navegación
        </p>
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'nav-link',
              activePath.startsWith(href) && 'active',
            )}
          >
            {icon}
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 px-4 py-3">
        <p className="text-[11px] text-slate-400 text-center">
          AI Recruitment Platform v1.0
        </p>
      </div>
    </aside>
  )
}
