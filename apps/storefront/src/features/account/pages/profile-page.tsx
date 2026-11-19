import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2,
  Mail,
  Phone,
  User,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  IdCard,
} from 'lucide-react'
import { updateProfileRequestSchema, type UpdateProfileRequest } from '@workspace/domain/schemas/auth'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useProfile } from '../hooks/use-profile'
import { ProfileHero } from '../components/profile-hero'
import { ProfileSecurityCard } from '../components/profile-security-card'
import { ProfileShortcutsHub } from '../components/profile-shortcuts-hub'

export function ProfilePage() {
  const { t } = useTranslation(['account', 'auth', 'common'])
  const { profile, isLoading, isError, updateProfile, isUpdating } = useProfile()

  const [isEditing, setIsEditing] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState(false)

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

  const handleCopyId = async () => {
    if (!profile?.id) return
    try {
      await navigator.clipboard.writeText(profile.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      // Fallback if clipboard API is restricted
    }
  }

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
      <div className="space-y-6" data-testid="profile-loading-skeleton">
        {/* Hero Skeleton */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Skeleton className="size-16 sm:size-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-9 w-28 rounded-lg hidden sm:block" />
          </div>
        </div>

        {/* Bento Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-60 mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-5">
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-4">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-52 mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
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
      {/* Notifications */}
      {successMessage && (
        <Alert className="border-success/30 bg-success/10 text-success dark:text-success">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription className="text-xs font-medium">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{serverError}</AlertDescription>
        </Alert>
      )}

      {/* 1. Hero Identity Card */}
      <ProfileHero
        profile={profile}
        isEditing={isEditing}
        onToggleEdit={() => {
          if (isEditing) {
            reset()
          }
          setIsEditing(!isEditing)
        }}
      />

      {/* 2. Bento Responsive Section (Personal Info + Security) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Personal Details (View or Edit Form) */}
        <div className="lg:col-span-7">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                  <User className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    {t('profile.personalInfo')}
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    {t('profile.personalInfoDesc')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                  <div className="space-y-1.5 text-start">
                    <Label htmlFor="edit-name" className="text-xs font-semibold">
                      {t('profile.fullName')}
                    </Label>
                    <Input
                      id="edit-name"
                      placeholder={t('auth:fullNamePlaceholder')}
                      {...register('full_name')}
                      disabled={isUpdating}
                      aria-invalid={Boolean(errors.full_name)}
                    />
                    {errors.full_name && (
                      <p role="alert" className="text-xs text-destructive">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5 text-start">
                    <Label htmlFor="edit-phone" className="text-xs font-semibold">
                      {t('profile.phone')}
                    </Label>
                    <Input
                      id="edit-phone"
                      placeholder={t('auth:phonePlaceholder')}
                      {...register('phone')}
                      disabled={isUpdating}
                      aria-invalid={Boolean(errors.phone)}
                    />
                    {errors.phone && (
                      <p role="alert" className="text-xs text-destructive">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* Readonly Identity Reference */}
                  <div className="space-y-1.5 text-start pt-1">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      {t('profile.email')}
                    </Label>
                    <Input
                      value={profile.email}
                      disabled
                      className="bg-muted/50 cursor-not-allowed opacity-80"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-border/60">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isUpdating}
                      className="gap-2 text-xs font-semibold"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>{t('profile.saving')}</span>
                        </>
                      ) : (
                        <span>{t('profile.saveChanges')}</span>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        reset()
                        setIsEditing(false)
                      }}
                      disabled={isUpdating}
                      className="text-xs"
                    >
                      {t('profile.cancel')}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  {/* Full Name */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-card text-muted-foreground shrink-0 border border-border/50">
                        <User className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">
                          {t('profile.fullName')}
                        </p>
                        <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                          {profile.full_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-card text-muted-foreground shrink-0 border border-border/50">
                        <Mail className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">
                          {t('profile.email')}
                        </p>
                        <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-card text-muted-foreground shrink-0 border border-border/50">
                        <Phone className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">
                          {t('profile.phone')}
                        </p>
                        <p className="text-xs font-semibold text-foreground truncate mt-0.5">
                          {profile.phone || t('profile.notProvided')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User ID (Copyable) */}
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-card text-muted-foreground shrink-0 border border-border/50">
                        <IdCard className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-muted-foreground">
                          {t('profile.userId')}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground truncate mt-0.5 max-w-[220px] sm:max-w-[320px]">
                          {profile.id}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0"
                      onClick={handleCopyId}
                      aria-label={t('profile.copyId')}
                    >
                      {copiedId ? (
                        <>
                          <Check className="size-3.5 text-success" />
                          <span className="text-[11px] text-success font-medium">
                            {t('profile.copied')}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          <span className="text-[11px] hidden sm:inline">
                            {t('profile.copyId')}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Security & Authentication */}
        <div className="lg:col-span-5">
          <ProfileSecurityCard email={profile.email} />
        </div>
      </div>

      {/* 3. Account Shortcuts Hub */}
      <ProfileShortcutsHub />
    </div>
  )
}
