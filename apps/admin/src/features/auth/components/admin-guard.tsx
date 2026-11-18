import * as React from 'react'
import { Navigate, useLocation, useParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useAdminAuth } from '../hooks/use-admin-auth'

export interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, isInitializing, role } = useAdminAuth()
  const { lang = 'en' } = useParams<{ lang: string }>()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div
        data-testid="admin-guard-loading"
        className="flex min-h-[400px] w-full items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Loading operator session...</span>
      </div>
    )
  }

  if (!isAuthenticated || role !== 'admin') {
    const returnUrl = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/${lang}/login?returnUrl=${returnUrl}`} replace />
  }

  return <>{children}</>
}
