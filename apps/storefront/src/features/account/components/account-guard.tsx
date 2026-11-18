import * as React from 'react'
import { Navigate, useLocation, useParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../../auth/hooks/use-auth'

export interface AccountGuardProps {
  children: React.ReactNode
}

export function AccountGuard({ children }: AccountGuardProps) {
  const { isAuthenticated, isInitializing } = useAuth()
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const location = useLocation()

  if (isInitializing) {
    return (
      <div
        data-testid="account-guard-loading"
        className="flex min-h-[400px] w-full items-center justify-center"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/${lang}/login?returnUrl=${returnUrl}`} replace />
  }

  return <>{children}</>
}
