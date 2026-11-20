import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { PackageOpen } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import type { ProductCategory } from '@workspace/domain/schemas/product'
import { Breadcrumbs, type BreadcrumbItem } from '../components/breadcrumbs'
import { useProducts } from '../features/products/hooks/use-products'
import { calculateFilterCounts } from '../features/products/hooks/use-filter-counts'
import { useProductFilters } from '../features/products/hooks/use-product-filters'
import { CategoryRow } from '../features/products/components/category-row'
import { FilterSidebar } from '../features/products/components/filter-sidebar'
import { FilterSheet } from '../features/products/components/filter-sheet'
import { ListingToolbar } from '../features/products/components/listing-toolbar'
import { ProductCard } from '../features/products/components/product-card'
import { ProductCardSkeleton } from '../features/products/components/product-card-skeleton'

export function ProductsRoute() {
  const { t, i18n } = useTranslation(['products', 'breadcrumb', 'common'])
  const isRtl = i18n.language === 'ar'
  const currentLang = isRtl ? 'ar' : 'en'

  const {
    state,
    queryFilter,
    activeFiltersCount,
    setCategory,
    setVariant,
    setStockStatus,
    setInStockOnly,
    setSort,
    clearAll,
  } = useProductFilters()

  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false)

  // Fetch products matching the current filter state
  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useProducts(queryFilter)

  // Calculate facet counts directly from catalog
  const counts = React.useMemo(() => calculateFilterCounts(products), [products])

  const total = products.length

  const selectedCategory = state.category

  const categoryLabels: Record<ProductCategory, string> = React.useMemo(
    () => ({
      windows: t('categories.windows', { ns: 'products', defaultValue: 'Windows' }),
      office: t('categories.office', { ns: 'products', defaultValue: 'Office' }),
    }),
    [t],
  )

  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    const items: BreadcrumbItem[] = [
      {
        label: t('home', { ns: 'breadcrumb', defaultValue: 'Home' }),
        href: `/${currentLang}`,
      },
      {
        label: t('products', { ns: 'breadcrumb', defaultValue: 'Products' }),
        href: selectedCategory ? `/${currentLang}/products` : undefined,
        current: !selectedCategory,
      },
    ]

    if (selectedCategory) {
      items.push({
        label: categoryLabels[selectedCategory] || selectedCategory,
        current: true,
      })
    }

    return items
  }, [t, currentLang, selectedCategory, categoryLabels])

  const { heading, subline } = React.useMemo(() => {
    if (queryFilter.search) {
      return {
        heading: t('listing.titleSearch', { ns: 'products', query: queryFilter.search }),
        subline:
          total === 1
            ? t('listing.resultCountOne', { ns: 'products', count: total, defaultValue: '1 product found' })
            : t('listing.resultCount', { ns: 'products', count: total, defaultValue: `${total} products found` }),
      }
    }

    if (selectedCategory) {
      return {
        heading: categoryLabels[selectedCategory] || selectedCategory,
        subline: t('subtitle', { ns: 'products' }),
      }
    }

    return {
      heading: t('listing.title', { ns: 'products', defaultValue: 'All Products' }),
      subline: t('subtitle', {
        ns: 'products',
        defaultValue: 'Instant digital delivery for genuine Microsoft Windows and Office licenses',
      }),
    }
  }, [queryFilter.search, selectedCategory, total, categoryLabels, t])

  return (
    <div className="site-container py-6 lg:py-10">
      <Breadcrumbs
        items={breadcrumbItems}
        label={t('label', { ns: 'breadcrumb', defaultValue: 'Breadcrumb' })}
        backHref={selectedCategory ? `/${currentLang}/products` : undefined}
        backLabel={t('back', { ns: 'breadcrumb', defaultValue: 'Back to products' })}
      />

      <header className="mb-6 lg:mb-8 text-start max-w-3xl">
        <h1
          className={cn(
            'text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground leading-tight',
            !isRtl && 'tracking-tight',
          )}
        >
          {heading}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2.5 leading-relaxed max-w-2xl">
          {subline}
        </p>
      </header>

      <CategoryRow activeCategory={selectedCategory} />

      {/* Mobile Toolbar */}
      <div className="lg:hidden mb-6">
        <ListingToolbar
          totalResults={total}
          state={state}
          activeFiltersCount={activeFiltersCount}
          onSortChange={setSort}
          onRemoveVariant={() => setVariant(undefined)}
          onRemoveStockStatus={() => setStockStatus(undefined)}
          onRemoveInStockOnly={() => setInStockOnly(false)}
          onClearAll={clearAll}
          onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        />
      </div>

      <div className="flex items-start gap-8">
        {/* Desktop Sidebar */}
        <FilterSidebar
          state={state}
          counts={counts}
          activeFiltersCount={activeFiltersCount}
          onSetCategory={setCategory}
          onSetVariant={setVariant}
          onSetStockStatus={setStockStatus}
          onSetInStockOnly={setInStockOnly}
          onClearAll={clearAll}
          className="hidden lg:flex w-64 shrink-0"
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          <ListingToolbar
            totalResults={total}
            state={state}
            activeFiltersCount={activeFiltersCount}
            onSortChange={setSort}
            onRemoveVariant={() => setVariant(undefined)}
            onRemoveStockStatus={() => setStockStatus(undefined)}
            onRemoveInStockOnly={() => setInStockOnly(false)}
            onClearAll={clearAll}
            onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
            className="hidden lg:flex"
          />

          {isLoading && (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-5"
              role="status"
              aria-live="polite"
              aria-label={t('loading', { ns: 'common', defaultValue: 'Loading products...' })}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!isLoading && isError && (
            <div
              role="alert"
              className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center"
            >
              <p className="text-sm text-destructive">
                {t('listing.errorRetry', { defaultValue: 'Something went wrong. Try again.' })}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} className="cursor-pointer">
                {t('retry', { ns: 'common', defaultValue: 'Try again' })}
              </Button>
            </div>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <div
              role="status"
              className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-2xl border border-border/40 bg-card p-8 text-center"
            >
              <PackageOpen className="size-12 text-muted-foreground/60" aria-hidden="true" />
              <div className="space-y-1 max-w-sm">
                <h3 className="font-semibold text-foreground text-base">
                  {t('listing.noResults', { defaultValue: 'No products match your filters' })}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('listing.noResultsHint', {
                    defaultValue: 'Try clearing some filters or browse by category',
                  })}
                </p>
              </div>
              {activeFiltersCount > 0 && (
                <Button variant="outline" size="sm" onClick={clearAll} className="mt-2 cursor-pointer">
                  {t('listing.clearAll', { defaultValue: 'Clear all' })}
                </Button>
              )}
            </div>
          )}

          {!isLoading && !isError && products.length > 0 && (
            <div
              className={cn(
                'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-5 transition-opacity duration-200',
                isFetching && 'opacity-60',
              )}
            >
              {products.map((product, idx) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={idx < 6}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Sheet */}
      <FilterSheet
        open={isMobileFilterOpen}
        onOpenChange={setIsMobileFilterOpen}
        state={state}
        counts={counts}
        totalResults={total}
        activeFiltersCount={activeFiltersCount}
        onSetCategory={setCategory}
        onSetVariant={setVariant}
        onSetStockStatus={setStockStatus}
        onSetInStockOnly={setInStockOnly}
        onClearAll={clearAll}
      />
    </div>
  )
}
