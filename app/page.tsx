/**
 * app/page.tsx — Root redirect
 * Unauthenticated users land here → middleware redirects to /login.
 * Authenticated users → see the dashboard.
 */
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/jobs')
}
