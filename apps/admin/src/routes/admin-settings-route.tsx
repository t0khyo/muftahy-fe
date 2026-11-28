import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save } from 'lucide-react'
import { formatDate } from '@workspace/domain/formatters/date'
import {
  adminSettingsFormSchema,
  toAdminSettingsUpdatePayload,
  type AdminSettingsFormValues,
  type AdminSettingsResponse,
} from '@workspace/domain/schemas/settings'
import { Button } from '@workspace/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { AdminPageHeader } from '../components/admin-page-header'
import { AdminQueryError } from '../components/feedback/admin-query-error'
import { FormErrorAlert } from '../components/feedback/form-error-alert'
import { useAdminAuth } from '../features/auth/hooks/use-admin-auth'
import { useAdminSettings } from '../features/settings/hooks/use-admin-settings'

function toFormValues(settings?: AdminSettingsResponse): AdminSettingsFormValues {
  return {
    whatsapp_number: settings?.whatsapp_number ?? '',
    support_email: settings?.support_email ?? '',
    social_handle: settings?.social_handle ?? '',
    social_links: {
      instagram: settings?.social_links?.instagram ?? '',
      facebook: settings?.social_links?.facebook ?? '',
      x: settings?.social_links?.x ?? '',
      tiktok: settings?.social_links?.tiktok ?? '',
      youtube: settings?.social_links?.youtube ?? '',
      discord: settings?.social_links?.discord ?? '',
    },
  }
}

