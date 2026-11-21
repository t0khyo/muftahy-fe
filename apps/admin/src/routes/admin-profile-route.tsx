import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Check,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  LogOut,
  Mail,
  PackageCheck,
  Phone,
  Shield,
  ShieldAlert,
  ShoppingCart,
  UserCheck,
} from 'lucide-react'
import {
  updateProfileRequestSchema,
  type UpdateProfileRequest,
} from '@workspace/domain/schemas/auth'
import { formatDate } from '@workspace/domain/formatters/date'
import { Blobatar } from '@workspace/ui/components/blobatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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

  const [copiedId, setCopiedId] = React.useState(false)
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

  const handleCopyId = async () => {
    if (!profile?.id) return
    try {
      await navigator.clipboard.writeText(profile.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleSave = async (data: UpdateProfileRequest) => {
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      await updateProfile({
        full_name: data.full_name?.trim(),
        phone: data.phone?.trim() || null,
      })
      setSuccessMessage(t('admin:profile.updateSuccess', 'Operator profile updated successfully'))
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
      <div className="space-y-6" data-testid="admin-profile-loading">
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
  const allocatedDate = profile.created_at
    ? formatDate(profile.created_at, { locale: lang, dateStyle: 'medium' })
    : '2026-01-01'

  const scopes = [
    {
      title: t('admin:profile.scopeCatalog', 'Product Catalog & SKU Registry'),
      desc: t('admin:profile.scopeCatalogDesc', 'Create, edit, and publish game codes and software licenses'),
      icon: PackageCheck,
    },
    {
      title: t('admin:profile.scopeVault', 'Key Pool Vault Management'),
      desc: t('admin:profile.scopeVaultDesc', 'Import batches, inspect pool health, and manage digital keys'),
      icon: KeyRound,
    },
    {
      title: t('admin:profile.scopeOrders', 'Order Adjudication & Fulfillment'),
      desc: t('admin:profile.scopeOrdersDesc', 'Review payment receipts and manually approve transfers'),
      icon: ShoppingCart,
    },
    {
      title: t('admin:profile.scopeAudit', 'Security Trail & Audit Logging'),
      desc: t('admin:profile.scopeAuditDesc', 'Inspect privileged access logs and export compliance records'),
      icon: ShieldAlert,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-heading">
          {t('admin:profile.title', 'Operator Profile')}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('admin:profile.subtitle', 'Identity, administrative privileges, and security settings')}
        </p>
      </div>

      {/* Hero Identity Card */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative">
                <Blobatar
                  name={displayName}
                  className="size-16 sm:size-20 rounded-xl shadow-xs ring-2 ring-primary/20"
                  blobatar={{ animate: 'hover' }}
                />
                <span
                  className="absolute -bottom-1 -end-1 size-4 rounded-full bg-emerald-500 ring-2 ring-background"
                  title={t('admin:profile.active', 'Active')}
                />
              </div>

              <div className="space-y-1 text-start">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold font-heading text-foreground">
                    {displayName}
                  </h2>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-xs font-medium">
                    {t('admin:adminRole', 'System Administrator')}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Mail className="size-3.5" />
                    {email}
                  </span>
                  <span>•</span>
                  <span>
                    {t('admin:profile.memberSince', 'Seat Allocated')}: {allocatedDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Operator System ID Pill */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs w-full sm:w-auto justify-between sm:justify-start">
              <div className="text-start">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                  {t('admin:profile.operatorId', 'Operator ID')}
                </span>
                <span className="font-mono text-xs font-semibold text-foreground">
                  {profile.id}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={handleCopyId}
                aria-label={t('admin:profile.copyId', 'Copy Operator ID')}
              >
                {copiedId ? (
                  <Check className="size-3.5 text-emerald-500" />
                ) : (
                  <Copy className="size-3.5" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Two-Column Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Details & Edit Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold font-heading flex items-center gap-2">
                <UserCheck className="size-4 text-primary" />
                {t('admin:profile.identity', 'Operator Identity')}
              </CardTitle>
              <CardDescription>
                {t('admin:profile.identityDesc', 'Account details and credential parameters assigned to this seat')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <Alert className="mb-4 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <AlertTitle>{t('common:appName', 'Muftahy')}</AlertTitle>
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              {errorMessage && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>{t('common:error', 'Error')}</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

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
                    {t('admin:profile.email', 'Operator Email')}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="h-9 text-sm bg-muted/50 font-mono text-muted-foreground pe-24"
                    />
                    <Badge
                      variant="secondary"
                      className="absolute end-1.5 top-1.5 text-[10px] font-mono py-0.5 px-2"
                    >
                      {t('admin:profile.primaryIdentity', 'Primary')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-start">
                  <Label htmlFor="phone" className="text-xs font-medium">
                    {t('admin:profile.phone', 'Contact Number')}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute start-3 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+20 100 000 0000"
                      className="h-9 text-sm ps-9 font-mono"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isUpdating || !isDirty}
                    size="sm"
                    className="min-w-28"
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="me-2 size-4 animate-spin" />
                        {t('admin:profile.saving', 'Saving...')}
                      </>
                    ) : (
                      t('admin:profile.saveChanges', 'Save Changes')
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Administrative Scopes & Session Security */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Scopes Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold font-heading flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                {t('admin:profile.privilegesTitle', 'Administrative Scopes')}
              </CardTitle>
              <CardDescription>
                {t('admin:profile.privilegesDesc', 'Current capabilities granted to your security credentials')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {scopes.map((scope, idx) => {
                const Icon = scope.icon
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/20 p-2.5 transition-colors"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary mt-0.5">
                      <Icon className="size-4" />
                    </div>
                    <div className="text-start space-y-0.5 flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {scope.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {scope.desc}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Active Session & Termination Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold font-heading flex items-center gap-2">
                <LogOut className="size-4 text-destructive rtl:rotate-180" />
                {t('admin:profile.sessionTitle', 'Active Session')}
              </CardTitle>
              <CardDescription>
                {t('admin:profile.sessionDesc', 'Current authenticated session on this workstation')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border/70 bg-muted/30 p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t('admin:profile.sessionType', 'Auth Mechanism')}
                  </span>
                  <span className="font-mono font-medium text-foreground">
                    {t('admin:profile.sessionTypeVal', 'Bearer / Refresh Rotation')}
                  </span>
                </div>
                <Separator className="bg-border/60" />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    {t('admin:profile.audience', 'Token Audience')}
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5">
                    admin
                  </Badge>
                </div>
              </div>

              <div className="pt-1">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full gap-2 cursor-pointer font-medium"
                >
                  {isLoggingOut ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <LogOut className="size-4 rtl:rotate-180" />
                  )}
                  <span>{t('admin:logout', 'Logout')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

