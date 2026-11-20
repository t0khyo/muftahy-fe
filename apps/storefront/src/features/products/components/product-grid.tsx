import { useTranslation } from 'react-i18next'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import type { ProductResponse } from '@workspace/domain/schemas/product'
import { useProducts, type ProductCatalogFilters } from '../hooks/use-products'
import { ProductCard } from './product-card'
import { ProductCardSkeleton } from './product-card-skeleton'

export interface ProductGridProps {
  products?: ProductResponse[]
  filter?: ProductCatalogFilters
  onAddToCart?: (product: ProductResponse) => void
  className?: string
  priorityCount?: number
}

export function ProductGrid({
  products: directProducts,
  filter,
  onAddToCart,
  className,
  priorityCount = 4,
}: ProductGridProps) {
  const { t } = useTranslation(['products', 'common'])
  const { data: resultProducts, isLoading, isError, refetch } = useProducts(filter)

  const products = directProducts ?? resultProducts

  if (directProducts === undefined && isLoading) {
    return (
      <div
        className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-5', className)}
        role="status"
        aria-live="polite"
        aria-label={t('loading', { ns: 'common' })}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (directProducts === undefined && isError) {
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
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-5', className)}>
      {products.map((product, idx) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={idx < priorityCount}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}
