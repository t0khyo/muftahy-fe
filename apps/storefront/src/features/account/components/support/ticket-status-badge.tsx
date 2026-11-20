import { useTranslation } from 'react-i18next'
import { Clock, RefreshCw, CheckCircle2, Lock } from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import type { TicketStatus } from '@workspace/domain/schemas/ticket'

interface TicketStatusBadgeProps {
  status: TicketStatus
}

export function TicketStatusBadge({ status }: TicketStatusBadgeProps) {
  const { t } = useTranslation('account')

  switch (status) {
    case 'open':
      return (
        <Badge
          variant="outline"
          className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 gap-1.5 font-medium"
        >
          <Clock className="h-3 w-3 shrink-0" />
          <span>{t('support.status.open')}</span>
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 font-medium"
        >
          <RefreshCw className="h-3 w-3 shrink-0 animate-spin" />
          <span>{t('support.status.in_progress')}</span>
        </Badge>
      )
    case 'resolved':
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 font-medium"
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>{t('support.status.resolved')}</span>
        </Badge>
      )
    case 'closed':
      return (
        <Badge
          variant="outline"
          className="border-muted-foreground/30 bg-muted text-muted-foreground gap-1.5 font-medium"
        >
          <Lock className="h-3 w-3 shrink-0" />
          <span>{t('support.status.closed')}</span>
        </Badge>
      )
    default:
      return (
        <Badge variant="outline">
          <span>{status}</span>
        </Badge>
      )
  }
}

