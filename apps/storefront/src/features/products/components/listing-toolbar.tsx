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
import type {
  ActiveFilterChip,
  ProductFiltersState,
  SortOption,
} from '../hooks/use-product-filters'

export interface ListingToolbarProps {
  totalResults: number
  state: ProductFiltersState
  activeFiltersCount: number
  onSortChange: (sort: SortOption) => void
  onRemoveVariant?: () => void
  onRemoveStockStatus?: () => void
  onRemoveInStockOnly?: () => void
  onClearAll: () => void
  onOpenMobileFilters: () => void
  className?: string
}

export function ListingToolbar({
  totalResults,
  state,
  activeFiltersCount,
  onSortChange,
  onRemoveVariant,
  onRemoveStockStatus,
  onRemoveInStockOnly,
  onClearAll,
  onOpenMobileFilters,
  className,
}: ListingToolbarProps) {
  const { t } = useTranslation(['products', 'common'])

  const sortLabel = t('listing.sort', { defaultValue: 'Sort' })

  const chips: ActiveFilterChip[] = []
  if (state.variant) {
    chips.push({
      id: `variant-${state.variant}`,
      type: 'variant',
      labelFallback: t(`variants.${state.variant}`, { defaultValue: state.variant }),
    })
  }
  if (state.stockStatus === 'preorder') {
    chips.push({
      id: 'stock-preorder',
      type: 'stock',
      labelFallback: t('stock.preorder', { defaultValue: 'Preorder' }),
    })
  }
  if (state.inStockOnly) {
    chips.push({
      id: 'stock-instock',
      type: 'stock',
      labelFallback: t('listing.inStockOnly', { defaultValue: 'In stock only' }),
    })
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex min-h-[48px] items-center justify-between gap-3 flex-wrap">
        <div className="hidden lg:flex items-baseline gap-2">
          <span className="text-sm font-medium text-foreground tabular-nums">
            {t('listing.showing', {
              count: totalResults,
              total: totalResults,
              defaultValue: `Showing ${totalResults} products`,
            })}
          </span>
        </div>

        {/* Mobile Filter Trigger Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenMobileFilters}
            className="h-10 px-3.5 gap-2 rounded-full font-medium text-xs border-border/80 text-foreground cursor-pointer"
            aria-label={t('listing.filters', { defaultValue: 'Filters' })}
          >
            <SlidersHorizontalIcon className="size-3.5" aria-hidden="true" />
            <span>{t('listing.filters', { defaultValue: 'Filters' })}</span>
            {activeFiltersCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          <span className="text-xs text-muted-foreground tabular-nums">
            ({totalResults})
          </span>
        </div>

        {/* Sort Select Dropdown */}
        <div className="flex items-center gap-2 ms-auto">
          <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
            {sortLabel}:
          </span>
          <Select
            value={state.sort}
            onValueChange={(val) => onSortChange(val as SortOption)}
          >
            <SelectTrigger
              aria-label={sortLabel}
              className="h-10 w-[160px] sm:w-[180px] rounded-full text-xs font-medium border-border/80 bg-background"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="featured">
                {t('listing.sortFeatured', { defaultValue: 'Featured' })}
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

      {/* ── Active Filter Chips Row ── */}
      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-muted-foreground me-1 hidden sm:inline">
            {t('listing.filters', { defaultValue: 'Filters' })}:
          </span>

          {chips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <span>{chip.labelFallback}</span>
              <button
                type="button"
                onClick={() => {
                  if (chip.type === 'variant') onRemoveVariant?.()
                  else if (chip.id === 'stock-instock') onRemoveInStockOnly?.()
                  else if (chip.id === 'stock-preorder') onRemoveStockStatus?.()
                }}
                className="cursor-pointer text-muted-foreground hover:text-foreground rounded-full p-0.5"
                aria-label={t('remove', { ns: 'common', defaultValue: 'Remove' })}
              >
                <XIcon className="size-3" aria-hidden="true" />
              </button>
            </span>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground underline underline-offset-4 cursor-pointer"
          >
            {t('listing.clearAll', { defaultValue: 'Clear all' })}
          </Button>
        </div>
      )}
    </div>
  )
}
