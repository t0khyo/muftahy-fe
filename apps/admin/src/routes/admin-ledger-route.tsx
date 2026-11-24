import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  DollarSign,
  Wallet,
  ShieldCheck,
  Copy,
} from 'lucide-react'
import {
  useAdminLedgerEntries,
  useAdminLedgerSummary,
} from '../features/ledger/hooks/use-ledger'
import type { LedgerEntryResponse } from '@workspace/domain/schemas/ledger'
import { formatMoney, type SupportedCurrency } from '@workspace/domain/formatters/money'
import { formatDate } from '@workspace/domain/formatters/date'
import { Badge } from '@workspace/ui/components/badge'
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
  const [searchQuery, setSearchQuery] = React.useState('')

  const { data: summary, isLoading: summaryLoading } = useAdminLedgerSummary()
  const { data: ledgerData, isLoading: entriesLoading } = useAdminLedgerEntries({
    entryType: selectedType === 'all' ? undefined : selectedType,
    limit: 100,
  })

  const entries = React.useMemo(() => ledgerData || [], [ledgerData])

  const filteredEntries = React.useMemo(() => {
    let items = entries
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      items = items.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q) ||
          (e.order_id && e.order_id.toLowerCase().includes(q)) ||
          e.entry_type.toLowerCase().includes(q)
      )
    }
    return items
  }, [entries, searchQuery])

  const activeFilterChips = React.useMemo(() => {
    const chips: ActiveFilterChipItem[] = []
    if (searchQuery.trim()) {
      chips.push({
        id: 'search',
        label: `"${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      })
    }
    if (selectedType !== 'all') {
      const typeItem = ENTRY_TYPE_FILTERS.find((f) => f.value === selectedType)
      chips.push({
        id: 'type',
        label: typeItem ? typeItem.label : selectedType,
        onRemove: () => setSelectedType('all'),
      })
    }
    return chips
  }, [searchQuery, selectedType])

  const handleResetAllFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
  }

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<LedgerEntryResponse>(
    filteredEntries,
    { column: 'created_at', direction: 'desc' },
    {
      amount: (e) => Number(e.amount),
      running_balance: (e) => Number(e.running_balance),
    }
  )

  const pagination = useDataTablePagination(sortedItems, { defaultPageSize: 20 })
  const { resetPage } = pagination

  React.useEffect(() => {
    resetPage()
  }, [searchQuery, selectedType, resetPage])

  const cashOnHandNum = summary?.egp_cash_on_hand ? Number(summary.egp_cash_on_hand) : 0
  const usdWalletNum = summary?.usd_wallet_balance ? Number(summary.usd_wallet_balance) : 0
  const deferredNum = summary?.held_funds_egp ? Number(summary.held_funds_egp) : 0
  const netProfitNum = summary?.net_gross_profit_egp ? Number(summary.net_gross_profit_egp) : 0

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:ledger.title', 'Finance')}
        description={t('admin:ledger.subtitle', 'Track store revenue, wholesale costs, pending funds, and net profit')}
      />

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
              {t('admin:ledger.deferredRevenue', 'Pending Clearance (EGP)')}
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
              {t('admin:ledger.heldUntilDelivery', 'Funds held until order completion')}
            </p>
          </div>
        </div>

        {/* USD Supplier Wallet */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:ledger.usdLiquidity', 'Wholesale Balance (USD)')}
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
        <DataTableToolbar
          search={
            <DataTableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('admin:ledger.searchPlaceholder', 'Search transactions, references, or notes...')}
            />
          }
          views={
            <Tabs
              value={selectedType}
              onValueChange={(val) => {
                if (val) setSelectedType(val)
              }}
            >
              <TabsList className="h-8">
                {ENTRY_TYPE_FILTERS.map((tab) => (
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

        {/* Double-entry Journal Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:ledger.journalTitle', 'Transactions')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({filteredEntries.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:ledger.journalDesc', 'Complete record of store sales, wholesale costs, and refunds.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {entriesLoading ? (
              <div className="py-20 text-center text-sm font-mono text-muted-foreground">
                {t('admin:common.loading', 'Loading transactions...')}
              </div>
            ) : filteredEntries.length === 0 ? (
              entries.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={BookOpen}
                    title={t('admin:ledger.emptyTitle', 'No transactions yet')}
                    description={t(
                      'admin:ledger.emptyDesc',
                      'Completed customer orders and wholesale costs will appear here.'
                    )}
                  />
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {t('admin:common.noFilteredResults', 'No records match your active filters')}
                </div>
              )
            ) : (
              <>
                <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="ps-4 pe-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="id"
                        title={t('admin:ledger.id', 'Entry ID')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-center">
                      <DataTableColumnHeader
                        column="entry_type"
                        title={t('admin:ledger.type', 'Type')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="center"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="description"
                        title={t('admin:ledger.description', 'Description')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="amount"
                        title={t('admin:ledger.amount', 'Amount')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="running_balance"
                        title={t('admin:ledger.runningBalance', 'Balance')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="created_at"
                        title={t('admin:ledger.timestamp', 'Date')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="ps-3 pe-4 py-3.5 text-center w-20 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t('admin:common.actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedItems.map((entry) => {
                    const amountNum = Number(entry.amount)
                    const balanceNum = Number(entry.running_balance)
                    const isPositive = amountNum >= 0
                    const curr = (entry.currency as SupportedCurrency) || 'EGP'

                    return (
                      <TableRow key={entry.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                        <TableCell className="ps-4 pe-3 py-3.5 font-mono text-xs font-bold text-start text-foreground">
                          #{entry.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-center">
                          <Badge variant="outline" className="font-mono text-[10px] capitalize border-border/60 bg-muted/40">
                            {entry.entry_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-xs text-start max-w-xs truncate text-foreground">
                          {entry.description}
                        </TableCell>
                        <TableCell className={`px-3 py-3.5 text-end font-mono text-xs font-semibold tabular-nums ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                          {isPositive ? '+' : ''}{formatMoney(amountNum, { currency: curr, locale: lang })}
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-end font-mono text-xs text-muted-foreground tabular-nums">
                          {formatMoney(balanceNum, { currency: curr, locale: lang })}
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-end text-xs text-muted-foreground font-mono tabular-nums">
                          {formatDate(entry.created_at, {
                            locale: lang,
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </TableCell>
                        <TableCell className="ps-3 pe-4 py-3.5 text-center">
                          <div className="inline-flex items-center justify-center">
                            <DataTableRowActions
                              items={[
                                {
                                  label: t('admin:ledger.copyId', 'Copy Entry ID'),
                                  icon: Copy,
                                  onClick: () => navigator.clipboard.writeText(entry.id),
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
              {filteredEntries.length > 0 && (
                <DataTablePagination
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  totalItems={pagination.totalItems}
                  pageSizeOptions={[10, 20, 50, 100]}
                  onPageChange={pagination.setPage}
                  onPageSizeChange={pagination.setPageSize}
                />
              )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
