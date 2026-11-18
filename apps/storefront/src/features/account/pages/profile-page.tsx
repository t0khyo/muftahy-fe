import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ShieldCheck, Mail, Phone, Calendar, User, CheckCircle2, AlertCircle } from 'lucide-react'
import { updateProfileRequestSchema, type UpdateProfileRequest } from '@workspace/domain/schemas/auth'
import { formatDate } from '@workspace/domain/formatters/date'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Badge } from '@workspace/ui/components/badge'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { useProfile } from '../hooks/use-profile'
import { VerifyEmailDialog } from '../../auth/components/verify-email-dialog'

export function ProfilePage() {
  const { t } = useTranslation(['account', 'auth', 'common'])
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const { profile, isLoading, isError, updateProfile, isUpdating } = useProfile()

  const [isEditing, setIsEditing] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileRequestSchema),
    values: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  })

  const onSave = async (data: UpdateProfileRequest) => {
    setServerError(null)
    setSuccessMessage(null)

    try {
      await updateProfile({
        full_name: data.full_name,
        phone: data.phone || null,
      })
      setSuccessMessage(t('profile.updateSuccess'))
      setIsEditing(false)
    } catch (err) {
      setServerError(err instanceof Error ? err.message : t('auth:errors.GENERIC_ERROR'))
    }
  }

  if (isLoading) {
    return (
      <Card className="border-border shadow-xs">
        <CardContent className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (isError || !profile) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('auth:errors.GENERIC_ERROR')}</AlertTitle>
        <AlertDescription>{t('auth:errors.NETWORK_ERROR')}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Email Verification Banner */}
      <Alert className="border-primary/20 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
          <div>
            <AlertTitle className="text-sm font-semibold">{t('auth:verifyEmailTitle')}</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              {t('auth:verifyEmailBanner')}
            </AlertDescription>
          </div>
        </div>
        <Button
          size="sm"
          className="shrink-0"
          onClick={() => setIsVerifyDialogOpen(true)}
        >
          {t('auth:verifyNow')}
        </Button>
      </Alert>

      {/* Success or Error banners */}
      {successMessage && (
        <Alert className="border-emerald-500/20 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Main Profile Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">{t('profile.title')}</CardTitle>
            <CardDescription className="text-xs mt-1">{t('profile.description')}</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              {t('profile.editProfile')}
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSave)} className="space-y-4 max-w-lg">
              <div className="space-y-1.5 text-start">
                <Label htmlFor="edit-name">{t('profile.fullName')}</Label>
                <Input
                  id="edit-name"
                  placeholder={t('auth:fullNamePlaceholder')}
                  {...register('full_name')}
                  disabled={isUpdating}
                />
                {errors.full_name && (
                  <p className="text-xs text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5 text-start">
                <Label htmlFor="edit-phone">{t('profile.phone')}</Label>
                <Input
                  id="edit-phone"
                  placeholder={t('auth:phonePlaceholder')}
                  {...register('phone')}
                  disabled={isUpdating}
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('profile.saving')}</span>
                    </span>
                  ) : (
                    <span>{t('profile.saveChanges')}</span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    reset()
                    setIsEditing(false)
                  }}
                  disabled={isUpdating}
                >
                  {t('profile.cancel')}
                </Button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('profile.fullName')}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{profile.full_name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('profile.email')}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('profile.phone')}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {profile.phone || t('profile.notProvided')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('profile.memberSince')}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {formatDate(profile.created_at, { locale: lang, dateStyle: 'medium' })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('profile.status')}</p>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                      {profile.is_active ? t('profile.active') : t('profile.inactive')}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                  <span className="text-xs font-mono">ID</span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('profile.userId')}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5 break-all">
                    {profile.id}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Verification Modal Dialog */}
      <VerifyEmailDialog
        email={profile.email}
        open={isVerifyDialogOpen}
        onOpenChange={setIsVerifyDialogOpen}
      />
    </div>
  )
}
