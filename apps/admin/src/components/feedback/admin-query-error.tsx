import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Link, useInRouterContext, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '@workspace/domain/formatters/number'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@workspace/ui/components/alert'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { useRateLimitCooldown } from '../../hooks/use-rate-limit-cooldown'
import { EmptyState } from '../../features/dashboard/components/empty-state'
import { resolveApiError } from '../../lib/api-feedback'

export interface AdminQueryErrorProps {
  error: unknown
  onRetry?: () => void
  isRetrying?: boolean
  variant?: 'page' | 'section' | 'compact'
  cooldownSeconds?: number | null
  className?: string
}

export function AdminQueryError({
  error,
  onRetry,
  isRetrying = false,
  variant = 'section',
  cooldownSeconds,
  className,
}: AdminQueryErrorProps) {
  const { t, i18n } = useTranslation(['admin', 'auth'])
  const inRouter = useInRouterContext()
  const params = useParams<{ lang?: string }>()
  const lang = params.lang || 'en'
  const { isLimited, remainingSeconds } = useRateLimitCooldown()

  const resolved = resolveApiError(error)
  const effectiveCooldown = cooldownSeconds ?? (isLimited ? remainingSeconds : 0)
  const isCoolingDown = effectiveCooldown > 0
  const isNonRetryable = resolved.status === 403 || resolved.status === 404

  const formattedSeconds = isCoolingDown
    ? formatNumber(effectiveCooldown, { locale: i18n.language || 'en', useGrouping: false })
    : '0'

  const title = t('admin:feedback.queryErrorTitle', 'Failed to load data')

  const renderAction = (size: 'sm' | 'xs' = 'sm') => {
    if (isNonRetryable) {
      const label = t('admin:feedback.backToDashboard', 'Back to Dashboard')
      const icon = <ArrowLeft className="size-3.5 rtl:rotate-180" />
      if (inRouter) {
        return (
          <Button variant="outline" size={size} nativeButton={false} render={<Link to={`/${lang}`} />} className="gap-1.5">
            {icon}
            <span>{label}</span>
          </Button>
        )
      }
      return (
        <Button variant="outline" size={size} nativeButton={false} render={<a href={`/${lang}`} />} className="gap-1.5">
          {icon}
          <span>{label}</span>
        </Button>
      )
    }

    if (!onRetry) return null

    const label = isCoolingDown
      ? t('admin:feedback.retryIn', { seconds: formattedSeconds, defaultValue: `Retry in ${formattedSeconds}s` })
      : isRetrying
        ? t('admin:feedback.retrying', 'Retrying...')
        : t('admin:feedback.retry', 'Retry')

    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        onClick={onRetry}
        disabled={isRetrying || isCoolingDown}
        className="gap-1.5 cursor-pointer tabular-nums"
      >
        <RefreshCw className={cn('size-3.5', isRetrying && 'animate-spin')} />
        <span>{label}</span>
      </Button>
    )
  }

  if (variant === 'compact') {
    return (
      <Alert
        variant="destructive"
        className={cn('border-destructive/40 bg-destructive/10 text-destructive', className)}
      >
        <AlertTriangle className="size-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="text-destructive/90">{resolved.message}</AlertDescription>
        {(onRetry || isNonRetryable) && <AlertAction>{renderAction('xs')}</AlertAction>}
      </Alert>
    )
  }

  return (
    <EmptyState
      icon={AlertTriangle}
      title={title}
      description={resolved.message}
      actionSlot={renderAction('sm')}
      iconClassName="size-14 rounded-2xl bg-destructive/10 text-destructive shadow-xs ring-1 ring-destructive/20 mb-2"
      className={cn(
        variant === 'page'
          ? 'min-h-[360px] border border-dashed border-destructive/30 bg-card/40 p-8 sm:p-12'
          : 'min-h-[220px] border border-dashed border-destructive/30 bg-card/40 p-6',
        className,
      )}
    />
  )
}
