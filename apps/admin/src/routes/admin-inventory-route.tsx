import { useTranslation } from 'react-i18next'
import { KeyRound, Upload } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { EmptyState } from '../features/dashboard/components/empty-state'

export function AdminInventoryRoute() {
  const { t } = useTranslation(['admin'])

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t('admin:nav.inventory', 'Key Pool Inventory')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('admin:emptyState.inventory.description')}
          </p>
        </div>
        <Button className="gap-2 shrink-0">
          <Upload className="size-4" />
          <span>{t('admin:emptyState.inventory.action', 'Ingest Key Batch')}</span>
        </Button>
      </div>

      <EmptyState
        icon={KeyRound}
        title={t('admin:emptyState.inventory.title', 'Key pool repository is empty')}
        description={t(
          'admin:emptyState.inventory.description',
          'Securely ingest batches of encrypted activation codes into the automated delivery vault.'
        )}
        actionLabel={t('admin:emptyState.inventory.action', 'Ingest Key Batch')}
      />
    </div>
  )
}

