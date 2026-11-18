import { Navigate, useParams } from 'react-router'
import { AdminLoginForm } from '../features/auth/components/admin-login-form'
import { AdminAuthLayout } from '../features/auth/components/admin-auth-layout'
import { useAdminAuth } from '../features/auth/hooks/use-admin-auth'

export function AdminLoginRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { isAuthenticated, role } = useAdminAuth()

  if (isAuthenticated && role === 'admin') {
    return <Navigate to={`/${lang}`} replace />
  }

  return (
    <AdminAuthLayout>
      <AdminLoginForm />
    </AdminAuthLayout>
  )
}
