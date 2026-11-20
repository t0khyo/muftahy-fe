import { useTranslation } from 'react-i18next'
import {
  Clock,
  UploadCloud,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { Badge } from '@workspace/ui/components/badge'
import type { OrderStatus } from '@workspace/domain/schemas/order'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { t } = useTranslation('account')

  switch (status) {
    case 'pending_payment':
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 gap-1.5 font-medium"
        >
          <Clock className="h-3 w-3 shrink-0" />
          <span>{t('orders.status.pending_payment')}</span>
        </Badge>
      )
    case 'payment_uploaded':
      return (
        <Badge
          variant="outline"
          className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 gap-1.5 font-medium"
        >
          <UploadCloud className="h-3 w-3 shrink-0" />
          <span>{t('orders.status.payment_uploaded')}</span>
        </Badge>
      )
    case 'under_review':
      return (
        <Badge
          variant="outline"
          className="border-primary/40 bg-primary/10 text-primary gap-1.5 font-medium"
        >
          <ShieldCheck className="h-3 w-3 shrink-0" />
          <span>{t('orders.status.under_review')}</span>
        </Badge>
      )
    case 'completed':
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 font-medium"
        >
          <CheckCircle2 className="h-3 w-3 shrink-0" />
          <span>{t('orders.status.completed')}</span>
        </Badge>
      )
    case 'cancelled':
      return (
        <Badge
          variant="outline"
          className="border-destructive/30 bg-destructive/10 text-destructive gap-1.5 font-medium"
        >
          <XCircle className="h-3 w-3 shrink-0" />
          <span>{t('orders.status.cancelled')}</span>
        </Badge>
      )
    case 'refunded':
      return (
        <Badge
          variant="outline"
          className="border-muted-foreground/30 bg-muted text-muted-foreground gap-1.5 font-medium"
        >
          <RotateCcw className="h-3 w-3 shrink-0" />
          <span>{t('orders.status.refunded')}</span>
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

