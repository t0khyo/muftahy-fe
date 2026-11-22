import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  KeyRound,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Copy,
  Tag,
  Edit,
} from 'lucide-react'
import {
  useInventoryKeys,
  useProductStockSummary,
} from '../features/inventory/hooks/use-inventory'
import type { KeyResponse } from '@workspace/domain/schemas/inventory'
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
import { MaskedKeyReveal } from '../features/inventory/components/masked-key-reveal'
import { KeyBatchImportSheet } from '../features/inventory/components/key-batch-import-sheet'
import { KeyUpdateDialog } from '../features/inventory/components/key-update-dialog'
import { EmptyState } from '../features/dashboard/components/empty-state'
import { AdminPageHeader } from '../components/admin-page-header'
import { DataTableColumnHeader } from '../components/data-table-column-header'
import { DataTableRowActions } from '../components/data-table-row-actions'
import { useDataTableSort } from '../hooks/use-data-table-sort'

const STATUS_FILTERS = [
  { label: 'All Keys', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Sold', value: 'sold' },
  { label: 'Reported Defective', value: 'reported' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

export function AdminInventoryRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [selectedStatus, setSelectedStatus] = React.useState<string>('all')
  const [importSheetOpen, setImportSheetOpen] = React.useState(false)
  const [selectedKeyForEdit, setSelectedKeyForEdit] = React.useState<KeyResponse | null>(null)

  const { data: stockSummary } = useProductStockSummary()
  const { data: keyData, isLoading } = useInventoryKeys({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  })

  const keys = keyData || []

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<KeyResponse>(
    keys,
    { column: 'created_at', direction: 'desc' }
  )

  // Calculate aggregated stats across products
  const stats = React.useMemo(() => {
    const list = Array.isArray(stockSummary) ? stockSummary : stockSummary ? [stockSummary] : []
    if (list.length === 0) return { total: 0, available: 0, sold: 0, reported: 0 }
    return list.reduce(
      (acc, curr) => ({
        total: acc.total + (curr.available_count ?? 0) + (curr.sold_count ?? 0) + (curr.reported_count ?? 0),
        available: acc.available + (curr.available_count ?? 0),
        sold: acc.sold + (curr.sold_count ?? 0),
        reported: acc.reported + (curr.reported_count ?? 0),
      }),
      { total: 0, available: 0, sold: 0, reported: 0 }
    )
  }, [stockSummary])

  const getKeyBadgeVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default'
      case 'sold':
        return 'secondary'
      case 'reported':
        return 'destructive'
      case 'cancelled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:inventory.title', 'Inventory')}
        description={t('admin:inventory.subtitle', 'License key inventory and stock management')}
      >
        <Button
          onClick={() => setImportSheetOpen(true)}
          className="gap-2 shrink-0 cursor-pointer shadow-xs active:translate-y-px transition-all font-medium"
        >
          <Upload className="size-4" />
          <span>{t('admin:inventory.importKeys', 'Import Keys')}</span>
        </Button>
      </AdminPageHeader>

      {/* Stock Health Metric Ribbon */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Keys */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:inventory.totalKeys', 'Total Keys')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-muted/80">
              <Archive className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
              {stats.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Across all product pools</p>
          </div>
        </div>

        {/* Available Keys */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:inventory.availableKeys', 'Available in Stock')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-500/15">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {stats.available}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Ready for automated delivery</p>
          </div>
        </div>

        {/* Sold / Dispatched */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:inventory.soldKeys', 'Sold')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors group-hover:bg-blue-500/15">
              <KeyRound className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
              {stats.sold}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Associated with completed orders</p>
          </div>
        </div>

        {/* Reported Defective */}
        <div className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-xs hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
              {t('admin:inventory.reportedKeys', 'Reported Defective')}
            </span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 transition-colors group-hover:bg-rose-500/15">
              <AlertTriangle className="size-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 tabular-nums">
              {stats.reported}
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Requires supplier replacement</p>
          </div>
        </div>
      </div>

      {/* Streamlined Toolbar & Keys Table */}
      <div className="space-y-4">
        {/* Status Filter Rail */}
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

        {/* Keys Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:inventory.keysTableTitle', 'Inventory Keys')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({keys.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:inventory.keysTableDesc', 'View and manage digital keys. Reveal actions are recorded in the audit log.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center text-sm font-mono text-muted-foreground">
                {t('admin:common.loading', 'Loading keys...')}
              </div>
            ) : keys.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={KeyRound}
                  title={t('admin:inventory.emptyTitle', 'No keys found')}
                  description={t(
                    'admin:inventory.emptyDesc',
                    'No keys match the chosen filter. Use Import Keys to stock your catalog.'
                  )}
                  actionLabel={t('admin:inventory.importKeys', 'Import Keys')}
                  onAction={() => setImportSheetOpen(true)}
                />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="ps-4 pe-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="id"
                        title={t('admin:inventory.keyId', 'Key ID')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="product_name"
                        title={t('admin:inventory.product', 'Product')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="serial"
                        title={t('admin:inventory.activationCode', 'Activation Code')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-center">
                      <DataTableColumnHeader
                        column="status"
                        title={t('admin:inventory.status', 'Status')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="center"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-center">
                      <DataTableColumnHeader
                        column="replacement_only"
                        title={t('admin:inventory.pool', 'Pool Type')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="center"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="created_at"
                        title={t('admin:inventory.dateAdded', 'Date Added')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="ps-3 pe-4 py-3.5 text-center font-mono text-[11px] uppercase tracking-wider text-muted-foreground w-20">
                      {t('admin:common.actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((keyRecord) => (
                    <TableRow key={keyRecord.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-start text-foreground ps-4 pe-3 py-3.5">
                        #{keyRecord.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-start text-muted-foreground px-3 py-3.5">
                        {keyRecord.product_name || keyRecord.product_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="text-start px-3 py-3.5">
                        <MaskedKeyReveal serial={keyRecord.serial} />
                      </TableCell>
                      <TableCell className="text-center px-3 py-3.5">
                        <Badge
                          variant={getKeyBadgeVariant(keyRecord.status)}
                          className="capitalize text-[10px] font-mono tracking-tight"
                        >
                          {keyRecord.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center px-3 py-3.5">
                        <Badge variant="outline" className="text-[10px] font-mono capitalize border-border/60 bg-muted/40">
                          {keyRecord.replacement_only ? 'Replacement' : 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-end text-muted-foreground font-mono tabular-nums px-3 py-3.5">
                        {formatDate(keyRecord.created_at, {
                          locale: lang,
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell className="text-center ps-3 pe-4 py-3.5">
                        <div className="inline-flex items-center justify-center">
                          <DataTableRowActions
                            items={[
                              {
                                label: t('admin:inventoryModule.editKey', 'Edit Key & Allocation'),
                                icon: Edit,
                                onClick: () => setSelectedKeyForEdit(keyRecord),
                              },
                              {
                                label: t('admin:inventory.copySerial', 'Copy Serial Key'),
                                icon: Copy,
                                onClick: () => navigator.clipboard.writeText(keyRecord.serial),
                              },
                              {
                                label: t('admin:inventory.copyKeyId', 'Copy Key ID'),
                                icon: Copy,
                                onClick: () => navigator.clipboard.writeText(keyRecord.id),
                              },
                              {
                                label: t('admin:inventory.copyProductId', 'Copy Product ID'),
                                icon: Tag,
                                onClick: () => navigator.clipboard.writeText(keyRecord.product_id),
                                separatorBefore: true,
                              },
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ingestion Sheet */}
      <KeyBatchImportSheet
        open={importSheetOpen}
        onOpenChange={setImportSheetOpen}
      />

      {/* Key Update & Allocation Dialog */}
      <KeyUpdateDialog
        keyRecord={selectedKeyForEdit}
        open={Boolean(selectedKeyForEdit)}
        onOpenChange={(open) => {
          if (!open) setSelectedKeyForEdit(null)
        }}
      />
    </div>
  )
}
