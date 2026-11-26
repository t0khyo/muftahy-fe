import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, LogOut } from 'lucide-react'
import {
  adminProfileUpdateSchema,
  normalizeAdminDisplayName,
  type AdminProfileUpdate,
} from '@workspace/domain/schemas/admin-profile'
import { Blobatar } from '@workspace/ui/components/blobatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldGroup, Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { Card, CardContent } from '@workspace/ui/components/card'
import { Separator } from '@workspace/ui/components/separator'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { FormErrorAlert } from '../components/feedback/form-error-alert'
import { useAdminAuth } from '../features/auth/hooks/use-admin-auth'
import { useAdminProfile } from '../features/profile/hooks/use-admin-profile'
import { AdminPageHeader } from '../components/admin-page-header'

export function AdminProfileRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin', 'common'])
  const navigate = useNavigate()
  const { logout } = useAdminAuth()
  const { profile, isLoading, updateProfile, isUpdating, updateError, resetUpdateError } =
    useAdminProfile({ errorMode: 'inline' })

  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<AdminProfileUpdate>({
    resolver: zodResolver(adminProfileUpdateSchema),
    values: {
      display_name: profile?.display_name || '',
    },
  })

  const handleSave = async (data: AdminProfileUpdate) => {
    resetUpdateError()
    const normalizedName = normalizeAdminDisplayName(data.display_name)
    try {
      const updated = await updateProfile({
        display_name: normalizedName,
      })
      reset({ display_name: updated.display_name })
    } catch {
      // Inline 4xx errors render via FormErrorAlert; transient failures toast via MutationCache.
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
      <div className="max-w-3xl mx-auto space-y-6" data-testid="admin-profile-loading">
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

  const displayName = profile.display_name || 'System Operator'
  const email = profile.email

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Title */}
      <AdminPageHeader
        title={t('admin:profile.title', 'Profile')}
        description={t('admin:profile.subtitle', 'Manage your administrative account information')}
      />

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
                  {profile.role === 'admin'
                    ? t('admin:adminRole', 'System Administrator')
                    : profile.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {email}
              </p>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Inline 4xx Validation Feedback */}
          <FormErrorAlert error={updateError} />

          {/* Form */}
          <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
            <FieldGroup className="gap-4">
              <Field data-invalid={!!errors.display_name} className="space-y-2 text-start">
                <FieldLabel htmlFor="display_name" className="text-xs font-medium">
                  {t('admin:profile.displayName', 'Display Name')}
                </FieldLabel>
                <Input
                  id="display_name"
                  {...register('display_name')}
                  placeholder={displayName}
                  className="h-9 text-sm"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t(
                    'admin:profile.displayNameHint',
                    'Shown across the admin console and audit logs (2-255 characters).',
                  )}
                </p>
                {errors.display_name && (
                  <FieldError>{errors.display_name.message}</FieldError>
                )}
              </Field>

              <Field className="space-y-2 text-start">
                <FieldLabel htmlFor="email" className="text-xs font-medium">
                  {t('admin:profile.email', 'Email Address')}
                </FieldLabel>
                <Input
                  id="email"
                  value={email}
                  disabled
                  className="h-9 text-sm bg-muted/50 font-mono text-muted-foreground"
                />
                <p className="text-[11px] text-muted-foreground">
                  {t('admin:profile.emailHint', 'Your email cannot be changed.')}
                </p>
              </Field>
            </FieldGroup>

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
