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
  AlertCircle,
} from 'lucide-react'
import {
  AUDIT_TARGET_TYPES,
  type AuditLogResponse,
} from '@workspace/domain/schemas/audit'
import { formatDate } from '@workspace/domain/formatters/date'
import type { GetAuditLogsParams } from '@workspace/api/services/audit-service'
import { Alert, AlertDescription } from '@workspace/ui/components/alert'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
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
import { useAuditLogs, useExportAuditLogs } from '../features/audit/hooks/use-audit-logs'
import { useAdminDirectory } from '../features/profile/hooks/use-admin-directory'
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

type OutcomeFilter = 'all' | 'success' | 'failed'

function formatTargetTypeLabel(value: string): string {
  return value
    .split(/[_-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return
  if (typeof URL.createObjectURL !== 'function') return
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function AdminAuditRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [searchQuery, setSearchQuery] = React.useState('')
  const [adminFilter, setAdminFilter] = React.useState<string>('all')
  const [targetFilter, setTargetFilter] = React.useState<string>('all')
  const [outcomeFilter, setOutcomeFilter] = React.useState<OutcomeFilter>('all')
  const [startDate, setStartDate] = React.useState<string>('')
  const [endDate, setEndDate] = React.useState<string>('')
  const [selectedLog, setSelectedLog] = React.useState<AuditLogResponse | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)

  const isInvalidDateRange = Boolean(startDate && endDate && startDate > endDate)

  const sharedFilterParams = React.useMemo<Omit<GetAuditLogsParams, 'page' | 'limit'>>(() => {
    const params: Omit<GetAuditLogsParams, 'page' | 'limit'> = {}
    if (adminFilter !== 'all') params.adminId = adminFilter
    if (targetFilter !== 'all') params.targetType = targetFilter
    if (outcomeFilter === 'success') params.success = true
    else if (outcomeFilter === 'failed') params.success = false
    if (!isInvalidDateRange && startDate) params.startDate = `${startDate}T00:00:00Z`
    if (!isInvalidDateRange && endDate) params.endDate = `${endDate}T23:59:59Z`
    return params
  }, [adminFilter, targetFilter, outcomeFilter, startDate, endDate, isInvalidDateRange])

  const { data: logs, isLoading, isError, error, refetch, isFetching, isPlaceholderData } =
    useAuditLogs({
      limit: 100,
      ...sharedFilterParams,
    })

  const { data: adminsDirectory } = useAdminDirectory({ limit: 100 })
  const exportMutation = useExportAuditLogs()

  const logsList = logs?.items

  const adminFilterItems = React.useMemo(() => {
    const admins = adminsDirectory || []
    return [
      { value: 'all', label: t('admin:audit.allAdmins', 'All Staff') },
      ...admins.map((admin) => ({
        value: admin.id,
        label: admin.display_name,
      })),
    ]
  }, [adminsDirectory, t])

  const targetFilterItems = React.useMemo(() => {
    const combined = new Set<string>(AUDIT_TARGET_TYPES)
    for (const log of logsList || []) {
      if (log.target_type) combined.add(log.target_type)
    }
    return [
      { value: 'all', label: t('admin:audit.allTargetTypes', 'All Target Types') },
      ...Array.from(combined).map((type) => ({
        value: type,
        label: formatTargetTypeLabel(type),
      })),
    ]
  }, [logsList, t])

  const outcomeFilterItems = React.useMemo(
    () => [
      { value: 'all', label: t('admin:audit.allOutcomes', 'All Outcomes') },
      { value: 'success', label: t('admin:audit.outcomeSuccess', 'Succeeded') },
      { value: 'failed', label: t('admin:audit.outcomeFailed', 'Failed') },
    ],
    [t],
  )

  const filteredLogs = React.useMemo(() => {
    const items = logsList || []
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase().trim()
    return items.filter(
      (l) =>
        l.action.toLowerCase().includes(query) ||
        l.admin_name.toLowerCase().includes(query) ||
        l.target_type.toLowerCase().includes(query) ||
        l.target_id.toLowerCase().includes(query),
    )
  }, [logsList, searchQuery])

  const activeFilterChips = React.useMemo(() => {
    const chips: ActiveFilterChipItem[] = []
    if (searchQuery.trim()) {
      chips.push({
        id: 'search',
        label: `"${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      })
    }
    if (adminFilter !== 'all') {
      const matched = adminFilterItems.find((item) => item.value === adminFilter)
      chips.push({
        id: 'admin',
        label: matched ? matched.label : adminFilter.slice(0, 8),
        onRemove: () => setAdminFilter('all'),
      })
    }
    if (targetFilter !== 'all') {
      chips.push({
        id: 'target',
        label: formatTargetTypeLabel(targetFilter),
        onRemove: () => setTargetFilter('all'),
      })
    }
    if (outcomeFilter !== 'all') {
      chips.push({
        id: 'outcome',
        label:
          outcomeFilter === 'success'
            ? t('admin:audit.outcomeSuccess', 'Succeeded')
            : t('admin:audit.outcomeFailed', 'Failed'),
        onRemove: () => setOutcomeFilter('all'),
      })
    }
    if (startDate || endDate) {
      chips.push({
        id: 'dates',
        label: `${startDate || '…'} → ${endDate || '…'}`,
        onRemove: () => {
          setStartDate('')
          setEndDate('')
        },
      })
    }
    return chips
  }, [searchQuery, adminFilter, adminFilterItems, targetFilter, outcomeFilter, startDate, endDate, t])

  const handleResetAllFilters = () => {
    setSearchQuery('')
    setAdminFilter('all')
    setTargetFilter('all')
    setOutcomeFilter('all')
    setStartDate('')
    setEndDate('')
  }

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<AuditLogResponse>(
    filteredLogs,
    { column: 'created_at', direction: 'desc' },
  )

  const pagination = useDataTablePagination(sortedItems, { defaultPageSize: 10 })
  const { resetPage } = pagination

  React.useEffect(() => {
    resetPage()
  }, [searchQuery, adminFilter, targetFilter, outcomeFilter, startDate, endDate, resetPage])

  const handleOpenDetail = (log: AuditLogResponse) => {
    setSelectedLog(log)
    setDetailDialogOpen(true)
  }

  const handleExport = async (format: 'csv' | 'json') => {
    if (isInvalidDateRange) return
    try {
      const blob = await exportMutation.mutateAsync({
        format,
        ...sharedFilterParams,
      })
      triggerBlobDownload(blob, `audit-logs.${format}`)
    } catch {
      // Handled cleanly by useAdminMutation feedback
    }
  }

  const hasAnyServerFilter =
    adminFilter !== 'all' ||
    targetFilter !== 'all' ||
    outcomeFilter !== 'all' ||
    Boolean(startDate) ||
    Boolean(endDate)

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
          onClick={() => handleExport('json')}
          disabled={exportMutation.isPending || isInvalidDateRange}
          className="gap-2 h-9 text-xs font-medium cursor-pointer"
        >
          <Download className="size-3.5" />
          <span>{t('admin:audit.exportJson', 'Export JSON')}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('csv')}
          disabled={exportMutation.isPending || isInvalidDateRange}
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

      {/* Toolbar & Filters */}
      <div className="space-y-4">
        <DataTableToolbar
          search={
            <DataTableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('admin:audit.searchPlaceholder', 'Filter by action, staff name, or target...')}
            />
          }
          filters={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                items={adminFilterItems}
                value={adminFilter}
                onValueChange={(val) => setAdminFilter(val ?? 'all')}
              >
                <SelectTrigger
                  aria-label={t('admin:audit.allAdmins', 'All Staff')}
                  className="h-8 text-xs min-w-[140px] max-w-[190px] cursor-pointer bg-background border-border/70"
                >
                  <SelectValue placeholder={t('admin:audit.allAdmins', 'All Staff')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {adminFilterItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                items={targetFilterItems}
                value={targetFilter}
                onValueChange={(val) => setTargetFilter(val ?? 'all')}
              >
                <SelectTrigger
                  aria-label={t('admin:audit.allTargetTypes', 'All Target Types')}
                  className="h-8 text-xs min-w-[140px] max-w-[190px] cursor-pointer bg-background border-border/70"
                >
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

              <Select
                items={outcomeFilterItems}
                value={outcomeFilter}
                onValueChange={(val) => setOutcomeFilter((val as OutcomeFilter) ?? 'all')}
              >
                <SelectTrigger
                  aria-label={t('admin:audit.allOutcomes', 'All Outcomes')}
                  className="h-8 text-xs min-w-[130px] max-w-[170px] cursor-pointer bg-background border-border/70"
                >
                  <SelectValue placeholder={t('admin:audit.allOutcomes', 'All Outcomes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {outcomeFilterItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1.5">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  aria-label={t('admin:audit.startDate', 'From date')}
                  className="h-8 w-[140px] text-xs bg-background border-border/70"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  aria-label={t('admin:audit.endDate', 'To date')}
                  className="h-8 w-[140px] text-xs bg-background border-border/70"
                />
              </div>
            </div>
          }
          activeFilters={
            <DataTableActiveFilters
              chips={activeFilterChips}
              onClearAll={handleResetAllFilters}
            />
          }
        />

        {isInvalidDateRange && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              {t('admin:audit.invalidDateRange', 'Start date must be before or equal to end date.')}
            </AlertDescription>
          </Alert>
        )}

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
                  {t(
                    'admin:audit.tableDesc',
                    'Audit events record staff identity, IP address, outcome, and timestamp.',
                  )}
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
              (logsList?.length || 0) === 0 && !hasAnyServerFilter ? (
                <div className="p-8">
                  <EmptyState
                    icon={ShieldAlert}
                    title={t('admin:audit.emptyTitle', 'No activity logs found')}
                    description={t(
                      'admin:audit.emptyDesc',
                      'Staff actions and inventory changes will be recorded here.',
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
                          column="success"
                          title={t('admin:audit.status', 'Outcome')}
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
                      <TableRow
                        key={log.id}
                        className="border-border/40 hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="ps-4 pe-3 py-3.5 font-mono text-xs font-semibold text-start">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono border-border/60 bg-muted/40"
                          >
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
                        <TableCell className="px-3 py-3.5 text-xs text-start">
                          <Badge
                            variant={log.success ? 'secondary' : 'destructive'}
                            className="text-[10px] font-medium"
                          >
                            {log.success
                              ? t('admin:audit.outcomeSuccess', 'Succeeded')
                              : t('admin:audit.outcomeFailed', 'Failed')}
                          </Badge>
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
                              <span>{t('admin:audit.viewPayload', 'Details')}</span>
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
                  <span className="text-muted-foreground block text-[11px]">
                    {t('admin:audit.operator', 'Staff Member')}:
                  </span>{' '}
                  <span className="font-mono font-medium">{selectedLog.admin_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {t('admin:audit.ipAddress', 'IP')}:
                  </span>{' '}
                  <span className="font-mono font-medium">{selectedLog.ip_address || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {t('admin:audit.status', 'Outcome')}:
                  </span>{' '}
                  <Badge
                    variant={selectedLog.success ? 'secondary' : 'destructive'}
                    className="text-[10px] mt-0.5"
                  >
                    {selectedLog.success
                      ? t('admin:audit.outcomeSuccess', 'Succeeded')
                      : t('admin:audit.outcomeFailed', 'Failed')}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Log ID:</span>{' '}
                  <span className="font-mono font-medium">{selectedLog.id.slice(0, 8)}</span>
                </div>
              </div>

              {selectedLog.failure_reason && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>
                    <span className="font-semibold me-1">
                      {t('admin:audit.failureReason', 'Failure Reason')}:
                    </span>
                    {selectedLog.failure_reason}
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    {t('admin:audit.previousValue', 'Previous Value')}
                  </FieldLabel>
                  <pre className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-80">
                    {selectedLog.old_value
                      ? JSON.stringify(selectedLog.old_value, null, 2)
                      : t('admin:audit.noPayload', '// No changes recorded')}
                  </pre>
                </div>
                <div>
                  <FieldLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    {t('admin:audit.detailsPayload', 'New Value')}
                  </FieldLabel>
                  <pre className="rounded-lg border border-border bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-80">
                    {selectedLog.new_value
                      ? JSON.stringify(selectedLog.new_value, null, 2)
                      : t('admin:audit.noPayload', '// No changes recorded')}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
