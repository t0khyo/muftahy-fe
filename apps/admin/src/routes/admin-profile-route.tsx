import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CheckCircle2,
  Loader2,
  LogOut,
} from 'lucide-react'
import {
  updateProfileRequestSchema,
  type UpdateProfileRequest,
} from '@workspace/domain/schemas/auth'
import { Blobatar } from '@workspace/ui/components/blobatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Card,
  CardContent,
} from '@workspace/ui/components/card'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Separator } from '@workspace/ui/components/separator'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useAdminAuth } from '../features/auth/hooks/use-admin-auth'
import { useAdminProfile } from '../features/profile/hooks/use-admin-profile'

export function AdminProfileRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin', 'common'])
  const navigate = useNavigate()
  const { logout } = useAdminAuth()
  const { profile, isLoading, updateProfile, isUpdating } = useAdminProfile()

  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileRequestSchema),
    values: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
    },
  })

  const handleSave = async (data: UpdateProfileRequest) => {
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      await updateProfile({
        full_name: data.full_name?.trim(),
        phone: data.phone?.trim() || null,
      })
      setSuccessMessage(t('admin:profile.updateSuccess', 'Profile updated successfully.'))
      reset(data)
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : t('common:error', 'An error occurred while updating the profile')
      )
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      navigate(`/${lang}/login`, { replace: true })
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading || !profile) {
    return (
      <div className="max-w-2xl mx-auto space-y-6" data-testid="admin-profile-loading">
        <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center gap-4">
            <Skeleton className="size-16 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayName = profile.full_name || 'System Operator'
  const email = profile.email || 'admin1@souqmuftah.com'

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Title */}
      <div className="text-start">
        <h1 className="text-2xl font-bold tracking-tight font-heading">
          {t('admin:profile.title', 'Profile')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('admin:profile.subtitle', 'Manage your administrative account information')}
        </p>
      </div>

      {/* Account Settings Card */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6 space-y-6">
          {/* Identity Header */}
          <div className="flex items-center gap-4">
            <Blobatar
              name={displayName}
              className="size-16 rounded-xl shadow-xs"
              blobatar={{ animate: 'hover' }}
            />
            <div className="space-y-1 text-start">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold font-heading text-foreground">
                  {displayName}
                </h2>
                <Badge variant="outline" className="text-xs font-medium">
                  {t('admin:adminRole', 'System Administrator')}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {email}
              </p>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Feedback Alerts */}
          {successMessage && (
            <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle>{t('common:appName', 'Muftahy')}</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>{t('common:error', 'Error')}</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
            <div className="space-y-2 text-start">
              <Label htmlFor="full_name" className="text-xs font-medium">
                {t('admin:profile.fullName', 'Full Name')}
              </Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder={displayName}
                className="h-9 text-sm"
              />
              {errors.full_name && (
                <p className="text-xs text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2 text-start">
              <Label htmlFor="email" className="text-xs font-medium">
                {t('admin:profile.email', 'Email Address')}
              </Label>
              <Input
                id="email"
                value={email}
                disabled
                className="h-9 text-sm bg-muted/50 font-mono text-muted-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                {t('admin:profile.emailHint', 'Your email cannot be changed.')}
              </p>
            </div>

            <div className="space-y-2 text-start">
              <Label htmlFor="phone" className="text-xs font-medium">
                {t('admin:profile.phone', 'Phone Number')}
              </Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder={t('admin:profile.phonePlaceholder', '+20 100 000 0000')}
                className="h-9 text-sm font-mono"
              />
              {errors.phone && (
                <p className="text-xs text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                disabled={isUpdating || !isDirty}
                size="sm"
                className="min-w-28 font-medium"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="me-2 size-4 animate-spin" />
                    {t('admin:profile.saving', 'Saving...')}
                  </>
                ) : (
                  t('admin:profile.saveChanges', 'Save changes')
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Clean Sign Out Section */}
      <Card className="border-border shadow-xs">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-start space-y-0.5">
            <h3 className="text-sm font-semibold text-foreground">
              {t('admin:profile.signOut', 'Sign out')}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t('admin:profile.signOutDesc', 'Sign out of your administrator account on this device.')}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive border-border shrink-0 font-medium"
          >
            {isLoggingOut ? (
              <Loader2 className="size-4 animate-spin me-1.5" />
            ) : (
              <LogOut className="size-4 rtl:rotate-180 me-1.5" />
            )}
            <span>{t('admin:logout', 'Logout')}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
