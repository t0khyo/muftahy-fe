import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { Search, KeyRound, AlertCircle, RefreshCw } from 'lucide-react'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { Skeleton } from '@workspace/ui/components/skeleton'
import type { UserKey } from '@workspace/domain/schemas/key'
import { useUserKeys } from '../hooks/use-keys'
import { KeyVaultCard } from '../components/keys/key-vault-card'
import { OpenTicketDialog } from '../components/support/open-ticket-dialog'

export function KeysPage() {
  const { t } = useTranslation('account')
  const { lang = 'ar' } = useParams<{ lang: string }>()
  const [search, setSearch] = useState('')
  const { keys, allKeys, isLoading, isError, refetch } = useUserKeys(search)

  const [ticketDialogOpen, setTicketDialogOpen] = useState(false)
  const [selectedKeyForTicket, setSelectedKeyForTicket] = useState<UserKey | null>(null)

  const handleReportIssue = (userKey: UserKey) => {
    setSelectedKeyForTicket(userKey)
    setTicketDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {t('keys.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t('keys.description')}
          </p>
        </div>

        {allKeys.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary self-start sm:self-auto">
            {t('keys.totalKeys', { count: allKeys.length })}
          </span>
        )}
      </div>

      {/* Search Bar */}
      {allKeys.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('keys.searchPlaceholder')}
            className="ps-9"
          />
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
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
            Failed to load your digital keys. Please try again.
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

      {/* Empty Vault State */}
      {!isLoading && !isError && allKeys.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-10 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <KeyRound className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-heading text-base sm:text-lg font-semibold text-foreground">
            {t('keys.emptyTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 max-w-md">
            {t('keys.emptyDesc')}
          </p>
          <Button className="mt-5" render={<Link to={`/${lang}/products`} />}>
            <span>{t('orders.browseCatalog')}</span>
          </Button>
        </div>
      )}

      {/* Search No Results */}
      {!isLoading && !isError && allKeys.length > 0 && keys.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">{t('keys.noResults')}</p>
        </div>
      )}

      {/* Keys List */}
      {!isLoading && !isError && keys.length > 0 && (
        <div className="space-y-4">
          {keys.map((k) => (
            <KeyVaultCard
              key={k.key_id}
              userKey={k}
              onReportIssue={handleReportIssue}
            />
          ))}
        </div>
      )}

      {/* Dialog for Reporting Key Issue */}
      {selectedKeyForTicket && (
        <OpenTicketDialog
          open={ticketDialogOpen}
          onOpenChange={setTicketDialogOpen}
          keySerial={selectedKeyForTicket.serial}
          productName={selectedKeyForTicket.product_name}
        />
      )}
    </div>
  )
}

