/**
 * app/(dashboard)/layout.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Dashboard shell: sidebar + topbar + main content area.
 * Server Component — Sidebar and TopBar are both rendered here.
 * Active-link detection is handled client-side in TopBar/Sidebar via usePathname().
 */
import { SidebarNav } from '@/components/layout/SidebarNav'
import { TopBar }     from '@/components/layout/TopBar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <SidebarNav />

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <TopBar />
        <main className="flex-1 px-8 py-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
