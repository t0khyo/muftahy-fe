import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react'
import { getAuthService } from '@workspace/api/factory'
import { ApiClientError } from '@workspace/api/adapters/http/fetch-client'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@workspace/ui/components/input-otp'

export interface ChangePasswordDialogProps {
  email: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ email, open, onOpenChange }: ChangePasswordDialogProps) {
  const { t } = useTranslation(['account', 'auth', 'common'])
  const [code, setCode] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [cooldown, setCooldown] = React.useState(0)
  const [isSendingCode, setIsSendingCode] = React.useState(false)
  const [codeSent, setCodeSent] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isSuccess, setIsSuccess] = React.useState(false)

  const authService = React.useMemo(() => getAuthService('storefront'), [])

  // Cooldown countdown
  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setCode('')
      setNewPassword('')
      setConfirmPassword('')
      setServerError(null)
      setIsSuccess(false)
    }
    onOpenChange(nextOpen)
  }

  const handleSendCode = async () => {
    if (cooldown > 0 || isSendingCode) return
    setServerError(null)
    setIsSendingCode(true)

    try {
      await authService.requestPasswordReset({ email })
      setCodeSent(true)
      setCooldown(60)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('auth:errors.GENERIC_ERROR'))
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (code.length !== 6) {
      setServerError(t('auth:errors.otpRequired'))
      return
    }

    if (newPassword.length < 8) {
      setServerError(t('auth:errors.passwordTooShort'))
      return
    }

    if (newPassword !== confirmPassword) {
      setServerError(t('auth:errors.passwordMismatch'))
      return
    }

    setIsSubmitting(true)

    try {
      await authService.confirmPasswordReset({
        email,
        code,
        new_password: newPassword,
      })
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof ApiClientError && err.errorCode === 'INVALID_CREDENTIALS') {
        setServerError(t('auth:errors.INVALID_CREDENTIALS'))
      } else {
        setServerError(err instanceof Error ? err.message : t('auth:errors.GENERIC_ERROR'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <KeyRound className="size-4" />
            </div>
            <DialogTitle className="text-lg font-bold">
              {t('profile.changePasswordTitle')}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t('profile.changePasswordDesc')}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {t('profile.passwordUpdated')}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              {t('profile.cancel')}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <AlertDescription className="text-xs">{serverError}</AlertDescription>
              </Alert>
            )}

            {/* Step 1: Send OTP code */}
            <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">
                  {t('profile.enterOtp')}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleSendCode}
                  disabled={cooldown > 0 || isSendingCode}
                >
                  {isSendingCode ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>{t('auth:sending')}</span>
                    </span>
                  ) : cooldown > 0 ? (
                    <span>{t('auth:resendCooldown', { seconds: cooldown })}</span>
                  ) : (
                    <span>{codeSent ? t('auth:resendCode') : t('profile.sendCode')}</span>
                  )}
                </Button>
              </div>

              <div dir="ltr" className="flex justify-center pt-1">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
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
            </div>

            {/* Step 2: New Password Inputs */}
            <div className="space-y-3">
              <div className="space-y-1.5 text-start">
                <Label htmlFor="change-new-pass" className="text-xs font-medium">
                  {t('profile.newPassword')}
                </Label>
                <Input
                  id="change-new-pass"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('profile.newPasswordPlaceholder')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5 text-start">
                <Label htmlFor="change-confirm-pass" className="text-xs font-medium">
                  {t('profile.confirmPassword')}
                </Label>
                <Input
                  id="change-confirm-pass"
                  type="password"
                  autoComplete="new-password"
                  placeholder={t('profile.confirmPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {t('profile.cancel')}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={code.length !== 6 || newPassword.length < 8 || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>{t('profile.saving')}</span>
                  </span>
                ) : (
                  <span>{t('profile.submitPasswordChange')}</span>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
