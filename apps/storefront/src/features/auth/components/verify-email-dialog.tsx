import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { getAuthService } from '@workspace/api/factory'
import { Button } from '@workspace/ui/components/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@workspace/ui/components/input-otp'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'

export interface VerifyEmailDialogProps {
  email: string
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function VerifyEmailDialog({ email, trigger, open, onOpenChange, onSuccess }: VerifyEmailDialogProps) {
  const { t } = useTranslation('auth')
  const [code, setCode] = React.useState('')
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  const authService = React.useMemo(() => getAuthService('storefront'), [])

  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleSendCode = async () => {
    if (cooldown > 0) return
    try {
      await authService.requestOtp({ email, purpose: 'verification' })
      setCooldown(60)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('errors.GENERIC_ERROR'))
    }
  }

  const handleVerify = async () => {
    if (code.length !== 6) return
    setServerError(null)
    setIsSubmitting(true)

    try {
      await authService.verifyOtp({ email, code, purpose: 'verification' })
      setIsSuccess(true)
      onSuccess?.()
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle>{t('verifyEmailTitle')}</DialogTitle>
          <DialogDescription>{t('verifyEmailDescription')}</DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="text-sm font-medium">{t('emailVerified')}</p>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col items-center space-y-2">
              <div dir="ltr">
                <InputOTP maxLength={6} value={code} onChange={setCode} disabled={isSubmitting}>
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

              <div className="flex items-center justify-between w-full text-xs text-muted-foreground pt-2">
                <span>{cooldown > 0 ? t('resendCooldown', { seconds: cooldown }) : ''}</span>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-xs"
                  onClick={handleSendCode}
                  disabled={cooldown > 0}
                >
                  {t('resendCode')}
                </Button>
              </div>
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={handleVerify}
              disabled={code.length !== 6 || isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('submitting')}</span>
                </span>
              ) : (
                <span>{t('verifyNow')}</span>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
