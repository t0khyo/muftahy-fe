import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  KeyRound,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Filter,
} from 'lucide-react'
import {
  useInventoryKeys,
  useProductStockSummary,
} from '../features/inventory/hooks/use-inventory'
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
import { MaskedKeyReveal } from '../features/inventory/components/masked-key-reveal'
import { KeyBatchImportSheet } from '../features/inventory/components/key-batch-import-sheet'
import { EmptyState } from '../features/dashboard/components/empty-state'

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

  const { data: stockSummary } = useProductStockSummary()
  const { data: keyData, isLoading } = useInventoryKeys({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  })

  const keys = keyData || []

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
    <div className="space-y-6 text-start max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t('admin:inventory.title', 'Key Pool Inventory')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('admin:inventory.subtitle', 'Zero-knowledge activation key repository and batch ingestion vault')}
          </p>
        </div>
        <Button
          onClick={() => setImportSheetOpen(true)}
          className="gap-2 shrink-0 cursor-pointer shadow-xs"
        >
          <Upload className="size-4" />
          <span>{t('admin:inventory.ingestBatch', 'Ingest Key Batch')}</span>
        </Button>
      </div>

      {/* Stock Health Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:inventory.totalKeys', 'Total Tracked')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Archive className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all product pools</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:inventory.availableKeys', 'Available in Vault')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {stats.available}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Ready for automated delivery</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:inventory.soldKeys', 'Fulfilled / Dispatched')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <KeyRound className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{stats.sold}</div>
            <p className="text-xs text-muted-foreground mt-1">Associated with completed orders</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('admin:inventory.reportedKeys', 'Reported Defective')}
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {stats.reported}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Requires supplier replacement</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <Filter className="size-3.5 text-muted-foreground me-1 shrink-0" />
            {STATUS_FILTERS.map((tab) => (
              <Button
                key={tab.value}
                variant={selectedStatus === tab.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(tab.value)}
                className="h-8 text-xs cursor-pointer shrink-0"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Keys Table */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2 text-start">
          <CardTitle className="text-base font-semibold">
            {t('admin:inventory.keysTableTitle', 'Vault Records')}
            <span className="ms-2 font-mono text-xs font-normal text-muted-foreground">
              ({keys.length} {t('admin:common.records', 'records')})
            </span>
          </CardTitle>
          <CardDescription>
            {t('admin:inventory.keysTableDesc', 'Keys are encrypted on the backend. Reveal requests are logged in the audit trail.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {t('admin:common.loading', 'Loading encrypted key repository...')}
            </div>
          ) : keys.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={KeyRound}
                title={t('admin:inventory.emptyTitle', 'No keys found')}
                description={t(
                  'admin:inventory.emptyDesc',
                  'No keys match the chosen filter. Use Ingest Key Batch to stock your pools.'
                )}
                actionLabel={t('admin:inventory.ingestBatch', 'Ingest Key Batch')}
                onAction={() => setImportSheetOpen(true)}
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('admin:inventory.keyId', 'Key ID')}</TableHead>
                  <TableHead className="text-start">{t('admin:inventory.product', 'Product')}</TableHead>
                  <TableHead className="text-start">{t('admin:inventory.activationCode', 'Activation Code')}</TableHead>
                  <TableHead className="text-start">{t('admin:inventory.status', 'Status')}</TableHead>
                  <TableHead className="text-start">{t('admin:inventory.pool', 'Pool Type')}</TableHead>
                  <TableHead className="text-end">{t('admin:inventory.created', 'Ingested At')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((keyRecord) => (
                  <TableRow key={keyRecord.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="font-mono text-xs font-semibold text-start">
                      #{keyRecord.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-start text-muted-foreground">
                      {keyRecord.product_name || keyRecord.product_id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="text-start">
                      <MaskedKeyReveal serial={keyRecord.serial} />
                    </TableCell>
                    <TableCell className="text-start">
                      <Badge
                        variant={getKeyBadgeVariant(keyRecord.status)}
                        className="capitalize text-[10px]"
                      >
                        {keyRecord.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-start">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {keyRecord.replacement_only ? 'Replacement' : 'Standard'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-end text-muted-foreground">
                      {new Date(keyRecord.created_at).toLocaleString(
                        lang === 'ar' ? 'ar-EG' : 'en-US',
                        {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        }
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Ingestion Sheet */}
      <KeyBatchImportSheet
        open={importSheetOpen}
        onOpenChange={setImportSheetOpen}
      />
    </div>
  )
}
