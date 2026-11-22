import { useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { SearchX } from 'lucide-react'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@workspace/ui/components/empty'
import { useProducts } from '../features/products/hooks/use-products'
import { ProductCard } from '../features/products/components/product-card'
import { ProductCardSkeleton } from '../features/products/components/product-card-skeleton'

export function SearchRoute() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const { t } = useTranslation(['search', 'common'])

  const { data: products = [], isLoading } = useProducts(query ? { search: query } : undefined)

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6">
      <div className="mb-6 space-y-1 text-start">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          {t('title', { ns: 'search', defaultValue: 'Search Products' })}
        </h1>
        {query && (
          <p className="text-sm text-muted-foreground">
            {t('resultsFor', { ns: 'search', query, defaultValue: `Results for "${query}"` })}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Empty className="min-h-[240px] rounded-2xl border border-dashed border-border p-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX className="size-6 text-muted-foreground" />
            </EmptyMedia>
            <EmptyTitle>
              {t('noResults', { ns: 'search', query, defaultValue: 'No products found' })}
            </EmptyTitle>
            {query && (
              <EmptyDescription>
                {t('tryDifferentKeywords', {
                  ns: 'search',
                  defaultValue: 'Try searching with different keywords.',
                })}
              </EmptyDescription>
            )}
          </EmptyHeader>
        </Empty>
      )}
    </div>
  )
}
