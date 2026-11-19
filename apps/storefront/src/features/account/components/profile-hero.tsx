import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'
import { CheckCircle2, Pencil, Calendar, ShieldCheck, X } from 'lucide-react'
import { formatDate } from '@workspace/domain/formatters/date'
import type { UserProfile } from '@workspace/domain/schemas/auth'
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'

export interface ProfileHeroProps {
  profile: UserProfile
  isEditing: boolean
  onToggleEdit: () => void
}

function getInitials(name?: string | null): string {
  if (!name) return 'U'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function ProfileHero({ profile, isEditing, onToggleEdit }: ProfileHeroProps) {
  const { t } = useTranslation(['account', 'common'])
  const { lang = 'ar' } = useParams<{ lang: string }>()

  const initials = getInitials(profile.full_name)
  const formattedJoinedDate = formatDate(profile.created_at, {
    locale: lang,
    dateStyle: 'medium',
  })

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        {/* User Identity Info */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <Avatar className="size-16 sm:size-20 border-2 border-border shadow-xs">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg sm:text-xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {profile.is_active && (
              <span
                className="absolute end-0.5 bottom-0.5 size-4 rounded-full bg-success ring-2 ring-card"
                aria-label={t('profile.active')}
                title={t('profile.active')}
              />
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                {profile.full_name || profile.email}
              </h2>
              <Badge
                variant="outline"
                className="gap-1 border-primary/30 bg-primary/5 text-primary text-[11px] font-medium"
              >
                <ShieldCheck className="size-3" />
                <span>{t('profile.accountTier')}</span>
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {profile.email}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-3.5 opacity-70" />
                <span>
                  {t('profile.memberSince')} {formattedJoinedDate}
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-success">
                <CheckCircle2 className="size-3.5" />
                <span>{t('profile.active')}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action Toggle Button */}
        <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
          <Button
            type="button"
            variant={isEditing ? 'ghost' : 'outline'}
            size="sm"
            onClick={onToggleEdit}
            className="w-full sm:w-auto gap-2 text-xs font-semibold"
          >
            {isEditing ? (
              <>
                <X className="size-3.5" />
                <span>{t('profile.cancel')}</span>
              </>
            ) : (
              <>
                <Pencil className="size-3.5" />
                <span>{t('profile.editProfile')}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
