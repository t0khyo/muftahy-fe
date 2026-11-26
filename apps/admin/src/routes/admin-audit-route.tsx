import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ShieldAlert,
  Download,
  Eye,
  RefreshCw,
  Terminal,
  Copy,
  Tag,
} from 'lucide-react'
import {
  useAuditLogs,
  useExportAuditLogs,
} from '../features/audit/hooks/use-audit-logs'
import { type AuditLogResponse } from '@workspace/domain/schemas/audit'
import { formatDate } from '@workspace/domain/formatters/date'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { FieldLabel } from '@workspace/ui/components/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
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

export function AdminAuditRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [searchQuery, setSearchQuery] = React.useState('')
  const [targetFilter, setTargetFilter] = React.useState<string>('all')
  const [selectedLog, setSelectedLog] = React.useState<AuditLogResponse | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)

  const { data: logs, isLoading, isError, error, refetch, isFetching, isPlaceholderData } =
    useAuditLogs({ limit: 100 })
  const exportMutation = useExportAuditLogs()

  const logsList = logs?.items

  const targetFilterItems = React.useMemo(() => {
    const types = Array.from(new Set((logsList || []).map((l) => l.target_type).filter(Boolean)))
    return [
      { value: 'all', label: t('admin:audit.allTargetTypes', 'All Target Types') },
      ...types.map((type) => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1),
      })),
    ]
  }, [logsList, t])

  const filteredLogs = React.useMemo(() => {
    let items = logsList || []
    if (targetFilter !== 'all') {
      items = items.filter((l) => l.target_type.toLowerCase() === targetFilter.toLowerCase())
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      items = items.filter(
        (l) =>
          l.action.toLowerCase().includes(query) ||
          l.admin_name.toLowerCase().includes(query) ||
          l.target_type.toLowerCase().includes(query) ||
          l.target_id.toLowerCase().includes(query)
      )
    }
    return items
  }, [logsList, targetFilter, searchQuery])

  const activeFilterChips = React.useMemo(() => {
    const chips: ActiveFilterChipItem[] = []
    if (searchQuery.trim()) {
      chips.push({
        id: 'search',
        label: `"${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      })
    }
    if (targetFilter !== 'all') {
      chips.push({
        id: 'target',
        label: targetFilter.charAt(0).toUpperCase() + targetFilter.slice(1),
        onRemove: () => setTargetFilter('all'),
      })
    }
    return chips
  }, [searchQuery, targetFilter])

  const handleResetAllFilters = () => {
    setSearchQuery('')
    setTargetFilter('all')
  }

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<AuditLogResponse>(
    filteredLogs,
    { column: 'created_at', direction: 'desc' }
  )

  const pagination = useDataTablePagination(sortedItems, { defaultPageSize: 10 })
  const { resetPage } = pagination

  React.useEffect(() => {
    resetPage()
  }, [searchQuery, targetFilter, resetPage])

  const handleOpenDetail = (log: AuditLogResponse) => {
    setSelectedLog(log)
    setDetailDialogOpen(true)
  }

  const handleExportCsv = () => {
    exportMutation.mutate({})
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:audit.title', 'Audit Log')}
        description={t('admin:audit.subtitle', 'Track staff actions, inventory changes, and security events')}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2 h-9 text-xs font-medium cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          <span>{t('admin:audit.refresh', 'Refresh')}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          disabled={exportMutation.isPending}
          className="gap-2 h-9 text-xs font-medium cursor-pointer"
        >
          <Download className="size-3.5" />
          <span>
            {exportMutation.isPending
              ? t('admin:audit.exporting', 'Exporting...')
              : t('admin:audit.exportCsv', 'Export CSV')}
          </span>
        </Button>
      </AdminPageHeader>

      {/* Streamlined Toolbar & Audit Log Table */}
      <div className="space-y-4">
        <DataTableToolbar
          search={
            <DataTableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('admin:audit.searchPlaceholder', 'Filter by action, operator name, or target...')}
            />
          }
          filters={
            <Select
              items={targetFilterItems}
              value={targetFilter}
              onValueChange={(val) => setTargetFilter(val ?? 'all')}
            >
              <SelectTrigger className="h-8 text-xs min-w-[150px] max-w-[200px] cursor-pointer bg-background border-border/70">
                <SelectValue
                  placeholder={t('admin:audit.allTargetTypes', 'All Target Types')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {targetFilterItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          }
          activeFilters={
            <DataTableActiveFilters
              chips={activeFilterChips}
              onClearAll={handleResetAllFilters}
            />
          }
        />

        {/* Audit Log Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:audit.tableTitle', 'Activity Log')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({filteredLogs.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:audit.tableDesc', 'Audit events record user identity, IP address, and timestamp.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isError && (!logs || isPlaceholderData) ? (
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
                {t('admin:common.loading', 'Loading activity log...')}
              </div>
            ) : filteredLogs.length === 0 ? (
              (logsList?.length || 0) === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={ShieldAlert}
                    title={t('admin:audit.emptyTitle', 'No activity logs found')}
                    description={t(
                      'admin:audit.emptyDesc',
                      'Staff actions and inventory changes will be recorded here.'
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
                        column="action"
                        title={t('admin:audit.action', 'Action')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="admin_name"
                        title={t('admin:audit.operator', 'Staff Member')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="target_type"
                        title={t('admin:audit.resource', 'Target')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="ip_address"
                        title={t('admin:audit.ipAddress', 'IP')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="created_at"
                        title={t('admin:audit.timestamp', 'Date')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="ps-3 pe-4 py-3.5 text-center w-36 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t('admin:common.actions', 'Details')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedItems.map((log) => (
                    <TableRow key={log.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                      <TableCell className="ps-4 pe-3 py-3.5 font-mono text-xs font-semibold text-start">
                        <Badge variant="outline" className="text-[10px] font-mono border-border/60 bg-muted/40">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-3 py-3.5 text-xs text-start font-mono text-foreground font-medium">
                        {log.admin_name}
                      </TableCell>
                      <TableCell className="px-3 py-3.5 text-xs text-start">
                        <span className="font-semibold text-foreground">{log.target_type}</span>
                        <span className="ms-1.5 font-mono text-muted-foreground text-[10px]">
                          ({log.target_id.slice(0, 8)})
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-3.5 font-mono text-xs text-start text-muted-foreground">
                        {log.ip_address || '—'}
                      </TableCell>
                      <TableCell className="px-3 py-3.5 text-xs text-end text-muted-foreground font-mono tabular-nums">
                        {formatDate(log.created_at, {
                          locale: lang,
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell className="ps-3 pe-4 py-3.5 text-center">
                        <div className="inline-flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDetail(log)}
                            className="h-7 gap-1 text-xs font-medium cursor-pointer hover:text-foreground"
                          >
                            <Eye className="size-3" />
                            <span>{t('admin:audit.viewPayload', 'Payload')}</span>
                          </Button>
                          <DataTableRowActions
                            items={[
                              {
                                label: t('admin:audit.copyTargetId', 'Copy Target ID'),
                                icon: Tag,
                                onClick: () => navigator.clipboard.writeText(log.target_id),
                              },
                              {
                                label: t('admin:audit.copyIp', 'Copy IP Address'),
                                icon: Copy,
                                onClick: () => navigator.clipboard.writeText(log.ip_address || ''),
                              },
                            ]}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredLogs.length > 0 && (
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

      {/* Payload JSON Inspector Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-3xl p-6">
          <DialogHeader className="text-start">
            <div className="flex items-center gap-2">
              <Terminal className="size-5 text-primary" />
              <DialogTitle className="text-lg font-heading">
                {t('admin:audit.payloadTitle', 'Audit Log Snapshot')}
              </DialogTitle>
            </div>
            <DialogDescription>
              {selectedLog?.action} — {selectedLog?.target_type}{' '}
              {selectedLog?.target_id ? `(${selectedLog.target_id})` : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-border rounded-lg p-3.5 bg-muted/30">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Operator:</span>{' '}
                  <span className="font-mono font-medium">{selectedLog.admin_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">IP Address:</span>{' '}
                  <span className="font-mono font-medium">{selectedLog.ip_address || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Timestamp:</span>{' '}
                  <span className="font-mono font-medium">{selectedLog.created_at}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Log ID:</span>{' '}
                  <span className="font-mono font-medium">{selectedLog.id.slice(0, 8)}</span>
                </div>
              </div>

              <div>
                <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  {t('admin:audit.detailsPayload', 'Changes (New Value)')}
                </FieldLabel>
                <pre className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-96">
                  {selectedLog.new_value
                    ? JSON.stringify(selectedLog.new_value, null, 2)
                    : '// No mutation payload'}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
