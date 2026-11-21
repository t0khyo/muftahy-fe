import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  DollarSign,
  Wallet,
  ShieldCheck,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import {
  useAdminLedgerEntries,
  useAdminLedgerSummary,
} from '../features/ledger/hooks/use-ledger'
import { formatMoney, type SupportedCurrency } from '@workspace/domain/formatters/money'
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
import { EmptyState } from '../features/dashboard/components/empty-state'

const ENTRY_TYPE_FILTERS = [
  { label: 'All Transactions', value: 'all' },
  { label: 'Payment Receipts', value: 'payment_received' },
  { label: 'Key Cost Wholesale', value: 'wholesale_cost' },
  { label: 'Refund Claims', value: 'refund' },
  { label: 'Gateway Fee', value: 'gateway_fee' },
] as const

export function AdminLedgerRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [selectedType, setSelectedType] = React.useState<string>('all')

  const { data: summary, isLoading: summaryLoading } = useAdminLedgerSummary()
  const { data: ledgerData, isLoading: entriesLoading } = useAdminLedgerEntries({
    entryType: selectedType === 'all' ? undefined : selectedType,
    limit: 100,
  })

  const entries = ledgerData || []

  const cashOnHandNum = summary?.egp_cash_on_hand ? Number(summary.egp_cash_on_hand) : 0
  const usdWalletNum = summary?.usd_wallet_balance ? Number(summary.usd_wallet_balance) : 0
  const deferredNum = summary?.held_funds_egp ? Number(summary.held_funds_egp) : 0
  const netProfitNum = summary?.net_gross_profit_egp ? Number(summary.net_gross_profit_egp) : 0

  return (
    <div className="space-y-6 text-start max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t('admin:ledger.title', 'Financial Ledger & Escrow')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('admin:ledger.subtitle', 'Immutable double-entry accounting journal, deferred revenue reserves, and net balance')}
          </p>
        </div>
      </div>

      {/* Financial Health & Balances */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net EGP Cash on Hand */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:ledger.netCashPosition', 'Cash On Hand (EGP)')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {summaryLoading ? '...' : formatMoney(cashOnHandNum, { currency: 'EGP', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin:ledger.clearedFunds', 'Liquid cleared funds in accounts')}
            </p>
          </CardContent>
        </Card>

        {/* Deferred Held Funds */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:ledger.deferredRevenue', 'Held Escrow (EGP)')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldCheck className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {summaryLoading ? '...' : formatMoney(deferredNum, { currency: 'EGP', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin:ledger.heldUntilDelivery', 'Escrow held until code release')}
            </p>
          </CardContent>
        </Card>

        {/* USD Supplier Wallet */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:ledger.usdLiquidity', 'USD Wholesale Wallet')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Wallet className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {summaryLoading ? '...' : formatMoney(usdWalletNum, { currency: 'USD', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin:ledger.supplierReserves', 'International wholesale balance')}
            </p>
          </CardContent>
        </Card>

        {/* Net Gross Profit */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:ledger.netGrossProfit', 'Net Gross Profit (EGP)')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {summaryLoading ? '...' : formatMoney(netProfitNum, { currency: 'EGP', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin:ledger.realizedEarnings', 'Gross revenue less wholesale COGS')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Entry Type Filters */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="size-3.5 text-muted-foreground me-1 shrink-0" />
            {ENTRY_TYPE_FILTERS.map((tab) => (
              <Button
                key={tab.value}
                variant={selectedType === tab.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(tab.value)}
                className="h-8 text-xs cursor-pointer shrink-0"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Double-entry Journal Table */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2 text-start">
          <CardTitle className="text-base font-semibold">
            {t('admin:ledger.journalTitle', 'General Journal Entries')}
            <span className="ms-2 font-mono text-xs font-normal text-muted-foreground">
              ({entries.length} {t('admin:common.records', 'records')})
            </span>
          </CardTitle>
          <CardDescription>
            {t('admin:ledger.journalDesc', 'Double-entry accounting log. Running balance is updated synchronously per mutation.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {entriesLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {t('admin:common.loading', 'Loading ledger journal...')}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={BookOpen}
                title={t('admin:ledger.emptyTitle', 'No journal entries')}
                description={t(
                  'admin:ledger.emptyDesc',
                  'Transactions and automated payments will populate double-entry ledger records here.'
                )}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('admin:ledger.id', 'Entry ID')}</TableHead>
                  <TableHead className="text-start">{t('admin:ledger.type', 'Type')}</TableHead>
                  <TableHead className="text-start">{t('admin:ledger.description', 'Description')}</TableHead>
                  <TableHead className="text-end">{t('admin:ledger.amount', 'Amount')}</TableHead>
                  <TableHead className="text-end">{t('admin:ledger.runningBalance', 'Balance')}</TableHead>
                  <TableHead className="text-end">{t('admin:ledger.timestamp', 'Date')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const amountNum = Number(entry.amount)
                  const balanceNum = Number(entry.running_balance)
                  const isPositive = amountNum >= 0
                  const curr = (entry.currency as SupportedCurrency) || 'EGP'

                  return (
                    <TableRow key={entry.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-start">
                        #{entry.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-start">
                        <Badge variant="outline" className="font-mono text-[10px] capitalize">
                          {entry.entry_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-start max-w-xs truncate">
                        {entry.description}
                        {entry.order_id && (
                          <span className="ms-1 font-mono text-[10px] text-muted-foreground">
                            (ord #{entry.order_id.slice(0, 8)})
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-end font-mono text-xs">
                        <span className="text-foreground font-semibold flex items-center justify-end gap-1">
                          {isPositive ? (
                            <ArrowDownLeft className="size-3 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="size-3 text-rose-500" />
                          )}
                          {formatMoney(Math.abs(amountNum), { currency: curr, locale: lang })}
                        </span>
                      </TableCell>
                      <TableCell className="text-end font-mono text-xs text-muted-foreground">
                        {formatMoney(balanceNum, { currency: curr, locale: lang })}
                      </TableCell>
                      <TableCell className="text-xs text-end text-muted-foreground">
                        {new Date(entry.created_at).toLocaleString(
                          lang === 'ar' ? 'ar-EG' : 'en-US',
                          {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          }
                        )}
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
  )
}
