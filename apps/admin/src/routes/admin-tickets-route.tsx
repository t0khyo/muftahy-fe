import * as React from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  LifeBuoy,
  Search,
  Filter,
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
    <div className="space-y-6 text-start max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t('admin:tickets.title', 'Customer Dispute Tickets')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('admin:tickets.subtitle', 'Adjudicate defective key claims, replacement dispatches, and refund concessions')}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="border-border">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute start-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={t('admin:tickets.searchPlaceholder', 'Search ticket ID, serial, or item ID...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 h-9 text-sm"
              />
            </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card className="border-border">
        <CardHeader className="p-4 pb-2 text-start">
          <CardTitle className="text-base font-semibold">
            {t('admin:tickets.queueTitle', 'Dispute Queue')}
            <span className="ms-2 font-mono text-xs font-normal text-muted-foreground">
              ({filteredTickets.length} {t('admin:common.records', 'records')})
            </span>
          </CardTitle>
          <CardDescription>
            {t('admin:tickets.queueDesc', 'Strict SLA adjudication. Every replacement issues a new key from inventory.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
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
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">{t('admin:tickets.ticketId', 'Ticket ID')}</TableHead>
                  <TableHead className="text-start">{t('admin:tickets.orderItem', 'Item ID')}</TableHead>
                  <TableHead className="text-start">{t('admin:tickets.serial', 'Defective Serial')}</TableHead>
                  <TableHead className="text-start">{t('admin:tickets.status', 'Status')}</TableHead>
                  <TableHead className="text-start">{t('admin:tickets.comments', 'Comments')}</TableHead>
                  <TableHead className="text-start">{t('admin:tickets.created', 'Created At')}</TableHead>
                  <TableHead className="text-end">{t('admin:common.actions', 'Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => {
                  const isClosed = ticket.status === 'closed' || ticket.status === 'resolved'

                  return (
                    <TableRow key={ticket.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="font-mono text-xs font-semibold text-start">
                        #{ticket.id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-start text-muted-foreground">
                        #{ticket.order_item_id.slice(0, 8)}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-start">
                        <span className="font-medium text-foreground">{ticket.key_serial}</span>
                      </TableCell>
                      <TableCell className="text-start">
                        <Badge
                          variant={getStatusBadgeVariant(ticket.status)}
                          className="capitalize text-[10px]"
                        >
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-start text-xs font-mono text-muted-foreground">
                        {ticket.comments.length}
                      </TableCell>
                      <TableCell className="text-xs text-start text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleString(
                          lang === 'ar' ? 'ar-EG' : 'en-US',
                          {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          }
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant={isClosed ? 'ghost' : 'default'}
                          size="sm"
                          onClick={() => handleOpenResolve(ticket.id)}
                          className="h-7 gap-1.5 text-xs cursor-pointer"
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

      {/* Ticket Resolve Dialog */}
      <TicketResolveDialog
        ticketId={activeTicketId}
        open={resolveDialogOpen}
        onOpenChange={setResolveDialogOpen}
      />
    </div>
  )
}
