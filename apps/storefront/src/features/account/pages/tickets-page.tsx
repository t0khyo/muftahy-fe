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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 rounded-xl bg-muted/60 p-1 border border-border/50 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-[0.98] ${
            activeTab === 'all'
              ? 'bg-card text-foreground font-semibold shadow-xs dark:bg-card/90'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('support.all')} ({tickets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('open')}
          className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-[0.98] ${
            activeTab === 'open'
              ? 'bg-card text-foreground font-semibold shadow-xs dark:bg-card/90'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('support.open')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('resolved')}
          className={`rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all active:scale-[0.98] ${
            activeTab === 'resolved'
              ? 'bg-card text-foreground font-semibold shadow-xs dark:bg-card/90'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('support.resolved')}
        </button>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <h3 className="font-heading text-base font-semibold text-foreground">
            {t('common.error', 'An error occurred')}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Failed to load support tickets. Please try again.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="mt-4 gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>{t('common.retry', 'Try again')}</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && filteredTickets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <LifeBuoy className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground">
            {t('support.emptyTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md">
            {t('support.emptyDesc')}
          </p>
          <div className="flex gap-3 mt-5">
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
          </div>
        </div>
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
                    <Link
                      to={`/${lang}/account/support/${tk.id}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-muted px-3 py-2 text-xs sm:text-sm font-medium text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>{t('orders.viewDetails')}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 rtl:rotate-180" />
                    </Link>
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

