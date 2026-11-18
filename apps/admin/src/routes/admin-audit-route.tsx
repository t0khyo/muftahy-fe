import { useTranslation } from 'react-i18next'
import { ShieldAlert, RefreshCw } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { EmptyState } from '../features/dashboard/components/empty-state'

export function AdminAuditRoute() {
  const { t } = useTranslation(['admin'])

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t('admin:nav.audit', 'Security & Audit Log')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('admin:emptyState.audit.description')}
          </p>
        </div>
        <Button variant="outline" className="gap-2 shrink-0">
          <RefreshCw className="size-4" />
          <span>{t('admin:emptyState.audit.action', 'Refresh Log')}</span>
        </Button>
      </div>

      <EmptyState
        icon={ShieldAlert}
        title={t('admin:emptyState.audit.title', 'No audit records found')}
        description={t(
          'admin:emptyState.audit.description',
          'Immutable security logs, zero-trust session checks, and operator actions will be logged here.'
        )}
        actionLabel={t('admin:emptyState.audit.action', 'Refresh Log')}
      />
    </div>
  )
}

