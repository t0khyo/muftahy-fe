import { useTranslation } from 'react-i18next'
import { SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
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
  onClearAll,
  onOpenMobileFilters,
  className,
}: ListingToolbarProps) {
  const { t } = useTranslation(['products', 'common'])

  const sortLabel = t('listing.sort', { defaultValue: 'Sort' })

  const sortItems = [
    { value: 'featured', label: t('listing.sortFeatured', { defaultValue: 'Featured' }) },
    { value: 'price-asc', label: t('listing.sortPriceLow', { defaultValue: 'Price: low to high' }) },
    { value: 'price-desc', label: t('listing.sortPriceHigh', { defaultValue: 'Price: high to low' }) },
    { value: 'newest', label: t('listing.sortNewest', { defaultValue: 'Newest' }) },
  ]

  const chips: ActiveFilterChip[] = []
  if (state.variant) {
    chips.push({
      id: `variant-${state.variant}`,
      type: 'variant',
      labelFallback: t(`variants.${state.variant}`, { defaultValue: state.variant }),
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
              <Badge className="flex size-4 items-center justify-center rounded-full p-0 text-[10px] font-bold">
                {activeFiltersCount}
              </Badge>
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
            items={sortItems}
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
              <SelectGroup>
                {sortItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
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
            <Badge
              key={chip.id}
              variant="secondary"
              className="gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <span>{chip.labelFallback}</span>
              <button
                type="button"
                onClick={() => {
                  if (chip.type === 'variant') onRemoveVariant?.()
                }}
                className="cursor-pointer text-muted-foreground hover:text-foreground rounded-full p-0.5"
                aria-label={t('remove', { ns: 'common', defaultValue: 'Remove' })}
              >
                <XIcon className="size-3" aria-hidden="true" />
              </button>
            </Badge>
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
