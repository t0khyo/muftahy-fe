import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { ChevronRight, PackageCheck } from 'lucide-react'
import { Card } from '@workspace/ui/components/card'
import { formatMoney } from '@workspace/domain/formatters/money'
import { formatDate } from '@workspace/domain/formatters/date'
import type { UserOrderSummary } from '@workspace/domain/schemas/order'
import { OrderStatusBadge } from './order-status-badge'

interface OrderCardProps {
  order: UserOrderSummary
}

export function OrderCard({ order }: OrderCardProps) {
  const { t } = useTranslation('account')
  const { lang = 'ar' } = useParams<{ lang: string }>()

  const formattedDate = formatDate(order.created_at, {
    locale: lang,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const formattedTotal = formatMoney(order.total_egp, {
    currency: 'EGP',
    locale: lang,
  })

  return (
    <Card className="p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left / Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-semibold text-foreground">
              {order.reference_code}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
            <span>{t('orders.orderDate', { date: formattedDate })}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <PackageCheck className="h-3.5 w-3.5" />
              {t('orders.items', { count: order.item_count })}
            </span>
          </div>
        </div>

        {/* Right / Pricing & CTA */}
        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
          <div className="text-start sm:text-end">
            <span className="text-xs text-muted-foreground block">{t('orders.detail.total')}</span>
            <span className="text-base sm:text-lg font-bold text-foreground">
              {formattedTotal}
            </span>
          </div>

          <Link
            to={`/${lang}/account/orders/${order.id}`}
            className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-2 text-xs sm:text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span>{t('orders.viewDetails')}</span>
            <ChevronRight className="h-4 w-4 shrink-0 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </Card>
  )
}

