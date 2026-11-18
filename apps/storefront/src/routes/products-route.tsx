import * as React from 'react'
import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import type { ProductCategory } from '@workspace/domain/schemas/product'
import { Breadcrumbs, type BreadcrumbItem } from '../components/breadcrumbs'
import { useProducts } from '../features/products/hooks/use-products'
import { useFilterCounts } from '../features/products/hooks/use-filter-counts'
import { useProductFilters } from '../features/products/hooks/use-product-filters'
import { CategoryRow } from '../features/products/components/category-row'
import { FilterSidebar } from '../features/products/components/filter-sidebar'
import { FilterSheet } from '../features/products/components/filter-sheet'
import { ListingToolbar } from '../features/products/components/listing-toolbar'
import { ProductCard } from '../features/products/components/product-card'
import { ProductCardSkeleton } from '../features/products/components/product-card-skeleton'

export function ProductsRoute() {
  const { t, i18n } = useTranslation(['categories', 'breadcrumb', 'products', 'common', 'home'])
  const isRtl = i18n.language === 'ar'
  const currentLang = isRtl ? 'ar' : 'en'

  const {
    state,
    queryFilter,
    activeFiltersCount,
    togglePlatform,
    toggleRegion,
    setPriceRange,
    setInStock,
    setOnSale,
    setSort,
    setPage,
    clearAll,
    removeFilter,
  } = useProductFilters()

  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false)

  // Fetch products matching the current filter state
  const {
    data: result,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useProducts({
    filter: queryFilter,
  })

  // Fetch filter faceted counts from catalog
  const { data: counts } = useFilterCounts()

  const products = result?.items ?? []
  const total = result?.total ?? 0
  const hasMore = Boolean(result?.hasMore)

  // Ref to track and shift focus when "Show more" is loaded
  const [focusTargetIndex, setFocusTargetIndex] = React.useState<number | null>(null)
  const nextItemFocusRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (focusTargetIndex !== null && nextItemFocusRef.current) {
      nextItemFocusRef.current.focus()
      setFocusTargetIndex(null)
    }
  }, [focusTargetIndex, products.length])

  // Single-selected category
  const selectedCategory: ProductCategory | undefined =
    state.categories.length === 1 ? state.categories[0] : undefined

  // Category labels map for dynamic title & breadcrumbs
  const categoryLabels: Record<ProductCategory, string> = React.useMemo(
    () => ({
      games: t('games', { ns: 'categories', defaultValue: 'Games' }),
      software: t('software', { ns: 'categories', defaultValue: 'Software' }),
      subscriptions: t('subscriptions', { ns: 'categories', defaultValue: 'Subscriptions' }),
      'gift-cards': t('giftCards', { ns: 'categories', defaultValue: 'Gift cards' }),
    }),
    [t],
  )

  // Category descriptors map for dynamic subline
  const categorySublines: Record<ProductCategory, string> = React.useMemo(
    () => ({
      games: t('browse.gamesDesc', { ns: 'home', defaultValue: 'Steam keys, PC licenses, and console game passes' }),
      software: t('browse.softwareDesc', { ns: 'home', defaultValue: 'Operating systems, office suites, and creative tools' }),
      subscriptions: t('browse.subscriptionsDesc', { ns: 'home', defaultValue: 'Gaming passes, cloud storage, and AI assistants' }),
      'gift-cards': t('browse.giftCardsDesc', { ns: 'home', defaultValue: 'Store credit, wallet top-ups, and game currency' }),
    }),
    [t],
  )

  // Breadcrumbs items: Home > Products > {Category}
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

  // Dynamic heading & subline computation
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
        subline: categorySublines[selectedCategory] || t('listing.subtitle', { ns: 'products' }),
      }
    }

    return {
      heading: t('listing.title', { ns: 'products', defaultValue: 'All Products' }),
      subline: t('listing.subtitle', {
        ns: 'products',
        defaultValue: 'Browse our full catalog of digital keys, software, and subscriptions',
      }),
    }
  }, [queryFilter.search, selectedCategory, total, categoryLabels, categorySublines, t])

  const handleShowMore = () => {
    setFocusTargetIndex(products.length)
    setPage(state.page + 1)
  }

  // Quick categories for empty state
  const quickCategories: { id: ProductCategory; label: string }[] = [
    { id: 'software', label: categoryLabels.software },
    { id: 'subscriptions', label: categoryLabels.subscriptions },
    { id: 'gift-cards', label: categoryLabels['gift-cards'] },
    { id: 'games', label: categoryLabels.games },
  ]

  return (
    <div className="site-container py-6 lg:py-10">
      {/* ── Breadcrumbs Trail (Reusable navigation component) ── */}
      <Breadcrumbs
        items={breadcrumbItems}
        label={t('label', { ns: 'breadcrumb', defaultValue: 'Breadcrumb' })}
        backHref={selectedCategory ? `/${currentLang}/products` : undefined}
        backLabel={t('back', { ns: 'breadcrumb', defaultValue: 'Back to products' })}
      />

      {/* ── Page Header: Apple-store large typography ── */}
      <header className="mb-6 lg:mb-8 text-start max-w-3xl">
        <h1
          className={cn(
            'text-[28px] sm:text-3xl lg:text-[40px] font-semibold text-foreground leading-tight',
            // AGENTS.md: No tracking-tight on Arabic
            !isRtl && 'tracking-tight',
          )}
        >
          {heading}
        </h1>
        <p className="text-sm lg:text-[17px] text-muted-foreground mt-2 leading-relaxed">
          {subline}
        </p>
      </header>

      {/* ── Compact Category Row: Single-select category control ── */}
      <CategoryRow activeCategory={selectedCategory} />

      {/* ── Mobile Sticky Toolbar (attached under site header) ── */}
      <div className="lg:hidden sticky top-[56px] z-20 bg-background/95 backdrop-blur-xs -mx-4 px-4 sm:-mx-6 sm:px-6 py-2.5 mb-6 border-b border-border/40">
        <ListingToolbar
          totalResults={total}
          state={state}
          activeFiltersCount={activeFiltersCount}
          onSortChange={setSort}
          onRemoveFilter={removeFilter}
          onClearAll={clearAll}
          onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        />
      </div>

      {/* ── Main Layout: Sidebar + Product Grid ── */}
      <div className="flex items-start gap-8">
        {/* Desktop 256px Sidebar (Category facet removed) */}
        <FilterSidebar
          state={state}
          counts={counts}
          activeFiltersCount={activeFiltersCount}
          onTogglePlatform={togglePlatform}
          onToggleRegion={toggleRegion}
          onSetPriceRange={setPriceRange}
          onSetInStock={setInStock}
          onSetOnSale={setOnSale}
          onClearAll={clearAll}
          className="hidden lg:flex"
        />

        {/* Content Area */}
        <main className="flex-1 min-w-0 flex flex-col gap-6">
          {/* Desktop Toolbar */}
          <ListingToolbar
            totalResults={total}
            state={state}
            activeFiltersCount={activeFiltersCount}
            onSortChange={setSort}
            onRemoveFilter={removeFilter}
            onClearAll={clearAll}
            onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
            className="hidden lg:flex"
          />

          {/* 1 ── Loading State ── */}
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

          {/* 2 ── Error State with Retry ── */}
          {!isLoading && isError && (
            <div
              role="alert"
              className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-destructive/30 bg-destructive/5 p-8 text-center"
            >
              <p className="text-base font-medium text-destructive">
                {t('listing.errorRetry', {
                  ns: 'products',
                  defaultValue: 'Something went wrong. Try again.',
                })}
              </p>
              <Button variant="outline" onClick={() => refetch()} className="rounded-full px-6">
                {t('retry', { ns: 'common', defaultValue: 'Retry' })}
              </Button>
            </div>
          )}

          {/* 3 ── No Results State ── */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-secondary/20 p-8 sm:p-12 text-center">
              <h3 className="text-lg font-semibold text-foreground">
                {t('listing.noResults', {
                  ns: 'products',
                  defaultValue: 'No products match your filters',
                })}
              </h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
                {t('listing.noResultsHint', {
                  ns: 'products',
                  defaultValue: 'Try clearing some filters or browse by category',
                })}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="default"
                    onClick={clearAll}
                    className="rounded-full px-6 text-sm"
                  >
                    {t('listing.clearAll', { ns: 'products', defaultValue: 'Clear all' })}
                  </Button>
                )}

                {/* Quick Category Links */}
                {quickCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/${currentLang}/products?category=${cat.id}`}
                    className="inline-flex h-9 items-center rounded-full border border-border bg-background px-4 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 4 ── Product Grid ── */}
          {!isLoading && !isError && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-5">
                {products.map((product, idx) => {
                  const isFocusTarget = focusTargetIndex !== null && idx === focusTargetIndex
                  return (
                    <div
                      key={product.id}
                      ref={isFocusTarget ? nextItemFocusRef : undefined}
                      tabIndex={isFocusTarget ? -1 : undefined}
                      className="outline-none"
                    >
                      <ProductCard product={product} priority={idx < 6} />
                    </div>
                  )
                })}
              </div>

              {/* 5 ── Pagination & "Show more" ── */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 pt-6 border-t border-border/40">
                <p className="text-xs text-muted-foreground tabular-nums">
                  {t('listing.showing', {
                    ns: 'products',
                    count: products.length,
                    total,
                    defaultValue: `Showing ${products.length} of ${total}`,
                  })}
                </p>

                {hasMore && (
                  <Button
                    variant="outline"
                    size="lg"
                    disabled={isFetching}
                    onClick={handleShowMore}
                    className="rounded-full px-8 h-11 text-sm font-medium border-border/80 hover:bg-secondary"
                  >
                    {isFetching
                      ? t('loading', { ns: 'common', defaultValue: 'Loading...' })
                      : t('listing.showMore', { ns: 'products', defaultValue: 'Show more' })}
                  </Button>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── Mobile / Tablet Filter Sheet (Category facet removed) ── */}
      <FilterSheet
        open={isMobileFilterOpen}
        onOpenChange={setIsMobileFilterOpen}
        state={state}
        counts={counts}
        totalResults={total}
        activeFiltersCount={activeFiltersCount}
        onTogglePlatform={togglePlatform}
        onToggleRegion={toggleRegion}
        onSetPriceRange={setPriceRange}
        onSetInStock={setInStock}
        onSetOnSale={setOnSale}
        onClearAll={clearAll}
      />
    </div>
  )
}
