import * as React from 'react'
import { useParams, Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  DollarSign,
  ShoppingCart,
  LifeBuoy,
  AlertTriangle,
  Upload,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { useAdminAuth } from '../features/auth/hooks/use-admin-auth'
import {
  useDashboardOverview,
  useSalesSummary,
  usePreorders,
} from '../features/dashboard/hooks/use-admin-dashboard'
import { useAuditLogs } from '../features/audit/hooks/use-audit-logs'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
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
import { formatMoney } from '@workspace/domain/formatters/money'
import { KeyBatchImportSheet } from '../features/inventory/components/key-batch-import-sheet'

export function AdminDashboardRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin', 'auth'])
  const { user } = useAdminAuth()

  const [importSheetOpen, setImportSheetOpen] = React.useState(false)
  const [selectedProductId, setSelectedProductId] = React.useState<string | undefined>()

  const { data: overview, isLoading: overviewLoading } = useDashboardOverview()
  const { data: sales, isLoading: salesLoading } = useSalesSummary()
  const { data: preorders } = usePreorders()
  const { data: recentLogs } = useAuditLogs({ limit: 5 })

  const lowStock = overview?.low_stock_products || []
  const todayRevenueNum = overview?.today_revenue_egp ? Number(overview.today_revenue_egp) : 0

  const handleOpenImport = (productId?: string) => {
    setSelectedProductId(productId)
    setImportSheetOpen(true)
  }

  return (
    <div className="space-y-8 text-start max-w-7xl mx-auto">
      {/* Welcome & Session Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t('admin:dashboard.title', 'Operator Mission Control')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('admin:dashboard.subtitle', 'Live storefront telemetry and pending fulfillment actions')} —{' '}
            <span className="font-medium text-foreground font-mono">
              {user?.email || 'admin@muftahy.com'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleOpenImport()}
            className="gap-2 cursor-pointer shadow-xs"
          >
            <Upload className="size-4" />
            <span>{t('admin:inventory.ingestBatch', 'Ingest Keys')}</span>
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStock.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-amber-500/20 p-2">
                <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">
                  {t('admin:dashboard.lowStockAlert', 'Low Stock Warning: Critical Key Reserves')}
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {lowStock.length} {t('admin:dashboard.productsRunningLow', 'products have reached or breached their reserve threshold.')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenImport(lowStock[0]?.product_id)}
                className="border-amber-500/40 hover:bg-amber-500/20 text-xs"
              >
                {t('admin:dashboard.restockFirst', 'Restock Now')}
              </Button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-amber-500/20">
            {lowStock.map((prod) => (
              <Badge
                key={prod.product_id}
                variant="secondary"
                className="bg-amber-500/20 text-amber-900 dark:text-amber-100 hover:bg-amber-500/30 cursor-pointer"
                onClick={() => handleOpenImport(prod.product_id)}
              >
                {prod.product_name}: <span className="font-mono ms-1 font-bold">{prod.net_stock}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* KPI Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Revenue */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:dashboard.todayRevenue', "Today's Revenue")}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {overviewLoading ? '...' : formatMoney(todayRevenueNum, { currency: 'EGP', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="size-3 text-emerald-500" />
              <span>{t('admin:dashboard.clearedReceipts', 'Cleared manual & online payments')}</span>
            </p>
          </CardContent>
        </Card>

        {/* Orders Today */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:dashboard.todayOrders', 'Orders Created Today')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShoppingCart className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {overviewLoading ? '...' : overview?.today_sales_count ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin:dashboard.acrossAllGateways', 'Across all payment methods')}
            </p>
          </CardContent>
        </Card>

        {/* Pending Adjudication */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:dashboard.pendingOrders', 'Pending Adjudication')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {overviewLoading ? '...' : overview?.pending_orders_count ?? 0}
            </div>
            <Link
              to={`/${lang}/orders`}
              className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1 font-medium"
            >
              <span>{t('admin:dashboard.reviewReceipts', 'Review transfer receipts')}</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Open Dispute Tickets */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:dashboard.openDisputes', 'Open Dispute Tickets')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <LifeBuoy className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {overviewLoading ? '...' : overview?.open_tickets_count ?? 0}
            </div>
            <Link
              to={`/${lang}/tickets`}
              className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-1 font-medium"
            >
              <span>{t('admin:dashboard.resolveDisputes', 'Review ticket queue')}</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Mid Section: Daily Sales Breakdown & Preorders Queue */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Breakdown */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="text-start">
            <CardTitle className="text-lg font-semibold">
              {t('admin:dashboard.salesTrajectory', '7-Day Revenue Trajectory')}
            </CardTitle>
            <CardDescription>
              {t('admin:dashboard.salesTrajectoryDesc', 'Daily gross revenue and confirmed order counts.')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                {t('admin:common.loading', 'Loading sales trends...')}
              </div>
            ) : !sales || sales.daily_breakdown.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                {t('admin:dashboard.noSalesData', 'No historical sales data in this period.')}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
                  <span>{t('admin:dashboard.periodTotal', 'Period Gross:')} <strong className="text-foreground font-mono">{formatMoney(Number(sales.total_sales_egp), { currency: 'EGP', locale: lang })}</strong></span>
                  <span>{t('admin:dashboard.periodOrders', 'Total Orders:')} <strong className="text-foreground font-mono">{sales.total_orders}</strong></span>
                </div>
                <div className="grid gap-2">
                  {sales.daily_breakdown.slice(-7).map((day) => {
                    const dayRev = Number(day.sales_egp)
                    const maxRev = Math.max(...sales.daily_breakdown.map((d) => Number(d.sales_egp)), 1)
                    const pct = Math.min(Math.round((dayRev / maxRev) * 100), 100)

                    return (
                      <div key={day.date} className="flex items-center gap-3 text-xs">
                        <span className="w-20 font-mono text-muted-foreground">{day.date}</span>
                        <div className="flex-1 h-3 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                        <span className="w-28 text-end font-mono font-medium">
                          {formatMoney(dayRev, { currency: 'EGP', locale: lang })}
                        </span>
                        <Badge variant="outline" className="text-[10px] w-14 justify-center">
                          {day.orders_count} ord
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preorders Queue */}
        <Card className="border-border">
          <CardHeader className="text-start">
            <CardTitle className="text-base font-semibold">
              {t('admin:dashboard.preorderBacklog', 'Preorder Backlog')}
            </CardTitle>
            <CardDescription>
              {t('admin:dashboard.preorderBacklogDesc', 'Awaiting supplier stock release')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!preorders || preorders.per_product_preorders.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                {t('admin:dashboard.noPendingPreorders', 'No pending preorders awaiting release.')}
              </p>
            ) : (
              <div className="space-y-3">
                {preorders.per_product_preorders.slice(0, 5).map((po) => (
                  <div
                    key={po.product_id}
                    className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs"
                  >
                    <div className="grid gap-0.5 text-start">
                      <span className="font-medium text-foreground">{po.product_name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {po.oldest_preorder_age_hours}h backlog age
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {po.count} queued
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Recent Operator Audit Trail */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between text-start pb-3">
          <div>
            <CardTitle className="text-lg font-semibold">
              {t('admin:audit.recentActivity', 'Live Security & Audit Trail')}
            </CardTitle>
            <CardDescription>
              {t('admin:audit.recentActivityDesc', 'Immutable log of administrative operations and inventory modifications.')}
            </CardDescription>
          </div>
          <Link to={`/${lang}/audit`}>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <span>{t('admin:common.viewAll', 'View All')}</span>
              <ArrowUpRight className="size-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t('admin:audit.action', 'Action')}</TableHead>
                <TableHead className="text-start">{t('admin:audit.operator', 'Operator')}</TableHead>
                <TableHead className="text-start">{t('admin:audit.resource', 'Target')}</TableHead>
                <TableHead className="text-start">{t('admin:audit.ipAddress', 'IP')}</TableHead>
                <TableHead className="text-end">{t('admin:audit.timestamp', 'Timestamp')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!recentLogs || recentLogs.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-6">
                    {t('admin:audit.noRecords', 'No recent operator actions logged.')}
                  </TableCell>
                </TableRow>
              ) : (
                recentLogs.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs font-semibold text-start">
                      <Badge variant="outline" className="text-[10px]">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-start font-mono text-muted-foreground">
                      {log.admin_name}
                    </TableCell>
                    <TableCell className="text-xs text-start">
                      <span className="font-medium">{log.target_type}</span>
                      <span className="ms-1 font-mono text-muted-foreground text-[10px]">
                        ({log.target_id.slice(0, 8)})
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-start text-muted-foreground">
                      {log.ip_address || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-end text-muted-foreground">
                      {new Date(log.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Batch Import Sheet modal */}
      <KeyBatchImportSheet
        open={importSheetOpen}
        onOpenChange={setImportSheetOpen}
        preselectedProductId={selectedProductId}
      />
    </div>
  )
}
