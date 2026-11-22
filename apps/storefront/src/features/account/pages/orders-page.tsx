import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from '@workspace/ui/components/alert'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@workspace/ui/components/empty'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@workspace/ui/components/toggle-group'
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

      {/* Filter Tabs using shadcn ToggleGroup */}
      <ToggleGroup
        value={[activeTab]}
        onValueChange={(val) => {
          if (val.length > 0) {
            setActiveTab(val[val.length - 1] as OrderFilterTab)
          }
        }}
        variant="outline"
        className="w-fit"
      >
        <ToggleGroupItem value="all" className="text-xs sm:text-sm">
          {t('orders.all')} ({orders.length})
        </ToggleGroupItem>
        <ToggleGroupItem value="pending" className="text-xs sm:text-sm">
          {t('orders.pending')}
        </ToggleGroupItem>
        <ToggleGroupItem value="completed" className="text-xs sm:text-sm">
          {t('orders.completed')}
        </ToggleGroupItem>
      </ToggleGroup>

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
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t('common.error', 'An error occurred')}</AlertTitle>
          <AlertDescription>
            Failed to load your orders from the marketplace.
          </AlertDescription>
          <AlertAction>
            <Button
              variant="outline"
              size="xs"
              onClick={() => refetch()}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              <span>{t('common.retry', 'Try again')}</span>
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredOrders.length === 0 && (
        <Empty className="rounded-xl border border-border bg-card p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-full bg-muted mb-4">
              <ShoppingBag className="size-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle className="text-base sm:text-lg font-semibold">
              {t('orders.emptyTitle')}
            </EmptyTitle>
            <EmptyDescription className="max-w-md text-xs sm:text-sm">
              {t('orders.emptyDesc')}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="mt-4">
            <Button render={<Link to={`/${lang}/products`} />}>
              <span>{t('orders.browseCatalog')}</span>
            </Button>
          </EmptyContent>
        </Empty>
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
