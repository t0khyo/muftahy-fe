import * as React from 'react'
import { ForgotPasswordForm } from '../features/auth/components/forgot-password-form'
import { ResetPasswordConfirmForm } from '../features/auth/components/reset-password-confirm-form'
import { AuthLayout } from '../features/auth/components/auth-layout'

export function ForgotPasswordRoute() {
  const [email, setEmail] = React.useState<string | null>(null)

  return (
    <AuthLayout>
      {email ? (
        <ResetPasswordConfirmForm email={email} />
      ) : (
        <ForgotPasswordForm onCodeSent={(sentEmail) => setEmail(sentEmail)} />
      )}
    </AuthLayout>
  )
}
