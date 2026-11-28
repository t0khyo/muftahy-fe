import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { SearchIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Input } from '@workspace/ui/components/input'
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
  onSearchChange?: (search?: string) => void
  onRemoveVariant?: () => void
  onRemoveSearch?: () => void
  onClearAll: () => void
  onOpenMobileFilters: () => void
  className?: string
}

export function ListingToolbar({
  totalResults,
  state,
  activeFiltersCount,
  onSortChange,
  onSearchChange,
  onRemoveVariant,
  onRemoveSearch,
  onClearAll,
  onOpenMobileFilters,
  className,
}: ListingToolbarProps) {
  const { t } = useTranslation(['products', 'common'])
  const [searchDraft, setSearchDraft] = React.useState(state.search ?? '')
  const [prevSearch, setPrevSearch] = React.useState(state.search)
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  if (state.search !== prevSearch) {
    setPrevSearch(state.search)
    setSearchDraft(state.search ?? '')
  }

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = e.target.value
    setSearchDraft(nextValue)
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      onSearchChange?.(nextValue.trim() || undefined)
    }, 200)
  }

  const handleClearSearch = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    setSearchDraft('')
    onSearchChange?.(undefined)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && searchDraft) {
      e.preventDefault()
      handleClearSearch()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      onSearchChange?.(searchDraft.trim() || undefined)
    }
  }

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
  if (state.search) {
    chips.push({
      id: `search-${state.search}`,
      type: 'search',
      value: state.search,
      labelFallback: `"${state.search}"`,
    })
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="flex min-h-[48px] items-center justify-between gap-3 flex-wrap">
        <div className="flex w-full sm:w-auto items-center gap-3 flex-1 min-w-0">
          {/* Search Input */}
          <div className="relative w-full sm:w-64 lg:w-72">
            <SearchIcon
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchDraft}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('listing.searchPlaceholder', {
                defaultValue: 'Search by product name or SKU...',
              })}
              aria-label={t('listing.searchAriaLabel', {
                defaultValue: 'Search products',
              })}
              className="h-10 w-full rounded-full border-border/80 bg-background ps-9 pe-9 text-xs sm:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {searchDraft && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                aria-label={t('listing.clearSearch', { defaultValue: 'Clear search' })}
                className="absolute end-1.5 top-1/2 size-7 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-3.5" aria-hidden="true" />
              </Button>
            )}
          </div>

          <span className="hidden lg:inline-block text-sm font-medium text-foreground tabular-nums whitespace-nowrap">
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
                  if (chip.type === 'search') {
                    handleClearSearch()
                    onRemoveSearch?.()
                  }
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
