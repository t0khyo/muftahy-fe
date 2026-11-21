import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import { useUserOrders } from '../hooks/use-orders'
import { OrderCard } from '../components/orders/order-card'

type OrderFilterTab = 'all' | 'pending' | 'completed'

export function OrdersPage() {
  const { t } = useTranslation('account')
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const { orders, isLoading, isError, refetch } = useUserOrders()
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all')

  const filteredOrders = useMemo(() => {
    if (activeTab === 'pending') {
      return orders.filter((o) =>
        ['pending_payment', 'payment_uploaded', 'under_review'].includes(o.status),
      )
    }
    if (activeTab === 'completed') {
      return orders.filter((o) => o.status === 'completed' || o.status === 'approved')
    }
    return orders
  }, [orders, activeTab])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-border pb-4">
        <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
          {t('orders.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('orders.description')}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 p-1 border border-border/50 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-[0.98] ${
            activeTab === 'all'
              ? 'bg-card text-foreground font-semibold shadow-xs dark:bg-card/90'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('orders.all')} ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-[0.98] ${
            activeTab === 'pending'
              ? 'bg-card text-foreground font-semibold shadow-xs dark:bg-card/90'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('orders.pending')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-[0.98] ${
            activeTab === 'completed'
              ? 'bg-card text-foreground font-semibold shadow-xs dark:bg-card/90'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('orders.completed')}
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-heading text-base font-semibold text-foreground">
            {t('common.error', 'An error occurred')}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Failed to load your orders from the marketplace.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t('common.retry', 'Try again')}</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground">
            {t('orders.emptyTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md">
            {t('orders.emptyDesc')}
          </p>
          <Button className="mt-5" render={<Link to={`/${lang}/products`} />}>
            <span>{t('orders.browseCatalog')}</span>
          </Button>
        </div>
      )}

      {/* Order List */}
      {!isLoading && !isError && filteredOrders.length > 0 && (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

