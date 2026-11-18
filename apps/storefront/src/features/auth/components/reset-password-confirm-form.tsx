import * as React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '../../../lib/zod-resolver'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { z } from 'zod'
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@workspace/ui/components/input-otp'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'

const resetConfirmSchema = z
  .object({
    code: z.string().length(6, 'Verification code must be exactly 6 digits'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type ResetConfirmInput = z.infer<typeof resetConfirmSchema>

export interface ResetPasswordConfirmFormProps {
  email: string
  onResetComplete?: () => void
}

export function ResetPasswordConfirmForm({ email, onResetComplete }: ResetPasswordConfirmFormProps) {
  const { t } = useTranslation('auth')
  const { lang = 'ar' } = useParams<{ lang: string }>()

  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [resendCooldown, setResendCooldown] = React.useState(60)

  const authService = React.useMemo(() => getAuthService('storefront'), [])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ResetConfirmInput>({
    resolver: zodResolver(resetConfirmSchema),
    defaultValues: {
      code: '',
      new_password: '',
      confirm_password: '',
    },
  })

  React.useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const onResend = async () => {
    if (resendCooldown > 0) return
    try {
      await authService.requestPasswordReset({ email })
      setResendCooldown(60)
    } catch {
      // Ignore
    }
  }

  const onSubmit = async (data: ResetConfirmInput) => {
    setServerError(null)
    setIsSubmitting(true)

    try {
      await authService.confirmPasswordReset({
        email,
        code: data.code,
        new_password: data.new_password,
      })
      setIsSuccess(true)
      onResetComplete?.()
    } catch (err) {
      if (err instanceof ApiClientError && err.errorCode === 'INVALID_CREDENTIALS') {
        setServerError(t('errors.INVALID_CREDENTIALS'))
      } else {
        setServerError(err instanceof Error ? err.message : t('errors.GENERIC_ERROR'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto border-border/80 shadow-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/10 text-success mb-2">
            <CheckCircle2 className="size-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight font-heading">{t('resetSuccess')}</CardTitle>
        </CardHeader>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button render={<Link to={`/${lang}/login`} />} className="w-full active:scale-[0.98] transition-transform">
            {t('signIn')}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto border-border/80 shadow-sm">
      <CardHeader className="text-center space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight font-heading">{t('enterOtp')}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{t('otpDescription', { email })}</CardDescription>
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
            <Field className="items-center">
              <FieldLabel htmlFor="otp-input" className="self-start">
                {t('enterOtp')}
              </FieldLabel>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <div dir="ltr" className="my-2">
                    <InputOTP
                      id="otp-input"
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                )}
              />
              {errors.code && <FieldError>{errors.code.message}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="new-password">{t('newPassword')}</FieldLabel>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={t('passwordPlaceholder')}
                  className="pe-10"
                  {...register('new_password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.new_password && (
                <FieldError>{errors.new_password.message}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel htmlFor="confirm-new-password">{t('confirmPassword')}</FieldLabel>
              <div className="relative">
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder={t('confirmPasswordPlaceholder')}
                  className="pe-10"
                  {...register('confirm_password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? t('hidePassword') : t('showPassword')}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <FieldError>{errors.confirm_password.message}</FieldError>
              )}
            </Field>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
              <span>
                {resendCooldown > 0
                  ? t('resendCooldown', { seconds: resendCooldown })
                  : ''}
              </span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs"
                onClick={onResend}
                disabled={resendCooldown > 0 || isSubmitting}
              >
                {t('resendCode')}
              </Button>
            </div>

            <Field>
              <Button
                type="submit"
                className="w-full active:scale-[0.98] transition-transform"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t('submitting')}</span>
                  </span>
                ) : (
                  <span>{t('verifyAndReset')}</span>
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
