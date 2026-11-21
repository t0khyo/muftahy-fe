import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { loginRequestSchema, type LoginRequest } from '@workspace/domain/schemas/auth'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field'
import { useAdminAuth } from '../hooks/use-admin-auth'
import { getSanitizedReturnUrl } from '../lib/sanitize-return-to'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import { BrandLogoMark } from '../../../components/brand-logo'

export type AdminLoginFormProps = React.ComponentProps<'div'>

export function AdminLoginForm({ className, ...props }: AdminLoginFormProps) {
  const { t } = useTranslation(['admin', 'auth'])
  const { lang = 'en' } = useParams<{ lang: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAdminAuth()

  const [showPassword, setShowPassword] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [retrySeconds, setRetrySeconds] = React.useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const returnUrl = React.useMemo(() => getSanitizedReturnUrl(searchParams, lang), [searchParams, lang])
  const initialEmail = searchParams.get('email') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: initialEmail,
      password: '',
    },
  })

  // Rate-limit countdown timer
  React.useEffect(() => {
    if (retrySeconds === null || retrySeconds <= 0) return
    const timer = setInterval(() => {
      setRetrySeconds((prev) => (prev && prev > 1 ? prev - 1 : null))
    }, 1000)
    return () => clearInterval(timer)
  }, [retrySeconds])

  const onSubmit = async (data: LoginRequest) => {
    if (retrySeconds !== null) return
    setServerError(null)
    setIsSubmitting(true)

    try {
      await login(data)
      navigate(returnUrl, { replace: true })
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.status === 429 && err.retryAfter) {
          setRetrySeconds(err.retryAfter)
          setServerError(t('auth:errors.RATE_LIMIT_EXCEEDED', { seconds: err.retryAfter }))
        } else if (err.errorCode === 'AUTHENTICATION_FAILED') {
          setServerError(t('auth:errors.AUTHENTICATION_FAILED'))
        } else {
          setServerError(err.message || t('auth:errors.GENERIC_ERROR'))
        }
      } else if (err instanceof Error) {
        setServerError(err.message)
      } else {
        setServerError(t('auth:errors.GENERIC_ERROR'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-border shadow-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-1 flex items-center justify-center">
            <BrandLogoMark className="h-10 w-auto" idPrefix="admin-login-logo" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">
            {t('admin:signInTitle', 'Administrator Access')}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t('admin:signInSubtitle', 'Enter your operator credentials to access the management portal')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('auth:errors.GENERIC_ERROR')}</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="admin-email">{t('auth:email')}</FieldLabel>
                <Input
                  id="admin-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('auth:emailPlaceholder')}
                  {...register('email')}
                  disabled={isSubmitting || retrySeconds !== null}
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>

              <Field>
                <FieldLabel htmlFor="admin-password">{t('auth:password')}</FieldLabel>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder={t('auth:passwordPlaceholder')}
                    className="pe-10"
                    {...register('password')}
                    disabled={isSubmitting || retrySeconds !== null}
                  />
                  <button
                    type="button"
                    className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? t('auth:hidePassword') : t('auth:showPassword')}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <FieldError>{errors.password.message}</FieldError>}
              </Field>

              <Field>
                <Button
                  type="submit"
                  className="w-full active:scale-[0.98] transition-transform"
                  disabled={isSubmitting || retrySeconds !== null}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('auth:signingIn')}</span>
                    </span>
                  ) : retrySeconds !== null ? (
                    <span>{t('auth:resendCooldown', { seconds: retrySeconds })}</span>
                  ) : (
                    <span>{t('auth:signIn')}</span>
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
