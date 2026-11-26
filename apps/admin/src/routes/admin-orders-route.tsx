import * as React from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ShoppingCart,
  Clock,
  Eye,
  Copy,
  MessageSquare,
} from 'lucide-react'
import { useAdminOrders } from '../features/orders/hooks/use-admin-orders'
import { type OrderResponse, type OrderStatus } from '@workspace/domain/schemas/order'
import { formatMoney } from '@workspace/domain/formatters/money'
import { formatDate } from '@workspace/domain/formatters/date'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Tabs, TabsList, TabsTrigger } from '@workspace/ui/components/tabs'
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
import { AdminQueryError } from '../components/feedback/admin-query-error'
import { EmptyState } from '../features/dashboard/components/empty-state'
import { AdminPageHeader } from '../components/admin-page-header'
import { DataTableColumnHeader } from '../components/data-table-column-header'
import { DataTableRowActions } from '../components/data-table-row-actions'
import {
  DataTableToolbar,
  DataTableSearch,
  DataTableActiveFilters,
  type ActiveFilterChipItem,
} from '../components/data-table/data-table-toolbar'
import { DataTablePagination } from '../components/data-table/data-table-pagination'
import { useDataTableSort } from '../hooks/use-data-table-sort'
import { useDataTablePagination } from '../hooks/use-data-table-pagination'

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All Orders', value: 'all' },
  { label: 'Review Queue', value: 'payment_uploaded,under_review' },
  { label: 'Pending Payment', value: 'pending_payment' },
  { label: 'Approved', value: 'approved' },
  { label: 'Cancelled / Rejected', value: 'auto_cancelled,rejected_refund' },
]

