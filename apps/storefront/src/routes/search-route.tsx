import { useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useProducts } from '../features/products/hooks/use-products'
import { ProductCard } from '../features/products/components/product-card'
import { ProductCardSkeleton } from '../features/products/components/product-card-skeleton'

export function SearchRoute() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { t } = useTranslation(['search', 'common'])

  const { data: products, isLoading } = useProducts({
    filter: query ? { search: query } : undefined,
    enabled: true,
  })

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-1 text-start">
        <h1 className="font-heading text-heading font-bold text-foreground">
          {t('title', { ns: 'search' })}
        </h1>
        {query && (
          <p className="text-body text-muted-foreground">
            {t('resultsFor', { ns: 'search', query })}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          <p>{t('noResults', { ns: 'search', query })}</p>
        </div>
      )}
    </div>
  )
}

