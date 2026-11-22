import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { ChevronRight, PackageCheck } from 'lucide-react'
import { Card } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
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
    <Card className="group p-4 sm:p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left / Info */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs sm:text-sm font-semibold">
              {order.reference_code}
            </Badge>
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

          <Button
            variant="secondary"
            size="sm"
            render={<Link to={`/${lang}/account/orders/${order.id}`} />}
            className="gap-1 text-xs sm:text-sm"
          >
            <span>{t('orders.viewDetails')}</span>
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