export function AdminOrdersRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation(['admin'])

  const [selectedStatus, setSelectedStatus] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeReviewOrder, setActiveReviewOrder] = React.useState<OrderResponse | null>(null)
  const [reviewDialogOpen, setReviewDialogOpen] = React.useState(false)

  const { data, isLoading, isError, error, refetch, isFetching, isPlaceholderData } = useAdminOrders({
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

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<OrderResponse>(
    filteredOrders,
    { column: 'created_at', direction: 'desc' },
    {
      items_count: (o) => o.items.length,
      total_egp: (o) => Number(o.total_egp),
    }
  )

  const pagination = useDataTablePagination(sortedItems, { defaultPageSize: 10 })
  const { resetPage } = pagination

  React.useEffect(() => {
    resetPage()
  }, [searchQuery, selectedStatus, resetPage])

  const handleOpenReview = (order: NonNullable<typeof orders>[number]) => {
    setActiveReviewOrder(order)
    setReviewDialogOpen(true)
  }

  const activeFilterChips = React.useMemo(() => {
    const chips: ActiveFilterChipItem[] = []
    if (searchQuery.trim()) {
      chips.push({
        id: 'search',
        label: `"${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      })
    }
    if (selectedStatus !== 'all') {
      const statusItem = STATUS_FILTERS.find((s) => s.value === selectedStatus)
      chips.push({
        id: 'status',
        label: statusItem ? statusItem.label : selectedStatus,
        onRemove: () => setSelectedStatus('all'),
      })
    }
    return chips
  }, [searchQuery, selectedStatus])

  const handleResetAllFilters = () => {
    setSearchQuery('')
    setSelectedStatus('all')
  }

  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'default'
      case 'under_review':
      case 'payment_uploaded':
        return 'secondary'
      case 'refunded':
      case 'rejected_refund':
        return 'outline'
      case 'cancelled':
      case 'auto_cancelled':
      case 'pending_payment':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:orders.title', 'Orders')}
        description={t('admin:orders.subtitle', 'Review payment receipts, deliver digital keys, and process refunds')}
      />

      {/* Streamlined Toolbar & Orders Table */}
      <div className="space-y-4">
        <DataTableToolbar
        search={
          <DataTableSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('admin:orders.searchPlaceholder', 'Search order ID or reference code...')}
          />
        }
        views={
          <Tabs
            value={selectedStatus}
            onValueChange={(val) => {
              if (val) setSelectedStatus(val)
            }}
          >
            <TabsList className="h-8">
              {STATUS_FILTERS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="text-xs whitespace-nowrap">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
        activeFilters={
          <DataTableActiveFilters
            chips={activeFilterChips}
            onClearAll={handleResetAllFilters}
          />
        }
      />

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
            {isError && (!data || isPlaceholderData) ? (
              <div className="p-6">
                <AdminQueryError
                  error={error}
                  onRetry={() => refetch()}
                  isRetrying={isFetching}
                  variant="page"
                />
              </div>
            ) : isLoading ? (
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
              <>
                <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="ps-4 pe-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="reference_code"
                        title={t('admin:orders.orderId', 'Reference Code')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="payment_method"
                        title={t('admin:orders.gateway', 'Method')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="items_count"
                        title={t('admin:orders.items', 'Items')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="total_egp"
                        title={t('admin:orders.total', 'Total')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-center">
                      <DataTableColumnHeader
                        column="status"
                        title={t('admin:orders.status', 'Status')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="center"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="created_at"
                        title={t('admin:orders.createdAt', 'Date')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="ps-3 pe-4 py-3.5 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground w-40">
                      {t('admin:common.actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedItems.map((order) => {
                    const totalNum = order.total_egp
                    const isNeedsReview =
                      order.status === 'payment_uploaded' || order.status === 'under_review'

                    return (
                      <TableRow
                        key={order.id}
                        onClick={() => handleOpenReview(order)}
                        className="cursor-pointer border-border/40 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="font-mono text-xs font-bold text-start text-foreground ps-4 pe-3 py-3.5">
                          {order.reference_code}
                        </TableCell>
                        <TableCell className="text-xs text-start px-3 py-3.5">
                          <Badge variant="outline" className="font-mono text-[10px] capitalize border-border/60 bg-muted/40">
                            {order.payment_method?.replace('_', ' ') || 'Manual'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end text-xs text-muted-foreground px-3 py-3.5 font-mono tabular-nums">
                          {order.items.length}{' '}
                          {order.items.length === 1 ? 'item' : 'items'}
                        </TableCell>
                        <TableCell className="text-end font-mono text-xs font-semibold tabular-nums px-3 py-3.5">
                          {formatMoney(totalNum, { currency: 'EGP', locale: lang })}
                        </TableCell>
                        <TableCell className="text-center px-3 py-3.5">
                          <Badge
                            variant={getStatusBadgeVariant(order.status)}
                            className="capitalize text-[10px] font-mono tracking-tight"
                          >
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-end text-xs text-muted-foreground font-mono tabular-nums px-3 py-3.5">
                          {formatDate(order.created_at, {
                            locale: lang,
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </TableCell>
                        <TableCell className="text-center ps-3 pe-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center justify-center gap-1">
                            <Button
                              variant={isNeedsReview ? 'default' : 'ghost'}
                              size="sm"
                              onClick={() => handleOpenReview(order)}
                              className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
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
                            <DataTableRowActions
                              items={[
                                {
                                  label: t('admin:orders.copyRef', 'Copy Reference Code'),
                                  icon: Copy,
                                  onClick: () => navigator.clipboard.writeText(order.reference_code),
                                },
                                {
                                  label: t('admin:orders.copyOrderId', 'Copy Order UUID'),
                                  icon: Copy,
                                  onClick: () => navigator.clipboard.writeText(order.id),
                                },
                                {
                                  label: t('admin:orders.viewCustomerDisputes', 'Dispute Tickets'),
                                  icon: MessageSquare,
                                  onClick: () => navigate(`/${lang}/admin/tickets?search=${order.reference_code}`),
                                  separatorBefore: true,
                                },
                              ]}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredOrders.length > 0 && (
                <DataTablePagination
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  totalItems={pagination.totalItems}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                />
              )}
            </>
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
