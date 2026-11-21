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
    <div className="space-y-8 text-start w-full">
      {/* Welcome & Session Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-mono font-medium mb-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Telemetry & Control</span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {t('admin:dashboard.title', 'Operator Mission Control')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5">
            <span>{t('admin:dashboard.subtitle', 'Live storefront telemetry and pending fulfillment actions')}</span>
            <span className="text-muted-foreground/60 hidden sm:inline">·</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {user?.email || 'admin@muftahy.com'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => handleOpenImport()}
            className="gap-2 cursor-pointer shadow-xs active:translate-y-px transition-all font-medium"
          >
            <Upload className="size-4" />
            <span>{t('admin:inventory.ingestBatch', 'Ingest Keys')}</span>
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStock.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:p-5 text-amber-900 dark:text-amber-200 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-500/20 p-2.5 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-tight">
                  {t('admin:dashboard.lowStockAlert', 'Low Stock Warning: Critical Key Reserves')}
                </h3>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  {lowStock.length} {t('admin:dashboard.productsRunningLow', 'products have reached or breached their reserve threshold.')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenImport(lowStock[0]?.product_id)}
                className="border-amber-500/40 hover:bg-amber-500/20 text-xs font-medium cursor-pointer"
              >
                {t('admin:dashboard.restockFirst', 'Restock Now')}
              </Button>
            </div>
          </div>
          <div className="mt-3.5 flex flex-wrap gap-2 pt-3 border-t border-amber-500/20">
            {lowStock.map((prod) => (
              <Badge
                key={prod.product_id}
                variant="secondary"
                className="bg-amber-500/20 text-amber-900 dark:text-amber-100 hover:bg-amber-500/30 cursor-pointer border border-amber-500/30 transition-colors py-1 px-2.5 text-xs font-medium"
                onClick={() => handleOpenImport(prod.product_id)}
              >
                {prod.product_name}: <span className="font-mono ms-1.5 font-bold tabular-nums">{prod.net_stock}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* KPI Metric Ribbon */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Revenue */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:dashboard.todayRevenue', "Today's Revenue")}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
              {overviewLoading ? '...' : formatMoney(todayRevenueNum, { currency: 'EGP', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <TrendingUp className="size-3 text-emerald-500" />
              <span>{t('admin:dashboard.clearedReceipts', 'Cleared manual & online payments')}</span>
            </p>
          </div>
        </div>

        {/* Orders Today */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:dashboard.todayOrders', 'Orders Created Today')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-500/15">
              <ShoppingCart className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
              {overviewLoading ? '...' : overview?.today_sales_count ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('admin:dashboard.acrossAllGateways', 'Across all payment methods')}
            </p>
          </div>
        </div>

        {/* Pending Adjudication */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:dashboard.pendingOrders', 'Pending Adjudication')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors group-hover:bg-amber-500/15">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
              {overviewLoading ? '...' : overview?.pending_orders_count ?? 0}
            </div>
            <Link
              to={`/${lang}/orders`}
              className="text-xs text-primary hover:underline mt-1.5 inline-flex items-center gap-1 font-medium"
            >
              <span>{t('admin:dashboard.reviewReceipts', 'Review transfer receipts')}</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>

        {/* Open Dispute Tickets */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:dashboard.openDisputes', 'Open Dispute Tickets')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors group-hover:bg-rose-500/15">
              <LifeBuoy className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
              {overviewLoading ? '...' : overview?.open_tickets_count ?? 0}
            </div>
            <Link
              to={`/${lang}/tickets`}
              className="text-xs text-primary hover:underline mt-1.5 inline-flex items-center gap-1 font-medium"
            >
              <span>{t('admin:dashboard.resolveDisputes', 'Review ticket queue')}</span>
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Mid Section: Daily Sales Breakdown & Preorders Queue */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Breakdown */}
        <Card className="border-border/80 lg:col-span-2 shadow-none">
          <CardHeader className="text-start pb-4 border-b border-border/40">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
                  {t('admin:dashboard.salesTrajectory', '7-Day Revenue Trajectory')}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:dashboard.salesTrajectoryDesc', 'Daily gross revenue and confirmed order counts.')}
                </CardDescription>
              </div>
              {sales && (
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-muted/50 px-3 py-1.5 rounded-lg border border-border/40">
                  <span className="text-muted-foreground">{t('admin:dashboard.periodTotal', 'Period Gross:')}</span>
                  <span className="font-bold text-foreground tabular-nums">
                    {formatMoney(Number(sales.total_sales_egp), { currency: 'EGP', locale: lang })}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {salesLoading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm font-mono">
                {t('admin:common.loading', 'Loading sales trends...')}
              </div>
            ) : !sales || sales.daily_breakdown.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                {t('admin:dashboard.noSalesData', 'No historical sales data in this period.')}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {sales.daily_breakdown.slice(-7).map((day) => {
                    const dayRev = Number(day.sales_egp)
                    const maxRev = Math.max(...sales.daily_breakdown.map((d) => Number(d.sales_egp)), 1)
                    const pct = Math.min(Math.round((dayRev / maxRev) * 100), 100)

                    return (
                      <div key={day.date} className="flex items-center gap-3 text-xs group">
                        <span className="w-20 font-mono text-muted-foreground shrink-0">{day.date}</span>
                        <div className="flex-1 h-3 rounded-full bg-muted/60 overflow-hidden p-0.5 border border-border/30">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300 group-hover:brightness-110"
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                        <span className="w-28 text-end font-mono font-semibold tabular-nums shrink-0">
                          {formatMoney(dayRev, { currency: 'EGP', locale: lang })}
                        </span>
                        <Badge variant="outline" className="text-[10px] w-16 justify-center font-mono py-0.5 shrink-0 border-border/60">
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
        <Card className="border-border/80 shadow-none">
          <CardHeader className="text-start pb-4 border-b border-border/40">
            <CardTitle className="text-base font-bold tracking-tight">
              {t('admin:dashboard.preorderBacklog', 'Preorder Backlog')}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {t('admin:dashboard.preorderBacklogDesc', 'Awaiting supplier stock release')}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-5">
            {!preorders || preorders.per_product_preorders.length === 0 ? (
              <p className="text-xs text-muted-foreground py-12 text-center">
                {t('admin:dashboard.noPendingPreorders', 'No pending preorders awaiting release.')}
              </p>
            ) : (
              <div className="space-y-2.5">
                {preorders.per_product_preorders.slice(0, 5).map((po) => (
                  <div
                    key={po.product_id}
                    className="flex items-center justify-between rounded-lg border border-border/60 p-3 text-xs transition-colors hover:bg-muted/30"
                  >
                    <div className="grid gap-0.5 text-start min-w-0 me-2">
                      <span className="font-semibold text-foreground truncate">{po.product_name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {po.oldest_preorder_age_hours}h backlog age
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-[11px] font-mono tabular-nums shrink-0 font-bold border border-border/40">
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
      <Card className="border-border/80 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between text-start pb-4 border-b border-border/40">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold tracking-tight">
              {t('admin:audit.recentActivity', 'Live Security & Audit Trail')}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {t('admin:audit.recentActivityDesc', 'Immutable log of administrative operations and inventory modifications.')}
            </CardDescription>
          </div>
          <Link to={`/${lang}/audit`}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs font-medium hover:text-foreground">
              <span>{t('admin:common.viewAll', 'View All')}</span>
              <ArrowUpRight className="size-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.action', 'Action')}</TableHead>
                <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.operator', 'Operator')}</TableHead>
                <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.resource', 'Target')}</TableHead>
                <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.ipAddress', 'IP')}</TableHead>
                <TableHead className="text-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.timestamp', 'Timestamp')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!recentLogs || recentLogs.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-xs text-muted-foreground py-8">
                    {t('admin:audit.noRecords', 'No recent operator actions logged.')}
                  </TableCell>
                </TableRow>
              ) : (
                recentLogs.items.map((log) => (
                  <TableRow key={log.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-start py-3">
                      <Badge variant="outline" className="text-[10px] font-mono border-border/60 bg-muted/40">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-start font-mono text-muted-foreground py-3">
                      {log.admin_name}
                    </TableCell>
                    <TableCell className="text-xs text-start py-3">
                      <span className="font-medium text-foreground">{log.target_type}</span>
                      <span className="ms-1.5 font-mono text-muted-foreground text-[10px]">
                        ({log.target_id.slice(0, 8)})
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-start text-muted-foreground py-3">
                      {log.ip_address || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-end text-muted-foreground font-mono py-3">
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
