import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router'
import { Search, KeyRound, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@workspace/ui/components/input-group'
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
          <Badge variant="secondary" className="self-start sm:self-auto font-semibold">
            {t('keys.totalKeys', { count: allKeys.length })}
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      {allKeys.length > 0 && (
        <InputGroup className="max-w-md h-9">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('keys.searchPlaceholder')}
          />
        </InputGroup>
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
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>{t('common.error', 'An error occurred')}</AlertTitle>
          <AlertDescription>
            Failed to load your digital keys. Please try again.
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

      {/* Empty Vault State */}
      {!isLoading && !isError && allKeys.length === 0 && (
        <Empty className="rounded-xl border border-border bg-card p-10">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="size-16 rounded-full bg-muted mb-4">
              <KeyRound className="size-8 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle className="text-base sm:text-lg font-semibold">
              {t('keys.emptyTitle')}
            </EmptyTitle>
            <EmptyDescription className="max-w-md text-xs sm:text-sm">
              {t('keys.emptyDesc')}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="mt-4">
            <Button render={<Link to={`/${lang}/products`} />}>
              <span>{t('orders.browseCatalog')}</span>
            </Button>
          </EmptyContent>
        </Empty>
      )}

      {/* Search No Results */}
      {!isLoading && !isError && allKeys.length > 0 && keys.length === 0 && (
        <Empty className="rounded-xl border border-border bg-card p-8">
          <EmptyHeader>
            <EmptyDescription className="text-sm">
              {t('keys.noResults')}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
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
