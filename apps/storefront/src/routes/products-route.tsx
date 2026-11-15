import { useTranslation } from 'react-i18next'
import { ProductGrid } from '../features/products/components/product-grid'

export function ProductsRoute() {
  const { t } = useTranslation(['products'])

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mb-8 space-y-2 text-start">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('title', { ns: 'products' })}
        </h1>
        <p className="text-base text-muted-foreground">
          {t('subtitle', { ns: 'products' })}
        </p>
      </div>

      <ProductGrid />
    </div>
  )
}

