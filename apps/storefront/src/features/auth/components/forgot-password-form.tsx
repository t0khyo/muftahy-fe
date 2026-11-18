import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '../../../lib/zod-resolver'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { Loader2, AlertCircle } from 'lucide-react'
import { passwordResetRequestSchema, type PasswordResetRequest } from '@workspace/domain/schemas/auth'
import { getAuthService } from '@workspace/api/factory'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field'

export interface ForgotPasswordFormProps {
  onCodeSent: (email: string) => void
}

export function ForgotPasswordForm({ onCodeSent }: ForgotPasswordFormProps) {
  const { t } = useTranslation('auth')
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const authService = React.useMemo(() => getAuthService('storefront'), [])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequest>({
    resolver: zodResolver(passwordResetRequestSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: PasswordResetRequest) => {
    setServerError(null)
    setIsSubmitting(true)

    try {
      await authService.requestPasswordReset(data)
      onCodeSent(data.email)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('errors.GENERIC_ERROR'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-border/80 shadow-sm">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight font-heading">
          {t('forgotPasswordTitle')}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {t('forgotPasswordDescription')}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="size-4" />
            <AlertTitle>{t('errors.GENERIC_ERROR')}</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="forgot-email">{t('email')}</FieldLabel>
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder={t('emailPlaceholder')}
                {...register('email')}
                disabled={isSubmitting}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <Button
                type="submit"
                className="w-full active:scale-[0.98] transition-transform"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t('sending')}</span>
                  </span>
                ) : (
                  <span>{t('sendResetCode')}</span>
                )}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-border pt-4">
        <Link
          to={`/${lang}/login`}
          className="text-xs text-primary underline-offset-4 hover:underline font-medium transition-colors"
        >
          {t('signIn')}
        </Link>
      </CardFooter>
    </Card>
  )
}
