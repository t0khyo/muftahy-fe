import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import { EmptyState } from '../features/dashboard/components/empty-state'

export function AdminCustomersRoute() {
  const { t } = useTranslation(['admin'])

  return (
    <div className="space-y-6 text-start">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {t('admin:nav.customers', 'Customer Accounts')}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {t('admin:emptyState.customers.description')}
        </p>
      </div>

      <EmptyState
        icon={Users}
        title={t('admin:emptyState.customers.title', 'No customer accounts yet')}
        description={t(
          'admin:emptyState.customers.description',
          'Registered buyer accounts, transaction histories, and security statuses will appear here.'
        )}
      />
    </div>
  )
}

