import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ShoppingCart,
  Search,
  Clock,
  Eye,
} from 'lucide-react'
import { useAdminOrders } from '../features/orders/hooks/use-admin-orders'
import { type OrderResponse, type OrderStatus } from '@workspace/domain/schemas/order'
import { formatMoney } from '@workspace/domain/formatters/money'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { ReceiptReviewDialog } from '../features/orders/components/receipt-review-dialog'
import { EmptyState } from '../features/dashboard/components/empty-state'

const STATUS_FILTERS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All Orders', value: 'all' },
  { label: 'Pending Payment', value: 'pending_payment' },
  { label: 'Payment Uploaded', value: 'payment_uploaded' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Completed', value: 'completed' },
  { label: 'Refunded', value: 'refunded' },
  { label: 'Cancelled', value: 'cancelled' },
]

export function AdminOrdersRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [selectedStatus, setSelectedStatus] = React.useState<OrderStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeReviewOrder, setActiveReviewOrder] = React.useState<OrderResponse | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false)

  const { data, isLoading } = useAdminOrders({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    limit: 50,
  })

  const orders = data?.items

  const filteredOrders = React.useMemo(() => {
    const list = orders || []
    if (!searchQuery.trim()) return list
    const query = searchQuery.toLowerCase().trim()
    return list.filter(
      (o) =>
        o.id.toLowerCase().includes(query) ||
        o.reference_code.toLowerCase().includes(query) ||
        (o.payment_method && o.payment_method.toLowerCase().includes(query))
    )
  }, [orders, searchQuery])

  const handleOpenReview = (order: NonNullable<typeof orders>[number]) => {
    setActiveReviewOrder(order)
    setReviewDialogOpen(true)
  }

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'under_review':
      case 'payment_uploaded':
        return 'secondary'
      case 'refunded':
        return 'outline'
      case 'cancelled':
      case 'pending_payment':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-mono font-medium mb-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Fulfillment & Review</span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {t('admin:orders.title', 'Orders & Fulfillment')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('admin:orders.subtitle', 'Adjudicate Instapay/Vodafone Cash receipts, inspect keys, and issue refunds')}
          </p>
        </div>
      </div>

      {/* Streamlined Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('admin:orders.searchPlaceholder', 'Search order ID or reference code...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 h-9 text-xs sm:text-sm bg-muted/30 border-border/70 focus-visible:bg-background transition-colors"
            />
          </div>

          {/* Segmented Status Rail */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_FILTERS.map((tab) => {
              const isSelected = selectedStatus === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedStatus(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Orders Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:orders.listTitle', 'Orders Queue')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({filteredOrders.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:orders.listDesc', 'Click any row to open the manual payment receipt verification console.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center text-sm font-mono text-muted-foreground">
                {t('admin:common.loading', 'Loading orders...')}
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={ShoppingCart}
                  title={t('admin:orders.emptyTitle', 'No orders found')}
                  description={t(
                    'admin:orders.emptyDesc',
                    'There are no orders matching the selected status filter or search parameters.'
                  )}
                />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:orders.orderId', 'Reference Code')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:orders.gateway', 'Method')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:orders.items', 'Items')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:orders.total', 'Total')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:orders.status', 'Status')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:orders.createdAt', 'Date')}</TableHead>
                    <TableHead className="text-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const totalNum = order.total_egp
                    const isNeedsReview =
                      order.status === 'payment_uploaded' || order.status === 'under_review'

                    return (
                      <TableRow
                        key={order.id}
                        onClick={() => handleOpenReview(order)}
                        className="cursor-pointer border-border/40 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-mono text-xs font-bold text-start text-foreground py-3.5">
                          {order.reference_code}
                        </TableCell>
                        <TableCell className="text-xs text-start py-3.5">
                          <Badge variant="outline" className="font-mono text-[10px] capitalize border-border/60 bg-muted/40">
                            {order.payment_method?.replace('_', ' ') || 'Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-start text-muted-foreground py-3.5 font-mono">
                          {order.items.length}{' '}
                          {order.items.length === 1 ? 'item' : 'items'}
                        </TableCell>
                        <TableCell className="text-xs font-mono font-semibold text-start tabular-nums py-3.5">
                          {formatMoney(totalNum, { currency: 'EGP', locale: lang })}
                        </TableCell>
                        <TableCell className="text-start py-3.5">
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            className="capitalize text-[10px] font-mono tracking-tight"
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-start text-muted-foreground font-mono py-3.5">
                          {new Date(order.created_at).toLocaleString(
                            lang === 'ar' ? 'ar-EG' : 'en-US',
                            {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-end py-3.5" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant={isNeedsReview ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleOpenReview(order)}
                            className="h-7 gap-1.5 text-xs font-medium cursor-pointer"
                          >
                            {isNeedsReview ? (
                              <>
                                <Clock className="size-3" />
                                <span>{t('admin:orders.reviewReceipt', 'Review Receipt')}</span>
                              </>
                            ) : (
                              <>
                                <Eye className="size-3" />
                                <span>{t('admin:orders.inspect', 'Inspect')}</span>
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Adjudication / Receipt Review Dialog */}
      <ReceiptReviewDialog
        order={activeReviewOrder}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
      />
    </div>
  )
}
