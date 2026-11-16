import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import { Switch } from '@workspace/ui/components/switch'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import type {
  ProductFilterCounts,
  ProductPlatform,
  ProductRegion,
} from '@workspace/domain/schemas/product'
import type { ProductFiltersState } from '../hooks/use-product-filters'
import { FilterGroup } from './filter-group'

export interface FilterSidebarProps {
  state: ProductFiltersState
  counts?: ProductFilterCounts
  activeFiltersCount: number
  onTogglePlatform: (plat: ProductPlatform) => void
  onToggleRegion: (reg: ProductRegion) => void
  onSetPriceRange: (min?: number, max?: number) => void
  onSetInStock: (val: boolean) => void
  onSetOnSale: (val: boolean) => void
  onClearAll: () => void
  className?: string
}

export function FilterSidebar({
  state,
  counts,
  activeFiltersCount,
  onTogglePlatform,
  onToggleRegion,
  onSetPriceRange,
  onSetInStock,
  onSetOnSale,
  onClearAll,
  className,
}: FilterSidebarProps) {
  const { t } = useTranslation(['products', 'common'])

  const [minPriceInput, setMinPriceInput] = React.useState(state.priceMin !== undefined ? String(state.priceMin) : '')
  const [prevMin, setPrevMin] = React.useState(state.priceMin)
  const [maxPriceInput, setMaxPriceInput] = React.useState(state.priceMax !== undefined ? String(state.priceMax) : '')
  const [prevMax, setPrevMax] = React.useState(state.priceMax)

  if (prevMin !== state.priceMin) {
    setPrevMin(state.priceMin)
    setMinPriceInput(state.priceMin !== undefined ? String(state.priceMin) : '')
  }

  if (prevMax !== state.priceMax) {
    setPrevMax(state.priceMax)
    setMaxPriceInput(state.priceMax !== undefined ? String(state.priceMax) : '')
  }

  const handlePriceBlur = () => {
    const min = minPriceInput ? parseFloat(minPriceInput) : undefined
    const max = maxPriceInput ? parseFloat(maxPriceInput) : undefined
    if (min !== state.priceMin || max !== state.priceMax) {
      onSetPriceRange(min, max)
    }
  }

  const handlePriceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePriceBlur()
    }
  }

  const getPlatformLabel = (val: string) => {
    const key = `platform${val.charAt(0).toUpperCase() + val.slice(1)}`
    return t(key as never, { defaultValue: val })
  }

  const getRegionLabel = (val: string) => {
    const key = `region${val.charAt(0).toUpperCase() + val.slice(1)}`
    return t(key as never, { defaultValue: val })
  }

  return (
    <aside
      aria-label={t('listing.filters', { defaultValue: 'Filters' })}
      className={cn('w-64 shrink-0 flex flex-col gap-6', className)}
    >
      {/* Header with title & clear */}
      <div className="flex items-center justify-between pb-1 border-b border-border/40">
        <h2 className="text-sm font-semibold tracking-wide text-foreground">
          {t('listing.filters', { defaultValue: 'Filters' })}
          {activeFiltersCount > 0 && (
            <span className="ms-1.5 text-xs font-normal text-muted-foreground">
              ({activeFiltersCount})
            </span>
          )}
        </h2>
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {t('listing.clearAll', { defaultValue: 'Clear all' })}
          </Button>
        )}
      </div>

      {/* Filter Groups Accordion */}
      <Accordion
        defaultValue={['platform', 'region', 'price']}
        className="w-full"
      >
        {/* Platform Group */}
        {counts?.platforms && counts.platforms.length > 0 && (
          <AccordionItem value="platform">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              {t('platform', { defaultValue: 'Platform' })}
            </AccordionTrigger>
            <AccordionContent>
              <FilterGroup
                title={t('platform', { defaultValue: 'Platform' })}
                options={counts.platforms}
                selectedValues={state.platforms}
                onToggle={(val) => onTogglePlatform(val as ProductPlatform)}
                getLabel={getPlatformLabel}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Region Group */}
        {counts?.regions && counts.regions.length > 0 && (
          <AccordionItem value="region">
            <AccordionTrigger className="text-sm font-medium hover:no-underline">
              {t('listing.region', { defaultValue: 'Region' })}
            </AccordionTrigger>
            <AccordionContent>
              <FilterGroup
                title={t('listing.region', { defaultValue: 'Region' })}
                options={counts.regions}
                selectedValues={state.regions}
                onToggle={(val) => onToggleRegion(val as ProductRegion)}
                getLabel={getRegionLabel}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Price Range Group */}
        <AccordionItem value="price">
          <AccordionTrigger className="text-sm font-medium hover:no-underline">
            {t('listing.priceRange', { defaultValue: 'Price range' })}
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex items-center gap-2 pt-1 pb-2">
              <div className="flex-1">
                <label htmlFor="price-min" className="sr-only">
                  {t('listing.priceMin', { defaultValue: 'Min' })}
                </label>
                <Input
                  id="price-min"
                  type="number"
                  placeholder={t('listing.priceMin', { defaultValue: 'Min' })}
                  value={minPriceInput}
                  onChange={(e) => setMinPriceInput(e.target.value)}
                  onBlur={handlePriceBlur}
                  onKeyDown={handlePriceKeyDown}
                  className="h-9 text-xs"
                />
              </div>
              <span className="text-xs text-muted-foreground">–</span>
              <div className="flex-1">
                <label htmlFor="price-max" className="sr-only">
                  {t('listing.priceMax', { defaultValue: 'Max' })}
                </label>
                <Input
                  id="price-max"
                  type="number"
                  placeholder={t('listing.priceMax', { defaultValue: 'Max' })}
                  value={maxPriceInput}
                  onChange={(e) => setMaxPriceInput(e.target.value)}
                  onBlur={handlePriceBlur}
                  onKeyDown={handlePriceKeyDown}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Toggles: In stock only & On sale */}
      <div className="flex flex-col gap-3 pt-2 border-t border-border/40">
        <label
          htmlFor="toggle-instock"
          className="flex min-h-[36px] cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60 select-none"
        >
          <span className="text-sm font-medium text-foreground">
            {t('listing.inStockOnly', { defaultValue: 'In stock only' })}
          </span>
          <Switch
            id="toggle-instock"
            checked={state.inStock}
            onCheckedChange={onSetInStock}
          />
        </label>

        <label
          htmlFor="toggle-onsale"
          className="flex min-h-[36px] cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60 select-none"
        >
          <span className="text-sm font-medium text-foreground">
            {t('listing.onSale', { defaultValue: 'On sale' })}
          </span>
          <Switch
            id="toggle-onsale"
            checked={state.onSale}
            onCheckedChange={onSetOnSale}
          />
        </label>
      </div>
    </aside>
  )
}
