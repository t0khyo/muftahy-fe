import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LifeBuoy,
  Search,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { useAdminTickets } from '../features/tickets/hooks/use-tickets'
import { type TicketStatus } from '@workspace/domain/schemas/ticket'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table'
import { TicketResolveDialog } from '../features/tickets/components/ticket-resolve-dialog'
import { EmptyState } from '../features/dashboard/components/empty-state'

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

  const handleOpenResolve = (id: string) => {
    setActiveTicketId(id)
    setResolveDialogOpen(true)
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-mono font-medium mb-2">
            <span className="size-1.5 rounded-full bg-primary" />
            <span>Disputes & Claims</span>
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl text-foreground">
            {t('admin:tickets.title', 'Customer Dispute Tickets')}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t('admin:tickets.subtitle', 'Adjudicate defective key claims, replacement dispatches, and refund concessions')}
          </p>
        </div>
      </div>

      {/* Streamlined Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={t('admin:tickets.searchPlaceholder', 'Search ticket ID, serial, or item ID...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 h-9 text-xs sm:text-sm bg-muted/30 border-border/70 focus-visible:bg-background transition-colors"
            />
          </div>

          {/* Segmented Status Rail */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {STATUS_FILTERS.map((tab) => {
              const isSelected = selectedStatus === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setSelectedStatus(tab.value)}
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
        </div>

        {/* Tickets Table */}
        <Card className="border-border/80 shadow-none overflow-hidden">
          <CardHeader className="p-4 pb-3 text-start border-b border-border/40 bg-muted/10">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold tracking-tight">
                  {t('admin:tickets.queueTitle', 'Dispute Queue')}
                  <span className="ms-2 font-mono text-xs font-normal text-muted-foreground tabular-nums">
                    ({filteredTickets.length} {t('admin:common.records', 'records')})
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">
                  {t('admin:tickets.queueDesc', 'Strict SLA adjudication. Every replacement issues a new key from inventory.')}
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
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:tickets.ticketId', 'Ticket ID')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:tickets.orderItem', 'Item ID')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:tickets.serial', 'Defective Serial')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:tickets.status', 'Status')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:tickets.comments', 'Comments')}</TableHead>
                    <TableHead className="text-start font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:tickets.created', 'Created At')}</TableHead>
                    <TableHead className="text-end font-mono text-[11px] uppercase tracking-wider text-muted-foreground py-3">{t('admin:common.actions', 'Actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => {
                    const isClosed = ticket.status === 'closed' || ticket.status === 'resolved'

                    return (
                      <TableRow key={ticket.id} className="border-border/40 hover:bg-muted/20 transition-colors">
                        <TableCell className="font-mono text-xs font-bold text-start text-foreground py-3.5">
                          #{ticket.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-start text-muted-foreground py-3.5">
                          #{ticket.order_item_id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-start py-3.5">
                          <span className="font-semibold text-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/40">{ticket.key_serial}</span>
                        </TableCell>
                        <TableCell className="text-start py-3.5">
                          <Badge
                            variant={getStatusBadgeVariant(ticket.status)}
                            className="capitalize text-[10px] font-mono tracking-tight"
                          >
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-start text-xs font-mono text-muted-foreground py-3.5">
                          {ticket.comments.length}
                        </TableCell>
                        <TableCell className="text-xs text-start text-muted-foreground font-mono py-3.5">
                          {new Date(ticket.created_at).toLocaleString(
                            lang === 'ar' ? 'ar-EG' : 'en-US',
                            {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-end py-3.5">
                          <Button
                            variant={isClosed ? 'ghost' : 'default'}
                            size="sm"
                            onClick={() => handleOpenResolve(ticket.id)}
                            className="h-7 gap-1.5 text-xs font-medium cursor-pointer"
                          >
                            {isClosed ? (
                              <>
                                <ShieldCheck className="size-3" />
                                <span>{t('admin:tickets.viewResolution', 'View Outcome')}</span>
                              </>
                            ) : (
                              <>
                                <Clock className="size-3" />
                                <span>{t('admin:tickets.resolveTicket', 'Resolve')}</span>
                              </>
                            )}
                          </Button>
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

      {/* Ticket Resolve Dialog */}
      <TicketResolveDialog
        ticketId={activeTicketId}
        open={resolveDialogOpen}
        onOpenChange={setResolveDialogOpen}
      />
    </div>
  )
}
