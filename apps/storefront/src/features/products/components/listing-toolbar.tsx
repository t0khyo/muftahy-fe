import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { cn } from '@workspace/ui/lib/utils'
import type { ProductSortOption } from '@workspace/domain/schemas/product'
import type { ActiveFilterChip, ProductFiltersState } from '../hooks/use-product-filters'

export interface ListingToolbarProps {
  totalResults: number
  state: ProductFiltersState
  activeFiltersCount: number
  onSortChange: (sort: ProductSortOption) => void
  onRemoveFilter: (type: ActiveFilterChip['type'], value?: string) => void
  onClearAll: () => void
  onOpenMobileFilters: () => void
  className?: string
}

export function ListingToolbar({
  totalResults,
  state,
  activeFiltersCount,
  onSortChange,
  onRemoveFilter,
  onClearAll,
  onOpenMobileFilters,
  className,
}: ListingToolbarProps) {
  const { t } = useTranslation(['products', 'common'])

  // Build list of active filter chips (excluding category which is controlled by CategoryRow above)
  const activeChips = React.useMemo<ActiveFilterChip[]>(() => {
    const chips: ActiveFilterChip[] = []

    for (const plat of state.platforms) {
      const key = `platform${plat.charAt(0).toUpperCase() + plat.slice(1)}`
      chips.push({
        id: `plat-${plat}`,
        type: 'platform',
        value: plat,
        labelFallback: t(key as never, { defaultValue: plat }),
      })
    }

    for (const reg of state.regions) {
      const key = `region${reg.charAt(0).toUpperCase() + reg.slice(1)}`
      chips.push({
        id: `reg-${reg}`,
        type: 'region',
        value: reg,
        labelFallback: t(key as never, { defaultValue: reg }),
      })
    }

    if (state.priceMin !== undefined || state.priceMax !== undefined) {
      const minText = state.priceMin !== undefined ? `${state.priceMin}` : '0'
      const maxText = state.priceMax !== undefined ? `${state.priceMax}` : '∞'
      chips.push({
        id: 'price-range',
        type: 'price',
        labelFallback: `${minText} – ${maxText}`,
      })
    }

    if (state.inStock) {
      chips.push({
        id: 'filter-instock',
        type: 'inStock',
        labelFallback: t('listing.inStockOnly', { defaultValue: 'In stock only' }),
      })
    }

    if (state.onSale) {
      chips.push({
        id: 'filter-onsale',
        type: 'onSale',
        labelFallback: t('listing.onSale', { defaultValue: 'On sale' }),
      })
    }

    return chips
  }, [state, t])

  const sortLabel = t('listing.sort', { defaultValue: 'Sort' })

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* ── Main Toolbar Bar (48px min height) ── */}
      <div className="flex min-h-[48px] items-center justify-between gap-3 flex-wrap">
        {/* Leading: Result count text (Desktop / Tablet) */}
        <div className="hidden lg:flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground tabular-nums">
            {totalResults === 1
              ? t('listing.resultCountOne', { count: totalResults, defaultValue: '1 product' })
              : t('listing.resultCount', { count: totalResults, defaultValue: `${totalResults} products` })}
          </span>
        </div>

        {/* Mobile Toolbar Bar: Filters button + Sort */}
        <div className="flex lg:hidden w-full items-center justify-between gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenMobileFilters}
            className="flex-1 h-10 gap-2 rounded-xl text-xs font-medium border-border/80"
          >
            <SlidersHorizontalIcon className="size-3.5 shrink-0" />
            <span>
              {activeFiltersCount > 0
                ? t('listing.filtersCount', { count: activeFiltersCount, defaultValue: `Filters (${activeFiltersCount})` })
                : t('listing.filters', { defaultValue: 'Filters' })}
            </span>
          </Button>

          {/* Sort dropdown mobile */}
          <div className="flex-1">
            <Select
              value={state.sort}
              onValueChange={(val) => onSortChange(val as ProductSortOption)}
            >
              <SelectTrigger
                className="w-full h-10 rounded-xl text-xs font-medium border-border/80"
                aria-label={sortLabel}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="featured">
                  {t('listing.sortFeatured', { defaultValue: 'Featured' })}
                </SelectItem>
                <SelectItem value="best-selling">
                  {t('listing.sortBestSelling', { defaultValue: 'Best selling' })}
                </SelectItem>
                <SelectItem value="price-asc">
                  {t('listing.sortPriceLow', { defaultValue: 'Price: low to high' })}
                </SelectItem>
                <SelectItem value="price-desc">
                  {t('listing.sortPriceHigh', { defaultValue: 'Price: high to low' })}
                </SelectItem>
                <SelectItem value="newest">
                  {t('listing.sortNewest', { defaultValue: 'Newest' })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Trailing: Desktop Sort Dropdown */}
        <div className="hidden lg:flex items-center gap-2 ms-auto">
          <span className="text-xs text-muted-foreground">{sortLabel}:</span>
          <Select
            value={state.sort}
            onValueChange={(val) => onSortChange(val as ProductSortOption)}
          >
            <SelectTrigger
              className="h-9 min-w-[150px] rounded-lg text-xs font-medium border-border/80"
              aria-label={sortLabel}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="featured">
                {t('listing.sortFeatured', { defaultValue: 'Featured' })}
              </SelectItem>
              <SelectItem value="best-selling">
                {t('listing.sortBestSelling', { defaultValue: 'Best selling' })}
              </SelectItem>
              <SelectItem value="price-asc">
                {t('listing.sortPriceLow', { defaultValue: 'Price: low to high' })}
              </SelectItem>
              <SelectItem value="price-desc">
                {t('listing.sortPriceHigh', { defaultValue: 'Price: high to low' })}
              </SelectItem>
              <SelectItem value="newest">
                {t('listing.sortNewest', { defaultValue: 'Newest' })}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Active Filter Chips Row (32px chips, 13px text) ── */}
      {activeChips.length > 0 && (
        <div
          role="region"
          aria-label={t('listing.filters', { defaultValue: 'Active filters' })}
          className="flex items-center gap-2 flex-wrap pt-0.5"
        >
          {activeChips.map((chip) => (
            <button
              key={chip.id}
              type="button"
              onClick={() => onRemoveFilter(chip.type, chip.value)}
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full px-3',
                'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                'text-[13px] font-normal transition-colors outline-none',
                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              )}
            >
              <span>{chip.labelFallback}</span>
              <XIcon className="size-3.5 text-muted-foreground hover:text-foreground shrink-0" />
            </button>
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            {t('listing.clearAll', { defaultValue: 'Clear all' })}
          </Button>
        </div>
      )}
    </div>
  )
}

