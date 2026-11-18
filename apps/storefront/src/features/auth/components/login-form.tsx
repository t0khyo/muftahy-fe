import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '../../../lib/zod-resolver'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { loginRequestSchema, type LoginRequest } from '@workspace/domain/schemas/auth'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@workspace/ui/components/field'
import { useAuth } from '../hooks/use-auth'
import { useGoogleAuth } from '../hooks/use-google-auth'
import { getSanitizedReturnUrl } from '../lib/sanitize-return-to'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'

export type LoginFormProps = React.ComponentProps<'div'>

export function LoginForm({ className, ...props }: LoginFormProps) {
  const { t } = useTranslation('auth')
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuth()

  const [serverError, setServerError] = React.useState<string | null>(null)
  const [retrySeconds, setRetrySeconds] = React.useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const returnUrl = React.useMemo(() => getSanitizedReturnUrl(searchParams, lang), [searchParams, lang])
  const initialEmail = searchParams.get('email') || ''
  const infoMessage = searchParams.get('message')

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
          setServerError(t('errors.RATE_LIMIT_EXCEEDED', { seconds: err.retryAfter }))
        } else if (err.errorCode === 'AUTHENTICATION_FAILED') {
          setServerError(t('errors.AUTHENTICATION_FAILED'))
        } else {
          setServerError(err.message || t('errors.GENERIC_ERROR'))
        }
      } else {
        setServerError(t('errors.GENERIC_ERROR'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const { signInWithGoogle, isAvailable: isGoogleAvailable, isLoading: isGoogleLoading, isInApp } = useGoogleAuth({
    onSuccess: async (code) => {
      setServerError(null)
      try {
        await loginWithGoogle(code)
        navigate(returnUrl, { replace: true })
      } catch (err) {
        setServerError(err instanceof Error ? err.message : t('errors.GENERIC_ERROR'))
      }
    },
    onError: (err) => {
      setServerError(err.message || t('errors.GENERIC_ERROR'))
    },
  })

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold tracking-tight">{t('welcomeBack')}</CardTitle>
          <CardDescription>{t('loginWithSocial')}</CardDescription>
        </CardHeader>
        <CardContent>
          {infoMessage && (
            <Alert variant="default" className="mb-4 border-primary/20 bg-primary/5 text-primary">
              <AlertDescription>{infoMessage}</AlertDescription>
            </Alert>
          )}

          {serverError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="size-4" />
              <AlertTitle>{t('errors.GENERIC_ERROR')}</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {isInApp && (
            <Alert className="mb-4 border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-400" />
              <AlertTitle>{t('inAppBrowserWarningTitle')}</AlertTitle>
              <AlertDescription className="text-xs">{t('inAppBrowserWarning')}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full gap-2 font-medium active:scale-[0.98] transition-all hover:bg-accent/60"
                  onClick={signInWithGoogle}
                  disabled={isSubmitting || isGoogleLoading || retrySeconds !== null || !isGoogleAvailable}
                >
                  {isGoogleLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <svg className="size-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>{t('continueWithGoogle')}</span>
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t('orContinueWith')}
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="login-email">{t('email')}</FieldLabel>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder={t('emailPlaceholder')}
                  {...register('email')}
                  disabled={isSubmitting || retrySeconds !== null}
                />
                {errors.email && <FieldError>{errors.email.message}</FieldError>}
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="login-password">{t('password')}</FieldLabel>
                  <Link
                    to={`/${lang}/forgot-password`}
                    className="ms-auto text-sm text-muted-foreground underline-offset-4 hover:underline hover:text-foreground"
                    tabIndex={0}
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder={t('passwordPlaceholder')}
                  {...register('password')}
                  disabled={isSubmitting || retrySeconds !== null}
                />
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
                      <Loader2 className="size-4 animate-spin" />
                      <span>{t('signingIn')}</span>
                    </span>
                  ) : retrySeconds !== null ? (
                    <span>{t('resendCooldown', { seconds: retrySeconds })}</span>
                  ) : (
                    <span>{t('signIn')}</span>
                  )}
                </Button>
                <FieldDescription className="text-center">
                  {t('dontHaveAccount')}{' '}
                  <Link
                    to={`/${lang}/register${searchParams.toString() ? `?${searchParams.toString()}` : ''}`}
                    className="underline underline-offset-4 hover:text-primary font-medium"
                  >
                    {t('createAccount')}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        {t('byClickingContinue')}{' '}
        <Link to={`/${lang}/terms`} className="underline underline-offset-4 hover:text-foreground">
          {t('termsOfService')}
        </Link>{' '}
        {t('and')}{' '}
        <Link to={`/${lang}/privacy`} className="underline underline-offset-4 hover:text-foreground">
          {t('privacyPolicy')}
        </Link>
        .
      </FieldDescription>
    </div>
  )
}
