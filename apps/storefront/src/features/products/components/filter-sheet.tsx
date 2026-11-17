import * as React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@workspace/ui/components/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@workspace/ui/components/accordion'
import { Switch } from '@workspace/ui/components/switch'
import { Input } from '@workspace/ui/components/input'
import { Button } from '@workspace/ui/components/button'
import { X } from 'lucide-react'
import type {
  ProductFilterCounts,
  ProductPlatform,
  ProductRegion,
} from '@workspace/domain/schemas/product'
import type { ProductFiltersState } from '../hooks/use-product-filters'
import { FilterGroup } from './filter-group'

export interface FilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  state: ProductFiltersState
  counts?: ProductFilterCounts
  totalResults: number
  activeFiltersCount: number
  onTogglePlatform: (plat: ProductPlatform) => void
  onToggleRegion: (reg: ProductRegion) => void
  onSetPriceRange: (min?: number, max?: number) => void
  onSetInStock: (val: boolean) => void
  onSetOnSale: (val: boolean) => void
  onClearAll: () => void
}

export function FilterSheet({
  open,
  onOpenChange,
  state,
  counts,
  totalResults,
  activeFiltersCount,
  onTogglePlatform,
  onToggleRegion,
  onSetPriceRange,
  onSetInStock,
  onSetOnSale,
  onClearAll,
}: FilterSheetProps) {
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

  const getPlatformLabel = (val: string) => {
    const key = `platform${val.charAt(0).toUpperCase() + val.slice(1)}`
    return t(key as never, { defaultValue: val })
  }

  const getRegionLabel = (val: string) => {
    const key = `region${val.charAt(0).toUpperCase() + val.slice(1)}`
    return t(key as never, { defaultValue: val })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="h-[85vh] max-h-[85vh] rounded-t-3xl flex flex-col p-0 gap-0 overflow-hidden bg-background border-border"
      >
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between border-b border-border/40 px-5 py-4">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base font-semibold">
              {t('listing.filters', { defaultValue: 'Filters' })}
            </SheetTitle>
            {activeFiltersCount > 0 && (
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                ({activeFiltersCount})
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearAll}
                className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {t('listing.clearAll', { defaultValue: 'Clear all' })}
              </Button>
            )}
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-full cursor-pointer text-muted-foreground hover:text-foreground"
                />
              }
            >
              <X className="size-4" />
              <span className="sr-only">
                {t('common.close', { defaultValue: 'Close' })}
              </span>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          <Accordion
            defaultValue={['platform', 'region', 'price']}
            className="w-full"
          >
            {/* Platform */}
            {counts?.platforms && counts.platforms.length > 0 && (
              <AccordionItem value="platform">
                <AccordionTrigger className="text-sm font-medium py-3.5 hover:no-underline">
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

            {/* Region */}
            {counts?.regions && counts.regions.length > 0 && (
              <AccordionItem value="region">
                <AccordionTrigger className="text-sm font-medium py-3.5 hover:no-underline">
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

            {/* Price Range */}
            <AccordionItem value="price">
              <AccordionTrigger className="text-sm font-medium py-3.5 hover:no-underline">
                {t('listing.priceRange', { defaultValue: 'Price range' })}
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex items-center gap-3 pt-1 pb-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder={t('listing.priceMin', { defaultValue: 'Min' })}
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      onBlur={handlePriceBlur}
                      className="h-10 text-sm"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">–</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder={t('listing.priceMax', { defaultValue: 'Max' })}
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      onBlur={handlePriceBlur}
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Toggles */}
          <div className="flex flex-col gap-3 pt-2 border-t border-border/40">
            <label
              htmlFor="sheet-toggle-instock"
              className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60 select-none"
            >
              <span className="text-sm font-medium text-foreground">
                {t('listing.inStockOnly', { defaultValue: 'In stock only' })}
              </span>
              <Switch
                id="sheet-toggle-instock"
                checked={state.inStock}
                onCheckedChange={onSetInStock}
              />
            </label>

            <label
              htmlFor="sheet-toggle-onsale"
              className="flex min-h-[44px] cursor-pointer items-center justify-between gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary/60 select-none"
            >
              <span className="text-sm font-medium text-foreground">
                {t('listing.onSale', { defaultValue: 'On sale' })}
              </span>
              <Switch
                id="sheet-toggle-onsale"
                checked={state.onSale}
                onCheckedChange={onSetOnSale}
              />
            </label>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="border-t border-border/40 p-4 bg-background/95 backdrop-blur-xs">
          <Button
            className="w-full h-11 rounded-full text-sm font-medium"
            onClick={() => onOpenChange(false)}
          >
            {t('listing.showResults', {
              count: totalResults,
              defaultValue: `Show ${totalResults} results`,
            })}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
