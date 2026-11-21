import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ShieldCheck, Mail, KeyRound, Lock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { VerifyEmailDialog } from '../../auth/components/verify-email-dialog'
import { ChangePasswordDialog } from './change-password-dialog'

export interface ProfileSecurityCardProps {
  email: string
}

export function ProfileSecurityCard({ email }: ProfileSecurityCardProps) {
  const { t } = useTranslation(['account', 'auth'])
  const [isVerifyOpen, setIsVerifyOpen] = React.useState(false)
  const [isChangePassOpen, setIsChangePassOpen] = React.useState(false)
  const [isEmailVerified, setIsEmailVerified] = React.useState(false)

  return (
    <>
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
              <Lock className="size-4" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                {t('profile.security')}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {t('profile.securityDesc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Email Verification Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/30">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-card text-muted-foreground shrink-0 border border-border/50">
                <Mail className="size-4" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-foreground truncate">{email}</p>
                  {isEmailVerified ? (
                    <Badge variant="outline" className="border-success/30 bg-success/10 text-success text-[10px] gap-1 py-0">
                      <CheckCircle2 className="size-2.5" />
                      <span>{t('profile.emailVerified')}</span>
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning text-[10px] py-0">
                      {t('profile.emailUnverified')}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {isEmailVerified ? t('auth:emailVerified') : t('auth:verifyEmailBanner')}
                </p>
              </div>
            </div>

            {!isEmailVerified && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 h-8 text-xs font-medium w-full sm:w-auto"
                onClick={() => setIsVerifyOpen(true)}
              >
                <ShieldCheck className="size-3.5" />
                <span>{t('profile.verifyEmail')}</span>
              </Button>
            )}
          </div>

          {/* Password Security Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/70 bg-muted/30">
            <div className="flex items-start gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-card text-muted-foreground shrink-0 border border-border/50">
                <KeyRound className="size-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <p className="text-xs font-semibold text-foreground">
                  {t('profile.changePassword')}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {t('profile.passwordCardDesc')}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 h-8 text-xs font-medium w-full sm:w-auto"
              onClick={() => setIsChangePassOpen(true)}
            >
              <span>{t('profile.changePassword')}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Verification & Change Password Dialogs */}
      <VerifyEmailDialog
        email={email}
        open={isVerifyOpen}
        onOpenChange={setIsVerifyOpen}
        onSuccess={() => setIsEmailVerified(true)}
      />

      <ChangePasswordDialog
        email={email}
        open={isChangePassOpen}
        onOpenChange={setIsChangePassOpen}
      />
    </>
  )
}

