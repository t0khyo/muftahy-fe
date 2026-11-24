import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LifeBuoy,
  Clock,
  ShieldCheck,
  MessageSquare,
  Copy,
  Tag,
  KeyRound,
} from 'lucide-react'
import { useAdminTickets } from '../features/tickets/hooks/use-tickets'
import { type TicketStatus, type TicketDetail } from '@workspace/domain/schemas/ticket'
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
import { TicketResolveDialog } from '../features/tickets/components/ticket-resolve-dialog'
import { AdminTicketChatSheet } from '../features/tickets/components/admin-ticket-chat-sheet'
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

const STATUS_FILTERS: { label: string; value: TicketStatus | 'all' }[] = [
  { label: 'All Tickets', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Closed', value: 'closed' },
]

export function AdminTicketsRoute() {
  const { lang = 'en' } = useParams<{ lang: string }>()
  const { t } = useTranslation(['admin'])

  const [selectedStatus, setSelectedStatus] = React.useState<TicketStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = React.useState('')
  const [resolveDialogOpen, setResolveDialogOpen] = React.useState(false)
  const [activeTicketId, setActiveTicketId] = React.useState<string | null>(null)
  const [chatSheetOpen, setChatSheetOpen] = React.useState(false)
  const [activeChatTicketId, setActiveChatTicketId] = React.useState<string | null>(null)

  const { data: tickets, isLoading } = useAdminTickets(
    selectedStatus === 'all' ? undefined : selectedStatus
  )

  const filteredTickets = React.useMemo(() => {
    const items = tickets || []
    if (!searchQuery.trim()) return items
    const query = searchQuery.toLowerCase().trim()
    return items.filter(
      (t) =>
        t.id.toLowerCase().includes(query) ||
        t.key_serial.toLowerCase().includes(query) ||
        t.order_item_id.toLowerCase().includes(query)
    )
  }, [tickets, searchQuery])

  const { sortedItems, sortConfig, toggleSort } = useDataTableSort<TicketDetail>(
    filteredTickets,
    { column: 'created_at', direction: 'desc' },
    {
      comments_count: (t) => t.comments.length,
    }
  )

  const pagination = useDataTablePagination(sortedItems, { defaultPageSize: 10 })
  const { resetPage } = pagination

  React.useEffect(() => {
    resetPage()
  }, [searchQuery, selectedStatus, resetPage])

  const handleOpenResolve = (id: string) => {
    setActiveTicketId(id)
    setResolveDialogOpen(true)
  }

  const handleOpenChat = (id: string) => {
    setActiveChatTicketId(id)
    setChatSheetOpen(true)
  }

  const activeFilterChips = React.useMemo(() => {
    const chips: ActiveFilterChipItem[] = []
    if (searchQuery.trim()) {
      chips.push({
        id: 'search',
        label: `"${searchQuery.trim()}"`,
        onRemove: () => setSearchQuery(''),
      })
    }
    if (selectedStatus !== 'all') {
      const statusItem = STATUS_FILTERS.find((s) => s.value === selectedStatus)
      chips.push({
        id: 'status',
        label: statusItem ? statusItem.label : selectedStatus,
        onRemove: () => setSelectedStatus('all'),
      })
    }
    return chips
  }, [searchQuery, selectedStatus])

  const handleResetAllFilters = () => {
    setSearchQuery('')
    setSelectedStatus('all')
  }

  const getStatusBadgeVariant = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return 'destructive'
      case 'in_progress':
        return 'secondary'
      case 'resolved':
      case 'closed':
        return 'default'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="space-y-6 text-start w-full">
      {/* Header */}
      <AdminPageHeader
        title={t('admin:tickets.title', 'Customer Support')}
        description={t('admin:tickets.subtitle', 'Manage customer tickets, issue replacement keys, and process refunds')}
      />

      {/* Streamlined Toolbar & Tickets Table */}
      <div className="space-y-4">
        <DataTableToolbar
          search={
            <DataTableSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('admin:tickets.searchPlaceholder', 'Search ticket ID, serial, or item ID...')}
            />
          }
          views={
            <Tabs
              value={selectedStatus}
              onValueChange={(val) => {
                if (val) setSelectedStatus(val as TicketStatus | 'all')
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
          }
          activeFilters={
            <DataTableActiveFilters
              chips={activeFilterChips}
              onClearAll={handleResetAllFilters}
            />
          }
        />

        {/* Tickets Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:tickets.queueTitle', 'Support Tickets')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({filteredTickets.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:tickets.queueDesc', 'Resolve customer requests. Approving a replacement allocates a key from inventory.')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 text-center text-sm font-mono text-muted-foreground">
                {t('admin:common.loading', 'Loading tickets...')}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  icon={LifeBuoy}
                  title={t('admin:tickets.emptyTitle', 'No tickets found')}
                  description={t(
                    'admin:tickets.emptyDesc',
                    'There are currently no customer dispute tickets matching your criteria.'
                  )}
                />
              </div>
            ) : (
              <>
                <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="ps-4 pe-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="id"
                        title={t('admin:tickets.ticketId', 'Ticket ID')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="order_item_id"
                        title={t('admin:tickets.orderItem', 'Item ID')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-start">
                      <DataTableColumnHeader
                        column="key_serial"
                        title={t('admin:tickets.serial', 'Defective Serial')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-center">
                      <DataTableColumnHeader
                        column="status"
                        title={t('admin:tickets.status', 'Status')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="center"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-center">
                      <DataTableColumnHeader
                        column="comments_count"
                        title={t('admin:tickets.comments', 'Comments')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="center"
                      />
                    </TableHead>
                    <TableHead className="px-3 py-3.5 text-end">
                      <DataTableColumnHeader
                        column="created_at"
                        title={t('admin:tickets.created', 'Created At')}
                        sortConfig={sortConfig}
                        onSort={toggleSort}
                        align="end"
                      />
                    </TableHead>
                    <TableHead className="ps-3 pe-4 py-3.5 text-center w-44 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                      {t('admin:common.actions', 'Actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedItems.map((ticket) => {
                    const isClosed = ticket.status === 'closed' || ticket.status === 'resolved'

                    return (
                      <TableRow key={ticket.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                        <TableCell className="ps-4 pe-3 py-3.5 font-mono text-xs font-bold text-start text-foreground">
                          #{ticket.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="px-3 py-3.5 font-mono text-xs text-start text-muted-foreground">
                          #{ticket.order_item_id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="px-3 py-3.5 font-mono text-xs text-start">
                          <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40">{ticket.key_serial}</span>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-center">
                          <Badge
                            variant={getStatusBadgeVariant(ticket.status)}
                            className="capitalize text-[10px] font-mono tracking-tight"
                          >
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            onClick={() => handleOpenChat(ticket.id)}
                            className="h-6 px-2 gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer inline-flex items-center justify-center"
                            aria-label={`${ticket.comments.length} comments. Open dispute chat.`}
                          >
                            <MessageSquare className="size-3 text-primary" />
                            <span className="tabular-nums font-semibold">{ticket.comments.length}</span>
                          </Button>
                        </TableCell>
                        <TableCell className="px-3 py-3.5 text-end text-xs text-muted-foreground font-mono tabular-nums">
                          {formatDate(ticket.created_at, {
                            locale: lang,
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </TableCell>
                        <TableCell className="ps-3 pe-4 py-3.5 text-center">
                          <div className="inline-flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenChat(ticket.id)}
                              className="h-7 gap-1 text-xs font-medium cursor-pointer"
                            >
                              <MessageSquare className="size-3 text-primary" />
                              <span>{t('admin:ticketsModule.chat', 'Chat')}</span>
                            </Button>
                            <Button
                              variant={isClosed ? 'ghost' : 'default'}
                              size="sm"
                              onClick={() => handleOpenResolve(ticket.id)}
                              className="h-7 gap-1.5 text-xs font-medium cursor-pointer"
                            >
                              {isClosed ? (
                                <>
                                  <ShieldCheck className="size-3" />
                                  <span>{t('admin:ticketsModule.viewOutcome', 'View Outcome')}</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="size-3" />
                                  <span>{t('admin:tickets.resolveTicket', 'Resolve')}</span>
                                </>
                              )}
                            </Button>
                            <DataTableRowActions
                              items={[
                                {
                                  label: t('admin:tickets.copyId', 'Copy Ticket ID'),
                                  icon: Copy,
                                  onClick: () => navigator.clipboard.writeText(ticket.id),
                                },
                                {
                                  label: t('admin:tickets.copySerial', 'Copy Defective Serial'),
                                  icon: KeyRound,
                                  onClick: () => navigator.clipboard.writeText(ticket.key_serial),
                                },
                                {
                                  label: t('admin:tickets.copyItem', 'Copy Order Item ID'),
                                  icon: Tag,
                                  onClick: () => navigator.clipboard.writeText(ticket.order_item_id),
                                  separatorBefore: true,
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
              {filteredTickets.length > 0 && (
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

      {/* Ticket Resolve Dialog */}
      <TicketResolveDialog
        ticketId={activeTicketId}
        open={resolveDialogOpen}
        onOpenChange={setResolveDialogOpen}
      />

      {/* Ticket Chat & Dispute Workstation Sheet */}
      <AdminTicketChatSheet
        ticketId={activeChatTicketId}
        open={chatSheetOpen}
        onOpenChange={setChatSheetOpen}
        onOpenResolve={(id) => {
          setChatSheetOpen(false)
          handleOpenResolve(id)
        }}
      />
    </div>
  )
}
