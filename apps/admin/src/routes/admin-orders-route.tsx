import { useTranslation } from 'react-i18next'
import { ShoppingCart } from 'lucide-react'
import { EmptyState } from '../features/dashboard/components/empty-state'

export function AdminOrdersRoute() {
  const { t } = useTranslation(['admin'])

  return (
    <div className="space-y-6 text-start">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {t('admin:nav.orders', 'Orders & Fulfillment')}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('admin:emptyState.orders.description')}
        </p>
      </div>

      <EmptyState
        icon={ShoppingCart}
        title={t('admin:emptyState.orders.title', 'No orders yet')}
        description={t(
          'admin:emptyState.orders.description',
          'Customer purchases, automatic license dispatches, and refund requests will show up here.'
        )}
      />
    </div>
  )
}

