import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  ShieldAlert,
  Search,
  Download,
  Eye,
  RefreshCw,
  Terminal,
} from 'lucide-react'
import {
  useAuditLogs,
  useExportAuditLogs,
} from '../features/audit/hooks/use-audit-logs'
import { type AuditLogResponse } from '@workspace/domain/schemas/audit'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
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
import { EmptyState } from '../features/dashboard/components/empty-state'
import { AdminPageHeader } from '../components/admin-page-header'

export function AdminAuditRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedLog, setSelectedLog] = React.useState<AuditLogResponse | null>(null)
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)

  const { data: logs, isLoading, refetch, isFetching } = useAuditLogs({ limit: 100 })
  const exportMutation = useExportAuditLogs()

  const logsList = logs?.items

  const filteredLogs = React.useMemo(() => {
    const items = logsList || []
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase().trim()
    return items.filter(
      (l) =>
        l.action.toLowerCase().includes(query) ||
        l.admin_name.toLowerCase().includes(query) ||
        l.target_type.toLowerCase().includes(query) ||
        l.target_id.toLowerCase().includes(query)
    )
  }, [logsList, searchQuery])

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
        title={t('admin:audit.title', 'Security & Audit Log')}
        description={t('admin:audit.subtitle', 'Append-only tamper-evident record of all operator mutations and access events')}
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

      {/* Streamlined Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('admin:audit.searchPlaceholder', 'Filter by action, operator name, or target...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 h-9 text-xs sm:text-sm bg-muted/30 border-border/70 focus-visible:bg-background transition-colors"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:audit.tableTitle', 'Operator Audit Trail')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({filteredLogs.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:audit.tableDesc', 'Zero-trust audit events are signed with operator identity and IP address.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center text-sm font-mono text-muted-foreground">
                {t('admin:common.loading', 'Loading audit trail...')}
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={ShieldAlert}
                  title={t('admin:audit.emptyTitle', 'No audit logs found')}
                  description={t(
                    'admin:audit.emptyDesc',
                    'Security and mutation events will be recorded here.'
                  )}
                />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.action', 'Action')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.operator', 'Operator')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.resource', 'Target')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.ipAddress', 'IP')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:audit.timestamp', 'Date')}</TableHead>
                    <TableHead className="text-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:common.actions', 'Details')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-start py-3.5">
                        <Badge variant="outline" className="text-[10px] font-mono border-border/60 bg-muted/40">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-start font-mono text-foreground font-medium py-3.5">
                        {log.admin_name}
                      </TableCell>
                      <TableCell className="text-xs text-start py-3.5">
                        <span className="font-semibold text-foreground">{log.target_type}</span>
                        <span className="ms-1.5 font-mono text-muted-foreground text-[10px]">
                          ({log.target_id.slice(0, 8)})
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-start text-muted-foreground py-3.5">
                        {log.ip_address || '—'}
                      </TableCell>
                      <TableCell className="text-xs text-start text-muted-foreground font-mono py-3.5">
                        {new Date(log.created_at).toLocaleString(
                          lang === 'ar' ? 'ar-EG' : 'en-US',
                          {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          }
                        )}
                      </TableCell>
                      <TableCell className="text-end py-3.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(log)}
                          className="h-7 gap-1 text-xs font-medium cursor-pointer hover:text-foreground"
                        >
                          <Eye className="size-3" />
                          <span>{t('admin:audit.viewPayload', 'Payload')}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payload JSON Inspector Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-xl">
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
              <div className="grid grid-cols-2 gap-2 text-xs border border-border rounded-lg p-3 bg-muted/30">
                <div>
                  <span className="text-muted-foreground">Operator:</span>{' '}
                  <span className="font-mono font-medium">{selectedLog.admin_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">IP Address:</span>{' '}
                  <span className="font-mono font-medium">{selectedLog.ip_address || '—'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Timestamp:</span>{' '}
                  <span className="font-mono font-medium">{selectedLog.created_at}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Log ID:</span>{' '}
                  <span className="font-mono font-medium">{selectedLog.id}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {t('admin:audit.detailsPayload', 'Changes (New Value)')}
                </label>
                <pre className="rounded-lg border border-border bg-muted/60 p-3 font-mono text-xs overflow-x-auto max-h-64">
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
