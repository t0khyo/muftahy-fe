import { useTranslation } from 'react-i18next'
import { Button } from '@workspace/ui/components/button'
import type { Product, ProductListFilter } from '@workspace/domain/schemas/product'
import { useProducts } from '../hooks/use-products'
import { ProductCard } from './product-card'

export interface ProductGridProps {
  filter?: ProductListFilter
  onAddToCart?: (product: Product) => void
}

export function ProductGrid({ filter, onAddToCart }: ProductGridProps) {
  const { t } = useTranslation(['products', 'common'])
  const { data: products, isLoading, isError, refetch } = useProducts({ filter })

  if (isLoading) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center p-8 text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        <span>{t('loading', { ns: 'common' })}</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className="flex min-h-[300px] flex-col items-center justify-center gap-4 p-8 text-center"
        role="alert"
      >
        <p className="text-destructive">{t('error', { ns: 'common' })}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('retry', { ns: 'common' })}
        </Button>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-8 text-muted-foreground">
        <p>{t('noProductsFound', { ns: 'products' })}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}

