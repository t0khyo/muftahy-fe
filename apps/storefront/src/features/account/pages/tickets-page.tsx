import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import {
  LifeBuoy,
  Plus,
  MessageSquare,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  KeyRound,
} from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Card } from '@workspace/ui/components/card'
import { Skeleton } from '@workspace/ui/components/skeleton'
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from '@workspace/ui/components/alert'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@workspace/ui/components/empty'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@workspace/ui/components/toggle-group'
import { formatDate } from '@workspace/domain/formatters/date'
import { useTicketsList } from '../hooks/use-tickets'
import { TicketStatusBadge } from '../components/support/ticket-status-badge'
import { OpenTicketDialog } from '../components/support/open-ticket-dialog'

type TicketFilterTab = 'all' | 'open' | 'resolved'

export function TicketsPage() {
  const { t } = useTranslation('account')
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const { tickets, isLoading, isError, refetch } = useTicketsList()
  const [activeTab, setActiveTab] = useState<TicketFilterTab>('all')
  const [openTicketModal, setOpenTicketModal] = useState(false)

  const filteredTickets = useMemo(() => {
    if (activeTab === 'open') {
      return tickets.filter((tk) => ['open', 'in_progress'].includes(tk.status))
    }
    if (activeTab === 'resolved') {
      return tickets.filter((tk) => ['resolved', 'closed'].includes(tk.status))
    }
    return tickets
  }, [tickets, activeTab])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {t('support.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('support.description')}
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setOpenTicketModal(true)}
          className="gap-1.5 self-start sm:self-auto text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>{t('support.openTicket')}</span>
        </Button>
      </div>

      {/* Filter Tabs using shadcn ToggleGroup */}
      <ToggleGroup
        value={[activeTab]}
        onValueChange={(val) => {
          if (val.length > 0) {
            setActiveTab(val[val.length - 1] as TicketFilterTab)
          }
        }}
        variant="outline"
        className="w-fit"
      >
        <ToggleGroupItem value="all" className="text-xs sm:text-sm">
          {t('support.all')} ({tickets.length})
        </ToggleGroupItem>
        <ToggleGroupItem value="open" className="text-xs sm:text-sm">
          {t('support.open')}
        </ToggleGroupItem>
        <ToggleGroupItem value="resolved" className="text-xs sm:text-sm">
          {t('support.resolved')}
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t('common.error', 'An error occurred')}</AlertTitle>
          <AlertDescription>
            Failed to load support tickets. Please try again.
          </AlertDescription>
          <AlertAction>
            <Button
              variant="outline"
              size="xs"
              onClick={() => refetch()}
              className="gap-1.5"
            >
              <RefreshCw className="size-3.5" />
              <span>{t('common.retry', 'Try again')}</span>
            </Button>
          </AlertAction>
        </Alert>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredTickets.length === 0 && (
        <Empty className="rounded-xl border border-border bg-card p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-full bg-muted mb-4">
              <LifeBuoy className="size-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle className="text-base sm:text-lg font-semibold">
              {t('support.emptyTitle')}
            </EmptyTitle>
            <EmptyDescription className="max-w-md text-xs sm:text-sm">
              {t('support.emptyDesc')}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="mt-4 flex flex-row gap-3">
            <Button
              variant="outline"
              size="sm"
              render={<Link to={`/${lang}/account/keys`} />}
              className="gap-1.5"
            >
              <KeyRound className="h-4 w-4" />
              <span>{t('support.goToVault')}</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setOpenTicketModal(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>{t('support.openTicket')}</span>
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {/* Tickets List */}
      {!isLoading && !isError && filteredTickets.length > 0 && (
        <div className="space-y-3.5">
          {filteredTickets.map((tk) => {
            const formattedDate = formatDate(tk.created_at, {
              locale: lang,
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })

            return (
              <Card
                key={tk.id}
                className="p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs sm:text-sm font-semibold text-foreground">
                        {t('support.ticketNumber', { id: tk.id.slice(0, 8) })}
                      </span>
                      <TicketStatusBadge status={tk.status} />
                    </div>

                    <div className="font-mono text-xs text-muted-foreground">
                      {t('support.keySerial', { serial: tk.key_serial })}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{t('support.createdOn', { date: formattedDate })}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {t('support.commentsCount', { count: tk.comments.length })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <Button
                      variant="secondary"
                      size="sm"
                      render={<Link to={`/${lang}/account/support/${tk.id}`} />}
                      className="gap-1 text-xs sm:text-sm"
                    >
                      <span>{t('orders.viewDetails')}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 rtl:rotate-180" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* New Ticket Modal */}
      <OpenTicketDialog
        open={openTicketModal}
        onOpenChange={setOpenTicketModal}
      />
    </div>
  )
}