export function AdminSettingsRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const currentLang = lang === 'ar' ? 'ar' : 'en'
  const { t } = useTranslation(['admin', 'common'])
  const { role } = useAdminAuth()
  const {
    settings,
    isLoading,
    isError,
    error,
    refetch,
    updateSettings,
    isUpdating,
    updateError,
    resetUpdateError,
  } = useAdminSettings({ errorMode: 'inline' })

  const canEdit = !role || role === 'admin' || role === 'super_admin'

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<AdminSettingsFormValues>({
    resolver: zodResolver(adminSettingsFormSchema),
    values: toFormValues(settings),
  })

  const onSubmit = async (data: AdminSettingsFormValues) => {
    resetUpdateError()
    const payload = toAdminSettingsUpdatePayload(data)
    try {
      const updated = await updateSettings(payload)
      reset(toFormValues(updated))
    } catch {
      // Inline 4xx errors render via FormErrorAlert; transient failures toast via MutationCache.
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="admin-settings-loading">
        <Skeleton className="h-10 w-64" />
        <Card className="border-border shadow-xs">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isError || !settings) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <AdminPageHeader
          title={t('admin:settings.title', 'Store Settings')}
          description={t(
            'admin:settings.subtitle',
            'Manage public contact channels and social media links shown on the storefront.',
          )}
        />
        <AdminQueryError error={error} onRetry={() => refetch()} />
      </div>
    )
  }

  const formattedUpdatedAt = formatDate(settings.updated_at, {
    locale: currentLang,
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <AdminPageHeader
        title={t('admin:settings.title', 'Store Settings')}
        description={t(
          'admin:settings.subtitle',
          'Manage public contact channels and social media links shown on the storefront.',
        )}
      />

      <FormErrorAlert error={updateError} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* 1. Contact Channels Card */}
        <Card className="border-border shadow-xs">
          <CardHeader className="text-start">
            <CardTitle className="text-lg">
              {t('admin:settings.contactTitle', 'Contact Channels')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin:settings.contactDescription',
                'Customer support contact details displayed in the footer, home page, and product pages. Leave blank to hide a channel.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
              <Field>
                <FieldLabel htmlFor="settings-whatsapp">
                  {t('admin:settings.whatsappLabel', 'WhatsApp Number')}
                </FieldLabel>
                <Input
                  id="settings-whatsapp"
                  dir="ltr"
                  disabled={!canEdit || isUpdating}
                  placeholder={t('admin:settings.whatsappPlaceholder', '201158172869')}
                  aria-invalid={Boolean(errors.whatsapp_number)}
                  {...register('whatsapp_number')}
                />
                <FieldDescription>
                  {t(
                    'admin:settings.whatsappHint',
                    'International format with country code, digits only (no + or leading 0).',
                  )}
                </FieldDescription>
                {errors.whatsapp_number?.message && (
                  <FieldError>{errors.whatsapp_number.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="settings-support-email">
                  {t('admin:settings.supportEmailLabel', 'Support Email')}
                </FieldLabel>
                <Input
                  id="settings-support-email"
                  type="email"
                  dir="ltr"
                  disabled={!canEdit || isUpdating}
                  placeholder={t('admin:settings.supportEmailPlaceholder', 'support@muftahy.com')}
                  aria-invalid={Boolean(errors.support_email)}
                  {...register('support_email')}
                />
                {errors.support_email?.message && (
                  <FieldError>{errors.support_email.message}</FieldError>
                )}
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="settings-social-handle">
                  {t('admin:settings.socialHandleLabel', 'Social Handle')}
                </FieldLabel>
                <Input
                  id="settings-social-handle"
                  dir="ltr"
                  disabled={!canEdit || isUpdating}
                  placeholder={t('admin:settings.socialHandlePlaceholder', '@muftahy')}
                  aria-invalid={Boolean(errors.social_handle)}
                  {...register('social_handle')}
                />
                {errors.social_handle?.message && (
                  <FieldError>{errors.social_handle.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* 2. Social Media Links Card */}
        <Card className="border-border shadow-xs">
          <CardHeader className="text-start">
            <CardTitle className="text-lg">
              {t('admin:settings.socialTitle', 'Social Media Links')}
            </CardTitle>
            <CardDescription>
              {t(
                'admin:settings.socialDescription',
                'Full https:// URLs for your official social profiles. Leave blank to hide an icon.',
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-start">
              <Field>
                <FieldLabel htmlFor="settings-instagram">
                  {t('admin:settings.instagramLabel', 'Instagram URL')}
                </FieldLabel>
                <Input
                  id="settings-instagram"
                  type="url"
                  dir="ltr"
                  disabled={!canEdit || isUpdating}
                  placeholder="https://instagram.com/muftahy"
                  aria-invalid={Boolean(errors.social_links?.instagram)}
                  {...register('social_links.instagram')}
                />
                {errors.social_links?.instagram?.message && (
                  <FieldError>{errors.social_links.instagram.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="settings-facebook">
                  {t('admin:settings.facebookLabel', 'Facebook URL')}
                </FieldLabel>
                <Input
                  id="settings-facebook"
                  type="url"
                  dir="ltr"
                  disabled={!canEdit || isUpdating}
                  placeholder="https://facebook.com/muftahy"
                  aria-invalid={Boolean(errors.social_links?.facebook)}
                  {...register('social_links.facebook')}
                />
                {errors.social_links?.facebook?.message && (
                  <FieldError>{errors.social_links.facebook.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="settings-x">
                  {t('admin:settings.xLabel', 'X (Twitter) URL')}
                </FieldLabel>
                <Input
                  id="settings-x"
                  type="url"
                  dir="ltr"
                  disabled={!canEdit || isUpdating}
                  placeholder="https://x.com/muftahy"
                  aria-invalid={Boolean(errors.social_links?.x)}
                  {...register('social_links.x')}
                />
                {errors.social_links?.x?.message && (
                  <FieldError>{errors.social_links.x.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="settings-tiktok">
                  {t('admin:settings.tiktokLabel', 'TikTok URL')}
                </FieldLabel>
                <Input
                  id="settings-tiktok"
                  type="url"
                  dir="ltr"
                  disabled={!canEdit || isUpdating}
                  placeholder="https://tiktok.com/@muftahy"
                  aria-invalid={Boolean(errors.social_links?.tiktok)}
                  {...register('social_links.tiktok')}
                />
                {errors.social_links?.tiktok?.message && (
                  <FieldError>{errors.social_links.tiktok.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="settings-youtube">
                  {t('admin:settings.youtubeLabel', 'YouTube URL')}
                </FieldLabel>
                <Input
                  id="settings-youtube"
                  type="url"
                  dir="ltr"
                  disabled={!canEdit || isUpdating}
                  placeholder="https://youtube.com/@muftahy"
                  aria-invalid={Boolean(errors.social_links?.youtube)}
                  {...register('social_links.youtube')}
                />
                {errors.social_links?.youtube?.message && (
                  <FieldError>{errors.social_links.youtube.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="settings-discord">
                  {t('admin:settings.discordLabel', 'Discord URL')}
                </FieldLabel>
                <Input
                  id="settings-discord"
                  type="url"
                  dir="ltr"
                  disabled={!canEdit || isUpdating}
                  placeholder="https://discord.gg/muftahy"
                  aria-invalid={Boolean(errors.social_links?.discord)}
                  {...register('social_links.discord')}
                />
                {errors.social_links?.discord?.message && (
                  <FieldError>{errors.social_links.discord.message}</FieldError>
                )}
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Footer Bar: Audit metadata & Save Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground text-start">
            {settings.updated_by
              ? t('admin:settings.lastUpdatedBy', {
                  date: formattedUpdatedAt,
                  name: settings.updated_by.display_name,
                  email: settings.updated_by.email,
                  defaultValue: `Last updated ${formattedUpdatedAt} by ${settings.updated_by.display_name} (${settings.updated_by.email})`,
                })
              : t('admin:settings.lastUpdated', {
                  date: formattedUpdatedAt,
                  defaultValue: `Last updated ${formattedUpdatedAt}`,
                })}
          </p>

          <Button
            type="submit"
            disabled={!canEdit || !isDirty || isUpdating}
            className="gap-2 w-full sm:w-auto"
          >
            {isUpdating ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="size-4" aria-hidden="true" />
            )}
            <span>
              {isUpdating
                ? t('admin:settings.saving', 'Saving...')
                : t('admin:settings.saveChanges', 'Save Settings')}
            </span>
          </Button>
        </div>
      </form>
    </div>
  )
}

