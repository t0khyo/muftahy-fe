import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '@workspace/domain/formatters/number'
import { Alert, AlertDescription, AlertTitle } from '@workspace/ui/components/alert'
import { useRateLimitCooldown } from '../../hooks/use-rate-limit-cooldown'

export function RateLimitBanner() {
  const { isLimited, remainingSeconds } = useRateLimitCooldown()
  const { t, i18n } = useTranslation(['admin'])

  if (!isLimited || remainingSeconds <= 0) {
    return null
  }

  const formattedSeconds = formatNumber(remainingSeconds, {
    locale: i18n.language || 'en',
    useGrouping: false,
  })

  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
      <Alert
        role="status"
        aria-live="polite"
        className="border-warning/30 bg-warning/10 text-foreground"
      >
        <AlertTriangle className="size-4 text-warning" />
        <AlertTitle className="text-sm font-semibold">
          {t('admin:feedback.rateLimitBannerTitle', 'Too many requests')}
        </AlertTitle>
        <AlertDescription className="text-xs text-foreground/85 tabular-nums">
          {t('admin:feedback.rateLimitBannerDesc', {
            seconds: formattedSeconds,
            defaultValue: `Requests are paused for ${formattedSeconds}s to respect server limits.`,
          })}
        </AlertDescription>
      </Alert>
    </div>
  )
}
