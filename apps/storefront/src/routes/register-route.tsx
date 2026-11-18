import { RegisterForm } from '../features/auth/components/register-form'
import { AuthLayout } from '../features/auth/components/auth-layout'

export function RegisterRoute() {
  return (
    <AuthLayout className="max-w-lg">
      <RegisterForm />
    </AuthLayout>
  )
}
