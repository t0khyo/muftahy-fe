import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  DollarSign,
  Wallet,
  ShieldCheck,
} from 'lucide-react'
import {
  useAdminLedgerEntries,
  useAdminLedgerSummary,
} from '../features/ledger/hooks/use-ledger'
import { formatMoney, type SupportedCurrency } from '@workspace/domain/formatters/money'
import { Badge } from '@workspace/ui/components/badge'
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
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-mono font-medium mb-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Accounting & Escrow</span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {t('admin:ledger.title', 'Financial Ledger & Escrow')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('admin:ledger.subtitle', 'Immutable double-entry accounting journal, deferred revenue reserves, and net balance')}
          </p>
        </div>
      </div>

      {/* Financial Health & Balances Ribbon */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Net EGP Cash on Hand */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:ledger.netCashPosition', 'Cash On Hand (EGP)')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
              <DollarSign className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
              {summaryLoading ? '...' : formatMoney(cashOnHandNum, { currency: 'EGP', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('admin:ledger.clearedFunds', 'Liquid cleared funds in accounts')}
            </p>
          </div>
        </div>

        {/* Deferred Held Funds */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:ledger.deferredRevenue', 'Held Escrow (EGP)')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 transition-colors group-hover:bg-amber-500/15">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
              {summaryLoading ? '...' : formatMoney(deferredNum, { currency: 'EGP', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('admin:ledger.heldUntilDelivery', 'Escrow held until code release')}
            </p>
          </div>
        </div>

        {/* USD Supplier Wallet */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:ledger.usdLiquidity', 'USD Wholesale Wallet')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-500/15">
              <Wallet className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {summaryLoading ? '...' : formatMoney(usdWalletNum, { currency: 'USD', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('admin:ledger.supplierReserves', 'International wholesale balance')}
            </p>
          </div>
        </div>

        {/* Net Gross Profit */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:ledger.netGrossProfit', 'Net Gross Profit (EGP)')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-500/15">
              <BookOpen className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {summaryLoading ? '...' : formatMoney(netProfitNum, { currency: 'EGP', locale: lang })}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              {t('admin:ledger.realizedEarnings', 'Gross revenue less wholesale COGS')}
            </p>
          </div>
        </div>
      </div>

      {/* Streamlined Toolbar & Journal Table */}
      <div className="space-y-4">
        {/* Entry Type Filter Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {ENTRY_TYPE_FILTERS.map((tab) => {
            const isSelected = selectedType === tab.value
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setSelectedType(tab.value)}
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

        {/* Double-entry Journal Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:ledger.journalTitle', 'General Journal Entries')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({entries.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:ledger.journalDesc', 'Double-entry accounting log. Running balance is updated synchronously per mutation.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {entriesLoading ? (
              <div className="py-20 text-center text-sm font-mono text-muted-foreground">
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
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:ledger.id', 'Entry ID')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:ledger.type', 'Type')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:ledger.description', 'Description')}</TableHead>
                    <TableHead className="text-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:ledger.amount', 'Amount')}</TableHead>
                    <TableHead className="text-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:ledger.runningBalance', 'Balance')}</TableHead>
                    <TableHead className="text-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:ledger.timestamp', 'Date')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const amountNum = Number(entry.amount)
                    const balanceNum = Number(entry.running_balance)
                    const isPositive = amountNum >= 0
                    const curr = (entry.currency as SupportedCurrency) || 'EGP'

                    return (
                      <TableRow key={entry.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-start text-foreground py-3.5">
                          #{entry.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-start py-3.5">
                          <Badge variant="outline" className="font-mono text-[10px] capitalize border-border/60 bg-muted/40">
                            {entry.entry_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-start max-w-xs truncate py-3.5 text-foreground">
                          {entry.description}
                        </TableCell>
                        <TableCell className={`text-end font-mono text-xs font-semibold tabular-nums py-3.5 ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                          {isPositive ? '+' : ''}{formatMoney(amountNum, { currency: curr, locale: lang })}
                        </TableCell>
                        <TableCell className="text-end font-mono text-xs text-muted-foreground tabular-nums py-3.5">
                          {formatMoney(balanceNum, { currency: curr, locale: lang })}
                        </TableCell>
                        <TableCell className="text-end text-xs text-muted-foreground font-mono py-3.5">
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
    </div>
  )
}
