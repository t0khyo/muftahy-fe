import { LoginForm } from '../features/auth/components/login-form'
import { AuthLayout } from '../features/auth/components/auth-layout'

export function LoginRoute() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
