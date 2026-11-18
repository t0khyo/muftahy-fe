import { useTranslation } from 'react-i18next'
import { PackageCheck, Plus } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { EmptyState } from '../features/dashboard/components/empty-state'

export function AdminProductsRoute() {
  const { t } = useTranslation(['admin'])

  return (
    <div className="space-y-6 text-start">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {t('admin:nav.products', 'Products & SKUs')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('admin:emptyState.products.description')}
          </p>
        </div>
        <Button className="gap-2 shrink-0">
          <Plus className="size-4" />
          <span>{t('admin:emptyState.products.action', 'Add Product')}</span>
        </Button>
      </div>

      <EmptyState
        icon={PackageCheck}
        title={t('admin:emptyState.products.title', 'No products yet')}
        description={t(
          'admin:emptyState.products.description',
          'Create and manage your catalog of digital game codes, software licenses, and gift cards.'
        )}
        actionLabel={t('admin:emptyState.products.action', 'Add Product')}
      />
    </div>
  )
}

